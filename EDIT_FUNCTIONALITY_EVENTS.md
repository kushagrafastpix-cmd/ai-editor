# Edit Functionality Events - Execution Triggers

This document maps edit functionalities to the events that trigger their execution in opustimeline.js. These are **functional events** that cause the system to take action, NOT analytics events.

---

## 1. Split/Cut/Trim Video

### Event Names:
- `editor.timeline.split`

### Events & Triggers:
- **Keyboard: `D` key** → Triggers: `splitSegmentsHandler("D")` → Dispatches: `editor.timeline.split`
- **Keyboard: `Cmd/Ctrl+B`** → Triggers: `splitSegmentsHandler("CMD_B")` → Dispatches: `editor.timeline.split`
- **Keyboard: `Cmd/Ctrl+X`** → Triggers: `cutSelection(true)`
- **Keyboard: `Backspace/Delete`** → Triggers: `deleteSegmentsHandler({ via: "Backspace", position: "Selected" })`
- **Mouse: Split button in caption context menu** → Triggers: `splitSegmentsHandler("Mouse-caption")` → Dispatches: `editor.timeline.split`
- **Mouse: Split and trim button** → Triggers: `splitSegmentsHandler` with split operation → Dispatches: `editor.timeline.split`

### Handler Functions:
- `splitSegmentsHandler` (line ~31313)
- `cutSelection` (line ~31317)
- `deleteSegmentsHandler` (line ~31313)

### Execution Flow:
1. User presses key or clicks button
2. Keyboard/mouse handler calls the appropriate split/cut/delete handler
3. Handler processes selected segments
4. Timeline updates and snapshot taken for undo/redo

---

## 2. Remove Pauses

### Event Names:
- `editor.pause.remove.attempt` - Fired when attempting to remove pauses
- `editor.pause.remove` - Fired when pauses are successfully removed

### Events & Triggers:
- **Mouse: Remove pause button in word context menu** → Triggers: `dropContinuousWords([batch])` → Dispatches: `editor.pause.remove`
- **Mouse: Remove all pauses button** → Triggers: `cleanPauses()` → `dropContinuousWords(silenceWords.reverse().map(id => [id]))` → Dispatches: `editor.pause.remove.attempt`, `editor.pause.remove`

### Handler Functions:
- `cleanPauses` (line ~46763)
- `dropContinuousWords` (line ~46719)

### Execution Flow:
1. User clicks remove pause button
2. Guard check via `timelineLockDetectAndNoti()`
3. `cleanPauses()` called
4. `dropContinuousWords()` removes segments from caption, keyframe, and voice tracks
5. `reCompactTimeline()` updates timeline
6. `takeSnapshot()` saves state

---

## 3. Remove Filler Words

### Event Names:
- `editor.filler.remove` - Fired when filler words are removed

### Events & Triggers:
- **Mouse: Remove filler words button** → Triggers: `cleanFillerWords()` → `dropContinuousWords(fillerWordIds.reverse().map(id => [id]))` → Dispatches: `editor.filler.remove`
- **Mouse: Remove single filler word (word context menu)** → Triggers: `dropContinuousWords([wordId])` → Dispatches: `editor.filler.remove`

### Handler Functions:
- `cleanFillerWords` (line ~50334)
- `dropContinuousWords` (line ~46719)

### Execution Flow:
1. User clicks remove filler words button
2. Guard check via `timelineLockDetectAndNoti()`
3. `cleanFillerWords()` called
4. `dropContinuousWords()` removes filler word segments from tracks
5. `reCompactTimeline()` updates timeline
6. `takeSnapshot()` saves state

---

## 4. Add Text Overlays

### Event Names:
- `editor.textOverlay.dragApply` - Fired when text overlay is dropped on timeline
- `editor.textOverlay.edit` - Fired when text overlay is edited/moved/resized
- `editor.textOverlay.delete` - Fired when text overlay is deleted

### Events & Triggers:
- **Drag Start: Text overlay from sidebar** → Triggers: `setOutsideDraggingSection({ trackType: "TextOverlayTrack", startMs, endMs })`
  - EventId: `TEXT_OVERLAY`
  - Value: `"heading"` or `"paragraph"`
- **Drop: Text overlay on timeline** → Triggers: `createTextOverlaySection(textOverlayType, dropTimeMs)` → Dispatches: `editor.textOverlay.dragApply`
- **Edit: Move/resize text overlay** → Dispatches: `editor.textOverlay.edit`
- **Delete: Remove text overlay** → Dispatches: `editor.textOverlay.delete`

