# Add Music Functionality – Implementation (opustimeline.js)

This document describes how the **Add Music** feature is implemented in `opustimeline.js`, including data flow, core functions, and **events fired** when the user adds music.

---

## 1. Overview

Users can add music to the timeline in two main ways:

1. **By drag-and-drop**: Drag a music item from the Music sidebar onto the timeline (AudioTrack).
2. **By button**: Click to add music at the current time (or at time 0 when applying a brand template with sound).

The sound is stored in the **sound track** (AudioTrack) and represented as sections with Audio segments.

---

## 2. API / Data Layer

**Base path:** `{nestApiPrefix}/musics`

| Function | Purpose |
|----------|--------|
| **getMusicStylesAndGenres()** | GET `musics/library-metadata` → returns `{ styles: [], genres: [] }` for filters. |
| **getMusicResourceList(params)** | GET with `q: "findBySearchTextAndFilters"`; params: `page`, `pageSize`, `searchText`, `style`, `genre` → list of music resources. |
| **getMusicResource({ ids })** | GET with `q: "findByIds"`, `ids: comma-separated` → full resource details (e.g. `resourceUrl`, `resourceGcsUri`, `waveformUrl`, `supplier`). |
| **getMusicSupplier(resourceIds)** | POST `musics/suppliers` with `resourceIds` in body. |

Used when resolving a music item by ID before creating a section (e.g. in `createMusic`).

---

## 3. State (Store)

Relevant state keys (with debug labels) used for Add Music:

| Key | Debug label | Purpose |
|-----|-------------|--------|
| `musicFavoredItems` | – | Persisted list of favored music items. |
| `activeMusicItemId` | `editor.music.activeMusicItemId` | Currently selected music item in UI. |
| `musicDrawerOpen` | `editor.music.musicDrawerOpen` | Whether the music drawer/panel is open. |
| `musicSearchTimes` | `editor.music.musicSearchTimes` | Search count. |
| `musicPlayTimes` | `editor.music.musicPlayTimes` | Play count. |
| `hasAddMusicSplitPopup` | – | Persisted; whether user has seen the “split audio” popup. |
| `showAddMusicSplitPopup` | `editor.music.showAddMusicSplitPopup` | Whether to show the popup suggesting to split when music is longer than timeline. |
| `musicList` | `editor.ui.musicList` | UI state for music list. |

The **sound track** itself is held in `soundTrackInstance` (AudioTrack). Creating/updating music updates this track and dispatches it back into the store.

---

## 4. Core Implementation

### 4.1 `createMusic` (internal `eg`)

**Location:** ~line 65712 (wrapped in `F.T` for Redux).

**Role:** Creates one music section on the sound track and updates store.

**Flow:**

1. **Resolve resource:**  
   If the music item has `id`, it calls `getMusicResource({ ids: [id] })` to get `resourceUrl`, `resourceGcsUri`, `waveformUrl`, `supplier`. Otherwise it uses `resourceUrl` and `waveformUrl` from the passed object.

2. **Build section payload:**  
   Builds an **Audio** section with:
   - Segment content: `gcsUri`, `sourceUri`, `waveformUrl`, `volume` (default 15), `duration`, `timeline` in/out, `audioName`, `resourceId`, `speed` (default 1), `supplier`.
   - Section duration and timeline (start time `e`, optional `trimmedDuration` or full duration).

3. **Update track:**  
   - Gets or creates `soundTrackInstance` (AudioTrack class).
   - **Unshifts** the new section, sorts sections by `timeRange.timelineIn`, adds the new section’s id to active segments, then dispatches the updated `soundTrackInstance` (e.g. via `n(L.XU.soundTrackInstance, d)`).

So **createMusic** is the low-level “add this music at this time (with optional trim)” function.

### 4.2 `insertMusicByCurrentTime` (exported as `ex`)

**Location:** ~line 65791 (wrapped in `F.T`).

**Role:** High-level “add music at current (or given) time”, then fire analytics and NPS.

**Signature (conceptually):**

- `(getState, dispatch, musicResource, sectionTimestamp?, addWay?, skipSnapshot?)`

**Flow:**

1. **Timestamp:**  
   Uses `sectionTimestamp` if provided, otherwise `videoCurrentTime` from store.

2. **Optional auto-trim:**  
   If `trimAuto` is enabled, there are **no** existing sound sections, and timeline end (`keyFrameTotalTime`) is greater than the chosen time, it computes an optional trim duration:  
   `trimmedDuration = min(keyFrameTotalTime - sectionTimestamp, musicResource.duration)`.

3. **Create music:**  
   Calls `createMusic(sectionTimestamp, musicResource, trimmedDuration)` so the new section is placed at the right time and optionally trimmed.

4. **Analytics:**  
   Pushes **`editor.music.add`** (see Events below).

5. **NPS:**  
   Calls `openNpsPopup(l.d_.Music, { isFeatureNps: true })` for the Music feature.

6. **Undo:**  
   Unless `skipSnapshot` is true, calls `takeSnapshot()` for history.

**Call sites:**

- **Drag:** When the user drops music on the timeline (type `MUSIC`), the drop handler calls `insertMusicByCurrentTime(getState, dispatch, musicResource, dropTimeMs, "drag")` (~line 64938, variable `el` = `insertMusicByCurrentTime`).
- **Brand template:** When applying a brand template that includes sound, it calls `insertMusicByCurrentTime(..., musicPayload, 0, "button", true)` (~line 53371, variable `I` = `insertMusicByCurrentTime`) so music starts at time 0 and snapshot is skipped as part of the template apply.

So **insertMusicByCurrentTime** is the single entry point that both creates the music and fires the add-music events.

