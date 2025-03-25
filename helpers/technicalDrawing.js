// helpers/technicalDrawing.js
import { drawProjection } from "replicad";
import { exportableModel } from '../helperUtils.js';

/**
 * Creates orthographic projections for a model from standard views
 * @param {Object} model - The replicad model
 * @returns {Object} Object with standard orthographic views
 */
export function createOrthographicProjections(model) {
  // Extract main model (if it's a model with helpers)
  const mainModel = exportableModel(model);
  
  // Create projections for standard views
  // From replicad/src/draw.ts:435, drawProjection returns {visible: Drawing, hidden: Drawing}
  const frontView = drawProjection(mainModel, "front");
  const topView = drawProjection(mainModel, "top");
  const rightView = drawProjection(mainModel, "right");
  
  // For models with multiple parts
  let partProjections = [];
  
  // If the model has separate components (like helperCuboid)
  if (model && model.main && Array.isArray(model.helperSpaces)) {
    partProjections = [{
      name: "Main Component",
      views: {
        front: drawProjection(model.main, "front"),
        top: drawProjection(model.main, "top"),
        right: drawProjection(model.main, "right")
      }
    }];
    
    // For helper spaces
    model.helperSpaces.forEach((helperSpace, index) => {
      partProjections.push({
        name: `Helper Space ${index + 1}`,
        views: {
          front: drawProjection(helperSpace, "front"),
          top: drawProjection(helperSpace, "top"),
          right: drawProjection(helperSpace, "right")
        }
      });
    });
  }
  
  return {
    standard: {
      frontView,
      topView,
      rightView
    },
    parts: partProjections
  };
}

/**
 * Processes projections to be suitable for rendering
 * @param {Object} projections - The projections object from createOrthographicProjections
 * @returns {Object} Processed projections ready for rendering
 */
export function processProjectionsForRendering(projections) {
  const processedViews = {};
  
  // Process standard views
  for (const [viewName, view] of Object.entries(projections.standard)) {
    // From replicad/src/shapes.ts, meshEdges() returns {lines, edgeGroups}
    // That's what we need to serialize
    const visibleMesh = view.visible.meshEdges ? view.visible.meshEdges() : null;
    const hiddenMesh = view.hidden.meshEdges ? view.hidden.meshEdges() : null;
    
    processedViews[viewName] = {
      visible: visibleMesh ? {
        // Convert TypedArrays to regular Arrays to ensure serialization works
        lines: Array.from(visibleMesh.lines || []),
        edgeGroups: visibleMesh.edgeGroups ? 
          visibleMesh.edgeGroups.map(group => ({...group})) : []
      } : { lines: [], edgeGroups: [] },
      hidden: hiddenMesh ? {
        lines: Array.from(hiddenMesh.lines || []),
        edgeGroups: hiddenMesh.edgeGroups ? 
          hiddenMesh.edgeGroups.map(group => ({...group})) : []
      } : { lines: [], edgeGroups: [] }
    };
  }
  
  // Process part views if available
  const processedParts = [];
  for (const part of projections.parts) {
    const views = {};
    for (const [viewName, view] of Object.entries(part.views)) {
      const visibleMesh = view.visible.meshEdges ? view.visible.meshEdges() : null;
      const hiddenMesh = view.hidden.meshEdges ? view.hidden.meshEdges() : null;
      
      views[viewName] = {
        visible: visibleMesh ? {
          lines: Array.from(visibleMesh.lines || []),
          edgeGroups: visibleMesh.edgeGroups ? 
            visibleMesh.edgeGroups.map(group => ({...group})) : []
        } : { lines: [], edgeGroups: [] },
        hidden: hiddenMesh ? {
          lines: Array.from(hiddenMesh.lines || []),
          edgeGroups: hiddenMesh.edgeGroups ? 
            hiddenMesh.edgeGroups.map(group => ({...group})) : []
        } : { lines: [], edgeGroups: [] }
      };
    }
    
    processedParts.push({
      name: part.name,
      views
    });
  }
  
  return {
    standard: processedViews,
    parts: processedParts
  };
}