// modelValidation.js - Elegant model schemas
import { 
  validateAll, 
  isPositive,
  lessThan,
  halfOfMin
} from './validator.js';

export const modelSchemas = {
  "Staircase": [
    // Validate all parameters are positive
    validateAll(isPositive, 'spaceWidth', 'spaceLength', 'spaceHeight'),
    
    // Validate minimum height for stairs
    (params) => {
      if (params.spaceHeight < 337) { // Minimum for one stair (166mm + 166mm + 5mm)
        return {
          valid: false,
          message: 'Space height must be at least 337mm to accommodate stairs with proper spacing'
        };
      }
      return { valid: true };
    }
  ],

  "Cuboid": [
    // Validate all parameters are positive numbers
    validateAll(isPositive, 'width', 'height', 'depth')
  ]
};