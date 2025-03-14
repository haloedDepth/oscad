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
 * Get the vertices of a specific face of a bounding box
 * @param {BoundingBox} boundingBox - The bounding box
 * @param {string} face - Face identifier (one of FACES constants)
 * @returns {Array<Vector>} Array of 4 vertices defining the face, in counter-clockwise order
 */
export function getFaceVertices(boundingBox, face) {
  const [[xmin, ymin, zmin], [xmax, ymax, zmax]] = boundingBox.bounds;
  
  let vertices;
  switch (face) {
    case FACES.FRONT:
      vertices = [
        new Vector([xmin, ymin, zmin]),
        new Vector([xmax, ymin, zmin]),
        new Vector([xmax, ymin, zmax]),
        new Vector([xmin, ymin, zmax]),
      ];
      break;
    case FACES.BACK:
      vertices = [
        new Vector([xmin, ymax, zmin]),
        new Vector([xmin, ymax, zmax]),
        new Vector([xmax, ymax, zmax]),
        new Vector([xmax, ymax, zmin]),
      ];
      break;
    case FACES.LEFT:
      vertices = [
        new Vector([xmin, ymin, zmin]),
        new Vector([xmin, ymin, zmax]),
        new Vector([xmin, ymax, zmax]),
        new Vector([xmin, ymax, zmin]),
      ];
      break;
    case FACES.RIGHT:
      vertices = [
        new Vector([xmax, ymin, zmin]),
        new Vector([xmax, ymax, zmin]),
        new Vector([xmax, ymax, zmax]),
        new Vector([xmax, ymin, zmax]),
      ];
      break;
    case FACES.TOP:
      vertices = [
        new Vector([xmin, ymin, zmax]),
        new Vector([xmax, ymin, zmax]),
        new Vector([xmax, ymax, zmax]),
        new Vector([xmin, ymax, zmax]),
      ];
      break;
    case FACES.BOTTOM:
      vertices = [
        new Vector([xmin, ymin, zmin]),
        new Vector([xmin, ymax, zmin]),
        new Vector([xmax, ymax, zmin]),
        new Vector([xmax, ymin, zmin]),
      ];
      break;
    default: 
      throw new Error(`Unknown face identifier: ${face}`);
  }
  
  return vertices;
}

/**
 * Get all faces of a bounding box
 * @param {BoundingBox} boundingBox - The bounding box
 * @returns {Object} Object mapping face identifiers to arrays of vertices
 */
export function getAllFaces(boundingBox) {
  const faces = {
    [FACES.FRONT]: getFaceVertices(boundingBox, FACES.FRONT),
    [FACES.BACK]: getFaceVertices(boundingBox, FACES.BACK),
    [FACES.LEFT]: getFaceVertices(boundingBox, FACES.LEFT),
    [FACES.RIGHT]: getFaceVertices(boundingBox, FACES.RIGHT),
    [FACES.TOP]: getFaceVertices(boundingBox, FACES.TOP),
    [FACES.BOTTOM]: getFaceVertices(boundingBox, FACES.BOTTOM),
  };
  
  return faces;
}

/**
 * Calculate the area of a bounding box face
 * @param {BoundingBox} boundingBox - The bounding box
 * @param {string} face - Face identifier (one of FACES constants)
 * @returns {number} Area of the face
 */
export function getFaceArea(boundingBox, face) {
  const [[xmin, ymin, zmin], [xmax, ymax, zmax]] = boundingBox.bounds;
  const width = xmax - xmin;
  const height = ymax - ymin;
  const depth = zmax - zmin;
  
  let area;
  switch (face) {
    case FACES.FRONT:
    case FACES.BACK:
      area = width * depth;
      break;
    case FACES.LEFT:
    case FACES.RIGHT:
      area = height * depth;
      break;
    case FACES.TOP:
    case FACES.BOTTOM:
      area = width * height;
      break;
    default: 
      throw new Error(`Unknown face identifier: ${face}`);
  }
  
  return area;
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
  const faceAreas1 = faces.map(face => {
    const area = getFaceArea(box1, face);
    return { face, area };
  });
  
  const faceAreas2 = faces.map(face => {
    const area = getFaceArea(box2, face);
    return { face, area };
  });
  
  if (preferLarger) {
    // Sort by area, largest first
    faceAreas1.sort((a, b) => b.area - a.area);
    faceAreas2.sort((a, b) => b.area - a.area);
  }
  
  // Find the best matching pair (with opposite normals)
  for (const { face: face1 } of faceAreas1) {
    const normal1 = getFaceNormal(face1);
    
    for (const { face: face2 } of faceAreas2) {
      const normal2 = getFaceNormal(face2);
      
      // Check if normals are approximately in opposite directions
      const antiParallel = areVectorsAntiParallel(normal1, normal2);
      
      if (antiParallel) {
        return { face1, face2 };
      }
    }
  }
  
  // If no matching pair found, default to largest faces
  const result = {
    face1: faceAreas1[0].face,
    face2: faceAreas2[0].face
  };
  
  return result;
}

/**
 * Check if two vectors are approximately anti-parallel
 * @param {Vector} v1 - First vector
 * @param {Vector} v2 - Second vector
 * @param {number} tolerance - Tolerance angle in degrees
 * @returns {boolean} True if vectors are anti-parallel
 */
function areVectorsAntiParallel(v1, v2, tolerance = 1e-10) {
  const n1 = v1.normalized();
  const n2 = v2.normalized();
  
  const dot = n1.dot(n2);
  
  const isAntiParallel = Math.abs(dot + 1) < tolerance;
  
  return isAntiParallel;
}