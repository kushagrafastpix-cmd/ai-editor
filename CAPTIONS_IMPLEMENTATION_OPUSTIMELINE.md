# Captions Functionality in opustimeline.js

This document explains how the captions functionality is implemented in `opustimeline.js` (the bundled/minified Opus timeline editor) and which events are fired when the user interacts with captions.

---

## 1. Overview

The captions system in opustimeline.js is built around:

- **State**: `captionTrack` (parsed track data) and `captionTrackInstance` (mutable track instance with sections/segments)
- **Timeline**: A dedicated `CaptionTrack` (`trackType: "CaptionTrack"`, `id: "track-caption"`) initialized with the editing script
- **UI**: A caption side panel for editing words, selection, and styling
- **Engine bridge**: Events from the WASM/video engine (`window.pubSub`) drive playback sync and caption segment highlighting
- **Analytics**: `push()` events for user actions (clicks, corrections, operations)

The file is minified; identifiers like `v.XU.captionTrack`, `w.R.currentCaptionSegmentId`, and `tE.R.captionWordIds` refer to store/state keys for the caption track and related UI state.

---

## 2. State and Store

### Core caption state (editor.core)

| State key | Debug label | Purpose |
|-----------|-------------|---------|
| `captionTrackInstance` | `editor.core.captionTrackInstance` | Mutable caption track instance (sections, segment map) |
| `captionTrack` | `editor.core.captionTrack` | Parsed view of the caption track (`captionTrackInstance.parse()`) |

Other caption-related state (e.g. under `w.R` / `_.r` in the bundle):

- `currentCaptionSegmentId` – segment ID of the caption currently selected/highlighted on the timeline
- `textBoxMap` – stores caption (and text overlay) position data (`wPct`, `hPct`, `xPct`, `yPct`) and `timeAnchor` for sync
- Caption word/selection state: `captionWordIds`, `currentWordId`, `editingWordIds`, `multiSelectedWordIds`, `activePopoverWordId`, `currentEditingWordId`, `currentCaptionSegmentId`, `currentCaptionSegment`, etc.

### Feature flags / experiments

- **`new_caption_styles`** – used via `o.XL)("new_caption_styles")` to gate “new caption styles” behavior.
- **`editor_caption_v2`** and **`editor_caption_v2_for_new`** – used for the “NG” caption editor experience and onboarding (e.g. `editor_caption_v2`, `editor_caption_v2_for_new`).

---

## 3. Caption Track Initialization and Structure

### Timeline initialization

When the editing script is initialized, the timeline is created with a fixed set of tracks, including:

```js
{
  trackType: "CaptionTrack",
  sections: [],
  id: "track-caption"
}
```

So the captions functionality is tied to this `CaptionTrack` from the start.

### Caption track data shape

- **Track**: `CaptionTrack` with `sections[]`.
- **Section**: has `id`, `segments[]`, `sceneId`, and duration/timeline (`sectionDuration`, `sectionTimeline` or equivalent).
- **Segment**: `contentType: "Caption"`, `content` with:
  - `textElements` – array of text items (word/phrase) with `text`, `duration`, `timeline`, `color`, etc.
  - `scale` and optional `position` (e.g. for custom caption position).
- Segment IDs are used in click handlers (e.g. `#CaptionTrack` + segment `id`).

### Mock caption section (preview)

When building the timeline for preview (e.g. before real analysis), the code creates a **mock caption section** on `captionTrackInstance`:

- Clears existing sections on the caption track instance.
- Pushes a new section built from a function that generates:
  - One caption segment with `contentType: "Caption"`.
  - `content.textElements` that depend on `captionStyle` (e.g. “one-line” vs multi-line), with placeholder text like “One” / “Line” or “Multiple” / “Lines” / “Per” / “Page”.
  - Optional `content.position` and `content.scale` from `captionCustomStyle` when `captionPosition === "custom"`.

This gives a preview of caption style/layout before real transcript data exists.

---

## 4. Caption Side Panel (CaptionSide)

