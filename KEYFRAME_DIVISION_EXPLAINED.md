# KeyFrameTrack Division Logic Explained

This document explains **how and why** the KeyFrameTrack structure divides content into **Sections → Segments → keyFrameContents**.

## Visual Hierarchy

```
KeyFrameTrack
│
├─ SECTION 1: "S.intro" (subType: "intro")
│  ├─ Segment 1: layoutType="Fill"
│  │  └─ keyFrame 1: cropArea at position A, face at position X
│  │
│  └─ Timeline: 0-5.76s | Source: 0-5.76s
│
├─ SECTION 2: "S.0" (main video - version 1)
│  ├─ Segment 1: layoutType="Fill"
│  │  ├─ keyFrame 1: cropArea at position B, face moves slightly
│  │  ├─ keyFrame 2: cropArea at position C, face moves more
│  │  └─ ... more keyframes
│  │
│  └─ Timeline: 5.76-53.11s | Source: 81.52-152.66s (adjusted: 81.52-128.87s)
│     segmentBoundaries: [81520, 86211, 121121, 128712, 128870]
│
├─ SECTION 3: "S.0" (main video - version 2)
│  ├─ Segment 1: layoutType="Fill"
│  │  └─ ... different edits/cuts
│  │
│  └─ Timeline: 53.11-57.62s | Source: 81.52-152.66s (adjusted: 129.04-133.55s)
│     segmentBoundaries: [129038, 133552]
│
├─ SECTION 4: "S.0" (main video - version 3)
│  ├─ Segment 1: layoutType="Fill"
│  │  └─ ... different edits/cuts
│  │
│  └─ Timeline: 57.62-75.16s | Source: 81.52-152.66s (adjusted: 135.12-152.66s)
│     segmentBoundaries: [135120, 136345, 138221, 152660]
│
└─ SECTION 5: "S.outro" (subType: "outro")
   └─ Segment 1: layoutType="Fill"
      └─ keyFrame: outro content
      Timeline: 75.16-83.08s | Source: 0-7.92s
```

**Note**: All three main video sections (`S.0`) reference the **same source video** (sO: 81520, eO: 152660), but with:
- **Different adjusted time ranges** (`sOAdj`, `eOAdj`)
- **Different timeline positions** (non-overlapping on the edited timeline)
- **Different segment boundaries** (different cuts/edits)

---

## 1. SECTION Division

### Parameters that create NEW sections:

| Parameter | Purpose | Example Values |
|-----------|---------|----------------|
| **`sceneId`** | Logical scene identifier | `"S.intro"`, `"S.0"`, `"S.outro"` |
| **`subType`** | Special section type | `"intro"`, `"outro"` (or undefined for main) |
| **`sectionDuration`** | Time range in **source video** | `{ sO: 0, eO: 5760 }` |
| **`sectionTimeline`** | Time range on **edited timeline** | `{ in: 0, out: 5760 }` |

### Example from your data (5 sections):

