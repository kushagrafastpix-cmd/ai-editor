import { useEffect, useRef, useState } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import EditorToolPanel from "./components/EditorToolPanel/EditorToolPanel";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";
import { Timeline } from "@/features/timeline";
import ChevronUpIcon from "@/components/ui/icons/ChevronUpIcon";
import type { LoaderData, ActionData } from "@/routes/editor";
import type { TranscriptData } from "@/types/transcript";
import type { TimelineState } from "@/features/timeline/types";
import type { TextLayer } from "@/features/tools/Text/types";
import { useHistory } from "./hooks/useHistory";
import { createHistoryEntry } from "./utils/stateUtils";

const MIN_TIMELINE_HEIGHT = 120;
const DEFAULT_TIMELINE_HEIGHT = 220;
const MAX_TIMELINE_RATIO = 0.65; // 65% of editor height
const TOOL_TIMELINE_GAP = 38; // px

const MIN_TOOL_PANEL_WIDTH = 30; // 30% minimum
const MIN_VIDEO_PLAYER_WIDTH = 45; // 45% minimum
const DEFAULT_TOOL_PANEL_WIDTH = 40; // 40% default

export function EditorUI() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topAreaRef = useRef<HTMLDivElement | null>(null);
  const videoPlayerRef = useRef<{ pause: () => void } | null>(null);

  // Route hooks
  const loaderData = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData | undefined;
  const submit = useSubmit();

  // Hold local editor state (derived from route data)
  const [transcript, setTranscript] = useState<TranscriptData>(
    loaderData.transcript
  );
  const [timelineState, setTimelineState] = useState<TimelineState>(
    loaderData.timelineState
  );

  // Video playback state
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize history with initial state
  const history = useHistory(
    createHistoryEntry(loaderData.timelineState, loaderData.transcript)
  );

  // Debug: Log history state changes
  useEffect(() => {
    console.log('[EditorUI] History state changed - canUndo:', history.canUndo, 'canRedo:', history.canRedo);
  }, [history.canUndo, history.canRedo]);

  // Update local state when route data changes
  useEffect(() => {
    setTranscript(loaderData.transcript);
    setTimelineState(loaderData.timelineState);
    // Reset history when route data changes (new project loaded)
    history.reset(createHistoryEntry(loaderData.timelineState, loaderData.transcript));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  // Update timeline state when action returns new state
  useEffect(() => {
    if (actionData?.timelineState) {
      console.log('[EditorUI] Action returned new timeline state, pushing to history');
      // Push new state to history (this automatically moves current present to past)
      // This captures the "before" state and sets "after" state
      const newEntry = createHistoryEntry(actionData.timelineState, transcript);
      history.push(newEntry);
      console.log('[EditorUI] History pushed, canUndo:', history.canUndo, 'canRedo:', history.canRedo);

      // Update local state with new state from route action
      setTimelineState(actionData.timelineState);

      // If this was a remove-pauses action, update the minimum applied threshold
      if (actionData.success && actionData.message?.includes('removed') && actionData.message?.includes('pauses')) {
        const appliedThreshold = lastAppliedThresholdRef.current;
        if (appliedThreshold !== null) {
          // Update minimum applied threshold: if no threshold was set, use current one
          // Otherwise, use the minimum of current and new threshold
          setMinAppliedPauseThreshold(prev =>
            prev === null ? appliedThreshold : Math.min(prev, appliedThreshold)
          );
          lastAppliedThresholdRef.current = null; // Reset ref
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const [isAnimatingTimeline, setIsAnimatingTimeline] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(DEFAULT_TIMELINE_HEIGHT);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  // Panel resize state
  const [toolPanelWidth, setToolPanelWidth] = useState(DEFAULT_TOOL_PANEL_WIDTH);
  const [isResizingPanels, setIsResizingPanels] = useState(false);

  // Track the minimum threshold that has been applied for remove pauses
  // Once a threshold is applied, all thresholds >= that value should be disabled
  const [minAppliedPauseThreshold, setMinAppliedPauseThreshold] = useState<number | null>(null);
  const lastAppliedThresholdRef = useRef<number | null>(null);

  // Handle RemovePauses callback - submit intent to route action
  const handleRemovePauses = (threshold: number) => {
    // Store the threshold being applied
    lastAppliedThresholdRef.current = threshold;
    const formData = new FormData();
    formData.set("actionType", "remove-pauses");
    formData.set("threshold", threshold.toString());
    formData.set("currentState", JSON.stringify(timelineState));
    submit(formData, { method: "post" });
  };

  // Handle video pause from text tool
  const handlePauseVideo = () => {
    videoPlayerRef.current?.pause();
  };

  // Handle seek from timeline (playhead drag)
  const handleSeek = (time: number) => {
    // Pause video if playing
    videoPlayerRef.current?.pause();
    // Update currentTime immediately - this will trigger VideoPlayer to seek
    setCurrentTime(time);
  };

  // Handle adding text overlay
  const handleAddText = (textLayer: TextLayer) => {
    const formData = new FormData();
    formData.set("actionType", "add-text");
    formData.set("textLayer", JSON.stringify(textLayer));
    formData.set("currentState", JSON.stringify(timelineState));
    submit(formData, { method: "post" });
  };

  // Handle updating text overlay
  const handleUpdateText = (id: string, update: Partial<TextLayer>) => {
    const formData = new FormData();
    formData.set("actionType", "update-text");
    formData.set("textId", id);
    formData.set("update", JSON.stringify(update));
    formData.set("currentState", JSON.stringify(timelineState));
    submit(formData, { method: "post" });
  };

  // Video sources management
  const [videoSources, setVideoSources] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoTypeRef = useRef<'intro' | 'outro'>('intro');

  const handleAddVideo = () => {
    videoTypeRef.current = 'intro';
    fileInputRef.current?.click();
  };

  const handleAddOutro = () => {
    videoTypeRef.current = 'outro';
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a temporary video element to get duration
    const tempVideo = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration;
      const sourceVideoId = `local-video-${Date.now()}`;

      // Store the blob URL
      setVideoSources(prev => ({
        ...prev,
        [sourceVideoId]: objectUrl
      }));

      // Submit action
      const formData = new FormData();
      formData.set("actionType", "add-video");
      formData.set("videoType", videoTypeRef.current);
      formData.set("duration", duration.toString());
      formData.set("sourceVideoId", sourceVideoId);
      formData.set("currentState", JSON.stringify(timelineState));
      submit(formData, { method: "post" });

      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    tempVideo.src = objectUrl;
  };

  // Undo handler
  const handleUndo = () => {
    console.log('[EditorUI] Undo called, canUndo:', history.canUndo);
    const restoredState = history.undo();
    console.log('[EditorUI] Undo restored state:', restoredState);
    if (restoredState) {
      setTimelineState(restoredState.timelineState);
      setTranscript(restoredState.transcript);
      console.log('[EditorUI] State updated after undo');
    } else {
      console.log('[EditorUI] No state to restore');
    }
  };

  // Redo handler
  const handleRedo = () => {
    console.log('[EditorUI] Redo called, canRedo:', history.canRedo);
    const restoredState = history.redo();
    console.log('[EditorUI] Redo restored state:', restoredState);
    if (restoredState) {
      setTimelineState(restoredState.timelineState);
      setTranscript(restoredState.transcript);
      console.log('[EditorUI] State updated after redo');
    } else {
      console.log('[EditorUI] No state to restore');
    }
  };

  const animatedTimelineHeight = isTimelineVisible ? timelineHeight : 0;
  // Animate gap height smoothly - appears as timeline collapses
  const animatedGapHeight = isTimelineVisible ? 0 : TOOL_TIMELINE_GAP;

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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputField) {
        return; // Don't intercept keyboard shortcuts in input fields
      }

      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (history.canUndo) {
          handleUndo();
        }
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (history.canRedo) {
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [history.canUndo, history.canRedo]);

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
          <EditorToolPanel
            transcript={transcript}
            currentTime={currentTime}
            textLayers={timelineState.textLayers || []}
            onRemovePauses={handleRemovePauses}
            minAppliedPauseThreshold={minAppliedPauseThreshold}
            onPauseVideo={handlePauseVideo}
            onAddText={handleAddText}
            onUpdateText={handleUpdateText}
          />
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
          <VideoPlayer
            ref={videoPlayerRef}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            timelineState={timelineState}
            videoSourceMap={videoSources}
          />
        </div>
      </div>

      {/* GAP BETWEEN TOOL AREA AND TIMELINE (when hidden) */}
      {/* Animate gap height smoothly to prevent layout shift */}
      <div
        style={{
          height: animatedGapHeight,
          transition: isAnimatingTimeline
            ? "height 300ms ease-in-out"
            : "none",
        }}
      />

      {/* RESIZE HANDLE */}
      <div
        onMouseDown={isTimelineVisible ? startResize : undefined}
        className={`h-0.5 transition-opacity duration-200 ${isTimelineVisible
          ? "cursor-row-resize bg-[#DADCE5]"
          : "opacity-0 pointer-events-none"
          }`}
      />

      {/* TIMELINE */}
      <div
        style={{ height: animatedTimelineHeight }}
        onTransitionEnd={handleTimelineTransitionEnd}
        className={`overflow-hidden bg-white ${isAnimatingTimeline
          ? "transition-[height] duration-300 ease-in-out"
          : ""
          }`}
      >
        <Timeline
          timelineState={timelineState}
          currentTime={currentTime}
          onSeek={handleSeek}
          onHide={() => {
            setIsAnimatingTimeline(true);
            setIsTimelineVisible(false);
          }}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onAddVideo={handleAddVideo}
          onAddOutro={handleAddOutro}
          transcript={transcript}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="video/*"
          className="hidden"
          style={{ display: 'none' }}
        />
      </div>

      {/* SHOW TIMELINE */}
      {!isTimelineVisible && (
        <div className="absolute left-0 right-0 bottom-0 flex h-10 items-center justify-end bg-[#f3f4f6] border-t-2 border-[#DADCE5]  px-4">
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
}

