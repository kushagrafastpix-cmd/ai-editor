import type { TranscriptData } from "@/types/transcript";
import type { TimelineState } from "@/features/timeline/types";

/**
 * Represents a complete snapshot of editor state for history tracking
 */
export interface HistoryEntry {
  timelineState: TimelineState;
  transcript: TranscriptData;
  // Future: textLayers, captions, etc.
}

/**
 * Deep clones a history entry to create an immutable snapshot
 * Uses structured cloning (JSON serialization) for deep copy
 */
export function deepCloneState(entry: HistoryEntry): HistoryEntry {
  // Use structured cloning via JSON for deep copy
  // This ensures all nested objects and arrays are cloned
  return JSON.parse(JSON.stringify(entry)) as HistoryEntry;
}

/**
 * Creates an initial history entry from timeline state and transcript
 */
export function createHistoryEntry(
  timelineState: TimelineState,
  transcript: TranscriptData
): HistoryEntry {
  return {
    timelineState,
    transcript,
  };
}
