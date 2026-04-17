# How BRollTrack Class Instances Are Created: The Complete Logic

This document explains how `BRollTrack` class instances are created from plain JSON data, including how `TimeRangeInstance` and `TimelineInstance` objects are generated.

## Overview

The `BRollTrack` class instance is created in two directions:

1. **Loading/Deserialization**: Plain JSON → Class Instance (with `TimeRangeInstance`, `TimelineInstance`)
2. **Saving/Serialization**: Class Instance → Plain JSON (already covered in `BROLLS_GENERATION_EXPLAINED.md`)

This document focuses on **how class instances are created** (the loading/deserialization process).

---

## The Two-Way Conversion Process

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAIN JSON DATA                           │
│  { sO: 1000, eO: 4000, type: "TS" }                         │
│  { in: 9280, out: 12280 }                                    │
└─────────────────────────────────────────────────────────────┘
                        ↕
        ┌───────────────┴───────────────┐
        │                               │
        ↓                               ↓
┌──────────────────┐          ┌──────────────────┐
│  LOADING         │          │  SAVING          │
│  (Constructor)   │          │  (.parse())      │
│                  │          │                  │
│  Plain → Class   │          │  Class → Plain   │
└──────────────────┘          └──────────────────┘
        │                               │
        ↓                               ↓
┌─────────────────────────────────────────────────────────────┐
│              CLASS INSTANCES (During Editing)                 │
│  TimeRangeInstance { sO: 1000, eO: 4000, type: "TS" }       │
│  TimelineInstance { in: 9280, out: 12280 }                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Creating Class Instances from Plain Data

There are **two scenarios** where `BRollTrack` class instances are created:

1. **Loading existing project**: Plain JSON from saved file/backend → Class Instance
2. **New project (first b-roll)**: API response/user selection (plain objects) → Class Instance

---

### Scenario A: Loading Existing Project

#### Step 1: Plain JSON Data Arrives

When loading a saved project or receiving data from the backend, you get **plain JSON objects**:

