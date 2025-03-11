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

// Create points positioned along a ray
export function createDiagonalPattern(ray, count) {
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0;
    const targetPos = ray.direction.multiply(t);
    return [
      ray.origin[0] + targetPos.x,
      ray.origin[1] + targetPos.y,
      ray.origin[2] + targetPos.z
    ];
  });
}

// Place models at specified points
export function placeModelsAtPoints(modelCreator, referenceSelector, points) {
  return points.map(targetPoint => {
    const model = modelCreator();
    const refPoint = referenceSelector(model);
    return model.translate([
      targetPoint[0] - refPoint[0],
      targetPoint[1] - refPoint[1],
      targetPoint[2] - refPoint[2]
    ]);
  });
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
    placeModelsAtPoints(
      () => createCuboid(boxWidth, boxDepth, boxHeight),
      centerSelector,
      createDiagonalPattern(
        ray(
          [originX, originY, originZ],
          new Vector([vectorX, vectorY, vectorZ])
        ),
        count
      )
    )
  );
}