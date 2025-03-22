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
  cuboidFaceName = "BOTTOM",
  lProfileFaceName = "TOP",
  offsetDistance = 0
) {
  // Create the cuboid (fixed model)
  const cuboid = createCuboid(cuboidWidth, cuboidDepth, cuboidHeight);
  
  // Create the L-profile (moving model)
  const lProfile = createLProfile(lLength, lFlange1Width, lFlange2Width, lThickness);
  
  // Get the specified face from FACES for cuboid
  const cuboidFace = FACES[cuboidFaceName];
  if (!cuboidFace) {
    const error = `Invalid cuboid face: ${cuboidFaceName}. Valid options are: ${Object.keys(FACES).join(', ')}`;
    throw new Error(error);
  }
  
  // Get the specified face from FACES for L-profile
  const lProfileFace = FACES[lProfileFaceName];
  if (!lProfileFace) {
    const error = `Invalid L-profile face: ${lProfileFaceName}. Valid options are: ${Object.keys(FACES).join(', ')}`;
    throw new Error(error);
  }
  
  // Mate the L-profile to the cuboid
  let matedLProfile = mateBoundingBoxFaces(
    cuboid, cuboidFace,
    lProfile, lProfileFace
  );
  
  // Apply offset if specified
  if (offsetDistance !== 0) {
    // Pass the cuboid face to the offset function for consistent behavior
    matedLProfile = offsetMatedModel(matedLProfile, lProfileFace, offsetDistance, cuboidFace);
  }
  
  // Combine the cuboid and mated L-profile
  const combinedModel = cuboid.fuse(matedLProfile);
  
  return combinedModel;
}

