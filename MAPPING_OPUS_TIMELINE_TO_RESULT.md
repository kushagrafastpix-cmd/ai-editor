# Mapping: opustimeline.js → opusresultjson.js

This document explains how the `opusresultjson.js` file is generated from the timeline state in `opustimeline.js`.

## Overview

The `opusresultjson.js` file is the **export format** that gets generated when you save/export a video after performing edit operations. It contains the complete editing script and render preferences in a structured format that can be used for video rendering.

## Generation Flow

### Location in opustimeline.js

The generation happens in the `saveClip` function (around **line 44125-44268** in `opustimeline.js`).

### Step-by-Step Process

#### 1. **Collect All Tracks** (Lines 44128-44140)

The function collects all track instances from the editor state:

```javascript
let j = a(N.XU.keyFrameTrack)      // KeyFrameTrack - main video track
let S = a(N.XU.captionTrack)        // CaptionTrack - captions/subtitles
let k = a(N.XU.emojiTrack)           // EmojiTrack - emoji overlays
let I = a(N.XU.brollTrack)           // BRollTrack - B-roll footage
let O = a(N.XU.mediaTrack)           // MediaTrack - media overlays
let M = a(N.XU.videoEffectTrack)     // VideoEffectTrack - transitions/effects
let P = a(N.XU.textOverlayTrack)    // TextOverlayTrack - text overlays
let R = a(N.XU.voiceoverTrack)       // VoiceOverTrack - voiceover audio
let K = a(N.XU.voiceEnhancementTrack) // VoiceEnhancementTrack - audio enhancement
let L = a(N.XU.soundTrack)           // SoundTrack - background music/sound

let H = {
  tracks: [j, S, k, I, O, M, P, R, K, L].filter(o.s)  // Filter out null/undefined tracks
}
```

#### 2. **Create Editing Script** (Lines 44141-44143)

The tracks are converted to an editing script format:

```javascript
let G = (0, g.Z)(H)                    // Convert tracks to editing script format
let Y = F.removePendingSections(G)     // Remove any pending/incomplete sections
```

##### How Track Conversion Works (`g.Z`)

The `g.Z` function performs **serialization** - converting track class instances into plain JSON-serializable objects. Here's what happens:

**Input**: Track instances are class objects with:
- Methods (e.g., `updateSegmentBoundaries()`, `fillSectionBySecId()`)
- Computed properties
- Internal state management
- References to other objects

**Process**: `g.Z` extracts only the **data properties** from each track instance:
- `id` - Track identifier
- `trackType` - Type of track (e.g., "KeyFrameTrack", "CaptionTrack")
- `sections` - Array of section objects with:
  - `id` - Section identifier
  - `sectionDuration` - Time range in source video (`{sO, eO, type: "TS"}`)
  - `sectionTimeline` - Position on edited timeline (`{in, out}`)
  - `segments` - Array of segment objects
  - `propertiesMap` - Metadata (resourceId, resourceType, etc.)
  - `sceneId` - Scene identifier

**Output**: Plain JavaScript objects that can be JSON.stringify'd:
```javascript
{
  tracks: [
    {
      id: "track-00AbwZ",
      trackType: "KeyFrameTrack",
      sections: [
        {
          id: "section-iVVns4",
          sectionDuration: { sO: 0, eO: 5760, type: "TS" },
          sectionTimeline: { in: 0, out: 5760 },
          segments: [...],
          propertiesMap: {...},
          sceneId: "S.intro"
        }
      ]
    },
    // ... other tracks
  ]
}
```

##### What `removePendingSections` Does

After serialization, `removePendingSections` cleans up incomplete edits:

1. **Removes "add" type pending sections**: Sections that were being added but not completed are removed
2. **Restores previous snapshots**: For "update" type pending sections, it restores the previous state
3. **Recalculates timelines**: Updates `sectionTimeline` and `segment.timeline` values based on the cleaned sections
4. **Filters out null/undefined**: Removes any sections that became null during processing

This ensures only **complete, valid edits** are exported for rendering.

