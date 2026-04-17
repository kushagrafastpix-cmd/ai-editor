# AI Hook Functionality in opustimeline.js

This document explains how the **AI hook** (voiceover) functionality is implemented in `opustimeline.js` and which analytics/events are fired when the user interacts with it.

---

## 1. What is “AI Hook”?

- **AI hook** is the user-facing label for the **Voiceover** feature: AI-generated voice-over for caption segments.
- The same feature appears as **“AI hook”** when `enableNewAiHook` is `true` (new UX), and as **“Voiceover”** / **“function_voiceover”** in the legacy path.
- It is backed by a **VoiceOverTrack** in the timeline and a **Voiceover** sidebar panel.

---

## 2. Implementation Overview

### 2.1 Feature key and usage limits

- **Feature key:** `gen-voiceover-ai` (used for usage/limit tracking).
- A dedicated usage helper is created with `new u("gen-voiceover-ai")` and provides:
  - `recordUsage` / `revertUsage`
  - `getUsageCount`
  - `exceedLimit` (e.g. after 20 uses in the period)
  - `usageHint` (e.g. “account_limit_in_beta_10”).

### 2.2 Sidebar and panel

- **Sidebar tab:** The editor has a tab that opens the Voiceover panel. It is identified by:
  - **Key:** `"Voiceover"`
  - **Description:** `"AI hook"` (in the panel mapping).
  - **Feature-used key:** `"editor-sidebar-voiceover"` (for analytics when the user selects this tab).
- **Panel component:** Loaded dynamically (e.g. chunk `39857`). When the user selects the Voiceover tab, `clipAssetsSideBarSelectedTab` is set to `"Voiceover"` and the Voiceover panel is shown.

### 2.3 Config flags  

- **`enableNewAiHook`** (under `section`):
  - `false` in the legacy layout (e.g. `enableNewAudioHeight: false`).
  - `true` in the new layout (e.g. `enableNewAudioHeight: true`).
- When `enableNewAiHook` is true, the UI uses the “AI hook” copy (e.g. `common:ai_hook`, `ai_hook_loading`, `button_delete_ai_hook`). Otherwise it uses voiceover copy (e.g. `button_remove_voice_over`, `voice_over_loading`).

### 2.4 Data model

- **Voiceover track:** `voiceoverTrack` / `voiceoverTrackInstance` (store keys like `es.XU.voiceoverTrack`, `L.XU.voiceoverTrackInstance`).
- **Caption words from voiceover:** Caption text elements that come from this feature have **`source === "voice over"`** (or `"voice over"` in checks). The context menu shows different actions for these (e.g. “Delete AI hook” vs “Remove voice over” depending on `enableNewAiHook`).
- **Matching:** A caption word’s `id` is used to find the corresponding section on the voiceover track via helpers like `(0, ep.cw)(voiceoverTrack, word.id)`.

### 2.5 Main user flows

1. **Add AI hook (from caption context menu)**  
   User right-clicks a caption word and chooses the “Add AI hook” action. The code:
   - Calls `tf("Voiceover")` to open the Voiceover sidebar panel.
   - Pushes **`editor.caption.operation`** with **`firstOperation: "Add AI hook"`** (see events below).

2. **Generate voiceover (in Voiceover panel)**  
   User configures speaker, style, etc. and generates. After generation, **`editor.voiceover.clipGenerate`** is pushed with detailed payload (speaker, style, volume, screenplay, etc.).

3. **Delete AI hook (from caption word menu)**  
   For a word with `source === "voice over"`, the context menu shows “Delete AI hook” (or “Remove voice over”). The handler:
   - Resolves the voiceover section by word `id` from `voiceoverTrack`.
   - Calls `ty([section.id])` to delete that section and then `eO()` (e.g. close menu / refresh).  
   There is **no separate analytics event** in this path; deletion from the **timeline** is tracked with **`editor.voiceover.delete`** (see below).

4. **Revert (caption word)**  
   “Revert” for that word calls `ej([word.id], text)` and `eO()` (no extra event listed here).

5. **Move voiceover on timeline**  
   When the user drags a voiceover section and releases:
   - `onMoveVoiceoverHandler` runs, then `takeSnapshot()`.
   - **`editor.voiceover.move`** is pushed.

6. **Delete voiceover from timeline**  
   When one or more **VoiceOver** segments are removed from the timeline (e.g. via delete key or timeline action), the code deletes the corresponding sections from the voiceover track instance and then pushes **`editor.voiceover.delete`**.

---

## 3. Events Fired (Analytics / Tracking)

All events below are pushed via an analytics singleton (e.g. `eA.Z.getInstance().push(...)` or `g.Z.getInstance().push(...)` or `T.Z.getInstance().push(...)` / `B.Z.getInstance().push(...)`). The exact variable name differs by bundle chunk but the event names are as below.

### 3.1 Caption / AI hook actions (caption context menu)

