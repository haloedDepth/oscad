// modelValidation.js - Elegant model schemas
import { 
  validateAll, 
  isPositive,
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
  ]
};