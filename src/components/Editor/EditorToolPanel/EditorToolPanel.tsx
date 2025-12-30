import { useState } from "react";

import VerticalToolSidebar from "./components/VerticalToolSidebar/VerticalToolSidebar";
import ToolDrawer from "./components/ToolDrawer/ToolDrawer";
import ToolCard from "./components/ToolCard/ToolCard";

import type { DrawerToolId } from "./types";

// tools
import TranscriptTool from "./tools/Transcript/TranscriptTool";
import AIToolsTool from "./tools/AITools/AIToolsTool";
import CaptionsTool from "./tools/Captions/CaptionsTool";
import UploadTool from "./tools/Upload/UploadTool";
import BRollTool from "./tools/BRoll/BRollTool";
import TransitionsTool from "./tools/Transitions/TransitionsTool";
import TextTool from "./tools/Text/TextTool";
import MusicTool from "./tools/Music/MusicTool";

const EditorToolPanel = () => {
  const [openDrawerTool, setOpenDrawerTool] = useState<DrawerToolId | null>(
    null
  );

  const renderToolContent = (toolId: DrawerToolId) => {
    switch (toolId) {
      case "ai-tools":
        return <AIToolsTool />;
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
    <div className="flex h-full">
      {/* Vertical Tool Sidebar */}
      <VerticalToolSidebar
        activeTool={openDrawerTool}
        onToolClick={handleToolClick}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Transcript - Always visible */}
        <div className="h-full pt-4 pr-4 pb-4 pl-4">
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
          <ToolDrawer
            toolId={openDrawerTool}
            onClose={() => setOpenDrawerTool(null)}
          >
            {renderToolContent(openDrawerTool)}
          </ToolDrawer>
        )}
      </div>
    </div>
  );
};

export default EditorToolPanel;
