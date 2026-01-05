import { useRef, useEffect } from 'react';
import type { TrackRow } from '../types';

interface TimelineTracksProps {
  tracks: TrackRow[];
  duration: number; // Total duration in seconds
  pixelsPerSecond: number; // Zoom scale
  width: number; // Container width in pixels
  scrollLeft: number; // Horizontal scroll position (for synchronization)
  onScroll: (scrollLeft: number) => void; // Callback when tracks are scrolled horizontally
}

const ROW_HEIGHT = 48; // Matching TrackControls (48px - 1px border = 47px)

const TimelineTracks = ({
  tracks,
  duration,
  pixelsPerSecond,
  width,
  scrollLeft,
  onScroll,
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
      <div style={{ width: `${trackWidth}px` }}>
        {orderedTracks.map((track) => (
          <div
            key={track.id}
            className="border-b-2 border-white"
            style={{
              height: `${ROW_HEIGHT}px`,
              backgroundColor: '#F1F5FB',
            }}
          >
            {/* Empty content for now - placeholder */}
            <h1>{track.category}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTracks;

