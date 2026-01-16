import { useState, useRef, useEffect } from "react";
import TrackControls from "./components/TrackControls";
import TimelineTopBar from "./components/TimelineTopBar";
import TimelineRuler from "./components/TimelineRuler";
import TimelineTracks from "./components/TimelineTracks";
import type { TimelineState } from "./types";
import type { TranscriptData } from "@/types/transcript";

export interface TimelineProps {
  timelineState: TimelineState;
  currentTime: number;
  onHide: () => void;
  onSeek?: (time: number) => void;
  onClipMove?: (clipId: string, newStartTime: number) => void;
  onClipTrim?: (clipId: string, newSourceEnd: number) => void;
  onAddVideo?: () => void;
  onAddOutro?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  transcript?: TranscriptData;
}

const Timeline = ({
  timelineState,
  currentTime,
  onHide,
  onSeek,
  onClipMove,
  onClipTrim,
  onAddVideo,
  onAddOutro,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  transcript,
}: TimelineProps) => {
  const tracks = timelineState.tracks;
  const actualDuration = timelineState.duration;
  
  // Calculate minimum duration to accommodate outro button if present
  let minDurationForOutroButton = actualDuration;
  if (transcript) {
    const mainVideoClips = timelineState.clips.filter(c => c.sourceVideoId === transcript.videoId);
    const outroClips = timelineState.clips.filter(c => 
      c.sourceVideoId !== transcript.videoId && 
      mainVideoClips.length > 0 &&
      c.startTime >= Math.max(...mainVideoClips.map(mc => mc.startTime + mc.duration))
    );
    
    if (outroClips.length > 0) {
      const lastOutroEnd = Math.max(...outroClips.map(c => c.startTime + c.duration));
      minDurationForOutroButton = lastOutroEnd + 2.4; // Add space for button (48px / 20px per second)
    } else if (mainVideoClips.length > 0) {
      const mainVideoEnd = Math.max(...mainVideoClips.map(c => c.startTime + c.duration));
      minDurationForOutroButton = mainVideoEnd + 2.4; // Add space for button
    }
  }
  
  // Minimum 2 minutes (120 seconds) for ruler display, regardless of video length
  const displayDuration = Math.max(actualDuration, 120, minDurationForOutroButton);
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

  // Drag state for playhead
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number | null>(null);

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

  const handleUndo = () => {
    onUndo?.();
  };

  const handleRedo = () => {
    onRedo?.();
  };

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



  const handleCrop = () => {
    console.log("Crop");
  };

  // Calculate time from mouse X position
  const calculateTimeFromMouseX = (mouseX: number): number => {
    if (!timelineAreaRef.current) return currentTime;

    const rect = timelineAreaRef.current.getBoundingClientRect();
    const relativeX = mouseX - rect.left;
    const newTime = (relativeX + scrollLeft) / pixelsPerSecond;

    // Clamp to valid range
    return Math.max(0, Math.min(newTime, actualDuration));
  };

  // Handle mouse down on timeline area
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    // Don't interfere with scrolling - check if clicking on scrollable area
    // If the target is within a scrollable container, let it handle scrolling
    const scrollableParent = target.closest('[style*="overflow"]');
    if (scrollableParent && scrollableParent !== timelineAreaRef.current) {
      // Allow scrolling, but still track for potential drag
      dragStartXRef.current = e.clientX;
      dragStartTimeRef.current = currentTime;
      return;
    }

    // Store initial drag position
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = currentTime;

    // Don't prevent default here - let scrolling work normally
    // We'll only prevent default when actually dragging
  };

  // Handle mouse move and mouse up globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // If we have a drag start position, check if we should start dragging
      if (dragStartXRef.current !== null && !isDraggingRef.current) {
        const deltaX = Math.abs(e.clientX - dragStartXRef.current);
        // Start dragging if mouse moved more than 3 pixels (prevents accidental drags)
        if (deltaX > 3) {
          setIsDragging(true);
          isDraggingRef.current = true;
          // Prevent text selection and default behaviors when dragging starts
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';
        }
      }

      // If dragging, update time
      if (isDraggingRef.current && timelineAreaRef.current) {
        const newTime = calculateTimeFromMouseX(e.clientX);
        onSeek?.(newTime);
        // Prevent default during drag to avoid text selection
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      // If we were dragging, seek to final position
      if (isDraggingRef.current && dragStartXRef.current !== null) {
        // Final position already set by last mousemove
      }

      // Reset drag state and restore styles
      setIsDragging(false);
      isDraggingRef.current = false;
      dragStartXRef.current = null;
      dragStartTimeRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Cleanup styles in case component unmounts during drag
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, onSeek, scrollLeft, pixelsPerSecond, actualDuration, currentTime]);

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
        canUndo={canUndo}
        canRedo={canRedo}
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

                onAddVideo={onAddVideo}
              />
            </div>
          </div>
        </div>

        {/* Right timeline area */}
        <div
          ref={timelineAreaRef}
          className="flex-1 min-h-0 flex flex-col relative"
          style={{
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleTimelineMouseDown}
          onMouseLeave={() => {
            // Reset drag start if mouse leaves without dragging
            if (!isDraggingRef.current) {
              dragStartXRef.current = null;
              dragStartTimeRef.current = null;
            }
          }}
        >
          {/* Playhead overlay - spans both ruler and tracks */}
          {rulerWidth > 0 && currentTime !== undefined && (
            <div
              className="absolute"
              style={{
                top: '20px', // Start at middle of 40px ruler
                left: `${Math.max(-4, (currentTime * pixelsPerSecond) - scrollLeft)}px`, // Clip at left edge
                transform: 'translateX(-1px)', // Center the 2px bar
                bottom: '0px', // Extend to bottom
                zIndex: 100,
                pointerEvents: 'none', // Playhead itself doesn't capture mouse events
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
            <div
              className="relative"
              style={{
                zIndex: 1,
                pointerEvents: isDragging ? 'none' : 'auto',
              }}
            >
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
                pointerEvents: isDragging ? 'none' : 'auto',
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
                    textLayers={timelineState.textLayers}
                    transitions={timelineState.transitions}
                    transcript={transcript}
                    onAddOutro={onAddOutro}
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
