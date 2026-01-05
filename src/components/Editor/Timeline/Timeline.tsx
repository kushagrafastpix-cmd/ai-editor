import { useState, useRef, useEffect } from "react";
import TrackControls from "./components/TrackControls";
import TimelineTopBar from "./components/TimelineTopBar";
import TimelineRuler from "./components/TimelineRuler";
import TimelineTracks from "./components/TimelineTracks";
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
      id: "track-broll-2",
      category: "b-roll",
      visible: false,
      locked: false,
    },
        {
      id: "track-broll-3",
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
    {
      id: "track-broll-4",
      category: "audio",
      visible: false,
      locked: false,
    },

  ]);

  // Timeline ruler state
  const [duration] = useState(120); // Total duration in seconds (default: 2 minutes)
  const [pixelsPerSecond] = useState(35); // Zoom scale (default: 50px per second)
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const [rulerWidth, setRulerWidth] = useState(0);
  
  // Horizontal scroll synchronization
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Vertical scroll synchronization
  const trackControlsScrollRef = useRef<HTMLDivElement>(null);
  const timelineTracksScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  
  const handleHorizontalScroll = (newScrollLeft: number) => {
    setScrollLeft(newScrollLeft);
  };
  
  const handleVerticalScroll = (scrollTop: number, source: 'controls' | 'tracks') => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    
    if (source === 'controls' && timelineTracksScrollRef.current) {
      timelineTracksScrollRef.current.scrollTop = scrollTop;
    } else if (source === 'tracks' && trackControlsScrollRef.current) {
      trackControlsScrollRef.current.scrollTop = scrollTop;
    }
    
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  };

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

  const handleCrop = () => {
    console.log("Crop");
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f4f6]">
      {/* Top bar */}
      <TimelineTopBar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={handleDelete}
        onCut={handleCut}
        onCrop={handleCrop}
        onHide={onHide}
      />

      {/* Timeline body */}
      <div className="flex-1 min-h-0 flex">
        {/* Left rail - Track Controls (fixed, scrolls vertically with tracks) */}
        <div className="flex-shrink-0 border-r border-[#DADCE5]" style={{ width: "115px" }}>
          {/* Empty space matching ruler height */}
          <div style={{ height: "40px" }}></div>
          
          {/* Scrollable TrackControls */}
          <div 
            ref={trackControlsScrollRef}
            className="overflow-y-auto scrollbar-hide" 
            style={{ height: "calc(100% - 40px)" }}
            onScroll={(e) => handleVerticalScroll(e.currentTarget.scrollTop, 'controls')}
          >
            <div>
              <TrackControls
                tracks={tracks}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onAddVideo={handleAddVideo}
              />
            </div>
          </div>
        </div>

        {/* Right timeline area */}
        <div ref={timelineAreaRef} className="flex-1 min-h-0 flex flex-col">
          {/* Timeline Ruler - Fixed at top */}
          {rulerWidth > 0 && (
            <TimelineRuler
              duration={duration}
              pixelsPerSecond={pixelsPerSecond}
              width={rulerWidth}
              scrollLeft={scrollLeft}
              onScroll={handleHorizontalScroll}
            />
          )}
          
          {/* Scrollable TimelineTracks */}
          <div 
            ref={timelineTracksScrollRef}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
            onScroll={(e) => handleVerticalScroll(e.currentTarget.scrollTop, 'tracks')}
          >
            {rulerWidth > 0 && (
              <div>
                <TimelineTracks
                  tracks={tracks}
                  duration={duration}
                  pixelsPerSecond={pixelsPerSecond}
                  width={rulerWidth}
                  scrollLeft={scrollLeft}
                  onScroll={handleHorizontalScroll}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
