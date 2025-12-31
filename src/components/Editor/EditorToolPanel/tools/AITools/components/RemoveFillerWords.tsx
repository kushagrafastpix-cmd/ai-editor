import { useState } from "react";
import ChevronLeftIcon from "../../../../../Common/Icons/ChevronLeftIcon";
import RemoveFillerWordsImage from "@/assets/RemoveFillerWordsImage.png";

interface RemoveFillerWordsProps {
  onBack: () => void;
}

const RemoveFillerWords = ({ onBack }: RemoveFillerWordsProps) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRemoveFillerWords = () => {
    // Simulate processing - in real implementation, this would call the backend
    // For now, randomly show success or no filler words found
    const hasFillerWords = Math.random() > 0.3; // 70% chance of finding filler words

    if (hasFillerWords) {
      setToastMessage("Successfully removed filler words");
    } else {
      setToastMessage("No filler words found!");
    }

    // Auto-clear toast after 2 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
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
          Remove filler words
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col px-4 py-4">
          {/* Image area - dark background */}
          <div className="mb-4 rounded-lg bg-gray-900 p-4">
            <img
              src={RemoveFillerWordsImage}
              alt="Remove filler words visualization"
              className="w-full h-auto rounded"
            />
          </div>

          {/* Description text */}
          <p className="mb-6 text-sm text-gray-600">
            Removes words like "um", "uh", etc.
          </p>

          {/* Action button */}
          <button
            onClick={handleRemoveFillerWords}
            className="
              w-full
              rounded-lg
              bg-[#0CB16D]
              px-4
              py-3
              text-center
              text-sm
              font-medium
              text-white
              transition-colors
              hover:bg-[#0A9D5C]
              focus:outline-none
            "
          >
            Remove filler words
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div
          className="
            pointer-events-none
            fixed
            left-1/2
            -translate-x-1/2
            rounded-md
            bg-[#5D09C7]
            px-4
            py-2
            text-sm
            text-white
            shadow-lg
            z-50
          "
          style={{
            top: "68px", // header height (56px) + spacing
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default RemoveFillerWords;

