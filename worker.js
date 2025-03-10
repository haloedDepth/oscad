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
  console.time(`[PERF] Total ${modelName} creation`);
  
  return started.then(() => {
    // Get the model creation function
    const modelFn = modelFunctions[modelName];
    
    console.time(`[PERF] ${modelName} model function`);
    // Call the function with the parameter values
    const result = modelFn(...Object.values(params));
    console.timeEnd(`[PERF] ${modelName} model function`);
    
    // Check if validation failed
    if (result && result.validationErrors) {
      return {
        error: true,
        validationErrors: result.validationErrors
      };
    }
    
    // Set tessellation parameters based on model type
    // For spheres and ellipsoids, use much coarser mesh settings
    let meshOptions = {};
    if (modelName === "Sphere" || modelName === "Ellipsoid") {
      // Use significantly reduced detail for curved surfaces
      // Increase tolerance (less precision, fewer triangles)
      // Increase angular tolerance (fewer segments for curved sections)
      meshOptions = { 
        tolerance: 0.1,           // Default is 1e-3 (0.001)
        angularTolerance: 15      // Default is 0.1 (degrees)
      };
      console.log(`[INFO] Using optimized mesh settings for ${modelName}`);
    }
    
    // Generate and time mesh operations
    console.time(`[PERF] ${modelName} faces generation`);
    const faces = result.mesh(meshOptions);
    console.timeEnd(`[PERF] ${modelName} faces generation`);
    
    // Log mesh details for debugging
    if (faces && faces.triangles) {
      console.log(`[INFO] ${modelName} triangles: ${faces.triangles.length/3}, vertices: ${faces.vertices.length/3}`);
    }
    
    console.time(`[PERF] ${modelName} edges generation`);
    const edges = result.meshEdges(meshOptions);
    console.timeEnd(`[PERF] ${modelName} edges generation`);
    
    console.timeEnd(`[PERF] Total ${modelName} creation`);
    
    // Return the mesh data
    return {
      faces: faces,
      edges: edges,
    };
  });
}

// Export just the function needed
expose({ createMesh });