- **Component**: A “caption-side” panel component (e.g. `tB = "caption-side"`, `tM = CaptionSide`) that shows the list of caption words and allows selection/editing.
- **Behavior**:
  - Subscribes to `captionTrack` (parsed) and uses `captionWordIds`, `captionFontLetterSpacingCoefficient`, word IDs, etc.
  - Listens to `click` on the panel container; on click it:
    - Reads `document.getSelection()` and the selected text.
    - Resolves word elements via `data-word-id` and maps selection to segment/text IDs in the caption track.
    - Updates selection state: `multiSelectedWordIds`, `activePopoverWordId`, `activePopoverTimingWordId`, `currentEditingWordId`, `editingWordIds`, and calls `handleSelection` with the selected word range.
  - Sync with emoji in/out and “transcription only” toggle.
- **Resize**: Caption panel width is stored (e.g. `captionPanelWidth`); a resize handle fires updates so the panel can be resized (e.g. 200–800px).

So “using captions” in the side panel triggers **selection state updates** and, where wired, **analytics** (see below).

---

## 5. Timeline Interaction: Click on Caption Segment (#CaptionTrack)

When the user clicks on the **timeline** (canvas/track view), the engine sends layout/element info. The handler that uses this is keyed by track and segment:

- **Track**: `#CaptionTrack`.
- **Segment**: The segment `id` from the caption track is passed (e.g. `r` in the handler).

Logic (conceptually):

1. If analytics is locked (`S.Z.getInstance().isLocked()`), the handler returns and does nothing.
2. The code looks up the clicked segment in `captionTrack.sections[].segments` by `id`.
3. If the segment is found:
   - It sets **current caption segment** (e.g. `Z(r)` for segment id, `V("")` for something like clearing a conflicting id).
   - It updates **textBoxMap** with the caption position:
     - If `timeAnchor === currentTime` (same moment): `z({ caption: { wPct, hPct, xPct, yPct } })`.
     - Else: `t(_.r.textBoxMap, { timeAnchor: u, caption: { wPct, hPct, xPct, yPct } })`.

So a timeline click on a caption segment updates **currentCaptionSegmentId** and **textBoxMap** (caption position at that time). It does **not** by itself fire a named analytics event in the snippets we saw; analytics for “click on caption word” happen in the caption side panel (see below).

---

## 6. PubSub Events (from WASM / video engine)

These are **emitted** by the native/WASM side via `window.pubSub.emit(...)` and **subscribed** in the React/editor code with `F.on(...)` / `F.off(...)` (where `F` is the pubSub or engine reference). Caption-relevant events:

| Event name | When it fires | Subscriber usage |
|------------|----------------|-------------------|
| **`firstCaptionFrameEnd`** | When the first **caption** frame has been rendered (caption-specific first frame ready). | Used alongside `firstFrameEnd` for loading/readiness; e.g. sets a “caption frame ready” flag and triggers UI/playback state (e.g. `N(!0)`). |
| **`firstFrameEnd`** | First frame of the video/module rendered. | Template loaded, loading steps, “first frame” done. |
| **`refreshEnd`** | After a refresh of the engine/view. | Marks refresh as done; used in loading/performance flow. |
| **`seekSync`** | Seek completed; timeline position in sync. | Handler can be a no-op `e => {}` in one place; used for sync with caption timeline. |
| **`videoTimeUpdate`** | Playback time updated. | Used to sync playback position with caption/UI. |
| **`playbackEnd`** | Playback reached the end. | E.g. loop or stop; can affect caption state. |
| **`loadingStart`** / **`loadingEnd`** | Loading started/ended. | Editor loading state. |
| **`templateLoaded`** | Template (project/timeline) loaded. | Enables “template loaded” state (e.g. render frame, can show caption UI). |
| **`canPlayBack`** | Engine is ready to play. | Marks that playback (and thus caption sync) is available. |

So for **captions**, the most specific events are **`firstCaptionFrameEnd`** (first caption frame ready) and **`seekSync`** / **`videoTimeUpdate`** (keeping timeline and caption segment in sync). The rest are general engine lifecycle events that the caption UI depends on.

---

## 7. Analytics / User Events (push)

These are **fired when the user uses** captions (click, correct, resize, etc.). They use the analytics singleton (e.g. `S.Z.getInstance().push(...)` or `D.Z.getInstance().push(...)` / `eA.Z.getInstance().push(...)` / `P.Z.getInstance().push(...)` in different bundles).

