// models/matedCuboidL.js
import { createCuboid } from './cuboid.js';
import { createLProfile } from './lProfile.js';
import { FACES } from '../helpers/boundingBox.js';
import { mateBoundingBoxFaces, offsetMatedModel } from '../helpers/mate.js';

/**
 * Creates a model demonstrating the bounding box mate constraint
 * between a cuboid and an L-profile
 * 
 * @param {number} cuboidWidth - Width of the cuboid
 * @param {number} cuboidDepth - Depth of the cuboid
 * @param {number} cuboidHeight - Height of the cuboid
 * @param {number} lLength - Length of the L-profile
 * @param {number} lFlange1Width - Width of first flange of the L-profile
 * @param {number} lFlange2Width - Width of second flange of the L-profile
 * @param {number} lThickness - Thickness of both flanges
 * @param {string} cuboidFaceName - Which face of the cuboid to mate (TOP, RIGHT, etc.)
 * @param {string} lProfileFaceName - Which face of the L-profile to mate (TOP, BOTTOM, LEFT, etc.)
 * @param {number} offsetDistance - Distance to offset after mating (0 for flush)
 * @returns {Object} Combined model
 */
export function createMatedCuboidL(
  cuboidWidth = 100,
  cuboidDepth = 100,
  cuboidHeight = 50,
  lLength = 100,
  lFlange1Width = 50,
  lFlange2Width = 50,
  lThickness = 5,
  cuboidFaceName = "TOP",
  lProfileFaceName = "BOTTOM",
  offsetDistance = 0
) {
  console.log(`[DEBUG] createMatedCuboidL - Parameters:`);
  console.log(`[DEBUG] createMatedCuboidL - cuboidWidth: ${cuboidWidth}`);
  console.log(`[DEBUG] createMatedCuboidL - cuboidDepth: ${cuboidDepth}`);
  console.log(`[DEBUG] createMatedCuboidL - cuboidHeight: ${cuboidHeight}`);
  console.log(`[DEBUG] createMatedCuboidL - lLength: ${lLength}`);
  console.log(`[DEBUG] createMatedCuboidL - lFlange1Width: ${lFlange1Width}`);
  console.log(`[DEBUG] createMatedCuboidL - lFlange2Width: ${lFlange2Width}`);
  console.log(`[DEBUG] createMatedCuboidL - lThickness: ${lThickness}`);
  console.log(`[DEBUG] createMatedCuboidL - cuboidFaceName: ${cuboidFaceName}`);
  console.log(`[DEBUG] createMatedCuboidL - lProfileFaceName: ${lProfileFaceName}`);
  console.log(`[DEBUG] createMatedCuboidL - offsetDistance: ${offsetDistance}`);
  
  // Create the cuboid (fixed model)
  console.log(`[DEBUG] createMatedCuboidL - Creating cuboid`);
  const cuboid = createCuboid(cuboidWidth, cuboidDepth, cuboidHeight);
  console.log(`[DEBUG] createMatedCuboidL - Cuboid bounds: ${JSON.stringify(cuboid.boundingBox.bounds)}`);
  
  // Create the L-profile (moving model)
  console.log(`[DEBUG] createMatedCuboidL - Creating L-profile`);
  const lProfile = createLProfile(lLength, lFlange1Width, lFlange2Width, lThickness);
  console.log(`[DEBUG] createMatedCuboidL - L-profile bounds: ${JSON.stringify(lProfile.boundingBox.bounds)}`);
  
  // Get the specified face from FACES for cuboid
  console.log(`[DEBUG] createMatedCuboidL - Getting cuboid face constant`);
  const cuboidFace = FACES[cuboidFaceName];
  if (!cuboidFace) {
    const error = `Invalid cuboid face: ${cuboidFaceName}. Valid options are: ${Object.keys(FACES).join(', ')}`;
    console.error(`[ERROR] createMatedCuboidL - ${error}`);
    throw new Error(error);
  }
  console.log(`[DEBUG] createMatedCuboidL - Cuboid face: ${cuboidFace}`);
  
  // Get the specified face from FACES for L-profile
  console.log(`[DEBUG] createMatedCuboidL - Getting L-profile face constant`);
  const lProfileFace = FACES[lProfileFaceName];
  if (!lProfileFace) {
    const error = `Invalid L-profile face: ${lProfileFaceName}. Valid options are: ${Object.keys(FACES).join(', ')}`;
    console.error(`[ERROR] createMatedCuboidL - ${error}`);
    throw new Error(error);
  }
  console.log(`[DEBUG] createMatedCuboidL - L-profile face: ${lProfileFace}`);
  
  // Mate the L-profile to the cuboid
  console.log(`[DEBUG] createMatedCuboidL - Mating L-profile to cuboid`);
  let matedLProfile = mateBoundingBoxFaces(
    cuboid, cuboidFace,
    lProfile, lProfileFace
  );
  console.log(`[DEBUG] createMatedCuboidL - Mated L-profile bounds: ${JSON.stringify(matedLProfile.boundingBox.bounds)}`);
  
  // Apply offset if specified
  if (offsetDistance !== 0) {
    console.log(`[DEBUG] createMatedCuboidL - Applying offset of ${offsetDistance}`);
    matedLProfile = offsetMatedModel(matedLProfile, lProfileFace, offsetDistance);
    console.log(`[DEBUG] createMatedCuboidL - Offset L-profile bounds: ${JSON.stringify(matedLProfile.boundingBox.bounds)}`);
  } else {
    console.log(`[DEBUG] createMatedCuboidL - No offset applied (offsetDistance = 0)`);
  }
  
  // Combine the cuboid and mated L-profile
  console.log(`[DEBUG] createMatedCuboidL - Combining models with boolean fuse operation`);
  const combinedModel = cuboid.fuse(matedLProfile);
  console.log(`[DEBUG] createMatedCuboidL - Combined model bounds: ${JSON.stringify(combinedModel.boundingBox.bounds)}`);
  
  return combinedModel;
}