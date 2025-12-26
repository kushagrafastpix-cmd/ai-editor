import type { ToolConfig } from "../../types";

interface ToolTabItemProps {
  tool: ToolConfig;
  isActive: boolean;
  onClick: (id: ToolConfig["id"]) => void;
}

const ACTIVE_COLOR = "#5D09C7";

const ToolTabItem = ({ tool, isActive, onClick }: ToolTabItemProps) => {
  const Icon = tool.icon;

  return (
    <button
      onClick={() => onClick(tool.id)}
      className="
        relative
        flex
        min-w-[72px]
        flex-col
        items-center
        gap-1
        px-1
        pt-1
        pb-2
        text-xs
        font-medium
        cursor-pointer
        select-none
        focus:outline-none
      "
      style={{
        color: isActive ? ACTIVE_COLOR : "#303132",
      }}
    >
      <Icon className="h-5 w-5" />
      <span>{tool.label}</span>

      {/* underline */}
      <span
        className={`
          absolute
          bottom-0
          left-1/2
          h-[2px]
          -translate-x-1/2
          transition-all
          duration-300
          ${isActive ? "opacity-100" : "opacity-0"}
        `}
        style={{
          width: "64px",
          backgroundColor: ACTIVE_COLOR,
        }}
      />
    </button>
  );
};

export default ToolTabItem;
