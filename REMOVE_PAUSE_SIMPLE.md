# How Remove Pause Works (Simple)

## In one sentence

**Remove Pause** finds caption words that are “silence” (pauses), then deletes those words from the caption, the video timeline, and the voice track so the video plays without those pauses.

---

## Two ways to use it

| Action | What it does |
|--------|----------------|
| **Remove pause** (on one word) | Removes the **selected** pause word(s) from the timeline. |
| **Remove all pauses** | Finds **all** pause words (optionally above a duration), then removes them one by one. |

Both end up calling the **same removal logic** (drop words from caption + keyframe + voice).

---

## Simple flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER CLICKS "REMOVE PAUSE" (single word)  OR  "REMOVE ALL PAUSES"          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Decide which words to remove                                       │
│  • Single: selected word(s) from the menu                                   │
│  • All:    every caption word that is a "pause" (and meets duration filter)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Find "pause" words                                                 │
│  • App looks at caption text: "Is this word a silence/pause?" (e.g. NZ)     │
│  • Optional: "Only pauses longer than X seconds" (pauseRemoveDuration)        │
│  • Result: list of word IDs to remove                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Remove each word from the timeline                                │
│  For each word (or batch):                                                 │
│    • Get its time range on the caption track                                │
│    • If whole section: delete that section from caption + keyframe + voice  │
│    • If part of section: split at boundaries, delete the middle segment    │
│    • Then "recompact" the timeline (close gaps)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Save & notify                                                      │
│  • Save snapshot (for undo)                                                 │
│  • Fire analytics events (e.g. editor.caption.operation / editor.pause.remove)│
│  • Show success toast (e.g. "X silence frames removed")                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow diagram (single vs all)

```
                    ┌──────────────────┐
                    │  User clicks     │
                    │  Remove Pause   │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
   ┌─────────────────────┐       ┌─────────────────────┐
   │ Single-word button   │       │ "Remove all pauses"  │
   │ "Remove pause"       │       │ button              │
   └──────────┬───────────┘       └──────────┬──────────┘
              │                             │
              │  Words = selected word(s)   │  Words = all silence words
              │  (filtered by l.s)           │  (optional: duration ≥ X sec)
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  dropContinuousWords(batches)│
              │  • For each batch of word IDs│
              │  • Delete from:              │
              │    - Caption track           │
              │    - Keyframe (video) track  │
              │    - Voice enhancement track  │
              │  • Recompact timelines       │
              └─────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  Snapshot (undo) + events   │
              │  + toast (for "all")         │
              └─────────────────────────────┘
```

---

## Key ideas

1. **Pause = silence word**  
   The app marks some caption words as “pause/silence” (e.g. via a check like `NZ(text)`). Only those are candidates for “remove pause.”

2. **Same removal for one or many**  
   Both “Remove pause” (single) and “Remove all pauses” call the same core: **dropContinuousWords** with a list of word IDs (single batch vs many batches of one ID).

3. **Three tracks stay in sync**  
   When a pause is removed, the same time range is removed from:
   - caption track  
   - keyframe (video) track  
   - voice enhancement track  

   Then timelines are recompacted so there are no gaps.

4. **Events fired**  
   - Single: **editor.caption.operation** (firstOperation: "Remove caption & video").  
   - All: **editor.pause.remove.attempt** then **editor.pause.remove**.

---

## Summary

**Remove Pause** = find pause/silence words in the caption → remove those words from caption, video, and voice tracks → save for undo and fire events. Single-word and “remove all” only differ in *which* words are selected; the removal logic is the same.
