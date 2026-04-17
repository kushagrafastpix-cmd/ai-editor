# Transitions Functionality in opustimeline.js

This document explains how the **transitions** (video effects) functionality is implemented in `opustimeline.js`, and which **events** are fired when the user interacts with it.

---

## 1. Overview

Transitions are implemented as **VideoEffect** segments on the **VideoEffectTrack**. Each transition has an `effectType` (e.g. CrossFade, ZoomIn) and optional `effectParams` (keyframes for alpha/zoom). The user can:

- **Drag** a transition from the sidebar onto the timeline
- **Move** a transition segment on the timeline
- **Trim/extend** a transition (resize handles)
- **Delete** transitions (e.g. via delete key or bulk delete)
- Use **auto transitions** (apply one transition type between keyframe sections)

---

## 2. Transition Types

Supported effect types (from `Yn` / transition type list):

| Key       | Value       | Display (i18n)              |
|----------|-------------|-----------------------------|
| CrossFade | crossFade   | transition_type.crossFade  |
| CrossZoom | crossZoom   | transition_type.crossZoom   |
| ZoomIn    | zoomIn      | transition_type.zoomIn      |
| ZoomOut   | zoomOut     | transition_type.zoomOut     |
| FadeIn    | fadeIn      | transition_type.fadeIn      |
| FadeOut   | fadeOut     | transition_type.fadeOut     |

Effect params are generated per type and duration via a helper (e.g. `j$`), providing keyframes for alpha (fade) or zoomScale (zoom) with timestamps and easing.

---

## 3. Data Model

- **Track:** `VideoEffectTrack` (trackType `"VideoEffectTrack"`).
- **Section:** VideoEffect section with:
  - `contentType: "VideoEffect"`
  - `content.effectType` (e.g. `"crossFade"`)
  - `content.effectParams` (keyframes)
  - `content.duration` / `content.timeline` (in/out)
- **Instance:** `videoEffectTrackInstance` holds the live track; sections are parsed into in-memory sections with `sectionMap` and segment/section IDs.

When building the initial keyframe/brand template, if **auto transition** is enabled (`enableAutoTransition` and `selectedTransitions`), a default transition section is pushed onto the VideoEffectTrack (e.g. one section from `R` to `R + 3000` ms with `selectedTransitions[0]`).

---

## 4. Implementation Flows

### 4.1 Drag transition from sidebar onto timeline

1. User drags a transition (EFFECT_TRACK) from the assets/sidebar and drops on the timeline.
2. Timeline drop handler (e.g. in `tO`) runs with `eventId === A5.EFFECT_TRACK` and `value` = transition type.
3. **Position** is computed from drop coordinates (e.g. `en([clientX - timelineXOffset - kg, clientY], boundingRect, totalTime / widthTimeRatio)`), then floored; if before first frame, position is clamped to 0.
4. **createEffect(position, transitionType)** is called (context handler, implemented around 65576–65602):
   - Reads `videoEffectTrack` from state; if missing, uses empty track (`FL()`).
   - Builds a new **VideoEffect section** via `X.mH({ timeline: { in: position, out: position + Vx }, effectType })` (Vx = default transition duration, e.g. 300 ms).
   - Pushes the section onto the track’s `sections`, sorts by `sectionTimeline.in`, updates store (`f.T(c)`), and adds the new segment to active segments.
   - Calls `updateAllSectionsTimeline` with dragging placeholder so the rest of the timeline stays in sync.
5. **takeSnapshot()** is called for undo/history.
6. Analytics/tracking: **`editor.transition.dragApply`** with `{ transitionType }` is pushed (e.g. `T.Z.getInstance().push("editor.transition.dragApply", { transitionType: e })`).

So the **event fired** when the user drops a transition on the timeline is:

- **`editor.transition.dragApply`**  
  Payload: `{ transitionType: <string> }` (e.g. `"crossFade"`, `"zoomIn"`).

---

### 4.2 Edit transition: move

1. User drags a transition segment to a new time (no resize).
2. **onMoveEffectHandler(segmentId)** is called; engine moves the section on the VideoEffectTrack.
3. **takeSnapshot()** is called.
4. Analytics: **`editor.transition.edit`** with `{ operationType: "move" }` is pushed.

**Event fired:**

- **`editor.transition.edit`**  
  Payload: `{ operationType: "move" }`

---

### 4.3 Edit transition: trim / extend

1. User drags the left or right edge of a transition to shorten or lengthen it.
2. **onDragEffectEndHandler({ segId, timeOffset: { durationOffset, inOffset } })** is called; engine resizes the segment (e.g. `resizeSectionInstance` on `videoEffectTrackInstance`).
3. **takeSnapshot()** is called.
4. Analytics: **`editor.transition.edit`** with `operationType` derived from sign of duration change:
   - `durationOffset < 0` → **`"trim"`**
   - `durationOffset >= 0` → **`"extend"`**

