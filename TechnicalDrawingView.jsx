// TechnicalDrawingView.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";

// Technical drawing display component
function ProjectionView({ projection, title, position, dimensions }) {
  if (!projection) return null;
  
  // Extract dimensions
  const { width, height } = dimensions;
  const [x, y] = position;
  
  return (
    <div style={{ 
      position: 'absolute', 
      left: `${x}px`, 
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '1px solid #aaa',
      backgroundColor: '#f8f8f8',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '5px', borderBottom: '1px solid #ddd', backgroundColor: '#eee', fontSize: '12px', fontWeight: 'bold' }}>
        {title}
      </div>
      <Canvas 
        orthographic 
        camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: 'calc(100% - 30px)' }}
      >
        <ambientLight intensity={1} />
        
        {/* Visible lines */}
        {projection.visible && (
          <lineSegments>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attachObject={['attributes', 'position']}
                count={projection.visible.lines.length / 3}
                array={new Float32Array(projection.visible.lines)}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#000000" linewidth={2} />
          </lineSegments>
        )}
        
        {/* Hidden lines */}
        {projection.hidden && (
          <lineSegments>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attachObject={['attributes', 'position']}
                count={projection.hidden.lines.length / 3}
                array={new Float32Array(projection.hidden.lines)}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#777777" linewidth={1} dashSize={3} gapSize={1} />
          </lineSegments>
        )}
        
        <OrthographicCamera makeDefault position={[0, 0, 100]} />
      </Canvas>
    </div>
  );
}

export default function TechnicalDrawingView({ projections }) {
  if (!projections) return <div>Loading projections...</div>;
  
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Calculate view layout dimensions
  const viewWidth = containerSize.width / 2;
  const viewHeight = containerSize.height / 2;
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0' }}>
      {projections.standard && (
        <>
          {/* Front View - Center position */}
          <ProjectionView 
            projection={projections.standard.frontView} 
            title="Front View"
            position={[viewWidth / 2, viewHeight / 2]}
            dimensions={{ width: viewWidth, height: viewHeight }}
          />
          
          {/* Top View - Above front view */}
          <ProjectionView 
            projection={projections.standard.topView} 
            title="Top View"
            position={[viewWidth / 2, 0]}
            dimensions={{ width: viewWidth, height: viewHeight / 2 }}
          />
          
          {/* Right View - Right of front view */}
          <ProjectionView 
            projection={projections.standard.rightView} 
            title="Right View"
            position={[viewWidth * 1.5, viewHeight / 2]}
            dimensions={{ width: viewWidth / 2, height: viewHeight }}
          />
        </>
      )}
      
      {/* Render individual part projections if available */}
      {projections.parts && projections.parts.length > 0 && (
        <div style={{ position: 'absolute', top: viewHeight * 1.2, left: 0, width: '100%' }}>
          <h3 style={{ padding: '10px', margin: 0 }}>Component Views</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {projections.parts.map((part, index) => (
              <div key={index} style={{ margin: '10px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                <h4 style={{ padding: '5px', margin: 0, backgroundColor: '#eee' }}>{part.name}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '10px' }}>
                  {Object.entries(part.views).map(([viewName, view], viewIndex) => (
                    <div key={viewIndex} style={{ margin: '5px', width: '150px', height: '150px', border: '1px solid #ddd' }}>
                      <div style={{ padding: '3px', borderBottom: '1px solid #ddd', fontSize: '10px' }}>{viewName}</div>
                      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1 }}>
                        <ambientLight />
                        {/* View content */}
                      </Canvas>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}