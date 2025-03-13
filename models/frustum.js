// models/frustum.js
import { sketchCircle } from "replicad";

/**
 * Creates a frustum (truncated cone)
 * @param {number} bottomRadius - Radius of the bottom circle
 * @param {number} topRadius - Radius of the top circle
 * @param {number} height - Height of the frustum
 * @param {number} locationX - X coordinate of the bottom center
 * @param {number} locationY - Y coordinate of the bottom center
 * @param {number} locationZ - Z coordinate of the bottom center
 * @param {number} segments - Number of segments for circle approximation
 * @returns {Object} Frustum solid
 */
export function createFrustum(
  bottomRadius = 50, 
  topRadius = 25, 
  height = 100,
  locationX = 0,
  locationY = 0,
  locationZ = 0,
  segments = 32
) {
  // Create bottom circle at the specified location
  const bottomCircle = sketchCircle(bottomRadius, {
    plane: "XY", 
    origin: [locationX, locationY, locationZ]
  });
  
  // Calculate the position of the top circle
  const topLocation = [
    locationX,
    locationY,
    locationZ + height
  ];
  
  // Create top circle
  const topCircle = sketchCircle(topRadius, {
    plane: "XY",
    origin: topLocation
  });
  
  // Loft between circles to create the frustum
  return bottomCircle.loftWith(topCircle, { ruled: true });
}