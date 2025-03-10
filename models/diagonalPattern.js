// models/diagonalPattern.js
import { Vector, compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';

// Helper to select geometric center of a model
export const centerSelector = (model) => model.boundingBox.center;

// Create a Ray (positioned vector) with origin point and direction vector
export function ray(origin, direction) {
  return {
    origin: origin, // ReplicAD's Point type (array, Vector, etc.)
    direction: direction // Should be a Vector
  };
}

// Create models positioned along a ray
export function createDiagonalPatternModels(
  modelCreator,      // Function that creates model 
  referenceSelector, // Function to get reference point
  ray,               // Ray defining start point and direction
  count              // Number of instances
) {
  const models = [];
  
  for (let i = 0; i < count; i++) {
    // Position along the ray (from 0% to 100%)
    const t = count > 1 ? i / (count - 1) : 0;
    
    // Create model instance
    const model = modelCreator();
    
    // Get reference point
    const refPoint = referenceSelector(model);
    
    // Calculate target position (origin + t*direction)
    const targetPos = ray.direction.multiply(t);
    const targetPoint = [
      ray.origin[0] + targetPos.x,
      ray.origin[1] + targetPos.y,
      ray.origin[2] + targetPos.z
    ];
    
    // Calculate offset
    const offset = [
      targetPoint[0] - refPoint[0],
      targetPoint[1] - refPoint[1],
      targetPoint[2] - refPoint[2]
    ];
    
    // Translate model
    models.push(model.translate(offset));
  }
  
  return models;
}

// Create a diagonal pattern of cuboids
export function createDiagonalCuboidPattern(
  count = 5,
  vectorX = 0, 
  vectorY = 50, 
  vectorZ = 50,
  originX = 0,
  originY = 0,
  originZ = 0,
  boxWidth = 10,
  boxDepth = 10,
  boxHeight = 10
) {
  return compoundShapes(
    createDiagonalPatternModels(
      () => createCuboid(boxWidth, boxDepth, boxHeight),
      centerSelector,
      ray(
        [originX, originY, originZ],
        new Vector([vectorX, vectorY, vectorZ])
      ),
      count
    )
  );
}