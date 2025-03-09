export const modelSchemas = {
    "Box": [
      // Simple validators
      isNumber('width'),('height'),('depth'),('thickness'),('cornerRadius'),
      
      isPositive('width'),('height'),('depth'),('thickness'),('cornerRadius'),
      
      // Range validators 
      isInRange('width', 1, 500),('height', 1, 500),('depth', 1, 500),('thickness', 0.1, 10),('cornerRadius', 0, 50),
      
      // Comparative validators
      notExceeding('height', 'depth'),
      proportionalTo('width', 'height', 3),
      fractionOf('thickness', 'width', 0.25),
      validCornerRadius('cornerRadius', 'width', 'height')
    ]
  };