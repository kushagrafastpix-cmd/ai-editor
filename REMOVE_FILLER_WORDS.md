# Remove Filler Words – How It Works

## In one sentence

**Remove Filler Words** finds all caption words that are filler (e.g. "um", "uh", "hmm"), then removes those words from the caption track, the video (keyframe) track, and the voice enhancement track so the video plays without them.

---

## How to use it

| Action | What it does |
|--------|----------------|
| **Remove filler words** | Finds **all** filler words in the caption and removes them from the timeline in one go. |

There is no “single word” remove-filler action in the word menu; the feature is **bulk only**, triggered from the AI enhance / Clean panel (e.g. “Remove filler words” button).

---

## What counts as a filler word?

A caption word is treated as a filler word if **either**:

1. **Type is `"filler"`** – the word’s `type` field is exactly `"filler"`, or  
2. **Text matches the filler list** – the word’s text (letters only, lowercased) is in this list:

   `["mmm", "um", "uh", "hm", "uhhh", "uhs", "ah", "uhh", "uhm", "umm", "mmhmm", "mhmm", "hmm"]`

The check is implemented as: `(text, type) => type === "filler" || list.includes(text.replace(/[^a-zA-Z]*/g, "").toLowerCase())`.

Words that have a **text adjustment** are **excluded** from removal (they are not included in `fillerWordIds`).

---

## Simple flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER CLICKS "REMOVE FILLER WORDS" (e.g. in AI enhance / Clean panel)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Guard check                                                         │
│  • getCleanOperationNoti() must allow the operation (e.g. timeline not locked)│
│  • If not allowed, nothing runs                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Get list of filler word IDs                                         │
│  • Selector: fillerWordIds (M.R.fillerWordIds)                               │
│  • Uses caption section structure + word map; keeps words where:             │
│    - isFiller(text, type) is true  and  no textAdjustment                     │
│  • Result: array of word IDs to remove                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: If no filler words                                                  │
│  • Show warning: "no_filler_words_found"                                      │
│  • Exit (no removal, no events)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Remove each word from the timeline                                  │
│  • Call dropContinuousWords with batches = one ID per word, reversed         │
│  • For each batch: same logic as Remove Pause                                │
│    - Get time range from caption track                                       │
│    - Whole section: delete segment on caption + keyframe + voice             │
│    - Partial section: split at boundaries, delete middle segment             │
│  • After all batches: reCompactTimeline() on caption, keyframe, voice         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Save & notify                                                       │
│  • Fire analytics: editor.filler.remove                                      │
│  • Optional: reset clip assets sidebar tab (if enableResetAfterCleanFillerWords)│
│  • Success toast: "length_filler_words_removed" with count                    │
│  • NPS survey for RemoveFillerWords                                          │
│  • takeSnapshot() for undo                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow diagram (entry → removal)

```
                    ┌──────────────────────────────┐
                    │  User clicks                 │
                    │  "Remove filler words"       │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  Optional: feature gate      │
                    │  If gated → upsell/track     │
                    │  Else → continue             │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  editor.filler.remove.attempt│
                    │  (analytics)                 │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  getCleanOperationNoti()     │
                    │  If false → stop             │
                    │  If true → cleanFillerWords()│
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  cleanFillerWords thunk      │
                    │  • getState(M.R.fillerWordIds)│
                    │  • If empty → warning, exit  │
                    │  • Else: dropContinuousWords( │
                    │      ids.reverse().map(id=>[id])│
                    │    )                         │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  dropContinuousWords (thunk Y)│
                    │  For each batch (one word):  │
                    │  • Resolve time range        │
                    │  • Delete from caption,      │
                    │    keyframe, voice           │
                    │  • reCompactTimeline() x3    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  editor.filler.remove        │
                    │  Toast + NPS + takeSnapshot  │
                    └──────────────────────────────┘
```

---

## Examples

These examples show how filler words are removed from the **caption**, **keyframe**, and **voice** tracks. Time is in seconds; the same logic applies to filler words and to “remove pause”.

---

### Example 1: One filler word – whole caption section

**Setup:** One caption section contains only the word **"um"** (a filler). The section spans 2.0s–2.5s.

**Caption track (before):**
```
Section A:  [  "um"  ]     ← only word in section, 2.0s–2.5s
```

**Keyframe track (before):** One segment covering the same range (e.g. 2.0s–2.5s).

**What happens:**