### Handler Functions:
- `createTextOverlaySection` (line ~64549)
- `onMoveSectionFromOutsideHandler` (line ~64549)
- `onMoveSectionFromOutsideEndHandler` (line ~64549)

### Execution Flow:
1. User drags text overlay element from sidebar
2. Timeline shows placeholder during drag
3. On drop, `createTextOverlaySection()` creates new text overlay section
4. Section added to `textOverlayTrackInstance`
5. Timeline updates with new text overlay

---

## 5. Add Music/Audio

### Event Names:
- `editor.music.add` - Fired when music is added to timeline
- `editor.music.upgrade` - Fired when music upgrade is triggered

### Events & Triggers:
- **Drag & Drop: Music from sidebar to timeline** → Triggers: `insertMusicByCurrentTime(getState, dispatch, musicResource, dropTimeMs, "drag")` → `createMusic(...)` → Dispatches: `editor.music.add`
- **Mouse: Add music button** → Triggers: `insertMusicByCurrentTime(..., musicPayload, sectionTimestamp?, "button", skipSnapshot?)` → Dispatches: `editor.music.add`

### Handler Functions:
- `insertMusicByCurrentTime` (line ~53285, ~64549, ~66865)
- `createMusic` (line ~66813)

### Execution Flow:
1. User drops music or clicks add music button
2. `insertMusicByCurrentTime()` called with music resource
3. If music longer than timeline, shows split popup (`showAddMusicSplitPopup`)
4. `createMusic()` adds section to `soundTrackInstance`
5. Track sorted and dispatched to update UI

---

## 6. Add Transitions

### Event Names:
- `editor.transition.dragApply` - Fired when transition is dropped on timeline
- `editor.transition.edit` - Fired when transition is edited/moved/resized
- `editor.transition.delete` - Fired when transition is deleted

### Events & Triggers:
- **Drag & Drop: Transition from sidebar to timeline** → Triggers: `createEffect(position, transitionType)` → Dispatches: `editor.transition.dragApply`
- **Drag Move: Repositioning transition** → Triggers: `onMoveEffectHandler` → Dispatches: `editor.transition.edit`
- **Drag End: Trimming/extending transition** → Triggers: `onDragEffectEndHandler` → Dispatches: `editor.transition.edit`
- **Delete: Remove transition** → Dispatches: `editor.transition.delete`

### Handler Functions:
- `createEffect` (line ~64549)
- `onMoveEffectHandler`
- `onDragEffectEndHandler`

### Execution Flow:
1. User drops transition from sidebar onto timeline
2. `createEffect()` creates new VideoEffect section
3. Section added to `videoEffectTrackInstance`
4. `takeSnapshot()` saves state for undo/redo

---

## 7. Caption Editing

### Event Names:
- `editor.caption.click` - Fired when caption segment is clicked
- `editor.caption.double_click` - Fired when caption is double-clicked
- `editor.caption.correct` - Fired when caption text is corrected/edited
- `editor.caption.operation` - Fired for various caption operations (trim, split, merge, etc.)
- `editor.caption_timing.operation` - Fired when caption timing is adjusted

### Events & Triggers:
- **Mouse: Click caption segment** → Triggers: Sets `currentCaptionSegmentId`, updates `textBoxMap` → Dispatches: `editor.caption.click`
- **Mouse: Double-click caption** → Dispatches: `editor.caption.double_click`
- **Context Menu: Split section** → Triggers: `splitSegmentsHandler("Mouse-caption")` → Dispatches: `editor.caption.operation`
- **Context Menu: Set as Start** → Triggers: `trimCaption(t, "start")` → Dispatches: `editor.caption.operation`
- **Context Menu: Set as End** → Triggers: `trimCaption(t, "end")` → Dispatches: `editor.caption.operation`
- **Context Menu: Edit words** → Triggers: `handleWordEditing()` → Dispatches: `editor.caption.correct`
- **Context Menu: Remove caption** → Triggers: `batchedReviseWord()` → Dispatches: `editor.caption.operation`
- **Timing adjustment** → Dispatches: `editor.caption_timing.operation`

### Handler Functions:
- `trimCaption` (line ~46719)
- `handleWordEditing` (line ~46763)
- `batchedReviseWord` (line ~46721)

