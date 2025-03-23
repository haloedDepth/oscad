// models/helperCuboid.js
import { createCuboid } from './cuboid.js';
import { modelWithHelpers } from '../helperUtils.js';

/**
 * Creates a model with a helper cuboid space
 * @param {number} width - Width of the helper cuboid
 * @param {number} depth - Depth of the helper cuboid
 * @param {number} height - Height of the helper cuboid
 * @param {boolean} showHelper - Whether to show the helper space
 * @returns {Object} Model with helper space
 */
export function createHelperCuboid(
  width = 50,
  depth = 100,
  height = 200,
  showHelper = true
) {
  // Create a tiny main model (almost invisible)
  const mainModel = createCuboid(width-1, 20, 0.5);
  
  // Create helper space - only if showHelper is true
  const helperSpaces = [];
  if (showHelper) {
    const helperCuboid = createCuboid(width, depth, height);
    helperSpaces.push(helperCuboid);
  }
  
  // Return model with helpers
  return modelWithHelpers(mainModel, helperSpaces);
}