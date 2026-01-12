/**
 * Formats seconds into HH:MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "00:02:05")
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number): string => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

/**
 * Formats seconds into HH:MM:SS:FF timecode format
 * @param seconds - Time in seconds
 * @param fps - Frames per second (default: 30)
 * @returns Formatted timecode string (e.g., "00:02:05:15")
 */
export const formatTimecode = (seconds: number, fps: number = 30): string => {
  // Calculate total frames to avoid floating point precision issues
  const totalFrames = Math.round(seconds * fps);
  
  // Calculate time components from total frames
  const framesPerHour = fps * 3600;
  const framesPerMinute = fps * 60;
  
  const hours = Math.floor(totalFrames / framesPerHour);
  const remainingAfterHours = totalFrames % framesPerHour;
  const minutes = Math.floor(remainingAfterHours / framesPerMinute);
  const remainingAfterMinutes = remainingAfterHours % framesPerMinute;
  const secs = Math.floor(remainingAfterMinutes / fps);
  const frames = remainingAfterMinutes % fps;

  const pad = (num: number, length: number = 2): string => 
    num.toString().padStart(length, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
};

