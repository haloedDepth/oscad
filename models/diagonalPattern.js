// models/linearPattern.js
import { Vector, compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';

// Helper to select geometric center of a model
export const centerSelector = (model) => model.boundingBox.center;

// Helper to combine multiple model generators into one
export function combine(...modelGenerators) {
  return (...args) => {
    const allModels = modelGenerators.flatMap(generator => generator(...args));
    return compoundShapes(allModels);
  };
}

// Create points with orientation along a line
export function createLinearPattern(origin, direction, count, orientationX = 0, orientationY = 0, orientationZ = 1) {
  const directionVector = new Vector(direction);
  const length = directionVector.Length;
  const normalizedDirection = directionVector.normalized();
  const orientationVector = new Vector([orientationX, orientationY, orientationZ]).normalized();
  
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0;
    const distance = length * t;
    const positionVector = normalizedDirection.multiply(distance);
    
    return {
      position: [
        origin[0] + positionVector.x,
        origin[1] + positionVector.y,
        origin[2] + positionVector.z
      ],
      direction: [directionVector.x, directionVector.y, directionVector.z],
      orientation: [orientationVector.x, orientationVector.y, orientationVector.z]
    };
  });
}

// Place models at specified points with orientation
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

// Create a linear pattern of cuboids
export function createLinearCuboidPattern(
  count = 5,
  vectorX = 0, 
  vectorY = 50, 
  vectorZ = 50,
  originX = 0,
  originY = 0,
  originZ = 0,
  boxWidth = 10,
  boxDepth = 10,
  boxHeight = 10,
  orientationX = 0,
  orientationY = 0,
  orientationZ = 1
) {
  return compoundShapes(
    placeModelsAtPoints(
      () => createCuboid(boxWidth, boxDepth, boxHeight),
      centerSelector,
      createLinearPattern(
        [originX, originY, originZ],
        [vectorX, vectorY, vectorZ],
        count,
        orientationX,
        orientationY,
        orientationZ
      )
    )
  );
}