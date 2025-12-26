import type { ToolConfig } from "./types";
import AIToolsIcon from "../../Common/Icons/AIToolsIcon";
import TranscriptIcon from "../../Common/Icons/TranscriptIcon";
import CaptionsIcon from "../../Common/Icons/CaptionsIcon";
import UploadIcon from "../../Common/Icons/UploadIcon";
import BRollIcon from "../../Common/Icons/BRollIcon";
import TransitionsIcon from "../../Common/Icons/TransitionsIcon";
import TextIcon from "../../Common/Icons/TextIcon";
import MusicIcon from "../../Common/Icons/MusicIcon";

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

export const DEFAULT_TOOL: ToolConfig["id"] = "transcript";
