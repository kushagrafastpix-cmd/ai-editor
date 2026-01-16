import { useEffect, useRef } from "react";
import type { TextLayer } from "@/features/tools/Text/types";
import type { TransitionEffect } from "@/features/tools/Transitions/types";
import { applyTransitionEffect } from "../utils/transitionEffects";

interface UseCanvasRendererProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPlaying: boolean;
  currentTime: number;
  timelineTime?: number; // Timeline time for text layer filtering
  aspectRatio?: string;
  textLayers?: readonly TextLayer[];
  transitions?: readonly TransitionEffect[];
}

export const useCanvasRenderer = ({
  videoRef,
  canvasRef,
  isPlaying,
  currentTime,
  timelineTime,
  aspectRatio,
  textLayers = [],
  transitions = [],
}: UseCanvasRendererProps) => {
  const rafIdRef = useRef<number | undefined>(undefined);
  
  // Use refs to store latest values for RAF loop
  const timelineTimeRef = useRef(timelineTime);
  const textLayersRef = useRef(textLayers);
  const transitionsRef = useRef(transitions);
  
  // Update refs when props change
  useEffect(() => {
    timelineTimeRef.current = timelineTime;
  }, [timelineTime]);
  
  useEffect(() => {
    textLayersRef.current = textLayers;
  }, [textLayers]);
  
  useEffect(() => {
    transitionsRef.current = transitions;
  }, [transitions]);

  // Helper function to find active transition at current time
  const findActiveTransition = (currentTime: number, transitions: readonly TransitionEffect[]): TransitionEffect | undefined => {
    return transitions.find(t => 
      currentTime >= t.startTime && 
      currentTime < t.startTime + t.duration
    );
  };

  // Helper function to calculate transition progress (0 to 1)
  const calculateProgress = (currentTime: number, transition: TransitionEffect): number => {
    const elapsed = currentTime - transition.startTime;
    return Math.min(1, Math.max(0, elapsed / transition.duration));
  };

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
      // Save canvas state before rendering each text layer to ensure isolation
      ctx.save();
      
      const { content, style, type } = layer;

      // Map font weight to valid CSS values
      let fontWeight = 'normal';
      if (style.bold) {
        fontWeight = 'bold';
      } else if (style.fontWeight === 'Semibold') {
        fontWeight = '600';
      } else if (style.fontWeight === 'Regular' || style.fontWeight === 'Normal') {
        fontWeight = 'normal';
      } else {
        fontWeight = style.fontWeight;
      }
      
      // Use fontSize from style (which comes from constants or user customization)
      const baseFontSize = style.fontSize; 
      
      // Set font first to measure text properly
      // Scale by DPR to match canvas resolution
      const fontSize = baseFontSize * dpr;
      ctx.font = `${fontWeight} ${Math.round(fontSize)}px ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calculate text position (centered horizontally, 80% down vertically)
      const x = canvas.width / 2;
      const y = canvas.height * 0.9;

      // Measure text for background (after font is set)
      const metrics = ctx.measureText(content);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.8; // Approximate height

      // Always draw white background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White with 90% opacity
      
      // Draw background rectangle with horizontal padding (more width than height)
      // Use horizontal padding that makes it wider, and smaller vertical padding
      const horizontalPadding = fontSize * 0.6; // More horizontal padding
      const verticalPadding = fontSize * 0.15; // Less vertical padding
      
      ctx.fillRect(
        x - textWidth / 2 - horizontalPadding,
        y - textHeight / 2 - verticalPadding,
        textWidth + horizontalPadding * 2,
        textHeight + verticalPadding * 2
      );

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
      
      // Restore canvas state after rendering each text layer
      ctx.restore();
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

    // Get current timeline time and transitions from refs
    const currentTimelineTime = timelineTimeRef.current;
    const currentTransitions = transitionsRef.current;
    
    // Use timeline time for transition detection (they use timeline time like text layers)
    const timeForTransition = currentTimelineTime !== undefined ? currentTimelineTime : currentTime;
    
    // Find active transition at current time
    const activeTransition = findActiveTransition(timeForTransition, currentTransitions);
    
    if (activeTransition) {
      // Calculate transition progress
      const progress = calculateProgress(timeForTransition, activeTransition);
      
      // Save canvas state before applying effects
      ctx.save();
      
      // Apply transition effect (this may modify ctx transform or alpha)
      applyTransitionEffect(ctx, canvas, activeTransition.transitionId, progress);
      
      // Draw video frame with transition applied
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Restore canvas state after transition
      ctx.restore();
    } else {
      // Normal rendering without transition
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Render text overlays on top of video (always last, after transitions)
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

  // Render frame when currentTime, timelineTime, textLayers, or transitions changes (for seeking and updates)
  useEffect(() => {
    if (!isPlaying) {
      renderFrame();
    }
  }, [currentTime, timelineTime, textLayers, transitions]);

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

