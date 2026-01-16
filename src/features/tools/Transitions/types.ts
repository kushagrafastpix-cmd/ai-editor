// EditorToolPanel/tools/Transitions/types.ts

export type TransitionId =
  | "cross-fade"
  | "cross-zoom"
  | "zoom-in"
  | "zoom-out"
  | "fade-in"
  | "fade-out";

export interface TransitionConfig {
  id: TransitionId;
  label: string;
  // thumbnail / preview placeholder for now
  preview?: string;
}

export interface TransitionEffect {
  id: string;
  transitionId: TransitionId;
  startTime: number;
  duration: number;
}
