import { useState } from "react";
import type { AIToolId } from "./types";
import RemoveFillerWordsIcon from "@/components/ui/icons/RemoveFillerWordsIcon";
import RemovePausesIcon from "@/components/ui/icons/RemovePausesIcon";
import AutoCensorIcon from "@/components/ui/icons/AutoCensorIcon";
import SpeechEnhancementIcon from "@/components/ui/icons/SpeechEnhancementIcon";
import AIHookIcon from "@/components/ui/icons/AIHookIcon";
import AIEmojiIcon from "@/components/ui/icons/AIEmojiIcon";
import AIKeywordsHighlighterIcon from "@/components/ui/icons/AIKeywordsHighlighterIcon";
import SpeakerColorIcon from "@/components/ui/icons/SpeakerColorIcon";
import RemoveFillerWords from "./components/RemoveFillerWords";
import RemovePauses from "./components/RemovePauses";
import SpeechEnhancement from "./components/SpeechEnhancement";
import AIEmoji from "./components/AIEmoji";
import AIKeywordsHighlighter from "./components/AIKeywordsHighlighter";
import AISpeakerColor from "./components/AISpeakerColor";
import AutoCensor from "./components/AutoCensor";

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
    id: "ai-keywords-highlighter",
    label: "AI keywords highlighter",
    icon: AIKeywordsHighlighterIcon,
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
    setSelectedTool(null);
  };

  // If a tool is active, show its detail view
  if (activeTool === "remove-filler-words") {
    return <RemoveFillerWords onBack={handleBack} />;
  }

  if (activeTool === "remove-pauses") {
    return <RemovePauses onBack={handleBack} />;
  }

  if (activeTool === "speech-enhancement") {
    return <SpeechEnhancement onBack={handleBack} />;
  }

  if (activeTool === "ai-emoji") {
    return <AIEmoji onBack={handleBack} />;
  }

  if (activeTool === "ai-keywords-highlighter") {
    return <AIKeywordsHighlighter onBack={handleBack} />;
  }

  if (activeTool === "speaker-color") {
    return <AISpeakerColor onBack={handleBack} />;
  }

  if (activeTool === "auto-censor") {
    return <AutoCensor onBack={handleBack} />;
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