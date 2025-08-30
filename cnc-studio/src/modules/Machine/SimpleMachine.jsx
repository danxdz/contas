import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MACHINE_MODULE_VERSION } from './version';

export default function SimpleMachine() {
  const [machineType, setMachineType] = useState('3axis-mill');
  const [tableSize, setTableSize] = useState({ x: 400, y: 300 });
  const [spindleHeight, setSpindleHeight] = useState(250);
  const [showMachine, setShowMachine] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const machineGroupRef = useRef(null);

  // Initialize and check for viewer
  useEffect(() => {
    const checkViewer = setInterval(() => {
      if (window.cncViewer && window.cncViewer.scene) {
        setIsInitialized(true);
        clearInterval(checkViewer);
      }
    }, 100);

    return () => clearInterval(checkViewer);
  }, []);

  // Create actual machine geometry in the scene
  useEffect(() => {
    if (!isInitialized || !showMachine) return;

    const scene = window.cncViewer.scene;
    if (!scene) return;

    // Remove old machine group if exists
    if (machineGroupRef.current) {
      scene.remove(machineGroupRef.current);
      machineGroupRef.current = null;
    }

    // Remove default table and tool from Viewer if they exist
    const defaultTable = scene.getObjectByName('defaultTable');
    if (defaultTable) {
      scene.remove(defaultTable);
    }
    const defaultTool = scene.getObjectByName('defaultTool');
    if (defaultTool) {
      scene.remove(defaultTool);
    }

    // Create machine group
    const machineGroup = new THREE.Group();
    machineGroup.name = 'machineGroup';
    machineGroupRef.current = machineGroup;

    // Materials
    const tableMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x404040, 
      metalness: 0.8,
      roughness: 0.2 
    });
    
    const frameMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x808080,
      metalness: 0.7,
      roughness: 0.3 
    });
    
    const spindleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x606060,
      metalness: 0.9,
      roughness: 0.1 
    });

    // Convert mm to scene units (assuming 1 unit = 1m)
    const scaleX = tableSize.x / 1000;
    const scaleY = tableSize.y / 1000;
    const scaleZ = spindleHeight / 1000;

    try {
      // 1. Create Table
      const tableThickness = 0.02; // 20mm
      const tableGeometry = new THREE.BoxGeometry(scaleX, scaleY, tableThickness);
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(0, 0, -tableThickness/2);
      table.name = 'table';
      
      // Add T-slots to table
      const slotWidth = 0.01;
      const slotDepth = 0.005;
      const slotSpacing = 0.05; // 50mm
      const numSlots = Math.floor(scaleX / slotSpacing) - 1;
      
      for (let i = 0; i < numSlots; i++) {
        const slotGeometry = new THREE.BoxGeometry(slotWidth, scaleY * 0.9, slotDepth);
        const slot = new THREE.Mesh(slotGeometry, new THREE.MeshPhongMaterial({ color: 0x202020 }));
        const xPos = -scaleX/2 + (i + 1) * slotSpacing;
        slot.position.set(xPos, 0, slotDepth/2);
        table.add(slot);
      }
      
      machineGroup.add(table);

      // 2. Create Machine Frame/Column
      const columnWidth = 0.08;
      const columnDepth = 0.12;
      const columnHeight = scaleZ + 0.1;
      
      // Back column
      const columnGeometry = new THREE.BoxGeometry(scaleX * 0.8, columnDepth, columnHeight);
      const column = new THREE.Mesh(columnGeometry, frameMaterial);
      column.position.set(0, -scaleY/2 - columnDepth/2, columnHeight/2);
      column.name = 'column';
      machineGroup.add(column);

      // Side supports
      const supportGeometry = new THREE.BoxGeometry(columnWidth, columnDepth, columnHeight * 0.7);
      const leftSupport = new THREE.Mesh(supportGeometry, frameMaterial);
      leftSupport.position.set(-scaleX/2 + columnWidth/2, -scaleY/2 - columnDepth/2, columnHeight * 0.35);
      machineGroup.add(leftSupport);
      
      const rightSupport = new THREE.Mesh(supportGeometry, frameMaterial);
      rightSupport.position.set(scaleX/2 - columnWidth/2, -scaleY/2 - columnDepth/2, columnHeight * 0.35);
      machineGroup.add(rightSupport);

      // 3. Create Spindle Assembly
      const spindleGroup = new THREE.Group();
      spindleGroup.name = 'spindleAssembly';
      
      // Spindle head (box that holds spindle)
      const headSize = 0.15;
      const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize * 1.2);
      const spindleHead = new THREE.Mesh(headGeometry, frameMaterial);
      spindleHead.position.set(0, 0, scaleZ);
      spindleGroup.add(spindleHead);
      
      // Actual spindle (cylinder)
      const spindleRadius = 0.03;
      const spindleLength = 0.2;
      const spindleGeometry = new THREE.CylinderGeometry(
        spindleRadius, 
        spindleRadius * 0.8, 
        spindleLength, 
        16
      );
      const spindle = new THREE.Mesh(spindleGeometry, spindleMaterial);
      spindle.rotation.x = Math.PI / 2;
      spindle.position.set(0, 0, scaleZ - spindleLength/2);
      spindle.name = 'spindle';
      spindleGroup.add(spindle);
      
      // Tool holder
      const holderGeometry = new THREE.ConeGeometry(spindleRadius * 0.8, 0.05, 8);
      const toolHolder = new THREE.Mesh(holderGeometry, spindleMaterial);
      toolHolder.rotation.x = -Math.PI / 2;
      toolHolder.position.set(0, 0, scaleZ - spindleLength - 0.025);
      spindleGroup.add(toolHolder);
      
      machineGroup.add(spindleGroup);

      // 4. Create Linear Rails (X and Y axis)
      const railRadius = 0.01;
      const railMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.95,
        roughness: 0.05 
      });
      
      // X-axis rails
      const xRailGeometry = new THREE.CylinderGeometry(railRadius, railRadius, scaleX * 0.9, 8);
      const xRail1 = new THREE.Mesh(xRailGeometry, railMaterial);
      xRail1.rotation.z = Math.PI / 2;
      xRail1.position.set(0, -scaleY/2 + 0.03, scaleZ * 0.8);
      machineGroup.add(xRail1);
      
      const xRail2 = new THREE.Mesh(xRailGeometry, railMaterial);
      xRail2.rotation.z = Math.PI / 2;
      xRail2.position.set(0, -scaleY/2 + 0.03, scaleZ * 0.6);
      machineGroup.add(xRail2);

      // 5. Add way covers (bellows)
      const bellowsGeometry = new THREE.BoxGeometry(scaleX * 0.7, 0.02, 0.15);
      const bellowsMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x303030,
        side: THREE.DoubleSide
      });
      const bellows = new THREE.Mesh(bellowsGeometry, bellowsMaterial);
      bellows.position.set(0, -scaleY/2 + 0.01, scaleZ * 0.7);
      machineGroup.add(bellows);

      // Add machine base
      const baseGeometry = new THREE.BoxGeometry(scaleX * 1.2, scaleY * 1.2, 0.05);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x505050,
        metalness: 0.5,
        roughness: 0.5
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, -0.05);
      machineGroup.add(base);

      // Add to scene
      scene.add(machineGroup);

      // Update viewer references
      if (window.cncViewer) {
        window.cncViewer.machineGroup = machineGroup;
        window.cncViewer.table = table;
        window.cncViewer.spindle = spindle;
        
        // Update table method
        window.cncViewer.setTable = (size) => {
          if (size.x !== undefined) setTableSize(prev => ({ ...prev, x: size.x * 1000 }));
          if (size.y !== undefined) setTableSize(prev => ({ ...prev, y: size.y * 1000 }));
        };
        
        // Update spindle home method
        window.cncViewer.setSpindleHome = (height) => {
          setSpindleHeight(height * 1000);
        };
      }

      // Render the scene
      if (window.cncViewer.render) {
        window.cncViewer.render();
      }
    } catch (error) {
      console.error('Error creating machine geometry:', error);
    }

    // Cleanup function
    return () => {
      if (scene && machineGroupRef.current) {
        scene.remove(machineGroupRef.current);
        machineGroupRef.current = null;
      }
    };
  }, [machineType, tableSize, spindleHeight, showMachine, isInitialized]);

  return (
    <div style={{ padding: '12px' }}>
      {/* Version Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Machine Setup</h3>
        <span style={{ 
          fontSize: '10px', 
          color: '#666',
          background: '#f0f0f0',
          padding: '2px 6px',
          borderRadius: '3px'
        }}>
          {MACHINE_MODULE_VERSION}
        </span>
      </div>

      {/* Status Indicator */}
      <div style={{
        padding: '4px 8px',
        marginBottom: '8px',
        background: isInitialized ? '#e8f5e9' : '#fff3e0',
        borderRadius: '4px',
        fontSize: '11px',
        color: isInitialized ? '#2e7d32' : '#e65100'
      }}>
        {isInitialized ? '✓ Connected to viewer' : '⏳ Waiting for viewer...'}
      </div>
      
      {/* Machine Type */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          Machine Type
        </label>
        <select 
          value={machineType}
          onChange={(e) => setMachineType(e.target.value)}
          style={{ width: '100%', padding: '4px' }}
          disabled={!isInitialized}
        >
          <option value="3axis-mill">3-Axis Mill</option>
          <option value="4axis-mill">4-Axis Mill</option>
          <option value="5axis-mill">5-Axis Mill</option>
          <option value="lathe">Lathe</option>
        </select>
      </div>

      {/* Table Size */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          Table Size (mm)
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            value={tableSize.x}
            onChange={(e) => setTableSize({ ...tableSize, x: parseFloat(e.target.value) || 400 })}
            style={{ flex: 1, padding: '4px' }}
            placeholder="X"
            disabled={!isInitialized}
          />
          <input
            type="number"
            value={tableSize.y}
            onChange={(e) => setTableSize({ ...tableSize, y: parseFloat(e.target.value) || 300 })}
            style={{ flex: 1, padding: '4px' }}
            placeholder="Y"
            disabled={!isInitialized}
          />
        </div>
      </div>

      {/* Spindle Height */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          Spindle Height (mm)
        </label>
        <input
          type="number"
          value={spindleHeight}
          onChange={(e) => setSpindleHeight(parseFloat(e.target.value) || 250)}
          style={{ width: '100%', padding: '4px' }}
          disabled={!isInitialized}
        />
      </div>

      {/* Work Envelope Display */}
      <div style={{ 
        padding: '8px', 
        background: '#f0f0f0', 
        borderRadius: '4px',
        fontSize: '11px',
        marginBottom: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Work Envelope</div>
        <div>X: {tableSize.x}mm</div>
        <div>Y: {tableSize.y}mm</div>
        <div>Z: {spindleHeight}mm</div>
      </div>

      {/* Show/Hide Machine */}
      <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
        <input
          type="checkbox"
          checked={showMachine}
          onChange={(e) => setShowMachine(e.target.checked)}
          style={{ marginRight: '6px' }}
          disabled={!isInitialized}
        />
        Show Machine
      </label>

      {/* Quick Presets */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '12px', marginBottom: '6px' }}>Quick Presets:</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setTableSize({ x: 300, y: 200 });
              setSpindleHeight(200);
            }}
            style={{ 
              padding: '2px 8px', 
              fontSize: '11px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              border: '1px solid #ccc',
              borderRadius: '3px',
              opacity: isInitialized ? 1 : 0.5
            }}
            disabled={!isInitialized}
          >
            Small
          </button>
          <button
            onClick={() => {
              setTableSize({ x: 500, y: 400 });
              setSpindleHeight(300);
            }}
            style={{ 
              padding: '2px 8px', 
              fontSize: '11px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              border: '1px solid #ccc',
              borderRadius: '3px',
              opacity: isInitialized ? 1 : 0.5
            }}
            disabled={!isInitialized}
          >
            Medium
          </button>
          <button
            onClick={() => {
              setTableSize({ x: 800, y: 600 });
              setSpindleHeight(400);
            }}
            style={{ 
              padding: '2px 8px', 
              fontSize: '11px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              border: '1px solid #ccc',
              borderRadius: '3px',
              opacity: isInitialized ? 1 : 0.5
            }}
            disabled={!isInitialized}
          >
            Large
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {!isInitialized && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: '#ffebee',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#c62828'
        }}>
          <strong>Troubleshooting:</strong><br/>
          • Make sure the Viewer module is loaded<br/>
          • Check the console for errors<br/>
          • Try refreshing the page
        </div>
      )}
    </div>
  );
}