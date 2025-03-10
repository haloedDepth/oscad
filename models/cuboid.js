// models/cuboid.js
import { makeBox } from "replicad";

// Create a centered cuboid
export function createCuboid(width = 100, depth = 100, height = 100) {
  return makeBox(
    [0, 0, 0],                 // bottom-front-left corner
    [width, depth, height]     // top-back-right corner
  );
}