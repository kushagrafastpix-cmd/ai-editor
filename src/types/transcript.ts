/**
 * Word-level transcript data structure
 * Immutable by design - all fields are readonly
 * Serializable for easy persistence and backend sync
 */
export interface TranscriptWord {
  readonly word: string;
  readonly startTime: number;  // seconds
  readonly endTime: number;    // seconds
  readonly confidence?: number;
}

export interface TranscriptData {
  readonly words: readonly TranscriptWord[];
  readonly totalDuration: number;
  readonly language?: string;
  readonly videoId?: string;
}


