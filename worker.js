import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";

// Import our model functions from the models folder
import { modelFunctions } from "./models";

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
    const result = modelFn(...Object.values(params));
    
    // Check if validation failed
    if (result && result.validationErrors) {
      return {
        error: true,
        validationErrors: result.validationErrors
      };
    }
    
    // Return the mesh data
    return {
      faces: result.mesh(),
      edges: result.meshEdges(),
    };
  });
}

// Export just the function needed
expose({ createMesh });