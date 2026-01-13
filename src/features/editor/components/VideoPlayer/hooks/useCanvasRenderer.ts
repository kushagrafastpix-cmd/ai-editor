import { useEffect, useRef } from "react";
import type { TextLayer } from "@/features/tools/Text/types";

interface UseCanvasRendererProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPlaying: boolean;
  currentTime: number;
  timelineTime?: number; // Timeline time for text layer filtering
  aspectRatio?: string;
  textLayers?: readonly TextLayer[];
}

export const useCanvasRenderer = ({
  videoRef,
  canvasRef,
  isPlaying,
  currentTime,
  timelineTime,
  aspectRatio,
  textLayers = [],
}: UseCanvasRendererProps) => {
  const rafIdRef = useRef<number | undefined>(undefined);
  
  // Use refs to store latest values for RAF loop
  const timelineTimeRef = useRef(timelineTime);
  const textLayersRef = useRef(textLayers);
  
  // Update refs when props change
  useEffect(() => {
    timelineTimeRef.current = timelineTime;
  }, [timelineTime]);
  
  useEffect(() => {
    textLayersRef.current = textLayers;
  }, [textLayers]);

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

  // Render text layers on canvas
  const renderTextLayers = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Use latest timeline time and text layers from refs (for RAF loop)
    const currentTimelineTime = timelineTimeRef.current;
    const currentTextLayers = textLayersRef.current;
    
    // Use timeline time for filtering text layers (they use timeline time)
    const timeForFiltering = currentTimelineTime !== undefined ? currentTimelineTime : currentTime;
    
    // Filter text layers visible at current time
    const visibleLayers = currentTextLayers.filter(
      layer => timeForFiltering >= layer.startTime && timeForFiltering < layer.startTime + layer.duration
    );

    if (visibleLayers.length === 0) return;

    // Get device pixel ratio for proper scaling
    const dpr = window.devicePixelRatio || 1;

    visibleLayers.forEach(layer => {
      const { content, style } = layer;

      // Set text properties
      const fontWeight = style.bold ? 'bold' : style.fontWeight;
      const fontSize = style.fontSize * dpr; // Scale font size by DPR
      ctx.font = `${fontWeight} ${fontSize}px ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calculate text position (centered horizontally, 80% down vertically)
      const x = canvas.width / 2;
      const y = canvas.height * 0.8;

      // Draw text background if opacity > 0
      if (style.backgroundOpacity > 0) {
        const metrics = ctx.measureText(content);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.2; // Approximate height

        // Parse background color and apply opacity
        const bgColor = style.backgroundColor;
        const bgOpacity = style.backgroundOpacity / 100;
        
        // Extract RGB from hex color
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
        
        // Draw background rectangle with padding
        const padding = fontSize * 0.3;
        ctx.fillRect(
          x - textWidth / 2 - padding,
          y - textHeight / 2 - padding,
          textWidth + padding * 2,
          textHeight + padding * 2
        );
      }

      // Parse text color and apply opacity
      const fillColor = style.fillColor;
      const fillOpacity = style.fillOpacity / 100;
      
      // Extract RGB from hex color
      const r = parseInt(fillColor.slice(1, 3), 16);
      const g = parseInt(fillColor.slice(3, 5), 16);
      const b = parseInt(fillColor.slice(5, 7), 16);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillOpacity})`;

      // Apply text decorations
      if (style.underline || style.strike) {
        const metrics = ctx.measureText(content);
        const textWidth = metrics.width;
        
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(1, fontSize / 20);
        
        if (style.underline) {
          const underlineY = y + fontSize * 0.1;
          ctx.beginPath();
          ctx.moveTo(x - textWidth / 2, underlineY);
          ctx.lineTo(x + textWidth / 2, underlineY);
          ctx.stroke();
        }
        
        if (style.strike) {
          ctx.beginPath();
          ctx.moveTo(x - textWidth / 2, y);
          ctx.lineTo(x + textWidth / 2, y);
          ctx.stroke();
        }
      }

      // Draw text
      ctx.fillText(content, x, y);
    });
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

    // Render text overlays on top of video
    renderTextLayers(ctx, canvas);
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

  // Render frame when currentTime, timelineTime, or textLayers changes (for seeking and text updates)
  useEffect(() => {
    if (!isPlaying) {
      renderFrame();
    }
  }, [currentTime, timelineTime, textLayers]);

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

