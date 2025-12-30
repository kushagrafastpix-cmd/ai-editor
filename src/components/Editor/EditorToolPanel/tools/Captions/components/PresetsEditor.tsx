import { useState } from "react";
import ChevronLeftIcon from "../../../../../Common/Icons/ChevronLeftIcon";

interface PresetsEditorProps {
  onBack: () => void;
}

const PresetsEditor = ({ onBack }: PresetsEditorProps) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // First card is selected by default

  // Dummy preset data
  const presets = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: `Style ${i + 1}`,
  }));

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
        <h2 className="text-base font-semibold text-gray-900">Presets</h2>
      </div>

      {/* Scrollable grid container */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  px-3
                  py-4
                  text-center
                  text-sm
                  font-medium
                  transition-all
                  focus:outline-none
                  ${
                    isSelected
                      ? "bg-[#EDFFFA] border-[#0CB16D]"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div
                  className={`
                    w-full
                    h-16
                    rounded
                    flex
                    items-center
                    justify-center
                    text-xs
                    ${
                      isSelected
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PresetsEditor;

