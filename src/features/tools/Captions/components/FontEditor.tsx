import { useState } from "react";
import ChevronLeftIcon from "@/components/ui/icons/ChevronLeftIcon";
import type { CaptionFontStyle } from "../types";
import CaptionFontSettings from "./CaptionFontSettings";
import AlignmentControls from "./AlignmentControls";
import CaptionDecorationControls from "./CaptionDecorationControls";
import CaseControls from "./CaseControls";
import ColorRow from "../../Text/components/ColorRow";
import ShadowsControls from "./ShadowsControls";

interface FontEditorProps {
  onBack: () => void;
}

const DEFAULT_FONT_STYLE: CaptionFontStyle = {
  fontFamily: "Inter",
  fontWeight: "Semibold",
  fontSize: 40,
  alignment: "left",
  bold: false,
  underline: false,
  strike: true,
  case: "none",
  fillColor: "#FF4646",
  fillOpacity: 100,
  strokeColor: "#000000",
  strokeOpacity: 100,
  shadowsEnabled: true,
  shadowColor: "#FF4646",
  shadowX: 1,
  shadowY: 1,
  shadowBlur: 25,
};

const FontEditor = ({ onBack }: FontEditorProps) => {
  const [fontStyle, setFontStyle] =
    useState<CaptionFontStyle>(DEFAULT_FONT_STYLE);

  const handleStyleChange = (update: Partial<CaptionFontStyle>) => {
    setFontStyle((prev) => ({ ...prev, ...update }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="
            flex
            items-center
            justify-center
            p-1
            text-gray-600
            hover:text-gray-900
            transition-colors
            focus:outline-none
          "
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Font</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="flex flex-col gap-6">
          {/* Font settings section */}
          <div className="flex flex-col gap-4">
            <span className="font-medium text-gray-800">Font settings</span>
            <CaptionFontSettings
              style={fontStyle}
              onChange={handleStyleChange}
            />
          </div>

          {/* Alignment */}
          <AlignmentControls
            alignment={fontStyle.alignment}
            onChange={(alignment) => handleStyleChange({ alignment })}
          />

          {/* Decoration */}
          <CaptionDecorationControls
            style={fontStyle}
            onChange={handleStyleChange}
          />

          {/* Case */}
          <CaseControls
            case={fontStyle.case}
            onChange={(caseValue) => handleStyleChange({ case: caseValue })}
          />

          {/* Font fill */}
          <ColorRow
            label="Font fill"
            color={fontStyle.fillColor}
            opacity={fontStyle.fillOpacity}
            onOpacityChange={(opacity) =>
              handleStyleChange({ fillOpacity: opacity })
            }
          />

          {/* Font stroke */}
          <ColorRow
            label="Font stroke"
            color={fontStyle.strokeColor}
            opacity={fontStyle.strokeOpacity}
            onOpacityChange={(opacity) =>
              handleStyleChange({ strokeOpacity: opacity })
            }
          />

          {/* Shadows */}
          <ShadowsControls
            shadowsEnabled={fontStyle.shadowsEnabled}
            shadowColor={fontStyle.shadowColor}
            shadowX={fontStyle.shadowX}
            shadowY={fontStyle.shadowY}
            shadowBlur={fontStyle.shadowBlur}
            onToggle={(enabled) =>
              handleStyleChange({ shadowsEnabled: enabled })
            }
            onXChange={(x) => handleStyleChange({ shadowX: x })}
            onYChange={(y) => handleStyleChange({ shadowY: y })}
            onBlurChange={(blur) => handleStyleChange({ shadowBlur: blur })}
          />
        </div>
      </div>
    </div>
  );
};

export default FontEditor;

