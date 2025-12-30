import { useState } from "react";
import PresetsIcon from "../../../../../Common/Icons/PresetsIcon";
import FontIcon from "../../../../../Common/Icons/FontIcon";
import EffectsIcon from "../../../../../Common/Icons/EffectsIcon";
import type { CaptionSection } from "../types";

interface AddCaptionSectionProps {
  onSelect: (section: CaptionSection) => void;
}

const AddCaptionSection = ({ onSelect }: AddCaptionSectionProps) => {
  const [hoveredSection, setHoveredSection] =
    useState<CaptionSection | null>(null);

  const CardButton = ({
    section,
    icon: Icon,
    label,
  }: {
    section: CaptionSection;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => {
    const isHovered = hoveredSection === section;

    return (
      <button
        onClick={() => onSelect(section)}
        onMouseEnter={() => setHoveredSection(section)}
        onMouseLeave={() => setHoveredSection(null)}
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
            isHovered
              ? "bg-[#EDFFFA] border-[#0CB16D]"
              : "bg-white border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <Icon
          className={`h-6 w-6 ${
            isHovered ? "text-gray-900" : "text-gray-700"
          }`}
        />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Presets - Top Left */}
        <CardButton
          section="presets"
          icon={PresetsIcon}
          label="Presets"
        />

        {/* Font - Top Right */}
        <CardButton
          section="font"
          icon={FontIcon}
          label="Font"
        />

        {/* Effects - Bottom Left */}
        <CardButton
          section="effects"
          icon={EffectsIcon}
          label="Effects"
        />
      </div>
    </div>
  );
};

export default AddCaptionSection;

