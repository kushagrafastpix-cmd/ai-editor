import { useState } from "react";
import ChevronLeftIcon from "@/components/ui/icons/ChevronLeftIcon";
import CustomDropdown from "@/components/ui/CustomDropdown/CustomDropdown";

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
            <CustomDropdown
              value={censoredWordsList}
              options={[
                { value: "Curse words (default)", label: "Curse words (default)" },
                { value: "Option B", label: "Option B" },
                { value: "Option C", label: "Option C" },
              ]}
              onChange={(value) =>
                setCensoredWordsList(value as CensoredWordsList)
              }
            />
          </div>

          {/* Caption style */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Caption style</label>
            <CustomDropdown
              value={captionStyle}
              options={[
                { value: 'Asterisks("A****")', label: 'Asterisks("A****")' },
                { value: 'Dashed("A----")', label: 'Dashed("A----")' },
              ]}
              onChange={(value) => setCaptionStyle(value as CaptionStyle)}
            />
          </div>

          {/* Audio masking options */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">
              Audio masking options
            </label>
            <CustomDropdown
              value={audioMasking}
              options={[
                { value: "Bleep censored words", label: "Bleep censored words" },
                { value: "Mute censored words", label: "Mute censored words" },
                { value: "None", label: "None" },
              ]}
              onChange={(value) => setAudioMasking(value as AudioMasking)}
            />
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

