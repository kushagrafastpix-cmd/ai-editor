# How B-Rolls JSON Data is Generated from opustimeline.js

This document explains in detail how b-rolls JSON data is generated from the timeline state in `opustimeline.js`, using concrete examples.

## Overview

B-rolls are supplementary video/images that overlay or replace parts of the main video track. They are stored in a `BRollTrack` class instance during editing, and when you save/export, this track is converted to plain JSON data that the rendering engine can use.

## The Complete Flow

### Step 1: B-Rolls Exist in Timeline State (During Editing)

During editing, b-rolls are stored as a **class instance** (`BRollTrack`) in the editor state:

```javascript
// In opustimeline.js state (during editing)
BRollTrack {
  id: "track-S4JNlU",
  trackType: "BRollTrack",
  sections: [
    SectionInstance {
      id: "section-DVbjyQ",
      sectionDuration: TimeRangeInstance { sO: 1000, eO: 4000, type: "TS" },
      sectionTimeline: TimelineInstance { in: 9280, out: 12280 },
      segments: [
        SegmentInstance {
          id: "segment-OlY56L",
          contentType: "BRoll",
          content: {
            id: "content-Iq9Gbo",
            bRollElements: [
              {
                content: {
                  brollType: "Stock",  // or "Prompt", "GenAi"
                  startMs: 9280,
                  endMs: 11500,
                  keyword: "debt",
                  broll: {
                    sourceId: "351656606",
                    insertType: "auto",  // or "manual", "select"
                    previewUrl: "https://...",
                    url: "https://...",
                    image: "https://...",
                    duration: 11,
                    mediaType: "Video"  // or "Image"
                  }
                },
                cropArea: { xPct: 0, yPct: 0, wPct: 0.316, hPct: 1 },
                targetArea: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
                duration: TimeRangeInstance { sO: 1000, eO: 4000, type: "TS" },
                timeline: TimelineInstance { in: 9280, out: 12280 }
              }
            ]
          },
          // ... methods and computed properties
        }
      ],
      // ... methods
    }
  ],
  // ... methods like updateSegmentBoundaries(), fillSectionBySecId(), etc.
}
```

**Key Points:**
- This is a **class instance** with methods and internal state
- `bRollElements` is an array containing the actual b-roll media items
- Each b-roll element has timing, crop areas, and media URLs
- Time values are stored as class instances (`TimeRangeInstance`, `TimelineInstance`)

---

### Step 2: Collect BRollTrack During Save (Line 44131)

When you save/export, the `saveClip` function collects all tracks, including the BRollTrack:

```javascript
// Location: opustimeline.js, line ~44125-44140
async function saveClip(...) {
  // Collect all track instances from editor state
  let j = a(N.XU.keyFrameTrack)      // KeyFrameTrack
  let S = a(N.XU.captionTrack)        // CaptionTrack
  let k = a(N.XU.emojiTrack)          // EmojiTrack
  let I = a(N.XU.brollTrack)          // BRollTrack ← B-rolls track
  let O = a(N.XU.mediaTrack)          // MediaTrack
  let M = a(N.XU.videoEffectTrack)    // VideoEffectTrack
  let P = a(N.XU.textOverlayTrack)    // TextOverlayTrack
  let R = a(N.XU.voiceoverTrack)      // VoiceOverTrack
  let K = a(N.XU.voiceEnhancementTrack) // VoiceEnhancementTrack
  let L = a(N.XU.soundTrack)          // SoundTrack
  
  // Combine all tracks, filtering out null/undefined
  let H = {
    tracks: [j, S, k, I, O, M, P, R, K, L].filter(o.s)
    // I = BRollTrack instance (still a class instance at this point)
  }
}
```

**What happens:**
- `I` contains the `BRollTrack` class instance (if b-rolls exist)
- If no b-rolls were added, `I` will be `null` or `undefined`
- The `.filter(o.s)` removes any null/undefined tracks

---

### Step 3: Serialize Tracks to Plain Objects (Line 44141-44142)

The tracks are converted from class instances to plain JSON-serializable objects:

```javascript
// Location: opustimeline.js, line ~44141-44142
let G = (0, g.Z)(H)  // Serialize all tracks
```

**What `g.Z` does:**

The `g.Z` function performs **serialization** - it extracts only the **data properties** from class instances and converts them to plain objects:

**Input (BRollTrack class instance):**
```javascript
BRollTrack {
  id: "track-S4JNlU",
  trackType: "BRollTrack",
  sections: [SectionInstance, ...],
  updateSegmentBoundaries: function() {...},  // ❌ Method - will be ignored
  fillSectionBySecId: function() {...},      // ❌ Method - will be ignored
  _cache: new Map()                           // ❌ Internal state - will be ignored
}
```