### Execution Flow:
1. User interacts with caption segment (click or context menu)
2. Appropriate handler called based on action
3. Caption track updated with changes
4. Timeline reflects updates

---

## 8. Add B-Roll

### Event Names:
- `editor.broll.sentence` - Fired when b-roll is applied per sentence
- `editor.broll.genAI` - Fired when AI-generated b-roll is created
- `editor.broll.stock` - Fired when stock b-roll is applied
- `editor.broll.drag` - Fired when b-roll is dragged
- `editor.broll.move` - Fired when b-roll is moved on timeline
- `editor.broll.extend` - Fired when b-roll duration is extended
- `editor.broll.trim` - Fired when b-roll is trimmed
- `editor.broll.upsell` - Fired when b-roll upgrade prompt shown
- `editor.broll.error` - Fired when b-roll operation fails
- `editor.broll.notFound` - Fired when no b-roll found for selection
- `editor.broll.renderTime` - Fired to track b-roll render time
- `editor.broll.moveRenderTime` - Fired to track b-roll move render time

### Events & Triggers:
- **Mouse: Apply b-roll button** → Triggers: `applyBroll(...)` → Dispatches: `editor.broll.sentence`, `editor.broll.genAI` or `editor.broll.stock`
- **Mouse: Append b-roll button** → Triggers: `appendBroll(...)` → Dispatches: `editor.broll.sentence`
- **Mouse: Create AI b-rolls** → Triggers: `handleCreateBrolls({ type: "GenAi", genType: "auto" })` → Dispatches: `editor.broll.genAI`
- **Drag & Drop: B-roll media** → Triggers: `insertMediaResource(...)` → Dispatches: `editor.broll.drag`
- **Move: Reposition b-roll** → Dispatches: `editor.broll.move`
- **Resize: Extend/trim b-roll** → Dispatches: `editor.broll.extend` or `editor.broll.trim`

### Handler Functions:
- `applyBroll` (line ~35315)
- `handleAppendBrolls` (line ~46754)
- `insertMediaResource` (line ~53285)

### Execution Flow:
1. User selects/applies b-roll from panel or drags media
2. `applyBroll()`, `appendBroll()`, or `insertMediaResource()` called
3. B-roll sections added to `BRollTrack`
4. Timeline updates with b-roll segments

---

## 9. Add Video Effects

### Event Names:
- Same as transitions (Video effects and transitions use the same event system)
- `editor.transition.dragApply` - Fired when effect is dropped on timeline
- `editor.transition.edit` - Fired when effect is edited/moved/resized
- `editor.transition.delete` - Fired when effect is deleted

### Events & Triggers:
- **Drag & Drop: Effect from sidebar** → Triggers: `createEffect(position, effectType)` → Dispatches: `editor.transition.dragApply`
- **Drag Move: Repositioning effect** → Triggers: `onMoveEffectHandler` → Dispatches: `editor.transition.edit`
- **Drag End: Resizing effect** → Triggers: `onDragEffectEndHandler` → Dispatches: `editor.transition.edit`

### Handler Functions:
- `createEffect` (line ~64549)
- `onMoveEffectHandler`
- `onDragEffectEndHandler`

### Execution Flow:
1. User drops effect from sidebar
2. `createEffect()` creates effect section
3. Section added to `VideoEffectTrack`
4. Timeline updates

---

## 10. Copy/Paste/Cut Operations

### Event Names:
- `editor.caption.operation` - Fired for copy/paste/cut operations (shared with caption operations)

### Events & Triggers:
- **Keyboard: `Cmd/Ctrl+C` (Copy)** → Triggers: `createSectionFromSelectedWords(true)` → Dispatches: `editor.caption.operation`
- **Keyboard: `Cmd/Ctrl+V` (Paste)** → Triggers: `pasteSection(true)` → Dispatches: `editor.caption.operation`
- **Keyboard: `Cmd/Ctrl+X` (Cut)** → Triggers: `cutSelection(true)` → Dispatches: `editor.caption.operation`

### Handler Functions:
- `createSectionFromSelectedWords` (line ~31317, ~46723)
- `pasteSection` (line ~31317, ~46723)
- `cutSelection` (line ~31317, ~46723)

### Execution Flow:
1. User selects segments on timeline
2. Copy/Cut stores selection in clipboard
3. Paste inserts stored segments at current position
4. Timeline updates and snapshot taken

---

## 11. Delete/Remove Elements

