# Add Text Functionality Implementation (opustimeline.js)

This document describes how the **Add Text** (text overlay) feature is implemented in `opustimeline.js`, including the flow from sidebar/timeline to store and the **events** fired when the user uses this functionality.

---

## 1. Overview

The Add Text feature lets users add **Heading** or **Body text** overlays to the timeline by dragging from the sidebar or by dropping at a time. Text overlays live on the **TextOverlayTrack** and are represented as sections with `contentType: "TextOverlay"` and a `textOverlayType` of `"heading"` or `"paragraph"`.

---

## 2. Sidebar: Text Overlay Types

- **Location**: Sidebar configuration around **lines 40382–40397**.
- **Constant**: `TEXT_OVERLAY = "textOverlay"` (used as `eventId` for drag/drop).
- **Types**: Two options are defined via a function that returns an array:
  - **Heading** (`type: o.kV.Heading`), name: `editor:text_overlay_heading`, style (e.g. fontSize 16, fontWeight 600).
  - **Body text** (`type: o.kV.Paragraph`), name: `editor:text_overlay_body_text`, style (e.g. fontSize 14, fontWeight 500).

These are the two “Add text” options the user can drag; `type` becomes the **value** in drag/drop (`eventId: TEXT_OVERLAY`, `value: "heading"` or `"paragraph"`).

---

## 3. Drag Source (Sidebar)

- **Draggable component**: A generic draggable (around **lines 7906–7945**) is used with:
  - `eventId`: e.g. `A5.TEXT_OVERLAY` (i.e. `"textOverlay"`).
  - `value`: the text overlay type (`"heading"` or `"paragraph"`).
- **On pointer down**: The drag context is set with `setValue({ eventId, value })`.
- **On drop**: The drop handler receives an object with `event`, `value`, and `eventId`.

When the user **starts** dragging a text overlay item from the sidebar:

- **Drag start** (around **66180–66208**): The handler uses `eventId` (e.g. `TEXT_OVERLAY`) and optional `value` to set:
  - `trackType`: `"TextOverlayTrack"`.
  - Default duration: `Y.Gd` (exported as **3 seconds**, 3000 ms — see around **60134–60135**, **60315**).
- **`setOutsideDraggingSection`** is called with `{ trackType: "TextOverlayTrack", startMs, endMs }` so the timeline shows a placeholder for the drop.
- **Drag end** (around **66211–66215**): **`setOutsideDraggingSection(void 0)`** clears the placeholder.

So the “add text” **drag** is initiated from the sidebar with `eventId === TEXT_OVERLAY` and `value === "heading" | "paragraph"`.

---

## 4. Drop Handler and `createTextOverlaySection`

When the user **drops** the text overlay onto the timeline:

- **Drop handler** (around **64859–64884**): A single handler (e.g. `eH`) runs for timeline drops. When `eventId === A5.TEXT_OVERLAY`:
  1. `value` is the text overlay type (`e`).
  2. Drop time `u` is computed from the pointer position (with optional clamp).
  3. **`createTextOverlaySection(e, u)`** is called — i.e. `createTextOverlaySection(textOverlayType, dropTimeMs)`.
  4. After that, **`editor.textOverlay.dragApply`** is pushed (see Events below).

