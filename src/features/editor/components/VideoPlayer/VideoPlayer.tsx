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
  imageSourceMap?: Record<string, string>;
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
  imageSourceMap = {},
}: PreviewPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get video clips only (not audio) for time mapping
  const videoClips = timelineState ? timelineState.clips.filter(clip => {
    const track = timelineState.tracks.find(t => t.id === clip.trackId);
    return track?.category === 'main-video';
  }) : [];

  // Get image clips for rendering
  const imageClips = timelineState ? timelineState.clips.filter(clip => {
    const track = timelineState.tracks.find(t => t.id === clip.trackId);
    return track?.category === 'image';
  }) : [];

  // Convert timeline time to source time for seeking (not during playback)
  const sourceTime = videoClips.length > 0
    ? timelineToSourceTime(currentTime, videoClips) ?? -1
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
    imageClips,
    videoClips,
    imageSourceMap,
  });

  // Sync currentTime prop with video element when seeking (not during playback)
  // During playback, VideoPlayer RAF loop handles jumping between clips
  useEffect(() => {
    if (!isPlaying && videoRef.current && sourceTime >= 0 && Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
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

      // If we are beyond the last clip, stick to the last clip's source
      // This prevents the video element from switching back to the default src
      // which might reset its currentTime and trigger unwanted time updates.
      if (mainVideoClips.length > 0) {
        const sorted = [...mainVideoClips].sort((a, b) => a.startTime - b.startTime);
        const lastClip = sorted[sorted.length - 1];
        if (currentTime >= lastClip.startTime) {
          if (videoSourceMap[lastClip.sourceVideoId]) {
            return videoSourceMap[lastClip.sourceVideoId];
          } else if (lastClip.sourceVideoId === 'dummy-video-1') {
            return '/videos/testing-video.mp4';
          }
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
        playPromise.catch((e) => {
          // Abort error is expected when swapping sources quickly
          if (e.name !== 'AbortError') {
            console.error('[PreviewPlayer] Play error:', e);
          }
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
        loop={false}
        onTimeUpdate={(e) =>
          onTimeUpdate((e.target as HTMLVideoElement).currentTime)
        }
        onEnded={() => {
          // Prevent video from looping - handle ended event
          const video = videoRef.current;
          if (video) {
            video.pause();
          }
        }}
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
  imageSourceMap?: Record<string, string>;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  currentTime: externalCurrentTime,
  onTimeUpdate,
  timelineState,
  videoSourceMap,
  imageSourceMap = {}
}, ref) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [layout, setLayout] = useState<Layout>("fit");
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track if we're in manual playback mode (beyond video clips, on black screen)
  const isManualPlaybackRef = useRef(false);

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

  // Ref to track current timeline time for RAF loop
  // Use currentTime (which accounts for external updates) to keep the RAF loop in sync
  const internalCurrentTimeRef = useRef(currentTime);
  useEffect(() => {
    internalCurrentTimeRef.current = currentTime;
  }, [currentTime]);

  // Update manual playback state when scrubbing/seeking
  // This ensures that dragging the playhead back from the end correctly resets the state
  useEffect(() => {
    if (!isPlaying && timelineState) {
      const videoClips = timelineState.clips.filter(clip => {
        const track = timelineState.tracks.find(t => t.id === clip.trackId);
        return track?.category === 'main-video';
      });
      const videoDuration = getTimelineDuration(videoClips);
      if (currentTime >= videoDuration - 0.05) {
        isManualPlaybackRef.current = true;
      } else {
        isManualPlaybackRef.current = false;
      }
    }
  }, [currentTime, isPlaying, timelineState]);

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
    // When we're in manual playback mode (black screen / overlays beyond last video clip),
    // ignore video element time updates to avoid snapping back if the element loops/resets.
    if (isManualPlaybackRef.current) {
      return;
    }

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

    // Guard: Prevent snapping back if we are currently positioned beyond the last clip
    // or if the video element is at its end while the timeline continues.
    if (videoClips.length > 0) {
      const sorted = [...videoClips].sort((a, b) => a.startTime - b.startTime);
      const lastClip = sorted[sorted.length - 1];
      const lastClipEndTime = lastClip.startTime + lastClip.duration;

      // If we are significantly beyond the last clip, or already in manual mode,
      // ignore automated updates from the video element.
      if (internalCurrentTimeRef.current > lastClipEndTime - 0.05 || isManualPlaybackRef.current) {
        return;
      }
    }

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

    let lastTimestamp: number | null = null;

    const updateTime = (timestamp?: number) => {
      if (!video) return;

      const sourceTime = video.currentTime;
      const currentTimelineTime = internalCurrentTimeRef.current; // Use ref for latest state

      // 1. Determine which clip we are supposedly inside based on TIMELINE time
      // This is our source of truth for "where we should be"
      const currentClipIndex = sortedClips.findIndex(
        clip => currentTimelineTime >= clip.startTime && currentTimelineTime < clip.startTime + clip.duration
      );

      if (currentClipIndex === -1) {
        // We are in a gap or beyond the last video clip
        // Check if we've reached the end of the OVERALL timeline (including overlays)
        const overallTimelineDuration = timelineState.duration;
        if (currentTimelineTime >= overallTimelineDuration) {
          console.log(`[VideoPlayer] Reached end of overall timeline (${currentTimelineTime.toFixed(3)}s), stopping playback`);
          video.pause();
          setIsPlaying(false);
          return;
        }

        // Check if there's a next video clip
        const nextClip = sortedClips.find(clip => clip.startTime > currentTimelineTime);
        if (nextClip) {
          console.log(`[VideoPlayer] In pause/gap at ${currentTimelineTime.toFixed(3)}s, jumping to next clip at ${nextClip.startTime.toFixed(3)}s`);
          // We update timeline time, which triggers PreviewPlayer to load the correct src and seek
          setInternalCurrentTime(nextClip.startTime);
          onTimeUpdate?.(nextClip.startTime);
          // We don't set video.currentTime here because the src might need to change
          // PreviewPlayer will handle the seek after render
        } else {
          // No more video clips, but timeline continues (overlays on black screen)
          // Enter manual playback mode
          isManualPlaybackRef.current = true;

          // Pause the video element to prevent timeupdate conflicts
          if (video.paused === false) {
            video.pause();
          }

          // Continue incrementing time based on real elapsed time
          if (timestamp !== undefined && lastTimestamp !== null) {
            const elapsed = (timestamp - lastTimestamp) / 1000; // Convert ms to seconds
            const newTime = currentTimelineTime + elapsed;

            if (newTime < overallTimelineDuration) {
              setInternalCurrentTime(newTime);
              onTimeUpdate?.(newTime);
            } else {
              // Reached true end
              isManualPlaybackRef.current = false;
              setIsPlaying(false);
              return;
            }
          }

          if (timestamp !== undefined) {
            lastTimestamp = timestamp;
          }
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
          const overallTimelineDuration = timelineState.duration;

          if (nextClip) {
            console.log(`[VideoPlayer] Near end of clip ${currentClip.id}, jumping to next clip ${nextClip.id} at ${nextClip.startTime}`);
            // Optimistically update internal time to next clip start
            setInternalCurrentTime(nextClip.startTime);
            onTimeUpdate?.(nextClip.startTime);

            // Force seek to next clip source
            video.currentTime = nextClip.sourceStartTime;
          } else {
            // No more video clips - check if timeline continues (overlays on black screen)
            const nextTimelineTime = endOfClip;

            if (nextTimelineTime < overallTimelineDuration) {
              console.log(`[VideoPlayer] Reached end of last video clip, continuing timeline for overlays`);
              // Enter manual playback mode
              isManualPlaybackRef.current = true;

              // Pause the video element to prevent timeupdate conflicts
              if (video.paused === false) {
                video.pause();
              }
              setInternalCurrentTime(nextTimelineTime);
              onTimeUpdate?.(nextTimelineTime);
            } else {
              console.log(`[VideoPlayer] Reached end of overall timeline`);
              isManualPlaybackRef.current = false;
              video.pause();
              setIsPlaying(false);
              return;
            }
          }
        } else if (sourceTime < currentClip.sourceStartTime - 0.25) {
          // Detect if we are physically in a gap/pause BEFORE this clip
          // (e.g. source is 10.1s, but clip starts at 12s)
          // Threshold is 0.25s to allow minor seeking drift but catch large gaps
          console.log(`[VideoPlayer] Source ${sourceTime.toFixed(3)}s lagging behind clip start ${currentClip.sourceStartTime}, seeking`);
          video.currentTime = currentClip.sourceStartTime;
        } else if (sourceTime > currentClip.sourceEndTime) {
          // Video has passed the end of this clip's source range - prevent looping
          const clipTimelineEnd = currentClip.startTime + currentClip.duration;
          const overallTimelineDuration = timelineState.duration;

          // Clamp video to end of source to prevent looping
          video.currentTime = currentClip.sourceEndTime;

          // Check if timeline continues beyond this clip
          if (clipTimelineEnd < overallTimelineDuration - 0.1) {
            // Timeline continues with overlays - enter manual playback mode
            console.log(`[VideoPlayer] Video source ended but timeline continues (${clipTimelineEnd.toFixed(3)}s < ${overallTimelineDuration.toFixed(3)}s), entering manual playback mode`);
            isManualPlaybackRef.current = true;
            if (video.paused === false) {
              video.pause();
            }
            // Update timeline to clip end
            setInternalCurrentTime(clipTimelineEnd);
            onTimeUpdate?.(clipTimelineEnd);
          } else {
            // Reached true end - stop playback
            console.log(`[VideoPlayer] Reached end of overall timeline`);
            isManualPlaybackRef.current = false;
            video.pause();
            setIsPlaying(false);
            return;
          }
        } else {
          // Normal playback: update timeline time based on video progress

          // Check if video has reached or passed the clip's source end
          if (sourceTime >= currentClip.sourceEndTime) {
            // Video reached end - prevent looping
            const clipTimelineEnd = currentClip.startTime + currentClip.duration;
            const overallTimelineDuration = timelineState.duration;

            // Clamp video to end of source
            video.currentTime = currentClip.sourceEndTime;

            // Check if timeline continues beyond this clip
            if (clipTimelineEnd < overallTimelineDuration - 0.1) {
              // Timeline continues with overlays - enter manual playback mode
              console.log(`[VideoPlayer] Video source ended but timeline continues (${clipTimelineEnd.toFixed(3)}s < ${overallTimelineDuration.toFixed(3)}s), entering manual playback mode`);
              isManualPlaybackRef.current = true;
              if (video.paused === false) {
                video.pause();
              }
              // Update timeline to clip end
              setInternalCurrentTime(clipTimelineEnd);
              onTimeUpdate?.(clipTimelineEnd);
            } else {
              // Reached true end - stop playback
              console.log(`[VideoPlayer] Reached end of overall timeline`);
              isManualPlaybackRef.current = false;
              video.pause();
              setIsPlaying(false);
              return;
            }
          } else {
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

      // Only reset manual playback ref if we are NOT at the end of the video clips
      // This prevents the video element's pause/timeupdate from snapping the playhead back
      if (timelineState) {
        const videoClips = timelineState.clips.filter(clip => {
          const track = timelineState.tracks.find(t => t.id === clip.trackId);
          return track?.category === 'main-video';
        });
        const duration = getTimelineDuration(videoClips);
        if (currentTime < duration - 0.1) {
          isManualPlaybackRef.current = false;
        }
      } else {
        isManualPlaybackRef.current = false;
      }
    } else {
      // Before playing, check if we are at the end of the timeline
      const timelineDuration = timelineState?.duration ?? 0;

      // If we are at the very end, restart from beginning
      if (timelineDuration > 0 && currentTime >= timelineDuration - 0.05) {
        console.log('[VideoPlayer] At end of timeline, restarting from 0');
        setInternalCurrentTime(0);
        onTimeUpdate?.(0);

        // Position video element to start of first clip
        if (timelineState) {
          const videoClips = timelineState.clips.filter(clip => {
            const track = timelineState.tracks.find(t => t.id === clip.trackId);
            return track?.category === 'main-video';
          });
          const startSourceTime = timelineToSourceTime(0, videoClips) ?? 0;
          videoRef.current.currentTime = startSourceTime;
        } else {
          videoRef.current.currentTime = 0;
        }
      } else if (timelineState) {
        // Check if we are starting from a gap or beyond video clips
        const videoClips = timelineState.clips.filter(clip => {
          const track = timelineState.tracks.find(t => t.id === clip.trackId);
          return track?.category === 'main-video';
        });

        const videoDuration = getTimelineDuration(videoClips);
        if (currentTime >= videoDuration - 0.05) {
          isManualPlaybackRef.current = true;
        } else {
          isManualPlaybackRef.current = false;
        }

        // Normal positioning before playback
        const sourceTime = timelineToSourceTime(currentTime, videoClips);
        if (sourceTime !== null && Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
          console.log(`[VideoPlayer] Starting playback: positioning to source ${sourceTime.toFixed(3)}s for timeline ${currentTime.toFixed(3)}s`);
          videoRef.current.currentTime = sourceTime;
        }
      }

      // Only play video element if we are NOT in manual playback mode
      if (!isManualPlaybackRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error('[VideoPlayer] Play error:', e);
            }
          });
        }
      }
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

    const handlePlayEvent = () => {
      // Check if we started playing from beyond video clips
      if (timelineState) {
        const videoClips = timelineState.clips.filter(clip => {
          const track = timelineState.tracks.find(t => t.id === clip.trackId);
          return track?.category === 'main-video';
        });
        const duration = getTimelineDuration(videoClips);
        // Use the ref for the most up-to-date time
        if (internalCurrentTimeRef.current >= duration - 0.05) {
          isManualPlaybackRef.current = true;
        } else {
          isManualPlaybackRef.current = false;
        }
      }
      setIsPlaying(true);
    };
    const handlePauseEvent = () => {
      // Only stop playing if we're NOT in manual playback mode
      if (!isManualPlaybackRef.current) {
        setIsPlaying(false);
      }
    };
    const handleEndedEvent = () => {
      if (!isManualPlaybackRef.current) {
        setIsPlaying(false);
      }
    };

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
            imageSourceMap={imageSourceMap}
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
