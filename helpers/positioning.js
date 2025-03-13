// helpers/positioning.js
// Functions for positioning and transforming models

import { Vector, compoundShapes } from "replicad";
import { centerSelector } from './selectors.js';

/**
 * Place models at specified points with orientation
 * @param {Function} modelCreator - Function that creates a model
 * @param {Function} referenceSelector - Function that selects a reference point on the model
 * @param {Array<Object>} pointsWithOrientation - Array of position objects with orientation
 * @returns {Array<Object>} Array of positioned and oriented models
 */
export function placeModelsAtPoints(modelCreator, referenceSelector, pointsWithOrientation) {
  return pointsWithOrientation.map(({ position, direction, orientation }) => {
    const model = modelCreator();
    const refPoint = referenceSelector(model);
    
    // First translate the model to the target position
    let transformedModel = model.translate([
      position[0] - refPoint[0],
      position[1] - refPoint[1],
      position[2] - refPoint[2]
    ]);
    
    // Then rotate to align with the orientation
    const defaultDirection = [0, 0, 1]; // Assuming model's default orientation
    const orientationVec = new Vector(orientation || direction); // Use orientation if provided, otherwise fall back to direction
    
    if (orientationVec.Length > 0) {
      const rotationAxis = new Vector(defaultDirection).cross(orientationVec);
      
      // Only rotate if needed (vectors aren't parallel)
      if (rotationAxis.Length > 1e-10) {
        const angle = new Vector(defaultDirection).getAngle(orientationVec);
        transformedModel = transformedModel.rotate(angle, position, rotationAxis);
      } else if (orientationVec.dot(new Vector(defaultDirection)) < 0) {
        // Vectors are anti-parallel, rotate 180° around any perpendicular axis
        transformedModel = transformedModel.rotate(180, position, [1, 0, 0]);
      }
    }
    
    return transformedModel;
  });
}

/**
 * Creates and positions two models, with the top model placed on the bottom model
 * @param {Object} bottomObject - The bottom model instance
 * @param {Object} topObject - The top model instance
 * @returns {Array} Array containing [bottomObject, positionedTopObject]
 */
export function placeOnTop(bottomObject, topObject) {
  // Get bottom object's bounding box info
  const bottomBounds = bottomObject.boundingBox.bounds;
  const bottomCenter = centerSelector(bottomObject);
  
  // Calculate top center of bottom object's bounding box
  const topCenterOfBottom = [bottomCenter[0], bottomCenter[1], bottomBounds[1][2]];
  
  // Get top object's bounds
  const topBounds = topObject.boundingBox.bounds;
  
  // Calculate bottom center of top object's bounding box
  const topCenter = centerSelector(topObject);
  const bottomCenterOfTop = [topCenter[0], topCenter[1], topBounds[0][2]];
  
  // Calculate translation vector to align bottom center of top with top center of bottom
  const translationVector = [
    topCenterOfBottom[0] - bottomCenterOfTop[0],
    topCenterOfBottom[1] - bottomCenterOfTop[1],
    topCenterOfBottom[2] - bottomCenterOfTop[2]
  ];
  
  // Return both objects, with top object translated
  return [bottomObject, topObject.translate(translationVector)];
}