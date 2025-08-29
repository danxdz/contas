import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import '../styles/SetupComponents.css';

const PartSetup = ({ config, onUpdate, sceneRef }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const partMeshRef = useRef(null);

  // Real-time update for position, opacity, and wireframe
  useEffect(() => {
    if (partMeshRef.current) {
      // Update position
      partMeshRef.current.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
      
      // Update material properties
      if (partMeshRef.current.material) {
        partMeshRef.current.material.opacity = config.opacity || 0.5;
        partMeshRef.current.material.wireframe = config.showWireframe || false;
        partMeshRef.current.material.needsUpdate = true;
      }
    }
  }, [config.position.x, config.position.y, config.position.z, 
      config.opacity, config.showWireframe]);

  const loadPartFile = (file) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    
    reader.onload = (e) => {
      const contents = e.target.result;
      
      if (fileName.endsWith('.stl')) {
        loadSTL(contents);
      } else {
        setError('Unsupported file format. Please use STL files.');
        setLoading(false);
      }
    };
    
    if (fileName.endsWith('.stl')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const loadSTL = (contents) => {
    if (!sceneRef?.current) {
      setError('Scene not ready');
      setLoading(false);
      return;
    }
    
    const scene = sceneRef.current;
    
    // Remove old part
    const oldPart = scene.getObjectByName('part');
    if (oldPart) scene.remove(oldPart);
    
    const loader = new STLLoader();
    const geometry = loader.parse(contents);
    
    // Center and scale geometry
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const center = box.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -center.y, -center.z);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      wireframe: config.showWireframe || false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'part';
    mesh.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    mesh.scale.set(
      config.scale || 1,
      config.scale || 1,
      config.scale || 1
    );
    
    scene.add(mesh);
    partMeshRef.current = mesh;  // Store reference for real-time updates
    
    // Update config with part dimensions
    const size = box.getSize(new THREE.Vector3());
    onUpdate({
      ...config,
      dimensions: {
        x: size.x * (config.scale || 1),
        y: size.y * (config.scale || 1),
        z: size.z * (config.scale || 1)
      }
    });
    
    setLoading(false);
  };

  const createSimplePart = (type) => {
    if (!sceneRef?.current) return;
    
    const scene = sceneRef.current;
    
    // Remove old part
    const oldPart = scene.getObjectByName('part');
    if (oldPart) scene.remove(oldPart);
    
    let geometry;
    
    switch(type) {
      case 'pocket':
        // Create a block with a pocket
        geometry = new THREE.BoxGeometry(80, 60, 20);
        break;
      case 'holes':
        // Create a plate with holes pattern
        geometry = new THREE.BoxGeometry(100, 80, 10);
        break;
      case 'contour':
        // Create a complex contour shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(40, 0);
        shape.lineTo(40, 30);
        shape.lineTo(20, 30);
        shape.lineTo(20, 20);
        shape.lineTo(0, 20);
        shape.closePath();
        
        const extrudeSettings = {
          depth: 15,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1,
          bevelSegments: 2
        };
        
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        break;
      default:
        geometry = new THREE.BoxGeometry(60, 40, 25);
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      wireframe: config.showWireframe || false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'part';
    mesh.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    
    scene.add(mesh);
    partMeshRef.current = mesh;  // Store reference for real-time updates
    
    onUpdate({
      ...config,
      type: type
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Part Setup</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Load Part Model</h4>
        <input
          type="file"
          accept=".stl"
          onChange={(e) => loadPartFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="part-file-input"
        />
        <label 
          htmlFor="part-file-input"
          style={{
            display: 'block',
            padding: '10px',
            background: '#2a2f3e',
            border: '2px dashed #00d4ff',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
            color: loading ? '#888' : '#fff'
          }}
        >
          {loading ? 'Loading...' : 'Click to load STL file'}
        </label>
        {error && (
          <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px' }}>
            {error}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Or Create Sample Part</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => createSimplePart('pocket')}
            style={{
              padding: '8px',
              background: '#2a2f3e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Pocket Part
          </button>
          <button
            onClick={() => createSimplePart('holes')}
            style={{
              padding: '8px',
              background: '#2a2f3e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Holes Pattern
          </button>
          <button
            onClick={() => createSimplePart('contour')}
            style={{
              padding: '8px',
              background: '#2a2f3e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Contour Shape
          </button>
          <button
            onClick={() => createSimplePart('simple')}
            style={{
              padding: '8px',
              background: '#2a2f3e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Simple Block
          </button>
        </div>
      </div>
      
      {config.dimensions && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Part Dimensions</h4>
          <div style={{ 
            padding: '10px', 
            background: '#1a1f2e', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div>X: {config.dimensions.x?.toFixed(2) || 0} mm</div>
            <div>Y: {config.dimensions.y?.toFixed(2) || 0} mm</div>
            <div>Z: {config.dimensions.z?.toFixed(2) || 0} mm</div>
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
        <h4>Display Options</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={config.showWireframe || false}
            onChange={(e) => onUpdate({
              ...config,
              showWireframe: e.target.checked
            })}
          />
          <span style={{ fontSize: '14px' }}>Show Wireframe</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <input
            type="checkbox"
            checked={config.showDimensions || false}
            onChange={(e) => onUpdate({
              ...config,
              showDimensions: e.target.checked
            })}
          />
          <span style={{ fontSize: '14px' }}>Show Dimensions</span>
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Opacity</h4>
        <input 
          type="range"
          min="0"
          max="100"
          value={(config.opacity || 0.5) * 100}
          onChange={(e) => onUpdate({
            ...config,
            opacity: parseInt(e.target.value) / 100
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
          <span>Transparent</span>
          <span>{Math.round((config.opacity || 0.5) * 100)}%</span>
          <span>Opaque</span>
        </div>
      </div>
    </div>
  );
};

export default PartSetup;