```javascript
// SECTION 1: Intro
{
  sceneId: "S.intro",
  subType: "intro",
  sectionDuration: { sO: 0, eO: 5760 },        // Source: 0-5.76s
  sectionTimeline: { in: 0, out: 5760 }        // Timeline: 0-5.76s
}

// SECTION 2: Main video - version 1
{
  sceneId: "S.0",
  sectionDuration: { 
    sO: 81520, eO: 152660,                     // Source: 81.52-152.66s
    eOAdj: 128870                              // Adjusted end: 128.87s
  },
  sectionTimeline: { in: 5760, out: 53110 },   // Timeline: 5.76-53.11s
  propertiesMap: {
    segmentBoundaries: [81520, 86211, 121121, 128712, 128870]
  }
}

// SECTION 3: Main video - version 2 (different cuts)
{
  sceneId: "S.0",
  sectionDuration: { 
    sO: 81520, eO: 152660,                     // Same source range
    sOAdj: 129038, eOAdj: 133552               // Different adjusted range!
  },
  sectionTimeline: { in: 53110, out: 57624 },  // Timeline: 53.11-57.62s
  propertiesMap: {
    segmentBoundaries: [129038, 133552]        // Different boundaries!
  }
}

// SECTION 4: Main video - version 3 (different cuts)
{
  sceneId: "S.0",
  sectionDuration: { 
    sO: 81520, eO: 152660,                     // Same source range
    sOAdj: 135120, eOAdj: 152660               // Different adjusted range!
  },
  sectionTimeline: { in: 57624, out: 75164 },  // Timeline: 57.62-75.16s
  propertiesMap: {
    segmentBoundaries: [135120, 136345, 138221, 152660]
  }
}

// SECTION 5: Outro
{
  sceneId: "S.outro",
  subType: "outro",
  sectionDuration: { sO: 0, eO: 7920 },        // Source: 0-7.92s
  sectionTimeline: { in: 75164, out: 83084 }   // Timeline: 75.16-83.08s
}
```

**Key Insights**: 
- Sections represent **logical scene boundaries** (intro/main/outro)
- **Multiple sections can reference the same source video** with different edits/cuts
- The three `S.0` sections all use the same source (81.52-152.66s) but with:
  - Different **adjusted time ranges** (`sOAdj`, `eOAdj`) - different cuts
  - Different **segment boundaries** - different edit points
  - Non-overlapping **timeline positions** - sequential on the edited timeline

### Understanding `sOAdj` and `eOAdj` (Adjusted Offsets)

**`sOAdj`** = **Start Offset Adjusted**  
**`eOAdj`** = **End Offset Adjusted**

These represent the **actual time range used** after editing operations (cuts, pause removal, etc.), while `sO`/`eO` represent the **original source video time range**.

| Field | Meaning | Example |
|-------|---------|---------|
| **`sO`** | Original start offset in source video | `81520` (81.52s) |
| **`eO`** | Original end offset in source video | `152660` (152.66s) |
| **`sOAdj`** | **Adjusted** start offset (after edits) | `129038` (129.04s) - starts later due to cuts |
| **`eOAdj`** | **Adjusted** end offset (after edits) | `133552` (133.55s) - ends earlier due to cuts |

**Example from Section 2:**
```javascript
{
  sectionDuration: {
    sO: 81520,        // Original: starts at 81.52s in source video
    eO: 152660,       // Original: ends at 152.66s in source video
    eOAdj: 128870    // Adjusted: actually ends at 128.87s (cut short!)
  }
}
```

**Example from Section 3:**
```javascript
{
  sectionDuration: {
    sO: 81520,        // Original: starts at 81.52s
    eO: 152660,       // Original: ends at 152.66s
    sOAdj: 129038,    // Adjusted: actually starts at 129.04s (cut beginning!)
    eOAdj: 133552     // Adjusted: actually ends at 133.55s (cut end!)
  }
}
```

**Why adjusted offsets exist:**
- **Pause removal**: If pauses were removed, the adjusted range reflects the actual content used
- **Manual cuts**: User may have trimmed the beginning/end of a section
- **Edit operations**: Various editing operations can change which portion of the source is actually used
- **Rendering accuracy**: The renderer needs to know the exact source time range to use, not just the original range

**Note**: If `sOAdj`/`eOAdj` are not present, it means no adjustments were made - use `sO`/`eO` instead.

---

## 2. SEGMENT Division (within a Section)

### Parameters that create NEW segments:

| Parameter | Purpose | Example |
|-----------|---------|---------|
| **`layoutType`** | Visual layout style | `"Fill"`, `"Split"`, `"Three"`, `"Four"` |
| **`layoutTypeAdjustment`** | Layout refinement | `"Fill"` (optional) |
| **`segmentBoundaries`** | Time boundaries (in propertiesMap) | `[81520, 86211, 121121, 128712]` |
| **`duration` / `timeline`** | Time ranges for the segment | See below |

