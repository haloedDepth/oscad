// cad.js
import { drawRoundedRectangle } from "replicad";
import { withValidation } from "./validator.js";
import { modelSchemas } from "./modelValidation.js";

// Pure model functions focused only on creating the shape
export function createBox(width = 30, height = 50, depth = 20, thickness = 2, cornerRadius = 5) {
  return drawRoundedRectangle(width, height, cornerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .shell(thickness, (f) => f.inPlane("XY", depth));
}

// Apply validation to all model functions
export const modelFunctions = {
  "Box": withValidation(createBox, modelSchemas["Box"])
};