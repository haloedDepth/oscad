// models/helperCuboid.js
import { createCuboid } from './cuboid.js';
import { modelWithHelpers } from '../helperUtils.js';
import { constraintModelsByPoints } from '../helpers/mate.js';
import { FACES, EDGES } from '../helpers/boundingBox.js';
import { createDrill } from './drill.js';
import { mirror } from '../helpers/shapes.js';
import { createLProfile } from './lProfile.js';
import { createCylinder } from './cylinder.js';

/**
 * Creates a model with a helper cuboid space and drill holes in all four corners
 * Plus two L-profiles on the bottom edges with holes in the bottom face
 * @param {number} width - Width of the helper cuboid
 * @param {number} depth - Depth of the helper cuboid
 * @param {number} height - Height of the helper cuboid
 * @param {boolean} showHelper - Whether to show the helper space
 * @returns {Object} Model with helper space
 */
export function createHelperCuboid(width = 50, depth = 100, height = 200, showHelper = true) {
  // Create main model (thin cuboid)
  const mainModel = createCuboid(width-1, 20, 0.5);
  const mainCenter = mainModel.boundingBox.center;
  
  // Create model with four corner holes
  const drilledModel = (() => {
    // Create and position first drill
    const drill = constraintModelsByPoints(
      mainModel, 
      { type: 'face', element: FACES.TOP, params: { u: 1.5 / (width-1), v: 2.25 / 20 } },
      createDrill(1.2, 0.8, 0.5 * 0.8, 0.5 * 0.2)
    );
    
    // Mirror to all corners and cut
    return mainModel
      .cut(drill)
      .cut(mirror(drill, "XZ", mainCenter, true))
      .cut(mirror(drill, "YZ", mainCenter, true))
      .cut(mirror(mirror(drill, "XZ", mainCenter, true), "YZ", mainCenter, true));
  })();
  
  // Add L-profiles to the model
  const finalModel = (() => {
    // Create L-profile with two drilled holes
    const drilledLProfile = (() => {
      const lProfile = createLProfile(20, 4.5, 4.5, 0.5);
      const profileCenter = lProfile.boundingBox.center;
      
      // Create and position first hole
      const drill = constraintModelsByPoints(
        lProfile,
        { type: 'face', element: FACES.BOTTOM, params: { u: 1.5 / 4.5, v: 2.25 / 20 } },
        createCylinder(0.800001, 0.5)
      );
      
      // Drill both holes
      return lProfile
        .cut(drill)
        .cut(mirror(drill, "XZ", profileCenter, true));
    })();
    
    // Position first L-profile
    const lProfile1 = constraintModelsByPoints(
      drilledModel,
      { type: 'edge', element: EDGES.LEFT_BOTTOM, params: { t: 0.5 } },
      drilledLProfile,
      { normal: [0, 0, -1], xDir: [1, 0, 0] }
    );
    
    // Mirror to create second L-profile and fuse both
    return drilledModel
      .fuse(lProfile1)
      .fuse(mirror(lProfile1, "YZ", mainCenter, true));
  })();
  
  // Return with optional helper space
  return modelWithHelpers(
    finalModel,
    showHelper ? [createCuboid(width, depth, height)] : []
  );
}