- **`createTextOverlaySection`** (around **65604–65625**):
  - Implemented as a thunk (e.g. `ep`) that receives state, dispatch, text overlay type, and drop time.
  - Uses **`draggingPlaceholder`** from state to resolve the final drop position in ms:  
    `a = (draggingPlaceholder.left || 0) * widthTimeRatio || a`.
  - Gets or creates the **text overlay track**:  
    `textOverlayTrack` from store; if missing, creates a new track (e.g. `W.Sn()`).
  - Creates a **new section** by calling **`X.Rq(o, a, e)`** (export name **Rq**, implementation is function **T** around **67455–67587**):
    - **T(textOverlayType, startTimeMs, i18n)** returns one section object with:
      - `sectionDuration`: `type: "TS"`, `eO: d.Gd` (default duration, 3000 ms).
      - `sectionTimeline`: `in: t`, `out: t + d.Gd`.
      - One segment with `contentType: "TextOverlay"`, `content.textOverlayType`, and **default text elements**:
        - **Heading**: e.g. “Add headings ” + “headings” (from i18n keys `editor:add_headings`, `editor:add_headings_headings`).
        - **Paragraph**: e.g. “Add body text ” + “body ” + “text” (from `editor:add_body_text_*`).
      - Default **textStyle** (e.g. Montserrat, fontWeight 900, fontColor #000000, backgroundColor #FFFFFF), with fontSize 64 for Heading and 40 for Paragraph.
      - Default **position** (e.g. `wPct: 0.75`, `hPct: 0`, `xPct: 0`, `yPct: -0.5`).
  - The new section is **pushed** onto the track, sections are **sorted** by `sectionTimeline.in`, and the store is updated (e.g. `f.T(u)`).
  - The new section’s **id** is added to active segments (e.g. `addSegmentToActiveSegments([p], true)`).
  - **`updateAllSectionsTimeline`** is called with the updated track and current **`draggingPlaceholder`** so the timeline and placeholder stay in sync.

So the core “add text” behavior is: **create one new TextOverlay section at the drop time with default content and style**, then update the TextOverlayTrack and selection.

---

## 5. Section Factory: Rq / T

- **Export**: **Rq** (around **66916–66918**) returns the function **T**.
- **T(e, t, n)** (around **67455–67587**):
  - **e**: `textOverlayType` (`"heading"` or `"paragraph"`).
  - **t**: start time in ms.
  - **n**: i18n function for default labels.
  - Returns a single **section** object (with one segment) for the TextOverlayTrack, including default text elements and styles as above.

All new “add text” sections are created through this factory.

---

## 6. Events Fired When Using Add Text

These are the **analytics/telemetry events** pushed (e.g. `T.Z.getInstance().push(...)`) when the user uses Add Text:

| Event name | When it is fired | Payload (typical) |
|------------|-------------------|-------------------|
| **`editor.textOverlay.dragApply`** | When the user **drops** a text overlay (Heading or Body text) from the sidebar onto the timeline. | `{ textOverlayType: "heading" \| "paragraph" }` |
| **`editor.textOverlay.edit`** | When the user **moves** a text overlay segment on the timeline (drag end). | `{ operationType: "move" }` |
| **`editor.textOverlay.edit`** | When the user **trims or extends** a text overlay segment (in/out handles). | `{ operationType: "trim" \| "extend" }` (e.g. `operationType: "trim"` when duration is shortened, `"extend"` when lengthened). |
| **`editor.textOverlay.delete`** | When the user **deletes** one or more selected text overlay segments (e.g. Delete key or delete action). | `{}` |

**Note:** The names **`editor.add_section.text.select`** appear in the file in a different context: they are used when the user **selects text in the script/transcript panel** (e.g. “selectType: drag” or “selectType: click”), not when adding a text overlay from the sidebar. So for the **Add Text** feature itself, the relevant events are the **`editor.textOverlay.*`** ones above.

---

## 7. Other Related Behavior 

- **TextOverlayTrack** is identified by `trackType: "TextOverlayTrack"` and by id `#TextOverlayTrack` in the timeline.
- **Current selection**: State such as `currentTextOverlaySegmentId`, `currentTextOverlaySectionId`, and `currentTextOverlaySegment` is used for the active text overlay and canvas/position updates.
- **Canvas updates**: Handlers like **`updateTextOverlayPositionOnCanvas`**, **`rotateTextOverlayOnCanvas`**, and **`focusTextOverlayBox`** react to selection and store changes to update the preview.
- **Text content/style**: **`updateTextOverlayTextContent`** and **`updateTextOverlayTextStyle`** (around **41021–41042**) update existing text overlay sections; they do not fire the events listed above by themselves.
- **Delete flow**: When the user deletes selected segments that include type `"TextOverlay"`, the code removes those sections from the track instance (e.g. `sectionMap.get(id).delete()`) and then pushes **`editor.textOverlay.delete`** (around **65976–65990**).

---

## 8. Summary Flow (Add Text)

1. User drags **“Heading”** or **“Body text”** from the sidebar (drag source with `eventId: TEXT_OVERLAY`, `value: "heading" | "paragraph"`).
2. **Drag start**: `setOutsideDraggingSection({ trackType: "TextOverlayTrack", startMs, endMs })`; placeholder duration uses **Y.Gd** (3000 ms).
3. User drops on the timeline → drop handler sees `eventId === TEXT_OVERLAY`, gets `value` (type) and drop time.
4. **`createTextOverlaySection(textOverlayType, dropTimeMs)`** runs:
   - Resolves drop position from `draggingPlaceholder` and `widthTimeRatio`.
   - Gets/creates TextOverlayTrack, creates one section via **Rq/T(textOverlayType, startMs, i18n)** with default duration 3000 ms and default text/style.
   - Updates store, selection, and **`updateAllSectionsTimeline`**.
5. **Event pushed**: **`editor.textOverlay.dragApply`** with `{ textOverlayType }`.
6. Later edits: **move** → `editor.textOverlay.edit` (operationType: move); **trim/extend** → `editor.textOverlay.edit` (operationType: trim/extend); **delete** → `editor.textOverlay.delete`.

This is how Add Text is implemented and which events are fired when the user uses this functionality in `opustimeline.js`.
