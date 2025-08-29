import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const LightingSetup = ({ lights, config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState(config);

  // Update local config when prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateLight = (lightKey, property, value) => {
    const newConfig = { ...localConfig };
    
    if (property === 'position') {
      newConfig[lightKey].position = { ...newConfig[lightKey].position, ...value };
    } else {
      newConfig[lightKey][property] = value;
    }
    
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const applyPreset = (preset) => {
    let newConfig = { ...localConfig };
    
    switch(preset) {
      case 'bright':
        newConfig = {
          ambient: { ...newConfig.ambient, enabled: true, intensity: 0.8 },
          directional1: { ...newConfig.directional1, enabled: true, intensity: 1.0 },
          directional2: { ...newConfig.directional2, enabled: true, intensity: 0.6 },
          spot1: { ...newConfig.spot1, enabled: false },
          hemisphere: { ...newConfig.hemisphere, enabled: true, intensity: 0.4 }
        };
        break;
      case 'normal':
        newConfig = {
          ambient: { ...newConfig.ambient, enabled: true, intensity: 0.5 },
          directional1: { ...newConfig.directional1, enabled: true, intensity: 0.8 },
          directional2: { ...newConfig.directional2, enabled: true, intensity: 0.4 },
          spot1: { ...newConfig.spot1, enabled: false },
          hemisphere: { ...newConfig.hemisphere, enabled: true, intensity: 0.3 }
        };
        break;
      case 'dim':
        newConfig = {
          ambient: { ...newConfig.ambient, enabled: true, intensity: 0.3 },
          directional1: { ...newConfig.directional1, enabled: true, intensity: 0.5 },
          directional2: { ...newConfig.directional2, enabled: false },
          spot1: { ...newConfig.spot1, enabled: false },
          hemisphere: { ...newConfig.hemisphere, enabled: true, intensity: 0.2 }
        };
        break;
      case 'workshop':
        newConfig = {
          ambient: { ...newConfig.ambient, enabled: true, intensity: 0.6, color: '#ffffee' },
          directional1: { ...newConfig.directional1, enabled: true, intensity: 0.9, color: '#ffffff', position: { x: 100, y: 200, z: 300 } },
          directional2: { ...newConfig.directional2, enabled: true, intensity: 0.5, color: '#eeeeff' },
          spot1: { ...newConfig.spot1, enabled: true, intensity: 0.7, color: '#ffffaa' },
          hemisphere: { ...newConfig.hemisphere, enabled: false }
        };
        break;
    }
    
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  return (
    <div style={{ 
      padding: '15px',
      height: '100%',
      overflowY: 'auto',
      background: '#0a0e1a'
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Lighting Setup</h3>
      
      {/* Presets */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#888', marginBottom: '10px' }}>Presets</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
          <button onClick={() => applyPreset('bright')} style={{
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>Bright</button>
          <button onClick={() => applyPreset('normal')} style={{
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>Normal</button>
          <button onClick={() => applyPreset('dim')} style={{
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>Dim</button>
          <button onClick={() => applyPreset('workshop')} style={{
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>Workshop</button>
        </div>
      </div>

      {/* Ambient Light */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#1a1f2e', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: '#00d4ff', margin: 0 }}>Ambient Light</h4>
          <input 
            type="checkbox" 
            checked={localConfig.ambient.enabled}
            onChange={(e) => updateLight('ambient', 'enabled', e.target.checked)}
          />
        </div>
        {localConfig.ambient.enabled && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Intensity</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={localConfig.ambient.intensity}
                onChange={(e) => updateLight('ambient', 'intensity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ color: '#fff', fontSize: '12px' }}>{localConfig.ambient.intensity}</span>
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px' }}>Color</label>
              <input 
                type="color"
                value={localConfig.ambient.color}
                onChange={(e) => updateLight('ambient', 'color', e.target.value)}
                style={{ width: '50px', height: '25px', marginLeft: '10px' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Main Directional Light */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#1a1f2e', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: '#00d4ff', margin: 0 }}>Main Light</h4>
          <input 
            type="checkbox" 
            checked={localConfig.directional1.enabled}
            onChange={(e) => updateLight('directional1', 'enabled', e.target.checked)}
          />
        </div>
        {localConfig.directional1.enabled && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Intensity</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={localConfig.directional1.intensity}
                onChange={(e) => updateLight('directional1', 'intensity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ color: '#fff', fontSize: '12px' }}>{localConfig.directional1.intensity}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Color</label>
              <input 
                type="color"
                value={localConfig.directional1.color}
                onChange={(e) => updateLight('directional1', 'color', e.target.value)}
                style={{ width: '50px', height: '25px', marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                <input 
                  type="number"
                  value={localConfig.directional1.position.x}
                  onChange={(e) => updateLight('directional1', 'position', { x: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="X"
                />
                <input 
                  type="number"
                  value={localConfig.directional1.position.y}
                  onChange={(e) => updateLight('directional1', 'position', { y: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="Y"
                />
                <input 
                  type="number"
                  value={localConfig.directional1.position.z}
                  onChange={(e) => updateLight('directional1', 'position', { z: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="Z"
                />
              </div>
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px' }}>
                <input 
                  type="checkbox"
                  checked={localConfig.directional1.castShadow}
                  onChange={(e) => updateLight('directional1', 'castShadow', e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Cast Shadows
              </label>
            </div>
          </>
        )}
      </div>

      {/* Fill Directional Light */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#1a1f2e', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: '#00d4ff', margin: 0 }}>Fill Light</h4>
          <input 
            type="checkbox" 
            checked={localConfig.directional2.enabled}
            onChange={(e) => updateLight('directional2', 'enabled', e.target.checked)}
          />
        </div>
        {localConfig.directional2.enabled && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Intensity</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={localConfig.directional2.intensity}
                onChange={(e) => updateLight('directional2', 'intensity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ color: '#fff', fontSize: '12px' }}>{localConfig.directional2.intensity}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Color</label>
              <input 
                type="color"
                value={localConfig.directional2.color}
                onChange={(e) => updateLight('directional2', 'color', e.target.value)}
                style={{ width: '50px', height: '25px', marginLeft: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                <input 
                  type="number"
                  value={localConfig.directional2.position.x}
                  onChange={(e) => updateLight('directional2', 'position', { x: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="X"
                />
                <input 
                  type="number"
                  value={localConfig.directional2.position.y}
                  onChange={(e) => updateLight('directional2', 'position', { y: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="Y"
                />
                <input 
                  type="number"
                  value={localConfig.directional2.position.z}
                  onChange={(e) => updateLight('directional2', 'position', { z: parseFloat(e.target.value) })}
                  style={{ padding: '4px', background: '#0a0e1a', border: '1px solid #333', color: '#fff' }}
                  placeholder="Z"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hemisphere Light */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#1a1f2e', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: '#00d4ff', margin: 0 }}>Hemisphere Light</h4>
          <input 
            type="checkbox" 
            checked={localConfig.hemisphere.enabled}
            onChange={(e) => updateLight('hemisphere', 'enabled', e.target.checked)}
          />
        </div>
        {localConfig.hemisphere.enabled && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Intensity</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={localConfig.hemisphere.intensity}
                onChange={(e) => updateLight('hemisphere', 'intensity', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ color: '#fff', fontSize: '12px' }}>{localConfig.hemisphere.intensity}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>Sky Color</label>
              <input 
                type="color"
                value={localConfig.hemisphere.skyColor}
                onChange={(e) => updateLight('hemisphere', 'skyColor', e.target.value)}
                style={{ width: '50px', height: '25px', marginLeft: '10px' }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px' }}>Ground Color</label>
              <input 
                type="color"
                value={localConfig.hemisphere.groundColor}
                onChange={(e) => updateLight('hemisphere', 'groundColor', e.target.value)}
                style={{ width: '50px', height: '25px', marginLeft: '10px' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LightingSetup;