```javascript
// Plain JSON (from backend or saved file)
{
  "id": "track-S4JNlU",
  "trackType": "BRollTrack",
  "sections": [
    {
      "id": "section-DVbjyQ",
      "sectionDuration": {
        "sO": 1000,      // ← Plain object
        "eO": 4000,      // ← Plain object
        "type": "TS"
      },
      "sectionTimeline": {
        "in": 9280,      // ← Plain object
        "out": 12280     // ← Plain object
      },
      "segments": [
        {
          "id": "segment-OlY56L",
          "contentType": "BRoll",
          "content": {
            "bRollElements": [
              {
                "duration": {
                  "sO": 1000,    // ← Plain object
                  "eO": 4000,    // ← Plain object
                  "type": "TS"
                },
                "timeline": {
                  "in": 9280,    // ← Plain object
                  "out": 12280   // ← Plain object
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Key Point**: All time values are **plain objects** (`{sO, eO, type}` or `{in, out}`), not class instances.

---

#### Step 2: BRollTrack Constructor is Called

When loading this data, the `BRollTrack` constructor is called with the plain JSON object:

```javascript
// Location: opustimeline.js, line ~44026-44029
let w = n.tracks.find(e => "BRollTrack" === e.trackType);
if (w) {
  let e = new a.B(w);  // ← Constructor called with plain JSON object
  t(N.XU.brollTrackInstance, e)
}
```

**What happens:**
- `w` is the plain JSON object from the editing script
- `new a.B(w)` creates a new `BRollTrack` class instance
- The constructor (`a.B`) receives the plain JSON and converts it to class instances

---

### Scenario B: New Project (First B-Roll)

#### Step 1: No Existing B-Roll Track

For a **new project**, there is no existing b-roll data:

```javascript
// Location: opustimeline.js, line ~35128
let a = e(j.XU.brollTrack)  // ← Returns null or undefined for new project
```

**Initial state:**
- `brollTrack` in state is `null` or `undefined`
- `brollTrackInstance` is also `null` or `undefined`
- No existing sections or segments

#### Step 2: User Adds First B-Roll (API Response)

When a user adds their first b-roll (via AI generation, stock selection, or manual upload), the system receives data from the API or user selection:

```javascript
// Location: opustimeline.js, line ~40590-40675
// API returns b-roll data structured as plain objects
let brollDataFromAPI = {
  sections: [
    {
      id: "section-abc123",
      sectionDuration: {
        sO: 1000,    // ← Plain object from API
        eO: 4000,    // ← Plain object from API
        type: "TS"
      },
      sectionTimeline: {
        in: 9280,    // ← Calculated from startMs
        out: 11500   // ← Calculated from endMs
      },
      segments: [{
        id: "segment-xyz789",
        contentType: "BRoll",
        content: {
          bRollElements: [{
            content: {
              brollType: "Stock",
              startMs: 9280,
              endMs: 11500,
              keyword: "debt",
              broll: {
                sourceId: "351656606",
                previewUrl: "https://...",
                // ... other media URLs
              }
            },
            duration: {
              sO: 1000,    // ← Plain object
              eO: 4000,    // ← Plain object
              type: "TS"
            },
            timeline: {
              in: 9280,    // ← Plain object
              out: 11500   // ← Plain object
            }
          }]
        },
        duration: { sO: 1000, eO: 4000, type: "TS" },
        timeline: { in: 9280, out: 11500 }
      }]
    }
  ]
};
```

**Key Point**: The API response is already structured as **plain objects** with `{sO, eO, type}` and `{in, out}` format, ready to be converted to class instances.

#### Step 3: appendBroll Handles New vs Existing Track

The `appendBroll` function handles both new and existing tracks:

```javascript
// Location: opustimeline.js, line ~35125-35148
let U = (0, C.T)(async (e, t, n) => {
  // n = new b-roll data from API (plain objects)
  
  let a = e(j.XU.brollTrack)  // Get existing track (null for new project)
    , s = a ? (0, r._)((0, i._)({}, a), {
        // If track exists: merge new sections with existing sections
        sections: null == a ? void 0 : a.sections.concat(
          null !== (o = null == n ? void 0 : n.sections) && void 0 !== o ? o : []
        )
      }) : n  // ← If no existing track (a is null): use n directly
    , c = 50 / s.sections.length
    , d = await M([], (e, t) => {
        // Process sections...
        e.content = (0, r._)((0, i._)({}, e.content), {
          brollType: e.content.brollType || "Stock"
        }),
        F(50 + c * (t + 1))
      }, () => {
        F()
      }, s);
  
  // Create class instance from plain object data
  d && t(j.XU.brollTrackInstance, new l.B(d))
})
```

**What happens for new project:**
1. `a = e(j.XU.brollTrack)` → returns `null` (no existing track)
2. Since `a` is falsy, `s = n` (use new b-roll data directly)
3. `s` contains plain objects with `{sO, eO, type}` and `{in, out}` from API
4. `new l.B(d)` creates `BRollTrack` class instance from plain objects
5. Constructor converts all plain objects to `TimeRangeInstance` and `TimelineInstance`

**What happens for existing project:**
1. `a = e(j.XU.brollTrack)` → returns existing track (class instance)
2. `a.parse()` converts existing track to plain object
3. Merge new sections (`n.sections`) with existing sections (`a.sections`)
4. `new l.B(d)` creates new `BRollTrack` instance from merged plain objects

#### Step 4: Constructor Converts Plain Objects to Class Instances

Whether loading from saved data or creating from API response, the constructor does the same thing:

```javascript
// Both scenarios end up here:
new BRollTrack(plainObjectData)

// Constructor converts:
// {sO: 1000, eO: 4000, type: "TS"} → TimeRangeInstance
// {in: 9280, out: 11500} → TimelineInstance
```

---

### Step 3: Constructor Logic (Inferred from Code Patterns)

---

### Step 3: Constructor Logic (Inferred from Code Patterns)

The `BRollTrack` constructor (minified as `a.B`) performs the following transformations:

#### 3.1: Convert `sectionDuration` Plain Object → `TimeRangeInstance`

```javascript
// Input (plain object):
sectionDuration: {
  sO: 1000,
  eO: 4000,
  type: "TS"
}

// Constructor logic (pseudo-code):
constructor(plainData) {
  this.sections = plainData.sections.map(section => {
    // Convert sectionDuration plain object to TimeRangeInstance
    this.sectionDuration = new TimeRangeInstance({
      sO: section.sectionDuration.sO,
      eO: section.sectionDuration.eO,
      type: section.sectionDuration.type
    });
    
    // TimeRangeInstance is a class that wraps time range data
    // It provides methods like:
    // - parse() - converts back to plain object
    // - getStart() - returns sO
    // - getEnd() - returns eO
    // - getDuration() - returns eO - sO
  });
}
```

**Result:**
```javascript
sectionDuration: TimeRangeInstance {
  sO: 1000,
  eO: 4000,
  type: "TS",
  parse: function() { return { sO: this.sO, eO: this.eO, type: this.type } },
  getStart: function() { return this.sO },
  getEnd: function() { return this.eO },
  getDuration: function() { return this.eO - this.sO }
}
```

#### 3.2: Convert `sectionTimeline` Plain Object → `TimelineInstance`

```javascript
// Input (plain object):
sectionTimeline: {
  in: 9280,
  out: 12280
}

