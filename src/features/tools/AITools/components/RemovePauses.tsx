import { useState, useMemo } from "react";
import ChevronLeftIcon from "@/components/ui/icons/ChevronLeftIcon";
import type { TranscriptData } from "@/types/transcript";
import { detectPauses, calculatePauseStats } from "../utils/pauseDetection";

interface RemovePausesProps {
  onBack: () => void;
  transcript: TranscriptData;
  onApply: (threshold: number) => void;
}

const RemovePauses = ({ onBack, transcript, onApply }: RemovePausesProps) => {
  const [pauseDuration, setPauseDuration] = useState(2.0); // Default 2 seconds
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate detected pauses and total duration using utilities
  // This is for UI display only - actual mutation happens in route action
  const { count: pauseCount, totalDuration } = useMemo(() => {
    const pauses = detectPauses(transcript, pauseDuration);
    return calculatePauseStats(pauses);
  }, [transcript, pauseDuration]);

  const handleRemovePauses = () => {
    // Express intent only - call onApply callback with threshold
    // EditorUI will handle submission to route action
    onApply(pauseDuration);

    // Show toast notification
    if (pauseCount > 0) {
      setToastMessage(`Removing ${pauseCount} pauses...`);
    } else {
      setToastMessage("No pauses found!");
    }

    // Auto-clear toast after 2 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 1) {
      return `${Math.round(seconds * 10) / 10}s`;
    }
    return `${Math.round(seconds * 10) / 10}s`;
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
          Remove pauses
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col px-4 py-4">
          {/* Pause duration section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pause duration
            </label>
            
            {/* Slider container */}
            <div className="relative">
              {/* Slider track */}
              <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                {/* Filled portion (green) */}
                <div
                  className="absolute h-2 bg-[#0CB16D] rounded-full"
                  style={{
                    width: `${(pauseDuration / 4) * 100}%`,
                  }}
                />
                
                {/* Slider input */}
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={pauseDuration}
                  onChange={(e) => setPauseDuration(parseFloat(e.target.value))}
                  className="
                    absolute
                    top-0
                    left-0
                    w-full
                    h-2
                    opacity-0
                    cursor-pointer
                    z-10
                  "
                />
                
                {/* Slider thumb (visible) */}
                <div
                  className="
                    absolute
                    top-1/2
                    -translate-y-1/2
                    w-5
                    h-5
                    bg-white
                    border-2
                    border-[#0CB16D]
                    rounded-full
                    shadow-sm
                    pointer-events-none
                    z-20
                  "
                  style={{
                    left: `calc(${(pauseDuration / 4) * 100}% - 10px)`,
                  }}
                />
              </div>
              
              {/* Duration display */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatDuration(pauseDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleRemovePauses}
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
              mb-4
            "
          >
            Remove pauses ({pauseCount})
          </button>

          {/* Info text */}
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <p>
              {pauseCount} pause{pauseCount !== 1 ? 's' : ''} longer than {formatDuration(pauseDuration)} {pauseCount !== 1 ? 'are' : 'is'} detected.
            </p>
            <p>
              {formatDuration(totalDuration)} can be removed from your video.
            </p>
          </div>
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

export default RemovePauses;