**Output (Plain object):**
```javascript
{
  id: "track-S4JNlU",
  trackType: "BRollTrack",
  sections: [
    {
      id: "section-DVbjyQ",
      sectionDuration: { sO: 1000, eO: 4000, type: "TS" },  // ✅ Plain object
      sectionTimeline: { in: 9280, out: 12280 },             // ✅ Plain object
      segments: [
        {
          id: "segment-OlY56L",
          contentType: "BRoll",
          content: {
            id: "content-Iq9Gbo",
            bRollElements: [
              {
                content: {
                  brollType: "Stock",
                  startMs: 9280,
                  endMs: 11500,
                  keyword: "debt",
                  width: 1920,
                  height: 1080,
                  speed: 1.5,
                  broll: {
                    sourceId: "351656606",
                    insertType: "auto",
                    previewUrl: "https://...",
                    url: "https://...",
                    image: "https://...",
                    duration: 11,
                    mediaType: "Video"
                  },
                  id: "broll-content-gwrXLB"
                },
                cropArea: { xPct: 0, yPct: 0, wPct: 0.31640625, hPct: 1 },
                targetArea: { xPct: 0, yPct: 0, wPct: 1, hPct: 1 },
                duration: { type: "TS", sO: 1000, eO: 4000 },  // ✅ Plain object
                timeline: { in: 9280, out: 12280 }              // ✅ Plain object
              }
            ],
            duration: { sO: 1000, eO: 4000, type: "TS" },
            timeline: { in: 9280, out: 12280 }
          },
          duration: { type: "TS", sO: 1000, eO: 4000 },
          timeline: { in: 9280, out: 12280 }
        }
      ]
    }
  ]
}
```

**Key transformations:**
- ✅ Methods are removed (not needed for rendering)
- ✅ Class instances (`TimeRangeInstance`, `TimelineInstance`) become plain objects
- ✅ All data properties are preserved
- ✅ `bRollElements` array is fully serialized with all nested properties

---

### Step 4: Remove Pending Sections (Line 44143)

After serialization, incomplete edits are cleaned up:

```javascript
// Location: opustimeline.js, line ~44143
let Y = F.removePendingSections(G)
```

**What `removePendingSections` does:**

1. **Removes "add" type pending sections**: If a b-roll was being added but not completed, it's removed
2. **Restores previous snapshots**: For "update" type pending sections, restores the previous state
3. **Recalculates timelines**: Updates `sectionTimeline` and `segment.timeline` values based on cleaned sections
4. **Filters out null/undefined**: Removes any sections that became null during processing

**Example:**

**Before cleanup:**
```javascript
{
  sections: [
    { id: "section-complete", ... },      // ✅ Complete section
    { id: "section-pending-add", ... },   // ❌ Pending "add" - will be removed
    { id: "section-pending-update", ... } // ⚠️ Pending "update" - will restore snapshot
  ]
}
```

**After cleanup:**
```javascript
{
  sections: [
    { id: "section-complete", ... }  // ✅ Only complete sections remain
  ]
}
```

This ensures only **complete, valid b-roll edits** are exported for rendering.

---

### Step 5: Create clipBody Object (Lines 44188-44191)

The cleaned editing script is wrapped in a `clipBody` object:

```javascript
// Location: opustimeline.js, line ~44188-44191
let t = {
  editingScript: Y,                    // Contains serialized BRollTrack
  renderPreferenceOverride: X          // Render preferences
}
```

**Structure:**
```javascript
{
  editingScript: {
    tracks: [
      // ... other tracks ...
      {
        id: "track-S4JNlU",
        trackType: "BRollTrack",
        sections: [
          // ... b-roll sections ...
        ]
      }
    ]
  },
  renderPreferenceOverride: {
    enableBroll: null,  // or true/false
    // ... other preferences ...
  }
}
```

---

### Step 6: Convert to JSON String (Line 44192)

The object is converted to a JSON string:

```javascript
// Location: opustimeline.js, line ~44192
let a = JSON.stringify(t)
```

**Result:** A JSON string ready to send to the backend.

---

### Step 7: Send to Backend (Lines 44231-44248)

The JSON is either:
- **Sent directly** if small enough
- **Uploaded to cloud storage** if too large, then the path is sent

```javascript
// Location: opustimeline.js, line ~44231-44248
if (l) {  // If data is too large
  // Upload to cloud storage
  let {url: e} = await el({ usecase: "ClipReRender", extension: "json" })
  let t = new File([a], "data.json", { type: "application/json" })
  await ea.uploadFile(t, e, {...})
  await B(ed, eu, y, {
    clipBodyPath: decodeURIComponent(e)  // Send path
  })
} else {
  // Send directly
  await B(ed, eu, y, {
    clipBody: t  // Send clipBody object directly
  })
}
```

