// modelValidation.js - Elegant model schemas
import { 
    validateAll, 
    isPositive,
    lessThan,
    halfOfMin
  } from './validator.js';
  
  export const modelSchemas = {
    "Box": [
      // Validate all parameters are positive numbers in one go
      validateAll(isPositive, 'width', 'height', 'depth', 'thickness', 'cornerRadius'),
      
      // Specific validators for relationships between parameters
      (params) => lessThan(params, 'thickness', halfOfMin(params, ['width', 'height', 'depth'])),
      (params) => lessThan(params, 'cornerRadius', halfOfMin(params, ['width', 'height']))
    ]
  };