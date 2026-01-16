import type { TransitionId } from "@/features/tools/Transitions/types";

/**
 * Apply fade in effect - opacity goes from 0 to 1
 */
export const applyFadeIn = (
  ctx: CanvasRenderingContext2D,
  progress: number
): void => {
  // Progress 0->1 means opacity 0->1
  ctx.globalAlpha = progress;
};

/**
 * Apply fade out effect - opacity goes from 1 to 0
 */
export const applyFadeOut = (
  ctx: CanvasRenderingContext2D,
  progress: number
): void => {
  // Progress 0->1 means opacity 1->0
  ctx.globalAlpha = 1 - progress;
};

/**
 * Apply zoom in effect - scale goes from 0.5 to 1.0
 */
export const applyZoomIn = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  progress: number
): void => {
  // Scale from 0.5 to 1.0
  const scale = 1.0 + (progress * 0.5);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
};

/**
 * Apply zoom out effect - scale goes from 1.5 to 1.0
 */
export const applyZoomOut = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  progress: number
): void => {
  // Scale from 1.5 to 1.0 (zoom out)
  const scale = 1.5 - (progress * 0.5);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
};

/**
 * Apply cross fade effect - gradual fade transition
 * Simplified version that fades opacity
 */
export const applyCrossFade = (
  ctx: CanvasRenderingContext2D,
  progress: number
): void => {
  // Gradually fade opacity - dip in the middle for crossfade effect
  ctx.globalAlpha = progress < 0.5 ? 1 - (progress * 2) : (progress - 0.5) * 2;
};

/**
 * Apply cross zoom effect - zoom in + fade then zoom out + fade
 * First half: zoom in while fading
 * Second half: zoom out while fading
 */
export const applyCrossZoom = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  progress: number
): void => {
  let scale: number;
  let alpha: number;
  
  if (progress < 0.5) {
    // First half: zoom in (1.0 to 1.3) + fade out (1.0 to 0.5)
    const halfProgress = progress * 2; // 0 to 1 for first half
    scale = 1.0 + (halfProgress * 0.3);
    alpha = 1.0 - (halfProgress * 0.5);
  } else {
    // Second half: zoom out (1.3 to 1.0) + fade in (0.5 to 1.0)
    const halfProgress = (progress - 0.5) * 2; // 0 to 1 for second half
    scale = 1.3 - (halfProgress * 0.3);
    alpha = 0.5 + (halfProgress * 0.5);
  }
  
  ctx.globalAlpha = alpha;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
};

/**
 * Apply the appropriate transition effect based on transition ID
 */
export const applyTransitionEffect = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  transitionId: TransitionId,
  progress: number
): void => {
  switch (transitionId) {
    case "fade-in":
      applyFadeIn(ctx, progress);
      break;
    case "fade-out":
      applyFadeOut(ctx, progress);
      break;
    case "zoom-in":
      applyZoomIn(ctx, canvas, progress);
      break;
    case "zoom-out":
      applyZoomOut(ctx, canvas, progress);
      break;
    case "cross-fade":
      applyCrossFade(ctx, progress);
      break;
    case "cross-zoom":
      applyCrossZoom(ctx, canvas, progress);
      break;
    default:
      // No effect
      break;
  }
};
