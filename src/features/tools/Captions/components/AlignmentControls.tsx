import type { Alignment } from "../types";
import AlignLeftIcon from "@/components/ui/icons/AlignLeftIcon";
import AlignCenterIcon from "@/components/ui/icons/AlignCenterIcon";
import AlignRightIcon from "@/components/ui/icons/AlignRightIcon";
import AlignJustifyIcon from "@/components/ui/icons/AlignJustifyIcon";

interface AlignmentControlsProps {
  alignment: Alignment;
  onChange: (alignment: Alignment) => void;
}

const ACTIVE_BORDER = "#0CB16D";
const ACTIVE_BG = "#EDFFFA";

const AlignmentControls = ({ alignment, onChange }: AlignmentControlsProps) => {
  const alignments: { value: Alignment; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "left", icon: AlignLeftIcon },
    { value: "center", icon: AlignCenterIcon },
    { value: "right", icon: AlignRightIcon },
    { value: "justify", icon: AlignJustifyIcon },
  ];

  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-medium text-gray-900">Alignment</span>

      <div className="flex items-center gap-2">
        {alignments.map(({ value, icon: Icon }) => {
          const isSelected = alignment === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                isSelected ? `text-[#0CB16D]` : "text-[#303132]"
              }`}
              style={{
                borderColor: isSelected ? ACTIVE_BORDER : "#d9d8d6",
                backgroundColor: isSelected ? ACTIVE_BG : "transparent",
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlignmentControls;

