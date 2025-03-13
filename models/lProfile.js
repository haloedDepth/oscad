// models/lProfile.js
import { makeBox } from "replicad";

/**
 * Creates an L-profile (angle profile)
 * @param {number} length - Length of the profile (along z-axis)
 * @param {number} flange1Width - Width of first flange (along x-axis)
 * @param {number} flange2Width - Width of second flange (along y-axis)
 * @param {number} thickness - Thickness of both flanges
 * @returns {Object} L-profile solid
 */
export function createLProfile(
  length = 100,
  flange1Width = 50,
  flange2Width = 50,
  thickness = 5
) {
  return makeBox([0, 0, 0], [flange1Width, thickness, length])
    .fuse(makeBox([0, 0, 0], [thickness, flange2Width, length]));
}