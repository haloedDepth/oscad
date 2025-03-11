// modelValidation.js
import { 
  validateAll, 
  isPositive,
  isNumber,
  lessThan,
  halfOfMin
} from './validator.js';

export const modelSchemas = {
  "Cuboid": [
    // Validate all parameters are positive numbers
    validateAll(isPositive, 'width', 'depth', 'height')
  ],
  "Sphere": [
    // Validate radius is positive
    validateAll(isPositive, 'radius')
  ],
  "Cylinder": [
    // Validate radius and height are positive
    validateAll(isPositive, 'radius', 'height')
  ],
  "Ellipsoid": [
    // Validate all dimensions are positive
    validateAll(isPositive, 'aLength', 'bLength', 'cLength')
  ],
  "DiagonalCuboidPattern": [
    // Validate count is positive
    validateAll(isPositive, 'count')
  ],
  "RectangularCuboidGrid": [
    // Validate grid parameters
    validateAll(isNumber, 'originX', 'originY', 'originZ', 'directionX', 'directionY', 'directionZ', 'normalX', 'normalY', 'normalZ'),
    validateAll(isPositive, 'rowCount', 'colCount', 'xSpacing', 'ySpacing', 'boxWidth', 'boxDepth', 'boxHeight')
  ]
};