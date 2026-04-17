# Section 2: Why 4 Segments?

## Section 2 Overview

**Section ID**: `section-LxTulf`  
**Scene**: `"S.0"`  
**Source Range**: `sO: 81520` (81.52s) → `eO: 152660` (152.66s), `eOAdj: 128870` (128.87s)  
**Timeline Range**: `in: 5760` (5.76s) → `out: 53110` (53.11s)  
**Segment Boundaries**: `[81520, 86211, 121121, 128712, 128870]`

---

## The 4 Segments

### Segment 1: `segment-8I55vN`
- **Layout**: `"Fill"`
- **Source Duration**: `sO: 81520` → `eO: 86211` (4.69s)
- **Timeline**: `in: 5760` → `out: 10451` (4.69s)
- **KeyFrames**: 1 keyframe
- **Tracking**: `trackingSubjects.status: "NotDetected"`

### Segment 2: `segment-9g4IB3`
- **Layout**: `"Fill"` (with `layoutTypeAdjustment: "Fill"`)
- **Source Duration**: `sO: 86211` → `eO: 121121` (34.91s)
- **Timeline**: `in: 10451` → `out: 45361` (34.91s)
- **KeyFrames**: 20 keyframes
- **Tracking**: `trackingSubjects.status: "On"` with `selected: "1"` (Subject tracking ACTIVE!)

### Segment 3: `segment-faR4t0`
- **Layout**: `"Fill"`
- **Source Duration**: `sO: 121121` → `eO: 128712` (7.59s)
- **Timeline**: `in: 45361` → `out: 52952` (7.59s)
- **KeyFrames**: 1 keyframe
- **Tracking**: `trackingSubjects.status: "NotDetected"` (tracking STOPPED)
- **Face ID Change**: First keyframe has `faceV2[0].id: "0"` (different face ID!)

### Segment 4: `segment-EjXnVX`
- **Layout**: `"Fill"`
- **Source Duration**: `sO: 128712` → `eO: 134885`, `eOAdj: 128870` (cut short!)
- **Timeline**: `in: 52952` → `out: 53110` (0.16s - very short!)
- **KeyFrames**: 1 keyframe
- **Tracking**: `trackingSubjects.status: "On"` (tracking RESUMED)

---

## Why These 4 Segments?

### Parameter 1: **Segment Boundaries** (`segmentBoundaries`)
The section has explicit boundaries defined:
```javascript
segmentBoundaries: [81520, 86211, 121121, 128712, 128870]
```

These create **4 segments**:
- Segment 1: `81520` → `86211`
- Segment 2: `86211` → `121121`
- Segment 3: `121121` → `128712`
- Segment 4: `128712` → `128870` (adjusted end)

### Parameter 2: **Subject Tracking State Changes**

| Segment | Tracking Status | Why It's Separate |
|---------|----------------|-------------------|
| **Segment 1** | `"NotDetected"` | No tracking active |
| **Segment 2** | `"On"` with `selected: "1"` | **Tracking starts!** Subject 1 is being tracked |
| **Segment 3** | `"NotDetected"` | **Tracking stops!** Different face appears (`id: "0"`) |
| **Segment 4** | `"On"` | **Tracking resumes!** Back to tracking mode |

**Key Insight**: Segments 2 and 4 both have tracking ON, but they're separated because:
- Segment 3 interrupts with tracking OFF
- Different face IDs (`"-1"` vs `"0"`)
- Different time boundaries

### Parameter 3: **Face ID Changes**

- **Segments 1-2**: Face ID `"-1"` (same person)
- **Segment 3**: Face ID `"0"` (different person!)
- **Segment 4**: Face ID `"-1"` (back to original person)

### Parameter 4: **Layout Type Adjustment**

- **Segment 2** has `layoutTypeAdjustment: "Fill"` (other segments don't)
- This might indicate a refinement or override of the layout

### Parameter 5: **Time Boundaries (Cuts)**

Looking at the boundaries:
- `81520` → `86211`: First segment
- `86211` → `121121`: Long middle segment (tracking active)
- `121121` → `128712`: Short segment (different face, no tracking)
- `128712` → `128870`: Very short final segment (tracking resumes, but cut short)

The last segment is cut short (`eOAdj: 128870` vs `eO: 134885`), suggesting an edit cut.

---

## Summary: Division Parameters

Section 2 is divided into 4 segments based on:

1. ✅ **Explicit segment boundaries** (`segmentBoundaries` array)
2. ✅ **Subject tracking state changes** (`trackingSubjects.status`: NotDetected ↔ On)
3. ✅ **Face ID changes** (`faceV2[].id`: "-1" ↔ "0")
4. ✅ **Layout adjustments** (`layoutTypeAdjustment` in Segment 2)
5. ✅ **Time cuts** (Segment 4 cut short with `eOAdj`)

**Most Important**: The **segment boundaries** define where segments split, but the **tracking state changes** and **face ID changes** explain **why** those boundaries were chosen - they mark significant changes in the video content that require different handling.

---

## Visual Timeline

```
Section 2 Timeline (5.76s - 53.11s)
│
├─ Segment 1 (5.76s - 10.45s)
│  └─ Tracking: OFF, Face: "-1"
│
├─ Segment 2 (10.45s - 45.36s) ← LONGEST
│  └─ Tracking: ON (Subject 1), Face: "-1", layoutTypeAdjustment: "Fill"
│
├─ Segment 3 (45.36s - 52.95s)
│  └─ Tracking: OFF, Face: "0" ← DIFFERENT PERSON!
│
└─ Segment 4 (52.95s - 53.11s) ← VERY SHORT (cut)
   └─ Tracking: ON, Face: "-1"
```
