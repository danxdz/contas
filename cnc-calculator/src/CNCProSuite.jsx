import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import './CNCProSuite.css';

// Components
import DualChannelDebugger from './components/DualChannelDebugger';
import StepProcessor from './components/StepProcessor';
import GCodeEditor from './components/GCodeEditor';
import ToolManager from './components/ToolManager';
import MachineControl from './components/MachineControl';
import FeatureTree from './components/FeatureTree';

// Import all calculator modules
import {
  ToolLifeCalculator,
  CircularInterpolation,
  PowerTorqueCalculator,
  GeometryTools,
  PocketMillingWizard,
  UnifiedSimulator,
  FeedsSpeedsOptimizer,
  ToolDatabase,
  ShopFloorUtilities,
  MachineConfigurator,
  SetupManager
} from './components/modules';

const CNCProSuite = () => {
  // Panel system - each panel can be floating or docked
  const [panels, setPanels] = useState({
    gcode: {
      visible: true,
      floating: false,
      docked: 'left',
      position: { x: 20, y: 60 },
      size: { width: 400, height: 600 },
      zIndex: 1,
      minimized: false,
      title: 'G-Code Editor'
    },
    tools: {
      visible: true,
      floating: false,
      docked: 'right',
      position: { x: window.innerWidth - 320, y: 60 },
      size: { width: 300, height: 400 },
      zIndex: 1,
      minimized: false,
      title: 'Tool Manager'
    },
    dualChannel: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Dual Channel Debugger'
    },
    stepProcessor: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 150, y: 150 },
      size: { width: 700, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'STEP Processor'
    },
    machineControl: {
      visible: true,
      floating: false,
      docked: 'bottom',
      position: { x: 20, y: window.innerHeight - 200 },
      size: { width: window.innerWidth - 40, height: 150 },
      zIndex: 1,
      minimized: false,
      title: 'Machine Control'
    },
    features: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 50, y: 100 },
      size: { width: 350, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Feature Tree'
    },
    console: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 200, y: 200 },
      size: { width: 600, height: 300 },
      zIndex: 1,
      minimized: false,
      title: 'Console'
    },
    // Calculator modules
    feedsSpeeds: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 100, y: 100 },
      size: { width: 500, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Feeds & Speeds Calculator'
    },
    toolLife: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 150, y: 100 },
      size: { width: 500, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Tool Life Calculator'
    },
    geometry: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 200, y: 100 },
      size: { width: 550, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Geometry Tools'
    },
    pocketMilling: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 120, y: 120 },
      size: { width: 600, height: 650 },
      zIndex: 2,
      minimized: false,
      title: 'Pocket Milling Wizard'
    },
    shopFloor: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 180, y: 100 },
      size: { width: 700, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Shop Floor Utilities'
    },
    powerTorque: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 250, y: 150 },
      size: { width: 500, height: 550 },
      zIndex: 2,
      minimized: false,
      title: 'Power & Torque Calculator'
    },
    circular: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 300, y: 100 },
      size: { width: 500, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Circular Interpolation'
    },
    machineConfig: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 100, y: 80 },
      size: { width: 800, height: 700 },
      zIndex: 2,
      minimized: false,
      title: 'Machine Configurator'
    },
    setupManager: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 150, y: 90 },
      size: { width: 750, height: 650 },
      zIndex: 2,
      minimized: false,
      title: 'Setup Manager'
    },
    toolDatabase: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 200, y: 100 },
      size: { width: 700, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Tool Database'
    }
  });

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    speed: 1.0,
    currentLine: 0,
    position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
    feedRate: 0,
    spindleSpeed: 0,
    tool: null
  });

  const [project, setProject] = useState({
    name: 'Example Pocket Milling',
    gcode: {
      channel1: `; POCKET MILLING EXAMPLE
; Material: Aluminum 6061
; Tool: 10mm End Mill
; ====================

G21 G90 G94 ; Metric, Absolute, Feed/min
G17 G49 G40 G80 ; XY plane, Cancel offsets
G54 ; Work coordinate system

; Tool Change
T1 M06 ; Select Tool 1
S12000 M03 ; Spindle ON, 12000 RPM
M08 ; Coolant ON

; Rapid to start position
G00 X-40 Y-25 ; Move to pocket corner
G00 Z5 ; Safe height

; Pocket roughing - Layer 1 (Z-5)
G01 Z-5 F300 ; Plunge
G01 X40 F800 ; Cut along X
G01 Y-15 ; Step over
G01 X-40 ; Return cut
G01 Y-5 ; Step over
G01 X40 ; Cut
G01 Y5 ; Step over
G01 X-40 ; Return
G01 Y15 ; Step over
G01 X40 ; Cut
G01 Y25 ; Final pass
G01 X-40 ; Return

; Pocket roughing - Layer 2 (Z-10)
G00 Z1 ; Lift
G00 X-35 Y-20 ; Reposition
G01 Z-10 F300 ; Plunge deeper
G01 X35 F800 ; Cut
G01 Y-10 ; Step
G01 X-35 ; Return
G01 Y0 ; Step
G01 X35 ; Cut
G01 Y10 ; Step
G01 X-35 ; Return
G01 Y20 ; Final
G01 X35 ; Cut

; Finishing pass
G00 Z1 ; Lift
G00 X-40 Y-25 ; Corner
G01 Z-10 F200 ; Plunge
G01 X40 Y-25 F600 ; Bottom edge
G01 X40 Y25 ; Right edge
G01 X-40 Y25 ; Top edge
G01 X-40 Y-25 ; Left edge

; Drilling cycle for corner holes
G00 Z5 ; Safe height
G00 X-50 Y-30 ; Hole 1
G81 Z-25 R2 F150 ; Drill cycle
X50 ; Hole 2
Y30 ; Hole 3
X-50 ; Hole 4
G80 ; Cancel cycle

; Program end
G00 Z100 ; Retract
M09 ; Coolant OFF
M05 ; Spindle OFF
G28 G91 Z0 ; Home Z
G28 X0 Y0 ; Home XY
M30 ; Program end`,
      channel2: `; SUB SPINDLE PROGRAM
; For dual-spindle lathes
; ====================

G21 G90 G94
G55 ; Second work offset
T11 M06
S8000 M03
G00 X0 Y0 Z5

; Waiting for main spindle
M00 ; Optional stop

; Sub operations here
G01 Z-10 F200
G01 X20 F500
G01 Y20
G01 X-20
G01 Y-20
G00 Z5

M30 ; End`
    },
    stepFile: null,
    stepContent: null,
    features: [],
    suggestedTools: [],
    tools: []
  });

  const [draggedPanel, setDraggedPanel] = useState(null);
  const [resizingPanel, setResizingPanel] = useState(null);
  const [panelDragOffset, setPanelDragOffset] = useState({ x: 0, y: 0 });

  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const workpieceRef = useRef(null);
  const toolRef = useRef(null);
  const toolpathRef = useRef(null);

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 200, 2000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.set(300, 300, 500);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 200, 400);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(1000, 50, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);

    // Machine bed
    const bedGeometry = new THREE.BoxGeometry(600, 400, 20);
    const bedMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.z = -10;
    bed.receiveShadow = true;
    scene.add(bed);
    
    // Example Workpiece - Aluminum block
    const workpieceGroup = new THREE.Group();
    
    // Main stock
    const stockGeometry = new THREE.BoxGeometry(150, 100, 50);
    const stockMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x888888,
      metalness: 0.7,
      roughness: 0.3
    });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.z = 25;
    stock.castShadow = true;
    stock.receiveShadow = true;
    workpieceGroup.add(stock);
    
    // Machined pocket
    const pocketGeometry = new THREE.BoxGeometry(100, 60, 20);
    const pocketMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
    pocket.position.set(0, 0, 35);
    workpieceGroup.add(pocket);
    
    // Holes
    const holePositions = [
      { x: -50, y: -30 },
      { x: 50, y: -30 },
      { x: 50, y: 30 },
      { x: -50, y: 30 }
    ];
    
    holePositions.forEach(pos => {
      const holeGeometry = new THREE.CylinderGeometry(5, 5, 51, 32);
      const holeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444
      });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(pos.x, pos.y, 25);
      hole.rotation.x = Math.PI / 2;
      workpieceGroup.add(hole);
    });
    
    scene.add(workpieceGroup);
    workpieceRef.current = workpieceGroup;
    
    // Example Tool - End Mill
    const toolGroup = new THREE.Group();
    
    // Tool holder
    const holderGeometry = new THREE.CylinderGeometry(12, 12, 40, 32);
    const holderMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      metalness: 0.9
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.position.z = 20;
    toolGroup.add(holder);
    
    // Cutting tool
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 30, 32);
    const toolMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.position.z = -5;
    toolGroup.add(tool);
    
    toolGroup.position.set(0, 0, 100);
    scene.add(toolGroup);
    toolRef.current = toolGroup;
    
    // Example Toolpath - Pocket milling pattern
    const toolpathPoints = [];
    const steps = 20;
    const width = 80;
    const height = 50;
    
    // Spiral pocket pattern
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const offset = t * 30;
      const points = [
        new THREE.Vector3(-width/2 + offset, -height/2 + offset, 40 - t * 15),
        new THREE.Vector3(width/2 - offset, -height/2 + offset, 40 - t * 15),
        new THREE.Vector3(width/2 - offset, height/2 - offset, 40 - t * 15),
        new THREE.Vector3(-width/2 + offset, height/2 - offset, 40 - t * 15),
        new THREE.Vector3(-width/2 + offset, -height/2 + offset, 40 - t * 15)
      ];
      toolpathPoints.push(...points);
    }
    
    const toolpathGeometry = new THREE.BufferGeometry().setFromPoints(toolpathPoints);
    const toolpathMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.7
    });
    const toolpath = new THREE.Line(toolpathGeometry, toolpathMaterial);
    scene.add(toolpath);
    toolpathRef.current = toolpath;
    
    // Add coordinate labels
    const addAxisLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      context.fillStyle = color;
      context.font = 'bold 48px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(20, 20, 1);
      scene.add(sprite);
    };
    
    addAxisLabel('X', new THREE.Vector3(220, 0, 0), '#ff0000');
    addAxisLabel('Y', new THREE.Vector3(0, 220, 0), '#00ff00');
    addAxisLabel('Z', new THREE.Vector3(0, 0, 220), '#0088ff');

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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

  // Panel management functions
  const togglePanel = (panelId) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        visible: !prev[panelId].visible
      }
    }));
  };

  const toggleFloating = (panelId) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        floating: !prev[panelId].floating,
        docked: prev[panelId].floating ? 'left' : null,
        zIndex: prev[panelId].floating ? 1 : getMaxZIndex() + 1
      }
    }));
  };

  const minimizePanel = (panelId) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        minimized: !prev[panelId].minimized
      }
    }));
  };

  const closePanel = (panelId) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        visible: false
      }
    }));
  };

  const getMaxZIndex = () => {
    return Math.max(...Object.values(panels).map(p => p.zIndex || 1));
  };

  const bringToFront = (panelId) => {
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        zIndex: getMaxZIndex() + 1
      }
    }));
  };

  const startDragging = (e, panelId) => {
    const panel = panels[panelId];
    if (!panel.floating) return;
    
    setDraggedPanel(panelId);
    setPanelDragOffset({
      x: e.clientX - panel.position.x,
      y: e.clientY - panel.position.y
    });
    bringToFront(panelId);
  };

  const startResizing = (e, panelId) => {
    e.stopPropagation();
    setResizingPanel(panelId);
    bringToFront(panelId);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggedPanel) {
        setPanels(prev => ({
          ...prev,
          [draggedPanel]: {
            ...prev[draggedPanel],
            position: {
              x: Math.max(0, Math.min(window.innerWidth - prev[draggedPanel].size.width, e.clientX - panelDragOffset.x)),
              y: Math.max(40, Math.min(window.innerHeight - 50, e.clientY - panelDragOffset.y))
            }
          }
        }));
      }
      
      if (resizingPanel) {
        const panel = panels[resizingPanel];
        setPanels(prev => ({
          ...prev,
          [resizingPanel]: {
            ...prev[resizingPanel],
            size: {
              width: Math.max(200, e.clientX - panel.position.x),
              height: Math.max(150, e.clientY - panel.position.y)
            }
          }
        }));
      }
    };

    const handleMouseUp = () => {
      setDraggedPanel(null);
      setResizingPanel(null);
    };

    if (draggedPanel || resizingPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedPanel, resizingPanel, panelDragOffset, panels]);

  // Render panel
  const renderPanel = (panelId, content) => {
    const panel = panels[panelId];
    if (!panel.visible) return null;

    const panelStyle = panel.floating ? {
      position: 'fixed',
      left: panel.position.x,
      top: panel.position.y,
      width: panel.size.width,
      height: panel.minimized ? 35 : panel.size.height,
      zIndex: panel.zIndex
    } : {};

    const panelClass = `panel ${panel.floating ? 'floating' : 'docked'} ${panel.docked ? `docked-${panel.docked}` : ''} ${panel.minimized ? 'minimized' : ''}`;

    return (
      <div 
        key={panelId}
        className={panelClass}
        style={panelStyle}
      >
        <div 
          className="panel-header"
          onMouseDown={(e) => startDragging(e, panelId)}
        >
          <span className="panel-title">{panel.title}</span>
          <div className="panel-controls">
            <button onClick={() => toggleFloating(panelId)} title={panel.floating ? 'Dock' : 'Float'}>
              {panel.floating ? '📌' : '📍'}
            </button>
            <button onClick={() => minimizePanel(panelId)} title="Minimize">
              {panel.minimized ? '🔼' : '🔽'}
            </button>
            <button onClick={() => closePanel(panelId)} title="Close">
              ✖
            </button>
          </div>
        </div>
        {!panel.minimized && (
          <>
            <div className="panel-content">
              {content}
            </div>
            {panel.floating && (
              <div 
                className="panel-resize-handle"
                onMouseDown={(e) => startResizing(e, panelId)}
              />
            )}
          </>
        )}
      </div>
    );
  };

  // Quick access toolbar
  const QuickToolbar = () => (
    <div className="quick-toolbar">
      <div className="toolbar-group">
        <button onClick={() => document.getElementById('file-input').click()} title="Open File">
          📁
        </button>
        <input 
          id="file-input"
          type="file" 
          accept=".nc,.gcode,.step,.stp,.stl"
          onChange={(e) => handleFileLoad(e.target.files[0])}
          hidden
        />
        <button onClick={() => saveProject()} title="Save">💾</button>
        <button onClick={() => newProject()} title="New">📄</button>
      </div>
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <button 
          onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
          className={simulation.isPlaying ? 'active' : ''}
          title="Play/Pause"
        >
          {simulation.isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={() => stopSimulation()} title="Stop">⏹️</button>
        <button onClick={() => stepForward()} title="Step">⏭️</button>
        <input 
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={simulation.speed}
          onChange={(e) => setSimulation(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
          className="speed-slider"
          title={`Speed: ${simulation.speed}x`}
        />
      </div>
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <button onClick={() => setCameraView('top')} title="Top View">⬆️</button>
        <button onClick={() => setCameraView('front')} title="Front View">➡️</button>
        <button onClick={() => setCameraView('side')} title="Side View">⬅️</button>
        <button onClick={() => setCameraView('iso')} title="Isometric">🔷</button>
      </div>
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <button onClick={() => togglePanel('gcode')} className={panels.gcode.visible ? 'active' : ''} title="G-Code Editor">
          📝
        </button>
        <button onClick={() => togglePanel('tools')} className={panels.tools.visible ? 'active' : ''} title="Tools">
          🔧
        </button>
        <button onClick={() => togglePanel('dualChannel')} className={panels.dualChannel.visible ? 'active' : ''} title="Dual Channel">
          👥
        </button>
        <button onClick={() => togglePanel('stepProcessor')} className={panels.stepProcessor.visible ? 'active' : ''} title="STEP Processor">
          📦
        </button>
        <button onClick={() => togglePanel('features')} className={panels.features.visible ? 'active' : ''} title="Features">
          🌳
        </button>
        <button onClick={() => togglePanel('machineControl')} className={panels.machineControl.visible ? 'active' : ''} title="Machine Control">
          🎮
        </button>
        <button onClick={() => togglePanel('console')} className={panels.console.visible ? 'active' : ''} title="Console">
          💻
        </button>
      </div>
      
      <div className="toolbar-info">
        <span>{project.name}</span>
        <span>|</span>
        <span>X: {simulation.position.x.toFixed(3)}</span>
        <span>Y: {simulation.position.y.toFixed(3)}</span>
        <span>Z: {simulation.position.z.toFixed(3)}</span>
        <span>|</span>
        <span>F: {simulation.feedRate}</span>
        <span>S: {simulation.spindleSpeed}</span>
        <span>|</span>
        <span>Line: {simulation.currentLine}</span>
      </div>
    </div>
  );

  // Action handlers
  const handleFileLoad = (file) => {
    if (!file) return;
    
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.step') || ext.endsWith('.stp')) {
      // Load STEP file
      loadSTEPFile(file);
      togglePanel('stepProcessor');
    } else if (ext.endsWith('.stl')) {
      // Load STL file
      loadSTLFile(file);
    } else {
      // Load G-code
      loadGCodeFile(file);
    }
  };

  const loadSTEPFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Parse STEP file content
      const stepContent = e.target.result;
      
      // Extract basic features from STEP (simplified - real implementation would parse STEP format)
      const features = detectFeaturesFromSTEP(stepContent);
      const suggestedTools = generateToolsFromFeatures(features);
      
      setProject(prev => ({
        ...prev,
        stepFile: file.name,
        stepContent: stepContent,
        features: features,
        suggestedTools: suggestedTools
      }));
      
      // Show STEP processor panel
      setPanels(prev => ({
        ...prev,
        stepProcessor: { ...prev.stepProcessor, visible: true }
      }));
    };
    reader.readAsText(file);
  };
  
  const detectFeaturesFromSTEP = (content) => {
    // Mock feature detection - in production would parse STEP geometry
    const features = [];
    
    // Look for common STEP entities
    if (content.includes('CYLINDRICAL_SURFACE') || content.includes('CIRCLE')) {
      features.push({ 
        type: 'hole', 
        diameter: 10, 
        depth: 25,
        position: { x: 30, y: 30, z: 0 }
      });
      features.push({ 
        type: 'hole', 
        diameter: 8, 
        depth: 20,
        position: { x: -30, y: 30, z: 0 }
      });
    }
    
    if (content.includes('RECTANGULAR_TRIMMED_SURFACE')) {
      features.push({ 
        type: 'pocket', 
        depth: 10, 
        width: 50, 
        length: 80,
        cornerRadius: 5,
        position: { x: 0, y: 0, z: 10 }
      });
    }
    
    if (content.includes('SLOT') || content.includes('RECTANGULAR_CLOSED_PROFILE')) {
      features.push({ 
        type: 'slot', 
        width: 8, 
        length: 40, 
        depth: 5,
        position: { x: 0, y: -40, z: 5 }
      });
    }
    
    // If no specific features found, add default ones
    if (features.length === 0) {
      features.push(
        { type: 'pocket', depth: 10, width: 50, length: 80, cornerRadius: 5 },
        { type: 'hole', diameter: 10, depth: 20 },
        { type: 'hole', diameter: 8, depth: 15 },
        { type: 'slot', width: 8, length: 40, depth: 5 },
        { type: 'profile', perimeter: 280, depth: 2 }
      );
    }
    
    return features;
  };
  
  const generateToolsFromFeatures = (features) => {
    const tools = [];
    const toolSet = new Set();
    
    features.forEach(feature => {
      switch(feature.type) {
        case 'hole':
          if (feature.diameter <= 6) {
            toolSet.add(JSON.stringify({ type: 'drill', diameter: feature.diameter }));
          } else {
            toolSet.add(JSON.stringify({ type: 'drill', diameter: feature.diameter - 0.2 }));
            toolSet.add(JSON.stringify({ type: 'reamer', diameter: feature.diameter }));
          }
          break;
        case 'pocket':
          toolSet.add(JSON.stringify({ type: 'endmill', diameter: 10, flutes: 3 }));
          if (feature.cornerRadius) {
            toolSet.add(JSON.stringify({ type: 'endmill', diameter: feature.cornerRadius * 2, flutes: 4 }));
          }
          break;
        case 'slot':
          toolSet.add(JSON.stringify({ type: 'slotmill', diameter: feature.width, flutes: 2 }));
          break;
        case 'profile':
          toolSet.add(JSON.stringify({ type: 'endmill', diameter: 12, flutes: 4 }));
          break;
      }
    });
    
    // Convert Set back to array of unique tools
    Array.from(toolSet).forEach(toolStr => {
      tools.push(JSON.parse(toolStr));
    });
    
    return tools;
  };

  const loadSTLFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const loader = new STLLoader();
      const geometry = loader.parse(e.target.result);
      const material = new THREE.MeshPhongMaterial({ color: 0x8888ff, opacity: 0.8, transparent: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = 50;
      sceneRef.current.add(mesh);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadGCodeFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProject(prev => ({
        ...prev,
        gcode: { ...prev.gcode, channel1: e.target.result }
      }));
    };
    reader.readAsText(file);
  };

  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const positions = {
      top: [0, 0, 800],      // Looking down Z-axis
      front: [0, -800, 0],   // Looking along Y-axis
      side: [800, 0, 0],     // Looking along X-axis
      iso: [600, -400, 400]  // Rotated 90° CCW so Y points up-right
    };
    const pos = positions[view];
    if (pos) {
      cameraRef.current.position.set(...pos);
      cameraRef.current.lookAt(0, 0, 0);
      
      // Set up vector for proper orientation (Z-up for CNC)
      cameraRef.current.up.set(0, 0, 1);
      controlsRef.current.update();
    }
  };

  const newProject = () => {
    setProject({
      name: 'Untitled Project',
      gcode: { channel1: '', channel2: '' },
      stepFile: null,
      features: [],
      tools: []
    });
  };

  const saveProject = () => {
    const data = JSON.stringify(project);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.cnc`;
    a.click();
  };

  const stopSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: false,
      currentLine: 0,
      position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 }
    }));
  };

  const stepForward = () => {
    setSimulation(prev => ({
      ...prev,
      currentLine: prev.currentLine + 1
    }));
  };

  // Top menu system
  const [activeMenu, setActiveMenu] = useState(null);
  
  const menuItems = {
    file: {
      label: 'File',
      items: [
        { id: 'new', label: 'New Project', shortcut: 'Ctrl+N', action: newProject },
        { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => document.getElementById('file-input').click() },
        { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: saveProject },
        { id: 'saveAs', label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: saveProject },
        { divider: true },
        { id: 'import', label: 'Import STEP...', action: () => document.getElementById('step-file-input').click() },
        { id: 'export', label: 'Export G-Code...', action: () => {} },
        { divider: true },
        { id: 'recent', label: 'Recent Files', submenu: true },
        { divider: true },
        { id: 'exit', label: 'Exit', action: () => window.close() }
      ]
    },
    edit: {
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', action: () => {} },
        { divider: true },
        { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: () => {} },
        { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => {} },
        { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => {} },
        { divider: true },
        { id: 'find', label: 'Find...', shortcut: 'Ctrl+F', action: () => {} },
        { id: 'replace', label: 'Replace...', shortcut: 'Ctrl+H', action: () => {} }
      ]
    },
    view: {
      label: 'View',
      items: [
        { id: 'top', label: 'Top View', action: () => setCameraView('top') },
        { id: 'front', label: 'Front View', action: () => setCameraView('front') },
        { id: 'side', label: 'Side View', action: () => setCameraView('side') },
        { id: 'iso', label: 'Isometric', action: () => setCameraView('iso') },
        { divider: true },
        { id: 'gcode', label: 'G-Code Editor', checked: panels.gcode.visible, action: () => togglePanel('gcode') },
        { id: 'tools', label: 'Tool Manager', checked: panels.tools.visible, action: () => togglePanel('tools') },
        { id: 'dual', label: 'Dual Channel', checked: panels.dualChannel.visible, action: () => togglePanel('dualChannel') },
        { id: 'step', label: 'STEP Processor', checked: panels.stepProcessor.visible, action: () => togglePanel('stepProcessor') },
        { id: 'machine', label: 'Machine Control', checked: panels.machineControl.visible, action: () => togglePanel('machineControl') },
        { id: 'features', label: 'Feature Tree', checked: panels.features.visible, action: () => togglePanel('features') },
        { id: 'console', label: 'Console', checked: panels.console.visible, action: () => togglePanel('console') }
      ]
    },
    simulation: {
      label: 'Simulation',
      items: [
        { id: 'play', label: simulation.isPlaying ? 'Pause' : 'Play', shortcut: 'Space', action: () => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying })) },
        { id: 'stop', label: 'Stop', action: stopSimulation },
        { id: 'step', label: 'Step Forward', shortcut: 'F10', action: stepForward },
        { divider: true },
        { id: 'speed', label: `Speed: ${simulation.speed}x`, submenu: true },
        { divider: true },
        { id: 'verify', label: 'Verify G-Code', action: () => {} },
        { id: 'optimize', label: 'Optimize Toolpath', action: () => {} }
      ]
    },
    tools: {
      label: 'Tools',
      items: [
        { id: 'feedsspeeds', label: 'Feeds & Speeds Optimizer', action: () => togglePanel('feedsSpeeds') },
        { id: 'toollife', label: 'Tool Life Calculator', action: () => togglePanel('toolLife') },
        { id: 'powerTorque', label: 'Power & Torque Calculator', action: () => togglePanel('powerTorque') },
        { id: 'circular', label: 'Circular Interpolation', action: () => togglePanel('circular') },
        { id: 'geometry', label: 'Geometry Tools', action: () => togglePanel('geometry') },
        { divider: true },
        { id: 'pocketwizard', label: 'Pocket Milling Wizard', action: () => togglePanel('pocketMilling') },
        { id: 'shopfloor', label: 'Shop Floor Utilities', action: () => togglePanel('shopFloor') },
        { divider: true },
        { id: 'tooldatabase', label: 'Tool Database', action: () => togglePanel('toolDatabase') },
        { id: 'machineconfig', label: 'Machine Configurator', action: () => togglePanel('machineConfig') },
        { id: 'setupmanager', label: 'Setup Manager', action: () => togglePanel('setupManager') }
      ]
    },
    machine: {
      label: 'Machine',
      items: [
        { id: 'connect', label: 'Connect to Machine', action: () => {} },
        { id: 'disconnect', label: 'Disconnect', disabled: true, action: () => {} },
        { divider: true },
        { id: 'jog', label: 'Jog Mode', action: () => {} },
        { id: 'mdi', label: 'MDI Mode', action: () => {} },
        { id: 'auto', label: 'Auto Mode', action: () => {} },
        { divider: true },
        { id: 'offsets', label: 'Work Offsets', action: () => {} },
        { id: 'tooloffsets', label: 'Tool Offsets', action: () => {} },
        { id: 'parameters', label: 'Machine Parameters', action: () => {} }
      ]
    },
    help: {
      label: 'Help',
      items: [
        { id: 'docs', label: 'Documentation', action: () => {} },
        { id: 'shortcuts', label: 'Keyboard Shortcuts', action: () => {} },
        { divider: true },
        { id: 'tutorials', label: 'Tutorials', action: () => {} },
        { id: 'samples', label: 'Sample Projects', action: () => {} },
        { divider: true },
        { id: 'about', label: 'About CNC Pro Suite', action: () => {} }
      ]
    }
  };

  return (
    <div className="cnc-pro-suite">
      {/* Top Menu Bar */}
      <div className="top-menu-bar">
        <div className="menu-items">
          {Object.entries(menuItems).map(([key, menu]) => (
            <div 
              key={key} 
              className={`menu-item ${activeMenu === key ? 'active' : ''}`}
              onMouseEnter={() => setActiveMenu(key)}
              onClick={() => setActiveMenu(activeMenu === key ? null : key)}
            >
              {menu.label}
              {activeMenu === key && (
                <div className="menu-dropdown" onMouseLeave={() => setActiveMenu(null)}>
                  {menu.items.map((item, idx) => (
                    item.divider ? (
                      <div key={idx} className="menu-divider" />
                    ) : (
                      <div 
                        key={item.id} 
                        className={`menu-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.disabled && item.action) {
                            item.action();
                            setActiveMenu(null);
                          }
                        }}
                      >
                        <span className="menu-label">
                          {item.checked !== undefined && (
                            <span className="menu-check">{item.checked ? '✓' : ' '}</span>
                          )}
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="menu-shortcut">{item.shortcut}</span>
                        )}
                        {item.submenu && (
                          <span className="menu-arrow">▶</span>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="menu-title">CNC Pro Suite v2.0</div>
      </div>
      
      {/* 3D Viewport - Full screen background */}
      <div ref={mountRef} className="viewport-3d" />
      
      {/* Quick Access Toolbar */}
      <QuickToolbar />
      
      {/* Hidden File Inputs */}
      <input 
        id="file-input"
        type="file" 
        accept=".nc,.gcode,.step,.stp,.stl,.iges,.igs"
        onChange={(e) => handleFileLoad(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <input 
        id="step-file-input"
        type="file" 
        accept=".step,.stp,.STEP,.STP,.iges,.igs,.IGES,.IGS"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            loadSTEPFile(file);
          }
        }}
        style={{ display: 'none' }}
      />
      
      {/* Floating/Docked Panels */}
      {renderPanel('gcode', 
        <GCodeEditor 
          gcode={project.gcode}
          onChange={(gcode) => setProject(prev => ({ ...prev, gcode }))}
          currentLine={simulation.currentLine}
        />
      )}
      
      {renderPanel('tools',
        <ToolManager 
          tools={project.tools}
          onChange={(tools) => setProject(prev => ({ ...prev, tools }))}
        />
      )}
      
      {renderPanel('dualChannel',
        <DualChannelDebugger 
          program={project.gcode}
          setProgram={(gcode) => setProject(prev => ({ ...prev, gcode }))}
          simulation={simulation}
        />
      )}
      
      {renderPanel('stepProcessor',
        <StepProcessor 
          stepFile={{ 
            loaded: !!project.stepFile, 
            fileName: project.stepFile, 
            features: project.features || [],
            suggestedTools: project.suggestedTools || []
          }}
          onGenerateCode={(code) => setProject(prev => ({ ...prev, gcode: { ...prev.gcode, channel1: code } }))}
        />
      )}
      
      {renderPanel('machineControl',
        <MachineControl 
          simulation={simulation}
          onChange={setSimulation}
        />
      )}
      
      {renderPanel('features',
        <FeatureTree 
          features={project.features}
          onChange={(features) => setProject(prev => ({ ...prev, features }))}
        />
      )}
      
      {renderPanel('console',
        <div className="console-content">
          <div>CNC Pro Suite v2.0 Ready</div>
          <div>Type 'help' for commands</div>
        </div>
      )}
      
      {/* Calculator Modules */}
      {renderPanel('feedsSpeeds', <FeedsSpeedsOptimizer />)}
      {renderPanel('toolLife', <ToolLifeCalculator />)}
      {renderPanel('powerTorque', <PowerTorqueCalculator />)}
      {renderPanel('circular', <CircularInterpolation />)}
      {renderPanel('geometry', <GeometryTools />)}
      {renderPanel('pocketMilling', <PocketMillingWizard />)}
      {renderPanel('shopFloor', <ShopFloorUtilities />)}
      {renderPanel('toolDatabase', <ToolDatabase />)}
      {renderPanel('machineConfig', <MachineConfigurator />)}
      {renderPanel('setupManager', <SetupManager />)}
      
      {/* Context Menu */}
      <div className="context-menu" style={{ display: 'none' }}>
        <button>Cut</button>
        <button>Copy</button>
        <button>Paste</button>
        <div className="menu-separator" />
        <button>Properties</button>
      </div>
    </div>
  );
};

export default CNCProSuite;