### Navigation / entry

| Event | Payload | When |
|-------|---------|------|
| **`user.header.click`** | `{ destination: "freetool-captions" }` | User clicks header to go to the standalone captions tool; then `window.location.href = "/captions"`. |

### Caption editing (side panel and timeline)

| Event | Payload | When |
|-------|---------|------|
| **`editor.caption.click`** | `{ word: a }` (word object) | User clicks a caption word in the caption side panel (single click). |
| **`editor.caption.double_click`** | `{}` | User double-clicks a caption word (enters edit mode, sets selection, may seek video to word time). |

### Corrections and timing

| Event | Payload | When |
|-------|---------|------|
| **`editor.caption.correct`** | `{ word, type: "replace-all" \| "single-correct" \| "multi-correct" }` or `{ adjustTime: true }` | User applies a correction (replace all, single/multi word correct, or timing adjust). |

### Operations (first operation and optional second)

| Event | Payload | When |
|-------|---------|------|
| **`editor.caption.operation`** | `{ firstOperation: "Edit words" \| "Correct words" \| "Timing words" \| "Remove caption" \| "Remove caption & video" \| "Add emoji" \| "Split section" \| "Set as Start" \| "Set as End" \| "Default font color" \| "Highlight color 1" \| "Highlight color 2" \| "AI generated B-Roll" \| "Stock videos" \| "Change Speaker" \| "Add AI hook" \| "Copy words" \| "Paste words" \| "Cut words", secondOperation?, word?, isShortcut? }` | User performs that action from the caption context (toolbar, menu, shortcut). |
| **`editor.caption_timing.operation`** | `{ firstOperation: "Apply timing" }` | User applies timing to caption words. |

### On-demand / analysis (caption-related)

| Event | Payload | When |
|-------|---------|------|
| **`editor.onDemand.process`** | `{ type: "warn", step: "getAnalysisResult return caption is empty", result }` | Analysis returned empty caption data. |
| **`editor.onDemand.start`** | `{ mode: "update" \| "add", direction }` | On-demand analysis (which may fill captions) started. |
| **`editor.onDemand.failed`** | `{ name, message }` | On-demand analysis failed. |

Other `editor.onDemand.process` steps (e.g. VisualAnalyze, OverlayAnalyze, genVoiceEnhancement) are not caption-specific but run in the same pipeline that eventually may populate captions.

---

## 8. Summary Table: Events When Using Captions

| Category | Event | Trigger |
|----------|--------|--------|
| **PubSub (engine)** | `firstCaptionFrameEnd` | First caption frame rendered by engine. |
| | `seekSync` | Seek finished; timeline (and caption) in sync. |
| | `videoTimeUpdate` | Playback time updated (caption highlight can follow). |
| | `refreshEnd`, `firstFrameEnd`, `loadingStart`, `loadingEnd`, `templateLoaded`, `canPlayBack` | General engine lifecycle used by caption UI. |
| **Analytics** | `user.header.click` (destination: freetool-captions) | User navigates to /captions. |
| | `editor.caption.click` | Single click on a word in caption panel. |
| | `editor.caption.double_click` | Double-click on a word (edit mode). |
| | `editor.caption.correct` | User corrects word(s) or adjusts timing. |
| | `editor.caption.operation` | Edit, correct, timing, remove, emoji, split, colors, B-roll, speaker, copy/paste/cut, etc. |
| | `editor.caption_timing.operation` | Apply timing. |
| | `editor.onDemand.process` (caption empty) | Analysis returned no captions. |

---

## 9. Reference: Caption track in sample JSON

The repo’s `captiontrack.sample.json` shows the same structure the code expects: `CaptionTrack` with `sections`; each section has `segments` with `contentType: "Caption"` and `content.textElements` (and optional `position`/`scale`). Segment and text IDs are used for selection and for the `#CaptionTrack` click handler on the timeline.

---

*Source: analysis of `opustimeline.js` (minified bundle). Symbol names are as they appear in the bundle (e.g. `v.XU`, `w.R`, `_.r`, `tE.R`).*
