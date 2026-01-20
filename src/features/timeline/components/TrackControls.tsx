import VisibilityOnIcon from "@/components/ui/icons/VisibilityOnIcon";
import VisibilityOffIcon from "@/components/ui/icons/VisibilityOffIcon";
import LockOpenIcon from "@/components/ui/icons/LockOpenIcon";
import LockClosedIcon from "@/components/ui/icons/LockClosedIcon";
import VolumeIcon from "@/components/ui/icons/VolumeIcon";
import AddIcon from "@/components/ui/icons/AddIcon";
import type { TrackRow } from "../types";

interface TrackControlsProps {
  tracks: readonly TrackRow[];
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
  // Separate transition track
  const transitionTrack = tracks.find((track) => track.category === "transition");
  
  // Separate image track
  const imageTrack = tracks.find((track) => track.category === "image");

  const nonAudioTracks = tracks.filter(
    (track) =>
      !track.isMainVideo && !track.isDefaultAudio && track.category !== "audio" && track.category !== "transition" && track.category !== "image"
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
        `}
      >
        {/* Column 1 — Add */}
        <div className="flex justify-center">
          {showAddIcon && (
            <button
              onClick={onAddVideo}
              className="p-1 rounded hover:bg-gray-200"
              aria-label="Add intro"
            >
              <AddIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Column 2 — Visibility / Volume */}
        <div className="flex justify-center">
          {track.category === "audio" ? (
            <VolumeIcon className="h-4 w-4 text-gray-700" />
          ) : (
            <button
              onClick={() => onToggleVisibility(track.id)}
              className="p-1 rounded hover:bg-gray-200"
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

        {/* Column 3 — Lock */}
        <div className="flex justify-center">
          <button
            onClick={() => onToggleLock(track.id)}
            className="p-1 rounded hover:bg-gray-200"
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

  const renderTransitionRow = (track: TrackRow) => {
    return (
      <div
        key={track.id}
        className={`
          flex
          items-center
          ${ROW_HEIGHT}
          px-2
          border-b border-[#DADCE5]
        `}
      >
        {/* Empty row - no controls for transition track */}
      </div>
    );
  };

  return (
    <div
      className="flex-shrink-0"
      style={{ width: "115px", height: 'fit-content' }}
    >
      {/* Row 0: Transition track (topmost, no controls) */}
      {transitionTrack && renderTransitionRow(transitionTrack)}
      {/* Row 1: Image track */}
      {imageTrack && renderControlRow(imageTrack)}
      {/* Row 2: Dynamic non-audio tracks (B-roll, text, video, etc.) */}
      {nonAudioTracks.map((track) => renderControlRow(track))}
      {/* Row 3: Main video row (always present) */}
      {mainVideoTrack && renderControlRow(mainVideoTrack, true)}
      {/* Row 4: Default audio track (always present) */}
      {defaultAudioTrack && renderControlRow(defaultAudioTrack)}
      {/* Row 5: Additional audio tracks */}
      {additionalAudioTracks.map((track) => renderControlRow(track))}
    </div>
  );
};

export default TrackControls;
