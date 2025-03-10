// Import models from individual files
import { createCuboid } from './cuboid.js';

// Import validation utilities
import { withValidation } from "../validator.js";
import { modelSchemas } from "../modelValidation.js";

// Export model functions with validation
export const modelFunctions = {
  "Cuboid": withValidation(createCuboid, modelSchemas["Cuboid"])
};