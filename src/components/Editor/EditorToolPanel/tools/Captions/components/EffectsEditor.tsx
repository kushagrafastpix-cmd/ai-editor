import { useState } from "react";
import ChevronLeftIcon from "../../../../../Common/Icons/ChevronLeftIcon";
import CustomDropdown from "../../../../../Common/CustomDropdown/CustomDropdown";

interface EffectsEditorProps {
  onBack: () => void;
}

type Position = "Auto" | "Top" | "Middle" | "Bottom";
type Animation = "Bounce" | "Underline" | "Box" | "Pop" | "Scale" | "Focus";
type Lines = "3 lines" | "1 line";

const ACTIVE_BORDER = "#0CB16D";
const ACTIVE_BG = "#EDFFFA";

const EffectsEditor = ({ onBack }: EffectsEditorProps) => {
  const [position, setPosition] = useState<Position>("Top");
  const [animation, setAnimation] = useState<Animation>("Bounce");
  const [lines, setLines] = useState<Lines>("3 lines");

  const positions: Position[] = ["Auto", "Top", "Middle", "Bottom"];
  const animations: Animation[] = ["Bounce", "Underline", "Box", "Pop", "Scale", "Focus"];
  const linesOptions: Lines[] = ["3 lines", "1 line"];

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
        <h2 className="text-base font-semibold text-gray-900">Effects</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="flex flex-col gap-6">
          {/* Position Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Position</h3>
            <div className="flex gap-2">
              {positions.map((pos) => {
                const isSelected = position === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className="
                      flex-1
                      h-10
                      rounded-md
                      border
                      text-sm
                      font-medium
                      transition-all
                      focus:outline-none
                    "
                    style={{
                      borderColor: isSelected ? ACTIVE_BORDER : "#d9d8d6",
                      backgroundColor: isSelected ? ACTIVE_BG : "white",
                      color: isSelected ? ACTIVE_BORDER : "#303132",
                    }}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animation Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Animation</h3>
            <CustomDropdown
              value={animation}
              options={animations.map((anim) => ({
                value: anim,
                label: anim,
              }))}
              onChange={(value) => setAnimation(value as Animation)}
            />
          </div>

          {/* Lines Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Lines</h3>
            <div className="flex gap-2">
              {linesOptions.map((lineOption) => {
                const isSelected = lines === lineOption;
                return (
                  <button
                    key={lineOption}
                    onClick={() => setLines(lineOption)}
                    className="
                      flex-1
                      h-10
                      rounded-md
                      border
                      text-sm
                      font-medium
                      transition-all
                      focus:outline-none
                    "
                    style={{
                      borderColor: isSelected ? ACTIVE_BORDER : "#d9d8d6",
                      backgroundColor: isSelected ? ACTIVE_BG : "white",
                      color: isSelected ? ACTIVE_BORDER : "#303132",
                    }}
                  >
                    {lineOption}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectsEditor;

