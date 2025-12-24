import { useEffect, useRef, useState } from "react";
import Transcript from "../Transcript/Transcript";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import Timeline from "../Timeline/Timeline";
import ChevronUpIcon from "../../Common/Icons/ChevronUpIcon";

const MIN_TIMELINE_HEIGHT = 120;
const DEFAULT_TIMELINE_HEIGHT = 220;
const MAX_TIMELINE_RATIO = 0.5; // 50% of editor height

const EditorLayout = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAnimatingTimeline, setIsAnimatingTimeline] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(
    DEFAULT_TIMELINE_HEIGHT
  );
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const animatedTimelineHeight = isTimelineVisible
    ? timelineHeight
    : 0;


  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimatingTimeline(false); // IMPORTANT
    setIsResizing(true);
  };


  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (!isResizing || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const maxTimelineHeight =
      containerRect.height * MAX_TIMELINE_RATIO;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight =
        containerRect.bottom - e.clientY;

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

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-gray-100"
    >
      {/* TOP AREA */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[40%] border-r bg-white">
          <Transcript />
        </div>

        <div className="w-[60%] bg-black">
          <VideoPlayer />
        </div>
      </div>

      {/* RESIZE HANDLE */}
      <div
        onMouseDown={isTimelineVisible ? startResize : undefined}
        className={`h-1 transition-opacity duration-200 ${isTimelineVisible
            ? "cursor-row-resize bg-gray-300 hover:bg-gray-400 opacity-100"
            : "opacity-0 pointer-events-none"
          }`}
      />


      {/* TIMELINE */}
      <div
        style={{ height: animatedTimelineHeight }}
        className={`overflow-hidden border-t bg-white ${isAnimatingTimeline
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
        <div className="flex h-10 items-center justify-end border-t bg-white px-4">
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
