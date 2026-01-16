import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import AspectRatioDropdown, { type AspectRatio } from "./components/AspectRatioDropdown";
import LayoutDropdown, { type Layout } from "./components/LayoutDropdown";
import PlayControls from "./components/PlayControls";
import TimecodeDisplay from "./components/TimecodeDisplay";
import { useCanvasRenderer } from "./hooks/useCanvasRenderer";
import type { TimelineState } from "@/features/timeline/types";
import { timelineToSourceTime, sourceToTimelineTime, getTimelineDuration } from "@/features/timeline/utils/timeMapping";

export interface VideoPlayerRef {
  pause: () => void;
}




interface PreviewPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  aspectRatio?: string;
  timelineState?: TimelineState;
  videoSourceMap?: Record<string, string>;
}

const PreviewPlayer = ({
  src,
  currentTime,
  onTimeUpdate,
  isPlaying,
  videoRef,
  aspectRatio,
  timelineState,
  videoSourceMap = {},
}: PreviewPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get video clips only (not audio) for time mapping
  const videoClips = timelineState ? timelineState.clips.filter(clip => {
    const track = timelineState.tracks.find(t => t.id === clip.trackId);
    return track?.category === 'main-video';
  }) : [];

  // Convert timeline time to source time for seeking (not during playback)
  const sourceTime = videoClips.length > 0
    ? timelineToSourceTime(currentTime, videoClips) ?? currentTime
    : currentTime;

  // Initialize canvas renderer - it will render whatever the video element is showing
  useCanvasRenderer({
    videoRef,
    canvasRef,
    isPlaying,
    currentTime: sourceTime,
    timelineTime: currentTime, // Pass timeline time for text layer filtering
    aspectRatio,
    textLayers: timelineState?.textLayers || [],
    transitions: timelineState?.transitions || [],
  });

  // Sync currentTime prop with video element when seeking (not during playback)
  // During playback, VideoPlayer RAF loop handles jumping between clips
  useEffect(() => {
    if (!isPlaying && videoRef.current && Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
      console.log(`[PreviewPlayer] Seeking to source time ${sourceTime.toFixed(3)}s (timeline ${currentTime.toFixed(3)}s)`);
      videoRef.current.currentTime = sourceTime;
    }
  }, [sourceTime, videoRef, isPlaying]);

  // Determine the active video source based on current timeline time
  const activeSrc = (() => {
    if (timelineState) {
      const mainVideoClips = timelineState.clips.filter(c => {
        const track = timelineState.tracks.find(t => t.id === c.trackId);
        return track?.category === 'main-video';
      });

      // Find clip at current time
      const currentClip = mainVideoClips.find(c =>
        currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );

      if (currentClip) {
        if (videoSourceMap[currentClip.sourceVideoId]) {
          return videoSourceMap[currentClip.sourceVideoId];
        } else if (currentClip.sourceVideoId === 'dummy-video-1') {
          return '/videos/testing-video.mp4';
        }
      }
    }
    return src || '/videos/testing-video.mp4';
  })();

  // Resume playback if source changes while playing
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Abort error is expected when swapping sources quickly
        });
      }
    }
  }, [activeSrc, isPlaying]);

  return (
    <>
      {/* Hidden video element - source for canvas */}
      <video
        ref={videoRef}
        src={activeSrc}
        muted={false}
        onTimeUpdate={(e) =>
          onTimeUpdate((e.target as HTMLVideoElement).currentTime)
        }
        style={{ display: "none" }}
      />
      {/* Visible canvas - displays rendered output */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "black",
        }}
      />
    </>
  );
};

