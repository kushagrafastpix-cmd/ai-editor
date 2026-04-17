# Remove Pause – Step-by-Step Flow (Detailed)

This document explains **exactly** what happens when the user uses either **“Remove pause”** (single word) or **“Remove all pauses”** in the editor. All line numbers refer to `opustimeline.js`.

---

# Part 1: Single-word “Remove pause” button

**UI:** A menu item labeled `button_remove_pause` (e.g. “Remove pause”) in the word context menu.  
**Handler:** `tU` (wrapped in `G.T`).  
**Rendered by:** Component `eH` (word popover); the button is `t5` with `onClick: tU`.

---

## Step 1: User clicks “Remove pause”

- The click triggers `tU` (lines 46916–46933).
- `tU` is a thunk/wrapped action created with `G.T` so it receives `(getState, dispatch)` (or similar) when run.

---

## Step 2: Guard check – `tt()`

- **Code:** `if (tt()) return;` (46917–46918).
- **`tt`** comes from the same context as `getCleanOperationNoti` (line 46760): `timelineLockDetectAndNoti` or a “can do clean operation” check.
- If `tt()` is truthy, the handler exits and nothing else runs (no removal, no analytics).

---

## Step 3: Decide which word(s) to remove

- **Code:** `let n = e(ec.R.multiSelectedWordIds).length > 1 ? eC() : [t];` (46919).
- **`e`** = `getState`.
- **`ec.R.multiSelectedWordIds`** = selector for currently selected word ids (e.g. `[{ textId, … }, …]`).
- **`eC`** = `getMultiSelectedWords` from context (46719) – returns the full word objects for the current selection.
- **`t`** = the current word (the one whose menu is open), from props `{ word: t }` (46712).
- So:
  - If **more than one word** is selected → `n` = array of those word objects (`eC()`).
  - If **only one** (or none) → `n` = `[t]` (current word only).

---

## Step 4: Filter word ids and call the removal function

- **Code:** `eb([n.map(e => e.id).filter(l.s)]);` (46920).
- **`eb`** = `dropContinuousWords` from context (46719: `dropContinuousWords: eb`).
- **`n.map(e => e.id)`** = array of word ids to remove.
- **`.filter(l.s)`** = only keep ids for which `l.s` returns truthy.  
  **`l`** is a value in scope of the word popover (from the same context that has `matchPauseDurationWordsMap` and menu type). **`l.s`** is a predicate (function or callable) that determines “is this word id allowed to be removed in this context?” (e.g. only pause words when in Remove Pauses mode). So the **effective batch** is one array: `[id1, id2, …]` (only ids passing the filter).
- **`eb([…])`** is then called with **one batch** = that single array of ids. So you’re calling `dropContinuousWords([batch])` where `batch` is the filtered list of word ids.

Behind the scenes, `eb` is the **dropContinuousWords** logic provided by the same provider that defines the thunk **Y** (lines 49620–49667). So `eb([batch])` ultimately invokes that thunk with `(getState, dispatch, [batch])` (or equivalent), which runs the core removal logic described in Part 3 below.

---

## Step 5: Analytics event

- **Code:** (46921–46930)
  - `eA.Z.getInstance().push("editor.caption.operation", { firstOperation: "Remove caption & video", word: t, wordText: n.map(e => (0, ep.Us)(e)).join(" ") }, { platform: { MP: !0, SS: !0 } });`
- **Event name:** `"editor.caption.operation"`.
- **Payload:**
  - `firstOperation`: `"Remove caption & video"`.
  - `word`: current word object `t`.
  - `wordText`: text of the selected word(s), from `ep.Us` (e.g. “get display text”) joined.
- **Options:** `{ platform: { MP: true, SS: true } }`.

So the **event fired when the user clicks “Remove pause”** (single word) is **`editor.caption.operation`** with **`firstOperation: "Remove caption & video"`**.

---

## Step 6: Snapshot (undo)

