// cad.js
import { drawRoundedRectangle, makeBox, compoundShapes } from "replicad";
import { withValidation } from "./validator.js";
import { modelSchemas } from "./modelValidation.js";

// Existing model function for the box
export function createBox(width = 30, height = 50, depth = 20, thickness = 2, cornerRadius = 5) {
  return drawRoundedRectangle(width, height, cornerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .shell(thickness, (f) => f.inPlane("XY", depth));
}

// Create a staircase as a compound shape
export function createStaircase(spaceWidth = 800, spaceLength = 2000, spaceHeight = 1000, stairThickness = 5) {
  // Fixed stair dimensions
  const STAIR_THICKNESS = stairThickness;
  const STAIR_LENGTH = 200; // 200mm length in direction of travel
  
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
    
    // Create box directly with positioned coordinates
    // coordinates format: [x1, y1, z1], [x2, y2, z2]
    // x: width direction (left to right)
    // y: depth/length direction (front to back)
    // z: height direction (bottom to top)
    const stair = makeBox(
      [0, yPosition, zPosition], // Starting point (left front bottom corner)
      [spaceWidth, yPosition + STAIR_LENGTH, zPosition + STAIR_THICKNESS] // Ending point (right back top corner)
    );
    
    stairs.push(stair);
  }
  
  // Create and return compound shape
  return compoundShapes(stairs);
}

// Apply validation to all model functions
export const modelFunctions = {
  "Box": withValidation(createBox, modelSchemas["Box"]),
  "Staircase": withValidation(createStaircase, modelSchemas["Staircase"])
};