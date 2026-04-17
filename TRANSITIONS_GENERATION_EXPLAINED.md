# How Transitions JSON Data is Generated from opustimeline.js

This document explains the complete flow of how transition data flows from the editor state in `opustimeline.js` to the final JSON format in `opusresultjson.js`.

## Overview

Transitions are stored in a **VideoEffectTrack** and converted through several steps:
1. **User adds transition** → Stored in VideoEffectTrack instance
2. **Track collection** → VideoEffectTrack is collected with other tracks
3. **Serialization** → Track instance converted to plain object (`g.Z`)
4. **Cleanup** → Pending sections removed (`removePendingSections`)
5. **Final JSON** → Plain object structure ready for export

---

## Step-by-Step: Transition Generation Flow

### Step 1: Transition Creation in Editor (opustimeline.js ~line 28497)

When a user adds a transition (e.g., "crossFade"), a new section is created and pushed to the VideoEffectTrack:

```javascript
// Line 28489-28539 in opustimeline.js
let N = e(v.XU.videoEffectTrackInstance);  // Get VideoEffectTrack instance

if (E.enableAutoTransition && E.selectedTransitions) {
  // Create a new section for the transition
  N.sections.push(new s.i(
    function(e, t, n) {  // e=startTime, t=endTime, n=transitionType
      let i = t - e;  // Duration
      return {
        sceneId: "S.000",
        sectionDuration: {
          type: "TS",
          sO: e,        // Start offset
          eO: t - e     // End offset (duration)
        },
        sectionTimeline: {
          in: e,        // Timeline start
          out: t        // Timeline end
        },
        segments: [{
          contentType: "VideoEffect",
          content: {
            effectType: n,  // e.g., "crossFade", "zoomIn"
            effectParams: (0, A.j$)(i)[n],  // Generate effect parameters
            duration: {
              type: "TS",
              sO: 0,
              eO: i
            },
            timeline: {
              in: e,
              out: t
            }
          },
          duration: {
            type: "TS",
            sO: 0,
            eO: i
          },
          timeline: {
            in: e,
            out: t
          },
          id: "seg-effect"
        }],
        id: "sec-effect"
      }
    }(R, R + 3e3, E.selectedTransitions[0]), N)
  );
}
```

**Key Points**:
- `R` = start time (e.g., 15326ms)
- `R + 3e3` = end time (start + 3000ms = 18326ms)
- `E.selectedTransitions[0]` = transition type (e.g., "crossFade")
- `A.j$` = function that generates effect parameters based on duration and type

### Step 2: Effect Parameters Generation

The `A.j$` function generates the animation parameters for the transition. For example:

**For "crossFade"** (fade transition):
```javascript
effectParams: [
  {
    alpha: 1,              // Start: fully opaque
    effectTimestamp: 0,    // At time 0ms
    mode: "bezier"         // Bezier curve interpolation
  },
  {
    alpha: 0,              // Middle: fully transparent
    effectTimestamp: 1294, // At time 1294ms (middle of transition)
    mode: "bezier"
  },
  {
    alpha: 1,              // End: fully opaque again
    effectTimestamp: 2588, // At time 2588ms (end)
    mode: "bezier"
  }
]
```

**For "zoomIn"** (zoom transition):
```javascript
effectParams: [
  {
    zoomScale: 1,          // Start: normal scale
    effectTimestamp: 0,    // At time 0ms
    mode: "linear"         // Linear interpolation
  },
  {
    zoomScale: 1.5,        // End: zoomed in 1.5x
    effectTimestamp: 1000, // At time 1000ms (end)
    mode: "linear"
  }
]
```

### Step 3: Track Collection (opustimeline.js ~line 44132)

When saving/exporting, the VideoEffectTrack is collected with other tracks:

```javascript
// Line 44132 in opustimeline.js
let M = a(N.XU.videoEffectTrack)  // Get VideoEffectTrack instance

let H = {
  tracks: [j, S, k, I, O, M, P, R, K, L].filter(o.s)
  // M = VideoEffectTrack instance
}
```

**At this point**, `M` is still a **class instance** with:
- Methods (e.g., `updateSegmentBoundaries()`)
- Internal state
- Computed properties
- Section objects that are also class instances

### Step 4: Serialization (`g.Z` function)

The `g.Z` function converts the VideoEffectTrack instance to a plain object:

```javascript
// Line 44142 in opustimeline.js
let G = (0, g.Z)(H)  // Serialize all tracks
```

**Before (VideoEffectTrack Instance)**:
```javascript
VideoEffectTrack {
  id: "track-zYnvFg",
  trackType: "VideoEffectTrack",
  sections: [
    SectionInstance {
      id: "section-utZqJR",
      sectionDuration: TimeRangeInstance {...},
      sectionTimeline: TimelineInstance {...},
      segments: [
        SegmentInstance {
          contentType: "VideoEffect",
          content: EffectContentInstance {
            effectType: "crossFade",
            effectParams: [...],
            duration: TimeRangeInstance {...},
            timeline: TimelineInstance {...}
          },
          duration: TimeRangeInstance {...},
          timeline: TimelineInstance {...}
        }
      ],
      sceneId: "S.000"
    }
  ],
  // ... methods and internal state
}
```

