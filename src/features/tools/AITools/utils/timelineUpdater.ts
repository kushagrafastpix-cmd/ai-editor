import type { VideoClip } from "@/features/timeline/types";
import type { PauseSegment } from "./pauseDetection";

/**
 * Pure function: Calculate timeline shift offset after removing pauses
 * Returns the cumulative time removed before a given timeline position
 */
export function calculateTimelineShift(
  pauses: readonly PauseSegment[],
  beforeTime: number
): number {
  return pauses
    .filter((pause) => pause.endTime <= beforeTime)
    .reduce((sum, pause) => sum + pause.duration, 0);
}

/**
 * Pure function: Removes pauses from timeline by updating clip mappings
 * Non-destructive: Only updates timeline mapping, doesn't modify media
 * 
 * @param clips - Current timeline clips (immutable)
 * @param pauses - Pause segments to remove (immutable)
 * @returns New timeline state with updated clips (never mutates input)
 */
export function removePausesFromTimeline(
  clips: readonly VideoClip[],
  pauses: readonly PauseSegment[]
): readonly VideoClip[] {
  if (pauses.length === 0) {
    return clips;
  }

  const updatedClips: VideoClip[] = [];

  for (const clip of clips) {
    // Find pauses that overlap with this clip's source time range
    const overlappingPauses = pauses.filter(
      (pause) =>
        pause.startTime < clip.sourceEndTime &&
        pause.endTime > clip.sourceStartTime
    );

    if (overlappingPauses.length === 0) {
      // No pauses in this clip, just shift its timeline position
      const shift = calculateTimelineShift(pauses, clip.sourceStartTime);
      updatedClips.push({
        ...clip,
        startTime: clip.startTime - shift,
      });
      continue;
    }

    // Sort pauses by start time
    const sortedPauses = [...overlappingPauses].sort(
      (a, b) => a.startTime - b.startTime
    );

    // Split clip at pause boundaries
    let currentSourceStart = clip.sourceStartTime;
    let cumulativeShift = calculateTimelineShift(pauses, currentSourceStart);
    let currentTimelineStart = clip.startTime - cumulativeShift;

    for (const pause of sortedPauses) {
      // If pause starts after current segment, create segment before pause
      if (pause.startTime > currentSourceStart) {
        const segmentDuration = pause.startTime - currentSourceStart;
        updatedClips.push({
          ...clip,
          id: `${clip.id}-${updatedClips.length}`,
          startTime: currentTimelineStart,
          duration: segmentDuration,
          sourceStartTime: currentSourceStart,
          sourceEndTime: pause.startTime,
        });
      }

      // Update for next segment (after pause)
      currentSourceStart = pause.endTime;
      cumulativeShift = calculateTimelineShift(pauses, currentSourceStart);
      currentTimelineStart = clip.startTime - cumulativeShift;
    }

    // Add final segment after last pause (if any)
    if (currentSourceStart < clip.sourceEndTime) {
      const segmentDuration = clip.sourceEndTime - currentSourceStart;
      updatedClips.push({
        ...clip,
        id: `${clip.id}-${updatedClips.length}`,
        startTime: currentTimelineStart,
        duration: segmentDuration,
        sourceStartTime: currentSourceStart,
        sourceEndTime: clip.sourceEndTime,
      });
    }
  }

  // Sort clips by timeline start time
  return updatedClips.sort((a, b) => a.startTime - b.startTime);
}