1. **Batch** = one word ID (the "um").
2. **Time range** from caption: `m = [2.0, 2.5]`, midpoint `h = 2.25`.
3. **Whole section?** Yes – the batch is the only word in that caption section (`g.id === v.id` and section has 1 word, batch has 1 word).
4. **Keyframe:** Call **`deleteKeyFrameSegmentByTime(2.25)`** – delete the keyframe segment that contains 2.25s.
5. **Caption:** `deleteSegmentsAndReturn(2.25, captionTrack)`.
6. **Voice:** Find section at 2.25s, call `.delete()`.
7. **Recompact** all three tracks.

**After:** The 2.0s–2.5s range is gone on all tracks; later content shifts left by 0.5s.

---

### Example 2: One filler word – middle of a section (partial)

**Setup:** A caption section has three words: **"So"**, **"um"**, **"anyway"**. Only **"um"** is filler. Times: So 1.0–1.2, um 1.2–1.5, anyway 1.5–1.9.

**Caption track (before):**
```
Section A:  [ "So" ] [ "um" ] [ "anyway" ]
              1.0–1.2  1.2–1.5  1.5–1.9
```

**Keyframe track (before):** One segment for the whole section, e.g. 1.0s–1.9s.

**What happens:**

1. **Batch** = one word ID (the "um").
2. **Time range** from caption: `m = [1.2, 1.5]`, so `o = 1.2`, `c = 1.5`, midpoint `f = 1.35`.
3. **Whole section?** No – the section has 3 words, we’re only removing 1.
4. **Partial removal:**
   - **Caption:** Split at 1.2 and 1.5, then delete the middle segment (the one containing 1.35). Result: two segments: "So" (1.0–1.2) and "anyway" (1.5–1.9).
   - **Keyframe:**  
     - `keyframeTrack.split(1.2)` → segment 1.0–1.9 becomes 1.0–1.2 and 1.2–1.9.  
     - `keyframeTrack.split(1.5)` → 1.2–1.9 becomes 1.2–1.5 and 1.5–1.9.  
     - Find section at 1.35 (the 1.2–1.5 segment), call `.delete()`.  
     - Remaining keyframe segments: 1.0–1.2 and 1.5–1.9.
   - **Voice:** Same idea – split at 1.2 and 1.5, delete the middle segment.
5. **Recompact** all three tracks (gaps are closed, times shifted).

**After:** The 1.2–1.5 “um” range is removed; "So" and "anyway" stay, and the keyframe track has two segments where there was one. Timeline is shorter by 0.3s.

---

### Example 3: Two filler words – removed in reverse order

**Setup:** Two filler words: **"um"** at 1.2–1.5 and **"uh"** at 3.0–3.2. The code removes from **end to start** so that earlier indices don’t shift and break later batches.

**fillerWordIds** (order from selector): e.g. `[id_um, id_uh]`.  
**Batches passed to dropContinuousWords:** `[[id_uh], [id_um]]` (reversed: one batch per word).

**Step 1 – Remove "uh" (3.0–3.2):**

- Time range 3.0–3.2 removed from caption, keyframe, voice (whole or partial as above).
- Recompact. Timeline is now shorter; e.g. what was at 5.0s might now be at 4.8s.

**Step 2 – Remove "um" (1.2–1.5):**

- Time range 1.2–1.5 is still at 1.2–1.5 (we didn’t remove anything earlier yet).
- Remove that range from caption, keyframe, voice.
- Recompact again.

If we had removed "um" first, the "uh" segment would have moved earlier in time and we’d have to resolve it again; reversing avoids that.

---

### Example 4: Keyframe “whole section” vs “partial” in one picture

**Caption section with 3 words, middle one is filler:**

```
Caption:    [ "Hi" ]  [ "um" ]  [ "there" ]
Time:        0–0.5     0.5–1.0    1.0–1.5
             |-------- section A ---------|
```

**Whole section:** If we remove **all** three words (e.g. “remove pause” on the whole section), we treat it as one batch covering the whole section. Keyframe: **`deleteKeyFrameSegmentByTime(midpoint)`** – one call deletes the segment that spans 0–1.5.

**Partial section:** If we remove only **"um"** (0.5–1.0):

- Keyframe segment might be 0–1.5 (one segment for the whole section).
- **Split at 0.5** → [0–0.5] and [0.5–1.5].
- **Split at 1.0** → [0.5–1.0] and [1.0–1.5].
- **Delete** the segment containing the midpoint 0.75 → delete [0.5–1.0].
- Result: keyframe segments [0–0.5] and [1.0–1.5]; the “um” gap is gone after recompact.

---

## Code locations (opustimeline.js)

