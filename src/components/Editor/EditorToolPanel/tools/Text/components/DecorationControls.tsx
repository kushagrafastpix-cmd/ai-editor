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
        {/* Bold */}
        <button
          onClick={() => onChange({ bold: !style.bold })}
          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
          style={{
            borderColor: style.bold ? ACTIVE_BORDER : "#d9d8d6",
            backgroundColor: style.bold ? ACTIVE_BG : "transparent",
            color: style.bold ? ACTIVE_BORDER : "#303132",
          }}
        >
          –
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
          U
        </button>

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
          S
        </button>
      </div>
    </div>
  );
};

export default DecorationControls;