**Events fired:**

- **`editor.transition.edit`**  
  Payload: `{ operationType: "trim" }` or `{ operationType: "extend" }`

---

### 4.4 Delete transition(s)

1. User deletes one or more segments that include **VideoEffect** (e.g. Delete key or bulk delete).
2. Delete handler filters segments by `type === "VideoEffect"`, then for each (or the adjacent segment when doing single-segment delete) calls `videoEffectTrackInstance.sectionMap.get(segmentId).delete()` and cleans the track.
3. **takeSnapshot()** is called.
4. Analytics: **`editor.transition.delete`** is pushed (e.g. `B.Z.getInstance().push("editor.transition.delete", {})`).

**Event fired:**

- **`editor.transition.delete`**  
  Payload: `{}`

---

### 4.5 Auto transitions (sidebar / template)

Auto transitions are controlled by:

- **enableAutoTransition** (boolean)
- **selectedTransitions** (array of effect types, e.g. `[selectedType]`)

Handlers (from the same context that exposes `createEffect` and transition helpers):

- **applyCurrentAutoTransitions(effectType)**  
  Updates all existing VideoEffect sections to the given type and sets `enableAutoTransition: true`, `selectedTransitions: [effectType]`.
- **applyCurrentAutoTransitionsForBrandTemplate(transition)**  
  Sets `enableAutoTransition: true`, `selectedTransitions: [transition]`.
- **applyAutoTransitions(enable)**  
  Sets `enableAutoTransition` to the given boolean.
- **applyGeneratedAutoTransitions(keyframeTrack, effectType)**  
  Builds a VideoEffect track from keyframe sections (e.g. between sections with gap ≥ 1s), then applies it and sets `enableAutoTransition: true`, `selectedTransitions: [effectType]`.
- **removeAllAutoTransitions**  
  Replaces VideoEffectTrack with an empty track and turns off auto transition.
- **handleAutoTransitionsCheck(checked)**  
  If checked, runs `applyGeneratedAutoTransitions` with the first selected transition type and shows a toast; if unchecked, clears transitions and shows “transition reset” toast.

Config also exposes **autoTransitionsHandleType**: `"SWITCH"` (e.g. template/config UX) or `"APPLY"` (e.g. brand template apply flow).

No separate analytics event names were found for “auto transition applied” in the same pattern as the three transition events above; toasts and NPS/feature usage may still use the **editor-sidebar-transitions** (or similar) feature key.

---

## 5. Events Summary (when user uses transitions)

| User action                     | Event name                     | Payload / notes                          |
|--------------------------------|--------------------------------|------------------------------------------|
| Drop transition on timeline    | **editor.transition.dragApply** | `{ transitionType: string }`             |
| Move transition segment        | **editor.transition.edit**       | `{ operationType: "move" }`              |
| Trim transition (shorten)      | **editor.transition.edit**       | `{ operationType: "trim" }`              |
| Extend transition (lengthen)    | **editor.transition.edit**       | `{ operationType: "extend" }`            |
| Delete transition(s)            | **editor.transition.delete**      | `{}`                                     |

All of these are pushed via the analytics/tracking instance (e.g. `T.Z.getInstance().push(...)` or `B.Z.getInstance().push(...)`).

---

## 6. Feature / UI keys

- **Transitions** sidebar/feature: `key: "Transitions"`, `featureUsedKey: "editor-sidebar-transitions"`, `name` from i18n `common:function_transitions`.
- **Dirty layout:** When computing “has transition” for layout or UI, the code uses something like `hasTransition: (sections?.length || 0) > 0` on the VideoEffect track.

---

## 7. Relevant code locations (approx. line numbers in opustimeline.js)

- Transition types / i18n: ~39055–39089  
- VideoEffect track config (id `effect-track`, SectionComp for effect sections): ~64419–64423, ~64119–64123  
- Effect section UI (trim/drag, `editor.transition.edit`): ~62626–62670  
- createEffect (add transition at position): ~65576–65602  
- Timeline drop handler, `editor.transition.dragApply`: ~64869–64875  
- Delete segments, `editor.transition.delete`: ~65959–65974  
- Auto transition helpers and handleAutoTransitionsCheck: ~68675–68793  
- Default transition section when building keyframe/template (enableAutoTransition + selectedTransitions): ~28497–28539  
- VideoEffect section/track classes (parse, effectType, sectionMap): ~77318–77382, ~69534–69581  

These line numbers are from a single bundled/minified file; they may shift with builds.
