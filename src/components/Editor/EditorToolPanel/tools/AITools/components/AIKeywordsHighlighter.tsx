import { useState } from "react";
import ChevronLeftIcon from "../../../../../Common/Icons/ChevronLeftIcon";
import AIKeywordsHighlighterImage from "@/assets/AIKeywordsHighlighterImage.png";

interface AIKeywordsHighlighterProps {
  onBack: () => void;
}

const AIKeywordsHighlighter = ({ onBack }: AIKeywordsHighlighterProps) => {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    setEnabled(!enabled);
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
        <h2 className="text-base font-semibold text-gray-900">
          AI keywords highlighter
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col px-4 py-4">
          {/* Image area - dark background */}
          <div className="mb-6 rounded-lg bg-gray-900 flex items-center justify-center" style={{ height: '140px', padding: '15px' }}>
            <div className="w-full overflow-hidden rounded flex items-center justify-center" style={{ height: '110px' }}>
              <img
                src={AIKeywordsHighlighterImage}
                alt="AI keywords highlighter visualization"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          </div>

          {/* Enable AI keywords highlighter control */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-900">
                Enable AI keywords highlighter
              </span>
              <span className="text-xs text-gray-500">
                Automatically highlights key words for better clarity.
              </span>
            </div>

            <button
              onClick={handleToggle}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                enabled ? "bg-[#0CB16D]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKeywordsHighlighter;

