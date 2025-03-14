// helpers/math.js
import { Vector } from "replicad";

/**
 * Calculate the angle between two vectors
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @returns {number} Angle in degrees
 */
export function angleBetweenVectors(v1, v2) {
  console.log(`[DEBUG] angleBetweenVectors - v1: [${v1.x}, ${v1.y}, ${v1.z}], v2: [${v2.x}, ${v2.y}, ${v2.z}]`);
  
  const angle = v1.getAngle(v2);
  console.log(`[DEBUG] angleBetweenVectors - Calculated angle: ${angle} degrees`);
  
  return angle;
}

/**
 * Calculate the rotation axis to align vector v1 with vector v2
 * @param {Vector} v1 - Vector to rotate
 * @param {Vector} v2 - Target vector
 * @returns {Vector} Rotation axis
 */
export function calculateRotationAxis(v1, v2) {
  console.log(`[DEBUG] calculateRotationAxis - v1: [${v1.x}, ${v1.y}, ${v1.z}], v2: [${v2.x}, ${v2.y}, ${v2.z}]`);
  
  const crossProduct = v1.cross(v2);
  console.log(`[DEBUG] calculateRotationAxis - Cross product before normalization: [${crossProduct.x}, ${crossProduct.y}, ${crossProduct.z}], length: ${crossProduct.Length}`);
  
  const normalized = crossProduct.normalized();
  console.log(`[DEBUG] calculateRotationAxis - Normalized rotation axis: [${normalized.x}, ${normalized.y}, ${normalized.z}], length: ${normalized.Length}`);
  
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
  console.log(`[DEBUG] areVectorsParallel - v1: [${v1.x}, ${v1.y}, ${v1.z}], v2: [${v2.x}, ${v2.y}, ${v2.z}], tolerance: ${tolerance}`);
  
  const n1 = v1.normalized();
  const n2 = v2.normalized();
  console.log(`[DEBUG] areVectorsParallel - Normalized v1: [${n1.x}, ${n1.y}, ${n1.z}]`);
  console.log(`[DEBUG] areVectorsParallel - Normalized v2: [${n2.x}, ${n2.y}, ${n2.z}]`);
  
  const crossProduct = n1.cross(n2);
  const crossLength = crossProduct.Length;
  console.log(`[DEBUG] areVectorsParallel - Cross product: [${crossProduct.x}, ${crossProduct.y}, ${crossProduct.z}], length: ${crossLength}`);
  
  const isParallel = crossLength < tolerance;
  console.log(`[DEBUG] areVectorsParallel - Is parallel: ${isParallel}`);
  
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
  console.log(`[DEBUG] areVectorsAntiParallel - v1: [${v1.x}, ${v1.y}, ${v1.z}], v2: [${v2.x}, ${v2.y}, ${v2.z}], tolerance: ${tolerance}`);
  
  const n1 = v1.normalized();
  const n2 = v2.normalized();
  console.log(`[DEBUG] areVectorsAntiParallel - Normalized v1: [${n1.x}, ${n1.y}, ${n1.z}]`);
  console.log(`[DEBUG] areVectorsAntiParallel - Normalized v2: [${n2.x}, ${n2.y}, ${n2.z}]`);
  
  const dot = n1.dot(n2);
  console.log(`[DEBUG] areVectorsAntiParallel - Dot product: ${dot}`);
  
  const isParallel = areVectorsParallel(v1, v2, tolerance);
  console.log(`[DEBUG] areVectorsAntiParallel - Is parallel: ${isParallel}`);
  
  const isAntiParallel = isParallel && dot < 0;
  console.log(`[DEBUG] areVectorsAntiParallel - Is anti-parallel: ${isAntiParallel}`);
  
  return isAntiParallel;
}

/**
 * Project a vector onto a plane defined by a normal
 * @param {Vector} vector - Vector to project
 * @param {Vector} planeNormal - Normal vector of the plane
 * @returns {Vector} Projected vector
 */
