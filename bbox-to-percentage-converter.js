/**
 * Converts bounding box from pixel format to percentage format
 * 
 * @param {Array<number>} bbox - Bounding box in pixels [x1, y1, x2, y2] or [left, top, right, bottom]
 * @param {number} imageWidth - Width of the source image/video in pixels
 * @param {number} imageHeight - Height of the source image/video in pixels
 * @returns {Object} Percentage-based coordinates {xPct, yPct, wPct, hPct, type: "CPct"}
 */
function convertBboxToPercentage(bbox, imageWidth, imageHeight) {
  // Extract coordinates from bbox array
  const [x1, y1, x2, y2] = bbox;
  
  // Calculate width and height in pixels
  const widthPx = x2 - x1;
  const heightPx = y2 - y1;
  
  // Convert to percentages (0.0 to 1.0)
  const xPct = x1 / imageWidth;
  const yPct = y1 / imageHeight;
  const wPct = widthPx / imageWidth;
  const hPct = heightPx / imageHeight;
  
  return {
    type: "CPct",
    xPct: xPct,
    yPct: yPct,
    wPct: wPct,
    hPct: hPct
  };
}

/**
 * Example usage with your data
 */
function example() {
  // Your bbox data
  const bbox = [385, 175, 491, 300];
  
  // You need to know the image/video dimensions
  // Example: if your image is 1920x1080 (common video resolution)
  const imageWidth = 1920;
  const imageHeight = 1080;
  
  const result = convertBboxToPercentage(bbox, imageWidth, imageHeight);
  
  console.log("Input bbox (pixels):", bbox);
  console.log("Image dimensions:", `${imageWidth}x${imageHeight}`);
  console.log("Output (percentage):", result);
  
  // Result will be:
  // {
  //   type: "CPct",
  //   xPct: 0.20052083333333334,  // 385 / 1920
  //   yPct: 0.16203703703703703,  // 175 / 1080
  //   wPct: 0.055208333333333336, // (491-385) / 1920 = 106/1920
  //   hPct: 0.11574074074074074   // (300-175) / 1080 = 125/1080
  // }
  
  return result;
}

/**
 * Alternative: If bbox is in [centerX, centerY, width, height] format
 */
function convertBboxCenterToPercentage(bbox, imageWidth, imageHeight) {
  const [centerX, centerY, width, height] = bbox;
  
  // Convert center + size to top-left + size
  const x1 = centerX - (width / 2);
  const y1 = centerY - (height / 2);
  
  const xPct = x1 / imageWidth;
  const yPct = y1 / imageHeight;
  const wPct = width / imageWidth;
  const hPct = height / imageHeight;
  
  return {
    type: "CPct",
    xPct: xPct,
    yPct: yPct,
    wPct: wPct,
    hPct: hPct
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertBboxToPercentage,
    convertBboxCenterToPercentage
  };
}
