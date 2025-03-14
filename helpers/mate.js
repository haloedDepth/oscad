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
  console.log(`[DEBUG] calculateMateTransformation - model1 id: ${model1.id || 'unknown'}, face1: ${face1}`);
  console.log(`[DEBUG] calculateMateTransformation - model2 id: ${model2.id || 'unknown'}, face2: ${face2}`);
  
  const box1 = model1.boundingBox;
  const box2 = model2.boundingBox;
  
  console.log(`[DEBUG] calculateMateTransformation - box1 bounds: ${JSON.stringify(box1.bounds)}`);
  console.log(`[DEBUG] calculateMateTransformation - box2 bounds: ${JSON.stringify(box2.bounds)}`);
  console.log(`[DEBUG] calculateMateTransformation - box1 center: ${JSON.stringify(box1.center)}`);
  console.log(`[DEBUG] calculateMateTransformation - box2 center: ${JSON.stringify(box2.center)}`);
  
  // Get face normals
  const normal1 = getFaceNormal(face1);
  const normal2 = getFaceNormal(face2);
  
  console.log(`[DEBUG] calculateMateTransformation - normal1: [${normal1.x}, ${normal1.y}, ${normal1.z}]`);
  console.log(`[DEBUG] calculateMateTransformation - normal2: [${normal2.x}, ${normal2.y}, ${normal2.z}]`);
  
  // Calculate rotation to align normals in opposite directions
  let rotationAxis = new Vector([0, 0, 0]);
  let rotationAngle = 0;
  
  const isAntiParallel = areVectorsAntiParallel(normal1, normal2);
  console.log(`[DEBUG] calculateMateTransformation - Normals are anti-parallel: ${isAntiParallel}`);
  
  if (!isAntiParallel) {
    // We need to rotate so normal2 is anti-parallel to normal1
    const targetNormal = normal1.multiply(-1);
    console.log(`[DEBUG] calculateMateTransformation - Target normal: [${targetNormal.x}, ${targetNormal.y}, ${targetNormal.z}]`);
    
    rotationAngle = angleBetweenVectors(normal2, targetNormal);
    console.log(`[DEBUG] calculateMateTransformation - Rotation angle: ${rotationAngle} degrees`);
    
    rotationAxis = calculateRotationAxis(normal2, targetNormal);
    console.log(`[DEBUG] calculateMateTransformation - Rotation axis: [${rotationAxis.x}, ${rotationAxis.y}, ${rotationAxis.z}], length: ${rotationAxis.Length}`);
    
    // Check if rotation axis is valid (non-zero length)
    if (rotationAxis.Length < 1e-10) {
      console.warn(`[WARN] calculateMateTransformation - Rotation axis has zero length! This happens with parallel normals in same direction.`);
    }
  }
  
  // Calculate translation to align face centers
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  
  console.log(`[DEBUG] calculateMateTransformation - center1: [${center1.x}, ${center1.y}, ${center1.z}]`);
  console.log(`[DEBUG] calculateMateTransformation - center2: [${center2.x}, ${center2.y}, ${center2.z}]`);
  
  // Calculate the translation vector
  // Need to offset in the direction of normal1 by the distance between faces
  const translationVector = center1.sub(center2);
  
  console.log(`[DEBUG] calculateMateTransformation - initial translation vector: [${translationVector.x}, ${translationVector.y}, ${translationVector.z}]`);
  
  // Adjust translation to make faces flush
  const distanceToMove = distanceToPlane(center2, center1, normal1);
  console.log(`[DEBUG] calculateMateTransformation - distance to move: ${distanceToMove}`);
  
  const adjustmentVector = normal1.multiply(distanceToMove);
  console.log(`[DEBUG] calculateMateTransformation - adjustment vector: [${adjustmentVector.x}, ${adjustmentVector.y}, ${adjustmentVector.z}]`);
  
  const finalTranslationVector = translationVector.add(adjustmentVector);
  console.log(`[DEBUG] calculateMateTransformation - final translation vector: [${finalTranslationVector.x}, ${finalTranslationVector.y}, ${finalTranslationVector.z}]`);
  
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
  console.log(`[DEBUG] mateBoundingBoxFaces - fixedModel id: ${fixedModel.id || 'unknown'}, fixedFace: ${fixedFace}`);
  console.log(`[DEBUG] mateBoundingBoxFaces - movingModel id: ${movingModel.id || 'unknown'}, movingFace: ${movingFace}`);
  console.log(`[DEBUG] mateBoundingBoxFaces - fixedModel bounding box: ${JSON.stringify(fixedModel.boundingBox.bounds)}`);
  console.log(`[DEBUG] mateBoundingBoxFaces - movingModel bounding box: ${JSON.stringify(movingModel.boundingBox.bounds)}`);
  
  const { rotationAxis, rotationAngle, translationVector } = 
    calculateMateTransformation(fixedModel, fixedFace, movingModel, movingFace);
  
  console.log(`[DEBUG] mateBoundingBoxFaces - rotationAxis: [${rotationAxis.x}, ${rotationAxis.y}, ${rotationAxis.z}], length: ${rotationAxis.Length}`);
  console.log(`[DEBUG] mateBoundingBoxFaces - rotationAngle: ${rotationAngle}`);
  console.log(`[DEBUG] mateBoundingBoxFaces - translationVector: [${translationVector.x}, ${translationVector.y}, ${translationVector.z}]`);
  
  // Apply transformations to movingModel
  let transformedModel = movingModel;
  
  // First rotate if needed
  if (rotationAngle !== 0 && rotationAxis.Length > 1e-10) {
    console.log(`[DEBUG] mateBoundingBoxFaces - Applying rotation`);
    
    const center = movingModel.boundingBox.center;
    console.log(`[DEBUG] mateBoundingBoxFaces - Rotation center: [${center[0]}, ${center[1]}, ${center[2]}]`);
    
    transformedModel = transformedModel.rotate(
      rotationAngle,
      center,
      [rotationAxis.x, rotationAxis.y, rotationAxis.z]
    );
    
    console.log(`[DEBUG] mateBoundingBoxFaces - After rotation, new bounds: ${JSON.stringify(transformedModel.boundingBox.bounds)}`);
  } else {
    if (rotationAngle !== 0) {
      console.warn(`[WARN] mateBoundingBoxFaces - Rotation SKIPPED because rotation axis is too short: ${rotationAxis.Length}`);
    } else {
      console.log(`[DEBUG] mateBoundingBoxFaces - No rotation needed (angle is 0)`);
    }
  }
  
  // Then translate
  console.log(`[DEBUG] mateBoundingBoxFaces - Applying translation: [${translationVector.x}, ${translationVector.y}, ${translationVector.z}]`);
  
  transformedModel = transformedModel.translate([
    translationVector.x,
    translationVector.y,
    translationVector.z
  ]);
  
  console.log(`[DEBUG] mateBoundingBoxFaces - After translation, new bounds: ${JSON.stringify(transformedModel.boundingBox.bounds)}`);
  
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
  console.log(`[DEBUG] autoMateBoundingBoxes - fixedModel id: ${fixedModel.id || 'unknown'}`);
  console.log(`[DEBUG] autoMateBoundingBoxes - movingModel id: ${movingModel.id || 'unknown'}`);
  console.log(`[DEBUG] autoMateBoundingBoxes - preferLarger: ${preferLarger}`);
  
  const box1 = fixedModel.boundingBox;
  const box2 = movingModel.boundingBox;
  
  const { face1, face2 } = findMatchingFaces(box1, box2, preferLarger);
  
  console.log(`[DEBUG] autoMateBoundingBoxes - Selected faces: face1="${face1}", face2="${face2}"`);
  
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
  console.log(`[DEBUG] offsetMatedModel - model id: ${model.id || 'unknown'}, face: ${face}, distance: ${distance}`);
  console.log(`[DEBUG] offsetMatedModel - model bounding box: ${JSON.stringify(model.boundingBox.bounds)}`);
  
  const normal = getFaceNormal(face).multiply(-1); // Move away from the face
  console.log(`[DEBUG] offsetMatedModel - face normal: [${normal.x}, ${normal.y}, ${normal.z}]`);
  console.log(`[DEBUG] offsetMatedModel - offset vector: [${normal.x * distance}, ${normal.y * distance}, ${normal.z * distance}]`);
  
  const offsetModel = model.translate([
    normal.x * distance,
    normal.y * distance,
    normal.z * distance
  ]);
  
  console.log(`[DEBUG] offsetMatedModel - After offset, new bounds: ${JSON.stringify(offsetModel.boundingBox.bounds)}`);
  
  return offsetModel;
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
  console.log(`[DEBUG] areFacesMated - model1 id: ${model1.id || 'unknown'}, face1: ${face1}`);
  console.log(`[DEBUG] areFacesMated - model2 id: ${model2.id || 'unknown'}, face2: ${face2}`);
  console.log(`[DEBUG] areFacesMated - tolerance: ${tolerance}`);
  
  const box1 = model1.boundingBox;
  const box2 = model2.boundingBox;
  
  // Get face normals
  const normal1 = getFaceNormal(face1);
  const normal2 = getFaceNormal(face2);
  
  console.log(`[DEBUG] areFacesMated - normal1: [${normal1.x}, ${normal1.y}, ${normal1.z}]`);
  console.log(`[DEBUG] areFacesMated - normal2: [${normal2.x}, ${normal2.y}, ${normal2.z}]`);
  
  // Check if normals are anti-parallel
  const isAntiParallel = areVectorsAntiParallel(normal1, normal2);
  console.log(`[DEBUG] areFacesMated - Normals are anti-parallel: ${isAntiParallel}`);
  
  if (!isAntiParallel) {
    console.log(`[DEBUG] areFacesMated - Faces are NOT mated (normals not anti-parallel)`);
    return false;
  }
  
  // Get face centers
  const center1 = getFaceCenter(box1, face1);
  const center2 = getFaceCenter(box2, face2);
  
  console.log(`[DEBUG] areFacesMated - center1: [${center1.x}, ${center1.y}, ${center1.z}]`);
  console.log(`[DEBUG] areFacesMated - center2: [${center2.x}, ${center2.y}, ${center2.z}]`);
  
  // Check distance between faces
  const distance = distanceToPlane(center2, center1, normal1);
  console.log(`[DEBUG] areFacesMated - Distance between faces: ${distance}`);
  
  // Check if faces are aligned
  const aligned = Math.abs(distance) < tolerance;
  console.log(`[DEBUG] areFacesMated - Faces are aligned: ${aligned}`);
  
  return aligned;
}