- **Code:** `eO();` (46932).
- **`eO`** = `takeSnapshot` from context (46729).
- This saves the current state so the user can undo the removal.

---

## Summary (single-word “Remove pause”)

1. Guard `tt()`; if truthy, return.
2. Build list of words to remove: multi-selection or current word.
3. Build one batch of word ids, filter with `l.s`, call `dropContinuousWords([batch])` (exposed as `eb`).
4. Fire **`editor.caption.operation`** with **`firstOperation: "Remove caption & video"`**.
5. Call **`takeSnapshot()`**.

The actual removal of caption + keyframe + voice segments is done inside **dropContinuousWords** (thunk **Y**), which is what `eb` triggers.

---

# Part 2: “Remove all pauses” button

**UI:** A menu item labeled `button_remove_all_pauses` (e.g. “Remove all pauses”).  
**Handler:** Wrapped in a feature component `X.Z` (e.g. FillerWordSilenceRemoval); the inner click handler calls **`tM`**.  
**Rendered by:** Same word popover; the button is built by `t4` (lines 47617–47641), `onClick` calls `tM` when the feature gate is not used.

---

## Step 1: User clicks “Remove all pauses”

- The click runs the handler inside `t4` (47624–47630):
  - If feature gate **`e`** is truthy (e.g. user has access), it calls **`t()`** (e.g. upsell/tracking) and **returns** – no removal.
  - Otherwise it calls **`tM()`** (47629).

---

## Step 2: “Attempt” analytics event

- **Code:** (46943–46950)  
  `eA.Z.getInstance().push("editor.pause.remove.attempt", { via: "captionOperation" }, { platform: { MP: !0, SS: !0 } });`
- **Event name:** `"editor.pause.remove.attempt"`.
- **Payload:** `{ via: "captionOperation" }`.
- This is fired **before** any removal logic, so every click on “Remove all pauses” (when not gated) produces this event.

---

## Step 3: Guard and run cleanPauses

- **Code:** `tn() && ti();` (46950).
- **`tn`** = `getCleanOperationNoti` from context (46760) – likely “is this operation allowed right now?”.
- **`ti`** = **`cleanPauses`** from context (46762: `cleanPauses: ti`).
- If **`tn()`** is falsy, the expression short-circuits and **`ti()`** is not called (no removal).
- If **`tn()`** is truthy, **`ti()`** is called. **`ti`** is the **cleanPauses** thunk (exposed as **`ev`** in the hook, lines 50049–50066). So **`ti()`** returns a thunk; that thunk is then **dispatched** by the same flow that invoked `tM` (the provider wraps actions so that the returned thunk is dispatched). So effectively: **dispatch(cleanPauses)**.

---

## Step 4: Inside cleanPauses thunk – get state and silence words

- The **cleanPauses** thunk (lines 50049–50066) runs with **(getState, dispatch)** (and optionally a third argument for pause duration).
- **First parameter `t`** = getState.
- **Second parameter `i`** = dispatch.

- **Code:** `let o = t(M.R.silenceWords).filter(e => !r || e.timeline.out - e.timeline.in >= 1e3 * r).map(e => e.id);` (50051).
- **`t(M.R.silenceWords)`** = get the **silenceWords** array from state.  
  **silenceWords** is produced by the selector **eg** (70275–70291):
  - Input: **caption track** from state (`g.XU.captionTrack`).
  - It iterates every **section → segment → content.textElements**.
  - For each text element, if **`(0, c.NZ)(e.text)`** is true (module `c`, function **NZ** – “is this text a pause/silence?”), the element is pushed into the array.
  - So **silenceWords** = all caption text elements that represent silence/pause.
- **`.filter(e => !r || e.timeline.out - e.timeline.in >= 1e3 * r)`**  
  **`r`** = third argument of the thunk = **pause duration threshold in seconds** (e.g. from UI “remove pauses longer than X seconds”). If **`r`** is falsy, all silence words are kept; if **`r`** is a number, only words with **duration (ms) ≥ 1000 * r** are kept.
