# Speech Enhancement Implementation (opustimeline.js)

This document describes how speech enhancement is implemented in `opustimeline.js` and which analytics/telemetry events are fired when the user uses this functionality.

---

## 1. How Speech Enhancement Is Implemented

### 1.1 Entry Points

- **Editor (clip assets)**: The "AI enhance" option appears in the clip assets sidebar (key `"AI enhance"`, value `"AI enhance"`). When the user selects it, the AI enhance panel is shown (lazy-loaded module **38439**).
- **Quick amend (result page)**: When the user arrives from the result page with `voiceEnhancement: true` in the quick-amend config, enhancement is turned on automatically via `turnOnVoiceEnhancement()` (used in the component that imports module **70973**).

### 1.2 Core Hook (Module 70973)

The main logic lives in a hook that:

- Uses **`genVoiceEnhancement`** from either a minijob API (`editor_voice_enhance_minijob`) or the regular API (`s.ZP()`).
- Reads **keyframe track** sections (excluding intro/outro/media), derives time ranges via `w.fO`, and keeps intro/outro/media sections to reattach later.
- If there is no `voiceEnhancementTrack` and no in-progress run:
  - Sets **`voiceEnhancementProgress`** (0 → 100) and **`timelineOperationLock`** with `key: "speech enhancement"` and a “unable to update” notification.
  - Calls **`B(t, n, g)`** — i.e. `genVoiceEnhancement(fullClipId, sourceId, [{ startMs, endMs }, ...])`.
  - Gets the enhanced **audio URL** from `result.audioFile`, preloads it with `y.Z.get`, builds an audio track from it with `o.G(d, g)`, aligns sections with keyframe sections, merges in intro/outro/media, sorts by timeline, then:
    - Sets **`voiceEnhancementTrackInstance`** (new track instance).
    - Calls **`S()`** (e.g. persist/save).
    - Shows success and NPS for SpeechEnhancement.
  - In `finally`: clears progress, clears `timelineOperationLock` only if the lock key is still `"speech enhancement"`, and runs **`F()`** (e.g. close menu).
- Updates **preferences** with `enableVoiceEnhancement: true` and returns total enhanced duration.
- **Turn off**: clears `voiceEnhancementTrack`-related state and sets `enableVoiceEnhancement: false`.

So: enhancement is “generate enhanced audio by time ranges → build voice enhancement track from URL → attach to timeline and save.”

### 1.3 User Click Flow (`handleClickVe`)

When the user turns enhancement **on** from the UI:

1. **Confirm popup (first few times)**  
   - Reads **`voiceEnhancementConfirmDisplayCount`**; if &lt; 3, the confirm popup is shown and the count is incremented.  
   - If the user **confirms**: the code that runs is the same as “turn on” (including calling `P(i)` with `i === true`).  
   - If the user **cancels**: only the cancel path runs (no enhancement).

2. **Turn on**  
   - If already at 3+ confirms (or user confirmed), it either calls the callback passed in (`o()`) or **`P(true)`**, which runs `turnOnVoiceEnhancement()` and then updates preferences to `enableVoiceEnhancement: true`.

3. **Turn off**  
   - **`P(false)`** is used when the user disables enhancement; it clears the enhancement track and sets `enableVoiceEnhancement: false`.

Beta limit is enforced: if `exceedLimit` is true and there’s no existing `voiceEnhancementTrack`, a warning is shown and enhancement is not run.

### 1.4 State and Locking

- **`voiceEnhancementProgress`**: 0–100 during generation.
- **`timelineOperationLock`**: `{ lock: true, key: "speech enhancement", noti: "<unable_to_update_any_changes>" }` while the enhancement request is in progress. Elsewhere, if the timeline is locked (e.g. this key), other operations show `n.noti` and are blocked.
- **`voiceEnhancementTrack` / `voiceEnhancementTrackInstance`**: the stored track and its editable instance (including serialization in `parse()` and when loading project with `AudioTrack` and `category: "VoiceEnhancement"`).

### 1.5 API and Backend

- **`genVoiceEnhancement`** is provided by a wrapper that uses either:
  - Minijob: `editor_voice_enhance_minijob` (e.g. `m.W().genVoiceEnhancement`).
  - Default: `s.ZP().genVoiceEnhancement` (which can be a combination of `genVoiceEnhancementV2` and `getVoiceEnhancement` via `combineMiniJobRequest`).
- Beta usage is tracked with a minijob/limit helper **`gen-voice-enhancement`** (e.g. `recordUsage`, `revertUsage`, `exceedLimit`, `maxCount`).

