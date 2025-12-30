import type { TextStyle } from "../types";

interface DecorationControlsProps {
  style: TextStyle;
  onChange: (style: Partial<TextStyle>) => void;
}

const ACTIVE_BORDER = "#0CB16D";
const ACTIVE_BG = "#EDFFFA";

const DecorationControls = ({ style, onChange }: DecorationControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-medium text-gray-900">
        Decoration
      </span>

      <div className="flex items-center gap-2">
        {/* Strikethrough */}
        <button
          onClick={() => onChange({ strike: !style.strike })}
          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: style.strike ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.strike ? ACTIVE_BG : "transparent",
            color: style.strike ? ACTIVE_BORDER : "#303132",
          }}
        >
          <span className="text-lg leading-none">–</span>
        </button>

        {/* Underline */}
        <button
          onClick={() => onChange({ underline: !style.underline })}
          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: style.underline ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.underline ? ACTIVE_BG : "transparent",
            color: style.underline ? ACTIVE_BORDER : "#303132",
          }}
        >
          <span className="text-sm font-semibold underline">U</span>
        </button>

        {/* Wavy line (italic/emphasis) */}
        <button
          onClick={() => onChange({ bold: !style.bold })}
          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: style.bold ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.bold ? ACTIVE_BG : "transparent",
            color: style.bold ? ACTIVE_BORDER : "#303132",
          }}
        >
          <span className="text-sm italic">~</span>
        </button>
      </div>
    </div>
  );
};

export default DecorationControls;
