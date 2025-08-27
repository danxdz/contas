import React from 'react';

const MachineControl = ({ simulation, onChange }) => {
  const jogStep = 1; // mm
  
  const jog = (axis, direction) => {
    onChange(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [axis]: prev.position[axis] + (direction * jogStep)
      }
    }));
  };
  
  const home = () => {
    onChange(prev => ({
      ...prev,
      position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 }
    }));
  };
  
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '100%' }}>
      {/* Position Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px'
      }}>
        {['x', 'y', 'z'].map(axis => (
          <div key={axis} style={{ textAlign: 'center' }}>
            <div style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>
              {axis.toUpperCase()}
            </div>
            <div style={{ 
              color: '#00ff88', 
              fontSize: '18px', 
              fontFamily: 'Consolas, monospace',
              marginTop: '4px'
            }}>
              {simulation.position[axis].toFixed(3)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Jog Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          <div />
          <button onClick={() => jog('y', 1)} title="Y+">↑</button>
          <div />
          <button onClick={() => jog('x', -1)} title="X-">←</button>
          <button onClick={home} title="Home">⌂</button>
          <button onClick={() => jog('x', 1)} title="X+">→</button>
          <div />
          <button onClick={() => jog('y', -1)} title="Y-">↓</button>
          <div />
        </div>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button onClick={() => jog('z', 1)} title="Z+">Z↑</button>
          <button onClick={() => jog('z', -1)} title="Z-">Z↓</button>
        </div>
      </div>
      
      {/* Spindle & Feed */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', color: '#718096', fontSize: '11px', marginBottom: '4px' }}>
            Spindle (RPM)
          </label>
          <input 
            type="number"
            value={simulation.spindleSpeed}
            onChange={(e) => onChange(prev => ({ ...prev, spindleSpeed: parseInt(e.target.value) || 0 }))}
            style={{
              width: '80px',
              padding: '4px 8px',
              background: '#0a0e1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#00ff88',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#718096', fontSize: '11px', marginBottom: '4px' }}>
            Feed (mm/min)
          </label>
          <input 
            type="number"
            value={simulation.feedRate}
            onChange={(e) => onChange(prev => ({ ...prev, feedRate: parseInt(e.target.value) || 0 }))}
            style={{
              width: '80px',
              padding: '4px 8px',
              background: '#0a0e1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#00ff88',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      {/* Tool Info */}
      <div style={{ 
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px'
      }}>
        <div style={{ color: '#718096', fontSize: '11px' }}>Active Tool</div>
        <div style={{ color: '#00d4ff', fontSize: '16px', fontWeight: 'bold' }}>
          {simulation.tool || 'None'}
        </div>
      </div>
      
      {/* Status Indicators */}
      <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%',
            background: simulation.spindleSpeed > 0 ? '#00ff88' : '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ⚙️
          </div>
          <div style={{ fontSize: '10px', color: '#718096', marginTop: '4px' }}>Spindle</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%',
            background: simulation.coolant ? '#00d4ff' : '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            💧
          </div>
          <div style={{ fontSize: '10px', color: '#718096', marginTop: '4px' }}>Coolant</div>
        </div>
      </div>
    </div>
  );
};

export default MachineControl;