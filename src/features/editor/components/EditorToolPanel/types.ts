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

export type DrawerToolId = Exclude<ToolId, "transcript">;

export interface ToolConfig {
  id: ToolId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
