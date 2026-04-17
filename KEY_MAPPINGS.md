# Key Mappings Reference

This file documents the shortened key names used in the keyframe track and related structures.

## Format

`originalKey -> shortKey -> Description`

---

## Section / Timeline (sectionTimeline, timeline)

| Original | Short | Description |
|----------|--------|-------------|
| in | st | Start time |
| out | et | End time |

---

## Duration / Time range (sectionDuration, duration)

| Original | Short | Description |
|----------|--------|-------------|
| sO | ost | Offset start time |
| eO | oet | Offset end time |
| sOAdj | ostAdj | Offset start time (adjusted) |
| eOAdj | oetAdj | Offset end time (adjusted) |

---

## Structure / Layout

| Original | Short | Description |
|----------|--------|-------------|
| sectionDuration | secDur | Section duration |
| sectionTimeline | secTl | Section timeline |
| layoutType | lTyp | Layout type |
| layoutTypeAdjustment | lTypAdj | Layout type (adjusted) |

---

## Resource (propertiesMap, keyFrameContents)

| Original | Short | Description |
|----------|--------|-------------|
| resourceUri | rUri | Resource URI |
| resourceType | rTyp | Resource type |
| resourceId | rId | Resource ID |
| resourcePreviewUrl | rPrevUrl | Resource preview URL |
| resourceDuration | rDur | Resource duration |
| resourceRatio | rRatio | Resource aspect ratio |
| thumbnailUrl | thumbUrl | Thumbnail URL |

---

## Effects (effectParams)

| Original | Short | Description |
|----------|--------|-------------|
| effectTimestamp | effectTS | Effect timestamp |

---

## Quick reference (one per line)

```
in                  -> st         -> Start time
out                 -> et         -> End time
sO                  -> ost        -> Offset start time
eO                  -> oet        -> Offset end time
sOAdj               -> ostAdj     -> Offset start time (adjusted)
eOAdj               -> oetAdj     -> Offset end time (adjusted)
sectionDuration     -> secDur     -> Section duration
sectionTimeline     -> secTl      -> Section timeline
layoutType          -> lTyp       -> Layout type
layoutTypeAdjustment -> lTypAdj   -> Layout type (adjusted)
resourceUri         -> rUri       -> Resource URI
resourceType        -> rTyp       -> Resource type
resourceId          -> rId        -> Resource ID
resourcePreviewUrl  -> rPrevUrl   -> Resource preview URL
resourceDuration    -> rDur       -> Resource duration
resourceRatio       -> rRatio     -> Resource aspect ratio
thumbnailUrl        -> thumbUrl   -> Thumbnail URL
effectTimestamp     -> effectTS   -> Effect timestamp
```

---

*Add new mappings above as you rename more keys.*
