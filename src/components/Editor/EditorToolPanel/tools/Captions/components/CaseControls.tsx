import type { TextCase } from "../types";
import MinusIcon from "../../../../../Common/Icons/MinusIcon";

interface CaseControlsProps {
  case: TextCase;
  onChange: (caseValue: TextCase) => void;
}

const ACTIVE_BORDER = "#0CB16D";
const ACTIVE_BG = "#EDFFFA";

const CaseControls = ({ case: caseValue, onChange }: CaseControlsProps) => {
  const cases: { value: TextCase; label: string; isIcon?: boolean }[] = [
    { value: "none", label: "", isIcon: true },
    { value: "uppercase", label: "AG" },
    { value: "lowercase", label: "ag" },
    { value: "capitalize", label: "Ag" },
  ];

  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-medium text-gray-900">Case</span>

      <div className="flex items-center gap-2">
        {cases.map(({ value, label, isIcon }) => {
          const isSelected = caseValue === value;
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
              {isIcon ? (
                <MinusIcon className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CaseControls;

