import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MACHINE_MODULE_VERSION } from './version';

// Load saved machines from localStorage
const loadSavedMachines = () => {
  try {
    const saved = localStorage.getItem('cnc_saved_machines');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save machines to localStorage
const saveMachines = (machines) => {
  localStorage.setItem('cnc_saved_machines', JSON.stringify(machines));
};

export default function SimpleMachine() {
  const [machineType, setMachineType] = useState('3axis-mill');
  const [tableSize, setTableSize] = useState({ x: 400, y: 300 });
  const [spindleHeight, setSpindleHeight] = useState(250);
  const [showMachine, setShowMachine] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedMachines, setSavedMachines] = useState(loadSavedMachines());
  const [machineName, setMachineName] = useState('');
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

  // Save current machine configuration
  const saveCurrentMachine = () => {
    if (!machineName.trim()) return;
    
    const newMachine = {
      id: Date.now(),
      name: machineName,
      type: machineType,
      tableSize: { ...tableSize },
      spindleHeight
    };
    
    const updated = [...savedMachines, newMachine];
    setSavedMachines(updated);
    saveMachines(updated);
    setMachineName('');
  };

  // Load a saved machine
  const loadMachine = (machine) => {
    setMachineType(machine.type);
    setTableSize(machine.tableSize);
    setSpindleHeight(machine.spindleHeight);
  };

  // Delete a saved machine
  const deleteMachine = (id) => {
    const updated = savedMachines.filter(m => m.id !== id);
    setSavedMachines(updated);
    saveMachines(updated);
  };

  // Create machine geometry based on type
  const createMachineGeometry = (type, scaleX, scaleY, scaleZ, materials) => {
    const machineGroup = new THREE.Group();
    machineGroup.name = 'machineGroup';
    
    // Rotate entire machine 180 degrees so back faces Y+
    machineGroup.rotation.z = Math.PI;

    const { tableMaterial, frameMaterial, spindleMaterial, railMaterial } = materials;

    // Common components for all machines
    const tableThickness = 0.02;
    const tableGeometry = new THREE.BoxGeometry(scaleX, scaleY, tableThickness);
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 0, -tableThickness/2);
    table.name = 'table';
    
    // Add T-slots for mills
    if (type !== 'lathe') {
      const slotWidth = 0.01;
      const slotDepth = 0.005;
      const slotSpacing = 0.05;
      const numSlots = Math.floor(scaleX / slotSpacing) - 1;
      
      for (let i = 0; i < numSlots; i++) {
        const slotGeometry = new THREE.BoxGeometry(slotWidth, scaleY * 0.9, slotDepth);
        const slot = new THREE.Mesh(slotGeometry, new THREE.MeshPhongMaterial({ color: 0x202020 }));
        const xPos = -scaleX/2 + (i + 1) * slotSpacing;
        slot.position.set(xPos, 0, slotDepth/2);
        table.add(slot);
      }
    }
    
    machineGroup.add(table);

    // Machine-specific geometry
    switch(type) {
      case '3axis-mill':
      case '4axis-mill':
      case '5axis-mill':
        // Column and frame
        const columnWidth = 0.08;
        const columnDepth = 0.12;
        const columnHeight = scaleZ + 0.1;
        
        const columnGeometry = new THREE.BoxGeometry(scaleX * 0.8, columnDepth, columnHeight);
        const column = new THREE.Mesh(columnGeometry, frameMaterial);
        column.position.set(0, -scaleY/2 - columnDepth/2, columnHeight/2);
        machineGroup.add(column);

        // Side supports
        const supportGeometry = new THREE.BoxGeometry(columnWidth, columnDepth, columnHeight * 0.7);
        const leftSupport = new THREE.Mesh(supportGeometry, frameMaterial);
        leftSupport.position.set(-scaleX/2 + columnWidth/2, -scaleY/2 - columnDepth/2, columnHeight * 0.35);
        machineGroup.add(leftSupport);
        
        const rightSupport = new THREE.Mesh(supportGeometry, frameMaterial);
        rightSupport.position.set(scaleX/2 - columnWidth/2, -scaleY/2 - columnDepth/2, columnHeight * 0.35);
        machineGroup.add(rightSupport);

        // Spindle assembly
        const spindleGroup = new THREE.Group();
        const headSize = 0.15;
        const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize * 1.2);
        const spindleHead = new THREE.Mesh(headGeometry, frameMaterial);
        spindleHead.position.set(0, 0, scaleZ);
        spindleGroup.add(spindleHead);
        
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
        
        const holderGeometry = new THREE.ConeGeometry(spindleRadius * 0.8, 0.05, 8);
        const toolHolder = new THREE.Mesh(holderGeometry, spindleMaterial);
        toolHolder.rotation.x = -Math.PI / 2;
        toolHolder.position.set(0, 0, scaleZ - spindleLength - 0.025);
        spindleGroup.add(toolHolder);
        
        machineGroup.add(spindleGroup);

        // Add 4th axis for 4-axis mill
        if (type === '4axis-mill') {
          const rotaryTableRadius = 0.08;
          const rotaryTableHeight = 0.03;
          const rotaryGeometry = new THREE.CylinderGeometry(
            rotaryTableRadius, 
            rotaryTableRadius, 
            rotaryTableHeight, 
            32
          );
          const rotaryTable = new THREE.Mesh(rotaryGeometry, frameMaterial);
          rotaryTable.position.set(0, 0, tableThickness);
          rotaryTable.rotation.x = Math.PI / 2;
          machineGroup.add(rotaryTable);
          
          // A-axis indicator
          const indicatorGeometry = new THREE.BoxGeometry(rotaryTableRadius * 1.5, 0.01, 0.01);
          const indicator = new THREE.Mesh(indicatorGeometry, new THREE.MeshPhongMaterial({ color: 0xff0000 }));
          indicator.position.set(0, 0, tableThickness + rotaryTableHeight/2);
          machineGroup.add(indicator);
        }

        // Add 5th axis for 5-axis mill
        if (type === '5axis-mill') {
          // Trunnion table
          const trunnionRadius = 0.1;
          const trunnionWidth = 0.02;
          
          // C-axis (rotary table)
          const cAxisGeometry = new THREE.CylinderGeometry(
            trunnionRadius, 
            trunnionRadius, 
            trunnionWidth, 
            32
          );
          const cAxis = new THREE.Mesh(cAxisGeometry, frameMaterial);
          cAxis.position.set(0, 0, 0.05);
          cAxis.rotation.x = Math.PI / 2;
          machineGroup.add(cAxis);
          
          // A-axis (tilt)
          const aAxisGeometry = new THREE.TorusGeometry(trunnionRadius, trunnionWidth, 8, 16, Math.PI);
          const aAxis = new THREE.Mesh(aAxisGeometry, frameMaterial);
          aAxis.position.set(0, 0, 0.08);
          machineGroup.add(aAxis);
          
          // Trunnion supports
          const supportHeight = 0.06;
          const supportGeom = new THREE.BoxGeometry(trunnionWidth, trunnionWidth, supportHeight);
          const leftTrunnion = new THREE.Mesh(supportGeom, frameMaterial);
          leftTrunnion.position.set(-trunnionRadius, 0, supportHeight/2);
          machineGroup.add(leftTrunnion);
          
          const rightTrunnion = new THREE.Mesh(supportGeom, frameMaterial);
          rightTrunnion.position.set(trunnionRadius, 0, supportHeight/2);
          machineGroup.add(rightTrunnion);
        }

        // Linear rails
        const railRadius = 0.01;
        const xRailGeometry = new THREE.CylinderGeometry(railRadius, railRadius, scaleX * 0.9, 8);
        const xRail1 = new THREE.Mesh(xRailGeometry, railMaterial);
        xRail1.rotation.z = Math.PI / 2;
        xRail1.position.set(0, -scaleY/2 + 0.03, scaleZ * 0.8);
        machineGroup.add(xRail1);
        
        const xRail2 = new THREE.Mesh(xRailGeometry, railMaterial);
        xRail2.rotation.z = Math.PI / 2;
        xRail2.position.set(0, -scaleY/2 + 0.03, scaleZ * 0.6);
        machineGroup.add(xRail2);
        break;

      case 'lathe':
        // Lathe bed
        const bedLength = scaleX;
        const bedWidth = 0.15;
        const bedHeight = 0.08;
        const bedGeometry = new THREE.BoxGeometry(bedLength, bedWidth, bedHeight);
        const bed = new THREE.Mesh(bedGeometry, frameMaterial);
        bed.position.set(0, 0, -bedHeight/2);
        machineGroup.add(bed);

        // Headstock
        const headstockSize = 0.2;
        const headstockGeometry = new THREE.BoxGeometry(headstockSize * 0.8, headstockSize, headstockSize * 1.2);
        const headstock = new THREE.Mesh(headstockGeometry, frameMaterial);
        headstock.position.set(-bedLength/2 + headstockSize/2, 0, headstockSize * 0.6);
        machineGroup.add(headstock);

        // Chuck
        const chuckRadius = 0.08;
        const chuckDepth = 0.04;
        const chuckGeometry = new THREE.CylinderGeometry(chuckRadius, chuckRadius * 0.9, chuckDepth, 8);
        const chuck = new THREE.Mesh(chuckGeometry, spindleMaterial);
        chuck.rotation.z = Math.PI / 2;
        chuck.position.set(-bedLength/2 + headstockSize + chuckDepth/2, 0, headstockSize * 0.6);
        machineGroup.add(chuck);

        // Tailstock
        const tailstockSize = 0.15;
        const tailstockGeometry = new THREE.BoxGeometry(tailstockSize * 0.8, tailstockSize, tailstockSize);
        const tailstock = new THREE.Mesh(tailstockGeometry, frameMaterial);
        tailstock.position.set(bedLength/2 - tailstockSize/2, 0, tailstockSize/2);
        machineGroup.add(tailstock);

        // Tool post
        const toolPostGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.1);
        const toolPost = new THREE.Mesh(toolPostGeometry, frameMaterial);
        toolPost.position.set(0, 0, 0.1);
        machineGroup.add(toolPost);

        // Ways
        const wayRadius = 0.008;
        const wayGeometry = new THREE.CylinderGeometry(wayRadius, wayRadius, bedLength * 0.9, 8);
        const way1 = new THREE.Mesh(wayGeometry, railMaterial);
        way1.rotation.z = Math.PI / 2;
        way1.position.set(0, -bedWidth/3, 0);
        machineGroup.add(way1);
        
        const way2 = new THREE.Mesh(wayGeometry, railMaterial);
        way2.rotation.z = Math.PI / 2;
        way2.position.set(0, bedWidth/3, 0);
        machineGroup.add(way2);
        break;
    }

    // Add base for all machines
    const baseGeometry = new THREE.BoxGeometry(scaleX * 1.2, scaleY * 1.2, 0.05);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x505050,
      metalness: 0.5,
      roughness: 0.5
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0, -0.05);
    machineGroup.add(base);

    return machineGroup;
  };

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

    // Convert mm to scene units (assuming 1 unit = 1m)
    const scaleX = tableSize.x / 1000;
    const scaleY = tableSize.y / 1000;
    const scaleZ = spindleHeight / 1000;

    // Materials
    const materials = {
      tableMaterial: new THREE.MeshPhongMaterial({ 
        color: 0x404040, 
        metalness: 0.8,
        roughness: 0.2 
      }),
      frameMaterial: new THREE.MeshPhongMaterial({ 
        color: 0x808080,
        metalness: 0.7,
        roughness: 0.3 
      }),
      spindleMaterial: new THREE.MeshPhongMaterial({ 
        color: 0x606060,
        metalness: 0.9,
        roughness: 0.1 
      }),
      railMaterial: new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.95,
        roughness: 0.05 
      })
    };

    try {
      const machineGroup = createMachineGeometry(machineType, scaleX, scaleY, scaleZ, materials);
      machineGroupRef.current = machineGroup;
      scene.add(machineGroup);

      // Update viewer references
      if (window.cncViewer) {
        window.cncViewer.machineGroup = machineGroup;
        
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
    <div style={{ padding: '12px', background: '#f8f8f8' }}>
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
          background: '#e0e0e0',
          padding: '2px 6px',
          borderRadius: '3px'
        }}>
          {MACHINE_MODULE_VERSION}
        </span>
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
          {machineType === 'lathe' ? 'Bed Length x Width (mm)' : 'Table Size (mm)'}
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
          {machineType === 'lathe' ? 'Center Height (mm)' : 'Spindle Height (mm)'}
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
        background: '#e8f8ff', 
        borderRadius: '4px',
        fontSize: '11px',
        marginBottom: '12px',
        border: '1px solid #d0e0f0'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Work Envelope</div>
        <div>X: {tableSize.x}mm</div>
        <div>Y: {tableSize.y}mm</div>
        <div>Z: {spindleHeight}mm</div>
      </div>

      {/* Show/Hide Machine */}
      <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '12px' }}>
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
      <div style={{ marginBottom: '12px' }}>
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
              background: 'white',
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
              background: 'white',
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
              background: 'white',
              opacity: isInitialized ? 1 : 0.5
            }}
            disabled={!isInitialized}
          >
            Large
          </button>
        </div>
      </div>

      {/* Save Current Machine */}
      <div style={{ 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid #ddd' 
      }}>
        <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>
          Save Configuration
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            placeholder="Machine name..."
            style={{ flex: 1, padding: '4px', fontSize: '12px' }}
          />
          <button
            onClick={saveCurrentMachine}
            disabled={!machineName.trim()}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              cursor: machineName.trim() ? 'pointer' : 'not-allowed',
              border: '1px solid #4CAF50',
              background: machineName.trim() ? '#4CAF50' : '#ccc',
              color: 'white',
              borderRadius: '3px'
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Saved Machines */}
      {savedMachines.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>
            Saved Machines
          </div>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {savedMachines.map(machine => (
              <div 
                key={machine.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px',
                  marginBottom: '2px',
                  background: 'white',
                  borderRadius: '3px',
                  fontSize: '11px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <span>{machine.name} ({machine.type})</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => loadMachine(machine)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      border: '1px solid #2196F3',
                      background: '#2196F3',
                      color: 'white',
                      borderRadius: '2px'
                    }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteMachine(machine.id)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      border: '1px solid #f44336',
                      background: '#f44336',
                      color: 'white',
                      borderRadius: '2px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}