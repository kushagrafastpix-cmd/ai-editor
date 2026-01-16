import { useRef, useEffect } from 'react';
import type { TrackRow, VideoClip } from '../types';
import type { TextLayer } from '@/features/tools/Text/types';
import type { TranscriptData } from '@/types/transcript';
import { getOutroClips } from '@/routes/editor';
import AddIcon from '@/components/ui/icons/AddIcon';

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
  textLayers?: readonly TextLayer[];
  transcript?: TranscriptData; // Needed to identify outros
  onAddOutro?: () => void;
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
  textLayers = [],
  transcript,
  onAddOutro,
}: TimelineTracksProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
  
  // Calculate outro button position (after last outro, or after main video if no outros)
  let outroButtonTime: number | null = null;
  if (transcript && onAddOutro && mainVideoTrack) {
    const outroClips = getOutroClips(clips, transcript);
    if (outroClips.length > 0) {
      // Button after last outro
      outroButtonTime = Math.max(...outroClips.map(c => c.startTime + c.duration));
    } else {
      // No outros yet - button at end of main video or timeline
      const mainVideoClips = clips.filter(c => c.sourceVideoId === transcript.videoId);
      if (mainVideoClips.length > 0) {
        outroButtonTime = Math.max(...mainVideoClips.map(c => c.startTime + c.duration));
      } else {
        // No main video - use timeline duration
        outroButtonTime = duration;
      }
    }
  }
  
  const trackWidth = duration * pixelsPerSecond;
  
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
              {/* Render video/audio clips on this track */}
              {track.category !== 'text' && trackClips.map((clip) => {
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

              {/* Render text overlays on text track */}
              {track.category === 'text' && textLayers.map((textLayer) => {
                const clipLeft = textLayer.startTime * pixelsPerSecond;
                const clipWidth = textLayer.duration * pixelsPerSecond;
                const truncatedContent = textLayer.content.length > 20 
                  ? textLayer.content.substring(0, 20) + '...' 
                  : textLayer.content;
                
                return (
                  <div
                    key={textLayer.id}
                    className="absolute top-1 bottom-1 bg-purple-500 rounded border border-purple-600 cursor-move overflow-hidden flex items-center px-2"
                    style={{
                      left: `${clipLeft}px`,
                      width: `${clipWidth}px`,
                      minWidth: '40px',
                    }}
                    title={`Text: ${textLayer.content}\n${textLayer.startTime.toFixed(1)}s - ${(textLayer.startTime + textLayer.duration).toFixed(1)}s`}
                  >
                    <span className="text-xs text-white font-medium truncate">
                      {truncatedContent}
                    </span>
                  </div>
                );
              })}

              {/* Render "Add outro" button on main video track */}
              {track.isMainVideo && outroButtonTime !== null && onAddOutro && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddOutro();
                  }}
                  className="absolute top-1/2 -translate-y-1/2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors pointer-events-auto"
                  style={{
                    left: `${outroButtonTime * pixelsPerSecond + 8}px`,
                    width: '32px',
                    height: '32px',
                    zIndex: 10,
                  }}
                  aria-label="Add outro"
                  title="Add outro"
                >
                  <AddIcon className="h-4 w-4 text-gray-700" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTracks;

