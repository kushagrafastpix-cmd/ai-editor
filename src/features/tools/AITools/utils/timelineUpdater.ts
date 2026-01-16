import type { VideoClip } from "@/features/timeline/types";
import type { PauseSegment } from "./pauseDetection";
import type { TranscriptData } from "@/types/transcript";

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
 * Only processes main video clips - intro/outro clips are preserved unchanged
 * 
 * @param clips - Current timeline clips (immutable)
 * @param pauses - Pause segments to remove (immutable)
 * @param transcript - Transcript data to identify main video clips
 * @returns New timeline state with updated clips (never mutates input)
 */
export function removePausesFromTimeline(
  clips: readonly VideoClip[],
  pauses: readonly PauseSegment[],
  transcript: TranscriptData
): readonly VideoClip[] {
  if (pauses.length === 0) {
    return clips;
  }

  console.log('[timelineUpdater] Input clips:', clips);
  console.log('[timelineUpdater] Pauses to remove:', pauses);

  const mainVideoId = transcript.videoId;
  
  // Separate main video clips from intro/outro clips
  const mainVideoClips = clips.filter(c => c.sourceVideoId === mainVideoId);
  const otherClips = clips.filter(c => c.sourceVideoId !== mainVideoId);
  
  console.log('[timelineUpdater] Main video clips:', mainVideoClips);
  console.log('[timelineUpdater] Intro/outro clips (preserved):', otherClips);

  // If no main video clips, return original clips
  if (mainVideoClips.length === 0) {
    console.log('[timelineUpdater] No main video clips found, returning original clips');
    return clips;
  }

  // Calculate base timeline offset - where main video should start
  // This is the timeline position of the first main video clip
  const firstMainClipStart = mainVideoClips.length > 0 
    ? Math.min(...mainVideoClips.map(mc => mc.startTime))
    : 0;
  
  // Count all intro clips (clips before main video)
  const baseTimelineOffset = otherClips
    .filter(c => c.startTime < firstMainClipStart)
    .reduce((sum, c) => sum + c.duration, 0);
  
  console.log(`[timelineUpdater] Base timeline offset: ${baseTimelineOffset}s (first main clip was at ${firstMainClipStart}s)`);

  const updatedClips: VideoClip[] = [];

  for (const clip of mainVideoClips) {
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
      const newTimelineStart = baseTimelineOffset + (clip.sourceStartTime - shift);
      const newClip = {
        ...clip,
        startTime: newTimelineStart,
        duration: clip.duration, // Duration stays the same
      };
      console.log(`[timelineUpdater] No overlapping pauses, shifting clip by ${shift}s: timeline ${newClip.startTime}s (base offset: ${baseTimelineOffset}s), duration ${newClip.duration}s`);
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
    let currentTimelineStart = baseTimelineOffset + (clip.sourceStartTime - initialShift);

    console.log(`[timelineUpdater] Initial: sourceStart=${currentSourceStart}, shift=${initialShift}, timelineStart=${currentTimelineStart} (base offset: ${baseTimelineOffset}s)`);

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

  // Separate intro clips from outro clips
  const introClips = otherClips.filter(c => c.startTime < firstMainClipStart);
  const outroClips = otherClips.filter(c => c.startTime >= firstMainClipStart);
  
  // Calculate how much the main video section has changed
  const originalMainVideoEnd = Math.max(...mainVideoClips.map(c => c.startTime + c.duration));
  const newMainVideoEnd = updatedClips.length > 0 
    ? Math.max(...updatedClips.map(c => c.startTime + c.duration))
    : baseTimelineOffset;
  const mainVideoShift = originalMainVideoEnd - newMainVideoEnd;
  
  console.log(`[timelineUpdater] Main video: original end ${originalMainVideoEnd}s, new end ${newMainVideoEnd}s, shift ${mainVideoShift}s`);
  
  // Adjust outro clips - shift them forward by the amount removed from main video
  const adjustedOutroClips = outroClips.map(clip => ({
    ...clip,
    startTime: clip.startTime - mainVideoShift
  }));
  
  console.log(`[timelineUpdater] Adjusted ${adjustedOutroClips.length} outro clips by ${mainVideoShift}s`);
  
  // Combine intro clips (unchanged) + updated main video clips + adjusted outro clips
  const allClips = [...introClips, ...updatedClips, ...adjustedOutroClips];
  
  // Sort clips by timeline start time
  const sorted = allClips.sort((a, b) => a.startTime - b.startTime);
  console.log('[timelineUpdater] Final sorted clips (including intro/outro):', sorted);
  return sorted;
}


