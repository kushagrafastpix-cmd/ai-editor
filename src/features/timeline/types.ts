export type TrackCategory = 'b-roll' | 'text' | 'video' | 'image' | 'main-video' | 'audio';

export interface TrackRow {
  readonly id: string;
  readonly category: TrackCategory;
  readonly visible: boolean;
  readonly locked: boolean;
  readonly isMainVideo?: boolean; // true for Row 2
  readonly isDefaultAudio?: boolean; // true for Row 3
  readonly clips?: readonly VideoClip[];  // Clips on this track
}

/**
 * Video clip segment on timeline
 * Non-destructive: only maps to source video, doesn't modify media
 */
export interface VideoClip {
  readonly id: string;
  readonly trackId: string;
  readonly startTime: number;      // Timeline position (where clip appears)
  readonly duration: number;        // Clip duration on timeline
  readonly sourceStartTime: number; // Original video start time (source mapping)
  readonly sourceEndTime: number;   // Original video end time (source mapping)
  readonly sourceVideoId: string;  // Reference to original video
}

export interface TimelineState {
  readonly tracks: readonly TrackRow[];
  readonly duration: number;
  readonly clips: readonly VideoClip[];  // All clips across all tracks
}

