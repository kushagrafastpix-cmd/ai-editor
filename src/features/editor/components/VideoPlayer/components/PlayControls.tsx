import PlayIcon from "@/components/ui/icons/PlayIcon";
import NextIcon from "@/components/ui/icons/NextIcon";
import PreviousIcon from "@/components/ui/icons/PreviousIcon";

interface PlayControlsProps {
  onPrevious?: () => void;
  onPlay?: () => void;
  onNext?: () => void;
}

const PlayControls = ({
  onPrevious,
  onPlay,
  onNext,
}: PlayControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrevious}
        className="
          flex
          items-center
          justify-center
          p-1.5
          text-gray-600
          hover:text-gray-900
          hover:bg-gray-100
          rounded
          transition-colors
          focus:outline-none
        "
        aria-label="Previous"
      >
        <PreviousIcon className="h-3 w-3" />
      </button>

      <button
        onClick={onPlay}
        className="
          flex
          items-center
          justify-center
          p-1.5
          text-gray-600
          hover:text-gray-900
          hover:bg-gray-100
          rounded
          transition-colors
          focus:outline-none
        "
        aria-label="Play"
      >
        <PlayIcon className="h-3 w-3" />
      </button>

      <button
        onClick={onNext}
        className="
          flex
          items-center
          justify-center
          p-1.5
          text-gray-600
          hover:text-gray-900
          hover:bg-gray-100
          rounded
          transition-colors
          focus:outline-none
        "
        aria-label="Next"
      >
        <NextIcon className="h-3 w-3" />
      </button>
    </div>
  );
};

export default PlayControls;

