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
 * by making their normals anti-parallel and then translating
 * so the face centers coincide (flush).
 *
 * NOTE: This corrected version omits the extra distance-to-plane
 * "push," because once we rotate around the face center itself,
 * we do NOT need an additional offset for flush alignment.
 */
export function calculateMateTransformation(model1, face1, model2, face2) {
  const box1 = model1.boundingBox;
  const box2 = model2.boundingBox;
  
  // Get face normals
  const normal1 = getFaceNormal(face1);
  const normal2 = getFaceNormal(face2);

  // Decide if we must rotate so that normal2 is anti-parallel to normal1
  let rotationAxis = new Vector([0, 0, 0]);
  let rotationAngle = 0;

  const isAntiParallel = areVectorsAntiParallel(normal1, normal2);
  if (!isAntiParallel) {
    // We want: normal2 --> -normal1
    const targetNormal = normal1.multiply(-1);
    rotationAngle = normal2.getAngle(targetNormal);

    if (Math.abs(rotationAngle) < 1e-10) {
      rotationAxis = new Vector([0, 0, 0]);
      rotationAngle = 0;
    } else if (Math.abs(Math.abs(rotationAngle) - 180) < 1e-10) {
      // For 180-degree rotations, pick any perpendicular axis
      rotationAxis = findPerpendicularVector(normal2);
    } else {
      rotationAxis = normal2.cross(targetNormal);
    }
    targetNormal.delete();
  }

  // Face-center alignment (flush)
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  const translationVector = center1.sub(center2);

  return {
    rotationAxis,
    rotationAngle,
    translationVector
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