// helpers/math.js
import { Vector } from "replicad";

/**
 * Calculate the angle between two vectors
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @returns {number} Angle in degrees
 */
export function angleBetweenVectors(v1, v2) {
  const angle = v1.getAngle(v2);
  return angle;
}

/**
 * Find a vector perpendicular to the given vector
 * @param {Vector} vec - Vector to find perpendicular to
 * @returns {Vector} A vector perpendicular to the input vector
 */
export function findPerpendicularVector(vec) {
  const v = vec.normalized();
  
  // Choose the component with the smallest absolute value to set to zero
  const absX = Math.abs(v.x);
  const absY = Math.abs(v.y);
  const absZ = Math.abs(v.z);
  
  let perpendicular;
  
  if (absX <= absY && absX <= absZ) {
    // X is smallest, set it to 0 and swap Y and Z with one negated
    perpendicular = new Vector([0, v.z, -v.y]);
  } else if (absY <= absX && absY <= absZ) {
    // Y is smallest, set it to 0 and swap X and Z with one negated
    perpendicular = new Vector([v.z, 0, -v.x]);
  } else {
    // Z is smallest, set it to 0 and swap X and Y with one negated
    perpendicular = new Vector([v.y, -v.x, 0]);
  }
  
  // Normalize the perpendicular vector
  const result = perpendicular.normalized();
  
  return result;
}

/**
 * Calculate the rotation axis to align vector v1 with vector v2
 * @param {Vector} v1 - Vector to rotate
 * @param {Vector} v2 - Target vector
 * @returns {Vector} Rotation axis
 */
export function calculateRotationAxis(v1, v2) {
  // Check if vectors are parallel (or anti-parallel)
  if (areVectorsParallel(v1, v2)) {
    return findPerpendicularVector(v1);
  }
  
  const crossProduct = v1.cross(v2);
  
  // Check if cross product is too small
  if (crossProduct.Length < 1e-10) {
    return findPerpendicularVector(v1);
  }
  
  const normalized = crossProduct.normalized();
  
  return normalized;
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
  
  const crossProduct = n1.cross(n2);
  const crossLength = crossProduct.Length;
  
  const isParallel = crossLength < tolerance;
  
  return isParallel;
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
  
  const isParallel = areVectorsParallel(v1, v2, tolerance);
  
  const isAntiParallel = isParallel && dot < 0;
  
  return isAntiParallel;
}

/**
 * Project a vector onto a plane defined by a normal
 * @param {Vector} vector - Vector to project
 * @param {Vector} planeNormal - Normal vector of the plane
 * @returns {Vector} Projected vector
 */
export function projectVectorOntoPlane(vector, planeNormal) {
  const normal = planeNormal.normalized();
  
  const dotProduct = vector.dot(normal);
  
  const projection = normal.multiply(dotProduct);
  
  const projectedVector = vector.sub(projection);
  
  return projectedVector;
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
  
  const vectorToPoint = point.sub(planePoint);
  
  const distance = vectorToPoint.dot(normal);
  
  return distance;
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
  
  const planeToLine = planePoint.sub(linePoint);
  
  const t = planeToLine.dot(normal) / denominator;
  
  const intersectionPoint = linePoint.add(direction.multiply(t));
  
  return intersectionPoint;
}