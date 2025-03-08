import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";

// Import our model functions
import { modelFunctions } from "./cad";

// Initialize OpenCascade
let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  setOC(OC);

  return true;
};
const started = init();

// Generic function to create a mesh for any model
function createMesh(modelName, params) {
  return started.then(() => {
    // Get the model creation function
    const modelFn = modelFunctions[modelName];
    
    // Call the function with the parameter values
    const shape = modelFn(...Object.values(params));
    
    // Return the mesh data
    return {
      faces: shape.mesh(),
      edges: shape.meshEdges(),
    };
  });
}

// Export just the function needed
expose({ createMesh });