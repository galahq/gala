/* @flow */

/**
 * Converts a hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns {Object} RGB object with r, g, b properties
 */
function hexToRgb (hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Determines the most accessible text color (black or white) for a given background color
 * Uses the brightness formula: (R * 299 + G * 587 + B * 114) / 1000
 * Returns white text for dark backgrounds, black text for light backgrounds
 * @param {string} fillColor - Hex color string for the background
 * @returns {string} "#000000" for black text or "#ffffff" for white text
 */
export function getAccessibleTextColor (fillColor: string): string {
  const rgb = hexToRgb(fillColor)
  if (!rgb) {
    // Default to black text if hex parsing fails
    return '#000000'
  }

  // Calculate brightness using standard luminance formula
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000

  // Return white text for dark backgrounds, black text for light backgrounds
  return brightness > 128 ? '#000000' : '#ffffff'
}
