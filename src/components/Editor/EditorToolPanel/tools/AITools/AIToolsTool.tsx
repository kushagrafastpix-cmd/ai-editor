import { useState } from "react";
import type { AIToolId } from "./types";
import RemoveFillerWordsIcon from "../../../../Common/Icons/RemoveFillerWordsIcon";
import RemovePausesIcon from "../../../../Common/Icons/RemovePausesIcon";
import AutoCensorIcon from "../../../../Common/Icons/AutoCensorIcon";
import SpeechEnhancementIcon from "../../../../Common/Icons/SpeechEnhancementIcon";
import AIHookIcon from "../../../../Common/Icons/AIHookIcon";
import AIEmojiIcon from "../../../../Common/Icons/AIEmojiIcon";
import AIKeywordsHighlightIcon from "../../../../Common/Icons/AIKeywordsHighlightIcon";
import SpeakerColorIcon from "../../../../Common/Icons/SpeakerColorIcon";
import RemoveFillerWords from "./components/RemoveFillerWords";

interface AIToolConfig {
  id: AIToolId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AI_TOOLS: AIToolConfig[] = [
  {
    id: "remove-filler-words",
    label: "Remove filler words",
    icon: RemoveFillerWordsIcon,
  },
  {
    id: "remove-pauses",
    label: "Remove pauses",
    icon: RemovePausesIcon,
  },
  {
    id: "auto-censor",
    label: "Auto censor",
    icon: AutoCensorIcon,
  },
  {
    id: "speech-enhancement",
    label: "Speech enhancement",
    icon: SpeechEnhancementIcon,
  },
  {
    id: "ai-hook",
    label: "AI hook",
    icon: AIHookIcon,
  },
  {
    id: "ai-emoji",
    label: "AI emoji",
    icon: AIEmojiIcon,
  },
  {
    id: "ai-keywords-highlight",
    label: "AI keywords highlight",
    icon: AIKeywordsHighlightIcon,
  },
  {
    id: "speaker-color",
    label: "Speaker color",
    icon: SpeakerColorIcon,
  },
];

const AIToolsTool = () => {
  const [selectedTool, setSelectedTool] = useState<AIToolId | null>(null);
  const [hoveredTool, setHoveredTool] = useState<AIToolId | null>(null);
  const [activeTool, setActiveTool] = useState<AIToolId | null>(null);

  const handleBack = () => {
    setActiveTool(null);
  };

  // If a tool is active, show its detail view
  if (activeTool === "remove-filler-words") {
    return <RemoveFillerWords onBack={handleBack} />;
  }

  // Otherwise show the grid of tools
  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          const isHovered = hoveredTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                setActiveTool(tool.id);
              }}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`
                flex
                flex-col
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                px-4
                py-6
                text-center
                text-sm
                font-medium
                text-gray-900
                transition-all
                focus:outline-none
                ${
                  isSelected || isHovered
                    ? "bg-[#EDFFFA] border-[#0CB16D]"
                    : "bg-white border-gray-200"
                }
              `}
            >
              <Icon
                className={`h-6 w-6 ${
                  isSelected || isHovered ? "text-gray-900" : "text-gray-700"
                }`}
              />
              <span className="leading-tight">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIToolsTool;