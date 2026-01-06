import type { ToolConfig } from "./types";
import AIToolsIcon from "@/components/ui/icons/AIToolsIcon";
import TranscriptIcon from "@/components/ui/icons/TranscriptIcon";
import CaptionsIcon from "@/components/ui/icons/CaptionsIcon";
import UploadIcon from "@/components/ui/icons/UploadIcon";
import BRollIcon from "@/components/ui/icons/BRollIcon";
import TransitionsIcon from "@/components/ui/icons/TransitionsIcon";
import TextIcon from "@/components/ui/icons/TextIcon";
import MusicIcon from "@/components/ui/icons/MusicIcon";

export const TOOLS: ToolConfig[] = [
  { id: "ai-tools", label: "AI tools", icon: AIToolsIcon },
  { id: "transcript", label: "Transcript", icon: TranscriptIcon },
  { id: "captions", label: "Captions", icon: CaptionsIcon },
  { id: "upload", label: "Upload", icon: UploadIcon },
  { id: "b-roll", label: "B Roll", icon: BRollIcon },
  { id: "transitions", label: "Transitions", icon: TransitionsIcon },
  { id: "text", label: "Text", icon: TextIcon },
  { id: "music", label: "Music", icon: MusicIcon },
];

// Tools without transcript (for drawer sidebar)
export const TOOLS_WITHOUT_TRANSCRIPT: ToolConfig[] = TOOLS.filter(
  (tool) => tool.id !== "transcript"
);

export const DEFAULT_TOOL: ToolConfig["id"] = "transcript";