| What | Where (approx.) |
|------|------------------|
| Filler word list + `isFiller(text, type)` | ~73795–73797 (module exporting `X`) |
| Selector **fillerWordIds** (D) | ~70106–70121; debugLabel `editor.caption.fillerWordIds` |
| **cleanFillerWords** thunk (eg) | ~50030–50048 |
| **dropContinuousWords** thunk (Y) | ~49620–49667 (shared with Remove Pause) |
| cleanFillerWords exposed on context | ~50334 (`cleanFillerWords: eg`) |

---

## UI entry (opusaienhance.js)

- **Remove filler words** button is in the remove-pause / AI enhance panel.
- On click:
  - If feature gate is on: call upsell/tracking and return.
  - Else: push **editor.filler.remove.attempt**, then if `getCleanOperationNoti()` is true, call **cleanFillerWords()** (e.g. `ea() && eo()`).
- **cleanFillerWords** is obtained from the same provider as **cleanPauses** (e.g. `F.ZP()`).

---

## Selector: fillerWordIds (D)

- **Inputs:** Caption section structure (e.g. from `C` – per-section `textIds`) and word map `k` (e.g. `uiWordMap` / word lookup by id).
- **Logic:**
  - Flatten to list of `{ secId, textId }`.
  - For each, get word object from `k[textId]`.
  - Keep only if: word exists, `isFiller(word.text, word.type)` is true, and `!word.textAdjustment`.
  - Return array of `textId`s.
- **Result:** All caption word IDs that are filler and eligible for removal.

---

## cleanFillerWords thunk (eg)

- **Signature:** thunk with `(getState, dispatch)`.
- **Steps:**
  1. `r = getState(M.R.fillerWordIds)`.
  2. If `r.length === 0`: show warning `no_filler_words_found`, return.
  3. Else:
     - Call **Y** (dropContinuousWords) with `r.reverse().map(id => [id])` (one batch per word, end-to-start order).
     - Push **editor.filler.remove**.
     - If `enableResetAfterCleanFillerWords`: dispatch to reset clip assets sidebar tab.
     - Success toast: **length_filler_words_removed** with `fillerWordIdsCount: r.length`.
     - NPS for **RemoveFillerWords**.
     - **takeSnapshot()**.

---

## Shared removal: dropContinuousWords (Y)

Remove Filler Words uses the **same** removal thunk as Remove Pause:

- For each batch of word IDs, get the time range from the caption track and remove that range from:
  - Caption track (e.g. `deleteSegmentsAndReturn` or split + delete section),
  - Keyframe track (e.g. `deleteKeyFrameSegmentByTime` or split + delete),
  - Voice enhancement track (find section by time, then `.delete()`).
- Then call **reCompactTimeline()** on all three tracks.

Reversing the list (end-to-start) avoids index shifts when removing multiple words.

---

## Comparison with Remove Pause

| Aspect | Remove Filler Words | Remove Pause |
|--------|---------------------|--------------|
| **Detection** | Type `"filler"` or text in um/uh/hmm list (`isFiller`) | Silence/pause via `NZ(text)`; optional duration filter |
| **Word list** | **fillerWordIds** (all filler, no duration) | **silenceWords** (optional: duration ≥ X seconds) |
| **Entry** | Single button: “Remove filler words” → cleanFillerWords | Word menu “Remove pause” or “Remove all pauses” → dropContinuousWords / cleanPauses |
| **Removal** | dropContinuousWords(batches of one ID, reversed) | Same dropContinuousWords |
| **Events** | editor.filler.remove.attempt, editor.filler.remove | editor.pause.remove.attempt, editor.pause.remove (and editor.caption.operation for single word) |

---

## Analytics and side effects

| Event / action | When |
|----------------|------|
| **editor.filler.remove.attempt** | When user clicks “Remove filler words” (before guard and cleanup). |
| **editor.filler.remove** | After all filler words have been removed successfully. |
| **length_filler_words_removed** toast | Success message with count of removed words. |
| **no_filler_words_found** | Warning when fillerWordIds is empty. |
| **takeSnapshot()** | After successful removal (for undo). |
| **NPS** | RemoveFillerWords survey after success. |









### Events fired when user clicks “Remove filler words”

When the user clicks the **“Remove filler words”** button, these analytics events are fired (in order):

1. **`editor.filler.remove.attempt`**
   - **When:** As soon as the user clicks the button, **before** any guard check or removal.
   - **Where:** `opusaienhance.js` (click handler for the Remove filler words option).
   - **Payload:** `{}`
   - **Options:** `{ platform: { MP: true, SS: true } }`

