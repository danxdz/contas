import React from 'react';
import * as THREE from 'three';

const StockSetup = ({ config, onUpdate, sceneRef }) => {
  const applyStockToScene = () => {
    if (!sceneRef?.current) return;
    
    const scene = sceneRef.current;
    
    // Remove old stock
    const oldStock = scene.getObjectByName('stock');
    if (oldStock) scene.remove(oldStock);
    
    // Create new stock based on type
    let stockGeometry;
    const material = new THREE.MeshPhongMaterial({
      color: 0x8b7355,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    if (config.type === 'block') {
      stockGeometry = new THREE.BoxGeometry(
        config.dimensions.x,
        config.dimensions.y,
        config.dimensions.z
      );
    } else if (config.type === 'cylinder') {
      stockGeometry = new THREE.CylinderGeometry(
        config.dimensions.x / 2,
        config.dimensions.x / 2,
        config.dimensions.z,
        32
      );
    } else if (config.type === 'tube') {
      const outerRadius = config.dimensions.x / 2;
      const innerRadius = outerRadius * 0.7;
      stockGeometry = new THREE.CylinderGeometry(
        outerRadius,
        outerRadius,
        config.dimensions.z,
        32,
        1,
        false,
        0,
        Math.PI * 2
      );
    }
    
    const stock = new THREE.Mesh(stockGeometry, material);
    stock.name = 'stock';
    stock.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    
    if (config.type === 'cylinder' || config.type === 'tube') {
      stock.rotation.x = Math.PI / 2;
    }
    
    scene.add(stock);
    console.log('Stock applied to scene:', config);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Stock Setup</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Stock Type</h4>
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
          <option value="block">Block</option>
          <option value="cylinder">Cylinder</option>
          <option value="tube">Tube</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Dimensions (mm)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>
              {config.type === 'cylinder' || config.type === 'tube' ? 'Diameter' : 'X Width'}
            </label>
            <input 
              type="number" 
              value={config.dimensions.x}
              onChange={(e) => onUpdate({
                ...config,
                dimensions: { ...config.dimensions, x: parseFloat(e.target.value) || 0 }
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
            <label style={{ fontSize: '12px', color: '#888' }}>Y Depth</label>
            <input 
              type="number" 
              value={config.dimensions.y}
              onChange={(e) => onUpdate({
                ...config,
                dimensions: { ...config.dimensions, y: parseFloat(e.target.value) || 0 }
              })}
              disabled={config.type === 'cylinder' || config.type === 'tube'}
              style={{ 
                width: '100%', 
                padding: '5px',
                background: config.type === 'cylinder' || config.type === 'tube' ? '#1a1f2e' : '#2a2f3e',
                color: config.type === 'cylinder' || config.type === 'tube' ? '#666' : '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888' }}>Z Height</label>
            <input 
              type="number" 
              value={config.dimensions.z}
              onChange={(e) => onUpdate({
                ...config,
                dimensions: { ...config.dimensions, z: parseFloat(e.target.value) || 0 }
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
        <h4>Material</h4>
        <select 
          value={config.material || 'aluminum'}
          onChange={(e) => onUpdate({ ...config, material: e.target.value })}
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
          <option value="aluminum">Aluminum 6061</option>
          <option value="steel">Steel 1018</option>
          <option value="stainless">Stainless 304</option>
          <option value="brass">Brass</option>
          <option value="plastic">Plastic (Delrin)</option>
          <option value="wood">Wood</option>
        </select>
        
        <div style={{ 
          padding: '10px', 
          background: '#1a1f2e', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#888'
        }}>
          {config.material === 'aluminum' && 'Cutting Speed: 100-500 m/min | Feed: 0.1-0.3 mm/tooth'}
          {config.material === 'steel' && 'Cutting Speed: 50-80 m/min | Feed: 0.05-0.15 mm/tooth'}
          {config.material === 'stainless' && 'Cutting Speed: 40-60 m/min | Feed: 0.05-0.1 mm/tooth'}
          {config.material === 'brass' && 'Cutting Speed: 100-200 m/min | Feed: 0.1-0.2 mm/tooth'}
          {config.material === 'plastic' && 'Cutting Speed: 200-500 m/min | Feed: 0.2-0.5 mm/tooth'}
          {config.material === 'wood' && 'Cutting Speed: 300-1000 m/min | Feed: 0.3-1.0 mm/tooth'}
        </div>
      </div>
      
      <button 
        onClick={applyStockToScene}
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Apply Stock to Scene
      </button>
    </div>
  );
};

export default StockSetup;