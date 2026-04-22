/**
 * shared/utils/math.js
 * Common math helpers used across games.
 * Pure functions — no framework dependency, easy to port to Unity C#.
 */

/**
 * Clamp a value between min and max.
 * Unity equivalent: Mathf.Clamp(value, min, max)
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between a and b by t (0..1).
 * Unity equivalent: Mathf.Lerp(a, b, t)
 */
function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Convert degrees to radians.
 * Unity equivalent: Mathf.Deg2Rad * degrees
 */
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * Unity equivalent: Mathf.Rad2Deg * radians
 */
function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Return a random integer in [min, max] inclusive.
 * Unity equivalent: Random.Range(min, max + 1)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a random float in [min, max).
 * Unity equivalent: Random.Range(min, max)
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 2D distance between two points.
 * Unity equivalent: Vector2.Distance(a, b)
 */
function distance2D(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}
