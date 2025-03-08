import React, { useState, useEffect } from "react";
import { wrap } from "comlink";

import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";

import cadWorker from "./worker.js?worker";
import { modelFunctions } from "./cad";

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
  const params = getParamNames(fn);
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
  
  useEffect(() => {
    cad.createMesh(selectedModel, params).then(m => setMesh(m));
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
      </div>
      
      <div style={{ flex: 1 }}>
        {mesh ? (
          <ThreeContext>
            <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
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
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}