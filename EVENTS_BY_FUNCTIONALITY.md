# Execution Triggers by Functionality — Quick Reference

This document lists the **execution triggers** (non-analytics) for each editor functionality: what actually *runs* the feature — UI handlers, state changes, store actions like `createMusic`, `applyBroll`, `cleanFillerWords`, etc.

For **analytics and PubSub events** (what gets pushed/emitted when the user acts), see **`ANALYTICS_EVENTS_BY_FUNCTIONALITY.md`**.

---

## How to Read This Document

- **Functionality** = the feature (e.g. Captions, Add Music).
- **Trigger type** = kind of trigger (state, UI, drop, etc.).
- **Trigger** = the user action or condition that starts the work.
- **What it executes** = the function/thunk/action that runs (e.g. `createMusic`, `dropContinuousWords`).
- **What it means** = short explanation of the effect.

---

## 1. Captions

### Captions execution triggers (non-analytics)

Caption **display and sync** are driven by **PubSub** (engine) and **state**. The actual “work” is done by:

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Engine (PubSub)** | `firstCaptionFrameEnd`, `seekSync`, `videoTimeUpdate` | UI subscribes; updates caption highlight / playback sync | Keeps caption segment in sync with playback. |
| **Timeline click** | Click on `#CaptionTrack` segment | Handler sets `currentCaptionSegmentId`, updates `textBoxMap` (caption position at that time) | Selects caption segment on timeline; no analytics in this path. |
| **Side panel click** | Click/select text in caption panel | Reads `document.getSelection()`, resolves word IDs, calls `handleSelection`; updates `multiSelectedWordIds`, `activePopoverWordId`, `editingWordIds`, etc. | Selection and edit state for caption words. |
| **Corrections / operations** | User applies correct, timing, or caption operation from toolbar/menu | Caption track mutations (replace text, adjust timing, remove segment, etc.) + store dispatch | Edits the caption track; analytics fired separately. |
| **On-demand analysis** | Analysis pipeline (e.g. refine) | Populates or updates caption track from backend; may fire `editor.onDemand.start` / `process` / `failed` | Fills or updates captions from analysis. |
| **Preview / init** | Timeline build before real analysis | Creates mock caption section on `captionTrackInstance` with placeholder text/style | Preview of caption style before transcript exists. |

---

## 2. Add Music

### Add Music execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Drag & drop** | User drops music on timeline (type `MUSIC`) | Drop handler calls `insertMusicByCurrentTime(getState, dispatch, musicResource, dropTimeMs, "drag")` → `createMusic(...)` | Adds music section at drop time; optionally shows split popup if music longer than timeline. |
| **Button / brand template** | User adds via “add music” button or brand template with sound | `insertMusicByCurrentTime(..., musicPayload, sectionTimestamp?, "button", skipSnapshot?)`; template uses `0, "button", true` | Adds music at current time or at 0 for template; `createMusic` does the track update. |
| **Drag start** | User starts dragging music from sidebar | Sets drag context; timeline shows placeholder (duration from music or default) | UI only; actual add on drop. |
| **Track update** | Inside `createMusic` | Gets/creates `soundTrackInstance`, unshifts new section, sorts by `timeRange.timelineIn`, adds to active segments, dispatches updated track | Writes the new music section into the AudioTrack. |

---

## 3. AI Hook (Voiceover)

