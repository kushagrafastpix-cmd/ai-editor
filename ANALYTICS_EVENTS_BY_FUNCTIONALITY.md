# Analytics Events by Functionality — Quick Reference

This document lists **analytics and engine (PubSub) events** that are fired when a user uses each editor functionality. Use it to trace analytics/tracking or to explain what gets pushed/emitted.

For **execution triggers** (what actually runs the feature — handlers, state, store actions), see **`EVENTS_BY_FUNCTIONALITY.md`**.

---

## How to Read This Document

- **Functionality** = the feature the user is using (e.g. Captions, Add Music).
- **Event** = the event name pushed to analytics or emitted by the engine (PubSub).
- **When** = the user action or system moment that triggers the event.
- **Description** = what the event represents in plain language.

Events are grouped by **functionality**. PubSub (engine) and analytics events are in the same tables where both apply.

---

## 1. Captions

| Event | When it fires | Description |
|-------|----------------|--------------|
| **PubSub (engine)** | | |
| `firstCaptionFrameEnd` | First caption frame has been rendered. | Caption-specific “first frame ready”; used for loading/readiness. |
| `firstFrameEnd` | First frame of the video/module rendered. | Template loaded; first frame done. |
| `seekSync` | Seek completed; timeline position in sync. | Keeps caption highlight in sync after seek. |
| `videoTimeUpdate` | Playback time updated. | Syncs playback position with caption/UI. |
| `refreshEnd` | After a refresh of the engine/view. | Marks refresh done. |
| `playbackEnd` | Playback reached the end. | Can affect caption state (e.g. loop/stop). |
| `loadingStart` / `loadingEnd` | Loading started/ended. | Editor loading state. |
| `templateLoaded` | Template (project/timeline) loaded. | Enables “template loaded” state for caption UI. |
| `canPlayBack` | Engine is ready to play. | Playback (and caption sync) available. |
| **Analytics** | | |
| `user.header.click` | User clicks header to go to standalone captions tool. | Payload: `destination: "freetool-captions"`; then navigates to `/captions`. |
| `editor.caption.click` | User single-clicks a caption word in the side panel. | Payload: `{ word }`. |
| `editor.caption.double_click` | User double-clicks a caption word (edit mode). | May seek video to word time. |
| `editor.caption.correct` | User applies a correction or timing adjust. | Payload: e.g. `replace-all` / `single-correct` / `multi-correct` or `adjustTime: true`. |
| `editor.caption.operation` | User uses an action from caption/word context (edit, correct, timing, remove, emoji, split, colors, B-roll, speaker, copy/paste/cut, Add AI hook, etc.). | Payload: `firstOperation`, optional `secondOperation`, `word`, `isShortcut`. |
| `editor.caption_timing.operation` | User applies timing to caption words. | Payload: `firstOperation: "Apply timing"`. |
| `editor.onDemand.process` | Analysis returned empty caption data. | Payload: `step: "getAnalysisResult return caption is empty"`, `result`. |
| `editor.onDemand.start` | On-demand analysis (which may fill captions) started. | Payload: `mode`, `direction`. |
| `editor.onDemand.failed` | On-demand analysis failed. | Payload: `name`, `message`. |

---

## 2. Add Music

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.sidebar.click` | User clicks a sidebar tab (e.g. Music). | Payload: `featureName: "Music"`. |
| `editor.timeline.dragStart` | User starts dragging on the timeline (e.g. music item from sidebar). | Fired on drag start; actual add is tracked by `editor.music.add` on drop. |
| `editor.music.add` | User successfully adds music to the timeline (button or drag). | Payload: `musicName`, `musicGenre`, `musicStyle`, `musicDuration`, `sectionTimestamp`, `addWay` ("button" \| "drag"), `trimAuto`. |
| `editor.music.upgrade` | Shown when user doesn’t have access to Add Music. | Upsell trigger. |
| **NPS** | Right after a successful add. | `openNpsPopup(Music, { isFeatureNps: true })`. |

---

## 3. AI Hook (Voiceover)

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.caption.operation` | User chooses “Add AI hook” (or other caption ops) from word menu. | For AI hook: `firstOperation: "Add AI hook"`; also used for Remove caption, Change Speaker, colors, emoji, etc. |
| `editor.voiceover.clipGenerate` | User successfully generates voiceover in the Voiceover panel. | Payload: speaker, style, volume, screenplay, keywords, genre, language, totalTime, scriptText, etc. |
| `editor.voiceover.move` | User finishes dragging a voiceover segment on the timeline. | Fired after move and `takeSnapshot()`. |
| `editor.voiceover.delete` | User deletes one or more VoiceOver segments from the timeline (e.g. Delete key). | Not fired when deleting from caption word menu (“Delete AI hook”). |
| `editor.caption.click` / `editor.caption.double_click` | User clicks or double-clicks a caption word (can be AI hook word). | Same as captions. |
| `editor.emoji.add` / `editor.emoji.change` | User adds or changes an emoji on a word. | Same as AI emoji. |
| **Feature usage** | User selects Voiceover tab in sidebar. | Key: `editor-sidebar-voiceover`. |