- **`.map(e => e.id)`** → **`o`** = array of **word ids** to remove (one per qualifying silence word).

---

## Step 5: If no words → warning and exit

- **Code:** `o.length ? ( ... ) : f.Am.warning(e("no_silences_or_pauses_found"))` (50051 & 50066).
- If **`o.length === 0`**, the thunk shows the “no silences or pauses found” message and **does not** call the removal logic or fire the success event.

---

## Step 6: Call dropContinuousWords (remove each pause)

- **Code:** `Y(o.reverse().map(e => [e]));` (50052).
- **`Y`** = the **dropContinuousWords** thunk (same as in Part 1, lines 49620–49667).
- **`o.reverse()`** = reverse the list of ids (so removal order is from end to start of the timeline, to avoid index shifts).
- **`.map(e => [e])`** = turn each id into a **single-element batch**: `[[id1], [id2], …]`.
- So **Y** is invoked with **batches = [[id1], [id2], …]**.
- The provider passes **(getState, dispatch, batches)** into **Y**, so **Y** runs the same removal logic as in Part 1, once per batch (i.e. once per pause word). The core logic is described in Part 3.

---

## Step 7: “Success” analytics event

- **Code:** (50053–50057)  
  `P.Z.getInstance().push("editor.pause.remove", {}, { platform: { MP: !0, SS: !0 } });`
- **Event name:** `"editor.pause.remove"`.
- **Payload:** `{}`.
- So after all pauses are removed, this event is fired once.

---

## Step 8: UI and NPS

- **Code:** (50058–50065)
  - `W && i(B.w.clipAssetsSideBarSelectedTab, void 0);` – e.g. close or reset the clip assets sidebar tab if **W** (e.g. `enableResetAfterCleanPauses`) is set.
  - `f.Am.success(e("silence_frames_removed", { count: o.length }));` – success toast with number of removed pauses.
  - `z(l.d_.RemovePauses, { isFeatureNps: !0 });` – NPS/survey for the “Remove Pauses” feature.
  - `n.takeSnapshot();` – save state for undo.

---

## Summary (“Remove all pauses”)

1. If feature gate, call `t()` and return; else call **`tM()`**.
2. Fire **`editor.pause.remove.attempt`** with **`via: "captionOperation"`**.
3. If **`tn()`** is falsy, stop; else **dispatch(cleanPauses)**.
4. In **cleanPauses**: get **silenceWords** from state (selector **eg** using **NZ**), filter by duration threshold **r**, map to ids **`o`**.
5. If **`o.length === 0`**, show “no silences or pauses found” and exit.
6. Call **Y** (dropContinuousWords) with **batches = o.reverse().map(e => [e])**.
7. Fire **`editor.pause.remove`**, optional sidebar reset, success toast, NPS for Remove Pauses, **takeSnapshot()**.

---

# Part 3: What happens inside dropContinuousWords (thunk Y)

This is the **shared** logic that actually deletes caption, keyframe, and voice segments. It runs for:
- Single-word “Remove pause” (one batch of one or more ids), and
- “Remove all pauses” (many batches of one id each).

**Location:** lines 49620–49667.  
**Signature:** thunk receives **(e, n, i)** = **(getState, dispatch, batches)**. In the provider (49560–49567), **t** = result of **C.G()** (store/API with **deleteSegmentsAndReturn**), **o** = **deleteKeyFrameSegmentByTime** from **O.Z()**.

---

## Per batch (each element of **i**)

- **`e`** = one batch = array of word ids, e.g. `[id1, id2, …]` (consecutive words).
- **`n`** = first id in batch, **`i`** = last id (49629–49631).
- **`r`** = caption track instance, **`a`** = keyframe track instance, **`l`** = voice enhancement track instance (49621–49624). **`s`** = **captionWordIds** (per-section text ids) from state (49625).
- Look up caption text elements: **`p = r.textMap.get(n)`**, **`f = r.textMap.get(i)`** (49633–49635). If either is missing, **continue** to next batch.
- Time range of the span: **`m = [p.timeRange.timelineIn, f.timeRange.timelineOut]`**; midpoint **`h = (m[0] + m[1]) / 2`** (49637–49638).
- Sections containing first and last word: **`g = p.parent.parent.parent`**, **`v = f.parent.parent.parent`** (49639–49640).

