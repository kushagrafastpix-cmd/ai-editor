import { useRef, useEffect } from 'react';
import type { TrackRow, VideoClip } from '../types';

interface TimelineTracksProps {
  tracks: readonly TrackRow[];
  clips: readonly VideoClip[];
  duration: number; // Total duration in seconds
  pixelsPerSecond: number; // Zoom scale
  width: number; // Container width in pixels
  scrollLeft: number; // Horizontal scroll position (for synchronization)
  onScroll: (scrollLeft: number) => void; // Callback when tracks are scrolled horizontally
  onClipMove?: (clipId: string, newStartTime: number) => void;
  onClipTrim?: (clipId: string, newSourceEnd: number) => void;
}

const ROW_HEIGHT = 48; // Matching TrackControls (48px - 1px border = 47px)

const TimelineTracks = ({
  tracks,
  clips,
  duration,
  pixelsPerSecond,
  width,
  scrollLeft,
  onScroll,
  onClipMove,
  onClipTrim,
}: TimelineTracksProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWidth = duration * pixelsPerSecond;

  // Separate tracks into different groups (matching TrackControls logic)
  const nonAudioTracks = tracks.filter(
    (track) =>
      !track.isMainVideo && !track.isDefaultAudio && track.category !== "audio"
  );
  const mainVideoTrack = tracks.find((track) => track.isMainVideo);
  const defaultAudioTrack = tracks.find((track) => track.isDefaultAudio);
  const additionalAudioTracks = tracks.filter(
    (track) => track.category === "audio" && !track.isDefaultAudio
  );

  // Combine all tracks in the same order as TrackControls
  const orderedTracks: TrackRow[] = [
    ...nonAudioTracks,
    ...(mainVideoTrack ? [mainVideoTrack] : []),
    ...(defaultAudioTrack ? [defaultAudioTrack] : []),
    ...additionalAudioTracks,
  ];

  // Sync horizontal scroll position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollLeft);
  };

  const totalTracksHeight = orderedTracks.length * ROW_HEIGHT;
  
  return (
    <div
      ref={containerRef}
      className="scrollbar-hide"
      style={{ 
        width: `${width}px`,
        overflowX: 'auto',
        overflowY: 'visible',
        height: 'fit-content',
      }}
      onScroll={handleScroll}
    >
      <div style={{ width: `${trackWidth}px`, position: 'relative', minHeight: `${totalTracksHeight}px` }}>
        {orderedTracks.map((track) => {
          // Get clips for this track
          const trackClips = clips.filter((clip) => clip.trackId === track.id);
          
          return (
            <div
              key={track.id}
              className="border-b-2 border-white relative"
              style={{
                height: `${ROW_HEIGHT}px`,
                backgroundColor: '#F1F5FB',
              }}
            >
              {/* Render clips on this track */}
              {trackClips.map((clip) => {
                const clipLeft = clip.startTime * pixelsPerSecond;
                const clipWidth = clip.duration * pixelsPerSecond;
                
                return (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 bg-blue-500 rounded border border-blue-600 cursor-move"
                    style={{
                      left: `${clipLeft}px`,
                      width: `${clipWidth}px`,
                      minWidth: '4px',
                    }}
                    title={`Clip: ${clip.startTime.toFixed(1)}s - ${(clip.startTime + clip.duration).toFixed(1)}s`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTracks;