---

## 4. Add Text (Text Overlay)

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.textOverlay.dragApply` | User drops a text overlay (Heading or Body) from the sidebar onto the timeline. | Payload: `textOverlayType: "heading" \| "paragraph"`. |
| `editor.textOverlay.edit` | User moves, trims, or extends a text overlay segment on the timeline. | Payload: `operationType: "move" \| "trim" \| "extend"`. |
| `editor.textOverlay.delete` | User deletes one or more selected text overlay segments. | Payload: `{}`. |

---

## 5. Transitions

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.transition.dragApply` | User drops a transition from the sidebar onto the timeline. | Payload: `{ transitionType }` (e.g. crossFade, zoomIn). |
| `editor.transition.edit` | User moves, trims, or extends a transition segment. | Payload: `operationType: "move" \| "trim" \| "extend"`. |
| `editor.transition.delete` | User deletes one or more transition segments. | Payload: `{}`. |

---

## 6. B-Roll

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.broll.upsell` | User hits quota/plan limit and upsell is shown (e.g. “Upgrade for B-Roll”). | Payload: `{}`. |
| `editor.broll.sentence` | B-roll was generated from selected words (AI or Stock by selection). | Payload: `type`, `brollTrack`, `words`, platform. |
| `editor.broll.notFound` | No b-roll was generated (e.g. “try regenerating”). | Payload: `type`, optional `insertType`, `words`. |
| `editor.broll.genAI` | User starts GenAi b-roll generation. | Payload: `projectId`, `clipId`, optional `genType`, platform. |
| `editor.broll.stock` | User starts Stock b-roll generation. | Payload: same shape as genAI. |
| `editor.broll.error` | Applying/using b-roll fails (e.g. download error). | Payload: `errorMessage`, `errorName`, `brollType`. |
| `editor.broll.renderTime` | After a full b-roll generation run. | Payload: `totalMs`, `brollType`, `requestMs`, `downloadMs`, `brollCount`. |
| `editor.broll.drag` | User drags the b-roll crop area (position/size). | Payload: `{ broll }`. |
| `editor.broll.move` | User moves a b-roll segment on the timeline. | Payload: `type`, `timeDuration`. |
| `editor.broll.extend` | User extends a b-roll segment (longer duration). | Payload: `timeRange`, `brollType`. |
| `editor.broll.trim` | User trims a b-roll segment (shorter duration). | Payload: `timeRange`, `brollType`. |
| `editor.broll.moveRenderTime` | After a move/extend/trim interaction. | Payload: `move`, `extend`, `trim` (times). |
| `editor.click.crop` | User interacts with b-roll crop UI. | Payload: `type: "click" \| "double-click" \| "X"`. |

---

## 7. Auto Censor

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.auto_censor.apply` | User applies censor (per word or via “Switch on” auto censor). | Per word: `firstOperation`, `secondOperation` (e.g. "censor only"), `wordName`. Panel: `captionStyle`, `audioType`. Followed by CensorWords feature NPS. |
| `editor.auto_censor.revert` | User undoes censoring for a single word (“Undo censoring”). | Payload: `firstOperation: "undo censoring"`, `wordName`. |

---

## 8. Remove Filler Words

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.filler.remove.attempt` | User clicks “Remove filler words” (before guard or removal). | Records that the user tried; no payload. |
| `editor.filler.remove` | Filler words were found and removed successfully. | Fired inside `cleanFillerWords` after `dropContinuousWords`. Success toast and NPS for RemoveFillerWords follow. |

**Note:** If guard fails or there are no filler words, only `editor.filler.remove.attempt` is fired; `editor.filler.remove` is not.

---

## 9. Remove Pause

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.caption.operation` | User clicks “Remove pause” on a **single** word (or selection) in the word menu. | Payload: `firstOperation: "Remove caption & video"`, `word`, `wordText`. |
| `editor.pause.remove.attempt` | User clicks “Remove all pauses” (before guard and cleanup). | Payload: `via: "captionOperation"`. |
| `editor.pause.remove` | All qualifying pauses were removed successfully (“Remove all pauses”). | Fired after `dropContinuousWords`; then success toast, NPS for Remove Pauses, and snapshot. |

---

## 10. Speech Enhancement

