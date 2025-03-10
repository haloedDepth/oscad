// models/ellipsoid.js
import { makeEllipsoid } from "replicad";

// Create an ellipsoid
export function createEllipsoid(aLength = 80, bLength = 50, cLength = 30) {
  return makeEllipsoid(aLength, bLength, cLength);
}