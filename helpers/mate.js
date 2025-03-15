// helpers/mate.js
import { Vector } from "replicad";
import { getFaceNormal, getFaceCenter, findMatchingFaces } from "./boundingBox.js";
import { 
  findPerpendicularVector, 
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
  
  const isAntiParallel = areVectorsAntiParallel(normal1, normal2);
  
  if (!isAntiParallel) {
    // We need to rotate so normal2 is anti-parallel to normal1
    const targetNormal = normal1.multiply(-1);
    
    rotationAngle = normal2.getAngle(targetNormal);
    
    if (Math.abs(rotationAngle) < 1e-10) {
      rotationAxis = new Vector([0, 0, 0]);
      rotationAngle = 0;
    } else if (Math.abs(Math.abs(rotationAngle) - 180) < 1e-10) {
      // For 180-degree rotations, we need a perpendicular axis
      rotationAxis = findPerpendicularVector(normal2);
    } else {
      rotationAxis = normal2.cross(targetNormal);
    }
  }
  
  // Calculate translation to align face centers
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  
  // Calculate the translation vector to align centers
  const translationVector = center1.sub(center2);
  
  // Calculate the distance between faces to make them flush
  const distanceToMove = distanceToPlane(center2, center1, normal1);
  
  // Critical fix: Reverse the sign of distanceToMove for proper face alignment
  // This is the key fix that resolves the issue of objects being buried
  const adjustmentVector = normal1.multiply(-distanceToMove);
  
  const finalTranslationVector = translationVector.add(adjustmentVector);
  
  return {
    rotationAxis,
    rotationAngle,
    translationVector: finalTranslationVector
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
  
  let transformedModel = movingModel;
  
  if (rotationAngle !== 0 && rotationAxis.Length > 1e-10) {
    // Get moving face's center before transformations
    const movingFaceCenter = getFaceCenter(movingModel.boundingBox, movingFace);
    
    transformedModel = transformedModel.rotate(
      rotationAngle,
      [movingFaceCenter.x, movingFaceCenter.y, movingFaceCenter.z],
      [rotationAxis.x, rotationAxis.y, rotationAxis.z]
    );
  }
  
  transformedModel = transformedModel.translate([
    translationVector.x,
    translationVector.y,
    translationVector.z
  ]);
  
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