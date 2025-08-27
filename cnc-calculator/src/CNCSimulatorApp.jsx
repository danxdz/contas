import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import './CNCSimulatorApp.css';

// Import all calculator modules
import ThreadCalculator from './components/ThreadCalculator';
import TrigonometryCalculator from './components/TrigonometryCalculator';
import CuttingSpeedCalculator from './components/CuttingSpeedCalculator';
import FaceMillingCalculator from './components/FaceMillingCalculator';
import VariousTools from './components/VariousTools';
import {
  ToolLifeCalculator,
  CircularInterpolation,
  PowerTorqueCalculator,
  GeometryTools,
  PocketMillingWizard,
  FeedsSpeedsOptimizer,
  ToolDatabase
} from './components/modules/index.jsx';

const CNCSimulatorApp = () => {
  // Main states
  const [gcode, setGcode] = useState(`; CNC Simulator Pro
; Ready for your program...
G21 G90 G94 ; Metric, Absolute, Feed/min
G17 ; XY Plane
G54 ; Work offset

; Load your G-code or STEP file
; Or use the integrated tools to generate code`);
  
  const [simulation, setSimulation] = useState({
    isPlaying: false,
    isPaused: false,
    currentLine: 0,
    speed: 1.0,
    position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
    feedRate: 0,
    spindleSpeed: 0,
    tool: null,
    coolant: false
  });

  // UI states
  const [activeModule, setActiveModule] = useState(null);
  const [panels, setPanels] = useState({
    left: { visible: true, width: 350, content: 'gcode' },
    right: { visible: true, width: 300, content: 'tools' },
    bottom: { visible: false, height: 200, content: 'console' }
  });
  
  const [workpiece, setWorkpiece] = useState({
    type: 'block', // block, cylinder, custom, step
    dimensions: { x: 100, y: 100, z: 50 },
    material: 'aluminum',
    stepFile: null
  });

  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const toolRef = useRef(null);
  const workpieceRef = useRef(null);
  const toolpathRef = useRef(null);

  // Module definitions
  const modules = {
    calculators: {
      name: 'Calculators',
      icon: '🧮',
      items: [
        { id: 'thread', name: 'Thread', component: ThreadCalculator, icon: '🔩' },
        { id: 'trig', name: 'Trigonometry', component: TrigonometryCalculator, icon: '📐' },
        { id: 'speeds', name: 'Cutting Speed', component: CuttingSpeedCalculator, icon: '⚡' },
        { id: 'facing', name: 'Face Milling', component: FaceMillingCalculator, icon: '🔨' },
        { id: 'toollife', name: 'Tool Life', component: ToolLifeCalculator, icon: '⏱️' },
        { id: 'power', name: 'Power/Torque', component: PowerTorqueCalculator, icon: '💪' }
      ]
    },
    programming: {
      name: 'Programming',
      icon: '💻',
      items: [
        { id: 'circular', name: 'Circular Interpolation', component: CircularInterpolation, icon: '🔄' },
        { id: 'pocket', name: 'Pocket Wizard', component: PocketMillingWizard, icon: '📦' },
        { id: 'geometry', name: 'Geometry', component: GeometryTools, icon: '📏' }
      ]
    },
    tools: {
      name: 'Tools',
      icon: '🛠️',
      items: [
        { id: 'database', name: 'Tool Database', component: ToolDatabase, icon: '🗄️' },
        { id: 'optimize', name: 'Feeds & Speeds', component: FeedsSpeedsOptimizer, icon: '📈' },
        { id: 'utilities', name: 'Utilities', component: VariousTools, icon: '🔧' }
      ]
    }
  };

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1e2a);
    scene.fog = new THREE.Fog(0x1a1e2a, 200, 1500);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(200, 200, 400);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 200);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Machine table
    const tableGeometry = new THREE.BoxGeometry(400, 300, 20);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.z = -10;
    table.receiveShadow = true;
    scene.add(table);

    // Add initial workpiece
    addWorkpiece();

    // Add tool
    addTool();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
  }, []);

  // Add workpiece to scene
  const addWorkpiece = () => {
    if (!sceneRef.current) return;
    
    // Remove existing workpiece
    if (workpieceRef.current) {
      sceneRef.current.remove(workpieceRef.current);
    }

    let geometry;
    if (workpiece.type === 'block') {
      geometry = new THREE.BoxGeometry(
        workpiece.dimensions.x,
        workpiece.dimensions.y,
        workpiece.dimensions.z
      );
    } else if (workpiece.type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(
        workpiece.dimensions.x / 2,
        workpiece.dimensions.x / 2,
        workpiece.dimensions.z,
        32
      );
      geometry.rotateX(Math.PI / 2);
    }

    const material = new THREE.MeshPhongMaterial({
      color: 0x8888ff,
      transparent: true,
      opacity: 0.7
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = workpiece.dimensions.z / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    workpieceRef.current = mesh;
    sceneRef.current.add(mesh);
  };

  // Add tool to scene
  const addTool = () => {
    if (!sceneRef.current) return;
    
    // Remove existing tool
    if (toolRef.current) {
      sceneRef.current.remove(toolRef.current);
    }

    const toolGroup = new THREE.Group();

    // Tool holder
    const holderGeometry = new THREE.CylinderGeometry(15, 15, 40, 16);
    const holderMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotateX(-Math.PI / 2);
    holder.position.z = 20;
    toolGroup.add(holder);

    // Cutting tool
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 30, 16);
    const toolMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.2
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotateX(-Math.PI / 2);
    tool.position.z = -15;
    toolGroup.add(tool);

    toolGroup.position.set(0, 0, 150);
    toolRef.current = toolGroup;
    sceneRef.current.add(toolGroup);
  };

  // Load STEP file
  const loadSTEPFile = async (file) => {
    // Note: STEP file loading requires additional libraries
    // For now, we'll support STL and OBJ files
    // Full STEP support would need opencascade.js or similar
    
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();
    
    if (fileName.endsWith('.stl')) {
      reader.onload = (e) => {
        const loader = new STLLoader();
        const geometry = loader.parse(e.target.result);
        
        const material = new THREE.MeshPhongMaterial({
          color: 0x8888ff,
          transparent: true,
          opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 50;
        
        if (workpieceRef.current) {
          sceneRef.current.remove(workpieceRef.current);
        }
        workpieceRef.current = mesh;
        sceneRef.current.add(mesh);
        
        // Update workpiece state
        setWorkpiece(prev => ({
          ...prev,
          type: 'custom',
          stepFile: file.name
        }));
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.obj')) {
      reader.onload = (e) => {
        const loader = new OBJLoader();
        const object = loader.parse(e.target.result);
        
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0x8888ff,
              transparent: true,
              opacity: 0.7
            });
          }
        });
        
        object.position.z = 50;
        
        if (workpieceRef.current) {
          sceneRef.current.remove(workpieceRef.current);
        }
        workpieceRef.current = object;
        sceneRef.current.add(object);
        
        setWorkpiece(prev => ({
          ...prev,
          type: 'custom',
          stepFile: file.name
        }));
      };
      reader.readAsText(file);
    } else if (fileName.endsWith('.step') || fileName.endsWith('.stp')) {
      alert('STEP file support coming soon! For now, please use STL or OBJ files.');
    }
  };

  // Export G-code
  const exportGCode = () => {
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.nc';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load G-code file
  const loadGCodeFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setGcode(e.target.result);
      parseGCode(e.target.result);
    };
    reader.readAsText(file);
  };

  // Parse G-code
  const parseGCode = (code) => {
    // Basic G-code parsing
    const lines = code.split('\n');
    const commands = [];
    
    lines.forEach((line, index) => {
      const cleanLine = line.split(/[;(]/)[0].trim();
      if (!cleanLine) return;
      
      commands.push({
        line: index,
        code: cleanLine,
        original: line
      });
    });
    
    // Draw toolpath
    drawToolpath(commands);
  };

  // Draw toolpath
  const drawToolpath = (commands) => {
    if (!sceneRef.current) return;
    
    // Remove existing toolpath
    if (toolpathRef.current) {
      sceneRef.current.remove(toolpathRef.current);
    }
    
    const toolpathGroup = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    
    let currentPos = { x: 0, y: 0, z: 0 };
    
    commands.forEach(cmd => {
      const parts = cmd.code.split(/\s+/);
      let newPos = { ...currentPos };
      
      parts.forEach(part => {
        const letter = part[0];
        const value = parseFloat(part.substring(1));
        
        if (letter === 'X') newPos.x = value;
        if (letter === 'Y') newPos.y = value;
        if (letter === 'Z') newPos.z = value;
      });
      
      if (cmd.code.startsWith('G01') || cmd.code.startsWith('G1') ||
          cmd.code.startsWith('G00') || cmd.code.startsWith('G0')) {
        const points = [
          new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
          new THREE.Vector3(newPos.x, newPos.y, newPos.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        toolpathGroup.add(line);
        
        currentPos = newPos;
      }
    });
    
    toolpathRef.current = toolpathGroup;
    sceneRef.current.add(toolpathGroup);
  };

  // Simulation controls
  const play = () => setSimulation(prev => ({ ...prev, isPlaying: true, isPaused: false }));
  const pause = () => setSimulation(prev => ({ ...prev, isPaused: true }));
  const stop = () => setSimulation(prev => ({ ...prev, isPlaying: false, isPaused: false, currentLine: 0 }));
  const stepForward = () => setSimulation(prev => ({ ...prev, currentLine: prev.currentLine + 1 }));
  const stepBackward = () => setSimulation(prev => ({ ...prev, currentLine: Math.max(0, prev.currentLine - 1) }));

  // Camera views
  const setCameraView = (view) => {
    if (!cameraRef.current) return;
    
    const positions = {
      top: [0, 0, 500],
      front: [0, -500, 0],
      side: [500, 0, 0],
      iso: [200, 200, 400]
    };
    
    const pos = positions[view];
    if (pos) {
      cameraRef.current.position.set(...pos);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Render active module
  const renderModule = () => {
    if (!activeModule) return null;
    
    const [category, moduleId] = activeModule.split('.');
    const module = modules[category]?.items.find(m => m.id === moduleId);
    if (!module) return null;
    
    const Component = module.component;
    return (
      <div className="module-container">
        <div className="module-header">
          <h3>{module.icon} {module.name}</h3>
          <button onClick={() => setActiveModule(null)}>✕</button>
        </div>
        <div className="module-content">
          <Component />
        </div>
      </div>
    );
  };

  return (
    <div className="cnc-simulator-app">
      {/* Top Toolbar */}
      <div className="app-toolbar">
        <div className="toolbar-group">
          <h1 className="app-title">🔧 CNC Simulator Pro</h1>
        </div>
        
        <div className="toolbar-group">
          <label className="file-btn">
            📁 Load NC
            <input type="file" accept=".nc,.gcode,.txt" onChange={loadGCodeFile} hidden />
          </label>
          <label className="file-btn">
            📦 Load Model
            <input type="file" accept=".stl,.obj,.step,.stp" onChange={(e) => loadSTEPFile(e.target.files[0])} hidden />
          </label>
          <button onClick={exportGCode}>💾 Export</button>
        </div>
        
        <div className="toolbar-group">
          <button onClick={play} className={simulation.isPlaying ? 'active' : ''}>▶️</button>
          <button onClick={pause}>⏸️</button>
          <button onClick={stop}>⏹️</button>
          <button onClick={stepBackward}>⏮️</button>
          <button onClick={stepForward}>⏭️</button>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={simulation.speed}
            onChange={(e) => setSimulation(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
            className="speed-slider"
          />
          <span>{simulation.speed}x</span>
        </div>
        
        <div className="toolbar-group">
          <button onClick={() => setCameraView('top')}>Top</button>
          <button onClick={() => setCameraView('front')}>Front</button>
          <button onClick={() => setCameraView('side')}>Side</button>
          <button onClick={() => setCameraView('iso')}>Iso</button>
        </div>
        
        <div className="toolbar-group">
          <span>X:{simulation.position.x.toFixed(2)}</span>
          <span>Y:{simulation.position.y.toFixed(2)}</span>
          <span>Z:{simulation.position.z.toFixed(2)}</span>
          <span>F:{simulation.feedRate}</span>
          <span>S:{simulation.spindleSpeed}</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="app-layout">
        {/* Left Panel */}
        {panels.left.visible && (
          <div className="panel panel-left" style={{ width: panels.left.width }}>
            <div className="panel-tabs">
              <button 
                className={panels.left.content === 'gcode' ? 'active' : ''}
                onClick={() => setPanels(prev => ({ ...prev, left: { ...prev.left, content: 'gcode' } }))}
              >
                G-Code
              </button>
              <button 
                className={panels.left.content === 'modules' ? 'active' : ''}
                onClick={() => setPanels(prev => ({ ...prev, left: { ...prev.left, content: 'modules' } }))}
              >
                Modules
              </button>
            </div>
            
            {panels.left.content === 'gcode' && (
              <div className="gcode-editor">
                <div className="line-numbers">
                  {gcode.split('\n').map((_, i) => (
                    <div key={i} className={i === simulation.currentLine ? 'active' : ''}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={gcode}
                  onChange={(e) => setGcode(e.target.value)}
                  spellCheck={false}
                />
              </div>
            )}
            
            {panels.left.content === 'modules' && (
              <div className="modules-list">
                {Object.entries(modules).map(([catKey, category]) => (
                  <div key={catKey} className="module-category">
                    <h4>{category.icon} {category.name}</h4>
                    {category.items.map(module => (
                      <button
                        key={module.id}
                        className="module-item"
                        onClick={() => setActiveModule(`${catKey}.${module.id}`)}
                      >
                        {module.icon} {module.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Center - 3D View */}
        <div className="viewport-container">
          <div ref={mountRef} className="viewport-3d" />
          
          {/* Active Module Overlay */}
          {activeModule && (
            <div className="module-overlay">
              {renderModule()}
            </div>
          )}
        </div>

        {/* Right Panel */}
        {panels.right.visible && (
          <div className="panel panel-right" style={{ width: panels.right.width }}>
            <div className="panel-tabs">
              <button 
                className={panels.right.content === 'tools' ? 'active' : ''}
                onClick={() => setPanels(prev => ({ ...prev, right: { ...prev.right, content: 'tools' } }))}
              >
                Tools
              </button>
              <button 
                className={panels.right.content === 'setup' ? 'active' : ''}
                onClick={() => setPanels(prev => ({ ...prev, right: { ...prev.right, content: 'setup' } }))}
              >
                Setup
              </button>
            </div>
            
            {panels.right.content === 'tools' && (
              <div className="tools-panel">
                <h4>Tool Library</h4>
                <div className="tool-list">
                  <div className="tool-item">
                    <span>T1: ⌀10mm End Mill</span>
                  </div>
                  <div className="tool-item">
                    <span>T2: ⌀6mm Drill</span>
                  </div>
                  <div className="tool-item">
                    <span>T3: ⌀50mm Face Mill</span>
                  </div>
                </div>
              </div>
            )}
            
            {panels.right.content === 'setup' && (
              <div className="setup-panel">
                <h4>Workpiece</h4>
                <select 
                  value={workpiece.type}
                  onChange={(e) => {
                    setWorkpiece(prev => ({ ...prev, type: e.target.value }));
                    setTimeout(addWorkpiece, 100);
                  }}
                >
                  <option value="block">Block</option>
                  <option value="cylinder">Cylinder</option>
                  <option value="custom">Custom (Load File)</option>
                </select>
                
                <div className="dimension-inputs">
                  <label>
                    X: <input 
                      type="number" 
                      value={workpiece.dimensions.x}
                      onChange={(e) => {
                        setWorkpiece(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, x: parseFloat(e.target.value) || 100 }
                        }));
                        setTimeout(addWorkpiece, 100);
                      }}
                    />
                  </label>
                  <label>
                    Y: <input 
                      type="number" 
                      value={workpiece.dimensions.y}
                      onChange={(e) => {
                        setWorkpiece(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, y: parseFloat(e.target.value) || 100 }
                        }));
                        setTimeout(addWorkpiece, 100);
                      }}
                    />
                  </label>
                  <label>
                    Z: <input 
                      type="number" 
                      value={workpiece.dimensions.z}
                      onChange={(e) => {
                        setWorkpiece(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, z: parseFloat(e.target.value) || 50 }
                        }));
                        setTimeout(addWorkpiece, 100);
                      }}
                    />
                  </label>
                </div>
                
                <h4>Work Offsets</h4>
                <select>
                  <option>G54</option>
                  <option>G55</option>
                  <option>G56</option>
                  <option>G57</option>
                  <option>G58</option>
                  <option>G59</option>
                </select>
                
                <div className="offset-values">
                  <label>X: <input type="number" defaultValue="0" /></label>
                  <label>Y: <input type="number" defaultValue="0" /></label>
                  <label>Z: <input type="number" defaultValue="0" /></label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Panel (optional) */}
      {panels.bottom.visible && (
        <div className="panel panel-bottom" style={{ height: panels.bottom.height }}>
          <div className="console">
            <div>Ready...</div>
            <div>Program loaded: {gcode.split('\n').length} lines</div>
            <div>Current line: {simulation.currentLine}</div>
          </div>
        </div>
      )}

      {/* Panel Toggles */}
      <div className="panel-toggles">
        <button 
          onClick={() => setPanels(prev => ({ ...prev, left: { ...prev.left, visible: !prev.left.visible } }))}
          className={panels.left.visible ? 'active' : ''}
        >
          ◀
        </button>
        <button 
          onClick={() => setPanels(prev => ({ ...prev, bottom: { ...prev.bottom, visible: !prev.bottom.visible } }))}
          className={panels.bottom.visible ? 'active' : ''}
        >
          ▼
        </button>
        <button 
          onClick={() => setPanels(prev => ({ ...prev, right: { ...prev.right, visible: !prev.right.visible } }))}
          className={panels.right.visible ? 'active' : ''}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default CNCSimulatorApp;