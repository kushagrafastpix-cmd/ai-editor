import { formatTimecode } from "@/features/timeline/utils/timeFormat";

interface TimecodeDisplayProps {
  currentTime?: number;
  fps?: number;
}

const TimecodeDisplay = ({ 
  currentTime = 0, 
  fps = 30 
}: TimecodeDisplayProps) => {
  const timecode = formatTimecode(currentTime, fps);

  return (
    <div className="text-xs text-gray-500 font-sans font-medium leading-normal tracking-normal">
      {timecode}
    </div>
  );
};

export default TimecodeDisplay;

