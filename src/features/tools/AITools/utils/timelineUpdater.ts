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
  const shift = pauses
    .filter((pause) => pause.endTime <= beforeTime)
    .reduce((sum, pause) => sum + pause.duration, 0);
  
  console.log(`[timelineUpdater] calculateTimelineShift(beforeTime=${beforeTime}): ${shift}s`);
  return shift;
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

  console.log('[timelineUpdater] Input clips:', clips);
  console.log('[timelineUpdater] Pauses to remove:', pauses);

  const updatedClips: VideoClip[] = [];

  for (const clip of clips) {
    console.log(`[timelineUpdater] Processing clip ${clip.id}: source ${clip.sourceStartTime}-${clip.sourceEndTime}`);
    
    // Find pauses that overlap with this clip's source time range
    const overlappingPauses = pauses.filter(
      (pause) =>
        pause.startTime < clip.sourceEndTime &&
        pause.endTime > clip.sourceStartTime
    );

    console.log(`[timelineUpdater] Overlapping pauses for clip ${clip.id}:`, overlappingPauses);

    if (overlappingPauses.length === 0) {
      // No pauses in this clip, just shift its timeline position based on removed time before it
      const shift = calculateTimelineShift(pauses, clip.sourceStartTime);
      const newTimelineStart = clip.sourceStartTime - shift;
      const newClip = {
        ...clip,
        startTime: newTimelineStart,
        duration: clip.duration, // Duration stays the same
      };
      console.log(`[timelineUpdater] No overlapping pauses, shifting clip by ${shift}s: timeline ${newClip.startTime}s, duration ${newClip.duration}s`);
      updatedClips.push(newClip);
      continue;
    }

    // Sort pauses by start time
    const sortedPauses = [...overlappingPauses].sort(
      (a, b) => a.startTime - b.startTime
    );

    // Split clip at pause boundaries
    let currentSourceStart = clip.sourceStartTime;
    
    // Calculate the timeline start for this clip based on pauses BEFORE it
    const initialShift = calculateTimelineShift(pauses, clip.sourceStartTime);
    let currentTimelineStart = clip.sourceStartTime - initialShift;

    console.log(`[timelineUpdater] Initial: sourceStart=${currentSourceStart}, shift=${initialShift}, timelineStart=${currentTimelineStart}`);

    for (const pause of sortedPauses) {
      // If pause starts after current segment, create segment before pause
      if (pause.startTime > currentSourceStart) {
        const segmentDuration = pause.startTime - currentSourceStart;
        const newClip = {
          ...clip,
          id: `${clip.id}-${updatedClips.length}`,
          startTime: currentTimelineStart,
          duration: segmentDuration,
          sourceStartTime: currentSourceStart,
          sourceEndTime: pause.startTime,
        };
        console.log(`[timelineUpdater] Created segment: ${newClip.id}, timeline ${newClip.startTime}-${newClip.startTime + newClip.duration}, source ${newClip.sourceStartTime}-${newClip.sourceEndTime}`);
        updatedClips.push(newClip);
        
        // Move timeline position forward by the duration of the segment we just added
        currentTimelineStart += segmentDuration;
      }

      // Update for next segment (after pause)
      currentSourceStart = pause.endTime;
      // No need to recalculate shift - we're tracking timeline position directly
      
      console.log(`[timelineUpdater] After pause ${pause.startTime}-${pause.endTime}: sourceStart=${currentSourceStart}, timelineStart=${currentTimelineStart}`);
    }

    // Add final segment after last pause (if any)
    if (currentSourceStart < clip.sourceEndTime) {
      const segmentDuration = clip.sourceEndTime - currentSourceStart;
      const newClip = {
        ...clip,
        id: `${clip.id}-${updatedClips.length}`,
        startTime: currentTimelineStart,
        duration: segmentDuration,
        sourceStartTime: currentSourceStart,
        sourceEndTime: clip.sourceEndTime,
      };
      console.log(`[timelineUpdater] Created final segment: ${newClip.id}, timeline ${newClip.startTime}-${newClip.startTime + newClip.duration}, source ${newClip.sourceStartTime}-${newClip.sourceEndTime}`);
      updatedClips.push(newClip);
    }
  }

  // Sort clips by timeline start time
  const sorted = updatedClips.sort((a, b) => a.startTime - b.startTime);
  console.log('[timelineUpdater] Final sorted clips:', sorted);
  return sorted;
}


