// helpers/math.js
import { Vector } from "replicad";

/**
 * Calculate the angle between two vectors
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @returns {number} Angle in degrees
 */
export function angleBetweenVectors(v1, v2) {
  return v1.getAngle(v2);
}

/**
 * Calculate the rotation axis to align vector v1 with vector v2
 * @param {Vector} v1 - Vector to rotate
 * @param {Vector} v2 - Target vector
 * @returns {Vector} Rotation axis
 */
export function calculateRotationAxis(v1, v2) {
  return v1.cross(v2).normalized();
}

/**
 * Check if two vectors are approximately parallel
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @param {number} tolerance - Tolerance for dot product comparison
 * @returns {boolean} True if vectors are parallel
 */
export function areVectorsParallel(v1, v2, tolerance = 1e-10) {
  const n1 = v1.normalized();
  const n2 = v2.normalized();
  const crossLength = n1.cross(n2).Length;
  return crossLength < tolerance;
}

/**
 * Check if two vectors are approximately anti-parallel
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @param {number} tolerance - Tolerance for dot product comparison
 * @returns {boolean} True if vectors are anti-parallel
 */
export function areVectorsAntiParallel(v1, v2, tolerance = 1e-10) {
  const n1 = v1.normalized();
  const n2 = v2.normalized();
  const dot = n1.dot(n2);
  return areVectorsParallel(v1, v2, tolerance) && dot < 0;
}

/**
 * Project a vector onto a plane defined by a normal
 * @param {Vector} vector - Vector to project
 * @param {Vector} planeNormal - Normal vector of the plane
 * @returns {Vector} Projected vector
 */
export function projectVectorOntoPlane(vector, planeNormal) {
  const normal = planeNormal.normalized();
  const projection = normal.multiply(vector.dot(normal));
  return vector.sub(projection);
}

/**
 * Calculate the distance from a point to a plane
 * @param {Vector} point - Point to check
 * @param {Vector} planePoint - Point on the plane
 * @param {Vector} planeNormal - Normal vector of the plane
 * @returns {number} Signed distance to the plane
 */
export function distanceToPlane(point, planePoint, planeNormal) {
  const normal = planeNormal.normalized();
  return point.sub(planePoint).dot(normal);
}

/**
 * Find the intersection point of a line with a plane
 * @param {Vector} linePoint - Point on the line
 * @param {Vector} lineDirection - Direction vector of the line
 * @param {Vector} planePoint - Point on the plane
 * @param {Vector} planeNormal - Normal vector of the plane
 * @returns {Vector|null} Intersection point or null if parallel
 */
export function linePlaneIntersection(linePoint, lineDirection, planePoint, planeNormal) {
  const normal = planeNormal.normalized();
  const direction = lineDirection.normalized();
  
  const denominator = direction.dot(normal);
  
  // Check if line is parallel to plane
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }
  
  const t = planePoint.sub(linePoint).dot(normal) / denominator;
  return linePoint.add(direction.multiply(t));
}