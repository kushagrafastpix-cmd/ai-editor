import type { ComponentType } from "react";

export type ToolId =
  | "ai-tools"
  | "transcript"
  | "captions"
  | "upload"
  | "b-roll"
  | "transitions"
  | "text"
  | "music";

export interface ToolConfig {
  id: ToolId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