### Event Names:
- `editor.voiceover.delete` - Fired when voiceover is deleted
- `editor.transition.delete` - Fired when transition/effect is deleted
- `editor.textOverlay.delete` - Fired when text overlay is deleted
- `editor.caption.operation` - Fired when captions/segments are deleted

### Events & Triggers:
- **Keyboard: `Backspace` or `Delete`** → Triggers: `deleteSegmentsHandler({ via: "Backspace", position: "Selected" })` → Dispatches: `editor.caption.operation`
- **Context Menu: Delete voiceover** → Triggers: `deleteVoiceover()` → Dispatches: `editor.voiceover.delete`
- **Context Menu: Delete b-roll** → Triggers: `deleteBroll()`
- **Context Menu: Delete transition** → Dispatches: `editor.transition.delete`
- **Context Menu: Delete text overlay** → Dispatches: `editor.textOverlay.delete`
- **Context Menu: Delete from word menu** → Triggers: Various delete handlers based on element type → Dispatches respective delete events

### Handler Functions:
- `deleteSegmentsHandler` (line ~31313)
- `deleteVoiceover` (line ~46792)
- `deleteBroll`

### Execution Flow:
1. User selects elements and presses Delete key or uses context menu
2. `deleteSegmentsHandler()` or specific delete handler called
3. Segments removed from respective tracks (caption, voice, b-roll, etc.)
4. `takeSnapshot()` saves state

---

## 12. Crop/Resize Video

### Event Names:
- `editor.click.crop` - Fired when crop tool is clicked/activated
- `editor.move.crop` - Fired when crop area is moved
- `editor.resize.crop` - Fired when crop area is resized
- `editor.move.target` - Fired when video target is moved
- `editor.resize.target` - Fired when video target is resized
- `editor.multiSelect.moveCrop` - Fired when moving crop with multiple items selected
- `editor.multiSelect.resizeCrop` - Fired when resizing crop with multiple items selected
- `editor.multiSelect.clickCrop` - Fired when clicking crop with multiple items selected
- `editor.multiSelect.moveTarget` - Fired when moving target with multiple items selected
- `editor.multiSelect.resizeTarget` - Fired when resizing target with multiple items selected

### Events & Triggers:
- **Keyboard: `X` key** → Triggers: Crop mode activation → Dispatches: `editor.click.crop`
- **Mouse: Crop tool drag** → Triggers: `cropAreaRectWithRedoUndo` → Dispatches: `editor.move.crop`
- **Mouse: Crop tool resize** → Dispatches: `editor.resize.crop`
- **Mouse: Move video target** → Dispatches: `editor.move.target`
- **Mouse: Resize video target** → Dispatches: `editor.resize.target`
- **Mouse: Resize timeline elements** → Triggers: `onResize` handlers

### Handler Functions:
- `cropAreaRectWithRedoUndo` (line ~31324)
- `onResize` handlers (line ~30081, ~30237)

### Execution Flow:
1. User presses `X` key or activates crop tool
2. Crop handlers activate for crop area
3. Crop area dimensions updated
4. Timeline reflects crop changes

---

## 13. Undo/Redo

### Event Names:
- No specific analytics events for undo/redo operations (internal state management)

### Events & Triggers:
- **Keyboard: `Cmd/Ctrl+Z` (Undo)** → Triggers: `undo()`
- **Keyboard: `Cmd/Ctrl+Shift+Z` (Redo)** → Triggers: `redo()`

### Handler Functions:
- `undo()` (line ~31343, ~30480)
- `redo()` (line ~31350, ~30493)

### Execution Flow:
1. User presses undo/redo keyboard shortcut
2. `undo()` or `redo()` called
3. Timeline state reverted/restored from snapshot history
4. UI updates to reflect state change

---

## 14. Timeline Navigation

### Event Names:
- `editor.timeline.playhead_change` - Fired when playhead position changes

### Events & Triggers:
- **Keyboard: `1` or `Home`** → Triggers: `seekToStartHandler("1")` or `seekToStartHandler("Home")` → Dispatches: `editor.timeline.playhead_change`
- **Keyboard: `End`** → Triggers: `seekToEndHandler("End")` → Dispatches: `editor.timeline.playhead_change`
- **Keyboard: `Left Arrow`** → Triggers: `updateTimeHandler(undefined, "backward")` → Dispatches: `editor.timeline.playhead_change`
- **Keyboard: `Right Arrow`** → Triggers: `updateTimeHandler(undefined, "forward")` → Dispatches: `editor.timeline.playhead_change`
- **Mouse: Click timeline** → Dispatches: `editor.timeline.playhead_change`

