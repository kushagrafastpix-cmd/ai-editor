interface TimecodeDisplayProps {
  timecode?: string;
}

const TimecodeDisplay = ({ timecode = "00:00:00:00" }: TimecodeDisplayProps) => {
  return (
    <div className="text-xs text-gray-500 font-sans font-medium leading-normal tracking-normal">
      {timecode}
    </div>
  );
};

export default TimecodeDisplay;

