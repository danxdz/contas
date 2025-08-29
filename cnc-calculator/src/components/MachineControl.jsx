import React, { useState } from 'react';

const MachineControl = ({ simulation, onChange, toolRef, sceneRef }) => {
  const [jogStep, setJogStep] = useState(10); // mm
  const [jogMode, setJogMode] = useState('step'); // 'step' or 'continuous'
  const [workMode, setWorkMode] = useState('G54'); // Work coordinate system
  
  const jog = (axis, direction) => {
    const step = jogMode === 'continuous' ? 0.1 : jogStep;
    
    // Update simulation position
    const newPosition = {
      ...simulation.position,
      [axis]: simulation.position[axis] + (direction * step)
    };
    
    onChange(prev => ({
      ...prev,
      position: newPosition
    }));
    
    // Update 3D tool position if available
    if (toolRef?.current) {
      if (axis === 'x') toolRef.current.position.x = newPosition.x;
      if (axis === 'y') toolRef.current.position.y = newPosition.y;
      if (axis === 'z') toolRef.current.position.z = newPosition.z;
    }
  };
  
  const home = () => {
    const homePosition = { x: 0, y: 0, z: 250 };
    
    onChange(prev => ({
      ...prev,
      position: homePosition
    }));
    
    // Update 3D tool position
    if (toolRef?.current) {
      toolRef.current.position.set(homePosition.x, homePosition.y, homePosition.z);
    }
  };
  
  const goToZero = () => {
    const zeroPosition = { x: 0, y: 0, z: 0 };
    
    onChange(prev => ({
      ...prev,
      position: zeroPosition
    }));
    
    // Update 3D tool position
    if (toolRef?.current) {
      toolRef.current.position.set(0, 0, 0);
    }
  };
  
  return (
    <div style={{ 
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      height: '100%',
      background: '#0a0e1a',
      color: '#e0e0e0'
    }}>
      {/* Position Display */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#00d4ff', fontSize: '12px' }}>
          POSITION ({workMode})
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '15px'
        }}>
          {['x', 'y', 'z'].map(axis => (
            <div key={axis}>
              <div style={{ 
                color: axis === 'x' ? '#ff6666' : axis === 'y' ? '#66ff66' : '#6666ff',
                fontSize: '11px',
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                {axis}
              </div>
              <div style={{ 
                background: '#000',
                padding: '8px',
                borderRadius: '4px',
                fontFamily: 'Consolas, monospace',
                fontSize: '16px',
                color: '#00ff88',
                textAlign: 'right',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                {simulation.position[axis].toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Jog Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: 0, color: '#00d4ff', fontSize: '12px' }}>JOG CONTROL</h4>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select 
              value={jogStep}
              onChange={(e) => setJogStep(parseFloat(e.target.value))}
              style={{
                background: '#2a2f3e',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              <option value="0.01">0.01mm</option>
              <option value="0.1">0.1mm</option>
              <option value="1">1mm</option>
              <option value="10">10mm</option>
              <option value="100">100mm</option>
            </select>
          </div>
        </div>
        
        {/* XY Jog */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '4px',
          marginBottom: '10px'
        }}>
          <div />
          <button 
            onMouseDown={() => jog('y', 1)}
            style={{
              padding: '15px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#66ff66',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            title="Y+"
          >
            ↑
          </button>
          <div />
          
          <button 
            onMouseDown={() => jog('x', -1)}
            style={{
              padding: '15px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#ff6666',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            title="X-"
          >
            ←
          </button>
          <button 
            onClick={home}
            style={{
              padding: '15px',
              background: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#ffaa00',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Home"
          >
            🏠
          </button>
          <button 
            onMouseDown={() => jog('x', 1)}
            style={{
              padding: '15px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#ff6666',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            title="X+"
          >
            →
          </button>
          
          <div />
          <button 
            onMouseDown={() => jog('y', -1)}
            style={{
              padding: '15px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#66ff66',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            title="Y-"
          >
            ↓
          </button>
          <div />
        </div>
        
        {/* Z Jog */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onMouseDown={() => jog('z', -1)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#6666ff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Z-"
          >
            Z ↓
          </button>
          <button 
            onClick={goToZero}
            style={{
              flex: 1,
              padding: '12px',
              background: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#00ff88',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Go to Work Zero"
          >
            ZERO
          </button>
          <button 
            onMouseDown={() => jog('z', 1)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#2a2f3e',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#6666ff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Z+"
          >
            Z ↑
          </button>
        </div>
      </div>
      
      {/* Spindle & Feed Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#00d4ff', fontSize: '12px' }}>
          SPINDLE & FEED
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              color: '#888', 
              fontSize: '10px', 
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Spindle (RPM)
            </label>
            <input 
              type="number"
              value={simulation.spindleSpeed || 0}
              onChange={(e) => onChange(prev => ({ 
                ...prev, 
                spindleSpeed: parseInt(e.target.value) || 0 
              }))}
              style={{
                width: '100%',
                padding: '6px',
                background: '#2a2f3e',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#00ff88',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              color: '#888', 
              fontSize: '10px', 
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              Feed (mm/min)
            </label>
            <input 
              type="number"
              value={simulation.feedRate || 0}
              onChange={(e) => onChange(prev => ({ 
                ...prev, 
                feedRate: parseInt(e.target.value) || 0 
              }))}
              style={{
                width: '100%',
                padding: '6px',
                background: '#2a2f3e',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#00ff88',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        {/* Control Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px',
          marginTop: '10px'
        }}>
          <button
            onClick={() => onChange(prev => ({ 
              ...prev, 
              spindleSpeed: prev.spindleSpeed > 0 ? 0 : 12000 
            }))}
            style={{
              padding: '8px',
              background: simulation.spindleSpeed > 0 ? '#00ff88' : '#333',
              border: 'none',
              borderRadius: '4px',
              color: simulation.spindleSpeed > 0 ? '#000' : '#888',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {simulation.spindleSpeed > 0 ? 'M5' : 'M3'}
          </button>
          <button
            onClick={() => onChange(prev => ({ 
              ...prev, 
              coolant: !prev.coolant 
            }))}
            style={{
              padding: '8px',
              background: simulation.coolant ? '#00d4ff' : '#333',
              border: 'none',
              borderRadius: '4px',
              color: simulation.coolant ? '#000' : '#888',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {simulation.coolant ? 'M9' : 'M8'}
          </button>
          <button
            onClick={() => onChange(prev => ({ 
              ...prev, 
              mist: !prev.mist 
            }))}
            style={{
              padding: '8px',
              background: simulation.mist ? '#ffaa00' : '#333',
              border: 'none',
              borderRadius: '4px',
              color: simulation.mist ? '#000' : '#888',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            M7
          </button>
        </div>
      </div>
      
      {/* Status Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
        borderRadius: '8px',
        padding: '10px',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 'auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#888' }}>TOOL</div>
          <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>
            T{simulation.tool || '0'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#888' }}>MODE</div>
          <div style={{ color: '#00ff88', fontWeight: 'bold' }}>
            {simulation.isPlaying ? 'AUTO' : 'MANUAL'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#888' }}>WORK</div>
          <div style={{ color: '#ffaa00', fontWeight: 'bold' }}>
            {workMode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineControl;