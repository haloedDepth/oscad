// models/staircase.js
import { compoundShapes } from "replicad";
import { createCuboid } from './cuboid.js';
import { placeOnTop } from '../helpers/positioning.js';

/**
 * Creates a staircase model with two stacked cuboids
 * - Bottom cuboid: fixed depth of 200, fixed height of 5, variable width
 * - Top cuboid: fixed depth of 280, fixed height of 5, same width as bottom
 * @param {number} width - Width of both cuboids
 * @returns {Object} Staircase model
 */
export function createStaircase(width = 100) {
  // Create model instances explicitly
  const bottomCuboid = createCuboid(width, 200, 5);
  const topCuboid = createCuboid(width, 280, 5);
  
  // Position the top cuboid on the bottom cuboid
  const positioned = placeOnTop(bottomCuboid, topCuboid);
  
  // Combine the positioned objects
  return compoundShapes(positioned);
}