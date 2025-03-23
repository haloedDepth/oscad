// models/helperCuboid.js
import { createCuboid } from './cuboid.js';
import { modelWithHelpers } from '../helperUtils.js';
import { constraintModelsByPoints } from '../helpers/mate.js';
import { getPointOnFace, FACES, EDGES, getEdgeMidpoint } from '../helpers/boundingBox.js';
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
  
  // Mirror to front-right, keeping the original drill1 intact
  const drill2 = mirror(drill1, "XZ", mainModel.boundingBox.center, true);
  
  // Mirror both to back, keeping the originals intact
  const drill3 = mirror(drill1, "YZ", mainModel.boundingBox.center, true);
  const drill4 = mirror(drill2, "YZ", mainModel.boundingBox.center, true);
  
  // Cut all holes
  const drilledModel = mainModel.cut(drill1)
                              .cut(drill2)
                              .cut(drill3)
                              .cut(drill4);
  
  // Create L-profile with specified parameters
  const lProfileRaw = createLProfile(
    20,      // depth (along y-axis)
    4.5,     // flangeXLength (along x-axis)
    4.5,     // flangeYLength (along z-axis)
    0.5      // thickness
  );
  
  // Create a simple cylinder for drilling
  const holeDrill = createCylinder(0.800001, 0.5);
  
  // Position the first drill at 1.5 units from one edge and 2.25 from the other edge
  // on the bottom face of the L-profile
  const lProfileDrill1 = constraintModelsByPoints(
    lProfileRaw,
    {
      type: 'face',
      element: FACES.BOTTOM,
      params: { 
        u: 1.5 / 4.5,  // 1.5 units from edge on flange 
        v: 2.25 / 20   // 2.25 units from edge on depth
      }
    },
    holeDrill
  );
  
  // First drill the L-profile with the first hole
  const lProfileDrilledOnce = lProfileRaw.cut(lProfileDrill1);
  
  // Mirror the drill across the XZ plane (front-to-back)
  // This keeps it on the bottom face but places it at the opposite end along the depth
  const lProfileDrill2 = mirror(lProfileDrill1, "XZ", lProfileRaw.boundingBox.center, true);
  
  // Then drill with the mirrored hole
  const lProfile1 = lProfileDrilledOnce.cut(lProfileDrill2);
  
  // Position the drilled L-profile at the bottom left edge midpoint
  const lProfile1Positioned = constraintModelsByPoints(
    mainModel,
    {
      type: 'edge',
      element: EDGES.LEFT_BOTTOM,
      params: { t: 0.5 } // Midpoint
    },
    lProfile1,
    {
      normal: [0, 0, -1],  // Bottom face normal
      xDir: [1, 0, 0]      // Positive Y direction
    }
  );
  
  // Mirror the positioned L-profile to create the second L-profile
  const lProfile2Positioned = mirror(lProfile1Positioned, "YZ", mainModel.boundingBox.center, true);
  
  // Fuse the L-profiles with the drilled model
  const finalModel = drilledModel.fuse(lProfile1Positioned).fuse(lProfile2Positioned);
  
  // Create helper space if needed
  const helperSpaces = [];
  if (showHelper) {
    const helperCuboid = createCuboid(width, depth, height);
    helperSpaces.push(helperCuboid);
  }
  
  // Return model with helpers
  return modelWithHelpers(finalModel, helperSpaces);
}