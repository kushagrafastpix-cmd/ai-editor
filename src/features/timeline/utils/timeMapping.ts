import type { VideoClip } from "../types";

/**
 * Converts timeline time to source video time.
 * 
 * Timeline time is the position on the edited timeline (after pauses removed).
 * Source time is the position in the original source video.
 * 
 * Algorithm:
 * 1. Find which clip contains the timeline time
 * 2. Calculate offset within that clip
 * 3. Map to corresponding position in source video
 * 
 * @param timelineTime - Position on the timeline (seconds)
 * @param clips - Array of clips sorted by startTime
 * @returns Source video time (seconds), or null if timeline time is in a gap
 */
export function timelineToSourceTime(
  timelineTime: number,
  clips: readonly VideoClip[]
): number | null {
  if (clips.length === 0) {
    return null;
  }

  // Sort clips by timeline startTime
  const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);

  // Find the clip that contains this timeline time
  for (const clip of sortedClips) {
    const clipEndTime = clip.startTime + clip.duration;

    if (timelineTime >= clip.startTime && timelineTime < clipEndTime) {
      // Calculate offset within the clip
      const offsetInClip = timelineTime - clip.startTime;

      // Map to source time
      const sourceTime = clip.sourceStartTime + offsetInClip;

      return sourceTime;
    }
  }

  // Timeline time is either before first clip, after last clip, or in a gap
  // For simplicity, clamp to nearest clip boundary
  // const firstClip = sortedClips[0]; // Removed unused variable
  const lastClip = sortedClips[sortedClips.length - 1];

  const lastClipEndTime = lastClip.startTime + lastClip.duration;
  if (timelineTime >= lastClipEndTime) {
    // After last clip - return null
    return null;
  }

  // In a gap between clips - return null to indicate invalid position
  return null;
}

/**
 * Converts source video time to timeline time.
 * 
 * This is the inverse of timelineToSourceTime.
 * Used for mapping video playback position to timeline position.
 * 
 * Algorithm:
 * 1. Find which clip contains the source time
 * 2. Calculate offset within that clip's source range
 * 3. Map to corresponding position on timeline
 * 
 * @param sourceTime - Position in source video (seconds)
 * @param clips - Array of clips
 * @returns Timeline time (seconds), or null if source time is not in any clip
 */
export function sourceToTimelineTime(
  sourceTime: number,
  clips: readonly VideoClip[]
): number | null {
  if (clips.length === 0) {
    return null;
  }

  // Find the clip that contains this source time
  for (const clip of clips) {
    if (sourceTime >= clip.sourceStartTime && sourceTime < clip.sourceEndTime) {
      // Calculate offset within the source range
      const offsetInSource = sourceTime - clip.sourceStartTime;

      // Map to timeline time
      const timelineTime = clip.startTime + offsetInSource;

      return timelineTime;
    }
  }

  // Source time is not in any clip (it was removed as a pause)
  // Find the nearest clip
  const sortedClips = [...clips].sort((a, b) => a.sourceStartTime - b.sourceStartTime);

  const firstClip = sortedClips[0];
  const lastClip = sortedClips[sortedClips.length - 1];

  if (sourceTime < firstClip.sourceStartTime) {
    // Before first clip
    return firstClip.startTime;
  }

  if (sourceTime >= lastClip.sourceEndTime) {
    // After last clip
    return lastClip.startTime + lastClip.duration;
  }

  // Source time is in a removed pause segment
  // Find the clip that comes after this source time
  for (let i = 0; i < sortedClips.length - 1; i++) {
    const currentClip = sortedClips[i];
    const nextClip = sortedClips[i + 1];

    if (sourceTime >= currentClip.sourceEndTime && sourceTime < nextClip.sourceStartTime) {
      // This source time was removed - map to end of current clip on timeline
      return currentClip.startTime + currentClip.duration;
    }
  }

  return null;
}

/**
 * Gets the total timeline duration from clips.
 * 
 * @param clips - Array of clips
 * @returns Total timeline duration (seconds)
 */
export function getTimelineDuration(clips: readonly VideoClip[]): number {
  if (clips.length === 0) {
    return 0;
  }

  return Math.max(...clips.map(clip => clip.startTime + clip.duration));
}

/**
 * Checks if a timeline time is within a valid clip range.
 * 
 * @param timelineTime - Position on timeline (seconds)
 * @param clips - Array of clips
 * @returns true if timeline time is within a clip, false otherwise
 */
export function isTimelineTimeValid(
  timelineTime: number,
  clips: readonly VideoClip[]
): boolean {
  return timelineToSourceTime(timelineTime, clips) !== null;
}
