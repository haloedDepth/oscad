// Simple model functions with default parameters in their declarations
import { drawRoundedRectangle, makeCylinder, makeBox } from "replicad";

// Box model with all parameters in function declaration
export function createBox(width = 30, height = 50, depth = 20, thickness = 2, cornerRadius = 5) {
  return drawRoundedRectangle(width, height, cornerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .shell(thickness, (f) => f.inPlane("XY", depth));
}


// Simple map of available model functions
export const modelFunctions = {
  "Box": createBox
};