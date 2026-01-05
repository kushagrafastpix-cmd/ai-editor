import { useState, useRef, useEffect } from "react";
import TrackControls from "./components/TrackControls";
import TimelineTopBar from "./components/TimelineTopBar";
import TimelineRuler from "./components/TimelineRuler";
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

  // Timeline ruler state
  const [duration] = useState(120); // Total duration in seconds (default: 2 minutes)
  const [pixelsPerSecond] = useState(40); // Zoom scale (default: 50px per second)
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const [rulerWidth, setRulerWidth] = useState(0);

  // Calculate ruler width based on container width
  useEffect(() => {
    const updateRulerWidth = () => {
      if (timelineAreaRef.current) {
        setRulerWidth(timelineAreaRef.current.offsetWidth);
      }
    };

    updateRulerWidth();
    window.addEventListener('resize', updateRulerWidth);
    return () => window.removeEventListener('resize', updateRulerWidth);
  }, []);

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
        <div ref={timelineAreaRef} className="flex-1 overflow-hidden flex flex-col">
          {/* Timeline Ruler */}
          {rulerWidth > 0 && (
            <TimelineRuler
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
              width={rulerWidth}
            />
          )}
          
          {/* Tracks area */}
          <div className="flex-1">
            {/* Tracks will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
