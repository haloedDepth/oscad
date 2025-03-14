// models/cuboid.js
import { makeBox } from "replicad";

// Create a centered cuboid
export function createCuboid(width = 100, depth = 100, height = 100) {
  console.log(`[DEBUG] createCuboid - Input parameters: width=${width}, depth=${depth}, height=${height}`);
  
  // Cuboid is created with its origin at 0,0,0 (bottom-front-left corner)
  // So the center is actually at the center of the box
  const cuboid = makeBox(
    [0, 0, 0],                 // bottom-front-left corner
    [width, depth, height]     // top-back-right corner
  );
  
  console.log(`[DEBUG] createCuboid - Created cuboid with bounds: ${JSON.stringify(cuboid.boundingBox.bounds)}`);
  console.log(`[DEBUG] createCuboid - Cuboid center: ${JSON.stringify(cuboid.boundingBox.center)}`);
  
  return cuboid;
}