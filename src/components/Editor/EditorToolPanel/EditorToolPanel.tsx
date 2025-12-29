import { useState } from "react";

import ToolCard from "./components/ToolCard/ToolCard";
import ToolToolbar from "./components/ToolToolbar/ToolToolbar";

import type { ToolId } from "./types";

// tools
import TranscriptTool from "./tools/Transcript/TranscriptTool";
import AIToolsTool from "./tools/AITools/AIToolsTool";
import CaptionsTool from "./tools/Captions/CaptionsTool";
import UploadTool from "./tools/Upload/UploadTool";
import BRollTool from "./tools/BRoll/BRollTool";
import TransitionsTool from "./tools/Transitions/TransitionsTool";
import TextTool from "./tools/Text/TextTool";
import MusicTool from "./tools/Music/MusicTool";

const EditorToolPanel = () => {  // single source of truth
  const [activeTool, setActiveTool] = useState<ToolId>("transcript");

  const renderActiveTool = () => {
    switch (activeTool) {
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
      case "transcript":
      default:
        return (
          <TranscriptTool
            transcriptText={
            `This is a sample transcript.jf fn jf ejr fner fj erf jernfjnerf enr fvejrjf ver fjhver fne vn jenvjer.
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
        );
    }
  };

  return (
    <div className="h-full pt-4 pr-4 pb-4 pl-16">
      <ToolCard>
        {/* toolbar (fixed height, no scroll) */}
        <ToolToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        {/* content area (only this scrolls internally) */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide">
          {renderActiveTool()}
        </div>
      </ToolCard>
    </div>
  );
};

export default EditorToolPanel;
