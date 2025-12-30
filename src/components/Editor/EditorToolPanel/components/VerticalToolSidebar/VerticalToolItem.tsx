import type { DrawerToolId } from "../../types";
import type { ToolConfig } from "../../types";

interface VerticalToolItemProps {
  tool: ToolConfig;
  isActive: boolean;
  onClick: (id: DrawerToolId) => void;
}

const ACTIVE_COLOR = "#5D09C7";

const VerticalToolItem = ({ tool, isActive, onClick }: VerticalToolItemProps) => {
  const Icon = tool.icon;

  return (
    <button
      onClick={() => onClick(tool.id as DrawerToolId)}
      className="
        relative
        flex
        w-full
        flex-col
        items-center
        gap-2
        px-2
        py-3
        text-xs
        font-medium
        cursor-pointer
        select-none
        focus:outline-none
        transition-colors
        hover:bg-gray-50
      "
      style={{
        color: isActive ? ACTIVE_COLOR : "#303132",
        backgroundColor: isActive ? "#F5F0FF" : "transparent",
      }}
    >
      <Icon className="h-5 w-5" />
      <span className="text-center leading-tight">{tool.label}</span>

      {/* Left border indicator for active state */}
      {isActive && (
        <span
          className="
            absolute
            left-0
            top-0
            bottom-0
            w-1
            transition-opacity
            duration-300
          "
          style={{
            backgroundColor: ACTIVE_COLOR,
          }}
        />
      )}
    </button>
  );
};

export default VerticalToolItem;

