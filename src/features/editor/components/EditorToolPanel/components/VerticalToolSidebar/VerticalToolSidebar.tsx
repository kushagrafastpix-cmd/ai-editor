import { TOOLS_WITHOUT_TRANSCRIPT } from "../../constants";
import type { DrawerToolId } from "../../types";
import VerticalToolItem from "./VerticalToolItem";

interface VerticalToolSidebarProps {
  activeTool: DrawerToolId | null;
  onToolClick: (id: DrawerToolId) => void;
}

const VerticalToolSidebar = ({
  activeTool,
  onToolClick,
}: VerticalToolSidebarProps) => {
  return (
    <div className="flex h-full w-[75px] flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-col overflow-y-auto scrollbar-hide">
        {TOOLS_WITHOUT_TRANSCRIPT.map((tool) => (
          <VerticalToolItem
            key={tool.id}
            tool={tool}
            isActive={tool.id === activeTool}
            onClick={onToolClick}
          />
        ))}
      </div>
    </div>
  );
};

export default VerticalToolSidebar;


