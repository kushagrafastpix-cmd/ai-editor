import ChevronDownIcon from "../../Common/Icons/ChevronDownIcon";

interface TimelineProps {
  onHide: () => void;
}

const Timeline = ({ onHide }: TimelineProps) => {
  return (
    <div className="h-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Timeline</h2>

        <button
          onClick={onHide}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          <ChevronDownIcon className="h-3 w-3" />
          <span>Hide timeline</span>
        </button>
      </div>

      <div className="h-24 rounded bg-gray-200" />
    </div>
  );
};

export default Timeline;
