import React, { useEffect } from 'react';
import * as THREE from 'three';
import '../styles/SetupComponents.css';

const FixtureSetup = ({ config, onUpdate, sceneRef }) => {
  // Real-time update whenever config changes
  useEffect(() => {
    updateFixtureInScene();
  }, [config.type, config.position.x, config.position.y, config.position.z, 
      config.jawWidth, config.jawOpening, config.chuckDiameter, config.jawStroke]);

  const updateFixtureInScene = () => {
    if (!sceneRef?.current) return;
    
    const scene = sceneRef.current;
    
    // Remove old fixture
    const oldFixture = scene.getObjectByName('fixture');
    if (oldFixture) scene.remove(oldFixture);
    
    const fixtureGroup = new THREE.Group();
    fixtureGroup.name = 'fixture';
    
    if (config.type === 'vise') {
      // Create vise jaws
      const jawWidth = config.jawWidth || 150;
      const jawHeight = 60;
      const jawDepth = 30;
      
      // Fixed jaw
      const fixedJawGeometry = new THREE.BoxGeometry(jawDepth, jawWidth, jawHeight);
      const jawMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x505050,
        metalness: 0.8,
        roughness: 0.2
      });
      const fixedJaw = new THREE.Mesh(fixedJawGeometry, jawMaterial);
      fixedJaw.position.set(-40, 0, -25);
      fixtureGroup.add(fixedJaw);
      
      // Moving jaw
      const movingJaw = new THREE.Mesh(fixedJawGeometry, jawMaterial);
      movingJaw.position.set(40, 0, -25);
      fixtureGroup.add(movingJaw);
      
      // Base
      const baseGeometry = new THREE.BoxGeometry(120, jawWidth, 20);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x303030,
        metalness: 0.7,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, -60);
      fixtureGroup.add(base);
      
    } else if (config.type === 'chuck') {
      // Create 3-jaw chuck
      const chuckRadius = 80;
      const chuckGeometry = new THREE.CylinderGeometry(chuckRadius, chuckRadius, 40, 32);
      const chuckMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x606060,
        metalness: 0.8,
        roughness: 0.2
      });
      const chuck = new THREE.Mesh(chuckGeometry, chuckMaterial);
      chuck.rotation.x = Math.PI / 2;
      chuck.position.z = -30;
      fixtureGroup.add(chuck);
      
      // Add jaws
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const jawGeometry = new THREE.BoxGeometry(20, 40, 30);
        const jaw = new THREE.Mesh(jawGeometry, chuckMaterial);
        jaw.position.x = Math.cos(angle) * 40;
        jaw.position.y = Math.sin(angle) * 40;
        jaw.position.z = -15;
        jaw.rotation.z = angle;
        fixtureGroup.add(jaw);
      }
    } else if (config.type === 'table') {
      // T-slot table
      const tableGeometry = new THREE.BoxGeometry(400, 300, 20);
      const tableMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x404040,
        metalness: 0.7,
        roughness: 0.3
      });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.z = -60;
      fixtureGroup.add(table);
      
      // Add T-slots
      const slotGeometry = new THREE.BoxGeometry(5, 300, 10);
      const slotMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
      for (let i = -150; i <= 150; i += 50) {
        const slot = new THREE.Mesh(slotGeometry, slotMaterial);
        slot.position.set(i, 0, -55);
        fixtureGroup.add(slot);
      }
    } else if (config.type === 'custom') {
      // Custom fixture placeholder
      const customGeometry = new THREE.BoxGeometry(100, 100, 50);
      const customMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        transparent: true,
        opacity: 0.7
      });
      const custom = new THREE.Mesh(customGeometry, customMaterial);
      custom.position.z = -25;
      fixtureGroup.add(custom);
    }
    
    // Apply position
    fixtureGroup.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    
    scene.add(fixtureGroup);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ 
        color: '#00d4ff', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        Fixture Setup
        <span style={{ 
          fontSize: '10px', 
          color: '#4caf50',
          padding: '2px 6px',
          background: 'rgba(76, 175, 80, 0.2)',
          borderRadius: '3px',
          border: '1px solid #4caf50'
        }}>
          LIVE
        </span>
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Fixture Type</h4>
        <select 
          value={config.type}
          onChange={(e) => onUpdate({ ...config, type: e.target.value })}
          style={{ 
            width: '100%', 
            padding: '8px', 
            background: '#1a1f2e', 
            color: '#fff', 
            border: '1px solid #00d4ff',
            borderRadius: '4px'
          }}
        >
          <option value="vise">Machine Vise</option>
          <option value="chuck">3-Jaw Chuck</option>
          <option value="table">T-Slot Table</option>
          <option value="custom">Custom Fixture</option>
        </select>
      </div>
      
      {config.type === 'vise' && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Vise Settings</h4>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>Jaw Width (mm)</label>
            <input 
              type="number" 
              value={config.jawWidth || 150}
              onChange={(e) => onUpdate({
                ...config,
                jawWidth: parseFloat(e.target.value) || 150
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
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>Jaw Opening (mm)</label>
            <input 
              type="number" 
              value={config.jawOpening || 80}
              onChange={(e) => onUpdate({
                ...config,
                jawOpening: parseFloat(e.target.value) || 80
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
      )}
      
      {config.type === 'chuck' && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Chuck Settings</h4>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>Chuck Diameter (mm)</label>
            <input 
              type="number" 
              value={config.chuckDiameter || 160}
              onChange={(e) => onUpdate({
                ...config,
                chuckDiameter: parseFloat(e.target.value) || 160
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
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>Jaw Stroke (mm)</label>
            <input 
              type="number" 
              value={config.jawStroke || 50}
              onChange={(e) => onUpdate({
                ...config,
                jawStroke: parseFloat(e.target.value) || 50
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
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Position (mm)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>X</label>
            <input 
              type="number" 
              value={config.position.x}
              onChange={(e) => onUpdate({
                ...config,
                position: { ...config.position, x: parseFloat(e.target.value) || 0 }
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
            <label style={{ fontSize: '12px', color: '#888' }}>Y</label>
            <input 
              type="number" 
              value={config.position.y}
              onChange={(e) => onUpdate({
                ...config,
                position: { ...config.position, y: parseFloat(e.target.value) || 0 }
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
            <label style={{ fontSize: '12px', color: '#888' }}>Z</label>
            <input 
              type="number" 
              value={config.position.z}
              onChange={(e) => onUpdate({
                ...config,
                position: { ...config.position, z: parseFloat(e.target.value) || 0 }
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
        <h4>Clamping Force</h4>
        <input 
          type="range"
          min="0"
          max="100"
          value={config.clampingForce || 50}
          onChange={(e) => onUpdate({
            ...config,
            clampingForce: parseInt(e.target.value)
          })}
          style={{ width: '100%' }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#888',
          marginTop: '5px'
        }}>
          <span>Light</span>
          <span>{config.clampingForce || 50}%</span>
          <span>Heavy</span>
        </div>
      </div>
    </div>
  );
};

export default FixtureSetup;