### AI Hook (Voiceover) execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Add AI hook (from caption menu)** | User chooses “Add AI hook” on a caption word | `tf("Voiceover")` opens Voiceover panel; analytics `editor.caption.operation` with `firstOperation: "Add AI hook"` | Opens Voiceover sidebar; user then configures and generates. |
| **Generate (in Voiceover panel)** | User configures and clicks generate | Voiceover generation API; on success, new section added to `voiceoverTrackInstance`; caption word gets `source === "voice over"` | Creates voiceover segment and links it to the caption word. |
| **Delete from word menu** | “Delete AI hook” / “Remove voice over” on a word | Resolve voiceover section by word `id` from `voiceoverTrack`; `ty([section.id])` deletes section; `eO()` (e.g. close menu) | Removes that voiceover section; no `editor.voiceover.delete` in this path. |
| **Revert (caption word)** | User chooses “Revert” for that word | `ej([word.id], text)`; `eO()` | Restores original caption text for that word. |
| **Move on timeline** | User drags voiceover segment and releases | `onMoveVoiceoverHandler`; then `takeSnapshot()` | Updates voiceover section position on track. |
| **Delete from timeline** | User deletes VoiceOver segment(s) (e.g. Delete key) | Remove sections from `voiceoverTrackInstance`; then push `editor.voiceover.delete` | Deletes voiceover at timeline level. |

---

## 4. Add Text (Text Overlay)

### Add Text execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Drag start** | User starts dragging Heading or Body text from sidebar | `eventId: TEXT_OVERLAY`, `value: "heading" \| "paragraph"`; `setOutsideDraggingSection({ trackType: "TextOverlayTrack", startMs, endMs })`; duration from `Y.Gd` (3000 ms) | Shows drop placeholder on timeline. |
| **Drop** | User drops text overlay on timeline | Drop handler: `createTextOverlaySection(textOverlayType, dropTimeMs)` → gets/creates `textOverlayTrack`, builds section via `Rq/T(type, startMs, i18n)`, pushes section, sorts, `addSegmentToActiveSegments`, `updateAllSectionsTimeline` | Creates one TextOverlay section at drop time with default content/style. |
| **Move** | User drags text overlay segment to new time | Move handler updates section position on track; `takeSnapshot()` | Updates segment timeline. |
| **Trim / extend** | User drags in/out handles on segment | Resize handler (e.g. `resizeSectionInstance`) on `textOverlayTrackInstance`; `takeSnapshot()` | Shortens or lengthens segment duration. |
| **Delete** | User deletes selected TextOverlay segment(s) | Remove sections from track (e.g. `sectionMap.get(id).delete()`); dispatch updated track | Removes text overlay from timeline. |

---

## 5. Transitions

### Transitions execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Drop** | User drops transition from sidebar onto timeline | Drop handler: `createEffect(position, transitionType)` — gets `videoEffectTrack` (or empty), builds VideoEffect section via `X.mH({ timeline: { in, out }, effectType })`, pushes section, sorts, adds to active segments, `updateAllSectionsTimeline`; `takeSnapshot()` | Adds one transition segment at drop position (default duration e.g. 300 ms). |
| **Move** | User drags transition segment to new time | `onMoveEffectHandler(segmentId)`; engine moves section; `takeSnapshot()` | Updates transition position on VideoEffectTrack. |
| **Trim / extend** | User drags left or right edge of transition | `onDragEffectEndHandler({ segId, timeOffset: { durationOffset, inOffset } })`; `resizeSectionInstance` on `videoEffectTrackInstance`; `takeSnapshot()` | Shortens (trim) or lengthens (extend) transition. |
| **Delete** | User deletes VideoEffect segment(s) | Filter by type `VideoEffect`; `videoEffectTrackInstance.sectionMap.get(segmentId).delete()`; clean track; `takeSnapshot()` | Removes transition(s) from timeline. |
| **Auto transitions** | User enables or applies auto transition (sidebar/template) | `applyCurrentAutoTransitions(effectType)`, `applyGeneratedAutoTransitions(keyframeTrack, effectType)`, `handleAutoTransitionsCheck(checked)`, or `removeAllAutoTransitions`; sets `enableAutoTransition`, `selectedTransitions` | Applies one transition type between keyframe sections or clears all. |

---

## 6. B-Roll

