import { useState } from "react";

import VerticalToolSidebar from "./components/VerticalToolSidebar/VerticalToolSidebar";
import ToolDrawer from "./components/ToolDrawer/ToolDrawer";
import ToolCard from "./components/ToolCard/ToolCard";

import type { DrawerToolId } from "./types";
import type { TranscriptData } from "@/types/transcript";

// tools
import TranscriptTool from "@/features/tools/Transcript/TranscriptTool";
import AIToolsTool from "@/features/tools/AITools/AIToolsTool";
import CaptionsTool from "@/features/tools/Captions/CaptionsTool";
import UploadTool from "@/features/tools/Upload/UploadTool";
import BRollTool from "@/features/tools/BRoll/BRollTool";
import TransitionsTool from "@/features/tools/Transitions/TransitionsTool";
import TextTool from "@/features/tools/Text/TextTool";
import MusicTool from "@/features/tools/Music/MusicTool";

interface EditorToolPanelProps {
  transcript?: TranscriptData;
  onRemovePauses?: (threshold: number) => void;
}

const EditorToolPanel = ({ transcript, onRemovePauses }: EditorToolPanelProps) => {
  const [openDrawerTool, setOpenDrawerTool] = useState<DrawerToolId | null>(
    null
  );

  const renderToolContent = (toolId: DrawerToolId) => {
    switch (toolId) {
      case "ai-tools":
        return (
          <AIToolsTool
            transcript={transcript}
            onRemovePauses={onRemovePauses}
          />
        );
      case "captions":
        return <CaptionsTool />;
      case "upload":
        return <UploadTool />;
      case "b-roll":
        return <BRollTool />;
      case "transitions":
        return <TransitionsTool />;
      case "text":
        return <TextTool />;
      case "music":
        return <MusicTool />;
      default:
        return null;
    }
  };

  const handleToolClick = (toolId: DrawerToolId) => {
    // If clicking the same tool, close it; otherwise open the new one
    setOpenDrawerTool((current) => (current === toolId ? null : toolId));
  };

  return (
    <div className="relative flex h-full w-full bg-white">
      {/* Vertical Tool Sidebar */}
      <VerticalToolSidebar
        activeTool={openDrawerTool}
        onToolClick={handleToolClick}
      />

      {/* Main Content Area - Transcript always visible */}
      <div className="relative flex-1 min-w-0 overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
        {/* Transcript - Always visible, fills entire area */}
        <div className="absolute inset-0 pt-4 pr-4 pb-4 pl-4">
          <ToolCard>
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide">
              <TranscriptTool
                transcriptText={`This is a sample transcript.jf fn jf ejr fner fj erf jernfjnerf enr fvejrjf ver fjhver fne vn jenvjer.
            sfnjdf
            It is rendered as plain paragraphs.
            Scrollbar should be hidden, but scrolling should work.
            his is a sample transcript.
            It is rendered as plain paragraphs.
            Scrollbar should be hidden, but scrolling should work.
            his is a sample transcript.
            It is rendered as plain paragraphs.
            Scrollbar should be hidden, but scrolling should work.
            his is a sample transcript.
            It is rendered as plain paragraphs.
            Scrollbar should be hidden, but scrolling should work.`}
              />
            </div>
          </ToolCard>
        </div>

        {/* Tool Drawer - Overlay when tool is selected */}
        {openDrawerTool && (
          <ToolDrawer onClose={() => setOpenDrawerTool(null)}>
            {renderToolContent(openDrawerTool)}
          </ToolDrawer>
        )}
      </div>
    </div>
  );
};

export default EditorToolPanel;
