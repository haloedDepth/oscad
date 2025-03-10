// models/diagonalPattern.js
import { Vector, compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';

// Helper to select geometric center of a model
export const centerSelector = (model) => model.boundingBox.center;

// Create models positioned along a vector
export function createDiagonalPatternModels(
  modelCreator,      // Function that creates model 
  referenceSelector, // Function to get reference point
  vector,            // Vector defining diagonal direction
  count              // Number of instances
) {
  const models = [];
  
  for (let i = 0; i < count; i++) {
    // Position along the vector (from 0% to 100%)
    const t = count > 1 ? i / (count - 1) : 0;
    
    // Create model instance
    const model = modelCreator();
    
    // Get reference point
    const refPoint = referenceSelector(model);
    
    // Calculate target position
    const targetPos = vector.multiply(t);
    
    // Calculate offset
    const offset = [
      targetPos.x - refPoint[0],
      targetPos.y - refPoint[1],
      targetPos.z - refPoint[2]
    ];
    
    // Translate model
    models.push(model.translate(offset));
  }
  
  return models;
}

// Fully inlined implementation with no intermediate variables
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
        new Vector([vectorX, vectorY, vectorZ]),
        count
      ).map(model => model.translate([originX, originY, originZ]))
    );
  }