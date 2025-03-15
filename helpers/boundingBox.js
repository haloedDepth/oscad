// helpers/boundingBox.js
import { Vector } from "replicad";

/**
 * Constants for bounding box face identifiers
 */
export const FACES = {
  FRONT: "front",   // -Y
  BACK: "back",     // +Y
  LEFT: "left",     // -X
  RIGHT: "right",   // +X
  TOP: "top",       // +Z
  BOTTOM: "bottom", // -Z
};

/**
 * Get the normal vector for a specific face of a bounding box
 * @param {string} face - Face identifier (one of FACES constants)
 * @returns {Vector} Normal vector for the face
 */
export function getFaceNormal(face) {
  let normal;
  switch (face) {
    case FACES.FRONT: normal = new Vector([0, -1, 0]); break;
    case FACES.BACK: normal = new Vector([0, 1, 0]); break;
    case FACES.LEFT: normal = new Vector([-1, 0, 0]); break;
    case FACES.RIGHT: normal = new Vector([1, 0, 0]); break;
    case FACES.TOP: normal = new Vector([0, 0, 1]); break;
    case FACES.BOTTOM: normal = new Vector([0, 0, -1]); break;
    default: 
      throw new Error(`Unknown face identifier: ${face}`);
  }
  
  return normal;
}

/**
 * Get the face identifier based on a normal vector
 * @param {Vector} normal - Normal vector
 * @returns {string} Face identifier (one of FACES constants)
 */
export function getFaceFromNormal(normal) {
  const norm = normal.normalized();
  const x = norm.x;
  const y = norm.y;
  const z = norm.z;
  
  let result;
  if (Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(z)) {
    result = x > 0 ? FACES.RIGHT : FACES.LEFT;
  } else if (Math.abs(y) > Math.abs(x) && Math.abs(y) > Math.abs(z)) {
    result = y > 0 ? FACES.BACK : FACES.FRONT;
  } else {
    result = z > 0 ? FACES.TOP : FACES.BOTTOM;
  }
  
  return result;
}

/**
 * Get the center point of a specific face of a bounding box
 * @param {BoundingBox} boundingBox - The bounding box
 * @param {string} face - Face identifier (one of FACES constants)
 * @returns {Vector} Center point of the face
 */
export function getFaceCenter(boundingBox, face) {
  const [[xmin, ymin, zmin], [xmax, ymax, zmax]] = boundingBox.bounds;
  const center = boundingBox.center;
  
  let faceCenter;
  switch (face) {
    case FACES.FRONT: faceCenter = new Vector([center[0], ymin, center[2]]); break;
    case FACES.BACK: faceCenter = new Vector([center[0], ymax, center[2]]); break;
    case FACES.LEFT: faceCenter = new Vector([xmin, center[1], center[2]]); break;
    case FACES.RIGHT: faceCenter = new Vector([xmax, center[1], center[2]]); break;
    case FACES.TOP: faceCenter = new Vector([center[0], center[1], zmax]); break;
    case FACES.BOTTOM: faceCenter = new Vector([center[0], center[1], zmin]); break;
    default: 
      throw new Error(`Unknown face identifier: ${face}`);
  }
  
  return faceCenter;
}

/**
 * Find the best matching face between two bounding boxes
 * @param {BoundingBox} box1 - First bounding box
 * @param {BoundingBox} box2 - Second bounding box
 * @param {boolean} preferLarger - Prefer larger faces if true
 * @returns {Object} The best matching pair of faces { face1, face2 }
 */
export function findMatchingFaces(box1, box2, preferLarger = true) {
  const faces = Object.values(FACES);
  
  // Find the best matching pair (with opposite normals)
  for (const face1 of faces) {
    const normal1 = getFaceNormal(face1);
    
    for (const face2 of faces) {
      const normal2 = getFaceNormal(face2);
      
      // Check if normals are approximately in opposite directions
      const areAntiParallel = Math.abs(normal1.dot(normal2) + 1) < 1e-10;
      
      if (areAntiParallel) {
        normal1.delete();
        normal2.delete();
        return { face1, face2 };
      }
      
      normal2.delete();
    }
    
    normal1.delete();
  }
  
  // If no matching pair found, default to largest faces
  return {
    face1: FACES.FRONT,
    face2: FACES.FRONT
  };
}