##### Example: Track Instance → Plain Object

**Before (Track Instance)**:
```javascript
// Track is a class instance with methods and internal state
KeyFrameTrack {
  id: "track-00AbwZ",
  trackType: "KeyFrameTrack",
  sections: [SectionInstance, SectionInstance, ...],
  updateSegmentBoundaries: function() {...},
  fillSectionBySecId: function() {...},
  // ... other methods and computed properties
}
```

**After (`g.Z` conversion)**:
```javascript
// Plain object with only data properties
{
  id: "track-00AbwZ",
  trackType: "KeyFrameTrack",
  sections: [
    {
      id: "section-iVVns4",
      sectionDuration: { sO: 0, eO: 5760, type: "TS" },
      sectionTimeline: { in: 0, out: 5760 },
      segments: [
        {
          id: "segment-pfV5wE",
          contentType: "KeyFrameGroup",
          content: {
            layoutType: "Fill",
            keyFrameContents: [...],
            duration: { sO: 0, eO: 5760, type: "TS" },
            timeline: { in: 0, out: 5760 }
          },
          duration: { sO: 0, eO: 5760, type: "TS" },
          timeline: { in: 0, out: 5760 }
        }
      ],
      propertiesMap: {
        subType: "intro",
        resourceId: "cJVJ9OhkIT",
        resourceType: "video",
        // ... other metadata
      },
      sceneId: "S.intro"
    }
  ]
}
```

**Key Differences**:
- ❌ **Removed**: Methods, computed properties, internal state, function references
- ✅ **Kept**: All data properties needed for rendering (id, type, sections, segments, timing, metadata)
- ✅ **Result**: Plain object that can be safely JSON.stringify'd and sent to backend

#### 3. **Get Render Preferences** (Line 44144)

```javascript
let X = a(N.XU.preference)  // Get render preference override settings
```

#### 4. **Create clipBody Object** (Lines 44188-44191)

The `clipBody` is created with two main properties:

```javascript
let t = { 
  editingScript: Y,                    // The editing script with all tracks
  renderPreferenceOverride: X          // Render preferences (layout, captions, etc.)
}
```

#### 5. **Stringify and Send** (Lines 44192-44248)

```javascript
let a = JSON.stringify(t)  // Convert to JSON string

// If data is too large, upload to cloud storage
if (l) {  // l = a.length > E.y9 && es
  let {url: e} = await el({
    usecase: "ClipReRender",
    extension: "json"
  })
  let t = new File([a], "data.json", {
    type: "application/json"
  });
  await ea.uploadFile(t, e, {...})
  await B(ed, eu, y, {
    clipBodyPath: decodeURIComponent(e)  // Send path to uploaded file
  })
} else {
  await B(ed, eu, y, {
    clipBody: t  // Send clipBody directly
  })
}
```

#### 6. **Add Targets** (Line 44127)

The `targets` array comes from the function parameters:

```javascript
let {targets: y, customProjectId: w, customClipId: C, via: _} = s
```

Default targets are typically: `["VIDEO_PREVIEW", "VIDEO_FILE"]`

## Final Structure

The `opusresultjson.js` file has this structure:

