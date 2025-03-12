import { Plane, Vector, compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';
import { centerSelector, placeModelsAtPoints } from './diagonalPattern.js';

export function createRectangularGrid(gridPlane, rowCount, colCount, xSpacing, ySpacing) {
  return Array.from({ length: rowCount * colCount }, (_, index) => {
    const row = Math.floor(index / colCount);
    const col = index % colCount;
    const x = col * xSpacing;
    const y = row * ySpacing;
    // Create plane inline for single return statement
    const plane = new Plane(
      new Vector(gridPlane.origin),
      new Vector(gridPlane.xDirection).normalized(),
      new Vector(gridPlane.normal).normalized()
    );
    const worldPoint = plane.toWorldCoords([x, y, 0]);
    return [worldPoint.x, worldPoint.y, worldPoint.z];
  });
}

export function createRectangularCuboidGrid(
  originX = 0,
  originY = 0,
  originZ = 0,
  directionX = 1,
  directionY = 0,
  directionZ = 0,
  normalX = 0,
  normalY = 0,
  normalZ = 1,
  rowCount = 3,
  colCount = 3,
  xSpacing = 30,
  ySpacing = 30,
  boxWidth = 10,
  boxDepth = 10,
  boxHeight = 10
) {
  return compoundShapes(
    placeModelsAtPoints(
      () => createCuboid(boxWidth, boxDepth, boxHeight),
      centerSelector,
      createRectangularGrid(
        {
          origin: [originX, originY, originZ],
          xDirection: [directionX, directionY, directionZ],
          normal: [normalX, normalY, normalZ]
        },
        rowCount,
        colCount,
        xSpacing,
        ySpacing
      )
    )
  );
}