### Example from your data:

```javascript
// SECTION "S.0" contains multiple segments:

// SEGMENT 1: Fill layout
{
  contentType: "KeyFrameGroup",
  content: {
    layoutType: "Fill",              // ← Single video fills screen
    keyFrameContents: [...]
  },
  duration: { sO: 81520, eO: 86211 },
  timeline: { in: 5760, out: 10451 }
}

// SEGMENT 2: Still Fill, but different time boundary
{
  contentType: "KeyFrameGroup",
  content: {
    layoutType: "Fill",              // ← Same layout
    keyFrameContents: [...]
  }, 
  duration: { sO: 86211, eO: 121121 },
  timeline: { in: 10451, out: 45361 }
}

// SEGMENT 3: Split layout (LAYOUT CHANGED!)
{
  contentType: "KeyFrameGroup",
  content: {
    layoutType: "Split",              // ← NOW SPLIT SCREEN!
    keyFrameContents: [
      {
        cropAreas: [                  // ← TWO crop areas (left + right)
          { xPct: 0.054, yPct: 0.247, wPct: 0.253, hPct: 0.400 },
          { xPct: 0.472, yPct: -0.011, wPct: 0.293, hPct: 0.464 }
        ]
      }
    ]
  }
}
```

**Key Insights**:
- **New segment** when `layoutType` changes (Fill → Split → Fill)
- **New segment** when there's a significant time gap (see `segmentBoundaries` in propertiesMap)
- Each segment maintains **one consistent layout** throughout its duration

---

## 3. keyFrameContents Division (within a Segment)

### Parameters that create NEW keyframes:

| Parameter | Purpose | When it changes, new keyframe is created |
|-----------|---------|------------------------------------------|
| **`cropAreas`** | Video crop position/size | When crop position (`xPct`, `yPct`) changes significantly |
| **`analysisResult.face`** | Face detection positions | When face positions move |
| **`analysisResult.activeSpeaker`** | Speaker detection | When speaker changes (true ↔ false) |
| **`analysisResult.trackingSubjects`** | Subject tracking | When tracking status or selected subject changes |
| **`analysisResult.movingSpeaker`** | Speaker movement | When movement state changes |
| **`duration` / `timeline`** | Time ranges | Each keyframe covers a time interval |

### Example from your data:

```javascript
// SEGMENT with multiple keyframes:

{
  layoutType: "Fill",
  keyFrameContents: [
    
    // KEYFRAME 1: Face at left side
    {
      cropAreas: [{ xPct: 0.008, yPct: 0, wPct: 0.316, hPct: 1 }],
      analysisResult: {
        face: [{ xPct: 0.008, yPct: 0.757, ... }],
        activeSpeaker: true,
        trackingSubjects: { status: "NotDetected" }
      },
      duration: { sO: 81520, eO: 86211 },
      timeline: { in: 5760, out: 10451 }
    },
    
    // KEYFRAME 2: Face moved, crop adjusted
    {
      cropAreas: [{ xPct: -0.248, yPct: 0, wPct: 0.316, hPct: 1 }],  // ← Crop moved!
      analysisResult: {
        face: [{ xPct: -0.248, yPct: 0.411, ... }],                 // ← Face moved!
        activeSpeaker: true,
        trackingSubjects: { status: "On", selected: "1" }          // ← Tracking started!
      },
      duration: { sO: 86211, eO: 90466 },
      timeline: { in: 10451, out: 14706 }
    },
    
    // KEYFRAME 3: Crop moved more, subject tracking active
    {
      cropAreas: [{ xPct: -0.415, yPct: 0, ... }],                  // ← Crop moved again!
      analysisResult: {
        face: [{ xPct: -0.410, yPct: 0.437, ... }],
        activeSpeaker: true,
        trackingSubjects: {
          status: "On",
          selected: "1",
          value: { "1": { name: "Subject 1", ... } }                // ← Subject tracked!
        }
      },
      duration: { sO: 90466, eO: 92676 },
      timeline: { in: 14706, out: 16916 }
    }
  ]
}
```