interface VideoPlayerProps {
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  timelineState?: TimelineState;
  videoSourceMap?: Record<string, string>;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  currentTime: externalCurrentTime,
  onTimeUpdate,
  timelineState,
  videoSourceMap
}, ref) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [layout, setLayout] = useState<Layout>("fit");
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Expose pause method via ref
  useImperativeHandle(ref, () => ({
    pause: () => {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }), [isPlaying]);

  // Log when timelineState changes
  useEffect(() => {
    if (timelineState) {
      console.log('[VideoPlayer] Timeline state updated:', {
        clipCount: timelineState.clips.length,
        duration: timelineState.duration,
        clips: timelineState.clips
      });
    }
  }, [timelineState]);

  // Ref to track current timeline time for RAF loop
  const internalCurrentTimeRef = useRef(internalCurrentTime);
  useEffect(() => {
    internalCurrentTimeRef.current = internalCurrentTime;
  }, [internalCurrentTime]);

  // Use external currentTime if provided, otherwise use internal state
  const currentTime = externalCurrentTime ?? internalCurrentTime;

  // Helper to find the timeline time that matches the source time
  // closest to our current expected position. This resolves ambiguity
  // when multiple clips share the same source timestamps (e.g. Intro and Main both start at 0).
  const mapSourceToTimelineClosest = (sourceTime: number, clips: readonly import("@/features/timeline/types").VideoClip[], currentTimelineTime: number) => {
    // Find all possible timeline times for this source time
    const candidates = clips.map(clip => {
      // Relaxed check: include start/end boundaries to catch edge cases
      if (sourceTime >= clip.sourceStartTime - 0.05 && sourceTime <= clip.sourceEndTime + 0.05) {
        // Clamp source time to clip bounds for calculation
        const effectiveSourceTime = Math.max(clip.sourceStartTime, Math.min(sourceTime, clip.sourceEndTime));
        const offset = effectiveSourceTime - clip.sourceStartTime;
        return clip.startTime + offset;
      }
      return null;
    }).filter((t): t is number => t !== null);

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Find the candidate closest to our current state
    return candidates.reduce((prev, curr) =>
      Math.abs(curr - currentTimelineTime) < Math.abs(prev - currentTimelineTime) ? curr : prev
    );
  };

  const handleTimeUpdate = (time: number) => {
    // time is source video time
    // Without timeline state, just use source time directly
    if (!timelineState) {
      setInternalCurrentTime(time);
      onTimeUpdate?.(time);
      return;
    }

    // Get video clips only for time mapping
    const videoClips = timelineState.clips.filter(clip => {
      const track = timelineState.tracks.find(t => t.id === clip.trackId);
      return track?.category === 'main-video';
    });

    // Resolve timeline time based on proximity to current state
    let timelineTime = mapSourceToTimelineClosest(time, videoClips, internalCurrentTimeRef.current);

    // If no strict match (e.g. in a gap/removed pause), try standard mapping which handles gaps
    if (timelineTime === null) {
      timelineTime = sourceToTimelineTime(time, videoClips);
    }

    // Fallback to source time if everything fails
    timelineTime = timelineTime ?? time;

    // Only update if significantly different to avoid micro-jitters
    if (Math.abs(timelineTime - internalCurrentTimeRef.current) > 0.01) {
      setInternalCurrentTime(timelineTime);
      onTimeUpdate?.(timelineTime);
    }
  };

  // Monitor video playback and handle timeline state
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;

    const video = videoRef.current;
    let rafId: number;

    // If no timeline state, just update time normally
    if (!timelineState || timelineState.clips.length === 0) {
      const updateTime = () => {
        if (video) {
          const currentTime = video.currentTime;
          setInternalCurrentTime(currentTime);
          onTimeUpdate?.(currentTime);
        }
        rafId = requestAnimationFrame(updateTime);
      };

      rafId = requestAnimationFrame(updateTime);
      return () => cancelAnimationFrame(rafId);
    }

    // With timeline state, monitor and jump over pause segments
    // Only use clips from the main video track (not audio tracks)
    const clips = timelineState.clips;
    const videoClips = clips.filter(clip => {
      // Find the track for this clip
      const track = timelineState.tracks.find(t => t.id === clip.trackId);
      return track?.category === 'main-video';
    });
    // Sort clips strictly by timeline time (startTime)
    const sortedClips = [...videoClips].sort((a, b) => a.startTime - b.startTime);

    console.log('[VideoPlayer] Video clips for playback:', sortedClips.map(c => ({
      id: c.id,
      trackId: c.trackId,
      source: `${c.sourceStartTime}-${c.sourceEndTime}`,
      timeline: `${c.startTime}-${c.startTime + c.duration}`,
      sourceId: c.sourceVideoId
    })));

    const updateTime = () => {
      if (!video) return;

      const sourceTime = video.currentTime;
      const currentTimelineTime = internalCurrentTimeRef.current; // Use ref for latest state

      // 1. Determine which clip we are supposedly inside based on TIMELINE time
      // This is our source of truth for "where we should be"
      const currentClipIndex = sortedClips.findIndex(
        clip => currentTimelineTime >= clip.startTime && currentTimelineTime < clip.startTime + clip.duration
      );

      if (currentClipIndex === -1) {
        // We are in a gap or at the end
        // Check if we haven't reached the end of the timeline
        const timelineDuration = getTimelineDuration(sortedClips);
        if (currentTimelineTime >= timelineDuration) {
          console.log(`[VideoPlayer] Reached end of timeline (${currentTimelineTime.toFixed(3)}s), stopping playback`);
          video.pause();
          setIsPlaying(false);
          return;
        }

        // Must be a gap - jump to next clip
        const nextClip = sortedClips.find(clip => clip.startTime > currentTimelineTime);
        if (nextClip) {
          console.log(`[VideoPlayer] In pause/gap at ${currentTimelineTime.toFixed(3)}s, jumping to next clip at ${nextClip.startTime.toFixed(3)}s`);
          // We update timeline time, which triggers PreviewPlayer to load the correct src and seek
          setInternalCurrentTime(nextClip.startTime);
          onTimeUpdate?.(nextClip.startTime);
          // We don't set video.currentTime here because the src might need to change
          // PreviewPlayer will handle the seek after render
        }
      } else {
        const currentClip = sortedClips[currentClipIndex];

        // Check if we need to transition to next clip
        // Check if we need to transition to next clip

        // If current source time (video.currentTime) is past the clip's source end, we need to switch
        // Note: we can't trust video.currentTime alone if src just changed, but assuming steady state:

        // More robust: Just check if we exist within the timeline time of the clip
        const endOfClip = currentClip.startTime + currentClip.duration;
        const timeLeftInClip = endOfClip - currentTimelineTime;

        if (timeLeftInClip <= 0.05) { // 50ms buffer
          const nextClip = sortedClips[currentClipIndex + 1];
          if (nextClip) {
            console.log(`[VideoPlayer] Near end of clip ${currentClip.id}, jumping to next clip ${nextClip.id} at ${nextClip.startTime}`);
            // Optimistically update internal time to next clip start
            setInternalCurrentTime(nextClip.startTime);
            onTimeUpdate?.(nextClip.startTime);

            // Force seek to next clip source
            video.currentTime = nextClip.sourceStartTime;
          } else {
            console.log(`[VideoPlayer] Reached end of last clip`);
            video.pause();
            setIsPlaying(false);
            return;
          }
        } else if (sourceTime < currentClip.sourceStartTime - 0.25) {
          // Detect if we are physically in a gap/pause BEFORE this clip
          // (e.g. source is 10.1s, but clip starts at 12s)
          // Threshold is 0.25s to allow minor seeking drift but catch large gaps
          console.log(`[VideoPlayer] Source ${sourceTime.toFixed(3)}s lagging behind clip start ${currentClip.sourceStartTime}, seeking`);
          video.currentTime = currentClip.sourceStartTime;
        } else {
          // Normal playback: update timeline time based on video progress

          // We need to map sourceTime -> timelineTime
          // BUT, we only care about the CURRENT CLIP'S context
          const relevantClips = [currentClip]; // We know we are in this clip
          const timelineTime = sourceToTimelineTime(sourceTime, relevantClips) ?? (currentClip.startTime + (sourceTime - currentClip.sourceStartTime));

          // Only update if time advanced meaningfully (avoid jitter/loops)
          if (timelineTime > currentTimelineTime || Math.abs(timelineTime - currentTimelineTime) > 0.5) {
            setInternalCurrentTime(timelineTime);
            onTimeUpdate?.(timelineTime);
          }
        }
      }

      rafId = requestAnimationFrame(updateTime);
    };

    rafId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, onTimeUpdate, timelineState]);

  const handlePrevious = () => {
    if (!videoRef.current) return;

    // Pause if playing
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    // Go to start of timeline (0)
    const timelineTime = 0;
    let sourceTime = 0;

    if (timelineState) {
      const videoClips = timelineState.clips.filter(clip => {
        const track = timelineState.tracks.find(t => t.id === clip.trackId);
        return track?.category === 'main-video';
      });
      sourceTime = timelineToSourceTime(timelineTime, videoClips) ?? 0;
    }

    videoRef.current.currentTime = sourceTime;
    setInternalCurrentTime(timelineTime);
    onTimeUpdate?.(timelineTime);
  };

  const handlePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Before playing, ensure video is at correct source position for timeline time
      if (timelineState) {
        const videoClips = timelineState.clips.filter(clip => {
          const track = timelineState.tracks.find(t => t.id === clip.trackId);
          return track?.category === 'main-video';
        });
        const sourceTime = timelineToSourceTime(currentTime, videoClips);
        if (sourceTime !== null && Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
          console.log(`[VideoPlayer] Starting playback: positioning to source ${sourceTime.toFixed(3)}s for timeline ${currentTime.toFixed(3)}s`);
          videoRef.current.currentTime = sourceTime;
        }
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!videoRef.current) return;

    // Get video clips for time mapping
    let videoClips = timelineState ? timelineState.clips.filter(clip => {
      const track = timelineState.tracks.find(t => t.id === clip.trackId);
      return track?.category === 'main-video';
    }) : [];

    // Get timeline duration
    const timelineDuration = videoClips.length > 0
      ? getTimelineDuration(videoClips)
      : videoRef.current.duration;

    // Wait for video metadata to be loaded if duration not available
    if (!timelineState && isNaN(videoRef.current.duration)) {
      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          const duration = videoRef.current.duration;
          // Pause if playing
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          // Go to end of video
          videoRef.current.currentTime = duration;
          setInternalCurrentTime(duration);
          onTimeUpdate?.(duration);
          videoRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        }
      };
      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      return;
    }

    // Pause if playing
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    // Go to end of timeline
    let sourceTime = timelineDuration;

    if (timelineState) {
      const videoClips = timelineState.clips.filter(clip => {
        const track = timelineState.tracks.find(t => t.id === clip.trackId);
        return track?.category === 'main-video';
      });
      sourceTime = timelineToSourceTime(timelineDuration, videoClips) ?? videoRef.current.duration;
    }

    videoRef.current.currentTime = sourceTime;
    setInternalCurrentTime(timelineDuration);
    onTimeUpdate?.(timelineDuration);
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleEndedEvent = () => setIsPlaying(false);

    video.addEventListener("play", handlePlayEvent);
    video.addEventListener("pause", handlePauseEvent);
    video.addEventListener("ended", handleEndedEvent);

    return () => {
      video.removeEventListener("play", handlePlayEvent);
      video.removeEventListener("pause", handlePauseEvent);
      video.removeEventListener("ended", handleEndedEvent);
    };
  }, []);

  return (
    <div
      className="h-full min-h-0 min-w-0 flex flex-col rounded-sm shadow-sm"
      style={{ backgroundColor: "#F2F2F6", border: "1px solid #DADCE5" }}
    >
      {/* Video display area */}
      <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-4">
        <div
          className="w-full bg-black rounded overflow-hidden"
          style={{
            aspectRatio: aspectRatio === "9:16" ? "9/16" : aspectRatio === "16:9" ? "16/9" : aspectRatio === "1:1" ? "1/1" : "4/5",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <PreviewPlayer
            src="/videos/testing-video.mp4"
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            isPlaying={isPlaying}
            videoRef={videoRef}
            aspectRatio={aspectRatio}
            timelineState={timelineState}
            videoSourceMap={videoSourceMap}
          />
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Dropdowns */}
        <div className="flex items-center gap-2">
          <AspectRatioDropdown
            value={aspectRatio}
            onChange={setAspectRatio}
          />
          <LayoutDropdown
            value={layout}
            onChange={setLayout}
          />
        </div>

        {/* Center: Play controls */}
        <PlayControls
          onPrevious={handlePrevious}
          onPlay={handlePlay}
          onNext={handleNext}
          isPlaying={isPlaying}
        />

        {/* Right: Timecode */}
        <TimecodeDisplay currentTime={currentTime} />
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