// Constructor logic (pseudo-code):
this.sectionTimeline = new TimelineInstance({
  in: section.sectionTimeline.in,
  out: section.sectionTimeline.out
});

// TimelineInstance is a class that wraps timeline position data
// It provides methods like:
// - parse() - converts back to plain object
// - getIn() - returns in
// - getOut() - returns out
// - getDuration() - returns out - in
```

**Result:**
```javascript
sectionTimeline: TimelineInstance {
  in: 9280,
  out: 12280,
  parse: function() { return { in: this.in, out: this.out } },
  getIn: function() { return this.in },
  getOut: function() { return this.out },
  getDuration: function() { return this.out - this.in }
}
```

#### 3.3: Convert Segment `duration` and `timeline` → Class Instances

```javascript
// For each segment in sections:
segments: segments.map(segment => {
  // Convert duration plain object to TimeRangeInstance
  segment.duration = new TimeRangeInstance({
    sO: segment.duration.sO,
    eO: segment.duration.eO,
    type: segment.duration.type
  });
  
  // Convert timeline plain object to TimelineInstance
  segment.timeline = new TimelineInstance({
    in: segment.timeline.in,
    out: segment.timeline.out
  });
  
  // Also convert content.timeline and content.duration
  segment.content.duration = new TimeRangeInstance({...});
  segment.content.timeline = new TimelineInstance({...});
  
  // Convert bRollElements duration and timeline
  segment.content.bRollElements = segment.content.bRollElements.map(element => {
    element.duration = new TimeRangeInstance({
      sO: element.duration.sO,
      eO: element.duration.eO,
      type: element.duration.type
    });
    
    element.timeline = new TimelineInstance({
      in: element.timeline.in,
      out: element.timeline.out
    });
    
    return element;
  });
});
```

---

### Step 4: Complete Class Instance Structure

After the constructor runs, you have a fully-formed `BRollTrack` class instance:

```javascript
BRollTrack {
  id: "track-S4JNlU",
  trackType: "BRollTrack",
  sections: [
    SectionInstance {
      id: "section-DVbjyQ",
      sectionDuration: TimeRangeInstance {  // ✅ Class instance
        sO: 1000,
        eO: 4000,
        type: "TS",
        parse: function() {...},
        getStart: function() {...},
        getEnd: function() {...}
      },
      sectionTimeline: TimelineInstance {  // ✅ Class instance
        in: 9280,
        out: 12280,
        parse: function() {...},
        getIn: function() {...},
        getOut: function() {...}
      },
      segments: [
        SegmentInstance {
          id: "segment-OlY56L",
          contentType: "BRoll",
          duration: TimeRangeInstance {  // ✅ Class instance
            sO: 1000,
            eO: 4000,
            type: "TS",
            parse: function() {...}
          },
          timeline: TimelineInstance {  // ✅ Class instance
            in: 9280,
            out: 12280,
            parse: function() {...}
          },
          content: {
            bRollElements: [
              {
                duration: TimeRangeInstance {  // ✅ Class instance
                  sO: 1000,
                  eO: 4000,
                  type: "TS",
                  parse: function() {...}
                },
                timeline: TimelineInstance {  // ✅ Class instance
                  in: 9280,
                  out: 12280,
                  parse: function() {...}
                },
                content: {
                  brollType: "Stock",
                  startMs: 9280,
                  endMs: 11500,
                  // ... other properties
                }
              }
            ],
            duration: TimeRangeInstance {...},  // ✅ Class instance
            timeline: TimelineInstance {...}   // ✅ Class instance
          }
        }
      ]
    }
  ],
  // Methods available on BRollTrack:
  updateSegmentBoundaries: function() {...},
  fillSectionBySecId: function() {...},
  parse: function() {...}  // Converts back to plain object
}
```

---

## Part 2: How Time Values Are Calculated When Creating B-Rolls

When a user **adds a new b-roll** (either first b-roll or additional b-roll), the time values are calculated from the API response or user input:

### How API Response Becomes Plain Objects

The API response is transformed into the plain object structure before being passed to the constructor:

```javascript
// Location: opustimeline.js, line ~40598-40675
// Function that transforms API response to plain object structure

function transformApiResponseToPlainObjects(apiResponse, insertType) {
  return {
    trackType: "BRollTrack",
    sections: apiResponse.sections.map(section => ({
      id: section.id,
      sectionDuration: {
        sO: 1000,   // Default duration in source (3 seconds)
        eO: 4000,
        type: "TS"
      },
      sectionTimeline: {
        in: section.brollPrompt.startMs,   // From API response
        out: section.brollPrompt.endMs     // From API response
      },
      segments: section.segments.map(segment => ({
        id: segment.id,
        contentType: "BRoll",
        content: {
          duration: segment.duration,      // Already in {sO, eO, type} format
          timeline: segment.timeline,        // Already in {in, out} format
          bRollElements: [segment.content].map(element => ({
            content: {
              brollType: element.content.brollType,
              startMs: element.content.brollPrompt.startMs,
              endMs: element.content.brollPrompt.endMs,
              keyword: element.content.brollPrompt.prompt,
              broll: {
                sourceId: element.content.mediaInfo.sourceId,
                insertType: insertType,
                previewUrl: element.content.mediaInfo.previewUrl,
                url: element.content.mediaInfo.originUrl,
                // ... other properties
              }
            },
            duration: {
              sO: 1000,   // Duration in source video
              eO: 4000,
              type: "TS"
            },
            timeline: {
              in: element.content.brollPrompt.startMs,  // Position on timeline
              out: element.content.brollPrompt.endMs
            }
          }))
        },
        duration: segment.duration,  // {sO, eO, type}
        timeline: segment.timeline   // {in, out}
      }))
    }))
  };
}

// Then this plain object is passed to constructor:
let plainObjectData = transformApiResponseToPlainObjects(apiResponse, "auto");
let brollTrackInstance = new BRollTrack(plainObjectData);
// Constructor converts all plain objects to class instances
```

### Key Calculations:

1. **`sectionTimeline.in`** = `startMs` (when b-roll starts on timeline)
2. **`sectionTimeline.out`** = `endMs` (when b-roll ends on timeline)
3. **`sectionDuration`** = Usually defaults to `{sO: 1000, eO: 4000}` (3 seconds) unless specified
4. **`timeline.in/out`** = Same as `sectionTimeline.in/out` for segments
5. **`duration.sO/eO`** = Duration in source video (can differ from timeline duration if speed is applied)

---

## Part 3: Code Locations for Instance Creation

### Loading from JSON (Backend/Saved File)

```javascript
// Location: opustimeline.js, line ~44026-44029
let w = n.tracks.find(e => "BRollTrack" === e.trackType);
if (w) {
  let e = new a.B(w);  // ← Creates instance from plain JSON
  t(N.XU.brollTrackInstance, e)
}
```

### Creating from API Response

```javascript
// Location: opustimeline.js, line ~35147
d && t(j.XU.brollTrackInstance, new l.B(d))
// d is plain object from API, converted to class instance
```

### Updating Existing Instance

```javascript
// Location: opustimeline.js, line ~35806
return "BRollTrack" === A.trackType 
  ? t(w.XU.brollTrackInstance, new l.B(A))  // ← Recreates instance
  : ...
// A is plain object, converted to class instance
```

### Loading from Editing Script

```javascript
// Location: opustimeline.js, line ~36706
let t = await U(e);
t && l(b.XU.brollTrackInstance, new a.B(t))
// t is plain object from editing script, converted to class instance
```

---

## Part 4: The `.parse()` Method (Reverse Process)

When saving, the `.parse()` method converts class instances back to plain objects:

```javascript
// Location: opustimeline.js, line ~34012
S = null === (a = e(j.XU.brollTrackInstance)) || void 0 === a ? void 0 : a.parse()

// What .parse() does:
parse() {
  return {
    id: this.id,
    trackType: this.trackType,
    sections: this.sections.map(section => ({
      id: section.id,
      sectionDuration: section.sectionDuration.parse(),  // ← Converts TimeRangeInstance to plain object
      sectionTimeline: section.sectionTimeline.parse(), // ← Converts TimelineInstance to plain object
      segments: section.segments.map(segment => ({
        id: segment.id,
        duration: segment.duration.parse(),  // ← Converts TimeRangeInstance to plain object
        timeline: segment.timeline.parse(),  // ← Converts TimelineInstance to plain object
        content: {
          bRollElements: segment.content.bRollElements.map(element => ({
            duration: element.duration.parse(),  // ← Converts TimeRangeInstance to plain object
            timeline: element.timeline.parse(),  // ← Converts TimelineInstance to plain object
            content: element.content
          }))
        }
      }))
    }))
  };
}
```

**Result**: Plain JSON object ready for serialization.

---

## Summary: The Complete Lifecycle

### 1. **Loading Existing Project (Plain JSON → Class Instance)**

```
Saved Plain JSON
  ↓
BRollTrack Constructor (new a.B(plainData))
  ↓
  - Converts {sO, eO, type} → TimeRangeInstance
  - Converts {in, out} → TimelineInstance
  - Creates Section instances
  - Creates Segment instances
  ↓
BRollTrack Class Instance (with methods)
```

### 1b. **New Project - First B-Roll (API Response → Class Instance)**

```
API Response / User Selection
  ↓
Transform to Plain Objects (with {sO, eO, type} and {in, out})
  ↓
BRollTrack Constructor (new l.B(plainData))
  ↓
  - Converts {sO, eO, type} → TimeRangeInstance
  - Converts {in, out} → TimelineInstance
  - Creates Section instances
  - Creates Segment instances
  ↓
BRollTrack Class Instance (with methods)
```

**Key Difference**: For new projects, the data comes from API/user input and is transformed into plain objects first, then passed to the constructor. The constructor logic is the same in both cases.

### 2. **Editing (Class Instance)**

```
BRollTrack Class Instance
  ↓
  - User edits b-rolls
  - Methods update class instances
  - TimeRangeInstance/TimelineInstance methods used
  ↓
Updated BRollTrack Class Instance
```

### 3. **Saving (Class Instance → Plain JSON)**

```
BRollTrack Class Instance
  ↓
.parse() method
  ↓
  - TimeRangeInstance.parse() → {sO, eO, type}
  - TimelineInstance.parse() → {in, out}
  ↓
Plain JSON
  ↓
g.Z() serialization
  ↓
JSON string (ready for backend)
```

---

## Key Takeaways

1. **Two scenarios for instance creation**:
   - **Loading existing project**: Plain JSON from saved file → Constructor → Class Instance
   - **New project**: API response → Transform to plain objects → Constructor → Class Instance

2. **Constructor (`new BRollTrack(plainData)`)**: Converts plain objects to class instances
   - `{sO, eO, type}` → `TimeRangeInstance`
   - `{in, out}` → `TimelineInstance`
   - Works the same way for both loading and new b-rolls

3. **`.parse()` method**: Converts class instances back to plain objects
   - `TimeRangeInstance` → `{sO, eO, type}`
   - `TimelineInstance` → `{in, out}`

4. **Time calculations**: When creating new b-rolls:
   - `sectionTimeline.in/out` = `startMs/endMs` from API/user input
   - `sectionDuration` = Usually defaults to 3 seconds (`{sO: 1000, eO: 4000}`)
   - `timeline` = Same as `sectionTimeline` for segments

5. **For new projects**: 
   - No existing `brollTrack` in state (null/undefined)
   - `appendBroll` receives API response as plain objects
   - Constructor creates first `BRollTrack` instance from those plain objects

6. **Why class instances?**: 
   - Provide methods for calculations (`getDuration()`, `getStart()`, etc.)
   - Enable reactive updates during editing
   - Allow validation and constraints
   - Support undo/redo functionality

7. **Why convert back to plain objects?**:
   - JSON serialization requires plain data
   - Backend rendering engine doesn't need JavaScript methods
   - Network transmission requires plain JSON strings

---

## Code Locations Reference

### Loading Existing Project
- **Loading from JSON**: `opustimeline.js` line ~44026-44029
- **Loading from editing script**: `opustimeline.js` line ~36706

### New Project / Adding B-Rolls
- **appendBroll function**: `opustimeline.js` line ~35125-35148
  - Handles both new (null track) and existing tracks
  - Creates instance from plain objects: `new l.B(d)`
- **API response transformation**: `opustimeline.js` line ~40598-40675
- **Creating from API**: `opustimeline.js` line ~35147

### Updating Existing Instance
- **Updating instance**: `opustimeline.js` line ~35806

### Saving
- **Parsing to plain object**: `opustimeline.js` line ~34012

---

This completes the picture: **Plain JSON → Class Instance → Plain JSON**, with the constructor handling the conversion from plain objects to class instances, and `.parse()` handling the reverse conversion.
