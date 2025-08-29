import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const LightingSetup = ({ scene, onUpdate }) => {
  const [lights, setLights] = useState({
    ambient: {
      enabled: true,
      intensity: 0.5,
      color: '#ffffff'
    },
    directional1: {
      enabled: true,
      intensity: 0.8,
      color: '#ffffff',
      position: { x: 200, y: 200, z: 400 },
      castShadow: true
    },
    directional2: {
      enabled: true,
      intensity: 0.4,
      color: '#e0e0ff',
      position: { x: -200, y: 100, z: -200 },
      castShadow: false
    },
    spot1: {
      enabled: false,
      intensity: 0.6,
      color: '#ffff00',
      position: { x: 0, y: 0, z: 300 },
      angle: Math.PI / 6,
      penumbra: 0.1,
      castShadow: true
    },
    hemisphere: {
      enabled: true,
      skyColor: '#87ceeb',
      groundColor: '#362907',
      intensity: 0.3
    }
  });

  const [lightRefs] = useState({
    ambient: null,
    directional1: null,
    directional2: null,
    spot1: null,
    hemisphere: null
  });

  // Initialize lights
  useEffect(() => {
    if (!scene) return;

    // Clean up existing lights
    Object.values(lightRefs).forEach(light => {
      if (light) scene.remove(light);
    });

    // Ambient Light
    if (lights.ambient.enabled) {
      lightRefs.ambient = new THREE.AmbientLight(
        lights.ambient.color,
        lights.ambient.intensity
      );
      scene.add(lightRefs.ambient);
    }

    // Directional Light 1 (Main)
    if (lights.directional1.enabled) {
      lightRefs.directional1 = new THREE.DirectionalLight(
        lights.directional1.color,
        lights.directional1.intensity
      );
      lightRefs.directional1.position.set(
        lights.directional1.position.x,
        lights.directional1.position.y,
        lights.directional1.position.z
      );
      lightRefs.directional1.castShadow = lights.directional1.castShadow;
      
      // Shadow settings
      if (lights.directional1.castShadow) {
        lightRefs.directional1.shadow.mapSize.width = 2048;
        lightRefs.directional1.shadow.mapSize.height = 2048;
        lightRefs.directional1.shadow.camera.near = 0.5;
        lightRefs.directional1.shadow.camera.far = 2000;
        lightRefs.directional1.shadow.camera.left = -500;
        lightRefs.directional1.shadow.camera.right = 500;
        lightRefs.directional1.shadow.camera.top = 500;
        lightRefs.directional1.shadow.camera.bottom = -500;
      }
      
      scene.add(lightRefs.directional1);
    }

    // Directional Light 2 (Fill)
    if (lights.directional2.enabled) {
      lightRefs.directional2 = new THREE.DirectionalLight(
        lights.directional2.color,
        lights.directional2.intensity
      );
      lightRefs.directional2.position.set(
        lights.directional2.position.x,
        lights.directional2.position.y,
        lights.directional2.position.z
      );
      lightRefs.directional2.castShadow = lights.directional2.castShadow;
      scene.add(lightRefs.directional2);
    }

    // Spot Light
    if (lights.spot1.enabled) {
      lightRefs.spot1 = new THREE.SpotLight(
        lights.spot1.color,
        lights.spot1.intensity,
        1000,
        lights.spot1.angle,
        lights.spot1.penumbra
      );
      lightRefs.spot1.position.set(
        lights.spot1.position.x,
        lights.spot1.position.y,
        lights.spot1.position.z
      );
      lightRefs.spot1.castShadow = lights.spot1.castShadow;
      
      if (lights.spot1.castShadow) {
        lightRefs.spot1.shadow.mapSize.width = 1024;
        lightRefs.spot1.shadow.mapSize.height = 1024;
      }
      
      scene.add(lightRefs.spot1);
    }

    // Hemisphere Light
    if (lights.hemisphere.enabled) {
      lightRefs.hemisphere = new THREE.HemisphereLight(
        lights.hemisphere.skyColor,
        lights.hemisphere.groundColor,
        lights.hemisphere.intensity
      );
      scene.add(lightRefs.hemisphere);
    }

    // Notify parent of update
    if (onUpdate) onUpdate(lights);

    return () => {
      // Cleanup on unmount
      Object.values(lightRefs).forEach(light => {
        if (light) scene.remove(light);
      });
    };
  }, [scene]); // Only run on scene change

  // Update lights when settings change
  useEffect(() => {
    // Update ambient light
    if (lightRefs.ambient) {
      lightRefs.ambient.intensity = lights.ambient.intensity;
      lightRefs.ambient.color = new THREE.Color(lights.ambient.color);
      lightRefs.ambient.visible = lights.ambient.enabled;
    }

    // Update directional lights
    if (lightRefs.directional1) {
      lightRefs.directional1.intensity = lights.directional1.intensity;
      lightRefs.directional1.color = new THREE.Color(lights.directional1.color);
      lightRefs.directional1.position.set(
        lights.directional1.position.x,
        lights.directional1.position.y,
        lights.directional1.position.z
      );
      lightRefs.directional1.visible = lights.directional1.enabled;
    }

    if (lightRefs.directional2) {
      lightRefs.directional2.intensity = lights.directional2.intensity;
      lightRefs.directional2.color = new THREE.Color(lights.directional2.color);
      lightRefs.directional2.position.set(
        lights.directional2.position.x,
        lights.directional2.position.y,
        lights.directional2.position.z
      );
      lightRefs.directional2.visible = lights.directional2.enabled;
    }

    // Update spot light
    if (lightRefs.spot1) {
      lightRefs.spot1.intensity = lights.spot1.intensity;
      lightRefs.spot1.color = new THREE.Color(lights.spot1.color);
      lightRefs.spot1.position.set(
        lights.spot1.position.x,
        lights.spot1.position.y,
        lights.spot1.position.z
      );
      lightRefs.spot1.angle = lights.spot1.angle;
      lightRefs.spot1.penumbra = lights.spot1.penumbra;
      lightRefs.spot1.visible = lights.spot1.enabled;
    }

    // Update hemisphere light
    if (lightRefs.hemisphere) {
      lightRefs.hemisphere.intensity = lights.hemisphere.intensity;
      lightRefs.hemisphere.color = new THREE.Color(lights.hemisphere.skyColor);
      lightRefs.hemisphere.groundColor = new THREE.Color(lights.hemisphere.groundColor);
      lightRefs.hemisphere.visible = lights.hemisphere.enabled;
    }
  }, [lights]);

  const presets = {
    bright: {
      ambient: { intensity: 0.7 },
      directional1: { intensity: 1.0 },
      directional2: { intensity: 0.6 },
      hemisphere: { intensity: 0.4 }
    },
    normal: {
      ambient: { intensity: 0.5 },
      directional1: { intensity: 0.8 },
      directional2: { intensity: 0.4 },
      hemisphere: { intensity: 0.3 }
    },
    dim: {
      ambient: { intensity: 0.3 },
      directional1: { intensity: 0.5 },
      directional2: { intensity: 0.2 },
      hemisphere: { intensity: 0.2 }
    },
    workshop: {
      ambient: { intensity: 0.6, color: '#fffef0' },
      directional1: { intensity: 0.9, color: '#ffffff' },
      directional2: { intensity: 0.5, color: '#e0e0ff' },
      spot1: { enabled: true, intensity: 0.7 },
      hemisphere: { intensity: 0.3 }
    }
  };

  const applyPreset = (presetName) => {
    const preset = presets[presetName];
    if (!preset) return;

    setLights(prev => {
      const newLights = { ...prev };
      Object.keys(preset).forEach(lightKey => {
        if (newLights[lightKey]) {
          newLights[lightKey] = { ...newLights[lightKey], ...preset[lightKey] };
        }
      });
      return newLights;
    });
  };

  return (
    <div style={{ 
      padding: '15px',
      background: '#0f1420',
      borderRadius: '8px',
      color: '#e0e0e0'
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>🔆 Lighting Setup</h3>
      
      {/* Presets */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', marginBottom: '10px', color: '#888' }}>PRESETS</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.keys(presets).map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              style={{
                padding: '8px 15px',
                background: '#1a1f2e',
                border: '1px solid #333',
                borderRadius: '5px',
                color: '#00d4ff',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Ambient Light */}
      <div style={{ marginBottom: '15px', padding: '10px', background: '#1a1f2e', borderRadius: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={lights.ambient.enabled}
            onChange={(e) => setLights(prev => ({
              ...prev,
              ambient: { ...prev.ambient, enabled: e.target.checked }
            }))}
            style={{ marginRight: '10px' }}
          />
          <h4 style={{ margin: 0, flex: 1 }}>Ambient Light</h4>
          <input
            type="color"
            value={lights.ambient.color}
            onChange={(e) => setLights(prev => ({
              ...prev,
              ambient: { ...prev.ambient, color: e.target.value }
            }))}
            style={{ width: '40px', height: '25px', border: 'none', borderRadius: '3px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px' }}>Intensity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={lights.ambient.intensity}
            onChange={(e) => setLights(prev => ({
              ...prev,
              ambient: { ...prev.ambient, intensity: parseFloat(e.target.value) }
            }))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', width: '30px' }}>{lights.ambient.intensity}</span>
        </div>
      </div>

      {/* Main Directional Light */}
      <div style={{ marginBottom: '15px', padding: '10px', background: '#1a1f2e', borderRadius: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={lights.directional1.enabled}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional1: { ...prev.directional1, enabled: e.target.checked }
            }))}
            style={{ marginRight: '10px' }}
          />
          <h4 style={{ margin: 0, flex: 1 }}>Main Light</h4>
          <input
            type="color"
            value={lights.directional1.color}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional1: { ...prev.directional1, color: e.target.value }
            }))}
            style={{ width: '40px', height: '25px', border: 'none', borderRadius: '3px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <label style={{ fontSize: '12px' }}>Intensity:</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={lights.directional1.intensity}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional1: { ...prev.directional1, intensity: parseFloat(e.target.value) }
            }))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', width: '30px' }}>{lights.directional1.intensity}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={lights.directional1.castShadow}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional1: { ...prev.directional1, castShadow: e.target.checked }
            }))}
          />
          <label style={{ fontSize: '12px' }}>Cast Shadows</label>
        </div>
      </div>

      {/* Fill Light */}
      <div style={{ marginBottom: '15px', padding: '10px', background: '#1a1f2e', borderRadius: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={lights.directional2.enabled}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional2: { ...prev.directional2, enabled: e.target.checked }
            }))}
            style={{ marginRight: '10px' }}
          />
          <h4 style={{ margin: 0, flex: 1 }}>Fill Light</h4>
          <input
            type="color"
            value={lights.directional2.color}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional2: { ...prev.directional2, color: e.target.value }
            }))}
            style={{ width: '40px', height: '25px', border: 'none', borderRadius: '3px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px' }}>Intensity:</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={lights.directional2.intensity}
            onChange={(e) => setLights(prev => ({
              ...prev,
              directional2: { ...prev.directional2, intensity: parseFloat(e.target.value) }
            }))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', width: '30px' }}>{lights.directional2.intensity}</span>
        </div>
      </div>

      {/* Hemisphere Light */}
      <div style={{ marginBottom: '15px', padding: '10px', background: '#1a1f2e', borderRadius: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={lights.hemisphere.enabled}
            onChange={(e) => setLights(prev => ({
              ...prev,
              hemisphere: { ...prev.hemisphere, enabled: e.target.checked }
            }))}
            style={{ marginRight: '10px' }}
          />
          <h4 style={{ margin: 0, flex: 1 }}>Environment Light</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <label style={{ fontSize: '12px' }}>Intensity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={lights.hemisphere.intensity}
            onChange={(e) => setLights(prev => ({
              ...prev,
              hemisphere: { ...prev.hemisphere, intensity: parseFloat(e.target.value) }
            }))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', width: '30px' }}>{lights.hemisphere.intensity}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: '#888' }}>Sky</label>
            <input
              type="color"
              value={lights.hemisphere.skyColor}
              onChange={(e) => setLights(prev => ({
                ...prev,
                hemisphere: { ...prev.hemisphere, skyColor: e.target.value }
              }))}
              style={{ width: '100%', height: '25px', border: 'none', borderRadius: '3px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: '#888' }}>Ground</label>
            <input
              type="color"
              value={lights.hemisphere.groundColor}
              onChange={(e) => setLights(prev => ({
                ...prev,
                hemisphere: { ...prev.hemisphere, groundColor: e.target.value }
              }))}
              style={{ width: '100%', height: '25px', border: 'none', borderRadius: '3px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightingSetup;