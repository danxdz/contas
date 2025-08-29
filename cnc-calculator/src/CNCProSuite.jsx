import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { parseGCodePositions, parseToolsFromGCode } from './utils/gcodeParser';
import { rebuildToolGeometry, createRuler } from './utils/toolGeometry';
import { createAxisHelper, createToolAxisIndicator, createWorkOffsetAxis } from './utils/axisHelper';
import './CNCProSuite.css';
import MaterialRemovalSimulation from './components/MaterialRemovalSimulation';
import LightingSetup from './components/LightingSetup';
import { setupCNCShortcuts } from './utils/KeyboardShortcuts';

// Components
import DualChannelDebugger from './components/DualChannelDebugger';
import StepProcessor from './components/StepProcessor';
import GCodeSyntaxHighlighter from './components/GCodeSyntaxHighlighter';
import ToolManagerProEnhanced from './components/ToolManagerProEnhanced';
import MachineControl from './components/MachineControl';
import FeatureTree from './components/FeatureTree';
import ToolOffsetTable from './components/ToolOffsetTable';
import WorkOffsetsManager from './components/WorkOffsetsManager';
import StockSetup from './components/StockSetup';
import FixtureSetup from './components/FixtureSetup';
import PartSetup from './components/PartSetup';
import MachineSetup from './components/MachineSetup';
import MenuBar from './components/MenuBar';
import { MainToolbar, StatusBar } from './components/Toolbar';
import { MobileToolbar, MobileMenu, MobilePanel, MobileQuickAccess } from './components/MobileUI';

// Import calculator modules
import {
  FeedsSpeedsOptimizer,
  ToolLifeCalculator,
  PowerTorqueCalculator,
  CircularInterpolation,
  GeometryTools,
  PocketMillingWizard,
  ShopFloorUtilities,
  MachineConfigurator,
  SetupManager
} from './components/modules';

