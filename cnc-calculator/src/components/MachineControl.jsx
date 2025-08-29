import React, { useState } from 'react';

const MachineControl = ({ simulation, onChange, toolRef }) => {
  const [jogStep, setJogStep] = useState(1);
  
  const jog = (axis, direction) => {
    const newPosition = {
      ...simulation.position,
      [axis]: simulation.position[axis] + (direction * jogStep)
    };
    
    onChange(prev => ({
      ...prev,
      position: newPosition
    }));
    
    if (toolRef?.current) {
      if (axis === 'x') toolRef.current.position.x = newPosition.x;
      if (axis === 'y') toolRef.current.position.y = newPosition.y;
      if (axis === 'z') toolRef.current.position.z = newPosition.z;
    }
  };
  
  const home = () => {
    onChange(prev => ({
      ...prev,
      position: { x: 0, y: 0, z: 250 }
    }));
    
    if (toolRef?.current) {
      toolRef.current.position.set(0, 0, 250);
    }
  };
  
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '8px 15px',
      height: '100%'
    }}>
      {/* Position Display */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['x', 'y', 'z'].map(axis => (
          <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ 
              color: axis === 'x' ? '#ff6666' : axis === 'y' ? '#66ff66' : '#6666ff',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {axis.toUpperCase()}
            </span>
            <span style={{ 
              fontFamily: 'monospace',
              color: '#00ff88',
              minWidth: '60px',
              textAlign: 'right'
            }}>
              {simulation.position[axis].toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ width: '1px', height: '20px', background: '#333' }} />
      
      {/* Jog Controls */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => jog('x', -1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#ff6666', cursor: 'pointer' }}>X-</button>
        <button onClick={() => jog('x', 1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#ff6666', cursor: 'pointer' }}>X+</button>
        <button onClick={() => jog('y', -1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#66ff66', cursor: 'pointer' }}>Y-</button>
        <button onClick={() => jog('y', 1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#66ff66', cursor: 'pointer' }}>Y+</button>
        <button onClick={() => jog('z', -1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#6666ff', cursor: 'pointer' }}>Z-</button>
        <button onClick={() => jog('z', 1)} style={{ padding: '4px 8px', background: '#2a2f3e', border: '1px solid #444', borderRadius: '3px', color: '#6666ff', cursor: 'pointer' }}>Z+</button>
      </div>
      
      <div style={{ width: '1px', height: '20px', background: '#333' }} />
      
      {/* Step Size */}
      <select 
        value={jogStep}
        onChange={(e) => setJogStep(parseFloat(e.target.value))}
        style={{
          background: '#2a2f3e',
          border: '1px solid #444',
          borderRadius: '3px',
          color: '#fff',
          padding: '4px',
          fontSize: '12px'
        }}
      >
        <option value="0.01">0.01</option>
        <option value="0.1">0.1</option>
        <option value="1">1</option>
        <option value="10">10</option>
        <option value="100">100</option>
      </select>
      
      <button onClick={home} style={{ padding: '4px 12px', background: '#333', border: '1px solid #555', borderRadius: '3px', color: '#ffaa00', cursor: 'pointer' }}>HOME</button>
      
      <div style={{ width: '1px', height: '20px', background: '#333' }} />
      
      {/* Status */}
      <span style={{ fontSize: '12px', color: '#888' }}>
        T{simulation.tool || '0'} | {simulation.isPlaying ? 'RUN' : 'IDLE'}
      </span>
    </div>
  );
};

export default MachineControl;