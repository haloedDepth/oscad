// TechnicalDrawingView.jsx - CORRECTED VERSION
import React, { useEffect, useRef, useState } from 'react';

// SVG Technical Drawing Projection component
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
      <div style={{ 
        padding: '5px', 
        borderBottom: '1px solid #ddd', 
        backgroundColor: '#eee', 
        fontSize: '12px', 
        fontWeight: 'bold' 
      }}>
        {title}
      </div>
      
      <div style={{ width: '100%', height: 'calc(100% - 30px)', position: 'relative' }}>
        <svg 
          viewBox={projection.combinedViewBox} 
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Visible lines */}
          <g>
            {projection.visible.paths.map((path, i) => (
              <path 
                key={`visible-${i}`} 
                d={path} 
                stroke="#000000" 
                strokeWidth="0.5" 
                fill="none"
              />
            ))}
          </g>
          
          {/* Hidden lines */}
          <g>
            {projection.hidden.paths.map((path, i) => (
              <path 
                key={`hidden-${i}`} 
                d={path} 
                stroke="#777777" 
                strokeWidth="0.3" 
                fill="none"
                strokeDasharray="2,1"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

// Component to render individual part views
function PartView({ part, index }) {
  if (!part || !part.views) return null;
  
  return (
    <div key={index} style={{ 
      margin: '10px', 
      border: '1px solid #ccc', 
      backgroundColor: 'white' 
    }}>
      <h4 style={{ 
        padding: '5px', 
        margin: 0, 
        backgroundColor: '#eee' 
      }}>
        {part.name}
      </h4>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        padding: '10px' 
      }}>
        {Object.entries(part.views).map(([viewName, view], viewIndex) => (
          <div key={viewIndex} style={{ 
            margin: '5px', 
            width: '150px', 
            height: '150px', 
            border: '1px solid #ddd' 
          }}>
            <div style={{ 
              padding: '3px', 
              borderBottom: '1px solid #ddd', 
              fontSize: '10px' 
            }}>
              {viewName}
            </div>
            <div style={{ 
              width: '100%', 
              height: 'calc(100% - 20px)' 
            }}>
              <svg 
                viewBox={view.combinedViewBox} 
                style={{ width: '100%', height: '100%' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Visible lines */}
                <g>
                  {view.visible.paths.map((path, i) => (
                    <path 
                      key={`visible-${i}`} 
                      d={path} 
                      stroke="#000000" 
                      strokeWidth="0.5" 
                      fill="none"
                    />
                  ))}
                </g>
                
                {/* Hidden lines */}
                <g>
                  {view.hidden.paths.map((path, i) => (
                    <path 
                      key={`hidden-${i}`} 
                      d={path} 
                      stroke="#777777" 
                      strokeWidth="0.3" 
                      fill="none"
                      strokeDasharray="2,1"
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>
        ))}
      </div>
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
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      backgroundColor: '#f0f0f0' 
    }}>
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
        <div style={{ 
          position: 'absolute', 
          top: viewHeight * 1.2, 
          left: 0, 
          width: '100%' 
        }}>
          <h3 style={{ padding: '10px', margin: 0 }}>Component Views</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {projections.parts.map((part, index) => (
              <PartView key={index} part={part} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}