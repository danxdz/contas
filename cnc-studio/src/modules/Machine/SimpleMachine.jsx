import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MACHINE_MODULE_VERSION } from './version';
import { mmToWorld } from '../shared/units';

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

// Load last machine configuration from localStorage
const loadLastConfig = () => {
  try {
    const saved = localStorage.getItem('cnc_last_machine_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    machineType: '3axis-mill',
    tableSize: { x: 400, y: 300 },
    spindleHeight: 250,
    showMachine: true
  };
};

// Save current configuration to localStorage
const saveLastConfig = (config) => {
  localStorage.setItem('cnc_last_machine_config', JSON.stringify(config));
};

export default function SimpleMachine() {
  const lastConfig = loadLastConfig();
  const [machineType, setMachineType] = useState(lastConfig.machineType);
  const [tableSize, setTableSize] = useState(lastConfig.tableSize);
  const [spindleHeight, setSpindleHeight] = useState(lastConfig.spindleHeight);
  const [showMachine, setShowMachine] = useState(lastConfig.showMachine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedMachines, setSavedMachines] = useState(loadSavedMachines());
  const [machineName, setMachineName] = useState('');
  const machineGroupRef = useRef(null);
  const hasCreatedMachine = useRef(false);
  const lastRenderedConfig = useRef(null);

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
    const tableThickness = mmToWorld(20); // 20mm thick table
    const tableGeometry = new THREE.BoxGeometry(scaleX, scaleY, tableThickness);
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 0, -tableThickness/2);
    table.name = 'table';
    
    // Add T-slots for mills
    if (type !== 'lathe') {
      const slotWidth = mmToWorld(10);  // 10mm wide slots
      const slotDepth = mmToWorld(5);   // 5mm deep slots
      const slotSpacing = mmToWorld(50); // 50mm spacing
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
        const columnWidth = mmToWorld(80);  // 80mm wide column
        const columnDepth = mmToWorld(120); // 120mm deep column
        const columnHeight = scaleZ + mmToWorld(100); // Height + 100mm
        
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
        const headSize = mmToWorld(150); // 150mm spindle head
        const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize * 1.2);
        const spindleHead = new THREE.Mesh(headGeometry, frameMaterial);
        spindleHead.position.set(0, 0, scaleZ);
        spindleGroup.add(spindleHead);
        
        const spindleRadius = mmToWorld(30); // 30mm spindle radius
        const spindleLength = mmToWorld(200); // 200mm spindle length
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
        
        const holderGeometry = new THREE.ConeGeometry(spindleRadius * 0.8, mmToWorld(50), 8);
        const toolHolder = new THREE.Mesh(holderGeometry, spindleMaterial);
        toolHolder.rotation.x = -Math.PI / 2;
        toolHolder.position.set(0, 0, scaleZ - spindleLength - mmToWorld(25));
        spindleGroup.add(toolHolder);
        
        machineGroup.add(spindleGroup);

        // Add 4th axis for 4-axis mill
        if (type === '4axis-mill') {
          const rotaryTableRadius = mmToWorld(80); // 80mm rotary table radius
          const rotaryTableHeight = mmToWorld(30); // 30mm height
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
          const indicatorGeometry = new THREE.BoxGeometry(rotaryTableRadius * 1.5, mmToWorld(10), mmToWorld(10));
          const indicator = new THREE.Mesh(indicatorGeometry, new THREE.MeshPhongMaterial({ color: 0xff0000 }));
          indicator.position.set(0, 0, tableThickness + rotaryTableHeight/2);
          machineGroup.add(indicator);
        }

        // Add 5th axis for 5-axis mill
        if (type === '5axis-mill') {
          // Trunnion table
          const trunnionRadius = mmToWorld(100); // 100mm trunnion radius
          const trunnionWidth = mmToWorld(20);   // 20mm width
          
          // C-axis (rotary table)
          const cAxisGeometry = new THREE.CylinderGeometry(
            trunnionRadius, 
            trunnionRadius, 
            trunnionWidth, 
            32
          );
          const cAxis = new THREE.Mesh(cAxisGeometry, frameMaterial);
          cAxis.position.set(0, 0, mmToWorld(50));
          cAxis.rotation.x = Math.PI / 2;
          machineGroup.add(cAxis);
          
          // A-axis (tilt)
          const aAxisGeometry = new THREE.TorusGeometry(trunnionRadius, trunnionWidth, 8, 16, Math.PI);
          const aAxis = new THREE.Mesh(aAxisGeometry, frameMaterial);
          aAxis.position.set(0, 0, mmToWorld(80));
          machineGroup.add(aAxis);
          
          // Trunnion supports
          const supportHeight = mmToWorld(60); // 60mm support height
          const supportGeom = new THREE.BoxGeometry(trunnionWidth, trunnionWidth, supportHeight);
          const leftTrunnion = new THREE.Mesh(supportGeom, frameMaterial);
          leftTrunnion.position.set(-trunnionRadius, 0, supportHeight/2);
          machineGroup.add(leftTrunnion);
          
          const rightTrunnion = new THREE.Mesh(supportGeom, frameMaterial);
          rightTrunnion.position.set(trunnionRadius, 0, supportHeight/2);
          machineGroup.add(rightTrunnion);
        }

        // Linear rails
        const railRadius = mmToWorld(10); // 10mm rail radius
        const xRailGeometry = new THREE.CylinderGeometry(railRadius, railRadius, scaleX * 0.9, 8);
        const xRail1 = new THREE.Mesh(xRailGeometry, railMaterial);
        xRail1.rotation.z = Math.PI / 2;
        xRail1.position.set(0, -scaleY/2 + mmToWorld(30), scaleZ * 0.8);
        machineGroup.add(xRail1);
        
        const xRail2 = new THREE.Mesh(xRailGeometry, railMaterial);
        xRail2.rotation.z = Math.PI / 2;
        xRail2.position.set(0, -scaleY/2 + mmToWorld(30), scaleZ * 0.6);
        machineGroup.add(xRail2);
        break;

      case 'lathe':
        // Lathe bed
        const bedLength = scaleX;
        const bedWidth = mmToWorld(150);  // 150mm bed width
        const bedHeight = mmToWorld(80);   // 80mm bed height
        const bedGeometry = new THREE.BoxGeometry(bedLength, bedWidth, bedHeight);
        const bed = new THREE.Mesh(bedGeometry, frameMaterial);
        bed.position.set(0, 0, -bedHeight/2);
        machineGroup.add(bed);

        // Headstock
        const headstockSize = mmToWorld(200); // 200mm headstock
        const headstockGeometry = new THREE.BoxGeometry(headstockSize * 0.8, headstockSize, headstockSize * 1.2);
        const headstock = new THREE.Mesh(headstockGeometry, frameMaterial);
        headstock.position.set(-bedLength/2 + headstockSize/2, 0, headstockSize * 0.6);
        machineGroup.add(headstock);

        // Chuck
        const chuckRadius = mmToWorld(80); // 80mm chuck radius
        const chuckDepth = mmToWorld(40);  // 40mm chuck depth
        const chuckGeometry = new THREE.CylinderGeometry(chuckRadius, chuckRadius * 0.9, chuckDepth, 8);
        const chuck = new THREE.Mesh(chuckGeometry, spindleMaterial);
        chuck.rotation.z = Math.PI / 2;
        chuck.position.set(-bedLength/2 + headstockSize + chuckDepth/2, 0, headstockSize * 0.6);
        machineGroup.add(chuck);

        // Tailstock
        const tailstockSize = mmToWorld(150); // 150mm tailstock
        const tailstockGeometry = new THREE.BoxGeometry(tailstockSize * 0.8, tailstockSize, tailstockSize);
        const tailstock = new THREE.Mesh(tailstockGeometry, frameMaterial);
        tailstock.position.set(bedLength/2 - tailstockSize/2, 0, tailstockSize/2);
        machineGroup.add(tailstock);

        // Tool post
        const toolPostGeometry = new THREE.BoxGeometry(mmToWorld(60), mmToWorld(80), mmToWorld(100));
        const toolPost = new THREE.Mesh(toolPostGeometry, frameMaterial);
        toolPost.position.set(0, 0, mmToWorld(100));
        machineGroup.add(toolPost);

        // Ways
        const wayRadius = mmToWorld(8); // 8mm way radius
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
    const baseThickness = mmToWorld(50); // 50mm base thickness
    const baseGeometry = new THREE.BoxGeometry(scaleX * 1.2, scaleY * 1.2, baseThickness);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x505050,
      metalness: 0.5,
      roughness: 0.5
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0, -baseThickness);
    machineGroup.add(base);

    // Add axes helper for debugging
    const axesHelper = new THREE.AxesHelper(Math.max(scaleX, scaleY, scaleZ));
    machineGroup.add(axesHelper);
    
    // Add a large red sphere for debugging visibility
    const debugSphere = new THREE.Mesh(
      new THREE.SphereGeometry(mmToWorld(100), 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    );
    debugSphere.position.set(0, 0, mmToWorld(200));
    machineGroup.add(debugSphere);

    return machineGroup;
  };

  // Create actual machine geometry in the scene
  useEffect(() => {
    console.log('[Machine] Effect triggered, isInitialized:', isInitialized);
    if (!isInitialized) return;

    const scene = window.cncViewer.scene;
    console.log('[Machine] Scene available:', !!scene);
    if (!scene) return;

    // Create a config object for comparison
    const currentConfig = {
      machineType,
      tableSize,
      spindleHeight,
      showMachine
    };

    // Save current configuration
    saveLastConfig(currentConfig);

    // Check if configuration has actually changed
    const configChanged = !lastRenderedConfig.current || 
      JSON.stringify(lastRenderedConfig.current) !== JSON.stringify(currentConfig);

    // If nothing changed and machine exists, do nothing
    if (!configChanged && machineGroupRef.current) {
      return;
    }

    // Handle visibility toggle without recreating
    if (!configChanged && !showMachine && machineGroupRef.current) {
      machineGroupRef.current.visible = false;
      if (window.cncViewer.render) {
        window.cncViewer.render();
      }
      return;
    }

    if (!configChanged && showMachine && machineGroupRef.current) {
      machineGroupRef.current.visible = true;
      if (window.cncViewer.render) {
        window.cncViewer.render();
      }
      return;
    }

    // Configuration changed, need to recreate machine
    // Remove old machine group if exists
    if (machineGroupRef.current) {
      console.log('[Machine] Removing old machine from scene');
      scene.remove(machineGroupRef.current);
      // Also dispose of geometries and materials to prevent memory leaks
      machineGroupRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      machineGroupRef.current = null;
    }
    
    // Also check for any orphaned machine groups and remove them
    const existingMachine = scene.getObjectByName('machineGroup');
    if (existingMachine && existingMachine !== machineGroupRef.current) {
      console.log('[Machine] Found orphaned machine, removing');
      scene.remove(existingMachine);
    }

    // If showMachine is false, don't create new machine
    if (!showMachine) {
      lastRenderedConfig.current = currentConfig;
      if (window.cncViewer.render) {
        window.cncViewer.render();
      }
      return;
    }

    // Remove default table and tool from Viewer if they exist (only once)
    if (!hasCreatedMachine.current) {
      const defaultTable = scene.getObjectByName('defaultTable');
      if (defaultTable) {
        scene.remove(defaultTable);
      }
      const defaultTool = scene.getObjectByName('defaultTool');
      if (defaultTool) {
        scene.remove(defaultTool);
      }
    }

    // Convert mm to scene units using centralized scale
    const scaleX = mmToWorld(tableSize.x);
    const scaleY = mmToWorld(tableSize.y);
    const scaleZ = mmToWorld(spindleHeight);

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
      // Final check - make sure we don't already have a machine
      if (scene.getObjectByName('machineGroup')) {
        console.log('[Machine] WARNING: Machine already exists in scene, removing it first');
        const existing = scene.getObjectByName('machineGroup');
        scene.remove(existing);
      }
      
      console.log('[Machine] Creating machine with scales:', { scaleX, scaleY, scaleZ });
      const machineGroup = createMachineGeometry(machineType, scaleX, scaleY, scaleZ, materials);
      machineGroupRef.current = machineGroup;
      scene.add(machineGroup);
      hasCreatedMachine.current = true;
      console.log('[Machine] Machine added to scene successfully');
      
      // Save the configuration that was actually rendered
      lastRenderedConfig.current = currentConfig;

      // Store machine in window.cncViewer so it persists
      if (window.cncViewer) {
        window.cncViewer.machineGroup = machineGroup;
        window.cncViewer.persistMachine = true;
        
        // Update table method (expects mm)
        window.cncViewer.setTable = (size) => {
          if (size.x !== undefined) setTableSize(prev => ({ ...prev, x: size.x }));
          if (size.y !== undefined) setTableSize(prev => ({ ...prev, y: size.y }));
        };
        
        // Update spindle home method (expects mm)
        window.cncViewer.setSpindleHome = (height) => {
          setSpindleHeight(height);
        };
      }

      // Render the scene
      if (window.cncViewer.render) {
        window.cncViewer.render();
        console.log('[Machine] Scene rendered');
      }
    } catch (error) {
      console.error('[Machine] Error creating machine geometry:', error);
    }

    // Don't cleanup on unmount - keep machine in scene
    return () => {
      // Machine stays in scene when panel closes
    };
  }, [machineType, tableSize, spindleHeight, showMachine, isInitialized]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Machine Type - Compact with version */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
          Type
          <span style={{ opacity: 0.5 }}>{MACHINE_MODULE_VERSION}</span>
        </span>
        <select 
          value={machineType}
          onChange={(e) => setMachineType(e.target.value)}
          disabled={!isInitialized}
          style={{ fontSize: '12px' }}
        >
          <option value="3axis-mill">3-Axis</option>
          <option value="4axis-mill">4-Axis</option>
          <option value="5axis-mill">5-Axis</option>
          <option value="lathe">Lathe</option>
        </select>
      </label>

      {/* Dimensions - Compact inline */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '10px' }}>X</span>
          <input
            type="number"
            value={tableSize.x}
            onChange={(e) => setTableSize({ ...tableSize, x: parseFloat(e.target.value) || 400 })}
            disabled={!isInitialized}
            style={{ fontSize: '11px', width: '50px' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '10px' }}>Y</span>
          <input
            type="number"
            value={tableSize.y}
            onChange={(e) => setTableSize({ ...tableSize, y: parseFloat(e.target.value) || 300 })}
            disabled={!isInitialized}
            style={{ fontSize: '11px', width: '50px' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '10px' }}>Z</span>
          <input
            type="number"
            value={spindleHeight}
            onChange={(e) => setSpindleHeight(parseFloat(e.target.value) || 250)}
            disabled={!isInitialized}
            style={{ fontSize: '11px', width: '50px' }}
          />
        </label>
        <span style={{ fontSize: '10px', color: '#666' }}>mm</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={showMachine}
            onChange={(e) => setShowMachine(e.target.checked)}
            disabled={!isInitialized}
          />
          <span style={{ fontSize: '11px' }}>Show</span>
        </label>
      </div>

      {/* Presets - Compact buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => {
            setTableSize({ x: 500, y: 400 });
            setSpindleHeight(300);
          }}
          disabled={!isInitialized}
          style={{ flex: 1, fontSize: '11px', padding: '3px' }}
        >
          S
        </button>
        <button
          onClick={() => {
            setTableSize({ x: 800, y: 600 });
            setSpindleHeight(400);
          }}
          disabled={!isInitialized}
          style={{ flex: 1, fontSize: '11px', padding: '3px' }}
        >
          M
        </button>
        <button
          onClick={() => {
            setTableSize({ x: 1200, y: 800 });
            setSpindleHeight(500);
          }}
          disabled={!isInitialized}
          style={{ flex: 1, fontSize: '11px', padding: '3px' }}
        >
          L
        </button>
      </div>

      {/* Save - Compact */}
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type="text"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          placeholder="Save as..."
          style={{ flex: 1, fontSize: '11px' }}
        />
        <button
          onClick={saveCurrentMachine}
          disabled={!machineName.trim()}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          Save
        </button>
      </div>

      {/* Saved Machines - Compact list */}
      {savedMachines.length > 0 && (
        <>
          <span style={{ fontSize: '10px', opacity: 0.6 }}>Saved</span>
          <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
            {savedMachines.map(machine => (
              <div 
                key={machine.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2px 4px',
                  fontSize: '10px'
                }}
              >
                <span>{machine.name}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    onClick={() => loadMachine(machine)}
                    style={{ padding: '1px 4px', fontSize: '9px' }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteMachine(machine.id)}
                    style={{ padding: '1px 4px', fontSize: '9px' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}