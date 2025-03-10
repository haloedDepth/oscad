// cad.js
import { drawRoundedRectangle, makeBox, compoundShapes } from "replicad";
import { withValidation } from "./validator.js";
import { modelSchemas } from "./modelValidation.js";


// Create a staircase as a compound shape
export function createStaircase(spaceWidth = 800, spaceLength = 2000, spaceHeight = 1000) {
  // Fixed stair dimensions
  const STAIR_LENGTH = 200; // 200mm length in direction of travel
  const STAIR_THICKNESS = 5; // Fixed thickness at 5mm
  
  // Calculate optimal number of stairs
  let numStairs = 1;
  let verticalSpacing;
  
  // Try increasing numbers of stairs until spacing is within range
  while (true) {
    verticalSpacing = spaceHeight / (numStairs + 1);
    
    if (verticalSpacing < 166) {
      // Too many stairs, reduce by one
      numStairs--;
      verticalSpacing = spaceHeight / (numStairs + 1);
      break;
    } 
    else if (verticalSpacing <= 176) {
      // Spacing is within range
      break;
    }
    else {
      // Spacing too large, add another stair
      numStairs++;
    }
  }
  
  // Create stairs
  const stairs = [];
  
  // Calculate horizontal step to follow diagonal
  const horizontalStep = spaceLength / (numStairs + 1);
  
  for (let i = 0; i < numStairs; i++) {
    // Calculate position for this stair
    const yPosition = horizontalStep * (i + 1) - STAIR_LENGTH/2; // Centered at position
    const zPosition = verticalSpacing * (i + 1) - STAIR_THICKNESS; // Top of stair at height
    
    // Create a cuboid with the stair dimensions (fixed length 200mm and thickness 5mm)
    const stair = createCuboid(spaceWidth, 200, 5);
    
    // Translate the cuboid to the correct position
    stairs.push(stair.translate([0, yPosition, zPosition]));
  }
  
  // Create and return compound shape
  return compoundShapes(stairs);
}

// New function to create a centered cuboid
export function createCuboid(width = 100, depth = 100, height = 100) {
  return makeBox(
    [0, 0, 0],                 // bottom-front-left corner
    [width, depth, height]     // top-back-right corner
  );
}

// Apply validation to all model functions
export const modelFunctions = {
  "Staircase": withValidation(createStaircase, modelSchemas["Staircase"]),
  "Cuboid": withValidation(createCuboid, modelSchemas["Cuboid"])
};