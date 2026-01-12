import { useState, useRef, useEffect } from "react";
import TrackControls from "./components/TrackControls";
import TimelineTopBar from "./components/TimelineTopBar";
import TimelineRuler from "./components/TimelineRuler";
import TimelineTracks from "./components/TimelineTracks";
import type { TimelineState } from "./types";

export interface TimelineProps {
  timelineState: TimelineState;
  currentTime: number;
  onHide: () => void;
  onClipMove?: (clipId: string, newStartTime: number) => void;
  onClipTrim?: (clipId: string, newSourceEnd: number) => void;
}

const Timeline = ({
  timelineState,
  currentTime,
  onHide,
  onClipMove,
  onClipTrim,
}: TimelineProps) => {
  const tracks = timelineState.tracks;
  const actualDuration = timelineState.duration;
  // Minimum 2 minutes (120 seconds) for ruler display, regardless of video length
  const displayDuration = Math.max(actualDuration, 120);
  const [pixelsPerSecond] = useState(20); // Zoom scale (default: 20px per second)
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const timelineTracksContainerRef = useRef<HTMLDivElement>(null);
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
    // Emit event intention - in future, this will submit to route action
    console.log("Toggle visibility", trackId);
  };

  const handleToggleLock = (trackId: string) => {
    // Emit event intention - in future, this will submit to route action
    console.log("Toggle lock", trackId);
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
        <div ref={timelineAreaRef} className="flex-1 min-h-0 flex flex-col relative" style={{ overflow: 'hidden' }}>
          {/* Playhead overlay - spans both ruler and tracks */}
          {rulerWidth > 0 && currentTime !== undefined && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: '20px', // Start at middle of 40px ruler
                left: `${Math.max(-4, (currentTime * pixelsPerSecond) - scrollLeft)}px`, // Clip at left edge
                transform: 'translateX(-1px)', // Center the 2px bar
                bottom: '0px', // Extend to bottom
                zIndex: 100,
              }}
            >
              {/* Vertical bar */}
              <div
                style={{
                  width: '2px',
                  height: '100%',
                  backgroundColor: '#E20E0E',
                }}
              />
              
              {/* Pentagon at the top (middle of ruler) */}
              <svg
                width="9"
                height="8"
                viewBox="0 0 9 8"
                style={{
                  position: 'absolute',
                  top: '0px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <polygon
                  points="4.5,8 2,6 1,3 4.5,0 8,3 7,6"
                  fill="#E20E0E"
                />
              </svg>
            </div>
          )}
          
          {/* Timeline Ruler - Fixed at top */}
          {rulerWidth > 0 && (
            <div className="relative" style={{ zIndex: 1 }}>
              <TimelineRuler
                duration={displayDuration}
                pixelsPerSecond={pixelsPerSecond}
                width={rulerWidth}
                scrollLeft={scrollLeft}
                onScroll={handleHorizontalScroll}
              />
            </div>
          )}
          
          {/* Scrollable TimelineTracks */}
          <div 
            ref={timelineTracksContainerRef}
            className="flex-1 min-h-0 flex flex-col relative"
          >
            <div 
              ref={timelineTracksScrollRef}
              className="flex-1 min-h-0 scrollbar-hide relative"
              style={{ 
                overflowX: 'hidden',
                overflowY: 'auto',
              }}
              onScroll={(e) => handleVerticalScroll(e.currentTarget.scrollTop, 'tracks')}
            >
              {rulerWidth > 0 && (
                <div className="relative">
                  <TimelineTracks
                    tracks={tracks}
                    clips={timelineState.clips}
                    duration={displayDuration}
                    pixelsPerSecond={pixelsPerSecond}
                    width={rulerWidth}
                    scrollLeft={scrollLeft}
                    onScroll={handleHorizontalScroll}
                    onClipMove={onClipMove}
                    onClipTrim={onClipTrim}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
