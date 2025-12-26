import { useState } from "react";
import ToolCard from "./components/ToolCard/ToolCard";
import ToolToolbar from "./components/ToolToolbar/ToolToolbar";
import { DEFAULT_TOOL } from "./constants";
import type { ToolId } from "./types";

const EditorToolPanel = () => {
  const [activeTool, setActiveTool] = useState<ToolId>(DEFAULT_TOOL);

  return (
    <div className="h-full pt-4 pr-4 pb-4 pl-16">
      <ToolCard>
        <div className="flex h-full flex-col">
          {/* TOOLBAR */}
          <ToolToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
          />

          {/* TOOL CONTENT AREA */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {/* Placeholder – actual tools will be rendered here */}
            <div className="text-sm text-gray-600">
              Active tool: <span className="font-medium">{activeTool}</span>
            </div>
          </div>
        </div>
      </ToolCard>
    </div>
  );
};

export default EditorToolPanel;
