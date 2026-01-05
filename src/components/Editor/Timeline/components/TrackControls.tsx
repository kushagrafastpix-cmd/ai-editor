import VisibilityOnIcon from "../../../Common/Icons/VisibilityOnIcon";
import VisibilityOffIcon from "../../../Common/Icons/VisibilityOffIcon";
import LockOpenIcon from "../../../Common/Icons/LockOpenIcon";
import LockClosedIcon from "../../../Common/Icons/LockClosedIcon";
import VolumeIcon from "../../../Common/Icons/VolumeIcon";
import AddIcon from "../../../Common/Icons/AddIcon";
import type { TrackRow } from "../types";

interface TrackControlsProps {
  tracks: TrackRow[];
  onToggleVisibility: (trackId: string) => void;
  onToggleLock: (trackId: string) => void;
  onAddVideo?: () => void;
}

const TrackControls = ({
  tracks,
  onToggleVisibility,
  onToggleLock,
  onAddVideo,
}: TrackControlsProps) => {
  // Separate tracks into different groups
  const nonAudioTracks = tracks.filter(
    (track) => !track.isMainVideo && !track.isDefaultAudio && track.category !== 'audio'
  );
  const mainVideoTrack = tracks.find((track) => track.isMainVideo);
  const defaultAudioTrack = tracks.find((track) => track.isDefaultAudio);
  const additionalAudioTracks = tracks.filter(
    (track) => track.category === 'audio' && !track.isDefaultAudio
  );

  const renderControlRow = (track: TrackRow, showAddIcon = false) => {
    return (
        
      <div
        key={track.id}
        className="flex items-center gap-2 px-2 py-2 border-b border-[#DADCE5]"
        style={{ minHeight: '60px' }}
      >
        {/* AddIcon for main video row - extreme left */}
        {showAddIcon && (
          <button
            onClick={onAddVideo}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label="Add video/clip"
          >
            <AddIcon className="h-4 w-4" />
          </button>
        )}

        {/* Visibility button (only for non-audio tracks) */}
        {track.category !== 'audio' && (
          <button
            onClick={() => onToggleVisibility(track.id)}
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            aria-label={track.visible ? 'Hide track' : 'Show track'}
          >
            {track.visible ? (
              <VisibilityOnIcon className="h-4 w-4" />
            ) : (
              <VisibilityOffIcon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* VolumeIcon for audio tracks */}
        {track.category === 'audio' && (
          <div className="flex items-center justify-center p-1.5 text-gray-700">
            <VolumeIcon className="h-4 w-4" />
          </div>
        )}

        {/* Lock button - always present for all rows */}
        <button
          onClick={() => onToggleLock(track.id)}
          className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors focus:outline-none"
          aria-label={track.locked ? 'Unlock track' : 'Lock track'}
        >
          {track.locked ? (
            <LockClosedIcon className="h-4 w-4" />
          ) : (
            <LockOpenIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="flex-shrink-0 bg-white border-r border-[#DADCE5]" style={{ width: '120px' }}>
      {/* Row 1: Dynamic non-audio tracks (B-roll, text, video, image, etc.) */}
      {nonAudioTracks.map((track) => renderControlRow(track))}

      {/* Row 2: Main video row (always present) */}
      {mainVideoTrack ? renderControlRow(mainVideoTrack, true) : null}

      {/* Row 3: Default audio row (always present) */}
      {defaultAudioTrack ? renderControlRow(defaultAudioTrack) : null}

      {/* Row 4+: Additional audio tracks */}
      {additionalAudioTracks.map((track) => renderControlRow(track))}
    </div>
  );
};

export default TrackControls;

