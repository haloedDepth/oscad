// helpers/math.js
import { Vector } from "replicad";

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