### B-Roll execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **State → action** | `quickGenBroll === true` | `handleCreateBrolls({ type: "GenAi", genType: "auto" })` | Auto-generates AI b-roll. |
| **UI navigation** | `openAndSwitchClipAssetsMenu("BRoll")` | Opens the BRoll sidebar panel | Enables user to start GenAi/Stock generation from the panel. |
| **Selection → UI mode** | Setting `activeClipBroll` | Opens floating submenu based on `brollType` or `brollMenuOpenType` | Selecting a b-roll segment enables replace/regenerate/crop actions. |
| **Apply (commit to track)** | User confirms/apply in UI | `applyBroll(...)` | Writes the chosen b-roll (urls/crop/keyword/prompt/etc.) into the `BRollTrack`. |
| **Generation result → append** | Generator returns sections/elements | `appendBroll(...)` (+ `updateBrollProcess(...)`) | Inserts generated b-roll into the timeline; updates progress UI. |
| **Delete** | User deletes b-roll from UI/timeline | `deleteBroll(contentIds)` | Removes b-roll from the `BRollTrack`. |
| **Normalize / init** | Before use / on load | `preprocessBrollTrack(...)`, `initBrolls(...)` | Ensures consistent b-roll track data and hydrates track instance. |

For more detail: `BROLL_IMPLEMENTATION.md` → **“Execution Triggers (Non-Analytics)”**.

---

## 7. Auto Censor

### Auto Censor execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Per-word: censor** | “Censor this instance only” or “Censor all instances” in word popover | `applyCensor(wordId)` or `applyCensorWords([word])` — sets word `type = "curse"`, masks text per `curseWordsConfig.captionMaskStyle` (Asterisks/Dashes) | Marks word(s) as curse and replaces display text. |
| **Per-word: revert** | “Undo censoring” on a word | `revertCensorWord(wordId)` — clears curse type and restores original text | Removes censor from that word. |
| **Panel: switch on** | User turns on auto censor in panel | `switchOnAutoCensor` — updates preferences (`curseWordsConfig.enabled = true`, `captionMaskStyle`, `audioMaskStyle`), `openCurseWordsPanel`, `applyCensorWords(currentCurseWords)` | Applies censor to current curse list and opens curse-words panel. |
| **Panel: switch off** | User turns off auto censor | `switchOffAutoCensor` — `revertCensorWords()`, set `curseWordsConfig.enabled = false`, `takeSnapshot()` | Reverts all censored words and disables auto censor. |

---

## 8. Remove Filler Words

### Remove Filler Words execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Button click** | User clicks “Remove filler words” (e.g. in AI enhance / Clean panel) | If not gated: push `editor.filler.remove.attempt`, then if `getCleanOperationNoti()` is true, call `cleanFillerWords()` (e.g. `ea() && eo()`) | Starts removal flow; guard blocks if timeline locked. |
| **Inside cleanFillerWords** | `cleanFillerWords` thunk runs | `fillerWordIds` from state (`M.R.fillerWordIds`); if empty → warning `no_filler_words_found` and return; else `dropContinuousWords(fillerWordIds.reverse().map(id => [id]))` — one batch per word, end-to-start | Removes each filler word’s time range from caption, keyframe, and voice tracks; then recompact, toast, NPS, `takeSnapshot()`. |
| **Shared removal** | `dropContinuousWords(batches)` | For each batch: get time range from caption track; whole section → `deleteSegmentsAndReturn` + `deleteKeyFrameSegmentByTime` + voice section `.delete()`; partial → split at boundaries, delete middle segment; then `reCompactTimeline()` on all three tracks | Actual segment removal; same thunk as Remove Pause. |

---

## 9. Remove Pause