| Event | When it fires | Description |
|-------|----------------|--------------|
| `editor.speech_enhancement.confirm_popup` | User is shown the “please note” confirmation dialog before turning on. | First few times only. |
| `editor.speech_enhancement.confirm_popup_confirm` | User clicks confirm on that dialog. | Proceeds to turn on enhancement. |
| `editor.speech_enhancement.confirm_popup_cancel` | User clicks cancel on that dialog. | No enhancement. |
| `editor.audio.enhancement` | User turns on enhancement from editor, or from result page (quick amend). | Payload: `trigger: "editor_page" \| "result_page"`, `step: "start" \| "end"`, optional `totalTime`. |
| `editor.audio.revert_enhancement` | User turns off speech enhancement. | Payload: `{}`. |
| `editor.onDemand.process` | Background voice enhancement (refine/analysis pipeline). | Steps: `genVoiceEnhancement start`, `genVoiceEnhancement return` (with `url`), `genVoiceEnhancement failed` (with `error`). |

---

## 11. AI Emoji, AI Keywords Highlighter & Speakers Color

| Event | When it fires | Description |
|-------|----------------|--------------|
| **AI Emoji** | | |
| `editor.emoji.add` | User adds an emoji to a word (e.g. from picker). | Payload: `word`, `emoji`. |
| `editor.emoji.change` | User replaces an emoji in the picker. | Payload: `emoji`, `newEmoji`. |
| **AI Keywords Highlighter** | | |
| `editor.caption.operation` | User chooses a highlight color (Default font color, Highlight color 1, etc.). | Payload: `firstOperation`: "Default font color", "Highlight color 1", "Highlight color 2", etc. |
| **Speakers Color** | | |
| `editor.speaker_color.change_color` | User changes a speaker’s color in the color picker. | Payload: `speakerId`, `color`. |
| `editor.speaker_color.change_speaker` | User changes which speaker is assigned (apply to all / switch speaker / single segment). | Payload: `apply_all: true \| false`, `switch_speaker: true \| false`. |

---

## Quick Lookup: Event → Functionality

| Event name | Functionality |
|------------|----------------|
| `user.header.click` (freetool-captions) | Captions |
| `editor.caption.*` | Captions, AI Hook, AI Keywords |
| `editor.caption_timing.operation` | Captions |
| `editor.music.*`, `editor.sidebar.click` (Music), `editor.timeline.dragStart` | Add Music |
| `editor.voiceover.*` | AI Hook |
| `editor.textOverlay.*` | Add Text |
| `editor.transition.*` | Transitions |
| `editor.broll.*`, `editor.click.crop` | B-Roll |
| `editor.auto_censor.*` | Auto Censor |
| `editor.filler.*` | Remove Filler Words |
| `editor.pause.*` | Remove Pause |
| `editor.speech_enhancement.*`, `editor.audio.enhancement`, `editor.audio.revert_enhancement` | Speech Enhancement |
| `editor.emoji.*` | AI Emoji |
| `editor.speaker_color.*` | Speakers Color |
| `editor.onDemand.process` / `editor.onDemand.start` / `editor.onDemand.failed` | Captions, Speech Enhancement (and other on-demand flows) |

---

## Summary for Explaining to Someone

1. **Captions** — Clicks and edits in the caption panel, timeline clicks on caption segments, corrections, and operations (edit/correct/timing/remove/emoji/B-roll/speaker/AI hook, etc.) all fire analytics events; engine (PubSub) events keep playback and caption frame in sync.
2. **Add Music** — Opening the Music tab, starting a drag, and actually adding music (button or drag) each have their own events; upgrade and NPS are tied to add.
3. **AI Hook** — Adding from menu, generating in panel, moving/deleting on timeline, and related caption/emoji actions are tracked.
4. **Add Text** — Drag-apply, edit (move/trim/extend), and delete for text overlays.
5. **Transitions** — Drag-apply, edit (move/trim/extend), and delete for transitions.
6. **B-Roll** — Start (GenAi/Stock), result (sentence/notFound/error/renderTime), timeline edits (move/extend/trim/drag), crop UI, and upsell.
7. **Auto Censor** — Apply (per word or panel) and revert (per word).
8. **Remove Filler Words** — Attempt on button click, then success event when removal completes.
9. **Remove Pause** — Single-word removal uses caption operation; “Remove all pauses” uses attempt + success.
10. **Speech Enhancement** — Confirm popup (show/confirm/cancel), turn on/off (enhancement / revert_enhancement), and on-demand process steps.
11. **AI Emoji / Keywords / Speakers** — Emoji add/change, caption operation for highlight colors, speaker color change and speaker assignment.

All of these events are fired when the user (or the system in the case of engine/on-demand) performs the corresponding action; they are used for analytics, feature tracking, and NPS where noted.
