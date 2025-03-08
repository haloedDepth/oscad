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
        padding: "5px", 
        borderBottom: "1px solid #eee", 
        display: "flex", 
        alignItems: "center",
        height: "30px",
        backgroundColor: "#f8f8f8",
        fontSize: "12px"
      }}>
        <select 
          value={selectedModel} 
          onChange={handleModelChange}
          style={{ marginRight: "10px", height: "20px", fontSize: "12px" }}
        >
          {Object.keys(modelFunctions).map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        
        <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}>
          {Object.entries(params).map(([paramName, value]) => {
            const isBoolean = typeof value === 'boolean';
            
            return (
              <div key={paramName} style={{ marginRight: "10px", whiteSpace: "nowrap" }}>
                {paramName}:
                {isBoolean ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleParamChange(paramName, e.target.checked)}
                    style={{ marginLeft: "3px" }}
                  />
                ) : (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                    style={{ width: "40px", marginLeft: "3px", height: "18px", fontSize: "12px" }}
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