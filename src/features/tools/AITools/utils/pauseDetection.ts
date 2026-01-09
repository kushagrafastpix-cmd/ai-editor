import type { TranscriptData } from "@/types/transcript";

/**
 * Represents a pause segment detected in the transcript
 */
export interface PauseSegment {
  readonly startTime: number;  // Start of pause (end of previous word)
  readonly endTime: number;     // End of pause (start of next word)
  readonly duration: number;    // Pause duration in seconds
}

/**
 * Pure function: Detects pauses in transcript exceeding threshold
 * @param transcript - Immutable transcript data
 * @param threshold - Minimum pause duration in seconds (0.1-4.0)
 * @returns Array of pause segments (immutable)
 */
export function detectPauses(
  transcript: TranscriptData,
  threshold: number
): readonly PauseSegment[] {
  const pauses: PauseSegment[] = [];
  const words = transcript.words;

  if (words.length < 2) {
    return pauses;
  }

  // Calculate gaps between consecutive words
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];
    
    // Gap between end of current word and start of next word
    const gap = nextWord.startTime - currentWord.endTime;
    
    // If gap exceeds threshold, it's a pause
    if (gap > threshold) {
      pauses.push({
        startTime: currentWord.endTime,
        endTime: nextWord.startTime,
        duration: gap,
      });
    }
  }
  console.log("pauses", pauses);
  return pauses;
}

/**
 * Pure function: Calculate statistics about detected pauses
 */
export function calculatePauseStats(
  pauses: readonly PauseSegment[]
): { readonly count: number; readonly totalDuration: number } {
  const totalDuration = pauses.reduce((sum, pause) => sum + pause.duration, 0);
  
  return {
    count: pauses.length,
    totalDuration: parseFloat(totalDuration.toFixed(1)),
  };
}


