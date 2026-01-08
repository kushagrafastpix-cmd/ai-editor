import { useState, useRef, useEffect } from "react";
import AspectRatioDropdown, { type AspectRatio } from "./components/AspectRatioDropdown";
import LayoutDropdown, { type Layout } from "./components/LayoutDropdown";
import PlayControls from "./components/PlayControls";
import TimecodeDisplay from "./components/TimecodeDisplay";

interface PreviewPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

const PreviewPlayer = ({
  src,
  currentTime,
  onTimeUpdate,
}: PreviewPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync currentTime prop with video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      muted={false}
      onTimeUpdate={(e) =>
        onTimeUpdate((e.target as HTMLVideoElement).currentTime)
      }
      style={{
        width: "100%",
        height: "100%",
        background: "black",
        objectFit: "contain",
      }}
    />
  );
};

interface VideoPlayerProps {
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

const VideoPlayer = ({ currentTime: externalCurrentTime, onTimeUpdate }: VideoPlayerProps = {}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [layout, setLayout] = useState<Layout>("fit");
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  
  // Use external currentTime if provided, otherwise use internal state
  const currentTime = externalCurrentTime ?? internalCurrentTime;
  
  const handleTimeUpdate = (time: number) => {
    setInternalCurrentTime(time);
    onTimeUpdate?.(time);
  };

  const handlePrevious = () => {
    // TODO: Implement previous frame/clip
  };

  const handlePlay = () => {
    // TODO: Implement play/pause
  };

  const handleNext = () => {
    // TODO: Implement next frame/clip
  };

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
        />

        {/* Right: Timecode */}
        <TimecodeDisplay />
      </div>
    </div>
  );
};

export default VideoPlayer;
