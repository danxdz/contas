import React, { useEffect } from 'react';
import '../styles/SetupComponents.css';

const MachineSetup = ({ config, onUpdate }) => {
  // Real-time updates - just trigger onUpdate immediately when config changes
  // This ensures parent component gets updates in real-time
  useEffect(() => {
    // Any machine-specific scene updates could go here in the future
    // For now, the parent component handles the config changes
  }, [config.type, config.workEnvelope, config.spindleMax]);
  const machineTypes = {
    '3-axis': {
      name: '3-Axis Mill',
      axes: ['X', 'Y', 'Z'],
      description: 'Standard vertical machining center'
    },
    '4-axis': {
      name: '4-Axis Mill',
      axes: ['X', 'Y', 'Z', 'A'],
      description: 'Includes rotary axis'
    },
    '5-axis': {
      name: '5-Axis Mill',
      axes: ['X', 'Y', 'Z', 'A', 'B'],
      description: 'Full simultaneous 5-axis machining'
    },
    'lathe': {
      name: 'CNC Lathe',
      axes: ['X', 'Z'],
      description: 'Turning center'
    },
    'mill-turn': {
      name: 'Mill-Turn',
      axes: ['X', 'Y', 'Z', 'C'],
      description: 'Combined milling and turning'
    }
  };

  const currentMachine = machineTypes[config.type] || machineTypes['3-axis'];

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Machine Configuration</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Machine Type</h4>
        <select 
          value={config.type}
          onChange={(e) => onUpdate({ ...config, type: e.target.value })}
          style={{ 
            width: '100%', 
            padding: '8px', 
            background: '#1a1f2e', 
            color: '#fff', 
            border: '1px solid #00d4ff',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        >
          {Object.entries(machineTypes).map(([key, machine]) => (
            <option key={key} value={key}>{machine.name}</option>
          ))}
        </select>
        <div style={{ 
          padding: '10px', 
          background: '#1a1f2e', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#888'
        }}>
          {currentMachine.description}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Work Envelope (mm)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>X Travel</label>
            <input 
              type="number" 
              value={config.workEnvelope.x}
              onChange={(e) => onUpdate({
                ...config,
                workEnvelope: { ...config.workEnvelope, x: parseFloat(e.target.value) || 0 }
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Y Travel</label>
            <input 
              type="number" 
              value={config.workEnvelope.y}
              onChange={(e) => onUpdate({
                ...config,
                workEnvelope: { ...config.workEnvelope, y: parseFloat(e.target.value) || 0 }
              })}
              disabled={config.type === 'lathe'}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: config.type === 'lathe' ? '#1a1f2e' : '#2a2f3e',
                color: config.type === 'lathe' ? '#666' : '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Z Travel</label>
            <input 
              type="number" 
              value={config.workEnvelope.z}
              onChange={(e) => onUpdate({
                ...config,
                workEnvelope: { ...config.workEnvelope, z: parseFloat(e.target.value) || 0 }
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Spindle Specifications</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Max RPM</label>
            <input 
              type="number" 
              value={config.spindleMax}
              onChange={(e) => onUpdate({
                ...config,
                spindleMax: parseInt(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Power (kW)</label>
            <input 
              type="number" 
              value={config.spindlePower || 15}
              onChange={(e) => onUpdate({
                ...config,
                spindlePower: parseFloat(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Tool Changer</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Tool Capacity</label>
            <input 
              type="number" 
              value={config.toolCapacity || 24}
              onChange={(e) => onUpdate({
                ...config,
                toolCapacity: parseInt(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Change Time (sec)</label>
            <input 
              type="number" 
              value={config.toolChangeTime || 3}
              onChange={(e) => onUpdate({
                ...config,
                toolChangeTime: parseFloat(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Feed Rates</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Max Rapid (mm/min)</label>
            <input 
              type="number" 
              value={config.maxRapid || 30000}
              onChange={(e) => onUpdate({
                ...config,
                maxRapid: parseInt(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Max Feed (mm/min)</label>
            <input 
              type="number" 
              value={config.maxFeed || 10000}
              onChange={(e) => onUpdate({
                ...config,
                maxFeed: parseInt(e.target.value) || 0
              })}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: '#2a2f3e',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Coolant System</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={config.hasFloodCoolant !== false}
              onChange={(e) => onUpdate({
                ...config,
                hasFloodCoolant: e.target.checked
              })}
            />
            <span style={{ fontSize: '14px' }}>Flood Coolant</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={config.hasMistCoolant || false}
              onChange={(e) => onUpdate({
                ...config,
                hasMistCoolant: e.target.checked
              })}
            />
            <span style={{ fontSize: '14px' }}>Mist Coolant</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={config.hasThroughSpindle || false}
              onChange={(e) => onUpdate({
                ...config,
                hasThroughSpindle: e.target.checked
              })}
            />
            <span style={{ fontSize: '14px' }}>Through-Spindle Coolant</span>
          </label>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Control System</h4>
        <select 
          value={config.controlSystem || 'fanuc'}
          onChange={(e) => onUpdate({ ...config, controlSystem: e.target.value })}
          style={{ 
            width: '100%', 
            padding: '8px', 
            background: '#1a1f2e', 
            color: '#fff', 
            border: '1px solid #00d4ff',
            borderRadius: '4px'
          }}
        >
          <option value="fanuc">Fanuc</option>
          <option value="siemens">Siemens</option>
          <option value="haas">Haas</option>
          <option value="mazak">Mazak</option>
          <option value="okuma">Okuma</option>
          <option value="heidenhain">Heidenhain</option>
        </select>
      </div>
      
      <div style={{ 
        padding: '15px', 
        background: 'linear-gradient(135deg, #1a1f2e 0%, #2a2f3e 100%)', 
        borderRadius: '4px',
        border: '1px solid #00d4ff'
      }}>
        <h4 style={{ marginBottom: '10px', color: '#00d4ff' }}>Machine Summary</h4>
        <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
          <div>Type: {currentMachine.name}</div>
          <div>Axes: {currentMachine.axes.join(', ')}</div>
          <div>Work Volume: {config.workEnvelope.x} × {config.workEnvelope.y} × {config.workEnvelope.z} mm</div>
          <div>Spindle: {config.spindleMax} RPM / {config.spindlePower || 15} kW</div>
          <div>Tool Capacity: {config.toolCapacity || 24} tools</div>
          <div>Control: {config.controlSystem || 'Fanuc'}</div>
        </div>
      </div>
    </div>
  );
};

export default MachineSetup;