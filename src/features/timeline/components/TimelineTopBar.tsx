import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";
import UndoIcon from "@/components/ui/icons/UndoIcon";
import RedoIcon from "@/components/ui/icons/RedoIcon";
import DeleteIcon from "@/components/ui/icons/DeleteIcon";
import CutIcon from "@/components/ui/icons/CutIcon";
import CropIcon from "@/components/ui/icons/CropIcon";

interface TimelineTopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCut: () => void;
  onCrop: () => void;
  onHide: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const TimelineTopBar = ({
  onUndo,
  onRedo,
  onDelete,
  onCut,
  onCrop,
  onHide,
  canUndo = false,
  canRedo = false,
}: TimelineTopBarProps) => {
  return (
    <div className="flex-shrink-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        {/* Left controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center justify-center p-1.5 rounded transition-colors ${
              canUndo
                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Undo"
          >
            <UndoIcon className="h-3 w-3" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center justify-center p-1.5 rounded transition-colors ${
              canRedo
                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Redo"
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
