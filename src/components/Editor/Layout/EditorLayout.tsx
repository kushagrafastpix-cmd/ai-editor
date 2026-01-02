import { useEffect, useRef, useState } from "react";
import EditorToolPanel from "../EditorToolPanel/EditorToolPanel";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import Timeline from "../Timeline/Timeline";
import ChevronUpIcon from "../../Common/Icons/ChevronUpIcon";

const MIN_TIMELINE_HEIGHT = 120;
const DEFAULT_TIMELINE_HEIGHT = 220;
const MAX_TIMELINE_RATIO = 0.5; // 50% of editor height
const TOOL_TIMELINE_GAP = 38; // px

const MIN_TOOL_PANEL_WIDTH = 30; // 30% minimum
const MIN_VIDEO_PLAYER_WIDTH = 45; // 45% minimum
const DEFAULT_TOOL_PANEL_WIDTH = 40; // 40% default

const EditorLayout = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topAreaRef = useRef<HTMLDivElement | null>(null);

  const [isAnimatingTimeline, setIsAnimatingTimeline] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(DEFAULT_TIMELINE_HEIGHT);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  // Panel resize state
  const [toolPanelWidth, setToolPanelWidth] = useState(DEFAULT_TOOL_PANEL_WIDTH);
  const [isResizingPanels, setIsResizingPanels] = useState(false);

  const animatedTimelineHeight = isTimelineVisible ? timelineHeight : 0;

  const handleTimelineTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (e.propertyName === "height") {
      setIsAnimatingTimeline(false);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimatingTimeline(false);
    setIsResizing(true);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (!isResizing || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const maxTimelineHeight = containerRect.height * MAX_TIMELINE_RATIO;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = containerRect.bottom - e.clientY;

      const clampedHeight = Math.min(
        Math.max(newHeight, MIN_TIMELINE_HEIGHT),
        maxTimelineHeight
      );

      setTimelineHeight(clampedHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  // Panel resize handlers
  const startPanelResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPanels(true);
  };

  const stopPanelResize = () => {
    setIsResizingPanels(false);
  };

  useEffect(() => {
    if (!isResizingPanels || !topAreaRef.current) return;

    const topArea = topAreaRef.current;
    const topAreaRect = topArea.getBoundingClientRect();
    const totalWidth = topAreaRect.width;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - topAreaRect.left;
      const newToolPanelWidthPercent = (mouseX / totalWidth) * 100;

      // Enforce minimum widths
      const clampedToolWidth = Math.max(
        Math.min(newToolPanelWidthPercent, 100 - MIN_VIDEO_PLAYER_WIDTH),
        MIN_TOOL_PANEL_WIDTH
      );

      setToolPanelWidth(clampedToolWidth);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopPanelResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopPanelResize);
    };
  }, [isResizingPanels]);

  const videoPlayerWidth = 100 - toolPanelWidth;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col bg-gray-100"
    >
      {/* TOP AREA */}
      <div ref={topAreaRef} className="flex flex-1 overflow-hidden relative">
        {/* Tool Panel */}
        <div 
          className="flex-shrink-0 bg-white"
          style={{ 
            width: `${toolPanelWidth}%`, 
            flexBasis: `${toolPanelWidth}%`,
            minWidth: `${MIN_TOOL_PANEL_WIDTH}%`
          }}
        >
          <EditorToolPanel />
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startPanelResize}
          className="
            flex-shrink-0
            cursor-col-resize
            transition-colors
            hover:bg-[#C8CAD3]
            select-none
          "
          style={{
            width: '2px',
            backgroundColor: '#DADCE5',
          }} 
        />

        {/* Video Player */}
        <div 
          className="flex-shrink-0 pt-4 pr-4 pb-4 pl-4"
          style={{ 
            width: `${videoPlayerWidth}%`, 
            flexBasis: `${videoPlayerWidth}%`,
            minWidth: `${MIN_VIDEO_PLAYER_WIDTH}%`
          }}
        >
          <VideoPlayer />
        </div>
      </div>

      {/* GAP BETWEEN TOOL AREA AND TIMELINE (when hidden) */}
      {!isTimelineVisible && <div style={{ height: TOOL_TIMELINE_GAP }} />}

      {/* RESIZE HANDLE */}
      <div
        onMouseDown={isTimelineVisible ? startResize : undefined}
        className={`h-0.5 transition-opacity duration-200 ${
          isTimelineVisible
            ? "cursor-row-resize bg-[#DADCE5]"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* TIMELINE */}
      <div
        style={{ height: animatedTimelineHeight }}
        onTransitionEnd={handleTimelineTransitionEnd}
        className={`overflow-hidden bg-white ${
          isAnimatingTimeline
            ? "transition-[height] duration-300 ease-in-out"
            : ""
        }`}
      >
        <Timeline
          onHide={() => {
            setIsAnimatingTimeline(true);
            setIsTimelineVisible(false);
          }}
        />
      </div>

      {/* SHOW TIMELINE */}
      {!isTimelineVisible && (
        <div className="absolute left-0 right-0 bottom-0 flex h-10 items-center justify-end bg-white px-4">
          <button
            onClick={() => {
              setIsAnimatingTimeline(true);
              setIsTimelineVisible(true);
            }}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          >
            <ChevronUpIcon className="h-3 w-3" />
            <span>Show timeline</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorLayout;
