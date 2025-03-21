import React, { useState, useEffect } from "react";
import { wrap } from "comlink";

import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";

import cadWorker from "./worker.js?worker";
import { modelFunctions } from "./models";

const cad = wrap(new cadWorker());

function getParamNames(fn) {
  const str = fn.toString();
  const paramStart = str.indexOf('(') + 1;
  const paramEnd = str.indexOf(')');
  const params = str.substring(paramStart, paramEnd).split(',');
  
  return params.map(p => {
    const [name, defaultValue] = p.trim().split('=');
    return {
      name: name.trim(), 
      defaultValue: eval(defaultValue?.trim())
    };
  });
}

const modelInfo = {};
Object.entries(modelFunctions).forEach(([name, fn]) => {
  // Get the original function (before validation wrapper)
  const originalFn = fn.original || fn;
  const params = getParamNames(originalFn);
  modelInfo[name] = {
    params: params.reduce((obj, param) => {
      obj[param.name] = param.defaultValue;
      return obj;
    }, {})
  };
});

export default function App() {
  const [selectedModel, setSelectedModel] = useState(Object.keys(modelFunctions)[0]);
  const [params, setParams] = useState(modelInfo[selectedModel].params);
  const [mesh, setMesh] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  
  useEffect(() => {
    setValidationErrors([]);
    console.time(`[PERF] worker call for ${selectedModel}`);
    console.log(`[INFO] Creating ${selectedModel} with params:`, params);
    
    cad.createMesh(selectedModel, params).then(result => {
      console.timeEnd(`[PERF] worker call for ${selectedModel}`);
      
      if (result.error && result.validationErrors) {
        setValidationErrors(result.validationErrors);
        setMesh(null);
      } else {
        setMesh(result);
      }
    });
  }, [selectedModel, params]);
  
  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setParams(modelInfo[newModel].params);
  };
  
  const handleParamChange = (paramName, value) => {
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ 
        padding: "10px", 
        borderBottom: "1px solid #eee", 
        backgroundColor: "#f8f8f8",
        fontSize: "12px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px"
        }}>
          <span style={{ marginRight: "5px", fontWeight: "bold" }}>Model:</span>
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            style={{ marginRight: "10px", height: "24px", fontSize: "12px" }}
          >
            {Object.keys(modelFunctions).map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "10px"
        }}>
          {Object.entries(params).map(([paramName, value]) => {
            const isBoolean = typeof value === 'boolean';
            
            return (
              <div key={paramName} style={{ 
                display: "flex", 
                alignItems: "center",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                padding: "5px 8px",
                borderRadius: "4px"
              }}>
                <span style={{ 
                  marginRight: "8px", 
                  fontWeight: "bold",
                  color: "#333"
                }}>
                  {paramName}:
                </span>
                
                {isBoolean ? (
                  <input
                    id={`param-${paramName}`}
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleParamChange(paramName, e.target.checked)}
                  />
                ) : (
                  <input
                    id={`param-${paramName}`}
                    type="number"
                    value={value}
                    onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                    style={{ width: "60px", height: "20px", fontSize: "12px" }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {validationErrors.length > 0 && (
          <div style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            fontSize: "12px"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Invalid parameters:</div>
            <ul style={{ margin: "0", paddingLeft: "20px" }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1 }}>
        {mesh ? (
          <ThreeContext>
            <ReplicadMesh 
              edges={mesh.edges} 
              faces={mesh.faces} 
              helperSpaces={mesh.helperSpaces || []} 
            />
          </ThreeContext>
        ) : (
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "12px",
            color: "#999"
          }}>
            {validationErrors.length > 0 ? 'Fix parameters to see model' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}