---

## Real Example: Complete B-Roll JSON Structure

Here's a complete example from `opusresultjson.js` showing what the final b-roll JSON looks like:

### Example 1: Stock B-Roll (Auto-inserted)

```json
{
  "id": "track-S4JNlU",
  "trackType": "BRollTrack",
  "sections": [
    {
      "id": "section-DVbjyQ",
      "sectionDuration": {
        "sO": 1000,
        "eO": 4000,
        "type": "TS"
      },
      "sectionTimeline": {
        "in": 9280,
        "out": 12280
      },
      "segments": [
        {
          "id": "segment-OlY56L",
          "contentType": "BRoll",
          "content": {
            "id": "content-Iq9Gbo",
            "bRollElements": [
              {
                "content": {
                  "brollType": "Stock",
                  "startMs": 9280,
                  "endMs": 11500,
                  "keyword": "debt",
                  "width": 1920,
                  "height": 1080,
                  "speed": 1.5,
                  "broll": {
                    "sourceId": "351656606",
                    "insertType": "auto",
                    "previewUrl": "https://dm0qx8t0i9gc9.cloudfront.net/...",
                    "url": "https://dm0qx8t0i9gc9.cloudfront.net/...",
                    "image": "https://dm0qx8t0i9gc9.cloudfront.net/...",
                    "duration": 11,
                    "mediaType": "Video"
                  },
                  "id": "broll-content-gwrXLB"
                },
                "cropArea": {
                  "xPct": 0,
                  "yPct": 0,
                  "wPct": 0.31640625,
                  "hPct": 1
                },
                "targetArea": {
                  "xPct": 0,
                  "yPct": 0,
                  "wPct": 1,
                  "hPct": 1
                },
                "duration": {
                  "type": "TS",
                  "sO": 1000,
                  "eO": 4000
                },
                "timeline": {
                  "in": 9280,
                  "out": 12280
                }
              }
            ],
            "duration": {
              "sO": 1000,
              "eO": 4000,
              "type": "TS"
            },
            "timeline": {
              "in": 9280,
              "out": 12280
            }
          },
          "duration": {
            "type": "TS",
            "sO": 1000,
            "eO": 4000
          },
          "timeline": {
            "in": 9280,
            "out": 12280
          }
        }
      ]
    }
  ]
}
```

### Example 2: AI-Generated B-Roll (Prompt-based)

```json
{
  "id": "track-S4JNlU",
  "trackType": "BRollTrack",
  "sections": [
    {
      "id": "section-VG5aFp",
      "sectionDuration": {
        "sO": 1000,
        "eO": 4000,
        "type": "TS"
      },
      "sectionTimeline": {
        "in": 18667,
        "out": 21667
      },
      "segments": [
        {
          "id": "segment-CDsjRl",
          "contentType": "BRoll",
          "content": {
            "id": "content-tLzJ9z",
            "bRollElements": [
              {
                "content": {
                  "id": "broll-content-Qxt9LL",
                  "brollType": "Prompt",
                  "startMs": 18667,
                  "endMs": 21667,
                  "keyword": "",
                  "genAiImagePrompt": "this is a comedy show where a person is standing and doing comedy and all the audiednce is laughing",
                  "width": 768,
                  "height": 1344,
                  "broll": {
                    "sourceId": "",
                    "insertType": "manual",
                    "image": "https://ext.cdn.opus.pro/media/.../low_res_image.png",
                    "duration": 0,
                    "previewStaticImageUrl": "https://ext.cdn.opus.pro/media/.../image.png",
                    "previewLowResImageUrl": "https://ext.cdn.opus.pro/media/.../low_res_image.png",
                    "previewUrl": "",
                    "url": "",
                    "mediaType": "Image"
                  }
                },
                "cropArea": {
                  "wPct": 0.984375,
                  "hPct": 1,
                  "xPct": 0,
                  "yPct": 0,
                  "type": "CPct"
                },
                "targetArea": {
                  "wPct": 1,
                  "hPct": 1,
                  "xPct": 0,
                  "yPct": 0,
                  "type": "CPct"
                },
                "duration": {
                  "type": "TS",
                  "sO": 1000,
                  "eO": 4000
                },
                "timeline": {
                  "in": 18667,
                  "out": 21667
                }
              }
            ],
            "duration": {
              "sO": 1000,
              "eO": 4000,
              "type": "TS"
            },
            "timeline": {
              "in": 18667,
              "out": 21667
            }
          },
          "duration": {
            "type": "TS",
            "sO": 1000,
            "eO": 4000
          },
          "timeline": {
            "in": 18667,
            "out": 21667
          }
        }
      ]
    }
  ]
}
```