---

## 2. Events Fired When the User Uses Speech Enhancement

These are **analytics/telemetry** events pushed with `x.Z.getInstance().push(...)` (or the same pattern with other analytics instances). Event names and payloads are as in the bundle.

### 2.1 From the Editor (AI Enhance Panel / Toggle)

| Event name | When |
|------------|------|
| **`editor.speech_enhancement.confirm_popup`** | User is shown the “please note” confirmation dialog (before turning on). |
| **`editor.speech_enhancement.confirm_popup_confirm`** | User clicks confirm on that dialog. |
| **`editor.speech_enhancement.confirm_popup_cancel`** | User clicks cancel on that dialog. |
| **`editor.audio.enhancement`** | Fired when **turning on** enhancement from the editor: once with `{ trigger: "result_page", step: "start" }` if there was no track yet, then after `turnOnVoiceEnhancement()` with `{ trigger: "editor_page", step: "end", totalTime: <ms> }`. |
| **`editor.audio.revert_enhancement`** | User **turns off** speech enhancement (`P(false)`). |

### 2.2 From the Result Page / Quick Amend (Auto-Enable)

When the user comes from the result page with voice enhancement enabled in quick amend:

| Event name | When |
|------------|------|
| **`editor.audio.enhancement`** | `{ trigger: "result_page", step: "start" }` when starting. |
| **`editor.audio.enhancement`** | `{ trigger: "result_page", step: "end", totalTime: <ms> }` when `turnOnVoiceEnhancement()` finishes. |

(There is also an `I("AI enhance")` call that opens/focuses the “AI enhance” tab in the clip assets menu.)

### 2.3 Quickstart / Upsell

When the user hits the **speech enhancement** quickstart from the enhance-speech quickstart card:

- **`quickstart-speechEnhancement`** is used as the **trigger** in an upsell/paywall flow (e.g. when plan is FreePlan and `onBeforeSubmit` runs with `trigger: "quickstart-speechEnhancement"`). That’s not an event name by itself but the value of the `trigger` field in that flow.

### 2.4 Internal / On-Demand Process (Refine / Analysis)

This section documents **internal analytics events** fired during the background ("on-demand") process of generating voice enhancement as part of automated analysis or refinement flows (not directly initiated by the user clicking enhance). These typically include backend-driven jobs that precompute speech enhancement and log progress in the timeline/editor system for debugging and analytics purposes.

During the **refine/analysis** pipeline that can precompute voice enhancement (e.g. when building analysis result with `voiceEnhancementUrl`), these are pushed to **`editor.onDemand.process`**:

- **`editor.onDemand.process`** with `step: "genVoiceEnhancement start"` (and fullClipId, sourceId, newDuration).
- **`editor.onDemand.process`** with `step: "genVoiceEnhancement return"` and `url`.
- **`editor.onDemand.process`** with `step: "genVoiceEnhancement failed"` and `error` on failure.

---

## 3. Summary

- **Implementation**: Speech enhancement is implemented by calling `genVoiceEnhancement` with clip id, source id, and time ranges (from keyframe sections), then creating and attaching a **voice enhancement track** from the returned audio URL; preferences and track state are updated accordingly.
- **User-facing events**: The main events when the user uses the feature are **`editor.speech_enhancement.confirm_popup`**, **`editor.speech_enhancement.confirm_popup_confirm`**, **`editor.speech_enhancement.confirm_popup_cancel`**, **`editor.audio.enhancement`** (with `trigger` and `step`), and **`editor.audio.revert_enhancement`**, plus the quickstart trigger and the **`editor.onDemand.process`** steps during background generation.

---

## 4. Relevant Code References (opustimeline.js)

| Topic | Approx. line(s) |
|-------|------------------|
| SpeechEnhancement in feature list | 17431 |
| quickstart-speechEnhancement trigger | 24605 |
| AI enhance menu key / panel config | 29832–29838, 38439 |
| turnOnVoiceEnhancement (quick amend) | 38350, 38384–38396 |
| handleClickVe, confirm popup, events | 41412–41518 |
| editor.audio.enhancement / revert_enhancement | 41478–41489 |
| genVoiceEnhancement in refine flow | 37205–37210, 37511–37537 |
| voiceEnhancementTrack(Instance) state | 68948–69064, 43984–43989 |
| timelineOperationLock (speech enhancement key) | 41409–41413, 41457, 66721–66723 |
| voiceEnhancementConfirmDisplayCount | 69224–69226, 41499–41506 |
| gen-voice-enhancement minijob / limit | 14961, 39110–39117 |

