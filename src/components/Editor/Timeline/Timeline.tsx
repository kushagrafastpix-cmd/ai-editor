import { useState } from "react";
import ChevronDownIcon from "../../Common/Icons/ChevronDownIcon";
import UndoIcon from "../../Common/Icons/UndoIcon";
import RedoIcon from "../../Common/Icons/RedoIcon";
import DeleteIcon from "../../Common/Icons/DeleteIcon";
import CutIcon from "../../Common/Icons/CutIcon";
import TrackControls from "./components/TrackControls";
import type { TrackRow } from "./types";

interface TimelineProps {
  onHide: () => void;
}

const Timeline = ({ onHide }: TimelineProps) => {
  // Dummy tracks data
  const [tracks, setTracks] = useState<TrackRow[]>([
    // Row 1: Dynamic non-audio tracks (example: B-roll)
    {
      id: 'track-broll-1',
      category: 'b-roll',
      visible: false,
      locked: false,
    },
    // Row 2: Main video track (always present)
    {
      id: 'track-main-video',
      category: 'main-video',
      visible: true,
      locked: false,
      isMainVideo: true,
    },
    // Row 3: Default audio track (always present)
    {
      id: 'track-default-audio',
      category: 'audio',
      visible: true,
      locked: false,
      isDefaultAudio: true,
    },
  ]);

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log("Undo");
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log("Redo");
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete");
  };

  const handleCut = () => {
    // TODO: Implement cut functionality
    console.log("Cut");
  };

  const handleToggleVisibility = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, visible: !track.visible } : track
      )
    );
  };

  const handleToggleLock = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, locked: !track.locked } : track
      )
    );
  };

  const handleAddVideo = () => {
    // TODO: Implement add video/clip functionality
    console.log("Add video/clip");
  };

  return (
    <div className="h-full flex flex-col p-4 pt-1 bg-[#f3f4f6]">
      <div className="flex items-center justify-between pb-1">
        {/* Left: Toolbar buttons */}
        <div className="flex items-center gap-3 ">
          <button
            onClick={handleUndo}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label="Undo"
          >
            <UndoIcon className="h-3 w-3" />
          </button>

          <button
            onClick={handleRedo}
            className="flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label="Redo"
            disabled
          >
            <RedoIcon className="h-3 w-3" />
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label="Delete"
          >
            <DeleteIcon className="h-3 w-3" />
          </button>

          <button
            onClick={handleCut}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label="Cut"
          >
            <CutIcon className="h-3 w-3" />
          </button>
        </div>

        {/* Right: Hide timeline button */}
        <button
          onClick={onHide}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          <ChevronDownIcon className="h-3 w-3" />
          <span>Hide timeline</span>
        </button>
      </div>

      {/* full-width divider below header */}
      <div className="-mx-4">
        <div className="h-px bg-[#DADCE5]" />
      </div>

      {/* Timeline Content Area */}
      <div className="flex-1 min-h-0 flex mt-2 ">
        {/* Left: Track Controls */}
        <TrackControls
          tracks={tracks}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onAddVideo={handleAddVideo}
        />

        {/* Right: Timeline tracks area (placeholder for now) */}
        <div className="flex-1 ">
          {/* Timeline content will go here */}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
