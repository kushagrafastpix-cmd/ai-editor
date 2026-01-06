// EditorToolPanel/tools/Music/components/MusicItem.tsx

import type { MusicItem } from "../types";
import LikeIcon from "@/components/ui/icons/LikeIcon";
import AddIcon from "@/components/ui/icons/AddIcon";

interface Props {
  item: MusicItem;
  onLike: (id: string) => void;
  onAdd?: (id: string) => void; // timeline add (Phase 2/3)
}

const MusicItemRow = ({ item, onLike, onAdd }: Props) => {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: thumbnail + metadata */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded bg-gray-300" />

        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.title}
          </div>
          <div className="text-xs text-gray-500">
            {item.duration} · {item.author}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Like */}
        <button
          onClick={() => onLike(item.id)}
          className={`
            h-8 w-8
            flex items-center justify-center
            rounded-md
            border
            transition-colors
            ${
              item.liked
                ? "border-[#0CB16D] bg-[#EDFFFA]"
                : "border-[#d9d8d6]"
            }
          `}
        >
          <LikeIcon
            className="h-4 w-4"
            stroke={item.liked ? "#0CB16D" : "#303132"}
          />
        </button>

        {/* Add to timeline */}
        <button
          onClick={() => onAdd?.(item.id)}
          className="
            h-8 w-8
            flex items-center justify-center
            rounded-md
            border border-[#d9d8d6]
          "
        >
          <AddIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MusicItemRow;
