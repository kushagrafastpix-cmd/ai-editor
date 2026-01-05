import ChevronDownIcon from "../../../Common/Icons/ChevronDownIcon";
import UndoIcon from "../../../Common/Icons/UndoIcon";
import RedoIcon from "../../../Common/Icons/RedoIcon";
import DeleteIcon from "../../../Common/Icons/DeleteIcon";
import CutIcon from "../../../Common/Icons/CutIcon";
import CropIcon from "../../../Common/Icons/CropIcon";

interface TimelineTopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCut: () => void;
  onCrop: () => void;
  onHide: () => void;
}

const TimelineTopBar = ({
  onUndo,
  onRedo,
  onDelete,
  onCut,
  onCrop,
  onHide,
}: TimelineTopBarProps) => {
  return (
    <div className="flex-shrink-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        {/* Left controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
            aria-label="Undo"
          >
            <UndoIcon className="h-3 w-3" />
          </button>

          <button
            onClick={onRedo}
            className="flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            aria-label="Redo"
            disabled
          >
            <RedoIcon className="h-3 w-3" />
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
            aria-label="Delete"
          >
            <DeleteIcon className="h-3 w-3" />
          </button>

          <button
            onClick={onCut}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
            aria-label="Cut"
          >
            <CutIcon className="h-3 w-3" />
          </button>

          <button
            onClick={onCrop}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
            aria-label="Crop"
          >
            <CropIcon className="h-3 w-3" />
          </button>
        </div>

        {/* Right control */}
        <button
          onClick={onHide}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          <ChevronDownIcon className="h-3 w-3" />
          <span>Hide timeline</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#DADCE5]" />
    </div>
  );
};

export default TimelineTopBar;
