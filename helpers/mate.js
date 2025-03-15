// helpers/mate.js
import { Plane, Transformation } from "replicad";
import { getFaceNormal, getFaceCenter, findMatchingFaces } from "./boundingBox.js";
import { findPerpendicularVector } from "./math.js";
import { cast } from "replicad";

// Create a coordinate system for a bounding box face
function createFacePlane(boundingBox, face) {
  // Get the center point of the face
  const center = getFaceCenter(boundingBox, face);
  
  // Get the normal vector of the face
  const normal = getFaceNormal(face);
  
  // Generate a consistent X-axis direction
  const xAxis = findPerpendicularVector(normal);
  
  // Create and return a plane
  return new Plane(center, xAxis, normal);
}

/**
 * Apply a mate constraint between two models
 * @param {Object} fixedModel - Model that stays fixed
 * @param {string} fixedFace - Face identifier for fixed model
 * @param {Object} movingModel - Model to be moved
 * @param {string} movingFace - Face identifier for moving model
 * @returns {Object} Transformed moving model
 */
export function mateBoundingBoxFaces(fixedModel, fixedFace, movingModel, movingFace) {
  // Create coordinate systems for each face
  const fixedPlane = createFacePlane(fixedModel.boundingBox, fixedFace);
  const movingPlane = createFacePlane(movingModel.boundingBox, movingFace);
  
  // When mating faces, we want their normals to point in opposite directions
  // Create an inverted coordinate system for the moving face
  const invertedMovingPlane = new Plane(
    movingPlane.origin,
    movingPlane.xDir,
    movingPlane.zDir.multiply(-1)
  );
  
  // Create a transformation from the moving face's coordinate system to the fixed face's
  const transformation = new Transformation();
  transformation.coordSystemChange(
    {
      origin: invertedMovingPlane.origin,
      zDir: invertedMovingPlane.zDir,
      xDir: invertedMovingPlane.xDir
    },
    {
      origin: fixedPlane.origin,
      zDir: fixedPlane.zDir,
      xDir: fixedPlane.xDir
    }
  );
  
  // Apply the transformation to the moving model
  const transformedShape = transformation.transform(movingModel.wrapped);
  const transformedModel = cast(transformedShape);
  
  // Clean up
  fixedPlane.delete();
  movingPlane.delete();
  invertedMovingPlane.delete();
  transformation.delete();
  
  return transformedModel;
}


/**
 * Offset a mated model by a specified distance along the normal
 * @param {Object} model - The mated model
 * @param {string} face - The face that was mated
 * @param {number} distance - Distance to offset
 * @param {string} fixedFace - The face of the fixed model that was used for mating
 * @returns {Object} Offset model
 */
export function offsetMatedModel(model, face, distance, fixedFace) {
  // Use the fixed model's face normal for consistent behavior
  const fixedNormal = getFaceNormal(fixedFace);
  
  // Offset in the direction of the fixed normal for positive distances
  // This ensures consistent behavior regardless of which faces are mated
  const offsetVector = fixedNormal.multiply(distance);
  
  const offsetModel = model.translate([
    offsetVector.x,
    offsetVector.y,
    offsetVector.z
  ]);
  
  return offsetModel;
}