/**
 * Centralized units and scale management system
 * All geometry inputs are in mm, consistently mapped to viewer world units
 */

// Constants
export const MM_PER_INCH = 25.4;

// Default world scale (1mm = 0.01 world units)
let worldScale = 0.01;

/**
 * Set the world scale factor
 * @param {number} scale - New scale factor (e.g., 0.01 means 1mm = 0.01 world units)
 */
export function setWorldScale(scale) {
  if (typeof scale === 'number' && scale > 0) {
    worldScale = scale;
  }
}

/**
 * Get the current world scale factor
 * @returns {number} Current world scale
 */
export function getWorldScale() {
  return worldScale;
}

/**
 * Convert millimeters to world units
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in world units
 */
export function mmToWorld(mm) {
  return mm * worldScale;
}

/**
 * Convert world units to millimeters
 * @param {number} world - Value in world units
 * @returns {number} Value in millimeters
 */
export function worldToMm(world) {
  return world / worldScale;
}

/**
 * Convert inches to millimeters
 * @param {number} inches - Value in inches
 * @returns {number} Value in millimeters
 */
export function inToMm(inches) {
  return inches * MM_PER_INCH;
}

/**
 * Convert millimeters to inches
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in inches
 */
export function mmToIn(mm) {
  return mm / MM_PER_INCH;
}

/**
 * Convert a value based on current units to millimeters
 * @param {number} value - The value to convert
 * @param {'mm'|'inch'} units - The units of the input value
 * @returns {number} Value in millimeters
 */
export function toMm(value, units) {
  return units === 'inch' ? inToMm(value) : value;
}

/**
 * Convert millimeters to a value in the specified units
 * @param {number} mm - Value in millimeters
 * @param {'mm'|'inch'} units - The target units
 * @returns {number} Value in target units
 */
export function fromMm(mm, units) {
  return units === 'inch' ? mmToIn(mm) : mm;
}