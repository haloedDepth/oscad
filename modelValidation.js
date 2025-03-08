// modelValidation.js - Elegant model schemas
import { 
    validateAll, 
    isValidNumber,
    lessThan,
    halfOfMin
  } from './validator.js';
  
  export const modelSchemas = {
    "Box": [
      // Validate all parameters are valid numbers in one go
      validateAll(isValidNumber, 'width', 'height', 'depth', 'thickness', 'cornerRadius'),
      
      // Specific validators for relationships between parameters
      (params) => lessThan(params, 'thickness', halfOfMin(params, ['width', 'height', 'depth'])),
      (params) => lessThan(params, 'cornerRadius', halfOfMin(params, ['width', 'height']))
    ]
  };