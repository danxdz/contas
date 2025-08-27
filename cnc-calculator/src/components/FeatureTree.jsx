import React, { useState } from 'react';

const FeatureTree = ({ features = [], onChange }) => {
  const [expanded, setExpanded] = useState({});
  
  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const featureIcons = {
    pocket: '📦',
    hole: '🕳️',
    slot: '➖',
    contour: '📐',
    surface: '🌊',
    thread: '🔩'
  };
  
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#00d4ff', fontSize: '14px' }}>
          Detected Features ({features.length})
        </h3>
      </div>
      
      {features.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#718096', 
          padding: '20px',
          fontSize: '12px'
        }}>
          No features detected.
          <br />
          Import a STEP file to detect features.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {features.map((feature, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <div 
                onClick={() => toggleExpand(idx)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>
                  {featureIcons[feature.type] || '📍'}
                </span>
                <span style={{ flex: 1, fontSize: '12px', color: '#e0e0e0' }}>
                  {feature.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px' }}>
                  {expanded[idx] ? '▼' : '▶'}
                </span>
              </div>
              
              {expanded[idx] && (
                <div style={{
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '11px'
                }}>
                  {Object.entries(feature).filter(([key]) => key !== 'type').map(([key, value]) => (
                    <div key={key} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{ color: '#718096' }}>{key}:</span>
                      <span style={{ color: '#00d4ff' }}>{value}</span>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button 
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid #00d4ff',
                        borderRadius: '4px',
                        color: '#00d4ff',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      Generate Path
                    </button>
                    <button 
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid #ff4444',
                        borderRadius: '4px',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Generate All Toolpaths
        </button>
      </div>
    </div>
  );
};

export default FeatureTree;