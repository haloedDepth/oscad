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
    validateAll(isPositive, 'width', 'height', 'depth')
  ]
};