**After (`g.Z` conversion)**:
```javascript
{
  id: "track-zYnvFg",
  trackType: "VideoEffectTrack",
  sections: [
    {
      id: "section-utZqJR",
      sectionDuration: {
        sO: 0,
        eO: 1000,
        sOAdj: 0,
        eOAdj: 2588,
        type: "TS"
      },
      sectionTimeline: {
        in: 15326,
        out: 17914
      },
      segments: [
        {
          id: "segment-d1v3rs",
          contentType: "VideoEffect",
          content: {
            id: "content-k3TkYu",
            effectType: "crossFade",
            effectParams: [
              {
                alpha: 1,
                effectTimestamp: 0,
                mode: "bezier"
              },
              {
                alpha: 0,
                effectTimestamp: 1294,
                mode: "bezier"
              },
              {
                alpha: 1,
                effectTimestamp: 2588,
                mode: "bezier"
              }
            ],
            duration: {
              sO: 0,
              eO: 1000,
              sOAdj: 0,
              eOAdj: 2588,
              type: "TS"
            },
            timeline: {
              in: 15326,
              out: 17914
            }
          },
          duration: {
            sO: 0,
            eO: 1000,
            sOAdj: 0,
            eOAdj: 2588,
            type: "TS"
          },
          timeline: {
            in: 15326,
            out: 17914
          }
        }
      ],
      sceneId: "S.000"
    }
  ]
}
```

**Key Changes**:
- ✅ All class instances converted to plain objects
- ✅ Methods removed
- ✅ TimeRange objects flattened to `{sO, eO, type: "TS"}` format
- ✅ Timeline objects flattened to `{in, out}` format
- ✅ All nested structures preserved as plain data

### Step 5: Remove Pending Sections (`removePendingSections`)

```javascript
// Line 44143 in opustimeline.js
let Y = F.removePendingSections(G)
```

This function:
- Removes incomplete transitions that were being added but not finished
- Restores previous snapshots for transitions being updated
- Recalculates timeline positions if sections were removed
- Filters out null/undefined sections

### Step 6: Final JSON Structure (opusresultjson.js)

The final exported JSON structure:

```javascript
{
  "targets": ["VIDEO_PREVIEW", "VIDEO_FILE"],
  "clipBody": {
    "editingScript": {
      "tracks": [
        // ... other tracks ...
        {
          "id": "track-zYnvFg",
          "trackType": "VideoEffectTrack",
          "sections": [
            {
              "id": "section-utZqJR",
              "sectionDuration": {
                "sO": 0,
                "eO": 1000,
                "sOAdj": 0,
                "eOAdj": 2588,
                "type": "TS"
              },
              "sectionTimeline": {
                "in": 15326,
                "out": 17914
              },
              "segments": [
                {
                  "id": "segment-d1v3rs",
                  "contentType": "VideoEffect",
                  "content": {
                    "id": "content-k3TkYu",
                    "effectType": "crossFade",
                    "effectParams": [
                      {
                        "alpha": 1,
                        "effectTimestamp": 0,
                        "mode": "bezier"
                      },
                      {
                        "alpha": 0,
                        "effectTimestamp": 1294,
                        "mode": "bezier"
                      },
                      {
                        "alpha": 1,
                        "effectTimestamp": 2588,
                        "mode": "bezier"
                      }
                    ],
                    "duration": {
                      "sO": 0,
                      "eO": 1000,
                      "sOAdj": 0,
                      "eOAdj": 2588,
                      "type": "TS"
                    },
                    "timeline": {
                      "in": 15326,
                      "out": 17914
                    }
                  },
                  "duration": {
                    "sO": 0,
                    "eO": 1000,
                    "sOAdj": 0,
                    "eOAdj": 2588,
                    "type": "TS"
                  },
                  "timeline": {
                    "in": 15326,
                    "out": 17914
                  }
                }
              ],
              "sceneId": "S.000"
            }
          ]
        }
      ]
    },
    "renderPreferenceOverride": {
      "enableAutoTransition": true,
      "selectedTransitions": ["crossFade"],
      // ... other preferences
    }
  }
}
```

---

## Transition Data Structure Explained

### Section Level
- **`sectionDuration`**: Duration in source video time units
  - `sO`: Start offset (usually 0 for transitions)
  - `eO`: End offset (duration)
  - `sOAdj`/`eOAdj`: Adjusted offsets (for effects that need more time)
- **`sectionTimeline`**: Position on the edited timeline
  - `in`: Start time on timeline (milliseconds)
  - `out`: End time on timeline (milliseconds)

