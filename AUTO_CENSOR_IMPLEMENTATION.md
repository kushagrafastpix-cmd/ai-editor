# Auto Censor Implementation in opustimeline.js

This document describes how the auto censor functionality is implemented and what events are fired when the user uses it.

---

## 1. Core Implementation (Caption Track Layer)

Auto censor is implemented in the caption track layer and exposed as four main actions.

### 1.1 `applyCensor(wordId)` (internal helper `T`)

- **Location:** ~lines 34317–34424
- **Behavior:**
  - Looks up the word by ID in the caption track.
  - Sets the word’s `type = "curse"`.
  - Replaces display text based on **preference** `curseWordsConfig.captionMaskStyle`:
    - **"Asterisks"** → first character + `"***"`
    - **"Dashes"** → first character + `"---"`
- **Mask style source:** `preference.curseWordsConfig.captionMaskStyle` (default `"Asterisks"`).

### 1.2 `revertCensorWord(wordId)` (exported as `F`)

- **Location:** ~lines 34859–34865
- **Behavior:** Clears the curse type and restores the original text for that word.

### 1.3 `applyCensorWords(wordList)` (exported as `k`)

- **Location:** ~lines 34379–34416
- **Behavior:**
  - Accepts a list of words (strings).
  - Splits into single words (no spaces) and multi-word phrases.
  - Iterates over all caption sections/segments/textElements:
    - Single-word match: calls `T(n.id)` (apply censor) and increments count.
    - Phrase match: if consecutive text elements match the phrase, censors each word and counts.
  - Returns the number of words censored.

### 1.4 `revertCensorWords()` (exported as `I`)

- **Location:** ~lines 34425–34442
- **Behavior:**
  - Iterates over the entire caption track; for every text element with `type === "curse"` calls `F(e.id)` (revert).
  - Returns the number of words reverted.

**Summary:** Apply = mark as curse + mask text; revert = clear curse and restore text. All logic is caption-track state; there is no separate “event” object beyond analytics.

---

## 2. Where the User Triggers It

### 2.1 Per-word (Caption UX)

- User gets a word popover with options such as this instance only”, “Censor all instances”, “Undo censoring”.
- Handlers call `applyCensor(wordId)`, `applyCensorWords([word])`, or `revertCensorWord(wordId)`, then fire analytics/feature tracking.

### 2.2 Panel / “Switch on” Auto Censor

- **`switchOnAutoCensor`** (~lines 50069–50096):
  - Reads `captionMaskingStyle` and `audioMaskingStyle` from the UI.
  - Pushes **`editor.auto_censor.apply`** (see Events below).
  - Updates preferences: `curseWordsConfig.enabled = true`, `libId`, `captionMaskStyle`, `audioMaskStyle`.
  - Opens curse-words panel via `openCurseWordsPanel` with current curse words.
  - Calls `applyCensorWords(currentCurseWords)` and shows success/warning toasts.

- **`switchOffAutoCensor`** (~lines 50097–50107):
  - Calls `revertCensorWords()`, shows success, sets `curseWordsConfig.enabled = false`, takes snapshot.

### 2.3 Feature Flags / UX

- **`enableSmallAutoCensor`** in section config (~lines 32829 / 32907) toggles the small auto-censor UX.
- **`showAutoCensorPanel`** is a UI state (e.g. `editor.ui.showAutoCensorPanel`) used to show the auto censor panel.

---

## 3. Events Fired When the User Uses Auto Censor

All of these are **analytics/feature-tracking**; there are no other “auto censor” events in this file.

### 3.1 `editor.auto_censor.apply`

Pushed via `eA.Z.getInstance().push("editor.auto_censor.apply", { ... })` (or equivalent `P.Z.getInstance().push(...)` in the switch-on flow).

**From per-word actions** (e.g. “Censor this instance only” / “Censor all instances”):

- **Payload:**
  - `firstOperation: "censor word"`
  - `secondOperation: "censor only"`
  - `wordName: t.text`
- After the push, **feature NPS** is recorded for **CensorWords** (`eH(s.d_.CensorWords, { isFeatureNps: true })`).

**From “Switch on” auto censor** (`switchOnAutoCensor`):

- **Payload:**
  - `captionStyle: s` (from `captionMaskingStyle`)
  - `audioType: s` (from `audioMaskingStyle`)
- Again followed by CensorWords feature NPS.

So whenever the user **applies** censor (either one word or the full panel), the app fires **`editor.auto_censor.apply`** with the appropriate payload, then records CensorWords feature usage.

### 3.2 `editor.auto_censor.revert`

Pushed via `eA.Z.getInstance().push("editor.auto_censor.revert", { ... })`.

**From “Undo censoring” on a word:**

- **Payload:**
  - `firstOperation: "undo censoring"`
  - `wordName: t.text`
- Then the popover is closed and a snapshot is taken; no separate “revert” event for the panel off.

So when the user **reverts** censoring for a single word, the app fires **`editor.auto_censor.revert`** with that payload.

### 3.3 Feature / NPS Tracking

- **CensorWords** is tracked as a feature (e.g. `eH(s.d_.CensorWords, { isFeatureNps: true })`) when the user applies censor (both per-word and when switching on auto censor).
- **`openCurseWordsPanel`** is used when opening the curse-words panel (e.g. `editor.caption.openCurseWordsPanel` debug label and the action that opens the panel with the current curse word list).

---

## 4. Summary

| Aspect | Details |
|--------|---------|
| **Implementation** | Caption-track mutations: `applyCensor` / `revertCensorWord` (single word) and `applyCensorWords` / `revertCensorWords` (bulk). Mask style from `preference.curseWordsConfig.captionMaskStyle` (Asterisks/Dashes). | 
| **Apply event** | `editor.auto_censor.apply` – when applying censor (per word or via “Switch on” auto censor), with `firstOperation`, `secondOperation`, `wordName` or `captionStyle`/`audioType`. |
| **Revert event** | `editor.auto_censor.revert` – when undoing censoring for a word, with `firstOperation: "undo censoring"` and `wordName`. |
| **Other** | CensorWords feature/NPS tracking and the open-curse-words-panel flow. |

---

## 5. Key Line References in opustimeline.js

| Item | Approx. line(s) |
|------|------------------|
| `applyCensor` (T), `applyCensorWords` (k), `revertCensorWord` (F), `revertCensorWords` (I) definitions | 34379–34465 |
| Return object exposing censor APIs | 34859–34882 |
| Per-word apply/revert handlers and `editor.auto_censor.apply` / `editor.auto_censor.revert` | 47155–47195 |
| `switchOnAutoCensor` / `switchOffAutoCensor`, panel apply | 50069–50107 |
| Mask style from preference (`captionMaskStyle`) | 34263–34267, 34423 |
| `enableSmallAutoCensor` config | 32829, 32907 |
| `showAutoCensorPanel` state | 71650–71652, 71782–71783 |


Summary
Implementation: Auto censor is implemented as caption-track mutations: applyCensor / revertCensorWord (single word) and applyCensorWords / revertCensorWords (bulk). Mask style comes from preference.curseWordsConfig.captionMaskStyle (Asterisks/Dashes). Panel on/off and per-word actions call these and update preferences/UI.

Events fired when the user uses it:
editor.auto_censor.apply – when applying censor (per word or via “Switch on” auto censor), with firstOperation, secondOperation, wordName or captionStyle/audioType.
editor.auto_censor.revert – when undoing censoring for a word, with firstOperation: "undo censoring" and wordName.
CensorWords feature/NPS tracking and the open-curse-words-panel flow as above.