### Remove Pause execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Single-word “Remove pause”** | User clicks “Remove pause” in word context menu | Guard `tt()`; build words to remove (multi-selection or current word); filter ids with `l.s` (pause predicate); `dropContinuousWords([batch])`; then `editor.caption.operation` (firstOperation: "Remove caption & video"), `takeSnapshot()` | Removes selected pause word(s) from caption, keyframe, and voice; one batch. |
| **“Remove all pauses”** | User clicks “Remove all pauses” | Push `editor.pause.remove.attempt`; if `getCleanOperationNoti()` then dispatch `cleanPauses()`; inside: get `silenceWords` from state (selector, filter by duration threshold), if empty show warning else `dropContinuousWords(silenceWords.reverse().map(id => [id]))`; then push `editor.pause.remove`, toast, NPS, `takeSnapshot()` | Removes all qualifying silence/pause words; same `dropContinuousWords` as single-word and as Remove Filler Words. |
| **Shared removal** | `dropContinuousWords(batches)` | Same as Remove Filler Words: per batch delete or split+delete on caption, keyframe, voice; `reCompactTimeline()` on all three | Actual segment removal. |

---

## 10. Speech Enhancement

### Speech Enhancement execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **Turn on (editor)** | User confirms in confirm popup or toggles on (after 3+ confirms) | `P(true)` / callback → `turnOnVoiceEnhancement()`: set `voiceEnhancementProgress`, `timelineOperationLock` ("speech enhancement"); `genVoiceEnhancement(fullClipId, sourceId, timeRanges)`; on result build audio track from `result.audioFile`, align with keyframe sections, set `voiceEnhancementTrackInstance`, persist, success + NPS; in `finally` clear progress and lock | Generates enhanced audio and attaches voice enhancement track. |
| **Turn off** | User disables enhancement | `P(false)` — clear `voiceEnhancementTrack`-related state, set `enableVoiceEnhancement: false` | Removes enhancement from timeline. |
| **Quick amend (result page)** | User arrives with `voiceEnhancement: true` in quick-amend config | `turnOnVoiceEnhancement()` called automatically (same as turn on) | Auto-enables enhancement when entering from result page. |
| **Confirm popup** | First few times user turns on | Show dialog; on confirm run turn-on path; on cancel no enhancement | UX gate before first use. |

---

## 11. AI Emoji, AI Keywords Highlighter & Speakers Color

### AI Emoji, Keywords & Speakers execution triggers (non-analytics)

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **AI Emoji: add** | User picks emoji for a word (e.g. from picker) | `addEmoji(...)` — push emoji element into existing section or create new section with one emoji segment; set preference `enableEmoji: true` | Adds emoji to caption word on emoji track. |
| **AI Emoji: change** | User replaces emoji in picker | `replaceEmoji(id, newSourceUri)` — find emoji by id, update `sourceUri` | Updates emoji asset for that word. |
| **AI Emoji: delete** | User removes emoji from word | `deleteEmoji(id)` — find section containing emoji, call `delete()` on element | Removes emoji from track. |
| **AI Emoji: sync** | Captions change (e.g. word removed) | `syncEmojiInOut` — keep emoji segments in sync with caption segments; remove orphans | Keeps emoji track aligned with captions. |
| **AI Keywords highlighter** | User chooses highlight color (Default, Highlight 1, etc.) on a word | Caption track / preference update for word color; `editor.caption.operation` with corresponding `firstOperation` | Sets word’s highlight color; rendering uses `enableHighlight` and word `color`. |
| **Keywords toggle** | User toggles “AI keywords highlighter” checkbox | `onUpdateExpectedPref` → `a({ enableHighlight: e })`; no dedicated analytics | Preference only; controls whether highlight colors are used. |
| **Speakers: change color** | User changes a speaker’s color in color picker | `updateSpeaker(speakerId, color)` — update `preference.speakersColor`, dispatch to `S.R.speakersColor` and preference | Updates speaker color for caption rendering when speaker detection is on. |
| **Speakers: change assignment** | User applies “change speaker” (apply to all / switch / single segment) | Handlers update caption words’ speaker assignment and optionally swap colors; push `editor.speaker_color.change_speaker` with `apply_all`, `switch_speaker` | Changes which speaker is assigned to word(s). |

---

Analytics and PubSub events (event names, payloads, Quick Lookup, Summary) are in **`ANALYTICS_EVENTS_BY_FUNCTIONALITY.md`**.
