import { TOOLS } from "../../constants";
import type { ToolId } from "../../types";
import ToolTabItem from "./ToolTabItem";

interface ToolToolbarProps {
  activeTool: ToolId;
  onToolChange: (id: ToolId) => void;
}

const ToolToolbar = ({ activeTool, onToolChange }: ToolToolbarProps) => {
  return (
    <div className="border-b">
      <div className="scrollbar-hidden flex items-center gap-2 overflow-x-auto px-4 py-2">
        {TOOLS.map((tool) => (
          <ToolTabItem
            key={tool.id}
            tool={tool}
            isActive={tool.id === activeTool}
            onClick={onToolChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolToolbar;