---

### Case A: Whole section is being removed

- **Condition:** `g.id === v.id && s[g.index].textIds.length === e.length` (49641).
- So: same section, and the batch covers **all** words in that section.

**Actions:**

1. **`t.deleteSegmentsAndReturn(h, r)`** (49642)  
   **`t`** = store/API from **C.G()**. This deletes the caption segments for that section and returns (or updates) something using the midpoint **h** and caption track **r**.

2. **`o(h)`** (49643)  
   **`o`** = **deleteKeyFrameSegmentByTime** from **O.Z()**. Deletes the keyframe segment at time **h**.

3. **Voice:** `null == l || null === (c = l.findSectionByTime(h)) || void 0 === c || c.delete();` (49644)  
   If there is a voice enhancement track, find the section at time **h** and call **`.delete()`** on it.

---

### Case B: Only part of a section is being removed

- Else branch (49645–49661).

**Actions:**

1. **Index of first/last word in section:**  
   `e = s[g.index].textIds.indexOf(n)`, `t = s[g.index].textIds.indexOf(i)` (49646–49647) (local **e**, **t** here, not the thunk args).
2. **Time bounds:** **`o = m[0]`**, **`c = m[1]`** (49648–49649).
3. **Keyframe section** that spans this time: **`p = a.sections.find(...)`** (49650). If found, optionally extend **o** / **c** to the section’s start/end when the batch is at the start/end of the section (49651).
4. **Midpoint of the segment to remove:** **`f = (o + c) / 2`** (49652).
5. **Caption track:** **`r.split(o)`**, **`r.split(c)`** – split at boundaries; then **`r.findSectionByTime(f)`** and **`.delete()`** on that section (49653–49655).
6. **Keyframe track:** **`a.split(o)`**, **`a.split(c)`**; find section at **f**, **`.delete()`** (49656–49658).
7. **Voice track:** if **`l`** exists, **`l.split(o)`**, **`l.split(c)`**, find section at **f**, **`.delete()`** (49659–49661).

---

## After all batches

- **Code:** (49664–49666)  
  `null == r || r.reCompactTimeline()`, same for **a**, then for **l**.
- Each track instance (**caption**, **keyframe**, **voice**) is told to **reCompactTimeline()** so section indices and timing are updated after the deletions.

---

## Summary (dropContinuousWords)

- For each batch of word ids, it resolves the corresponding caption segment(s) and time range, then either:
  - **Whole section:** **deleteSegmentsAndReturn** + **deleteKeyFrameSegmentByTime** + voice section **.delete()**, or  
  - **Partial section:** **split** caption/keyframe/voice at boundaries, **findSectionByTime(midpoint)** and **.delete()** on that section for each track.
- Then **reCompactTimeline()** on all three tracks.

---

# Quick reference: events and entry points

| Action | Event(s) | Entry point |
|--------|----------|-------------|
| Single-word “Remove pause” | **`editor.caption.operation`** (`firstOperation: "Remove caption & video"`) | **tU** (46916) → **eb** (dropContinuousWords) |
| “Remove all pauses” | **`editor.pause.remove.attempt`** then **`editor.pause.remove`** | **tM** (46941) → **ti** (cleanPauses) → **Y** (dropContinuousWords) |

All actual segment removal is done inside the **dropContinuousWords** thunk **Y** (49620–49667), using **deleteSegmentsAndReturn**, **deleteKeyFrameSegmentByTime**, and track **.split()** / **.findSectionByTime()** / **.delete()** / **.reCompactTimeline()**.
