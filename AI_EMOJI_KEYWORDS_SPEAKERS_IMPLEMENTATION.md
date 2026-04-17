# AI Emoji, AI Keywords Highlighter & Speakers Color – Implementation in opustimeline.js

This document describes how **AI emoji**, **AI keywords highlighter**, and **speakers color** are implemented in `opustimeline.js`, and which **events** are fired when the user uses each feature.

---

## 1. AI Emoji

### Implementation

**Store / data**

- **Emoji track**: `j.XU.emojiTrackInstance` (or `w.XU.emojiTrackInstance`) holds the emoji track. Each section has `emojiElements` with `sourceUri`, `timeline`, `duration`, `position`, `followWordId`, etc.
- **Preference**: `enableEmoji` lives on the preference object (e.g. from `g.XU.preference`). It is also exposed as `renderPreferenceOverride.enableEmoji` for rendering (e.g. ~20307, ~20363).
- **Caption UI**: A derived store `preferenceForCaption` (around 70209–70213) maps preference to `{ enableEmoji, enableHighlight }` for the caption panel.

**Actions** (from the editor store, ~34615–34876):

- **addEmoji** (`K`): Pushes a new emoji element into an existing section or creates a new section with one emoji segment (~34616–34642).
- **replaceEmoji** (`O`): Finds the emoji by id and updates `sourceUri` (~34646–34652).
- **deleteEmoji** (`N`): Finds the section containing the emoji by id and calls `delete()` on that element (~34655–34664).
- **syncEmojiInOut** (`D`): Keeps emoji segments in sync with caption segments (e.g. when captions change); orphans are removed (~34667–34689).
- **updateEmojiRect** (`y`): Updates `emojiStyle.rect` on preference (~35102–35116).

**Rendering**: `genVideoTrackFromEmojiTrack` (~74078+) only runs when `renderPref.enableEmoji` is true; otherwise emojis are not generated for the video track.

### Events when the user uses it

- **Adding an emoji** (e.g. from picker on a word):
  - **`editor.emoji.add`** with `{ word, emoji }` (~47275–47278).
  - Preference is also set so emoji is on: `eK({ enableEmoji: !0 })` (~47272–47274).

- **Changing an emoji** (replace in picker):
  - **`editor.emoji.change`** with `{ emoji, newEmoji }` (~44840–44843).

- There is **no separate analytics event** in this file for “user toggled AI emoji on/off”; the toggle only updates preference (`onUpdateExpectedPref` → `a({ enableEmoji: e })` in the expected-pref UI around ~28706–28710).

---

## 2. AI Keywords Highlighter

### Implementation

**Preference**: `enableHighlight` is on the same preference object and is read as `renderPreferenceOverride.enableHighlight` (~20308, ~20364). Caption text uses a “color” (e.g. Primary/Secondary/Default) for highlighting.

- **Caption UI**: Same `preferenceForCaption` selector exposes `enableHighlight` (~70211–70212). The highlight color buttons (Default font color, Highlight color 1, etc.) are shown when `enableSpeakerDetection` is off and `enableHighlight` is on (~47291, ~47752).

**Rendering**: Caption frame style uses `enableHighlight` and `enableSpeakerDetection` to decide color (~74763–74767, ~74898–74905):

- If `enableSpeakerDetection`: use `speakersColor` by speaker id.
- Else if `enableHighlight`: use the word’s `color` (e.g. Primary/Secondary) for `fontColor` and `animationColor`; otherwise use default/highlight style.

**Change detection**: When comparing initial vs current preference, if the diff includes `"AI keywords highlighter"`, `changeAIKeywordsHighlighter` is set true (~34191), e.g. for “you changed AI keywords highlighter”–style warnings.

### Events when the user uses it

- **Choosing a highlight color** (Default font color, Highlight color 1, etc.):
  - **`editor.caption.operation`** with `firstOperation` like:
    - `"Default font color"` (~47309–47317),
    - `"Highlight color 1"` (~47328–47336),
    - and similar for other highlight options.

- Toggling the “keywords highlight” checkbox itself only updates preference via `onUpdateExpectedPref` (`a({ enableHighlight: e })` ~28721–28724); **no dedicated analytics event** for that toggle was found in this file.

---

## 3. Speakers Color

### Implementation

**Store**

- **Preference**: `speakersColor` is an array on the preference object (e.g. `preference.speakersColor`). Each item has `id`, `name`, `color`.
- **Sync store**: `S.R.speakersColor` is updated when preference is patched (~35355) so caption/speaker UI can react.
- **Initial load**: If preference has no or empty `speakersColor`, it is loaded from `L.R.speakersColor` and then set on preference (~44056–44061).

**Actions**

- **updateSpeaker** (~35342–35360): Takes speaker id and new color. Updates the matching entry in `preference.speakersColor`, then:
  - Dispatches `t(S.R.speakersColor, l.speakersColor || [])`.
  - Dispatches `t(j.XU.preference, l)` (updated preference).
  - Pushes analytics: **`T.Z.getInstance().push("editor.speaker_color.change_color", { speakerId, color })`**.
- **getSpeaker**: Resolves speaker by id from preference (or fallback), normalizes `speakersColor` to a default if needed, and returns name/color for display (~35361–35379).

**Rendering**: Caption style uses `enableSpeakerDetection` and `speakersColor` (~74898–74905): `fontColor` and `animationColor` are taken from the speaker’s color in `speakersColor` when speaker detection is on.

**Caption store**: `editor.caption.speakersColor` is a separate store (e.g. `p.Wg("editor.caption.speakersColor", f.h)` ~70207–70208) used for caption/speaker UI state.

### Events when the user uses it

- **Changing a speaker’s color** (color picker for a speaker):
  - **`editor.speaker_color.change_color`** with `{ speakerId, color }` (~35356–35359).

- **Changing which speaker is assigned** (e.g. “apply to all” / “switch speaker”):
  - **`editor.speaker_color.change_speaker`** with:
    - `{ apply_all: true, switch_speaker: true }` when confirming exchange (~44646–44649),
    - `{ apply_all: true, switch_speaker: false }` when canceling that dialog or when applying without switch (~44656–44658, ~44670–44673),
    - `{ apply_all: false, switch_speaker: false }` when changing speaker for a single segment (~44677–44680).

---

## Summary Table

| Feature                    | Main store / data                               | Key actions                                           | Events fired on use                                                                 |
|---------------------------|--------------------------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------------|
| **AI Emoji**              | `j.XU.emojiTrackInstance`, preference `enableEmoji` | addEmoji, replaceEmoji, deleteEmoji, syncEmojiInOut, updateEmojiRect | `editor.emoji.add` (add), `editor.emoji.change` (replace)                             |
| **AI Keywords highlighter** | Preference `enableHighlight`                    | Preference merge / refresh                            | `editor.caption.operation` (e.g. `firstOperation`: "Default font color", "Highlight color 1", …) |
| **Speakers color**        | Preference `speakersColor`, `S.R.speakersColor`  | updateSpeaker, getSpeaker                              | `editor.speaker_color.change_color`, `editor.speaker_color.change_speaker`          |

---

## Notes

- The file is minified/bundled, so symbol names like `j.XU`, `w.XU`, `S.R`, `L.R`, `T.Z` are module references; the behavior above is what they represent for these three features.
- Line numbers (e.g. ~28706) are approximate and may shift if the bundle is rebuilt.
