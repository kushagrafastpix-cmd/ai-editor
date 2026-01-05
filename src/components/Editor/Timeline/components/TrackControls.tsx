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

const ROW_HEIGHT = "h-[48px]";

const TrackControls = ({
  tracks,
  onToggleVisibility,
  onToggleLock,
  onAddVideo,
}: TrackControlsProps) => {
  const nonAudioTracks = tracks.filter(
    (track) =>
      !track.isMainVideo &&
      !track.isDefaultAudio &&
      track.category !== "audio"
  );

  const mainVideoTrack = tracks.find((track) => track.isMainVideo);
  const defaultAudioTrack = tracks.find((track) => track.isDefaultAudio);

  const additionalAudioTracks = tracks.filter(
    (track) => track.category === "audio" && !track.isDefaultAudio
  );

  const renderControlRow = (track: TrackRow, showAddIcon = false) => {
    return (
      <div
        key={track.id}
        className={`
          grid grid-cols-3
          items-center
          ${ROW_HEIGHT}
          px-2
          border-b border-[#DADCE5]
          bg-white
        `}
      >
        {/* COLUMN 1 — Add only */}
        <div className="flex justify-center">
          {showAddIcon && (
            <button
              onClick={onAddVideo}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Add intro"
            >
              <AddIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* COLUMN 2 — Visibility OR Volume */}
        <div className="flex justify-center">
          {track.category === "audio" ? (
            <VolumeIcon className="h-4 w-4 text-gray-700" />
          ) : (
            <button
              onClick={() => onToggleVisibility(track.id)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label={track.visible ? "Hide track" : "Show track"}
            >
              {track.visible ? (
                <VisibilityOnIcon className="h-4 w-4" />
              ) : (
                <VisibilityOffIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* COLUMN 3 — Lock */}
        <div className="flex justify-center">
          <button
            onClick={() => onToggleLock(track.id)}
            className="p-1 rounded hover:bg-gray-100"
            aria-label={track.locked ? "Unlock track" : "Lock track"}
          >
            {track.locked ? (
              <LockClosedIcon className="h-4 w-4" />
            ) : (
              <LockOpenIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex-shrink-0 bg-white border-r border-[#DADCE5]"
      style={{ width: "96px" }}
    >
      {/* Non-audio tracks (above main video) */}
      {nonAudioTracks.map((track) => renderControlRow(track))}

      {/* Main video track */}
      {mainVideoTrack && renderControlRow(mainVideoTrack, true)}

      {/* Default audio track */}
      {defaultAudioTrack && renderControlRow(defaultAudioTrack)}

      {/* Additional audio tracks */}
      {additionalAudioTracks.map((track) => renderControlRow(track))}
    </div>
  );
};

export default TrackControls;
