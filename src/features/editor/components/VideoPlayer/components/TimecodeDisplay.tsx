interface TimecodeDisplayProps {
  timecode?: string;
}

const TimecodeDisplay = ({ timecode = "00:00:00:00" }: TimecodeDisplayProps) => {
  return (
    <div className="text-xs text-gray-600 font-mono">
      {timecode}
    </div>
  );
};

export default TimecodeDisplay;