const CNCProSuite = () => {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState(null);
  const [mobileBottomSheet, setMobileBottomSheet] = useState(false);
  const materialRemovalRef = useRef(null);
  const [showMaterialRemoval, setShowMaterialRemoval] = useState(true);
  const [collisionDetection, setCollisionDetection] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Collision tracking
  const [collisionCount, setCollisionCount] = useState(0);
  const [stopOnCollision, setStopOnCollision] = useState(true);
  const [collisionAlert, setCollisionAlert] = useState(null);
  
  // Lighting configuration (persistent)
  const [lightingConfig, setLightingConfig] = useState({
    ambient: { enabled: true, intensity: 0.5, color: '#ffffff' },
    directional1: { 
      enabled: true, intensity: 0.8, color: '#ffffff',
      position: { x: 200, y: 200, z: 400 }, castShadow: true 
    },
    directional2: { 
      enabled: true, intensity: 0.4, color: '#e0e0ff',
      position: { x: -200, y: 100, z: -200 }, castShadow: false 
    },
    spot1: { 
      enabled: false, intensity: 0.6, color: '#ffff00',
      position: { x: 0, y: 0, z: 300 }, angle: Math.PI / 6, 
      penumbra: 0.1, castShadow: true 
    },
    hemisphere: { 
      enabled: true, skyColor: '#87ceeb', 
      groundColor: '#362907', intensity: 0.3 
    }
  });
  const lightsRef = useRef({});
  const [collisionHistory, setCollisionHistory] = useState([]);
  
  // Function to update lights without recreating them
  const updateLights = (newConfig) => {
    setLightingConfig(newConfig);
    
    // Update existing lights
    if (lightsRef.current.ambient) {
      lightsRef.current.ambient.visible = newConfig.ambient.enabled;
      lightsRef.current.ambient.intensity = newConfig.ambient.intensity;
      lightsRef.current.ambient.color = new THREE.Color(newConfig.ambient.color);
    }
    
    if (lightsRef.current.directional1) {
      lightsRef.current.directional1.visible = newConfig.directional1.enabled;
      lightsRef.current.directional1.intensity = newConfig.directional1.intensity;
      lightsRef.current.directional1.color = new THREE.Color(newConfig.directional1.color);
      lightsRef.current.directional1.position.set(
        newConfig.directional1.position.x,
        newConfig.directional1.position.y,
        newConfig.directional1.position.z
      );
    }
    
    if (lightsRef.current.directional2) {
      lightsRef.current.directional2.visible = newConfig.directional2.enabled;
      lightsRef.current.directional2.intensity = newConfig.directional2.intensity;
      lightsRef.current.directional2.color = new THREE.Color(newConfig.directional2.color);
      lightsRef.current.directional2.position.set(
        newConfig.directional2.position.x,
        newConfig.directional2.position.y,
        newConfig.directional2.position.z
      );
    }
    
    if (lightsRef.current.hemisphere) {
      lightsRef.current.hemisphere.visible = newConfig.hemisphere.enabled;
      lightsRef.current.hemisphere.intensity = newConfig.hemisphere.intensity;
      lightsRef.current.hemisphere.color = new THREE.Color(newConfig.hemisphere.skyColor);
      lightsRef.current.hemisphere.groundColor = new THREE.Color(newConfig.hemisphere.groundColor);
    }
  };
  
  // Setup states for stock, fixture, and machine
  const [setupConfig, setSetupConfig] = useState({
    stock: {
      type: 'block', // block, cylinder, custom
      dimensions: { x: 100, y: 100, z: 50 },
      material: 'aluminum',
      position: { x: 0, y: 0, z: 0 }
    },
    fixture: {
      type: 'vise', // vise, chuck, custom
      jawWidth: 150,
      clampingForce: 5000,
      position: { x: 0, y: 0, z: -50 }
    },
    machine: {
      type: '3-axis', // 3-axis, 4-axis, 5-axis
      workEnvelope: { x: 800, y: 600, z: 500 },
      spindleMax: 24000,
      rapidFeed: 15000,
      maxFeed: 10000
    },
    workOffsets: {
      activeOffset: 'G54',
      G54: { x: 0, y: 0, z: 50, description: 'Primary Setup' },  // Top of stock at Z=0
      G55: { x: 100, y: 100, z: -150, description: 'Secondary Setup' },
      G56: { x: 0, y: 0, z: -150, description: 'Third Setup' },
      G57: { x: 0, y: 0, z: -150, description: 'Fourth Setup' },
      G58: { x: 0, y: 0, z: -150, description: 'Fifth Setup' },
      G59: { x: 0, y: 0, z: -150, description: 'Sixth Setup' }
    }
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Panel system - each panel can be floating or docked
  const [activePanelId, setActivePanelId] = useState(null);
  const [panels, setPanels] = useState({
    gcode: {
      visible: false,  // Start closed
      floating: true,
      docked: 'left',
      position: { x: 50, y: 100 },  // Ensure title bar is visible
      size: { width: 450, height: 600 },
      zIndex: 1,
      minimized: false,
      title: 'G-Code Editor'
    },
    tools: {
      visible: false,  // Hidden at start
      floating: true,
      docked: 'right',
      position: { x: Math.max(100, window.innerWidth - 1400), y: 80 },
      size: { width: Math.min(1300, window.innerWidth - 200), height: Math.min(750, window.innerHeight - 150) },
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
      visible: false,  // Start hidden
      floating: true,
      docked: 'bottom',
      position: { x: 20, y: window.innerHeight - 80 },
      size: { width: 'auto', height: 45 },
      zIndex: 1,
      minimized: false,
      title: 'Manual'
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
    stockSetup: {
      visible: false,  // Start closed
      floating: true,
      docked: null,
      position: { x: 100, y: 120 },  // Ensure title bar visible
      size: { width: 400, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Stock Setup'
    },
    fixtureSetup: {
      visible: false,  // Start closed
      floating: true,
      docked: null,
      position: { x: 520, y: 120 },  // Ensure title bar visible
      size: { width: 400, height: 600 },
      zIndex: 2,
      minimized: false,
      title: 'Fixture Setup'
    },
    machineSetup: {
      visible: false,  // Start closed
      floating: true,
      docked: null,
      position: { x: 940, y: 120 },  // Ensure title bar visible
      size: { width: 450, height: 650 },
      zIndex: 2,
      minimized: false,
      title: 'Machine Setup'
    },
    partSetup: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 120, y: 110 },
      size: { width: 400, height: 480 },
      zIndex: 2,
      minimized: false,
      title: 'Part Setup'
    },
    toolDatabase: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: window.innerWidth / 2 - 250, y: 100 },
      size: { width: 500, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Tool Database'
    },
    workOffsets: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 150, y: 100 },
      size: { width: 500, height: 450 },
      zIndex: 2,
      minimized: false,
      title: 'Work Offsets (G54-G59)'
    },
    toolHolders: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 100, y: 80 },
      size: { width: 450, height: 550 },
      zIndex: 2,
      minimized: false,
      title: 'Tool Holder System'
    },
    toolOffsetTable: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Tool Offset Table'
    },
    lighting: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: window.innerWidth - 440, y: 100 },
      size: { width: 420, height: 700 },
      zIndex: 2,
      minimized: false,
      title: '🔆 Lighting Setup'
    }
  });

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    speed: 1.0,
    currentLine: 0,
    position: { x: 0, y: 0, z: 250, a: 0, b: 0, c: 0 },  // Start at safe machine home
    feedRate: 500,
    spindleSpeed: 12000,
    tool: 1,
    toolLengthCompActive: false,  // G43 active
    cutterCompActive: false,  // G41/G42 active
    activeHCode: 0,  // H code (tool length register)
    activeDCode: 0,  // D code (cutter diameter register)
    machinePosition: { x: 0, y: 0, z: 0 },  // Machine coordinates
    workPosition: { x: 0, y: 0, z: 0 },  // Work coordinates
    compMode: 'none'  // none, left (G41), right (G42)
  });
  
  const [toolDatabase, setToolDatabase] = useState([
    { 
      id: 1, tNumber: 'T1', name: 'End Mill 10mm', diameter: 10, flutes: 4, type: 'endmill', 
      material: 'Carbide', coating: 'TiAlN', lengthOffset: 75.5, wearOffset: 0,
      holder: { type: 'SK40/BT40', holderType: 'Collet Chuck', collet: 'ER32-10' },
      stickout: 35, cuttingLength: 22, overallLength: 72
    },
    { 
      id: 2, tNumber: 'T2', name: 'End Mill 6mm', diameter: 6, flutes: 3, type: 'endmill', 
      material: 'Carbide', coating: 'TiN', lengthOffset: 65.2, wearOffset: 0,
      holder: { type: 'SK40/BT40', holderType: 'Hydraulic Chuck', collet: null },
      stickout: 30, cuttingLength: 18, overallLength: 63
    },
    { 
      id: 3, tNumber: 'T3', name: 'Ball End 8mm', diameter: 8, flutes: 2, type: 'ballend', 
      material: 'HSS', coating: 'None', lengthOffset: 70.0, wearOffset: 0,
      holder: { type: 'SK40/BT40', holderType: 'Collet Chuck', collet: 'ER32-8' },
      stickout: 32, cuttingLength: 16, overallLength: 65
    },
    { 
      id: 4, tNumber: 'T4', name: 'Drill 5mm', diameter: 5, flutes: 2, type: 'drill', 
      material: 'Carbide', coating: 'TiAlN', lengthOffset: 85.3, wearOffset: 0,
      holder: { type: 'SK30/BT30', holderType: 'Collet Chuck', collet: 'ER32-5' },
      stickout: 40, cuttingLength: 28, overallLength: 80
    },
    { 
      id: 5, tNumber: 'T5', name: 'Face Mill 50mm', diameter: 50, flutes: 6, type: 'facemill', 
      material: 'Carbide', coating: 'TiAlN', lengthOffset: 50.0, wearOffset: 0,
      holder: { type: 'SK50/BT50', holderType: 'Shell Mill Holder', collet: null },
      stickout: 0, cuttingLength: 10, overallLength: 45
    },
    { 
      id: 6, tNumber: 'T6', name: 'Chamfer Mill 90°', diameter: 12, flutes: 4, type: 'chamfer', 
      material: 'Carbide', coating: 'TiN', lengthOffset: 68.7, wearOffset: 0,
      holder: { type: 'SK40/BT40', holderType: 'End Mill Holder', collet: null },
      stickout: 28, cuttingLength: 15, overallLength: 60
    }
  ]);
  
  const [toolAssemblies, setToolAssemblies] = useState([]);
  
  // Tool Offset Table (like real CNC machine)
  const [toolOffsetTable, setToolOffsetTable] = useState({
    // H codes (Tool Length Offsets) - up to 99 in real machines
    H: Array(100).fill(null).map((_, i) => ({
      register: i,
      lengthGeometry: i === 0 ? 0 : (i <= 6 ? [75.5, 65.2, 70.0, 85.3, 50.0, 68.7][i-1] || 0 : 0),
      lengthWear: 0
    })),
    // D codes (Cutter Diameter Compensation) - up to 99 in real machines  
    D: Array(100).fill(null).map((_, i) => ({
      register: i,
      diameterGeometry: i === 0 ? 0 : (i <= 6 ? [10, 6, 8, 5, 50, 12][i-1] || 0 : 0),
      diameterWear: 0
    }))
  });

  const [project, setProject] = useState({
    name: 'Example Pocket Milling',
    gcode: {
      channel1: `; POCKET MILLING EXAMPLE
; Material: Aluminum 6061
; Tool: 10mm End Mill
; ====================

G28 G91 Z0 ; Home Z axis first for safety
G90 ; Absolute mode
G21 G94 ; Metric, Feed/min
G17 G49 G40 G80 ; XY plane, Cancel offsets
G54 ; Work coordinate system

; Tool Change
T1 M06 ; Select Tool 1
G43 H1 ; Apply tool length compensation
S12000 M03 ; Spindle ON, 12000 RPM
M08 ; Coolant ON

; Rapid to start position
G0 Z50 ; Move to safe height in work coordinates
G0 X-40 Y-25 ; Move to pocket corner
G0 Z5 ; Approach height

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
G0 Z1 ; Lift
G0 X-35 Y-20 ; Reposition
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
G0 Z1 ; Lift
G0 X-40 Y-25 ; Corner
G01 Z-10 F200 ; Plunge
G01 X40 Y-25 F600 ; Bottom edge
G01 X40 Y25 ; Right edge
G01 X-40 Y25 ; Top edge
G01 X-40 Y-25 ; Left edge

; Drilling cycle for corner holes
G0 Z5 ; Safe height
G0 X-50 Y-30 ; Hole 1
G81 Z-25 R2 F150 ; Drill cycle
X50 ; Hole 2
Y30 ; Hole 3
X-50 ; Hole 4
G80 ; Cancel cycle

; Program end
G0 Z100 ; Retract
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
G0 X0 Y0 Z5

; Waiting for main spindle
M00 ; Optional stop

; Sub operations here
G01 Z-10 F200
G01 X20 F500
G01 Y20
G01 X-20
G01 Y-20
G0 Z5

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
  const updateToolpathRef = useRef(null);
  const originMarkerRef = useRef(null);
  const toolpathMarkerRef = useRef(null);  // Marker showing current position on toolpath
  
  // Store simulation in ref for animation loop
  const simulationRef = useRef(simulation);
  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);
  
  // Store project in ref for toolpath updates
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);
  
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
    
    // Add mouse interaction for tool
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDraggingStickout = false;
    let dragStartY = 0;
    let initialStickout = 30;
    let pendingStickout = 30;
    let lastClickTime = 0;
    
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      if (isDraggingStickout && toolRef.current) {
        // Calculate new stickout based on drag distance
        const dragDelta = event.clientY - dragStartY;
        const assembly = toolRef.current.userData.currentAssembly;
        const minStickout = 10;
        const maxStickout = assembly?.components?.tool?.length || 100;
        
        pendingStickout = Math.max(minStickout, Math.min(maxStickout, initialStickout - dragDelta * 0.3));
        
        // Update stickout indicator position
        const ruler = toolRef.current.getObjectByName('stickoutRuler');
        if (ruler) {
          const indicator = ruler.getObjectByName('stickoutIndicator');
          if (indicator) {
            indicator.position.z = -pendingStickout;
          }
          
          // Update text display
          const stickoutText = ruler.getObjectByName('stickoutText');
          if (stickoutText) {
            const canvas = stickoutText.material.map.image;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.font = 'bold 24px Arial';
            context.fillStyle = '#ffaa00';
            context.textAlign = 'center';
            context.fillText(`${pendingStickout.toFixed(1)}mm`, 64, 32);
            stickoutText.material.map.needsUpdate = true;
          }
        }
        
        // Update tool cutting part position to show stickout change
        const toolMeshes = toolRef.current.children.filter(child => 
          child.isMesh && !['toolCoordSystem', 'stickoutRuler'].includes(child.parent?.name)
        );
        
        // Move cutting tool parts based on stickout change
        const stickoutDelta = pendingStickout - initialStickout;
        toolMeshes.forEach(mesh => {
          if (mesh.userData.isCuttingPart) {
            mesh.position.z = mesh.userData.originalZ + stickoutDelta;
          }
        });
      }
    };
    
    const onMouseDown = (event) => {
      // Not used for tool interaction anymore, keeping for potential other uses
    };
    
    const onMouseUp = () => {
      if (isDraggingStickout) {
        // Show confirmation dialog
        const confirmChange = confirm(
          `Change tool stickout from ${initialStickout.toFixed(1)}mm to ${pendingStickout.toFixed(1)}mm?`
        );
        
        if (confirmChange) {
          // Apply the stickout change
          if (toolRef.current.userData.currentAssembly) {
            window.updateToolStickout?.(pendingStickout);
          }
        } else {
          // Revert visual changes
          const ruler = toolRef.current.getObjectByName('stickoutRuler');
          if (ruler) {
            const indicator = ruler.getObjectByName('stickoutIndicator');
            if (indicator) {
              indicator.position.z = -initialStickout;
            }
          }
          
          // Reset tool mesh positions
          const toolMeshes = toolRef.current.children.filter(child => 
            child.isMesh && child.userData.isCuttingPart
          );
          toolMeshes.forEach(mesh => {
            mesh.position.z = mesh.userData.originalZ;
          });
        }
        
        isDraggingStickout = false;
        controls.enabled = true; // Re-enable orbit controls
        
        // Hide ruler after a delay
        setTimeout(() => {
          if (toolRef.current) {
            const ruler = toolRef.current.getObjectByName('stickoutRuler');
            if (ruler && !isDraggingStickout) {
              ruler.visible = false;
            }
          }
        }, 2000);
      }
    };
    
    const onMouseClick = (event) => {
      if (isDraggingStickout) return; // Don't process clicks during drag
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime;
      
      // Check for double-click (within 300ms)
      if (timeDiff < 300) {
        raycaster.setFromCamera(mouse, camera);
        
        // Check if double-clicking on tool
        if (toolRef.current) {
          const intersects = raycaster.intersectObject(toolRef.current, true);
          if (intersects.length > 0) {
            // Show ruler and enable dragging on double-click
            const ruler = toolRef.current.getObjectByName('stickoutRuler');
            if (ruler) {
              ruler.visible = true;
              isDraggingStickout = true;
              dragStartY = event.clientY;
              const assembly = toolRef.current.userData.currentAssembly;
              initialStickout = assembly?.components?.tool?.stickout || 30;
              pendingStickout = initialStickout;
              controls.enabled = false; // Disable orbit controls during drag
              
              // Show instruction
              const instructionDiv = document.createElement('div');
              instructionDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 212, 255, 0.9);
                color: #000;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                z-index: 10000;
                pointer-events: none;
              `;
              instructionDiv.textContent = 'Drag up/down to adjust stickout, release to confirm';
              document.body.appendChild(instructionDiv);
              
              setTimeout(() => {
                if (instructionDiv.parentNode) {
                  document.body.removeChild(instructionDiv);
                }
              }, 3000);
            }
          }
        }
      }
      
      lastClickTime = currentTime;
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onMouseClick);

    // Initialize persistent lighting
    // Ambient Light
    if (lightingConfig.ambient.enabled) {
      lightsRef.current.ambient = new THREE.AmbientLight(
        lightingConfig.ambient.color,
        lightingConfig.ambient.intensity
      );
      scene.add(lightsRef.current.ambient);
    }
    
    // Main Directional Light
    if (lightingConfig.directional1.enabled) {
      lightsRef.current.directional1 = new THREE.DirectionalLight(
        lightingConfig.directional1.color,
        lightingConfig.directional1.intensity
      );
      lightsRef.current.directional1.position.set(
        lightingConfig.directional1.position.x,
        lightingConfig.directional1.position.y,
        lightingConfig.directional1.position.z
      );
      lightsRef.current.directional1.castShadow = lightingConfig.directional1.castShadow;
      scene.add(lightsRef.current.directional1);
    }
    
    // Fill Directional Light
    if (lightingConfig.directional2.enabled) {
      lightsRef.current.directional2 = new THREE.DirectionalLight(
        lightingConfig.directional2.color,
        lightingConfig.directional2.intensity
      );
      lightsRef.current.directional2.position.set(
        lightingConfig.directional2.position.x,
        lightingConfig.directional2.position.y,
        lightingConfig.directional2.position.z
      );
      lightsRef.current.directional2.castShadow = lightingConfig.directional2.castShadow;
      scene.add(lightsRef.current.directional2);
    }
    
    // Hemisphere Light
    if (lightingConfig.hemisphere.enabled) {
      lightsRef.current.hemisphere = new THREE.HemisphereLight(
        lightingConfig.hemisphere.skyColor,
        lightingConfig.hemisphere.groundColor,
        lightingConfig.hemisphere.intensity
      );
      scene.add(lightsRef.current.hemisphere);
    }

    // Grid
    const gridHelper = new THREE.GridHelper(1000, 50, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    // Main machine axes
    const mainAxes = createAxisHelper(200, 1, false);
    scene.add(mainAxes);

    // Machine bed
    const bedGeometry = new THREE.BoxGeometry(600, 400, 20);
    const bedMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.z = -10;
    bed.receiveShadow = true;
    scene.add(bed);
    
    // Example Workpiece - Aluminum block
    const workpieceGroup = new THREE.Group();
    
    // Main stock (top surface at Z=0, extends down to Z=-50)
    const stockDimensions = { x: 150, y: 100, z: 50 };
    
    // Initialize material removal simulation
    if (showMaterialRemoval) {
      const materialSim = new MaterialRemovalSimulation(scene, stockDimensions);
      materialRemovalRef.current = materialSim;
      // Position the stock mesh correctly
      if (materialSim.stockMesh) {
        materialSim.stockMesh.position.z = -25;
      }
    } else {
      // Regular stock mesh
      const stockGeometry = new THREE.BoxGeometry(stockDimensions.x, stockDimensions.y, stockDimensions.z);
      const stockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        metalness: 0.7,
        roughness: 0.3
      });
      const stock = new THREE.Mesh(stockGeometry, stockMaterial);
      stock.position.z = -25; // Center at -25, so top is at 0, bottom at -50
      stock.castShadow = true;
      stock.receiveShadow = true;
      workpieceGroup.add(stock);
    }
    
    // Machined pocket (cut down from top surface)
    const pocketGeometry = new THREE.BoxGeometry(100, 60, 20);
    const pocketMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
    pocket.position.set(0, 0, -10); // Top at 0, bottom at -20
    workpieceGroup.add(pocket);
    
    // Holes (drilled down from top)
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
      hole.position.set(pos.x, pos.y, -25); // Extends from 0 to -50
      hole.rotation.x = Math.PI / 2;
      workpieceGroup.add(hole);
    });
    
    scene.add(workpieceGroup);
    workpieceRef.current = workpieceGroup;
    
    // Dynamic Tool Visualization (updates based on assembly)
    const toolGroup = new THREE.Group();
    
    // Function to rebuild tool geometry based on assembly
    
    // Build initial tool
    rebuildToolGeometry(toolGroup, simulation.toolAssembly);
    
    // Store function for updates
    window.updateTool3D = (assembly) => rebuildToolGeometry(toolGroup, assembly);
    
    // Store function to update stickout from 3D interaction
    window.updateToolStickout = (newStickout) => {
      if (toolGroup.userData.currentAssembly) {
        const assembly = toolGroup.userData.currentAssembly;
        // Find and update the assembly in tool manager
        const assemblyCard = document.querySelector(`[data-assembly-id="${assembly.id}"]`);
        if (assemblyCard) {
          // Trigger stickout update through the tool manager
          const event = new CustomEvent('updateStickout', { 
            detail: { id: assembly.id, stickout: newStickout } 
          });
          window.dispatchEvent(event);
        }
      }
    };
    
    // Add control point indicator and coordinate system
    const toolCoordGroup = new THREE.Group();
    toolCoordGroup.name = 'toolCoordSystem';
    
    // Control point sphere (shows where the control point is)
    const controlPointGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const controlPointMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,  // Yellow for visibility
      transparent: true,
      opacity: 0.8
    });
    const controlPoint = new THREE.Mesh(controlPointGeometry, controlPointMaterial);
    toolCoordGroup.add(controlPoint);
    
    // Add small axis indicator for tool
    const toolAxes = createToolAxisIndicator();
    toolCoordGroup.add(toolAxes);
    
    // Position coordinate system at control point
    // This will move based on G43 status
    toolCoordGroup.position.z = 0; // Will be updated based on G43
    toolGroup.add(toolCoordGroup);
    
    // Store references for updating based on G43
    toolGroup.userData = { 
      toolCoordGroup,
      toolLength: 30, // Default tool length
      isInteractive: true,
      currentAssembly: null
    };
    
    // Add stickout ruler visualization (will be updated based on tool)
    const rulerGroup = createRuler();
    toolGroup.add(rulerGroup);
    
    // Start tool at machine home position (safe height above work)
    // Machine coordinates: Z=200 is home (fully retracted)
    // With typical setup, stock top is at Z=0 in work coordinates
    toolGroup.position.set(0, 0, 250); // Start higher to ensure above stock
    scene.add(toolGroup);
    toolRef.current = toolGroup;
    
    // Add work origin marker (coordinate system axes)
    // Use the work offset axis helper
    const originGroup = createWorkOffsetAxis();
    
    // Origin sphere
    const originSphereGeometry = new THREE.SphereGeometry(2, 16, 16);
    const originSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const originSphere = new THREE.Mesh(originSphereGeometry, originSphereMaterial);
    originGroup.add(originSphere);
    
    // Apply initial work offset
    const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
    originGroup.position.set(activeOffset.x, activeOffset.y, activeOffset.z);
    
    scene.add(originGroup);
    originMarkerRef.current = originGroup;
    
    // Create dynamic toolpath from G-code
    const updateToolpath = (workOffsets = null, gcode = null) => {
      // Use provided gcode or fall back to current project gcode from ref
      const gcodeToUse = gcode || projectRef.current?.gcode?.channel1 || project.gcode.channel1;
      console.log('Updating toolpath with G-code length:', gcodeToUse?.length || 0);
      
      // Remove old toolpath
      if (toolpathRef.current) {
        scene.remove(toolpathRef.current);
        toolpathRef.current = null;
      }
      
      // Parse G-code positions
      const positions = parseGCodePositions(gcodeToUse);
      if (positions.length > 1) {
        const toolpathGroup = new THREE.Group();
        
        // Apply work offset to toolpath - use passed in offsets or default to zero
        let offsetX = 0, offsetY = 0, offsetZ = 0;
        if (workOffsets) {
          const activeOffset = workOffsets[workOffsets.activeOffset];
          offsetX = activeOffset.x;
          offsetY = activeOffset.y;
          offsetZ = activeOffset.z;
        }
        
        // Build continuous toolpath with proper segmentation
        let currentSegment = [];
        let currentType = null;
        const segments = [];
        
        // First, add the starting position
        const startPos = positions[0];
        
        for (let i = 1; i < positions.length; i++) {
          const prev = positions[i-1];
          const curr = positions[i];
          
          // Determine move type
          const moveType = curr.rapid ? 'rapid' : 'feed';
          
          // If type changes or starting new segment, save current and start new
          if (currentType !== moveType) {
            if (currentSegment.length > 0) {
              segments.push({ type: currentType, points: [...currentSegment] });
            }
            currentSegment = [new THREE.Vector3(prev.x + offsetX, prev.y + offsetY, prev.z + offsetZ)];
            currentType = moveType;
          }
          
          // Add current point to segment
          currentSegment.push(new THREE.Vector3(curr.x + offsetX, curr.y + offsetY, curr.z + offsetZ));
        }
        
        // Don't forget the last segment
        if (currentSegment.length > 0) {
          segments.push({ type: currentType, points: currentSegment });
        }
        
        // Render each segment with appropriate style
        segments.forEach(segment => {
          if (segment.points.length < 2) return;
          
          const geometry = new THREE.BufferGeometry().setFromPoints(segment.points);
          
          if (segment.type === 'rapid') {
            // Yellow dashed lines for rapid moves
            const material = new THREE.LineDashedMaterial({
              color: 0xffff00,
              linewidth: 2,
              scale: 1,
              dashSize: 5,
              gapSize: 3,
              transparent: true,
              opacity: 0.7
            });
            const line = new THREE.Line(geometry, material);
            line.computeLineDistances();
            toolpathGroup.add(line);
          } else {
            // Bright green solid lines for feed moves
            const material = new THREE.LineBasicMaterial({ 
              color: 0x00ff33,
              linewidth: 3,
              transparent: true,
              opacity: 1.0
            });
            const line = new THREE.Line(geometry, material);
            toolpathGroup.add(line);
          }
        });
        
        // Add start/end markers with work offset
        const startGeometry = new THREE.SphereGeometry(2, 8, 8);
        const startMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const startMarker = new THREE.Mesh(startGeometry, startMaterial);
        startMarker.position.set(positions[0].x + offsetX, positions[0].y + offsetY, positions[0].z + offsetZ);
        toolpathGroup.add(startMarker);
        
        const endGeometry = new THREE.SphereGeometry(2, 8, 8);
        const endMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const endMarker = new THREE.Mesh(endGeometry, endMaterial);
        const lastPos = positions[positions.length - 1];
        endMarker.position.set(lastPos.x + offsetX, lastPos.y + offsetY, lastPos.z + offsetZ);
        toolpathGroup.add(endMarker);
        
        // Add current position marker (will be updated during simulation)
        if (!toolpathMarkerRef.current) {
          const markerGeometry = new THREE.SphereGeometry(4, 16, 16);
          const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,  // Cyan for current position
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          toolpathMarkerRef.current = marker;
          scene.add(marker);
        }
        
        // Position marker at start
        toolpathMarkerRef.current.position.set(
          positions[0].x + offsetX, 
          positions[0].y + offsetY, 
          positions[0].z + offsetZ
        );
        toolpathMarkerRef.current.visible = true;
        
        scene.add(toolpathGroup);
        toolpathRef.current = toolpathGroup;
        toolpathGroup.visible = true; // Ensure visibility
        console.log('Toolpath added to scene with', segments.length, 'segments');
      } else {
        console.log('No valid positions to create toolpath');
      }
    };
    
    // Initial toolpath with initial work offsets
    updateToolpath(setupConfig.workOffsets);
    updateToolpathRef.current = updateToolpath;
    
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

    // Parse G-code positions
    const positions = parseGCodePositions(project.gcode.channel1);
    
    // Animation loop
    const animate = () => {
      // Rotate spindle if speed > 0
      if (toolRef.current && simulationRef.current.spindleSpeed > 0) {
        toolRef.current.rotation.z += 0.05;
      }
      
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

    // Initialize keyboard shortcuts
    const shortcuts = setupCNCShortcuts({
      playPause: playPauseSimulation,
      stop: stopSimulation,
      stepForward,
      stepBackward,
      setView: setCameraView,
      togglePanel,
      increaseSpeed: () => setSimulation(prev => ({ ...prev, speed: Math.min(prev.speed * 2, 10) })),
      decreaseSpeed: () => setSimulation(prev => ({ ...prev, speed: Math.max(prev.speed / 2, 0.1) })),
      newProject,
      openFile: () => document.getElementById('file-input')?.click(),
      saveFile: saveProject,
      showShortcuts: () => setShowShortcutsHelp(true),
      jog: (axis, direction) => {
        if (toolRef.current) {
          const step = 5 * direction;
          if (axis === 'X') toolRef.current.position.x += step;
          if (axis === 'Y') toolRef.current.position.y += step;
          if (axis === 'Z') toolRef.current.position.z += step;
        }
      }
    });
    setKeyboardShortcuts(shortcuts);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (materialRemovalRef.current) materialRemovalRef.current.dispose();
      if (shortcuts) shortcuts.dispose();
    };
  }, []); // Only initialize once
  
  // Update toolpath when G-code or work offset changes - with debounce for real-time updates
  const [toolpathUpdateTimer, setToolpathUpdateTimer] = useState(null);
  
  useEffect(() => {
    // Clear previous timer
    if (toolpathUpdateTimer) {
      clearTimeout(toolpathUpdateTimer);
    }
    
    // Set new timer for debounced update (300ms delay for typing)
    const timer = setTimeout(() => {
      if (updateToolpathRef.current && project.gcode.channel1) {
        console.log('Real-time toolpath update triggered');
        updateToolpathRef.current(setupConfig.workOffsets);
      }
    }, 300);
    
    setToolpathUpdateTimer(timer);
    
    // Also update origin marker position immediately
    if (originMarkerRef.current) {
      const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      originMarkerRef.current.position.set(activeOffset.x, activeOffset.y, activeOffset.z);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [project.gcode.channel1, setupConfig.workOffsets.activeOffset, setupConfig.workOffsets.G54, setupConfig.workOffsets.G55, setupConfig.workOffsets.G56, setupConfig.workOffsets.G57, setupConfig.workOffsets.G58, setupConfig.workOffsets.G59]);
  
  // Update tool 3D visualization when assembly changes
  useEffect(() => {
    if (window.updateTool3D && simulation.toolAssembly) {
      window.updateTool3D(simulation.toolAssembly);
    }
  }, [simulation.toolAssembly]);

  // Update tool position and material removal when simulation changes
  useEffect(() => {
    if (!toolRef.current) return;
    
    const positions = parseGCodePositions(project.gcode.channel1);
    if (positions.length === 0) return;
    
    const safeCurrentLine = Math.min(Math.max(0, simulation.currentLine), positions.length - 1);
    const currentPos = positions[safeCurrentLine];
    
    // Always update position to the last known coordinates (even on comment lines)
    if (currentPos) {
      // Get active tool length compensation
      let toolLengthComp = 0;
      if (currentPos.g43 && currentPos.h > 0 && currentPos.h < toolOffsetTable.H.length) {
        const hOffset = toolOffsetTable.H[currentPos.h];
        toolLengthComp = hOffset.lengthGeometry + hOffset.lengthWear;
      }
      
      // Get the current work offset from the parsed position or use the active one
      const currentWorkOffset = positions[safeCurrentLine]?.workOffset || setupConfig.workOffsets.activeOffset;
      const activeOffset = setupConfig.workOffsets[currentWorkOffset] || setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      
      // Get actual tool length from spindle gauge line to tool tip
      // This includes holder gauge + stickout + extensions (complete assembly)
      let actualToolLength = 30; // Default
      if (simulation.toolAssembly && simulation.toolAssembly.components) {
        const components = simulation.toolAssembly.components;
        
        // Holder gauge lengths (spindle gauge to holder nose)
        const holderGaugeLengths = {
          'BT30': 45, 'BT40': 65, 'BT50': 100,
          'CAT40': 65, 'CAT50': 100,
          'HSK63': 50, 'HSK100': 60,
          'ER32': 40, 'ER40': 45,
          'default': 60
        };
        
        // Calculate total length
        actualToolLength = 0;
        
        // Add holder gauge length
        if (components.holder?.type) {
          const holderType = components.holder.type.split('/')[0];
          actualToolLength += holderGaugeLengths[holderType] || holderGaugeLengths.default;
        } else {
          actualToolLength += holderGaugeLengths.default;
        }
        
        // Add tool stickout
        actualToolLength += components.tool?.stickout || 30;
        
        // Add extensions
        if (components.extension?.length) actualToolLength += components.extension.length;
      }
      
      // Tool control point behavior (like real CNC machine):
      // Without G43: Programmed Z moves spindle nose to that position
      // With G43: Programmed Z moves tool tip to that position
      // 
      // Work coordinate Z to Machine coordinate Z:
      // Machine Z = Work Z + Work Offset Z
      // 
      // Tool visual positioning:
      // The tool 3D model's origin is at the spindle nose
      // When G43 is active, spindle must move UP by tool length to put tip at programmed position
      let toolControlZ;
      if (currentPos.g43) {
        // G43 active: Spindle moves up by tool length so tip reaches programmed Z
        // Machine Z = Work Z + Work Offset Z + Tool Length
        toolControlZ = currentPos.z + activeOffset.z + toolLengthComp;
      } else {
        // G43 not active: Spindle nose goes to programmed Z
        // Machine Z = Work Z + Work Offset Z
        toolControlZ = currentPos.z + activeOffset.z;
      }
      
      const toolPosition = {
        x: currentPos.x + activeOffset.x,
        y: currentPos.y + activeOffset.y,
        z: toolControlZ
      };
      
      toolRef.current.position.set(toolPosition.x, toolPosition.y, toolPosition.z);
      
      // Update toolpath marker to follow control point
      if (toolpathMarkerRef.current) {
        // Marker shows where the control point (cutting point) is
        // With G43: This is the tool tip position
        // Without G43: This is the spindle nose position
        toolpathMarkerRef.current.position.set(
          currentPos.x + activeOffset.x, 
          currentPos.y + activeOffset.y, 
          currentPos.z + activeOffset.z  // Always at programmed work position
        );
      }
      
      // Update tool tip coordinate system position (yellow sphere)
      // The yellow sphere should match the cyan sphere position (actual cutting point)
      if (toolRef.current && toolRef.current.userData.toolCoordGroup) {
        if (currentPos.g43) {
          // With G43: control point at tool tip (tool length compensated)
          // The yellow sphere needs to be at the actual tool tip
          toolRef.current.userData.toolCoordGroup.position.z = -actualToolLength;
        } else {
          // Without G43: control point at spindle nose
          toolRef.current.userData.toolCoordGroup.position.z = 0;
        }
      }
      
      // Make the cyan sphere match the yellow sphere position (they should be at same spot)
      if (toolpathMarkerRef.current && currentPos.g43) {
        // With G43, the marker should be at the tool tip in world coordinates
        toolpathMarkerRef.current.position.set(
          currentPos.x + activeOffset.x,
          currentPos.y + activeOffset.y,
          currentPos.z + activeOffset.z  // This is the programmed position (tool tip reaches here)
        );
      }
      
      // Material removal simulation
      if (materialRemovalRef.current && showMaterialRemoval && simulation.isPlaying) {
        const toolDiameter = simulation.toolAssembly?.components?.tool?.diameter || 10;
        const toolLength = 30; // Default tool length
        
        // Check for collision in rapid moves
        if (collisionDetection && currentPos.rapid) {
          const collision = materialRemovalRef.current.checkCollision(toolPosition, toolDiameter, true);
          if (collision.collision) {
            console.warn('⚠️ COLLISION DETECTED:', collision);
            
            // Update collision tracking
            setCollisionCount(prev => prev + 1);
            const collisionData = {
              line: simulation.currentLine,
              position: toolPosition,
              type: 'Rapid move through material',
              toolDiameter: toolDiameter,
              timestamp: new Date().toISOString()
            };
            
            setCollisionHistory(prev => [...prev, collisionData]);
            setCollisionAlert(collisionData);
            
            // Only pause if stopOnCollision is enabled
            if (stopOnCollision) {
              setSimulation(prev => ({ ...prev, isPlaying: false }));
            }
          }
        }
        
        // Remove material for cutting moves
        if (!currentPos.rapid && currentPos.z < 0) {
          const removal = materialRemovalRef.current.removeMaterial(
            toolPosition,
            toolDiameter,
            toolLength,
            currentPos.f || 100
          );
          
          // Update mesh every 10 lines for performance
          if (simulation.currentLine % 10 === 0) {
            materialRemovalRef.current.updateStockMesh();
          }
        }
      }
      
      // Update simulation state with compensation info
      if (currentPos.g43 !== simulation.toolLengthCompActive || 
          currentPos.h !== simulation.activeHCode) {
        setSimulation(prev => ({ 
          ...prev, 
          toolLengthCompActive: currentPos.g43,
          activeHCode: currentPos.h,
          activeDCode: currentPos.d
        }));
      }
      
      // Update spindle speed from G-code
      if (currentPos.s !== undefined && currentPos.s !== simulation.spindleSpeed) {
        setSimulation(prev => ({ ...prev, spindleSpeed: currentPos.s }));
      }
    }
  }, [simulation.currentLine, project.gcode.channel1, setupConfig.workOffsets, toolOffsetTable]);
  
  // Smooth simulation with tweening
  const simulationIntervalRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const tweenProgressRef = useRef(0);
  
  useEffect(() => {
    if (!simulation.isPlaying) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }
    
    const lines = project.gcode.channel1.split('\n');
    const positions = parseGCodePositions(project.gcode.channel1);
    
    // Animation frame for smooth motion
    let animationId;
    const animate = () => {
      if (!toolRef.current || !simulation.isPlaying) return;
      
      // Smooth interpolation between positions
      if (tweenProgressRef.current < 1) {
        tweenProgressRef.current = Math.min(1, tweenProgressRef.current + 0.05 * simulation.speed);
        
        const t = tweenProgressRef.current;
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out
        
        const currentX = lastPositionRef.current.x + (targetPositionRef.current.x - lastPositionRef.current.x) * easeT;
        const currentY = lastPositionRef.current.y + (targetPositionRef.current.y - lastPositionRef.current.y) * easeT;
        const currentZ = lastPositionRef.current.z + (targetPositionRef.current.z - lastPositionRef.current.z) * easeT;
        
        // Get work offset from current position
        const positions = parseGCodePositions(project.gcode.channel1);
        const currentPos = positions[Math.min(simulation.currentLine, positions.length - 1)];
        const currentWorkOffset = currentPos?.workOffset || setupConfig.workOffsets.activeOffset;
        const activeOffset = setupConfig.workOffsets[currentWorkOffset] || setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
        
        // Get tool length compensation
        let toolLengthComp = 0;
        if (currentPos && currentPos.g43 && currentPos.h > 0 && currentPos.h < toolOffsetTable.H.length) {
          const hOffset = toolOffsetTable.H[currentPos.h];
          toolLengthComp = hOffset.lengthGeometry + hOffset.lengthWear;
        }
        
        // Get actual tool length from spindle gauge line to tool tip
        let actualToolLength = 30; // Default
        if (simulation.toolAssembly && simulation.toolAssembly.components) {
          const components = simulation.toolAssembly.components;
          
          // Holder gauge lengths
          const holderGaugeLengths = {
            'BT30': 45, 'BT40': 65, 'BT50': 100,
            'CAT40': 65, 'CAT50': 100,
            'HSK63': 50, 'HSK100': 60,
            'ER32': 40, 'ER40': 45,
            'default': 60
          };
          
          actualToolLength = 0;
          
          // Add holder gauge length
          if (components.holder?.type) {
            const holderType = components.holder.type.split('/')[0];
            actualToolLength += holderGaugeLengths[holderType] || holderGaugeLengths.default;
          } else {
            actualToolLength += holderGaugeLengths.default;
          }
          
          // Add tool stickout
          actualToolLength += components.tool?.stickout || 30;
          
          // Add extensions
          if (components.extension?.length) actualToolLength += components.extension.length;
        }
        
        // Tool control point during animation (like real CNC):
        // Without G43: Spindle nose at programmed position
        // With G43: Tool tip at programmed position (spindle raised by H value)
        let toolControlZ;
        if (currentPos?.g43) {
          // G43 active: Spindle moves up by tool length so tip is at programmed Z
          toolControlZ = currentZ + activeOffset.z + toolLengthComp;
        } else {
          // No G43: Spindle nose at programmed Z
          toolControlZ = currentZ + activeOffset.z;
        }
        
        toolRef.current.position.set(
          currentX + activeOffset.x,
          currentY + activeOffset.y,
          toolControlZ
        );
        
        // Update toolpath marker during tweening to follow control point
        if (toolpathMarkerRef.current) {
          // Marker always shows programmed position (where cutting happens)
          toolpathMarkerRef.current.position.set(
            currentX + activeOffset.x,
            currentY + activeOffset.y,
            currentZ + activeOffset.z  // Always at programmed work position
          );
        }
        
        // Update tool tip coordinate system during animation (yellow sphere)
        if (toolRef.current && toolRef.current.userData?.toolCoordGroup) {
          if (currentPos?.g43) {
            // With G43: control point at tool tip
            toolRef.current.userData.toolCoordGroup.position.z = -actualToolLength;
          } else {
            // Without G43: control point at spindle nose  
            toolRef.current.userData.toolCoordGroup.position.z = 0;
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    // Line advancement timer
    simulationIntervalRef.current = setInterval(() => {
      setSimulation(prev => {
        if (prev.currentLine >= lines.length - 1) {
          return { ...prev, isPlaying: false };
        }
        
        // Find next non-comment line
        let nextLine = prev.currentLine + 1;
        while (nextLine < lines.length && 
               (lines[nextLine].trim().startsWith(';') || 
                lines[nextLine].trim().startsWith('(') ||
                lines[nextLine].trim() === '')) {
          nextLine++;
        }
        
        if (nextLine >= lines.length) {
          return { ...prev, isPlaying: false };
        }
        
        // Set up tweening for next move
        const currentPos = positions[prev.currentLine] || prev.position;
        const nextPos = positions[nextLine] || prev.position;
        
        lastPositionRef.current = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
        targetPositionRef.current = { x: nextPos.x, y: nextPos.y, z: nextPos.z };
        tweenProgressRef.current = 0;
        
        return { 
          ...prev, 
          currentLine: nextLine,
          position: { x: nextPos.x, y: nextPos.y, z: nextPos.z, a: 0, b: 0, c: 0 }
        };
      });
    }, 200 / simulation.speed); // Adjust speed for line advancement
    
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [simulation.isPlaying, simulation.speed, simulation.currentLine, project.gcode.channel1, setupConfig.workOffsets, toolOffsetTable]);

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
    setActivePanelId(panelId);
    const maxZ = getMaxZIndex();
    setPanels(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        zIndex: maxZ + 1
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
              width: Math.max(400, Math.min(e.clientX - panel.position.x, window.innerWidth - panel.position.x - 20)),
              height: Math.max(300, Math.min(e.clientY - panel.position.y, window.innerHeight - panel.position.y - 50))
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

    // Compact panels that don't need full title bar
    const compactPanels = ['gcode'];
    const isCompact = compactPanels.includes(panelId);
    
    // Single bar panels (like machineControl)
    const barPanels = ['machineControl'];
    const isBar = barPanels.includes(panelId);

    // Always use inline styles for proper sizing
    const panelStyle = {
      position: 'fixed',
      left: `${panel.position.x}px`,
      top: `${panel.position.y}px`,
      width: isBar ? 'auto' : `${panel.size.width}px`,
      height: isBar ? '45px' : (panel.minimized ? '40px' : `${panel.size.height}px`),
      zIndex: panel.zIndex,
      background: isBar ? 'linear-gradient(135deg, #1a1f2e, #0f1420)' : '#0a0e1a',
      border: '1px solid #333',
      borderRadius: isBar ? '6px' : (isCompact ? '4px' : '8px'),
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    };

    return (
      <div 
        key={panelId}
        style={panelStyle}
        onMouseDown={() => bringToFront(panelId)}
      >
        {isBar ? (
          // Bar panel - draggable by clicking anywhere
          <div 
            style={{
              cursor: 'move',
              width: '100%',
              height: '100%'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startDragging(e, panelId);
            }}
          >
            {content}
          </div>
        ) : isCompact ? (
          // Compact header - just a thin draggable strip with minimal controls
          <div 
            style={{
              padding: '2px 8px',
              background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
              borderBottom: '1px solid #222',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              cursor: 'move',
              userSelect: 'none',
              height: '24px'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startDragging(e, panelId);
            }}
          >
            <div style={{ display: 'flex', gap: '2px' }}>
              <button 
                onClick={() => minimizePanel(panelId)} 
                title="Minimize"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0 4px'
                }}
              >
                {panel.minimized ? '▲' : '▼'}
              </button>
              <button 
                onClick={() => closePanel(panelId)} 
                title="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          // Regular header with title
          <div 
            style={{
              padding: '6px 10px',
              background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'move',
              userSelect: 'none'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startDragging(e, panelId);
            }}
          >
            <span style={{ 
              color: '#00d4ff', 
              fontWeight: 'bold',
              fontSize: '13px'
            }}>
              {panel.title}
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                onClick={() => toggleFloating(panelId)} 
                title={panel.floating ? 'Dock' : 'Float'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 3px'
                }}
              >
                {panel.floating ? '📌' : '📍'}
              </button>
              <button 
                onClick={() => minimizePanel(panelId)} 
                title="Minimize"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 3px'
                }}
              >
                {panel.minimized ? '▲' : '▼'}
              </button>
              <button 
                onClick={() => closePanel(panelId)} 
                title="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 3px'
                }}
              >
                ×
            </button>
          </div>
        </div>
        )}
        {!panel.minimized && (
          <div style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative'
          }}>
            {content}
          </div>
        )}
        {!panel.minimized && panel.floating && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 50%, #333 50%)',
              borderBottomRightRadius: '8px'
            }}
            onMouseDown={(e) => startResizing(e, panelId)}
          />
        )}
      </div>
    );
  };

  // Collision Alert Component
  const CollisionAlert = () => {
    if (!collisionAlert) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #ff0000, #ff6600)',
        border: '2px solid #ff0000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 10000,
        boxShadow: '0 0 30px rgba(255,0,0,0.5)',
        minWidth: '300px',
        animation: 'pulse 0.5s ease-in-out'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px',
          color: '#fff'
        }}>
          <span style={{ fontSize: '30px', marginRight: '10px' }}>⚠️</span>
          <div>
            <h3 style={{ margin: 0 }}>COLLISION DETECTED!</h3>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Line {collisionAlert.line} | Total: {collisionCount} collisions
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px',
          color: '#fff',
          fontSize: '13px'
        }}>
          <div>Position: X{collisionAlert.position?.x?.toFixed(2)} Y{collisionAlert.position?.y?.toFixed(2)} Z{collisionAlert.position?.z?.toFixed(2)}</div>
          <div>Type: {collisionAlert.type || 'Rapid move through material'}</div>
          <div>Tool: Ø{collisionAlert.toolDiameter}mm</div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setCollisionAlert(null);
              setSimulation(prev => ({ ...prev, isPlaying: true }));
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: '#00d4ff',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Continue
          </button>
          <button
            onClick={() => {
              setCollisionAlert(null);
              stopSimulation();
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Stop
          </button>
        </div>
        
        <div style={{ 
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fff',
          fontSize: '12px'
        }}>
          <input
            type="checkbox"
            checked={stopOnCollision}
            onChange={(e) => setStopOnCollision(e.target.checked)}
            id="stop-on-collision"
          />
          <label htmlFor="stop-on-collision">Stop on collision</label>
        </div>
      </div>
    );
  };

  // Quick access toolbar
  const QuickToolbar = () => (
    <div style={{
      position: 'fixed',
      top: '50px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => document.getElementById('file-input').click()} 
          title="Open File"
          style={{
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '5px',
            color: '#00d4ff',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          📁
        </button>
        <input 
          id="file-input"
          type="file" 
          accept=".nc,.gcode,.step,.stp,.stl"
          onChange={(e) => handleFileLoad(e.target.files[0])}
          hidden
        />
        <button 
          onClick={() => saveProject()} 
          title="Save"
          style={{
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '5px',
            color: '#00d4ff',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >💾</button>
        <button 
          onClick={() => newProject()} 
          title="New"
          style={{
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '5px',
            color: '#00d4ff',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >📄</button>
      </div>
      
      <div style={{ width: '1px', height: '30px', background: '#333' }} />
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => simulation.isPlaying ? pauseSimulation() : setSimulation(prev => ({ ...prev, isPlaying: true }))}
          className={simulation.isPlaying ? 'active' : ''}
          title="Play/Pause"
        >
          {simulation.isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={() => stopSimulation()} title="Stop">⏹️</button>
        <button onClick={() => resetSimulation()} title="Reset">🔄</button>
        <button onClick={() => stepBackward()} title="Step Back">⏮️</button>
        <button onClick={() => stepForward()} title="Step Forward">⏭️</button>
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
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <button 
          onClick={() => {
            setShowMaterialRemoval(!showMaterialRemoval);
            if (!showMaterialRemoval) {
              alert('Material removal will be enabled on next page reload. Press F5 to reload now.');
            }
          }}
          className={showMaterialRemoval ? 'active' : ''}
          title="Toggle Material Removal Simulation"
          style={{
            background: showMaterialRemoval ? '#00ff88' : 'transparent',
            color: showMaterialRemoval ? '#000' : '#888'
          }}
        >
          🔨
        </button>
        <button 
          onClick={() => setCollisionDetection(!collisionDetection)}
          className={collisionDetection ? 'active' : ''}
          title={`Collision Detection (${collisionCount} detected)`}
          style={{
            background: collisionDetection ? '#ff6666' : 'transparent',
            color: collisionDetection ? '#fff' : '#888',
            position: 'relative'
          }}
        >
          ⚠️
          {collisionCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ff0000',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid #0a0e1a'
            }}>
              {collisionCount > 99 ? '99+' : collisionCount}
            </span>
          )}
        </button>
        {collisionCount > 0 && (
          <button 
            onClick={() => {
              setCollisionCount(0);
              setCollisionHistory([]);
              setCollisionAlert(null);
            }}
            title="Clear collision history"
            style={{
              background: 'transparent',
              color: '#ff6666',
              fontSize: '12px',
              padding: '2px 6px',
              border: '1px solid #ff6666',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
        <button 
          onClick={() => setShowShortcutsHelp(true)}
          title="Keyboard Shortcuts (?)"
        >
          ⌨️
        </button>
        <button 
          onClick={() => togglePanel('lighting')}
          title="Lighting Setup"
          style={{
            background: panels.lighting?.visible ? '#ffaa0022' : 'transparent',
            border: panels.lighting?.visible ? '2px solid #ffaa00' : '1px solid #333',
            borderRadius: '5px',
            color: panels.lighting?.visible ? '#ffaa00' : '#888',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          🔆
        </button>
      </div>
      
      <div className="toolbar-info">
        <span>{project.name}</span>
        <span>|</span>
        <span>X: {simulation.position.x.toFixed(1)}</span>
        <span>Y: {simulation.position.y.toFixed(1)}</span>
        <span>Z: {simulation.position.z.toFixed(1)}</span>
        <span 
          style={{ color: simulation.toolLengthCompActive ? '#00ff00' : '#ffaa00' }}
          title={simulation.toolLengthCompActive ? 
            'G43 Active: Control point at tool tip' : 
            'G43 Inactive: Control point at spindle nose'}
        >
          {simulation.toolLengthCompActive ? 'G43' : 'No-G43'}
        </span>
        <span>|</span>
        <span>F: {simulation.feedRate}</span>
        <span>S: {simulation.spindleSpeed}</span>
        <span>|</span>
        <span>Line: {simulation.currentLine + 1}/{project.gcode.channel1.split('\n').length}</span>
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
      const newGCode = e.target.result;
      
      // Update project with new G-code
      setProject(prev => ({
        ...prev,
        gcode: { ...prev.gcode, channel1: newGCode }
      }));
      
      // Parse the new G-code to get starting position
      const positions = parseGCodePositions(newGCode);
      const startPos = positions.length > 0 ? positions[0] : { x: 0, y: 0, z: 200 };  // Default to machine home
      
      // Parse tools used in the program
      const programTools = parseToolsFromGCode(newGCode);
      
      // Store tools for reference (accessible via simulation.programTools)
      if (programTools.length > 0) {
        const toolList = programTools.map(t => `T${t.number}${t.hCode ? ` H${t.hCode}` : ''}${t.dCode ? ` D${t.dCode}` : ''}`).join(', ');
      }
      
      // Reset simulation with proper starting position
      setSimulation(prev => ({
        ...prev,
        currentLine: 0,
        isPlaying: false,
        position: { 
          x: startPos.x, 
          y: startPos.y, 
          z: startPos.z, 
          a: 0, 
          b: 0, 
          c: 0 
        },
        programTools: programTools // Store tools needed by program
      }));
      
      // IMPORTANT: The useEffect will handle the toolpath update automatically
      // when project.gcode.channel1 changes, so we don't need setTimeout here
      console.log('NC file loaded, toolpath will update via useEffect');
    };
    reader.readAsText(file);
  };

  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const positions = {
      top: [0, 0, 800],      // Looking down Z-axis
      front: [0, -800, 0],   // Looking along Y-axis
      side: [800, 0, 0],     // Looking along X-axis
      iso: [400, 600, 400]   // Rotated 90° CCW so Y points up-right (was 600, -400, now 400, 600)
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

  const pauseSimulation = () => {
    // Pause - just stop playing but keep position
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulation(prev => ({
      ...prev,
      isPlaying: false
    }));
  };

  const stopSimulation = () => {
    // Stop - reset to beginning
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulation(prev => ({
      ...prev,
      isPlaying: false,
      currentLine: 0,
      position: { x: 0, y: 0, z: 250 }  // Start at safe Z height
    }));
    // Reset tool position
    if (toolRef.current) {
      toolRef.current.position.set(0, 0, 250);
    }
  };

  const resetSimulation = () => {
    // Full reset - stop and clear everything
    stopSimulation();
    // Clear toolpath visualization
    if (toolpathLinesRef.current) {
      toolpathLinesRef.current.geometry.setFromPoints([]);
    }
    // Reset material removal if active
    if (materialRemovalRef.current) {
      materialRemovalRef.current.reset();
    }
  };
  
  const playPauseSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const stepForward = () => {
    const lines = project.gcode.channel1.split('\n');
    const positions = parseGCodePositions(project.gcode.channel1);
    
    setSimulation(prev => {
      let nextLine = prev.currentLine + 1;
      // Skip comments and empty lines
      while (nextLine < lines.length && 
             (lines[nextLine].trim().startsWith(';') || 
              lines[nextLine].trim().startsWith('(') ||
              lines[nextLine].trim() === '')) {
        nextLine++;
      }
      nextLine = Math.min(nextLine, lines.length - 1);
      const pos = positions[nextLine] || prev.position;
      
      // Trigger smooth animation
      if (toolRef.current && pos) {
        lastPositionRef.current = { ...prev.position };
        targetPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
        tweenProgressRef.current = 0;
        
        // Animate over 500ms
        const animateStep = () => {
          tweenProgressRef.current += 0.05;
          if (tweenProgressRef.current >= 1) {
            tweenProgressRef.current = 1;
          } else {
            requestAnimationFrame(animateStep);
          }
        };
        animateStep();
      }
      
      return {
        ...prev,
        currentLine: nextLine,
        position: { x: pos.x, y: pos.y, z: pos.z, a: 0, b: 0, c: 0 },
        isPlaying: false
      };
    });
  };
  
  const stepBackward = () => {
    const lines = project.gcode.channel1.split('\n');
    const positions = parseGCodePositions(project.gcode.channel1);
    
    setSimulation(prev => {
      let prevLine = prev.currentLine - 1;
      // Skip comments and empty lines
      while (prevLine >= 0 && 
             (lines[prevLine].trim().startsWith(';') || 
              lines[prevLine].trim().startsWith('(') ||
              lines[prevLine].trim() === '')) {
        prevLine--;
      }
      prevLine = Math.max(prevLine, 0);
      const pos = positions[prevLine] || prev.position;
      
      return {
        ...prev,
        currentLine: prevLine,
        position: { x: pos.x, y: pos.y, z: pos.z, a: 0, b: 0, c: 0 },
        isPlaying: false
      };
    });
  };

  // Top menu system
  const [activeMenu, setActiveMenu] = useState(null);
  
  const menuItems = {
    file: {
      label: 'File',
      items: [
        { id: 'new', label: 'New Project', action: newProject },
        { id: 'open', label: 'Open...', action: () => document.getElementById('file-input').click() },
        { id: 'save', label: 'Save', action: saveProject },
        { id: 'saveAs', label: 'Save As...', action: saveProject },
        { divider: true },
        { id: 'import', label: 'Import STEP...', action: () => document.getElementById('step-file-input').click() },
        { id: 'export', label: 'Export G-Code...', action: () => {
          const blob = new Blob([project.gcode.channel1], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.name}.nc`;
          a.click();
          URL.revokeObjectURL(url);
        }},
        { divider: true },
        { id: 'recent', label: 'Recent Files', submenu: true },
        { divider: true },
        { id: 'exit', label: 'Exit', action: () => window.close() }
      ]
    },
    edit: {
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', action: () => document.execCommand('undo') },
        { id: 'redo', label: 'Redo', action: () => document.execCommand('redo') },
        { divider: true },
        { id: 'cut', label: 'Cut', action: () => document.execCommand('cut') },
        { id: 'copy', label: 'Copy', action: () => document.execCommand('copy') },
        { id: 'paste', label: 'Paste', action: () => document.execCommand('paste') },
        { divider: true },
        { id: 'find', label: 'Find...', action: () => {} },
        { id: 'replace', label: 'Replace...', action: () => {} }
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
        { id: 'tools', label: '🔧 Tool Manager', checked: panels.tools.visible, action: () => togglePanel('tools') },
        { id: 'dual', label: 'Dual Channel', checked: panels.dualChannel.visible, action: () => togglePanel('dualChannel') },
        { id: 'step', label: 'STEP Processor', checked: panels.stepProcessor.visible, action: () => togglePanel('stepProcessor') },
        { id: 'machine', label: 'Machine Control', checked: panels.machineControl.visible, action: () => togglePanel('machineControl') },
        { id: 'features', label: 'Feature Tree', checked: panels.features.visible, action: () => togglePanel('features') },
        { id: 'console', label: 'Console', checked: panels.console.visible, action: () => togglePanel('console') },
        { divider: true },
        { id: 'lighting', label: '🔆 Lighting Setup', checked: panels.lighting.visible, action: () => togglePanel('lighting') }
      ]
    },
    simulation: {
      label: 'Simulation',
      items: [
        { id: 'play', label: simulation.isPlaying ? 'Pause' : 'Play', action: () => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying })) },
        { id: 'stop', label: 'Stop', action: stopSimulation },
        { id: 'stepForward', label: 'Step Forward', action: stepForward },
        { id: 'stepBackward', label: 'Step Backward', action: stepBackward },
        { divider: true },
        { id: 'speed', label: `Speed: ${simulation.speed}x`, submenu: true },
        { divider: true },
        { id: 'verify', label: 'Verify G-Code', action: () => {
          const gcode = project.gcode.channel1;
          const lines = gcode.split('\n');
          const errors = [];
          const warnings = [];
          
          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(';')) return;
            
            // Check for valid G/M codes
            if (!/^[GMXYZIJKFST]/.test(trimmed)) {
              warnings.push(`Line ${index + 1}: Unusual start character`);
            }
            
            // Check for feedrate in G01/G02/G03
            if (/^G0[123]/.test(trimmed) && !/F\d+/.test(gcode.substring(0, index * 20))) {
              warnings.push(`Line ${index + 1}: No feedrate defined for cutting move`);
            }
          });
          
          alert(`G-Code Verification:\n${errors.length} errors\n${warnings.length} warnings\n\n${warnings.slice(0, 5).join('\n')}`);
        }},
        { id: 'optimize', label: 'Optimize Toolpath', action: () => {
          // Simple optimization: remove redundant moves
          const gcode = project.gcode.channel1;
          const lines = gcode.split('\n');
          const optimized = [];
          let lastPos = { x: null, y: null, z: null };
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(';')) {
              optimized.push(line);
              return;
            }
            
            // Parse position
            const x = trimmed.match(/X([-\d.]+)/)?.[1];
            const y = trimmed.match(/Y([-\d.]+)/)?.[1];
            const z = trimmed.match(/Z([-\d.]+)/)?.[1];
            
            // Skip if moving to same position
            if (x === lastPos.x && y === lastPos.y && z === lastPos.z) {
              return;
            }
            
            if (x) lastPos.x = x;
            if (y) lastPos.y = y;
            if (z) lastPos.z = z;
            
            optimized.push(line);
          });
          
          setProject(prev => ({
            ...prev,
            gcode: { ...prev.gcode, channel1: optimized.join('\n') }
          }));
          
          alert(`Toolpath optimized!\nReduced from ${lines.length} to ${optimized.length} lines`);
        }}
      ]
    },
    tools: {
      label: 'Tools',
      items: [
        { id: 'toolmanager', label: '🔧 Tool Manager Pro', action: () => togglePanel('tools') },
        { id: 'tooloffsets', label: '📏 Tool Offset Table (H/D)', action: () => togglePanel('toolOffsetTable') },
        { divider: true },
        { id: 'feedsspeeds', label: 'Feeds & Speeds Optimizer', action: () => togglePanel('feedsSpeeds') },
        { id: 'toollife', label: 'Tool Life Calculator', action: () => togglePanel('toolLife') },
        { id: 'powerTorque', label: 'Power & Torque Calculator', action: () => togglePanel('powerTorque') },
        { divider: true },
        { id: 'circular', label: 'Circular Interpolation', action: () => togglePanel('circular') },
        { id: 'geometry', label: 'Geometry Tools', action: () => togglePanel('geometry') },
        { id: 'pocketwizard', label: 'Pocket Milling Wizard', action: () => togglePanel('pocketMilling') },
        { id: 'shopfloor', label: 'Shop Floor Utilities', action: () => togglePanel('shopFloor') }
      ]
    },
    machine: {
      label: 'Machine',
      items: [
        { id: 'machineconfig', label: '🏭 Machine Configurator', action: () => togglePanel('machineConfig') },
        { id: 'setupmanager', label: '📐 Setup Manager', action: () => togglePanel('setupManager') },
        { divider: true },
        { id: 'offsets', label: 'Work Offsets (G54-G59)', action: () => togglePanel('workOffsets') },
        { id: 'machinecontrol', label: 'Machine Control', action: () => togglePanel('machineControl') }
      ]
    },
    setup: {
      label: 'Setup',
      items: [
        { id: 'stock', label: 'Stock Setup...', action: () => togglePanel('stockSetup') },
        { id: 'part', label: 'Part Setup...', action: () => togglePanel('partSetup') },
        { id: 'fixture', label: 'Fixture Setup...', action: () => togglePanel('fixtureSetup') },
        { id: 'machine', label: 'Machine Setup...', action: () => togglePanel('machineSetup') },
        { id: 'workoffsets', label: 'Work Offsets (G54-G59)...', action: () => togglePanel('workOffsets') },
        { divider: true },
        { id: 'setupwizard', label: 'Setup Wizard', action: () => {
          // Open all setup panels in sequence
          setPanels(prev => ({
            ...prev,
            stockSetup: { ...prev.stockSetup, visible: true },
            fixtureSetup: { ...prev.fixtureSetup, visible: true },
            machineSetup: { ...prev.machineSetup, visible: true },
            partSetup: { ...prev.partSetup, visible: true }
          }));
        }},
        { id: 'savesetup', label: 'Save Setup', action: () => {
          const setupData = JSON.stringify(setupConfig, null, 2);
          const blob = new Blob([setupData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.name}_setup.json`;
          a.click();
          URL.revokeObjectURL(url);
        }},
        { id: 'loadsetup', label: 'Load Setup', action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const loaded = JSON.parse(event.target.result);
                  setSetupConfig(loaded);
                  alert('Setup loaded successfully!');
                } catch (err) {
                  alert('Error loading setup file');
                }
              };
              reader.readAsText(file);
            }
          };
          input.click();
        }}
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
    <div style={{ 
      height: '100vh', 
      background: '#0a0e1a', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Menu Bar - Desktop Only */}
      {!isMobile && (
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
      )}
      
      {/* 3D Viewport - Full screen background */}
      <div 
        ref={mountRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 0
        }} 
      />
      
      {/* Quick Access Toolbar - Desktop Only */}
      {!isMobile && <QuickToolbar />}
      
      {/* Collision Alert Modal */}
      <CollisionAlert />
      
      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1a1f2e',
            borderRadius: '10px',
            padding: '30px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '2px solid #00d4ff'
          }}>
            <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>⌨️ Keyboard Shortcuts</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div><kbd>Space</kbd> - Play/Pause simulation</div>
              <div><kbd>Esc</kbd> - Stop simulation</div>
              <div><kbd>F10</kbd> - Step forward</div>
              <div><kbd>F9</kbd> - Step backward</div>
              <div><kbd>1-4</kbd> - Camera views (Top/Front/Side/Iso)</div>
              <div><kbd>F</kbd> - Zoom to fit</div>
              <div><kbd>Arrow Keys</kbd> - Jog X/Y axes</div>
              <div><kbd>Page Up/Down</kbd> - Jog Z axis</div>
              <div><kbd>+/-</kbd> - Speed control</div>
              <div><kbd>G</kbd> - Toggle G-code panel</div>
              <div><kbd>T</kbd> - Toggle tools panel</div>
              <div><kbd>Ctrl+S</kbd> - Save project</div>
              <div><kbd>Ctrl+O</kbd> - Open file</div>
              <div><kbd>?</kbd> - Show this help</div>
            </div>
            <button 
              onClick={() => setShowShortcutsHelp(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#00d4ff',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
      
      {/* Floating/Docked Panels - Desktop Only */}
      {!isMobile && (
        <>
          {renderPanel('gcode', 
            <GCodeSyntaxHighlighter 
              code={project.gcode.channel1}
              onChange={(newCode) => setProject(prev => ({ 
                ...prev, 
                gcode: { ...prev.gcode, channel1: newCode } 
              }))}
              currentLine={simulation.currentLine}
              onLineClick={(lineNum) => setSimulation(prev => ({ 
                ...prev, 
                currentLine: lineNum 
              }))}
            />
          )}
          
          {renderPanel('tools',
                    <ToolManagerProEnhanced
          activeAssemblies={toolAssemblies}
          onAssemblyCreate={(assembly) => {
            setToolAssemblies(prev => [...prev, assembly]);
            if (assembly.components?.tool) {
              window.updateTool3D?.(assembly);
            }
          }}
          onAssemblySelect={(assembly) => {
            // Update simulation with selected tool assembly
            setSimulation(prev => ({ ...prev, toolAssembly: assembly }));
            
            // Update 3D visualization
            window.updateTool3D?.(assembly);
            
            // Auto-populate tool offset table with tool data
            if (assembly && assembly.components?.tool) {
              const tool = assembly.components.tool;
              const holder = assembly.components.holder;
              
              // Calculate tool length from spindle gauge line to tool tip
              // This is the complete assembly: holder gauge + stickout + extensions
              const holderGaugeLengths = {
                'BT30': 45, 'BT40': 65, 'BT50': 100,
                'CAT40': 65, 'CAT50': 100,
                'HSK63': 50, 'HSK100': 60,
                'ER32': 40, 'ER40': 45,
                'default': 60
              };
              
              let totalLength = 0;
              
              // Add holder gauge length
              if (holder?.type) {
                const holderType = holder.type.split('/')[0];
                totalLength += holderGaugeLengths[holderType] || holderGaugeLengths.default;
              } else {
                totalLength += holderGaugeLengths.default;
              }
              
              // Add tool stickout
              totalLength += tool.stickout || 30;
              
              // Add extensions
              if (assembly.components.extension?.length) totalLength += assembly.components.extension.length;
              
              // Find or assign a tool number (T1, T2, etc.)
              const toolNumber = assembly.toolNumber || simulation.tool || 1;
              
              // Update the H register in tool offset table
              setToolOffsetTable(prev => {
                const newTable = { ...prev };
                // Update H register for this tool
                if (!newTable.H[toolNumber]) {
                  newTable.H[toolNumber] = { lengthGeometry: 0, lengthWear: 0 };
                }
                newTable.H[toolNumber].lengthGeometry = totalLength;
                
                // Update D register for cutter compensation
                if (!newTable.D[toolNumber]) {
                  newTable.D[toolNumber] = { diameterGeometry: 0, diameterWear: 0 };
                }
                newTable.D[toolNumber].diameterGeometry = tool.diameter || 0;
                
                return newTable;
              });
              
              // Set this as the active tool
              setSimulation(prev => ({ 
                ...prev, 
                tool: toolNumber,
                activeHCode: toolNumber,
                activeDCode: toolNumber
              }));
            }
          }}
          onAssemblyDelete={(id) => {
            setToolAssemblies(prev => prev.filter(a => a.id !== id));
          }}
        />
      )}
      

      
      {renderPanel('toolOffsetTable',
        <ToolOffsetTable 
          offsetTable={toolOffsetTable}
          setOffsetTable={setToolOffsetTable}
          activeHCode={simulation.activeHCode}
          activeDCode={simulation.activeDCode}
          onApplyOffset={(type, register) => {
            // Update simulation with new active offset
            if (type === 'H') {
              setSimulation(prev => ({ ...prev, activeHCode: register }));
            } else {
              setSimulation(prev => ({ ...prev, activeDCode: register }));
            }
          }}
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
          toolRef={toolRef}
          sceneRef={sceneRef}
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
      
      {renderPanel('lighting',
        <LightingSetup 
          lights={lightsRef.current}
          config={lightingConfig}
          onUpdate={updateLights}
        />
      )}
      
      {/* Calculator Modules */}
      {renderPanel('feedsSpeeds', <FeedsSpeedsOptimizer />)}
      {renderPanel('toolLife', <ToolLifeCalculator />)}
      {renderPanel('powerTorque', <PowerTorqueCalculator />)}
      {renderPanel('circular', <CircularInterpolation />)}
      {renderPanel('geometry', <GeometryTools />)}
      {renderPanel('pocketMilling', <PocketMillingWizard />)}
      {renderPanel('shopFloor', <ShopFloorUtilities />)}
      {renderPanel('machineConfig', <MachineConfigurator />)}
          {renderPanel('setupManager', <SetupManager />)}
          
          {/* Setup Panels */}
          {renderPanel('stockSetup', 
            <StockSetup
              config={setupConfig.stock}
              onUpdate={(updatedStock) => {
                setSetupConfig(prev => ({
                  ...prev,
                  stock: updatedStock
                }));
              }}
              sceneRef={sceneRef}
            />
          )}
          
          {renderPanel('fixtureSetup',
            <FixtureSetup
              config={setupConfig.fixture}
              onUpdate={(updatedFixture) => {
                setSetupConfig(prev => ({
                  ...prev,
                  fixture: updatedFixture
                }));
              }}
              sceneRef={sceneRef}
            />
          )}
          
          {renderPanel('partSetup',
            <PartSetup
              config={setupConfig.part || { position: { x: 0, y: 0, z: 0 } }}
              onUpdate={(updatedPart) => {
                setSetupConfig(prev => ({
                  ...prev,
                  part: updatedPart
                }));
              }}
              sceneRef={sceneRef}
            />
          )}
          
          {renderPanel('machineSetup',
            <MachineSetup
              config={setupConfig.machine}
              onUpdate={(updatedMachine) => {
                setSetupConfig(prev => ({
                  ...prev,
                  machine: updatedMachine
                }));
              }}
            />
          )}
          
          {renderPanel('workOffsets',
            <WorkOffsetsManager
              workOffsets={setupConfig.workOffsets}
              onUpdate={(updatedOffsets) => {
                setSetupConfig(prev => ({
                  ...prev,
                  workOffsets: updatedOffsets
                }));
              }}
              sceneRef={sceneRef}
              onVisualsUpdate={() => {
                if (sceneRef.current && rendererRef.current && cameraRef.current) {
                  rendererRef.current.render(sceneRef.current, cameraRef.current);
                }
              }}
            />
          )}
          
        </>
      )}
      
      {/* Context Menu */}
      <div className="context-menu" style={{ display: 'none' }}>
        <button>Cut</button>
        <button>Copy</button>
        <button>Paste</button>
        <div className="menu-separator" />
        <button>Properties</button>
      </div>
      
      {/* Mobile UI Components */}
      {isMobile && (
        <>
          <MobileToolbar />
          <MobileMenu />
          <MobilePanel />
        </>
      )}
    </div>
  );
};

export default CNCProSuite;
