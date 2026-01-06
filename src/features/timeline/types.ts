export type TrackCategory = 'b-roll' | 'text' | 'video' | 'image' | 'main-video' | 'audio';

export interface TrackRow {
  id: string;
  category: TrackCategory;
  visible: boolean;
  locked: boolean;
  isMainVideo?: boolean; // true for Row 2
  isDefaultAudio?: boolean; // true for Row 3
}

