// models/diagonalPattern.js
import { Vector, compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';

// Helper to select geometric center of a model
export const centerSelector = (model) => model.boundingBox.center;

// Create a Ray (positioned vector) with origin point and direction vector
export function ray(origin, direction) {
  return {
    origin: origin,
    direction: direction
  };
}

// Helper to combine multiple model generators into one
export function combine(...modelGenerators) {
  return (...args) => {
    const allModels = modelGenerators.flatMap(generator => generator(...args));
    return compoundShapes(allModels);
  };
}

// Create models positioned along a ray
export function createDiagonalPatternModels(
  modelCreator,
  referenceSelector,
  ray,
  count
) {
  const models = [];
  
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    
    const model = modelCreator();
    const refPoint = referenceSelector(model);
    
    const targetPos = ray.direction.multiply(t);
    const targetPoint = [
      ray.origin[0] + targetPos.x,
      ray.origin[1] + targetPos.y,
      ray.origin[2] + targetPos.z
    ];
    
    const offset = [
      targetPoint[0] - refPoint[0],
      targetPoint[1] - refPoint[1],
      targetPoint[2] - refPoint[2]
    ];
    
    models.push(model.translate(offset));
  }
  
  return models;
}

// Create a diagonal pattern of cuboids
export function createDiagonalCuboidPattern(
  count = 5,
  vectorX = 0, 
  vectorY = 50, 
  vectorZ = 50,
  originX = 0,
  originY = 0,
  originZ = 0,
  boxWidth = 10,
  boxDepth = 10,
  boxHeight = 10
) {
  return compoundShapes(
    createDiagonalPatternModels(
      () => createCuboid(boxWidth, boxDepth, boxHeight),
      centerSelector,
      ray(
        [originX, originY, originZ],
        new Vector([vectorX, vectorY, vectorZ])
      ),
      count
    )
  );
}