// models/helperCuboid.js
import { createCuboid } from './cuboid.js';
import { modelWithHelpers } from '../helperUtils.js';
import { constraintModelsByPoints } from '../helpers/mate.js';
import { getPointOnFace, FACES } from '../helpers/boundingBox.js';
import { createDrill } from './drill.js';
import { cast } from 'replicad';

/**
 * Creates a model with a helper cuboid space and drill holes in all four corners
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
  // Create a tiny main model
  const mainModel = createCuboid(width-1, 20, 0.5);
  
  // Create drill
  const drill = createDrill(
    1.2,             // Bottom radius
    0.8,             // Top radius
    0.5 * 0.8,       // Frustum height
    0.5 * 0.2        // Cylinder height
  );
  
  // Position at front-left corner
  const pointSpec = {
    type: 'face',
    element: FACES.TOP,
    params: { 
      u: 1.5 / (width-1),
      v: 2.25 / 20
    }
  };
  
  // Position first drill
  const drill1 = constraintModelsByPoints(mainModel, pointSpec, drill);
  
  // Create a proper copy before mirroring to front-right
  // cast() should create a proper OpenCascade copy of the shape
  const drill1Copy = cast(drill1.wrapped);
  const drill2 = drill1Copy.mirror("XZ", mainModel.boundingBox.center);
  
  // Mirror both to back
  const drill1Copy2 = cast(drill1.wrapped);
  const drill3 = drill1Copy2.mirror("YZ", mainModel.boundingBox.center);
  
  const drill2Copy = cast(drill2.wrapped);
  const drill4 = drill2Copy.mirror("YZ", mainModel.boundingBox.center);
  
  // Cut all holes
  const drilledModel = mainModel.cut(drill1)
                              .cut(drill2)
                              .cut(drill3)
                              .cut(drill4);
  
  // Create helper space if needed
  const helperSpaces = [];
  if (showHelper) {
    const helperCuboid = createCuboid(width, depth, height);
    helperSpaces.push(helperCuboid);
  }
  
  // Return model with helpers
  return modelWithHelpers(drilledModel, helperSpaces);
}