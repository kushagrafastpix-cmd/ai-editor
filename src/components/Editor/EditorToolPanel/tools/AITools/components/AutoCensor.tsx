import { useState } from "react";
import ChevronLeftIcon from "../../../../../Common/Icons/ChevronLeftIcon";
import ChevronDownIcon from "../../../../../Common/Icons/ChevronDownIcon";

interface AutoCensorProps {
  onBack: () => void;
}

type CensoredWordsList = "Curse words (default)" | "Option B" | "Option C";
type CaptionStyle = 'Asterisks("A****")' | 'Dashed("A——")';
type AudioMasking = "Bleep censored words" | "Mute censored words" | "None";

const AutoCensor = ({ onBack }: AutoCensorProps) => {
  const [censoredWordsList, setCensoredWordsList] =
    useState<CensoredWordsList>("Curse words (default)");
  const [captionStyle, setCaptionStyle] =
    useState<CaptionStyle>('Asterisks("A****")');
  const [audioMasking, setAudioMasking] =
    useState<AudioMasking>("Bleep censored words");

  const handleEnable = () => {
    // In real implementation, this would enable the auto censor with selected settings
    console.log("Enable auto censor", {
      censoredWordsList,
      captionStyle,
      audioMasking,
    });
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
        <h2 className="text-base font-semibold text-gray-900">Auto censor</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col px-4 py-4 gap-6">
          {/* Censored words list */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Censored words list</label>
            <div className="relative">
              <select
                className="
                  w-full
                  h-10
                  appearance-none
                  rounded-md
                  border border-[#d9d8d6]
                  bg-[#FBFBFC]
                  px-3 pr-12
                  text-sm
                  outline-none
                "
                value={censoredWordsList}
                onChange={(e) =>
                  setCensoredWordsList(e.target.value as CensoredWordsList)
                }
              >
                <option value="Curse words (default)">
                  Curse words (default)
                </option>
                <option value="Option B">Option B</option>
                <option value="Option C">Option C</option>
              </select>
              <ChevronDownIcon
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-gray-500
                "
              />
            </div>
          </div>

          {/* Caption style */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Caption style</label>
            <div className="relative">
              <select
                className="
                  w-full
                  h-10
                  appearance-none
                  rounded-md
                  border border-[#d9d8d6]
                  bg-[#FBFBFC]
                  px-3 pr-12
                  text-sm
                  outline-none
                "
                value={captionStyle}
                onChange={(e) =>
                  setCaptionStyle(e.target.value as CaptionStyle)
                }
              >
                <option value='Asterisks("A****")'>Asterisks("A****")</option>
                <option value='Dashed("A----")'>Dashed("A----")</option>
              </select>
              <ChevronDownIcon
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-gray-500
                "
              />
            </div>
          </div>

          {/* Audio masking options */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">
              Audio masking options
            </label>
            <div className="relative">
              <select
                className="
                  w-full
                  h-10
                  appearance-none
                  rounded-md
                  border border-[#d9d8d6]
                  bg-[#FBFBFC]
                  px-3 pr-12
                  text-sm
                  outline-none
                "
                value={audioMasking}
                onChange={(e) =>
                  setAudioMasking(e.target.value as AudioMasking)
                }
              >
                <option value="Bleep censored words">
                  Bleep censored words
                </option>
                <option value="Mute censored words">
                  Mute censored words
                </option>
                <option value="None">None</option>
              </select>
              <ChevronDownIcon
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-gray-500
                "
              />
            </div>
          </div>

          {/* Enable button */}
          <button
            onClick={handleEnable}
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
            Enable auto censor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoCensor;

