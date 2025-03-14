// helpers/mate.js
import { Vector } from "replicad";
import { getFaceNormal, getFaceCenter, findMatchingFaces } from "./boundingBox.js";
import { 
  angleBetweenVectors, 
  calculateRotationAxis, 
  areVectorsAntiParallel,
  distanceToPlane
} from "./math.js";

/**
 * Calculate the transformation needed to align two bounding box faces
 * @param {Object} model1 - Source model
 * @param {string} face1 - Source face identifier
 * @param {Object} model2 - Target model
 * @param {string} face2 - Target face identifier
 * @returns {Object} Transformation parameters { rotationAxis, rotationAngle, translationVector }
 */
export function calculateMateTransformation(model1, face1, model2, face2) {
  const box1 = model1.boundingBox;
  const box2 = model2.boundingBox;
  
  // Get face normals
  const normal1 = getFaceNormal(face1);
  const normal2 = getFaceNormal(face2);
  
  // Calculate rotation to align normals in opposite directions
  let rotationAxis = new Vector([0, 0, 0]);
  let rotationAngle = 0;
  
  if (!areVectorsAntiParallel(normal1, normal2)) {
    // We need to rotate so normal2 is anti-parallel to normal1
    const targetNormal = normal1.multiply(-1);
    rotationAngle = angleBetweenVectors(normal2, targetNormal);
    rotationAxis = calculateRotationAxis(normal2, targetNormal);
  }
  
  // Calculate translation to align face centers
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  
  // Calculate the translation vector
  // Need to offset in the direction of normal1 by the distance between faces
  const translationVector = center1.sub(center2);
  
  // Adjust translation to make faces flush
  const distanceToMove = distanceToPlane(center2, center1, normal1);
  const adjustmentVector = normal1.multiply(distanceToMove);
  
  return {
    rotationAxis,
    rotationAngle,
    translationVector: translationVector.add(adjustmentVector)
  };
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
  const { rotationAxis, rotationAngle, translationVector } = 
    calculateMateTransformation(fixedModel, fixedFace, movingModel, movingFace);
  
  // Apply transformations to movingModel
  let transformedModel = movingModel;
  
  // First rotate if needed
  if (rotationAngle !== 0 && rotationAxis.Length > 1e-10) {
    const center = movingModel.boundingBox.center;
    transformedModel = transformedModel.rotate(
      rotationAngle,
      center,
      rotationAxis
    );
  }
  
  // Then translate
  transformedModel = transformedModel.translate(translationVector);
  
  return transformedModel;
}

/**
 * Automatically find and mate the best matching faces between two models
 * @param {Object} fixedModel - Model that stays fixed
 * @param {Object} movingModel - Model to be moved
 * @param {boolean} preferLarger - Prefer larger faces if true
 * @returns {Object} Transformed moving model
 */
export function autoMateBoundingBoxes(fixedModel, movingModel, preferLarger = true) {
  const box1 = fixedModel.boundingBox;
  const box2 = movingModel.boundingBox;
  
  const { face1, face2 } = findMatchingFaces(box1, box2, preferLarger);
  
  return mateBoundingBoxFaces(fixedModel, face1, movingModel, face2);
}

/**
 * Offset a mated model by a specified distance along the normal
 * @param {Object} model - The mated model
 * @param {string} face - The face that was mated
 * @param {number} distance - Distance to offset
 * @returns {Object} Offset model
 */
export function offsetMatedModel(model, face, distance) {
  const normal = getFaceNormal(face).multiply(-1); // Move away from the face
  return model.translate([
    normal.x * distance,
    normal.y * distance,
    normal.z * distance
  ]);
}

/**
 * Check if two models' faces are already mated
 * @param {Object} model1 - First model
 * @param {string} face1 - Face identifier for first model
 * @param {Object} model2 - Second model
 * @param {string} face2 - Face identifier for second model
 * @param {number} tolerance - Distance tolerance
 * @returns {boolean} True if faces are mated
 */
export function areFacesMated(model1, face1, model2, face2, tolerance = 1e-9) {
  const box1 = model1.boundingBox;
  const box2 = model2.boundingBox;
  
  // Get face normals
  const normal1 = getFaceNormal(face1);
  const normal2 = getFaceNormal(face2);
  
  // Check if normals are anti-parallel
  if (!areVectorsAntiParallel(normal1, normal2)) {
    return false;
  }
  
  // Get face centers
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  
  // Check distance between faces
  const distance = distanceToPlane(center2, center1, normal1);
  
  // Check if faces are aligned
  return Math.abs(distance) < tolerance;
}