```javascript
module.exports = {
  targets: ["VIDEO_PREVIEW", "VIDEO_FILE"],
  clipBody: {
    editingScript: {
      tracks: [
        {
          id: "track-00AbwZ",
          trackType: "KeyFrameTrack",
          sections: [
            {
              id: "section-iVVns4",
              sectionDuration: { sO: 0, eO: 5760, type: "TS" },
              sectionTimeline: { in: 0, out: 5760 },
              segments: [
                {
                  id: "segment-pfV5wE",
                  contentType: "KeyFrameGroup",
                  content: {
                    layoutType: "Fill",
                    keyFrameContents: [
                      {
                        id: "keyFrame-J3NVqq",
                        resourceUri: "...",
                        resourceType: "video",
                        cropAreas: [...],
                        analysisResult: {...},
                        duration: { sO: 0, eO: 5760, type: "TS" },
                        timeline: { in: 0, out: 5760 }
                      }
                    ],
                    duration: { sO: 0, eO: 5760, type: "TS" },
                    timeline: { in: 0, out: 5760 }
                  },
                  duration: { sO: 0, eO: 5760, type: "TS" },
                  timeline: { in: 0, out: 5760 }
                }
              ],
              propertiesMap: {
                subType: "intro",
                resourceId: "...",
                resourceType: "video",
                resourcePreviewUrl: "...",
                resourceDuration: 5.76,
                resourceRatio: 1.7777777777777777,
                thumbnailUrl: "..."
              },
              sceneId: "S.intro"
            }
          ]
        },
        // ... other tracks (CaptionTrack, VoiceOverTrack, etc.)
      ]
    },
    renderPreferenceOverride: {
      enableAutoLayout: false,
      enableFillLayout: true,
      enableFitLayout: true,
      fitLayoutCropRatio: "4:3",
      enableSplitLayout: true,
      enableThreeLayout: true,
      enableFourLayout: true,
      enableScreenLayout: true,
      enableVisualHook: false,
      enableWatermark: false,
      enableCrop: true,
      layoutAspectRatio: "portrait",
      enableCaption: true,
      enableCaptionAnimation: true,
      captionAnimation: {...},
      captionStyle: "",
      captionPosition: "auto",
      enableHighlight: true,
      enableEmoji: true,
      emojiStyle: {...},
      enableUppercase: true,
      highlightColor: {...},
      font: {...},
      screenOverlay: null,
      screenOverlays: [],
      enableAutoTransition: true,
      selectedTransitions: ["crossFade"],
      enableVoiceEnhancement: true,
      intro: null,
      outro: null,
      skipReframe: false,
      enableBroll: null,
      sceneDetThresh: 3,
      reduceFakeFace: true,
      brandTemplateId: "preset-fancy-Karaoke",
      faceDetectFps: 15,
      speakersColor: [...],
      curseWordsConfig: {...},
      enableSpeakerDetection: true
    }
  }
}
```

## Key Data Structures

### Track Types

1. **KeyFrameTrack**: Main video track with keyframes, crops, and video segments
2. **CaptionTrack**: Caption/subtitle track with text elements
3. **VoiceOverTrack**: Voiceover audio track
4. **EmojiTrack**: Emoji overlay track
5. **BRollTrack**: B-roll footage track
6. **MediaTrack**: Media overlay track
7. **TextOverlayTrack**: Text overlay track
8. **VideoEffectTrack**: Transitions and video effects
9. **AudioTrack** (VoiceEnhancement): Voice enhancement audio
10. **AudioTrack** (Sound): Background music/sound

### Time Format (TS)

Time values use a "TS" (TimeStamp) format:
```javascript
{
  sO: 0,        // Start Offset (in milliseconds or frame units)
  eO: 5760,     // End Offset
  type: "TS"    // Type identifier
}
```

### Timeline vs Duration

- **sectionDuration**: Duration in source video time
- **sectionTimeline**: Position on the edited timeline (after cuts/edits)
- **timeline**: Position on timeline for segments/keyframes
- **duration**: Duration for segments/keyframes

## Key Transformations

1. **removePendingSections**: Removes incomplete/pending sections before export
2. **Track Filtering**: Only includes tracks that exist (filters out null/undefined)
3. **JSON Serialization**: Converts the object to JSON string for transmission
4. **Cloud Upload**: If payload is too large (> threshold), uploads to cloud storage instead of sending directly

## Usage

The `opusresultjson.js` file is:
- Generated when you save/export a video
- Sent to the backend API for video rendering
- Used as the complete specification for how the video should be rendered
- Contains all editing decisions, timing, crops, effects, captions, etc.

## Notes

- The timeline state in `opustimeline.js` is the **working state** during editing
- The result JSON in `opusresultjson.js` is the **export format** for rendering
- The structure is optimized for the rendering pipeline
- Time values are normalized and all references are resolved
- Pending/incomplete edits are removed before export
