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
}

const PreviewPlayer = ({
  src,
  currentTime,
  onTimeUpdate,
  isPlaying,
  videoRef,
  aspectRatio,
  timelineState,
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
  });

  // Sync currentTime prop with video element when seeking (not during playback)
  // During playback, VideoPlayer RAF loop handles jumping between clips
  useEffect(() => {
    if (!isPlaying && videoRef.current && Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
      console.log(`[PreviewPlayer] Seeking to source time ${sourceTime.toFixed(3)}s (timeline ${currentTime.toFixed(3)}s)`);
      videoRef.current.currentTime = sourceTime;
    } 
  }, [sourceTime, videoRef, isPlaying]);

  return (
    <>
      {/* Hidden video element - source for canvas */}
    <video
      ref={videoRef}
      src={src}
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
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ 
  currentTime: externalCurrentTime, 
  onTimeUpdate,
  timelineState 
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
  
  // Use external currentTime if provided, otherwise use internal state
  const currentTime = externalCurrentTime ?? internalCurrentTime;
  
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
    
    // With timeline state, convert source time to timeline time
    const timelineTime = sourceToTimelineTime(time, videoClips) ?? time;
    setInternalCurrentTime(timelineTime);
    onTimeUpdate?.(timelineTime);
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
    const sortedClips = [...videoClips].sort((a, b) => a.sourceStartTime - b.sourceStartTime);
    
    console.log('[VideoPlayer] Video clips for playback:', sortedClips.map(c => ({
      id: c.id,
      trackId: c.trackId,
      source: `${c.sourceStartTime}-${c.sourceEndTime}`,
      timeline: `${c.startTime}-${c.startTime + c.duration}`
    })));

    const updateTime = () => {
      if (!video) return;
      
      const sourceTime = video.currentTime;
      
      // Find which clip contains current source time
      const currentClipIndex = sortedClips.findIndex(
        clip => sourceTime >= clip.sourceStartTime && sourceTime < clip.sourceEndTime
      );
      
      // if (currentClipIndex !== -1) {
      //   console.log(`[VideoPlayer] At source ${sourceTime.toFixed(3)}s, in clip ${sortedClips[currentClipIndex].id} (index ${currentClipIndex})`);
      // }

      if (currentClipIndex === -1) {
        // Video is in a pause segment - find next clip and jump to it
        const nextClip = sortedClips.find(clip => clip.sourceStartTime > sourceTime);
        
        if (nextClip) {
          console.log(`[VideoPlayer] In pause at ${sourceTime.toFixed(3)}s, jumping to next clip at ${nextClip.sourceStartTime.toFixed(3)}s`);
          video.currentTime = nextClip.sourceStartTime;
        } else {
          // No more clips - stop playback
          console.log(`[VideoPlayer] Reached end of timeline, stopping playback`);
          video.pause();
          setIsPlaying(false);
          return;
        }
      } else {
        const currentClip = sortedClips[currentClipIndex];
        
        // Check if we're about to reach the end of this clip
        if (sourceTime >= currentClip.sourceEndTime - 0.05) {
          // Find next clip
          const nextClip = sortedClips[currentClipIndex + 1];
          
          console.log(`[VideoPlayer] Near end of clip ${currentClip.id} at ${sourceTime.toFixed(3)}s (end: ${currentClip.sourceEndTime})`);
          console.log(`[VideoPlayer] Next clip index: ${currentClipIndex + 1}, total clips: ${sortedClips.length}`);
          console.log(`[VideoPlayer] Next clip:`, nextClip);
          
          if (nextClip) {
            console.log(`[VideoPlayer] End of clip at ${sourceTime.toFixed(3)}s, jumping to ${nextClip.sourceStartTime.toFixed(3)}s`);
            video.currentTime = nextClip.sourceStartTime;
          } else {
            // No more clips - stop playback
            console.log(`[VideoPlayer] Reached end of last clip, stopping playback`);
            video.pause();
            setIsPlaying(false);
            return;
          }
        }
        
        // Update timeline time display (use video clips only for time mapping)
        const timelineTime = sourceToTimelineTime(sourceTime, videoClips) ?? sourceTime;
        setInternalCurrentTime(timelineTime);
        onTimeUpdate?.(timelineTime);
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