### Segment Level
- **`contentType`**: Always `"VideoEffect"` for transitions
- **`content.effectType`**: Type of transition
  - `"crossFade"`: Fade transition
  - `"zoomIn"`: Zoom in effect
  - `"zoomOut"`: Zoom out effect
  - `"fadeIn"`: Fade in
  - `"fadeOut"`: Fade out
  - etc.

### Effect Parameters (`effectParams`)

The `effectParams` array defines keyframes for the animation:

**For fade transitions** (`crossFade`, `fadeIn`, `fadeOut`):
```javascript
effectParams: [
  {
    alpha: 1,              // Opacity value (0-1)
    effectTimestamp: 0,   // Time position (ms)
    mode: "bezier"        // Interpolation mode
  },
  // ... more keyframes
]
```

**For zoom transitions** (`zoomIn`, `zoomOut`):
```javascript
effectParams: [
  {
    zoomScale: 1,          // Scale value (1 = normal, >1 = zoomed)
    effectTimestamp: 0,   // Time position (ms)
    mode: "linear"        // Interpolation mode
  },
  // ... more keyframes
]
```

**Interpolation Modes**:
- `"bezier"`: Smooth curve interpolation (for fades)
- `"linear"`: Linear interpolation (for zooms)

---

## Complete Example: CrossFade Transition

### 1. User Action
User adds a "crossFade" transition at timeline position 15326ms with duration 3000ms.

### 2. Editor State (opustimeline.js)
```javascript
VideoEffectTrackInstance {
  sections: [
    SectionInstance {
      id: "section-utZqJR",
      sectionTimeline: { in: 15326, out: 18326 },
      segments: [
        SegmentInstance {
          content: {
            effectType: "crossFade",
            effectParams: [
              { alpha: 1, effectTimestamp: 0, mode: "bezier" },
              { alpha: 0, effectTimestamp: 1294, mode: "bezier" },
              { alpha: 1, effectTimestamp: 2588, mode: "bezier" }
            ]
          }
        }
      ]
    }
  ]
}
```

### 3. After Serialization (`g.Z`)
```javascript
{
  trackType: "VideoEffectTrack",
  sections: [
    {
      id: "section-utZqJR",
      sectionTimeline: { in: 15326, out: 17914 },
      segments: [
        {
          contentType: "VideoEffect",
          content: {
            effectType: "crossFade",
            effectParams: [
              { alpha: 1, effectTimestamp: 0, mode: "bezier" },
              { alpha: 0, effectTimestamp: 1294, mode: "bezier" },
              { alpha: 1, effectTimestamp: 2588, mode: "bezier" }
            ],
            timeline: { in: 15326, out: 17914 }
          }
        }
      ]
    }
  ]
}
```

### 4. Final JSON (opusresultjson.js)
```json
{
  "id": "track-zYnvFg",
  "trackType": "VideoEffectTrack",
  "sections": [
    {
      "id": "section-utZqJR",
      "sectionDuration": {
        "sO": 0,
        "eO": 1000,
        "sOAdj": 0,
        "eOAdj": 2588,
        "type": "TS"
      },
      "sectionTimeline": {
        "in": 15326,
        "out": 17914
      },
      "segments": [
        {
          "id": "segment-d1v3rs",
          "contentType": "VideoEffect",
          "content": {
            "id": "content-k3TkYu",
            "effectType": "crossFade",
            "effectParams": [
              {
                "alpha": 1,
                "effectTimestamp": 0,
                "mode": "bezier"
              },
              {
                "alpha": 0,
                "effectTimestamp": 1294,
                "mode": "bezier"
              },
              {
                "alpha": 1,
                "effectTimestamp": 2588,
                "mode": "bezier"
              }
            ],
            "duration": {
              "sO": 0,
              "eO": 1000,
              "sOAdj": 0,
              "eOAdj": 2588,
              "type": "TS"
            },
            "timeline": {
              "in": 15326,
              "out": 17914
            }
          },
          "duration": {
            "sO": 0,
            "eO": 1000,
            "sOAdj": 0,
            "eOAdj": 2588,
            "type": "TS"
          },
          "timeline": {
            "in": 15326,
            "out": 17914
          }
        }
      ],
      "sceneId": "S.000"
    }
  ]
}
```

---

## Key Takeaways

1. **Transitions are stored in VideoEffectTrack**: Each transition is a section with a VideoEffect segment
2. **Effect parameters define animation**: The `effectParams` array contains keyframes that define how the transition animates
3. **Serialization converts instances to data**: `g.Z` removes all methods and converts class instances to plain objects
4. **Timeline positions are preserved**: Both `sectionTimeline` and `segment.timeline` maintain the transition's position
5. **Duration can be adjusted**: `sOAdj`/`eOAdj` allow for effects that need more rendering time than the base duration

This structure allows the rendering engine to:
- Know **where** transitions occur (timeline positions)
- Know **what type** of transition (effectType)
- Know **how** to animate it (effectParams with keyframes)
- Apply transitions smoothly between video segments