| Event name                     | When it’s fired |
|--------------------------------|------------------|
| **`editor.caption.operation`** | User uses an operation from the caption/word context menu. For AI hook specifically: |
| → `firstOperation: "Add AI hook"` | User clicks **“Add AI hook”** in the caption word menu. Right before this, `tf("Voiceover")` is called to open the Voiceover panel. |
| → `firstOperation: "Remove caption"` | User removes caption (can include AI-hook words). Payload can include `word`, `wordText`. |
| → `firstOperation: "Remove caption & video"` | User removes caption and video. Payload can include `word`, `wordText`. |
| → `firstOperation: "Change Speaker"` | User changes speaker (e.g. from color/speaker list). For AI hook words this can include `secondOperation: <speaker name>`. |
| → `firstOperation: "Default font color"` / `"Highlight color 1"` / `"Highlight color 2"` | User changes font/highlight color (available for AI hook words in the “voice over” branch of the menu). |
| → `firstOperation: "Add emoji"` | User adds emoji (can be on AI hook words). |

Optional payload shape for these: `{ platform: { MP: true, SS: true } }` and operation-specific fields (`word`, `wordText`, `secondOperation`, etc.).

### 3.2 Voiceover lifecycle (panel and timeline)

| Event name                       | When it’s fired |
|----------------------------------|------------------|
| **`editor.voiceover.clipGenerate`** | After the user successfully generates voiceover in the Voiceover panel. Payload includes: `speakerVoice`, `scriptStyle`, `voFrequency`, `originalAudioVolume`, optional `keywordsAdded`, `hasScreenplay`, `genre`, `subgenre`, `language`, `totalTime`, `scriptText`, plus `platform: { MP: true, SS: true }`. |
| **`editor.voiceover.move`**       | User finishes dragging a voiceover segment on the timeline (`onDragEnd`), after `takeSnapshot()`. Payload: `{}` with `platform: { MP: true, SS: true }`. |
| **`editor.voiceover.delete`**     | User deletes one or more **VoiceOver** segments from the timeline (e.g. multi-select delete). Fired after the corresponding sections are removed from the voiceover track instance. Payload: `{}` with `platform: { MP: true, SS: true }`. |

Note: Deleting the AI hook **from the caption word context menu** (“Delete AI hook” / “Remove voice over”) does **not** fire `editor.voiceover.delete`; that event is only for timeline-level deletion.

### 3.3 Other caption events (can involve AI hook words)

| Event name                     | When it’s fired |
|--------------------------------|------------------|
| **`editor.caption.click`**     | User clicks a caption word. Payload can include `word`. |
| **`editor.caption.double_click`** | User double-clicks a caption word. |
| **`editor.emoji.add`**         | User adds an emoji to a word. Payload includes `word`, `emoji`. |
| **`editor.emoji.change`**      | User changes an emoji. Payload includes `emoji`, `newEmoji`. |

### 3.4 Feature usage (sidebar)

- When the user selects the **Voiceover** tab in the assets/sidebar, the UI is wired to record **feature usage** under the key **`editor-sidebar-voiceover`** (via `featureUsedKey`). This is used for “feature used” tracking (e.g. `V.Z.featureUsed("editor-sidebar-voiceover")`), not necessarily a single push event like the ones above.

---

## 4. UI Copy and Conditions

- **Button labels:** For a caption word with `source === "voice over"`:
  - If “new AI hook” UX: **“Delete AI hook”** (`button_delete_ai_hook`).
  - Else: **“Remove voice over”** (`button_remove_voice_over`).
- **Loading state:** When voiceover is generating, the sidebar can show a percentage (e.g. “X %”) and use `ai_hook_loading` or `voice_over_loading` depending on `enableNewAiHook`.
- **Voiceover panel title:** The panel itself is titled “AI voice-over” in the code; the sidebar tab shows “AI hook” (new UX) or “Voiceover” (legacy).

---

## 5. Summary Table: Events and AI Hook

| User action                         | Event(s) / tracking |
|-------------------------------------|----------------------|
| Click “Add AI hook” in word menu    | `editor.caption.operation` (`firstOperation: "Add AI hook"`); Voiceover panel opens. |
| Generate voiceover in panel         | `editor.voiceover.clipGenerate` (with speaker, style, script, etc.). |
| Move voiceover block on timeline    | `editor.voiceover.move`. |
| Delete voiceover block(s) on timeline | `editor.voiceover.delete`. |
| “Delete AI hook” / “Remove voice over” from word menu | No dedicated event; section is removed via `ty([section.id])`. |
| Change speaker / colors / emoji on AI hook word | `editor.caption.operation` (with corresponding `firstOperation`) or `editor.emoji.add` / `editor.emoji.change`. |
| Select Voiceover tab in sidebar    | Feature usage key `editor-sidebar-voiceover`. |

This matches the implementation and event flow for the AI hook (voiceover) feature as found in `opustimeline.js`.
