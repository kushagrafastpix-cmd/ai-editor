import type { CaptionFontStyle } from "../types";
import MinusIcon from "../../../../../Common/Icons/MinusIcon";
import UnderlineIcon from "../../../../../Common/Icons/UnderlineIcon";
import StrikethroughIcon from "../../../../../Common/Icons/StrikethroughIcon";

interface CaptionDecorationControlsProps {
  style: CaptionFontStyle;
  onChange: (style: Partial<CaptionFontStyle>) => void;
}

const ACTIVE_BORDER = "#0CB16D";
const ACTIVE_BG = "#EDFFFA";

const CaptionDecorationControls = ({
  style,
  onChange,
}: CaptionDecorationControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-medium text-gray-900">Decoration</span>

      <div className="flex items-center gap-2">
        {/* Strikethrough */}
        <button
          onClick={() => onChange({ strike: !style.strike })}
          className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            style.strike ? `text-[#0CB16D]` : "text-[#303132]"
          }`}
          style={{
            borderColor: style.strike ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.strike ? ACTIVE_BG : "transparent",
          }}
        >
          <MinusIcon className="h-4 w-4" />
        </button>

        {/* Underline */}
        <button
          onClick={() => onChange({ underline: !style.underline })}
          className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            style.underline ? `text-[#0CB16D]` : "text-[#303132]"
          }`}
          style={{
            borderColor: style.underline ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.underline ? ACTIVE_BG : "transparent",
          }}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        {/* Strikethrough (wavy line alternative) */}
        <button
          onClick={() => onChange({ bold: !style.bold })}
          className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            style.bold ? `text-[#0CB16D]` : "text-[#303132]"
          }`}
          style={{
            borderColor: style.bold ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.bold ? ACTIVE_BG : "transparent",
          }}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CaptionDecorationControls;

