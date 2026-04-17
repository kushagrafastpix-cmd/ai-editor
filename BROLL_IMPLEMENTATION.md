# B-Roll Functionality – Implementation in opustimeline.js

This document describes how **b-roll** is implemented in `opustimeline.js`, the **multiple b-roll functionalities**, and which **events** are fired when the user uses each feature.

---

## 1. B-Roll Types

- **GenAi** – AI-generated b-roll (images/video from prompts).
- **Stock** – Stock media; can be **auto** (AI picks), **select** (user selects words), or **manual** (user picks from library).
- **Prompt** – User-provided prompt; opens BRoll with `brollMenuOpenType: "Prompt"`.

---

## 2. Where B-Roll Is Triggered

| Flow | Where | What happens |
|------|--------|----------------|
| **Quickstart B-roll** | Quickstart workflow | `workflowType: "broll"`, `configBroll: true`, `trigger: "quickstart-broll"`. Before submit, FreePlan users get upsell with `trigger: "quickstart-broll"`. |
| **Sidebar BRoll** | Editor sidebar | Opens Clip Assets menu to **BRoll** (`openAndSwitchClipAssetsMenu("BRoll")`). Can trigger **GenAi** or **Stock** generation. | 
| **Floating submenu** | When a b-roll segment is selected | `activeClipBroll` is set; submenu type is chosen by `brollType`: `"ai-broll"`, `"stock-broll"`, or BRoll with `"Prompt"`. |
| **Auto-generation** | From outside (e.g. quick gen) | When `quickGenBroll` is true, `handleCreateBrolls` is called with `type: "GenAi"`, `genType: "auto"`. |

---

## 3. Core B-Roll Logic (Store / Actions)

B-roll state and operations live in a store layer that uses **`j.XU.brollTrack`** and **`j.XU.brollTrackInstance`** (parsed track vs class instance). Main actions:

- **`applyBroll`** (`P`) – Apply/replace a b-roll item (crop, keyword/prompt, dimensions, id).
- **`deleteBroll`** (`B`) – Remove b-roll by content ids.
- **`initBrolls`** (`R`) – Initialize b-roll track from preprocessed data.
- **`appendBroll`** (`U`) – Append new b-roll track sections (with progress via `updateBrollProcess`).
- **`preprocessBrollTrack`** (`K`) – Normalize track (e.g. set `brollType`) before use.
- **`updateBrollProcess`** (`F`) – Updates `createBrollProcess` (0–100) for UI.

Creation flow builds a **BRollTrack** with sections/segments and **`bRollElements`**; each element has `content.brollType`, `content.broll` (urls, crop, etc.), and for GenAi `genAiImagePrompt`, for Stock `keyword`.

---

## 4. Execution Triggers (Non-Analytics)

This section lists the **actual triggers** that make the b-roll feature *do work* (generate/apply/update track). These are **not** analytics events like `editor.broll.*` — they are **UI handlers, state transitions, and store actions** that run the functionality.

| Trigger type | Trigger | What it executes | What it means |
|-------------|---------|------------------|---------------|
| **State → action** | `quickGenBroll === true` | Calls `handleCreateBrolls({ type: "GenAi", genType: "auto" })` | Auto-generates AI b-roll without the user manually selecting a prompt/words. |
| **UI navigation** | `openAndSwitchClipAssetsMenu("BRoll")` | Opens the BRoll sidebar panel | Makes the BRoll tools available; subsequent clicks in that panel can start GenAi/Stock generation. |
| **Selection → UI mode** | Setting `activeClipBroll` | Opens floating submenu based on `brollType` (`"ai-broll"`, `"stock-broll"`, or prompt flow via `brollMenuOpenType: "Prompt"`) | Selecting an existing b-roll segment enables actions like replace/regenerate/crop. |
| **Apply (commit to track)** | User confirms/apply in UI | `applyBroll(...)` | Writes the chosen b-roll (urls/crop/keyword/prompt/dimensions/id) into the `BRollTrack`. |
| **Generation result → append** | Generator returns new sections/elements | `appendBroll(...)` (often with `updateBrollProcess(...)`) | Inserts newly generated b-roll into the timeline and updates progress UI. |
| **Delete** | User deletes b-roll from UI/timeline | `deleteBroll(contentIds)` | Removes b-roll from the `BRollTrack`. |
| **Track normalization** | Before using/after loading b-roll data | `preprocessBrollTrack(...)` | Ensures track has consistent fields like `brollType` so UI and generation behave correctly. |
| **Initialize** | Project load / initial hydration | `initBrolls(...)` | Creates the initial `brollTrackInstance` from existing track data. |

