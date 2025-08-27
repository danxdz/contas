import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './ProfessionalSimulator.css';

// Import all modules for integration
import ToolDatabase from './ToolDatabase';
import CuttingSpeedCalculator from '../CuttingSpeedCalculator';
import FeedsSpeedsOptimizer from './FeedsSpeedsOptimizer';
import PowerTorqueCalculator from './PowerTorqueCalculator';

const ProfessionalSimulator = () => {
  // Core States
  const [workspace, setWorkspace] = useState({
    machine: {
      type: '3-axis',
      model: 'VMC-850',
      travels: { x: 850, y: 500, z: 500 },
      spindle: { maxRPM: 12000, power: 15 },
      toolCapacity: 24
    },
    setup: {
      fixture: 'vise',
      workOffset: 'G54',
      offsets: {
        G54: { x: 0, y: 0, z: 0, a: 0, b: 0 },
        G55: { x: 100, y: 100, z: 0, a: 0, b: 0 },
        G56: { x: 200, y: 200, z: 0, a: 0, b: 0 },
        G57: { x: 0, y: 0, z: 0, a: 0, b: 0 },
        G58: { x: 0, y: 0, z: 0, a: 0, b: 0 },
        G59: { x: 0, y: 0, z: 0, a: 0, b: 0 }
      },
      toolOffsets: {},
      stock: {
        type: 'block',
        dimensions: { x: 150, y: 100, z: 50 },
        material: 'aluminum-6061',
        position: { x: 0, y: 0, z: 0 }
      }
    }
  });

  // UI States
  const [activeRibbon, setActiveRibbon] = useState('home');
  const [activeTool, setActiveTool] = useState(null);
  const [sidePanel, setSidePanel] = useState('tools');
  const [bottomPanel, setBottomPanel] = useState('gcode');
  const [overlayMode, setOverlayMode] = useState('transparent');
  
  // G-Code States
  const [gcode, setGcode] = useState(`; Professional CAM Simulator
; Machine: ${workspace.machine.model}
; Setup: ${workspace.setup.fixture}
; Work Offset: ${workspace.setup.workOffset}

G21 ; Metric
G90 ; Absolute
${workspace.setup.workOffset} ; Work offset
G00 Z50 ; Safe height

; Tool Change
T1 M06
S8000 M03
G00 X0 Y0
G00 Z5
G01 Z-5 F100
G01 X100 Y0 F500
G01 X100 Y50
G01 X0 Y50
G01 X0 Y0
G00 Z50
M05
M30`);

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    isPaused: false,
    currentLine: 0,
    speed: 1.0,
    showToolpath: true,
    showTool: true,
    showStock: true,
    showFixture: true,
    showTable: true,
    materialRemoval: false,
    collisionDetection: false
  });

  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const toolRef = useRef(null);
  const stockRef = useRef(null);
  const toolpathRef = useRef(null);

  // Module Integration
  const [toolDatabase, setToolDatabase] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [moduleData, setModuleData] = useState({});

  // Initialize Three.js Scene
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mountRef.current) return;
      
      // Clear any existing content
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      scene.fog = new THREE.Fog(0x1a1a1a, 500, 2000);
      sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      5000
    );
    camera.position.set(300, 300, 500);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 2000;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(200, 200, 500);
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 2000;
    mainLight.shadow.camera.left = -500;
    mainLight.shadow.camera.right = 500;
    mainLight.shadow.camera.top = 500;
    mainLight.shadow.camera.bottom = -500;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    fillLight.position.set(-200, -200, 200);
    scene.add(fillLight);

    // Grid and Axes
    const gridHelper = new THREE.GridHelper(1000, 50, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);

    // Add machine table
    try {
      addMachineTable(scene);
      
      // Add fixture
      addFixture(scene);
      
      // Add stock
      addStock(scene);
      
      // Add tool
      addTool(scene);
    } catch (error) {
      console.error('Error adding 3D objects:', error);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Update tool position if simulating
      if (simulation.isPlaying && !simulation.isPaused) {
        updateToolPosition();
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Add machine table
  const addMachineTable = useCallback((scene) => {
    if (!scene) return;
    
    const tableGeometry = new THREE.BoxGeometry(
      workspace.machine.travels.x || 850,
      workspace.machine.travels.y || 500,
      20
    );
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 0x404040
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.z = -10;
    table.receiveShadow = true;
    scene.add(table);

    // T-slots
    for (let i = -200; i <= 200; i += 100) {
      const slotGeometry = new THREE.BoxGeometry(
        workspace.machine.travels.x || 850,
        10,
        5
      );
      const slotMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
      const slot = new THREE.Mesh(slotGeometry, slotMaterial);
      slot.position.set(0, i, 0);
      scene.add(slot);
    }
  }, [workspace.machine.travels]);

  // Add fixture
  const addFixture = useCallback((scene) => {
    if (!scene) return;
    
    const fixtureGroup = new THREE.Group();
    
    if (workspace.setup.fixture === 'vise') {
      // Vise base
      const baseGeometry = new THREE.BoxGeometry(200, 80, 40);
      const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.z = 20;
      fixtureGroup.add(base);

      // Fixed jaw
      const fixedJawGeometry = new THREE.BoxGeometry(200, 20, 60);
      const jawMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
      const fixedJaw = new THREE.Mesh(fixedJawGeometry, jawMaterial);
      fixedJaw.position.set(0, -30, 40);
      fixtureGroup.add(fixedJaw);

      // Movable jaw
      const movableJaw = new THREE.Mesh(fixedJawGeometry, jawMaterial);
      movableJaw.position.set(0, 30, 40);
      fixtureGroup.add(movableJaw);
    }
    
    scene.add(fixtureGroup);
  }, [workspace.setup.fixture]);

  // Add stock
  const addStock = useCallback((scene) => {
    if (!scene) return;
    
    if (stockRef.current) {
      scene.remove(stockRef.current);
    }

    const { type, dimensions } = workspace.setup.stock;
    let geometry;
    
    if (type === 'block') {
      geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
    } else if (type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(
        dimensions.x / 2,
        dimensions.x / 2,
        dimensions.z,
        32
      );
      geometry.rotateX(Math.PI / 2);
    }

    const material = new THREE.MeshPhongMaterial({
      color: 0x8888ff,
      transparent: true,
      opacity: 0.7
    });

    const stock = new THREE.Mesh(geometry, material);
    stock.position.z = dimensions.z / 2 + 40; // On top of vise
    stock.castShadow = true;
    stock.receiveShadow = true;
    stockRef.current = stock;
    scene.add(stock);
  }, [workspace.setup.stock]);

  // Add tool
  const addTool = useCallback((scene) => {
    if (!scene) return;
    
    if (toolRef.current) {
      scene.remove(toolRef.current);
    }

    const toolGroup = new THREE.Group();

    // Tool holder
    const holderGeometry = new THREE.CylinderGeometry(20, 20, 50, 16);
    const holderMaterial = new THREE.MeshPhongMaterial({
      color: 0x404040
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotateX(-Math.PI / 2);
    holder.position.z = 25;
    toolGroup.add(holder);

    // Tool shank
    const shankGeometry = new THREE.CylinderGeometry(6, 6, 40, 16);
    const shankMaterial = new THREE.MeshPhongMaterial({
      color: 0x606060
    });
    const shank = new THREE.Mesh(shankGeometry, shankMaterial);
    shank.rotateX(-Math.PI / 2);
    shank.position.z = -20;
    toolGroup.add(shank);

    // Cutting tool
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 30, 16);
    const toolMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.2
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotateX(-Math.PI / 2);
    tool.position.z = -55;
    toolGroup.add(tool);

    toolGroup.position.set(0, 0, 200);
    toolRef.current = toolGroup;
    scene.add(toolGroup);
  }, []);

  // Update tool position
  const updateToolPosition = () => {
    if (!toolRef.current) return;
    // Tool position update logic here
  };

  // Load tool from database
  const loadToolFromDatabase = (toolId) => {
    const savedTools = localStorage.getItem('cncToolDatabase');
    if (savedTools) {
      const tools = JSON.parse(savedTools);
      const tool = tools.find(t => t.id === toolId);
      if (tool) {
        setActiveTool(tool);
        // Update tool visualization
        if (toolRef.current && sceneRef.current) {
          // Update tool geometry based on tool data
          console.log('Loaded tool:', tool);
        }
      }
    }
  };

  // Ribbon tabs configuration
  const ribbonTabs = {
    home: {
      label: 'Home',
      groups: [
        {
          name: 'File',
          items: [
            { icon: '📁', label: 'Open', action: () => {} },
            { icon: '💾', label: 'Save', action: () => {} },
            { icon: '📤', label: 'Export', action: () => {} }
          ]
        },
        {
          name: 'View',
          items: [
            { icon: '🎯', label: 'Fit', action: () => {} },
            { icon: '⬜', label: 'Top', action: () => {} },
            { icon: '◻️', label: 'Front', action: () => {} },
            { icon: '🔲', label: 'Iso', action: () => {} }
          ]
        },
        {
          name: 'Simulation',
          items: [
            { icon: '▶️', label: 'Play', action: () => setSimulation(s => ({...s, isPlaying: true})) },
            { icon: '⏸️', label: 'Pause', action: () => setSimulation(s => ({...s, isPaused: true})) },
            { icon: '⏹️', label: 'Stop', action: () => setSimulation(s => ({...s, isPlaying: false})) },
            { icon: '⏩', label: 'Step', action: () => {} }
          ]
        }
      ]
    },
    setup: {
      label: 'Setup',
      groups: [
        {
          name: 'Machine',
          items: [
            { icon: '🏭', label: 'Select', action: () => {} },
            { icon: '⚙️', label: 'Config', action: () => {} },
            { icon: '📊', label: 'Limits', action: () => {} }
          ]
        },
        {
          name: 'Work Offsets',
          items: [
            { icon: '📍', label: 'G54', action: () => setWorkspace(w => ({...w, setup: {...w.setup, workOffset: 'G54'}})) },
            { icon: '📍', label: 'G55', action: () => setWorkspace(w => ({...w, setup: {...w.setup, workOffset: 'G55'}})) },
            { icon: '📍', label: 'G56', action: () => setWorkspace(w => ({...w, setup: {...w.setup, workOffset: 'G56'}})) },
            { icon: '📏', label: 'Edit', action: () => {} }
          ]
        },
        {
          name: 'Fixture',
          items: [
            { icon: '🔧', label: 'Vise', action: () => {} },
            { icon: '🔘', label: 'Chuck', action: () => {} },
            { icon: '📐', label: 'Plate', action: () => {} },
            { icon: '➕', label: 'Custom', action: () => {} }
          ]
        },
        {
          name: 'Stock',
          items: [
            { icon: '◼️', label: 'Block', action: () => {} },
            { icon: '⭕', label: 'Round', action: () => {} },
            { icon: '📏', label: 'Size', action: () => {} }
          ]
        }
      ]
    },
    tools: {
      label: 'Tools',
      groups: [
        {
          name: 'Tool Library',
          items: [
            { icon: '🗄️', label: 'Database', action: () => setSidePanel('toolDatabase') },
            { icon: '➕', label: 'Add Tool', action: () => {} },
            { icon: '📋', label: 'List', action: () => {} },
            { icon: '🔍', label: 'Search', action: () => {} }
          ]
        },
        {
          name: 'Tool Offsets',
          items: [
            { icon: '📏', label: 'Length', action: () => {} },
            { icon: '⭕', label: 'Diameter', action: () => {} },
            { icon: '🔄', label: 'Wear', action: () => {} }
          ]
        },
        {
          name: 'Calculators',
          items: [
            { icon: '⚡', label: 'Speeds', action: () => setActiveModule('speeds') },
            { icon: '📊', label: 'Feeds', action: () => setActiveModule('feeds') },
            { icon: '💪', label: 'Power', action: () => setActiveModule('power') }
          ]
        }
      ]
    },
    analysis: {
      label: 'Analysis',
      groups: [
        {
          name: 'Verification',
          items: [
            { icon: '✓', label: 'Verify', action: () => {} },
            { icon: '⚠️', label: 'Collisions', action: () => {} },
            { icon: '📏', label: 'Limits', action: () => {} }
          ]
        },
        {
          name: 'Optimization',
          items: [
            { icon: '⚡', label: 'Optimize', action: () => {} },
            { icon: '🔄', label: 'Smooth', action: () => {} },
            { icon: '📈', label: 'Analyze', action: () => {} }
          ]
        },
        {
          name: 'Reports',
          items: [
            { icon: '📊', label: 'Time', action: () => {} },
            { icon: '📋', label: 'Tools', action: () => {} },
            { icon: '📄', label: 'Setup', action: () => {} }
          ]
        }
      ]
    }
  };

  return (
    <div className="professional-simulator">
      {/* Ribbon Toolbar */}
      <div className="cam-ribbon">
        <div className="ribbon-tabs">
          {Object.entries(ribbonTabs).map(([key, tab]) => (
            <button
              key={key}
              className={`ribbon-tab ${activeRibbon === key ? 'active' : ''}`}
              onClick={() => setActiveRibbon(key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ribbon-content">
          {ribbonTabs[activeRibbon]?.groups.map((group, idx) => (
            <div key={idx} className="ribbon-group">
              <div className="group-items">
                {group.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    className="ribbon-button"
                    onClick={item.action}
                    title={item.label}
                  >
                    <span className="button-icon">{item.icon}</span>
                    <span className="button-label">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="group-label">{group.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="cam-workspace">
        {/* Left Panel - Tools & Setup */}
        <div className="workspace-panel left-panel">
          <div className="panel-tabs">
            <button 
              className={sidePanel === 'tools' ? 'active' : ''}
              onClick={() => setSidePanel('tools')}
            >
              Tools
            </button>
            <button 
              className={sidePanel === 'offsets' ? 'active' : ''}
              onClick={() => setSidePanel('offsets')}
            >
              Offsets
            </button>
            <button 
              className={sidePanel === 'toolDatabase' ? 'active' : ''}
              onClick={() => setSidePanel('toolDatabase')}
            >
              Database
            </button>
          </div>
          <div className="panel-content">
            {sidePanel === 'tools' && (
              <div className="tools-panel">
                <h3>Tool List</h3>
                <div className="tool-list">
                  <div className="tool-item">
                    <span>T1</span>
                    <span>⌀10mm End Mill</span>
                    <button onClick={() => loadToolFromDatabase('tool_1')}>Load</button>
                  </div>
                  <div className="tool-item">
                    <span>T2</span>
                    <span>⌀6mm Drill</span>
                    <button onClick={() => loadToolFromDatabase('tool_2')}>Load</button>
                  </div>
                </div>
              </div>
            )}
            {sidePanel === 'offsets' && (
              <div className="offsets-panel">
                <h3>Work Offsets</h3>
                <div className="offset-grid">
                  {Object.entries(workspace.setup.offsets).map(([key, offset]) => (
                    <div key={key} className="offset-item">
                      <div className="offset-header">
                        <span className={`offset-label ${workspace.setup.workOffset === key ? 'active' : ''}`}>
                          {key}
                        </span>
                        <button onClick={() => setWorkspace(w => ({...w, setup: {...w.setup, workOffset: key}}))}>
                          Use
                        </button>
                      </div>
                      <div className="offset-values">
                        <div>X: <input type="number" value={offset.x} onChange={(e) => {
                          setWorkspace(w => ({
                            ...w,
                            setup: {
                              ...w.setup,
                              offsets: {
                                ...w.setup.offsets,
                                [key]: {...offset, x: parseFloat(e.target.value) || 0}
                              }
                            }
                          }));
                        }} /></div>
                        <div>Y: <input type="number" value={offset.y} onChange={(e) => {
                          setWorkspace(w => ({
                            ...w,
                            setup: {
                              ...w.setup,
                              offsets: {
                                ...w.setup.offsets,
                                [key]: {...offset, y: parseFloat(e.target.value) || 0}
                              }
                            }
                          }));
                        }} /></div>
                        <div>Z: <input type="number" value={offset.z} onChange={(e) => {
                          setWorkspace(w => ({
                            ...w,
                            setup: {
                              ...w.setup,
                              offsets: {
                                ...w.setup.offsets,
                                [key]: {...offset, z: parseFloat(e.target.value) || 0}
                              }
                            }
                          }));
                        }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <h3>Tool Offsets</h3>
                <div className="tool-offset-list">
                  <div className="tool-offset-item">
                    <span>T1</span>
                    <input type="number" placeholder="Length" />
                    <input type="number" placeholder="Diameter" />
                  </div>
                </div>
              </div>
            )}
            {sidePanel === 'toolDatabase' && (
              <div className="database-panel">
                <h3>Tool Database</h3>
                <p>Integration with Tool Database module</p>
                <button onClick={() => setActiveModule('toolDatabase')}>
                  Open Full Database
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center - 3D Viewport with G-code Overlay */}
        <div className="viewport-container">
          <div ref={mountRef} className="threejs-viewport" />
          
          {/* G-code Overlay */}
          <div className={`gcode-overlay ${overlayMode}`}>
            <div className="gcode-header">
              <span>Program: {workspace.machine.model}.nc</span>
              <div className="overlay-controls">
                <button onClick={() => setOverlayMode('transparent')}>◱</button>
                <button onClick={() => setOverlayMode('opaque')}>◰</button>
                <button onClick={() => setOverlayMode('hidden')}>✕</button>
              </div>
            </div>
            {overlayMode !== 'hidden' && (
              <div className="gcode-lines">
                {gcode.split('\n').map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`gcode-line ${idx === simulation.currentLine ? 'active' : ''} ${idx < simulation.currentLine ? 'executed' : ''}`}
                  >
                    <span className="line-number">{idx + 1}</span>
                    <span className="line-content">{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Controls */}
          <div className="sim-controls">
            <button onClick={() => setSimulation(s => ({...s, isPlaying: !s.isPlaying}))}>
              {simulation.isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={() => setSimulation(s => ({...s, isPlaying: false, currentLine: 0}))}>
              ⏹️
            </button>
            <button onClick={() => setSimulation(s => ({...s, currentLine: Math.max(0, s.currentLine - 1)}))}>
              ⏮️
            </button>
            <button onClick={() => setSimulation(s => ({...s, currentLine: s.currentLine + 1}))}>
              ⏭️
            </button>
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={simulation.speed}
              onChange={(e) => setSimulation(s => ({...s, speed: parseFloat(e.target.value)}))}
            />
            <span>{simulation.speed}x</span>
          </div>

          {/* View Controls */}
          <div className="view-controls">
            <button onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(0, 0, 500);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}>Top</button>
            <button onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(0, -500, 0);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}>Front</button>
            <button onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(500, 0, 0);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}>Right</button>
            <button onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(300, 300, 500);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}>Iso</button>
          </div>

          {/* Display Options */}
          <div className="display-options">
            <label>
              <input 
                type="checkbox" 
                checked={simulation.showToolpath}
                onChange={(e) => setSimulation(s => ({...s, showToolpath: e.target.checked}))}
              />
              Toolpath
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={simulation.showTool}
                onChange={(e) => setSimulation(s => ({...s, showTool: e.target.checked}))}
              />
              Tool
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={simulation.showStock}
                onChange={(e) => setSimulation(s => ({...s, showStock: e.target.checked}))}
              />
              Stock
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={simulation.showFixture}
                onChange={(e) => setSimulation(s => ({...s, showFixture: e.target.checked}))}
              />
              Fixture
            </label>
          </div>
        </div>

        {/* Right Panel - Properties & Modules */}
        <div className="workspace-panel right-panel">
          <div className="panel-tabs">
            <button className="active">Properties</button>
            <button onClick={() => setActiveModule('calculator')}>Calculators</button>
            <button onClick={() => setActiveModule('analysis')}>Analysis</button>
          </div>
          <div className="panel-content">
            {!activeModule && (
              <div className="properties-panel">
                <h3>Machine Properties</h3>
                <div className="property-group">
                  <div className="property">
                    <label>Type:</label>
                    <span>{workspace.machine.type}</span>
                  </div>
                  <div className="property">
                    <label>Model:</label>
                    <span>{workspace.machine.model}</span>
                  </div>
                  <div className="property">
                    <label>Max RPM:</label>
                    <span>{workspace.machine.spindle.maxRPM}</span>
                  </div>
                  <div className="property">
                    <label>Power:</label>
                    <span>{workspace.machine.spindle.power} kW</span>
                  </div>
                </div>
                
                <h3>Current Setup</h3>
                <div className="property-group">
                  <div className="property">
                    <label>Fixture:</label>
                    <span>{workspace.setup.fixture}</span>
                  </div>
                  <div className="property">
                    <label>Work Offset:</label>
                    <span>{workspace.setup.workOffset}</span>
                  </div>
                  <div className="property">
                    <label>Stock:</label>
                    <span>{workspace.setup.stock.type}</span>
                  </div>
                  <div className="property">
                    <label>Material:</label>
                    <span>{workspace.setup.stock.material}</span>
                  </div>
                </div>

                {activeTool && (
                  <>
                    <h3>Active Tool</h3>
                    <div className="property-group">
                      <div className="property">
                        <label>Name:</label>
                        <span>{activeTool.name}</span>
                      </div>
                      <div className="property">
                        <label>Type:</label>
                        <span>{activeTool.type}</span>
                      </div>
                      <div className="property">
                        <label>Diameter:</label>
                        <span>{activeTool.diameter}mm</span>
                      </div>
                      <div className="property">
                        <label>Flutes:</label>
                        <span>{activeTool.flutes}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeModule === 'calculator' && (
              <div className="module-container">
                <button onClick={() => setActiveModule(null)}>← Back</button>
                <CuttingSpeedCalculator />
              </div>
            )}
            
            {activeModule === 'feeds' && (
              <div className="module-container">
                <button onClick={() => setActiveModule(null)}>← Back</button>
                <FeedsSpeedsOptimizer />
              </div>
            )}
            
            {activeModule === 'power' && (
              <div className="module-container">
                <button onClick={() => setActiveModule(null)}>← Back</button>
                <PowerTorqueCalculator />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Console & Info */}
      <div className="bottom-panel">
        <div className="panel-tabs">
          <button 
            className={bottomPanel === 'gcode' ? 'active' : ''}
            onClick={() => setBottomPanel('gcode')}
          >
            G-Code
          </button>
          <button 
            className={bottomPanel === 'console' ? 'active' : ''}
            onClick={() => setBottomPanel('console')}
          >
            Console
          </button>
          <button 
            className={bottomPanel === 'stats' ? 'active' : ''}
            onClick={() => setBottomPanel('stats')}
          >
            Statistics
          </button>
        </div>
        <div className="panel-content">
          {bottomPanel === 'gcode' && (
            <textarea
              className="gcode-editor"
              value={gcode}
              onChange={(e) => setGcode(e.target.value)}
              spellCheck={false}
            />
          )}
          {bottomPanel === 'console' && (
            <div className="console-output">
              <div className="console-line info">System initialized</div>
              <div className="console-line">Machine: {workspace.machine.model}</div>
              <div className="console-line">Work offset: {workspace.setup.workOffset}</div>
            </div>
          )}
          {bottomPanel === 'stats' && (
            <div className="stats-panel">
              <div className="stat">
                <label>Cycle Time:</label>
                <span>00:12:34</span>
              </div>
              <div className="stat">
                <label>Distance:</label>
                <span>1,234 mm</span>
              </div>
              <div className="stat">
                <label>Tools Used:</label>
                <span>3</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSimulator;