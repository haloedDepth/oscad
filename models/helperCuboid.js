// models/helperCuboid.js
import { createCuboid } from './cuboid.js';
import { modelWithHelpers } from '../helperUtils.js';
import { constraintModelsByPoints } from '../helpers/mate.js';
import { FACES, EDGES } from '../helpers/boundingBox.js';
import { createDrill } from './drill.js';
import { mirror } from '../helpers/shapes.js';
import { createLProfile } from './lProfile.js';
import { createCylinder } from './cylinder.js';
import { compoundShapes } from "replicad";
import { Vector } from "replicad";

/**
 * Creates a model with a helper cuboid space and drill holes in all four corners
 * Plus two L-profiles on the bottom edges with holes in the bottom face
 * Distributes the models in a linear pattern within the helper space
 * @param {number} width - Width of the helper cuboid
 * @param {number} depth - Depth of the helper cuboid
 * @param {number} height - Height of the helper cuboid
 * @param {boolean} showHelper - Whether to show the helper space
 * @returns {Object} Model with helper space
 */
export function createHelperCuboid(width = 50, depth = 100, height = 200, showHelper = true) {
  // Create basic model first (single instance)
  const createBaseModel = () => {
    // Create main model (thin cuboid)
    const mainModel = createCuboid(width-1, 20, 0.5);
    const mainCenter = mainModel.boundingBox.center;
    
    // Create and position first drill
    const drill = constraintModelsByPoints(
      mainModel, 
      { type: 'face', element: FACES.TOP, params: { u: 1.5 / (width-1), v: 2.25 / 20 } },
      createDrill(1.2, 0.8, 0.5 * 0.8, 0.5 * 0.2)
    );
    
    // Mirror to all corners and cut
    const drilledModel = mainModel
      .cut(drill)
      .cut(mirror(drill, "XZ", mainCenter, true))
      .cut(mirror(drill, "YZ", mainCenter, true))
      .cut(mirror(mirror(drill, "XZ", mainCenter, true), "YZ", mainCenter, true));
    
    // Create L-profile
    const lProfile = createLProfile(20, 4.5, 4.5, 0.5);
    const profileCenter = lProfile.boundingBox.center;
    
    // Create and position hole for L-profile
    const holeDrill = constraintModelsByPoints(
      lProfile,
      { type: 'face', element: FACES.BOTTOM, params: { u: 1.5 / 4.5, v: 2.25 / 20 } },
      createCylinder(0.800001, 0.5)
    );
    
    // Drill both holes in L-profile
    const drilledLProfile = lProfile
      .cut(holeDrill)
      .cut(mirror(holeDrill, "XZ", profileCenter, true));
    
    // Position first L-profile
    const lProfile1 = constraintModelsByPoints(
      drilledModel,
      { type: 'edge', element: EDGES.LEFT_BOTTOM, params: { t: 0.5 } },
      drilledLProfile,
      { normal: [0, 0, -1], xDir: [1, 0, 0] }
    );
    
    // Mirror and add second L-profile
    return drilledModel
      .fuse(lProfile1)
      .fuse(mirror(lProfile1, "YZ", mainCenter, true));
  };
  
  // Create the base model
  const baseModel = createBaseModel();
  
  // Calculate number of models based on height
  const n_models = Math.round(height / 17.5) - 1;
  
  // If we end up with no models (small height), just return the helper space
  if (n_models <= 0) {
    const helperSpace = createCuboid(width, depth, height);
    return modelWithHelpers(baseModel, showHelper ? [helperSpace] : []);
  }
  
  // Calculate spacing between models
  const vertical_difference = height / (n_models + 1);
  const horizontal_difference = (n_models > 1) ? ((depth - 28) / (n_models - 1)) : 0;

  // Calculate the model height to correctly position by TOP face
  const modelHeight = baseModel.boundingBox.bounds[1][2] - baseModel.boundingBox.bounds[0][2];
  
  // Create an array to store all model instances
  const models = [];
  
  // Position of first model (adjusted to position by TOP face)
  let currentX = 0;
  let currentY = -depth/2+14;
  let currentZ = vertical_difference - modelHeight; // Adjust Z to place TOP face at vertical_difference
  
  // Create and position all models
  for (let i = 0; i < n_models; i++) {
    // Clone the base model and position it
    const positionedModel = baseModel.clone().translate([currentX, currentY, currentZ]);
    models.push(positionedModel);
    
    // Update position for next model
    currentY += horizontal_difference;
    currentZ += vertical_difference;
  }
  
  // Combine all models
  const finalModel = compoundShapes(models);
  
  // Create helper space
  const helperSpace = createCuboid(width, depth, height);
  
  // Return model with optional helper space
  return modelWithHelpers(finalModel, showHelper ? [helperSpace] : []);
}