### Handler Functions:
- `seekToStartHandler` (line ~31396, ~31403)
- `seekToEndHandler` (line ~31410)
- `updateTimeHandler` (line ~31447, ~31456)

### Execution Flow:
1. User presses navigation key
2. Handler updates playhead position
3. Video seeks to new position
4. Timeline updates

---

## 15. Timeline Scale/Zoom

### Event Names:
- `editor.timeline.zoom` - Fired when timeline zoom level changes

### Events & Triggers:
- **Keyboard: `+` (Zoom In)** → Triggers: `timeScaleChangeHandler({ delta: m.RC }, { via: "+" })` → Dispatches: `editor.timeline.zoom`
- **Keyboard: `-` (Zoom Out)** → Triggers: `timeScaleChangeHandler({ delta: -m.RC }, { via: "-" })` → Dispatches: `editor.timeline.zoom`
- **Keyboard: `\` (Reset Zoom)** → Triggers: `initTimelineScale(true)` → Dispatches: `editor.timeline.zoom`
- **Mouse: Scroll to zoom** → Dispatches: `editor.timeline.zoom`

### Handler Functions:
- `timeScaleChangeHandler` (line ~31417, ~31429)
- `initTimelineScale` (line ~31440)

### Execution Flow:
1. User presses zoom key
2. Handler adjusts timeline scale
3. Timeline view zooms in/out or resets
4. UI reflects new scale

---

## 16. Play/Pause

### Event Names:
- `editor.playing.loading` - Fired when video is loading during playback

### Events & Triggers:
- **Keyboard: `Space`** → Triggers: `playOrPauseHandler()`
- **Video loading** → Dispatches: `editor.playing.loading`

### Handler Functions:
- `playOrPauseHandler()` (line ~31357)

### Execution Flow:
1. User presses spacebar
2. `playOrPauseHandler()` toggles playback state
3. Video plays or pauses
4. UI updates play button state

---

## 17. Snap Toggle

### Event Names:
- No specific analytics event for snap toggle (UI state change only)

### Events & Triggers:
- **Keyboard: `S`** → Triggers: `handleToggleSnap("keyboard")`

### Handler Functions:
- `handleToggleSnap` (line ~31493)

### Execution Flow:
1. User presses `S` key
2. `handleToggleSnap()` toggles snap mode
3. Timeline snapping behavior changes
4. UI shows snap state

---

## 18. Add Voiceover

### Event Names:
- `editor.voiceover.clipGenerate` - Fired when voiceover clip is generated
- `editor.voiceover.delete` - Fired when voiceover is deleted
- `editor.voiceover.move` - Fired when voiceover is moved on timeline

### Events & Triggers:
- **Mouse: Add voiceover button** → Triggers: Voiceover creation handlers → Dispatches: `editor.voiceover.clipGenerate`
- **Context Menu: Delete voiceover** → Triggers: `deleteVoiceover()` → Dispatches: `editor.voiceover.delete`
- **Drag: Move voiceover** → Dispatches: `editor.voiceover.move`

### Handler Functions:
- `deleteVoiceover` (line ~46792)

### Execution Flow:
1. User adds or removes voiceover
2. Handler modifies `VoiceOverTrack`
3. Timeline updates with voiceover sections

---

## 19. Add AI Hook

### Event Names:
- No specific analytics events found for AI Hook operations

### Events & Triggers:
- **Mouse: Add AI hook button** → Triggers: AI hook creation handlers
- **Mouse: Delete AI hook button** → Triggers: AI hook deletion handlers

### Handler Functions:
- Located in AI hook management sections

### Execution Flow:
1. User adds/removes AI hook
2. Handler modifies AI hook track
3. Timeline updates

---

## 20. Speech Enhancement

### Event Names:
- `editor.speech_enhancement.confirm_popup` - Fired when speech enhancement confirmation popup is shown
- `editor.speech_enhancement.confirm_popup_confirm` - Fired when user confirms speech enhancement
- `editor.speech_enhancement.confirm_popup_cancel` - Fired when user cancels speech enhancement
- `editor.audio.enhancement` - Fired when audio enhancement is applied
- `editor.audio.revert_enhancement` - Fired when audio enhancement is reverted

### Events & Triggers:
- **Mouse: Enable speech enhancement** → Triggers: Speech enhancement handlers → Dispatches: `editor.speech_enhancement.confirm_popup`
- **Popup: Confirm enhancement** → Dispatches: `editor.speech_enhancement.confirm_popup_confirm`, `editor.audio.enhancement`
- **Popup: Cancel enhancement** → Dispatches: `editor.speech_enhancement.confirm_popup_cancel`
- **Mouse: Revert enhancement** → Dispatches: `editor.audio.revert_enhancement`
- Type: `"enhance_speech"`

### Handler Functions:
- Speech enhancement processing functions

### Execution Flow:
1. User enables speech enhancement
2. Audio processing applied
3. Enhanced audio rendered

---

## Event System Architecture

### Hotkey System
All keyboard shortcuts are managed via `a.y1()` hotkey system around line ~31332. The system:
1. Listens for keyboard events
2. Maps key combinations to handler functions
3. Executes appropriate handlers based on key pressed

### Mouse Event System
Mouse interactions use standard React event handlers:
- `onClick` - Button clicks
- `onDragStart` - Begin drag operation
- `onDrag` - During drag
- `onDragEnd` - Complete drag
- `onDrop` - Drop element on target
- `onContextMenu` - Right-click context menu (line ~59712)

### Drag & Drop Pattern
All drag-and-drop operations follow this pattern:
1. **DragStart**: Set `eventId` and `value` (element type)
2. **Drag**: Show placeholder on timeline
3. **Drop**: Call creation function (`createTextOverlaySection`, `createMusic`, `createEffect`, etc.)
4. **Complete**: Update track instance and take snapshot

### Common Execution Pattern
Most edit operations follow this flow:
1. **User Action** → Keyboard shortcut or mouse interaction
2. **Handler Function** → Processes the action
3. **Track Mutation** → Updates appropriate track (Caption, Audio, B-Roll, etc.)
4. **Snapshot** → `takeSnapshot()` saves state for undo/redo
5. **UI Update** → Timeline re-renders to show changes

### Track Types
Edit operations modify these track types:
- `CaptionTrack` - Caption segments
- `KeyFrameTrack` - Visual keyframes
- `VoiceOverTrack` - Voiceover audio
- `BRollTrack` - B-roll video overlays
- `TextOverlayTrack` - Text overlays
- `VideoEffectTrack` - Transitions and effects
- `AudioTrack` / `soundTrackInstance` - Background music
- `MediaTrack` - Main media content
- `ScreenOverlayTrack` - Screen overlays

---

## Additional Events

### Auto Censor
- `editor.auto_censor.apply` - Fired when auto-censor is applied to captions
- `editor.auto_censor.revert` - Fired when auto-censor is reverted

### Emoji
- `editor.emoji.add` - Fired when emoji is added to caption
- `editor.emoji.change` - Fired when emoji is changed

### Speaker Management
- `editor.speaker_color.change_color` - Fired when speaker color is changed
- `editor.speaker_color.change_speaker` - Fired when speaker is changed

### Add Section
- `editor.add.section` - Fired when new section is added
- `editor.add_section.show_dialog` - Fired when add section dialog is shown
- `editor.add_section.time_slider.slide` - Fired when time slider is adjusted
- `editor.add_section.time_button.click` - Fired when time button is clicked
- `editor.add_section.text.select` - Fired when text is selected for new section
- `editor.add_section.play` - Fired when playing section preview

### Media Upload
- `editor.sidebar.media_upload_attempt` - Fired when media upload is attempted
- `editor.sidebar.media_upload_success` - Fired when media upload succeeds
- `editor.media.upload` - Fired when media is uploaded
- `editor.media.add` - Fired when media is added to timeline
- `editor.media.error` - Fired when media error occurs

### Timeline Operations
- `editor.timeline.split` - Fired when timeline segment is split
- `editor.timeline.playhead_change` - Fired when playhead position changes
- `editor.timeline.zoom` - Fired when timeline zoom changes
- `editor.timeline.reorder` - Fired when timeline elements are reordered
- `editor.timeline.dragStart` - Fired when drag operation starts on timeline

### Sidebar
- `editor.sidebar.click` - Fired when sidebar element is clicked
- `editor.sidebar.media_hover` - Fired when hovering over media in sidebar
- `editor.sidebar.media_apply` - Fired when media is applied from sidebar

### Export/Save
- `editor.edit.save` - Fired when edit is saved
- `editor.exported.click` - Fired when export button is clicked
- `editor.export.popup` - Fired when export popup is shown
- `editor.download.popup` - Fired when download popup is shown
- `editor.download.popup_cancel` - Fired when download popup is cancelled
- `editor.save_popup.button_click` - Fired when save popup button is clicked

### Layout and Positioning
- `editor.click.sceneLayout` - Fired when scene layout is clicked
- `editor.layout_settings.layout` - Fired when layout setting is changed
- `editor.layout_settings.aspect_ratio` - Fired when aspect ratio is changed
- `editor.track_button.click` - Fired when track button is clicked

### Subject Tracking
- `editor.subject_tracking.select` - Fired when subject is selected for tracking
- `editor.subject_tracking.track` - Fired when subject tracking is applied
- `editor.subject_tracking.unselect` - Fired when subject is unselected
- `editor.subject_tracking.remove` - Fired when subject tracking is removed
- `editor.subject_tracking.reset` - Fired when subject tracking is reset
- `editor.subject_tracking.apply` - Fired when subject tracking is applied

### Static Overlay
- `editor.static_overlay.choose_file` - Fired when choosing file for static overlay
- `editor.static_overlay.switch` - Fired when switching static overlay

### Multi-Select Operations
- `editor.multiSelect.sceneLayout` - Fired when scene layout with multiple selections
- `editor.multiSelect.moveCrop` - Fired when moving crop with multiple items
- `editor.multiSelect.resizeCrop` - Fired when resizing crop with multiple items
- `editor.multiSelect.clickCrop` - Fired when clicking crop with multiple items
- `editor.multiSelect.moveTarget` - Fired when moving target with multiple items
- `editor.multiSelect.resizeTarget` - Fired when resizing target with multiple items

### Performance Monitoring
- `editor.perf.monitor.inp` - Fired for interaction to next paint performance monitoring
- `editor.perf.loading.firstRender` - Fired when first render completes
- `editor.perf.loading.lcp` - Fired for largest contentful paint metric
- `editor.perf.monitor.add_section_av_timeout` - Fired when add section audio/video times out

### WASM/Playback
- `editor.wasm.audioDisappear` - Fired when WASM audio disappears
- `editor.wasm.playStall` - Fired when WASM playback stalls
- `editor.wasm.decoderFail` - Fired when WASM decoder fails

### Onboarding/Help
- `editor.onboarding.new_user.switch_tab` - Fired when new user switches tab
- `editor.onboarding.new_user.learn_more` - Fired when new user clicks learn more
- `editor.whatNew.tab` - Fired when what's new tab is viewed
- `editor.whatNew.click` - Fired when what's new is clicked
- `editor.shortcut.click` - Fired when shortcuts are viewed

### On-Demand Processing
- `editor.onDemand.start` - Fired when on-demand processing starts
- `editor.onDemand.process` - Fired during on-demand processing
- `editor.onDemand.failed` - Fired when on-demand processing fails

### Other
- `editor.warning` - Fired when warning is shown
- `editor.refine.warning` - Fired when refine warning is shown
- `editor.updateSection.renderTime` - Fired to track section update render time
- `editor.template.popup` - Fired when template popup is shown
- `editor.template.popup.do_later` - Fired when template popup is dismissed

---

## Notes

1. **Event Names vs Handlers**: This document now distinguishes between:
   - **Event Names**: Analytics events dispatched via `.push()` (e.g., `editor.filler.remove`)
   - **Handler Functions**: JavaScript functions that execute the functionality (e.g., `cleanFillerWords()`)
   - **Triggers**: User interactions (keyboard, mouse) that initiate handlers

2. **Guard Checks**: Many edit operations perform `timelineLockDetectAndNoti()` to prevent edits during processing

3. **Snapshots**: `takeSnapshot()` is called after most mutations to enable undo/redo

4. **Analytics vs Functionality**: Analytics events are dispatched for tracking but don't execute functionality. The handler functions execute the actual operations.

5. **Recompaction**: `reCompactTimeline()` reorganizes timeline after segment removal operations

6. **Line Numbers**: Approximate locations provided (~) as the file is 91,209 lines long

7. **Event Pattern**: Most edit operations follow this pattern:
   - User Action (keyboard/mouse) → Handler Function → Track Mutation → Analytics Event → Snapshot → UI Update
