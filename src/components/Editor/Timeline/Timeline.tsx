import { useState } from "react";
import TrackControls from "./components/TrackControls";
import TimelineTopBar from "./components/TimelineTopBar";
import type { TrackRow } from "./types";

interface TimelineProps {
  onHide: () => void;
}

const Timeline = ({ onHide }: TimelineProps) => {
  const [tracks, setTracks] = useState<TrackRow[]>([
    {
      id: "track-broll-1",
      category: "b-roll",
      visible: false,
      locked: false,
    },
    {
      id: "track-main-video",
      category: "main-video",
      visible: true,
      locked: false,
      isMainVideo: true,
    },
    {
      id: "track-default-audio",
      category: "audio",
      visible: true,
      locked: false,
      isDefaultAudio: true,
    },
  ]);

  const handleUndo = () => console.log("Undo");
  const handleRedo = () => console.log("Redo");
  const handleDelete = () => console.log("Delete");
  const handleCut = () => console.log("Cut");

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
    console.log("Add video/clip");
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f4f6]">
      {/* Top bar */}
      <TimelineTopBar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDelete}
        onCut={handleCut}
        onHide={onHide}
      />

      {/* Timeline body */}
      <div className="flex-1 min-h-0 flex">
        {/* Left rail */}
        <div className="h-full">
          <TrackControls
            tracks={tracks}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onAddVideo={handleAddVideo}
          />
        </div>

        {/* Right timeline area */}
        <div className="flex-1 overflow-hidden">
          {/* Time ruler will go here */}
          {/* Tracks will go here */}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
