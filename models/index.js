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

// Schemas for models with helper spaces
const workingAreaSchema = [
  (params) => {
    const { mainRadius, mainHeight, workAreaWidth, workAreaDepth, workAreaHeight } = params;
    if (mainRadius <= 0 || mainHeight <= 0 || workAreaWidth <= 0 || workAreaDepth <= 0 || workAreaHeight <= 0) {
      return {
        valid: false,
        message: "All dimensions must be positive values"
      };
    }
    return { valid: true };
  }
];

const workCellLayoutSchema = [
  (params) => {
    const { 
      machineWidth, machineDepth, machineHeight, 
      safetyZoneWidth, safetyZoneDepth, safetyZoneHeight, 
      operatorZoneDepth 
    } = params;
    if (machineWidth <= 0 || machineDepth <= 0 || machineHeight <= 0 || 
        safetyZoneWidth <= 0 || safetyZoneDepth <= 0 || safetyZoneHeight <= 0 || 
        operatorZoneDepth <= 0) {
      return {
        valid: false,
        message: "All dimensions must be positive values"
      };
    }
    return { valid: true };
  }
];

// Export model functions with validation
export const modelFunctions = {
  "Cuboid": withValidation(createCuboid, modelSchemas["Cuboid"]),
  "Sphere": withValidation(createSphere, modelSchemas["Sphere"]),
  "Cylinder": withValidation(createCylinder, modelSchemas["Cylinder"]),
  "Ellipsoid": withValidation(createEllipsoid, modelSchemas["Ellipsoid"]),
  "DiagonalCuboidPattern": withValidation(createLinearCuboidPattern, modelSchemas["DiagonalCuboidPattern"]),
  "RectangularCuboidGrid": withValidation(createRectangularCuboidGrid, modelSchemas["RectangularCuboidGrid"])
};