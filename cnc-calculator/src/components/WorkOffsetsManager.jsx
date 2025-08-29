import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const WorkOffsetsManager = ({ 
  workOffsets, 
  onUpdate, 
  sceneRef,
  onVisualsUpdate 
}) => {
  const [activeOffset, setActiveOffset] = useState(workOffsets.activeOffset);
  const [offsets, setOffsets] = useState({
    G54: workOffsets.G54,
    G55: workOffsets.G55,
    G56: workOffsets.G56,
    G57: workOffsets.G57,
    G58: workOffsets.G58,
    G59: workOffsets.G59
  });
  
  const [visibility, setVisibility] = useState({
    G54: true,
    G55: false,
    G56: false,
    G57: false,
    G58: false,
    G59: false
  });

  // Update 3D markers when offsets change
  useEffect(() => {
    if (!sceneRef?.current) return;
    const scene = sceneRef.current;
    
    // Remove old markers
    const oldMarkers = scene.getObjectByName('workOffsetMarkers');
    if (oldMarkers) scene.remove(oldMarkers);
    
    const markersGroup = new THREE.Group();
    markersGroup.name = 'workOffsetMarkers';
    
    Object.entries(offsets).forEach(([name, offset]) => {
      if (!visibility[name]) return;
      
      const markerGroup = new THREE.Group();
      
      // Create coordinate axes
      const axisLength = 30;
      const axisThickness = 0.5;
      
      // X axis - Red
      const xGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
      const xMaterial = new THREE.MeshBasicMaterial({ 
        color: name === activeOffset ? 0xff0000 : 0x800000,
        opacity: name === activeOffset ? 1 : 0.5,
        transparent: true
      });
      const xAxis = new THREE.Mesh(xGeometry, xMaterial);
      xAxis.rotation.z = -Math.PI / 2;
      xAxis.position.x = axisLength / 2;
      markerGroup.add(xAxis);
      
      // Y axis - Green
      const yGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
      const yMaterial = new THREE.MeshBasicMaterial({ 
        color: name === activeOffset ? 0x00ff00 : 0x008000,
        opacity: name === activeOffset ? 1 : 0.5,
        transparent: true
      });
      const yAxis = new THREE.Mesh(yGeometry, yMaterial);
      yAxis.rotation.x = Math.PI / 2;
      yAxis.position.y = axisLength / 2;
      markerGroup.add(yAxis);
      
      // Z axis - Blue
      const zGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
      const zMaterial = new THREE.MeshBasicMaterial({ 
        color: name === activeOffset ? 0x0080ff : 0x004080,
        opacity: name === activeOffset ? 1 : 0.5,
        transparent: true
      });
      const zAxis = new THREE.Mesh(zGeometry, zMaterial);
      zAxis.position.z = axisLength / 2;
      markerGroup.add(zAxis);
      
      // Origin sphere
      const sphereGeometry = new THREE.SphereGeometry(3, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: name === activeOffset ? 0xffff00 : 0x808000,
        opacity: name === activeOffset ? 1 : 0.6,
        transparent: true
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      markerGroup.add(sphere);
      
      // Add label
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      context.fillStyle = name === activeOffset ? '#ffff00' : '#808080';
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.fillText(name, 64, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(0, 0, 20);
      sprite.scale.set(20, 10, 1);
      markerGroup.add(sprite);
      
      // Position the marker
      markerGroup.position.set(offset.x, offset.y, offset.z);
      markersGroup.add(markerGroup);
    });
    
    scene.add(markersGroup);
    
    if (onVisualsUpdate) {
      onVisualsUpdate(markersGroup);
    }
  }, [offsets, visibility, activeOffset]);

  const handleOffsetChange = (name, axis, value) => {
    const newOffsets = {
      ...offsets,
      [name]: {
        ...offsets[name],
        [axis]: parseFloat(value) || 0
      }
    };
    setOffsets(newOffsets);
    
    if (onUpdate) {
      onUpdate({
        ...workOffsets,
        [name]: newOffsets[name],
        activeOffset
      });
    }
  };

  const handleActiveChange = (name) => {
    setActiveOffset(name);
    if (onUpdate) {
      onUpdate({
        ...workOffsets,
        activeOffset: name
      });
    }
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
        Work Offsets
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
      
      {Object.entries(offsets).map(([name, offset]) => (
        <div key={name} style={{
          marginBottom: '10px',
          padding: '12px',
          background: name === activeOffset ? 'rgba(0, 212, 255, 0.1)' : 'rgba(26, 31, 46, 0.5)',
          border: name === activeOffset ? '1px solid #00d4ff' : '1px solid rgba(0, 212, 255, 0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <button
              onClick={() => handleActiveChange(name)}
              style={{
                background: 'transparent',
                border: 'none',
                color: name === activeOffset ? '#00d4ff' : '#888',
                fontSize: '14px',
                fontWeight: name === activeOffset ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {name} {name === activeOffset && '✓'}
            </button>
            <button
              onClick={() => setVisibility(prev => ({ ...prev, [name]: !prev[name] }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: visibility[name] ? '#00d4ff' : '#444',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 5px'
              }}
              title={visibility[name] ? 'Hide' : 'Show'}
            >
              {visibility[name] ? '👁️' : '🙈'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { axis: 'x', color: '#ff6666' },
              { axis: 'y', color: '#66ff66' },
              { axis: 'z', color: '#6666ff' }
            ].map(({ axis, color }) => (
              <div key={axis}>
                <label style={{ 
                  fontSize: '10px', 
                  color: '#888',
                  textTransform: 'uppercase'
                }}>
                  {axis}
                </label>
                <input
                  type="number"
                  value={offset[axis]}
                  onChange={(e) => handleOffsetChange(name, axis, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    background: '#2a2f3e',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: color,
                    fontSize: '13px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{
        marginTop: '20px',
        padding: '10px',
        background: '#0a0e1a',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>💡 Tips:</div>
        <div>• Active offset shown in bright colors</div>
        <div>• Click 👁️ to show/hide in 3D</div>
        <div>• G54 typically at stock top</div>
        <div>• Use G55-G59 for multiple setups</div>
      </div>
    </div>
  );
};

export default WorkOffsetsManager;