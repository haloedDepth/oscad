// models/index.js
// Import models from individual files
import { createCuboid } from './cuboid.js';
import { createSphere } from './sphere.js';
import { createCylinder } from './cylinder.js';
import { createEllipsoid } from './ellipsoid.js';
import { createLinearCuboidPattern } from './diagonalPattern.js';
import { createRectangularCuboidGrid } from './gridPattern.js';

// Import validation utilities
import { withValidation } from "../validator.js";
import { modelSchemas } from "../modelValidation.js";

// Export model functions with validation
export const modelFunctions = {
  "Cuboid": withValidation(createCuboid, modelSchemas["Cuboid"]),
  "Sphere": withValidation(createSphere, modelSchemas["Sphere"]),
  "Cylinder": withValidation(createCylinder, modelSchemas["Cylinder"]),
  "Ellipsoid": withValidation(createEllipsoid, modelSchemas["Ellipsoid"]),
  "DiagonalCuboidPattern": withValidation(createLinearCuboidPattern, modelSchemas["DiagonalCuboidPattern"]),
  "RectangularCuboidGrid": withValidation(createRectangularCuboidGrid, modelSchemas["RectangularCuboidGrid"])
};