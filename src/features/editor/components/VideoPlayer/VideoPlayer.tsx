import { useState } from "react";
import AspectRatioDropdown, { type AspectRatio } from "./components/AspectRatioDropdown";
import LayoutDropdown, { type Layout } from "./components/LayoutDropdown";
import PlayControls from "./components/PlayControls";
import TimecodeDisplay from "./components/TimecodeDisplay";

const VideoPlayer = () => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [layout, setLayout] = useState<Layout>("fit");

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
          className="w-full bg-black rounded"
          style={{
            aspectRatio: aspectRatio === "9:16" ? "9/16" : aspectRatio === "16:9" ? "16/9" : aspectRatio === "1:1" ? "1/1" : "4/5",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Dummy video box - placeholder for actual video */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-white opacity-50">Video Preview</span>
          </div>
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