**Key Insights**:
- **New keyframe** when `cropAreas` position changes (video reframing)
- **New keyframe** when face positions change significantly
- **New keyframe** when speaker detection changes
- **New keyframe** when subject tracking state changes
- Each keyframe represents a **stable period** where these properties remain consistent

---

## Summary: Division Logic

### Sections are divided by:
1. ✅ **Scene boundaries** (`sceneId`: intro/main/outro)
2. ✅ **Time gaps** in source video
3. ✅ **Special types** (`subType`: intro/outro)

### Segments are divided by:
1. ✅ **Layout type changes** (`layoutType`: Fill → Split → Fill)
2. ✅ **Time boundaries** (see `segmentBoundaries` in propertiesMap)
3. ✅ **Significant time gaps** within a section

### keyFrameContents are divided by:
1. ✅ **Crop area changes** (`cropAreas` position/size)
2. ✅ **Face position changes** (`analysisResult.face`)
3. ✅ **Speaker changes** (`activeSpeaker`, `movingSpeaker`)
4. ✅ **Subject tracking changes** (`trackingSubjects.status`, `selected`)
5. ✅ **Time intervals** (each keyframe covers a stable period)

---

## Real Example from Your Data

Your `keyframetrack.js` has **5 sections total**:

### Section 1: Intro
- `sceneId: "S.intro"`, `subType: "intro"`
- Timeline: 0-5.76s, Source: 0-5.76s

### Sections 2, 3, 4: Three versions of main video
All three reference the **same source video** (81.52-152.66s) but with different edits:

**Section 2** (`section-LxTulf`):
```javascript
{
  sceneId: "S.0",
  sectionDuration: { sO: 81520, eO: 152660, eOAdj: 128870 },
  sectionTimeline: { in: 5760, out: 53110 },       // Timeline: 5.76-53.11s
  propertiesMap: {
    segmentBoundaries: [81520, 86211, 121121, 128712, 128870]
  }
}
```

**Section 3** (`section-6ZaTbe`):
```javascript
{
  sceneId: "S.0",
  sectionDuration: { sO: 81520, eO: 152660, sOAdj: 129038, eOAdj: 133552 },
  sectionTimeline: { in: 53110, out: 57624 },       // Timeline: 53.11-57.62s
  propertiesMap: {
    segmentBoundaries: [129038, 133552]
  }
}
```

**Section 4** (`section-sYhg95`):
```javascript
{
  sceneId: "S.0",
  sectionDuration: { sO: 81520, eO: 152660, sOAdj: 135120, eOAdj: 152660 },
  sectionTimeline: { in: 57624, out: 75164 },      // Timeline: 57.62-75.16s
  propertiesMap: {
    segmentBoundaries: [135120, 136345, 138221, 152660]
  }
}
```

### Section 5: Outro
- `sceneId: "S.outro"`, `subType: "outro"`
- Timeline: 75.16-83.08s, Source: 0-7.92s

**Why three `S.0` sections?** They represent **different edit versions** or **different cuts** of the same source material, each with:
- Different adjusted time ranges (`sOAdj`, `eOAdj`)
- Different segment boundaries (different edit points)
- Sequential, non-overlapping timeline positions

---

## Key Takeaway

The division happens at **three levels**:

1. **Sections** = Logical scenes (intro/main/outro) or major time divisions
2. **Segments** = Layout changes OR time boundaries within a scene
3. **keyFrames** = Crop/face/speaker/tracking changes within a segment

Each level represents a different **granularity** of change:
- **Section**: "What scene are we in?"
- **Segment**: "What layout are we using?"
- **keyFrame**: "Where is the crop/face/speaker at this moment?"
