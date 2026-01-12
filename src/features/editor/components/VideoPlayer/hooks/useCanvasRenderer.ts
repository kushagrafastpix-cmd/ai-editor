import { useEffect, useRef } from "react";

interface UseCanvasRendererProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPlaying: boolean;
  currentTime: number;
  aspectRatio?: string;
}

export const useCanvasRenderer = ({
  videoRef,
  canvasRef,
  isPlaying,
  currentTime,
  aspectRatio,
}: UseCanvasRendererProps) => {
  const rafIdRef = useRef<number | undefined>(undefined);

  // Update canvas size based on container dimensions and device pixel ratio
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas internal dimensions for high-DPI rendering
    // The CSS size is already set to 100% by the component
    // We only set the internal resolution here
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  };

  // Render a single frame from video to canvas
  const renderFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check if video is ready to render
    if (video.readyState < video.HAVE_CURRENT_DATA) return;

    // Clear canvas using internal dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame to canvas using internal dimensions
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  // Render loop for continuous playback
  const startRenderLoop = () => {
    const render = () => {
      renderFrame();
      rafIdRef.current = requestAnimationFrame(render);
    };
    rafIdRef.current = requestAnimationFrame(render);
  };

  // Stop the render loop
  const stopRenderLoop = () => {
    if (rafIdRef.current !== undefined) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = undefined;
    }
  };

  // Initialize canvas size on mount and window resize
  useEffect(() => {
    updateCanvasSize();

    const handleResize = () => {
      updateCanvasSize();
      renderFrame(); // Re-render frame after resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas size when aspect ratio or layout changes
  useEffect(() => {
    // Delay to allow CSS aspect ratio to take effect
    const timeoutId = setTimeout(() => {
      updateCanvasSize();
      renderFrame();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [aspectRatio]);

  // Control render loop based on playing state
  useEffect(() => {
    if (isPlaying) {
      startRenderLoop();
    } else {
      stopRenderLoop();
      // Render single frame when paused
      renderFrame();
    }

    return () => {
      stopRenderLoop();
    };
  }, [isPlaying]);

  // Render frame when currentTime changes (for seeking)
  useEffect(() => {
    if (!isPlaying) {
      renderFrame();
    }
  }, [currentTime]);

  // Initial render when video is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      updateCanvasSize();
      renderFrame();
    };

    video.addEventListener("loadeddata", handleLoadedData);
    return () => video.removeEventListener("loadeddata", handleLoadedData);
  }, [videoRef.current]);
};