export function projectVectorOntoPlane(vector, planeNormal) {
  console.log(`[DEBUG] projectVectorOntoPlane - vector: [${vector.x}, ${vector.y}, ${vector.z}], planeNormal: [${planeNormal.x}, ${planeNormal.y}, ${planeNormal.z}]`);
  
  const normal = planeNormal.normalized();
  console.log(`[DEBUG] projectVectorOntoPlane - Normalized normal: [${normal.x}, ${normal.y}, ${normal.z}]`);
  
  const dotProduct = vector.dot(normal);
  console.log(`[DEBUG] projectVectorOntoPlane - Dot product: ${dotProduct}`);
  
  const projection = normal.multiply(dotProduct);
  console.log(`[DEBUG] projectVectorOntoPlane - Projection along normal: [${projection.x}, ${projection.y}, ${projection.z}]`);
  
  const projectedVector = vector.sub(projection);
  console.log(`[DEBUG] projectVectorOntoPlane - Projected vector: [${projectedVector.x}, ${projectedVector.y}, ${projectedVector.z}]`);
  
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
  console.log(`[DEBUG] distanceToPlane - point: [${point.x}, ${point.y}, ${point.z}]`);
  console.log(`[DEBUG] distanceToPlane - planePoint: [${planePoint.x}, ${planePoint.y}, ${planePoint.z}]`);
  console.log(`[DEBUG] distanceToPlane - planeNormal: [${planeNormal.x}, ${planeNormal.y}, ${planeNormal.z}]`);
  
  const normal = planeNormal.normalized();
  console.log(`[DEBUG] distanceToPlane - Normalized normal: [${normal.x}, ${normal.y}, ${normal.z}]`);
  
  const vectorToPoint = point.sub(planePoint);
  console.log(`[DEBUG] distanceToPlane - Vector from plane point to point: [${vectorToPoint.x}, ${vectorToPoint.y}, ${vectorToPoint.z}]`);
  
  const distance = vectorToPoint.dot(normal);
  console.log(`[DEBUG] distanceToPlane - Calculated distance: ${distance}`);
  
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
  console.log(`[DEBUG] linePlaneIntersection - linePoint: [${linePoint.x}, ${linePoint.y}, ${linePoint.z}]`);
  console.log(`[DEBUG] linePlaneIntersection - lineDirection: [${lineDirection.x}, ${lineDirection.y}, ${lineDirection.z}]`);
  console.log(`[DEBUG] linePlaneIntersection - planePoint: [${planePoint.x}, ${planePoint.y}, ${planePoint.z}]`);
  console.log(`[DEBUG] linePlaneIntersection - planeNormal: [${planeNormal.x}, ${planeNormal.y}, ${planeNormal.z}]`);
  
  const normal = planeNormal.normalized();
  const direction = lineDirection.normalized();
  
  console.log(`[DEBUG] linePlaneIntersection - Normalized normal: [${normal.x}, ${normal.y}, ${normal.z}]`);
  console.log(`[DEBUG] linePlaneIntersection - Normalized direction: [${direction.x}, ${direction.y}, ${direction.z}]`);
  
  const denominator = direction.dot(normal);
  console.log(`[DEBUG] linePlaneIntersection - Denominator (direction·normal): ${denominator}`);
  
  // Check if line is parallel to plane
  if (Math.abs(denominator) < 1e-10) {
    console.log(`[DEBUG] linePlaneIntersection - Line is parallel to plane (denominator too small)`);
    return null;
  }
  
  const planeToLine = planePoint.sub(linePoint);
  console.log(`[DEBUG] linePlaneIntersection - Vector from line point to plane point: [${planeToLine.x}, ${planeToLine.y}, ${planeToLine.z}]`);
  
  const t = planeToLine.dot(normal) / denominator;
  console.log(`[DEBUG] linePlaneIntersection - Parameter t: ${t}`);
  
  const intersectionPoint = linePoint.add(direction.multiply(t));
  console.log(`[DEBUG] linePlaneIntersection - Intersection point: [${intersectionPoint.x}, ${intersectionPoint.y}, ${intersectionPoint.z}]`);
  
  return intersectionPoint;
}