---

## 5. Events Fired When User Uses Add Music

These are the **particular events** fired in relation to Add Music.

### 5.1 When music is actually added

**Event:** `editor.music.add`  
**Method:** `B.Z.getInstance().push("editor.music.add", payload, options)`  
**Location:** ~65801, inside `insertMusicByCurrentTime` (after `createMusic`).

**Payload:**

- `musicName` – title of the music
- `musicGenre` – `music.genre.join(",")`
- `musicStyle` – `music.style.join(",")`
- `musicDuration` – duration of the music
- `sectionTimestamp` – time on timeline where the section was added
- `addWay` – `"button"` or `"drag"`
- `trimAuto` – whether auto-trim was applied (e.g. when no existing sound and music is trimmed to timeline end)

**Options:** `{ platform: { MP: true, SS: true } }`

So every time the user successfully adds music (by drag or by the “button” path, e.g. brand template), **editor.music.add** is fired with the above fields.

### 5.2 NPS (Music feature)

**Call:** `openNpsPopup(l.d_.Music, { isFeatureNps: true })`  
**Location:** ~65815, right after `editor.music.add`.  
This opens the NPS popup for the Music feature after an add.

### 5.3 Sidebar – opening Music tab

**Event:** `editor.sidebar.click`  
**Method:** `Z.Z.getInstance().push("editor.sidebar.click", { featureName: r }, { platform: { MP: true, SS: true } })`  
**Location:** ~39887.  
When the user clicks a sidebar tab, `featureName` is set to the tab value (e.g. `"Music"` for the Music tab). So **when the user opens the Music tab**, this event is fired with `featureName: "Music"`.

### 5.4 Upgrade / upsell

**Trigger:** `editor.music.upgrade`  
**Location:** ~33259 (e.g. in upsell config).  
Used when the user tries to use Add Music but doesn’t have access; the UI shows an upgrade/upsell with `trigger: "editor.music.upgrade"`.

### 5.5 Timeline drag start (general)

**Event:** `editor.timeline.dragStart`  
**Method:** `B.Z.getInstance().push("editor.timeline.dragStart", payload, { platform: { MP: true, SS: true } })`  
**Location:** ~66220.  
Fired when a timeline drag starts (including when dragging music from the sidebar). So when the user **starts dragging** a music item (or other draggable), this is fired; the actual add is tracked by **editor.music.add** when the drop completes.

### 5.6 Feature flags / A/B (add music entry)

**Flags (via `lb`):**

- `editor_add_music`
- `editor_add_music_trial`
- `editor_add_music_starter`

**Location:** ~52516–52521.  
Used to control visibility of the “Add music” onboarding/entry (e.g. whether the “Add music to videos” guide item is shown). These are not “events” in the analytics sense but gate which users see the add-music onboarding.

### 5.7 Add music “split” popup

When the user adds music by **drag** and the music is **longer than the timeline**:

- If they haven’t seen the split popup (`!await getState().hasAddMusicSplitPopup`), the code sets `showAddMusicSplitPopup` to true and seeks the playhead to the end of the timeline (~64940–64941).
- The popup suggests splitting the audio. The flag **editor_add_music_split** (`lb("editor_add_music_split")`) is used in this flow (~64584, 65524).

So the **events** that matter for “user used add music” are:

1. **editor.sidebar.click** with `featureName: "Music"` – opened Music tab.  
2. **editor.timeline.dragStart** – started a drag (optional; can be for music or other assets).  
3. **editor.music.add** – music was actually added (with `addWay: "button"` or `"drag"`).  
4. **editor.music.upgrade** – shown when user lacks access.  
5. NPS popup for Music is triggered right after **editor.music.add**.

---

## 6. User Flows (Summary)

| Action | What happens | Events |
|--------|----------------|--------|
| Click “Music” in sidebar | Sidebar tab switches to Music | `editor.sidebar.click` (`featureName: "Music"`) |
| Drag music onto timeline | Drop on AudioTrack → `insertMusicByCurrentTime(..., "drag")` → `createMusic` | `editor.timeline.dragStart` (on drag start); `editor.music.add` (`addWay: "drag"`); NPS for Music |
| Apply brand template with sound | `deleteAllSoundTracks()` then `insertMusicByCurrentTime(music, 0, "button", true)` | `editor.music.add` (`addWay: "button"`) (and template-related events) |
| Music longer than timeline (drag) | After add, if not seen before: show split tip, seek to end | Uses `showAddMusicSplitPopup` / `hasAddMusicSplitPopup` and **editor_add_music_split** flag |

---

## 7. Summary Table – Events

| Event / trigger | When | Payload / notes |
|-----------------|------|------------------|
| **editor.music.add** | Every time music is added to the timeline (button or drag) | `musicName`, `musicGenre`, `musicStyle`, `musicDuration`, `sectionTimestamp`, `addWay` ("button" \| "drag"), `trimAuto` |
| **editor.sidebar.click** | User clicks a sidebar tab (e.g. Music) | `featureName`: e.g. `"Music"` |
| **editor.timeline.dragStart** | User starts dragging on timeline (e.g. music item) | Drag-related payload |
| **editor.music.upgrade** | Shown when user doesn’t have access to Add Music | Upsell trigger |
| **openNpsPopup(Music, …)** | Right after a successful add | NPS for Music feature |
| **editor_add_music / _trial / _starter** | Feature flags for add-music onboarding | Control visibility of “Add music” guide |
| **editor_add_music_split** | Used in “music longer than timeline” split tip flow | Controls split popup / behavior |

---

*All line numbers refer to `opustimeline.js` and may shift with future builds.*
