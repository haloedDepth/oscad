// helpers/mate.js
import { Transformation, Vector, cast } from "replicad";
import { getFaceNormal, getFaceCenter, findMatchingFaces } from "./boundingBox.js";
import { findPerpendicularVector } from "./math.js";

/**
 * Apply a mate constraint between two models using direct transformation
 * @param {Object} fixedModel - Model that stays fixed
 * @param {string} fixedFace - Face identifier for fixed model
 * @param {Object} movingModel - Model to be moved
 * @param {string} movingFace - Face identifier for moving model
 * @returns {Object} Transformed moving model
 */
export function mateBoundingBoxFaces(fixedModel, fixedFace, movingModel, movingFace) {
  const box1 = fixedModel.boundingBox;
  const box2 = movingModel.boundingBox;
  
  // Get face normals and centers
  const normal1 = getFaceNormal(fixedFace);
  const normal2 = getFaceNormal(movingFace);
  const center1 = getFaceCenter(box1, fixedFace);
  const center2 = getFaceCenter(box2, movingFace);
  
  // Create perpendicular vectors for xDir
  const xDir1 = findPerpendicularVector(normal1);
  const xDir2 = findPerpendicularVector(normal2);
  
  // Create a transformation
  const transformation = new Transformation();
  transformation.coordSystemChange(
    {
      origin: center2.toTuple(),
      zDir: normal2.toTuple(),
      xDir: xDir2.toTuple()
    },
    {
      origin: center1.toTuple(),
      zDir: [-normal1.x, -normal1.y, -normal1.z],
      xDir: xDir1.toTuple()
    }
  );
  
  // This is the correct way to transform a shape
  const transformed = cast(transformation.transform(movingModel.wrapped));
  
  // Clean up
  transformation.delete();
  xDir1.delete();
  xDir2.delete();
  normal1.delete();
  normal2.delete();
  center1.delete();
  center2.delete();
  
  return transformed;
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
  const fixedNormal = getFaceNormal(fixedFace);
  
  // No need for transformation object for simple translation
  // Use the shape's built-in translation method instead
  const transformedModel = model.translate([
    fixedNormal.x * distance,
    fixedNormal.y * distance,
    fixedNormal.z * distance
  ]);
  
  // Clean up
  fixedNormal.delete();
  
  return transformedModel;
}