2. **`editor.filler.remove`**
   - **When:** Only if filler words were found and removed successfully (inside `cleanFillerWords`, after `dropContinuousWords` runs).
   - **Where:** `opustimeline.js` (inside the `cleanFillerWords` thunk).
   - **Payload:** `{}`
   - **Options:** `{ platform: { MP: true, SS: true } }`

**Note:** If the guard fails (e.g. timeline locked) or there are no filler words, only **`editor.filler.remove.attempt`** is fired; **`editor.filler.remove`** is not fired.

### What triggers the execution of remove filler words when the button is clicked

**No separate event triggers the execution.** The removal is run directly in the button’s click handler.

1. User clicks **“Remove filler words”** → the button’s **onClick** handler runs (`opusaienhance.js`).
2. If the feature gate is on → upsell/tracking runs and the handler returns (no removal).
3. Otherwise the handler calls **eh()** (a callback). **eh()** does:
   - Pushes the analytics event **`editor.filler.remove.attempt`** (for tracking only).
   - Then runs **ea() && eo()** — i.e. **getCleanOperationNoti()** and **cleanFillerWords()**.
4. So **cleanFillerWords()** (and thus the remove-filler-words logic) is invoked **in the same handler**, right after the analytics event is pushed. Nothing “listens” for an event to run the removal; the handler both fires the attempt event and calls **cleanFillerWords()**.

**Summary:** The trigger is **button click → onClick handler → eh() → ea() && eo()**. The analytics event **`editor.filler.remove.attempt`** is fired at click time but does **not** trigger the execution; it only records that the user tried. The execution is triggered by the same handler calling **cleanFillerWords()** directly.

---

## Actual removal vs mapping, and how undo/redo works

### Is content actually removed, or is there a mapping?

**Segments are actually removed.** There is no “mapping” layer that hides them.

- The code **mutates** the track data: it calls **split** at boundaries, **delete** on sections (or `deleteKeyFrameSegmentByTime` / `deleteSegmentsAndReturn`), then **reCompactTimeline()**.
- Caption, keyframe, and voice track instances are updated in place; the time ranges for the filler words are **cut out** of each track’s sections/segments.
- So the timeline data really changes: those segments no longer exist in the in-memory track structures.

### How undo/redo works

Undo/redo does **not** “un-delete” segments. It works by **full state snapshots** and **restore**.

1. **Snapshot stack**  
   The editor keeps:
   - **editorSnapshots** – an array of snapshots (full editor state at certain points).
   - **editorSnapshotIndex** – index of the “current” snapshot.

2. **What a snapshot is**  
   Each snapshot is a **full serialized copy** of the editor state at one moment:
   - All tracks (caption, keyframe, voice, broll, media, emoji, etc.) via each track’s **`.parse()`** (serialized track data).
   - Preference, customizedTemplate, selectedCaptionTemplateId, selectedBrandTemplateId, pendingExtendSections, etc.
   - So it’s “state after operation N”, not a diff or a “before” state.

3. **takeSnapshot()** (called **after** remove filler words)  
   - Reads the **current** state (all track instances, preference, etc.).
   - Serializes it (e.g. `keyFrameTrackInstance.parse()`, `captionTrackInstance.parse()`, …).
   - Builds a new snapshot object with that data.
   - Pushes it onto **editorSnapshots** (and drops any “future” snapshots if we’re not replacing).
   - Sets **editorSnapshotIndex** to the new top.
   - So the stack holds “after” states: [after_op0, after_op1, after_remove_filler, …].

4. **Undo**  
   - If **canUndo**, set **editorSnapshotIndex** to **index - 1**.
   - **Restore** that snapshot: apply it to the store (set preference, customizedTemplate, and **replace** all track instances with new instances created from the snapshot’s serialized tracks).
   - So the current state is **replaced** by the previous snapshot (the state after the previous operation). That effectively “undoes” the last action (e.g. remove filler words).

5. **Redo**  
   - If **canRedo**, set **editorSnapshotIndex** to **index + 1**.
   - Restore that snapshot the same way.
   - So you get back the state after the operation you had undone.

So: **removal is real** (segments are deleted from the tracks). **Undo** = “replace entire editor state with the previous snapshot”. **Redo** = “replace entire editor state with the next snapshot”. No inverse delete or mapping; it’s full state save/restore.

---

## Summary

**Remove Filler Words** = get all caption word IDs that are filler (type or text in list, no text adjustment) via **fillerWordIds** → call **cleanFillerWords** → inside it, call **dropContinuousWords** with one batch per ID in reverse order → remove those time ranges from caption, keyframe, and voice tracks → recompact → fire **editor.filler.remove**, show toast, NPS, and take snapshot for undo.