---

## Key Data Structures Explained

### B-Roll Types

B-rolls can be one of three types:

1. **`"Stock"`**: Stock video/image from a media library
   - Has `sourceId`, `previewUrl`, `url`
   - `insertType` can be `"auto"` (AI-selected) or `"manual"` (user-selected)

2. **`"Prompt"`**: AI-generated image from a text prompt
   - Has `genAiImagePrompt` with the text prompt
   - `mediaType` is always `"Image"`
   - `insertType` is usually `"manual"`

3. **`"GenAi"`**: AI-generated based on video content analysis
   - Similar to Prompt but generated automatically from video analysis

### Time Values

All time values use the **TS (TimeStamp) format**:

```javascript
{
  sO: 1000,    // Start Offset (in milliseconds)
  eO: 4000,    // End Offset (in milliseconds)
  type: "TS"   // Type identifier
}
```

### Timeline vs Duration

- **`sectionDuration`**: Duration in the **source video** time
- **`sectionTimeline`**: Position on the **edited timeline** (after cuts/edits)
- **`timeline`**: Position on timeline for segments/b-roll elements
- **`duration`**: Duration for segments/b-roll elements

**Example:**
```javascript
{
  sectionDuration: { sO: 1000, eO: 4000, type: "TS" },  // 3 seconds in source
  sectionTimeline: { in: 9280, out: 12280 },            // Appears at 9.28s-12.28s in final video
  timeline: { in: 9280, out: 12280 },                   // Same as sectionTimeline for segments
  duration: { sO: 1000, eO: 4000, type: "TS" }         // 3 seconds duration
}
```

### Crop and Target Areas

B-rolls have two area definitions:

1. **`cropArea`**: The portion of the source media to use (crop rectangle)
   ```javascript
   {
     xPct: 0,           // X position (0-1, percentage)
     yPct: 0,           // Y position (0-1, percentage)
     wPct: 0.31640625,  // Width (0-1, percentage)
     hPct: 1            // Height (0-1, percentage)
   }
   ```

2. **`targetArea`**: Where to place it on the canvas
   ```javascript
   {
     xPct: 0,  // X position on canvas
     yPct: 0,  // Y position on canvas
     wPct: 1,  // Width on canvas
     hPct: 1   // Height on canvas
   }
   ```

---

## Summary: The Complete Transformation

| Stage | What It Is | Example |
|-------|------------|---------|
| **1. During Editing** | `BRollTrack` class instance with methods | `new BRollTrack({...})` |
| **2. Collection** | Class instance collected from state | `let I = a(N.XU.brollTrack)` |
| **3. Serialization** | Converted to plain object | `g.Z(H)` → plain object |
| **4. Cleanup** | Pending sections removed | `removePendingSections(G)` |
| **5. Wrapping** | Wrapped in `clipBody` | `{ editingScript: Y, ... }` |
| **6. Stringify** | Converted to JSON string | `JSON.stringify(t)` |
| **7. Export** | Sent to backend | `await B(..., { clipBody: t })` |

**Key Points:**
- ✅ B-rolls start as class instances with methods
- ✅ Serialization extracts only data (no methods)
- ✅ Time values become plain objects (`{sO, eO, type: "TS"}`)
- ✅ `bRollElements` array is fully preserved with all properties
- ✅ Only complete, valid b-rolls are exported
- ✅ Final JSON can be used by the rendering engine

---

## Code Locations Reference

- **Collection**: `opustimeline.js` line ~44131
- **Serialization**: `opustimeline.js` line ~44141-44142 (`g.Z`)
- **Cleanup**: `opustimeline.js` line ~44143 (`removePendingSections`)
- **JSON Creation**: `opustimeline.js` line ~44188-44192
- **Export**: `opustimeline.js` line ~44231-44248
- **Example Output**: `opusresultjson.js` line ~9570-9742

---

## Why This Process Exists

1. **Class instances can't be JSON.stringify'd**: Methods and internal state would be lost
2. **Backend needs plain data**: Rendering engine doesn't need JavaScript methods
3. **Network transmission**: Only plain JSON can be sent over HTTP
4. **Data integrity**: Serialization ensures all necessary data is preserved
5. **Clean exports**: `removePendingSections` ensures only complete edits are exported

The serialization process (`g.Z`) is the bridge between the **editor's working state** (rich objects with methods) and the **export format** (plain data for rendering).