**Why only GenAi + auto in “State → action”?** That row describes the **single** trigger `quickGenBroll === true` (e.g. quickstart auto-gen). In the code, that path calls `handleCreateBrolls` with only `type: "GenAi"`, `genType: "auto"`. **Stock** and **Prompt** (and GenAi with `genType: "select"`) are triggered when the user opens the BRoll sidebar or floating submenu and chooses Stock, Prompt, or GenAi with word selection — the panel/submenu then calls the creation flow with the chosen `type` and `genType` (e.g. `type: "Stock"`, or opens with `brollMenuOpenType: "Prompt"`).

**Key takeaway:** b-roll is primarily **imperative** (click/flag → handler/thunk runs → track/state mutates). It is not primarily driven by a runtime PubSub bus like playback events.

---

## 5. Events Fired (Analytics / Push)

These are the **events pushed** when the user uses b-roll (e.g. `SomeAnalytics.getInstance().push("eventName", payload)`).

| Event name | When it's fired | Typical payload |
|------------|-----------------|-----------------|
| **`editor.broll.upsell`** | User hits quota/plan limit and upsell is shown (e.g. “Upgrade for B-Roll”) | `{}` |
| **`editor.broll.sentence`** | B-roll generated **from selected words** (AI or Stock by selection) | `{ type, brollTrack, words }` + platform flags |
| **`editor.broll.notFound`** | No b-roll was generated (e.g. “try regenerating”) | `{ type, insertType?, words? }` |
| **`editor.broll.genAI`** | User starts **GenAi** b-roll generation | `{ projectId, clipId, genType? }` + platform |
| **`editor.broll.stock`** | User starts **Stock** b-roll generation | `{ projectId, clipId, genType? }` + platform |
| **`editor.broll.error`** | Applying/using b-roll fails (e.g. download) | `{ errorMessage, errorName, brollType }` |
| **`editor.broll.renderTime`** | After a full b-roll generation run | `{ totalMs, brollType, requestMs, downloadMs, brollCount }` |
| **`editor.broll.drag`** | User **drags** the b-roll crop area (position/size) | `{ broll }` |
| **`editor.broll.move`** | User **moves** a b-roll segment on the timeline | `{ type, timeDuration }` |
| **`editor.broll.extend`** | User **extends** a b-roll segment (longer duration) | `{ timeRange, brollType }` |
| **`editor.broll.trim`** | User **trims** a b-roll segment (shorter duration) | `{ timeRange, brollType }` |
| **`editor.broll.moveRenderTime`** | After a move/extend/trim interaction | `{ move, extend, trim }` (times) |
| **`editor.click.crop`** | User interacts with crop UI (b-roll crop) | `{ type: "click" \| "double-click" \| "X" }` |

“B-roll out of credits” is handled by opening a modal (`brollOutOfCreditsOpen`) and can trigger upsell with **`trigger: "broll-out-of-credits"`** and title “Upgrade for B-Roll feature and more” — that’s UI/state, not a separate analytics event name above.

---

## 6. UI / State Atoms Involved 

- **`activeClipBroll`** – Currently selected b-roll clip (drives floating submenu: ai-broll / stock-broll / BRoll).
- **`brollMenuOpenType`** – e.g. `"Prompt"` when BRoll is opened for prompt-based b-roll.
- **`brollDrawerOpen`** – Whether the b-roll drawer is open (set by `applyCurrentBroll`).
- **`loadingBrollType`** – Which type is currently loading (`"GenAi"` / `"Stock"`).
- **`createBrollProcess`** – 0–100 progress for creation.
- **`brollOutOfCreditsOpen`** – Modal for out-of-credits.

---

## 7. Summary 

- **Multiple functionalities**: Quickstart b-roll, sidebar BRoll, GenAi (auto/select), Stock (auto/select/manual), Prompt b-roll, and timeline actions (move/extend/trim/crop).
- **Implementation**: B-roll is a **BRollTrack** with sections/segments and **`bRollElements`**; store actions (`applyBroll`, `appendBroll`, `preprocessBrollTrack`, etc.) and creation hooks (`getBrolls`, `createBrollsForAi`/`ForStock`, etc.) drive generation and application.
- **Events**: The ones that fire when the user *uses* b-roll are the **`editor.broll.*`** and **`editor.click.crop`** events above — generation start (`genAI`/`stock`), result (`sentence`/`notFound`/`renderTime`/`error`), timeline edits (`drag`/`move`/`extend`/`trim`/`moveRenderTime`), and crop UI (`editor.click.crop`).
