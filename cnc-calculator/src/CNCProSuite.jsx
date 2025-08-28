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
import ToolHolderSystem from './components/ToolHolderSystem';
import RealToolSystem from './components/RealToolSystem';
import ToolOffsetTable from './components/ToolOffsetTable';

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
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState(null);
  
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
      G54: { x: 0, y: 0, z: 0, description: 'Primary Setup' },
      G55: { x: 100, y: 100, z: 0, description: 'Secondary Setup' },
      G56: { x: 0, y: 0, z: 0, description: 'Third Setup' },
      G57: { x: 0, y: 0, z: 0, description: 'Fourth Setup' },
      G58: { x: 0, y: 0, z: 0, description: 'Fifth Setup' },
      G59: { x: 0, y: 0, z: 0, description: 'Sixth Setup' }
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
      position: { x: window.innerWidth - 350, y: 150 },
      size: { width: 280, height: 350 },
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
    stockSetup: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 500 },
      zIndex: 2,
      minimized: false,
      title: 'Stock Setup'
    },
    fixtureSetup: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 150, y: 120 },
      size: { width: 400, height: 450 },
      zIndex: 2,
      minimized: false,
      title: 'Fixture Setup'
    },
    machineSetup: {
      visible: false,
      floating: true,
      docked: null,
      position: { x: 200, y: 100 },
      size: { width: 450, height: 550 },
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
    }
  });

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    speed: 1.0,
    currentLine: 0,
    position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
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
  
  // Tool Offset Table (like real CNC machine)
  const [toolOffsetTable, setToolOffsetTable] = useState({
    // H codes (Tool Length Offsets) - up to 99 in real machines
    H: Array(100).fill(null).map((_, i) => ({
      register: i,
      lengthGeometry: i <= 6 ? [75.5, 65.2, 70.0, 85.3, 50.0, 68.7][i-1] || 0 : 0,
      lengthWear: 0
    })),
    // D codes (Cutter Diameter Compensation) - up to 99 in real machines  
    D: Array(100).fill(null).map((_, i) => ({
      register: i,
      diameterGeometry: i <= 6 ? [10, 6, 8, 5, 50, 12][i-1] || 0 : 0,
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
  const updateToolpathRef = useRef(null);
  const originMarkerRef = useRef(null);

  // Enhanced G-code parser with tool compensation
  const parseGCodePositions = (gcode) => {
    const lines = gcode.split('\n');
    const positions = [];
    let current = { x: 0, y: 0, z: 5, f: 500, s: 0, g43: false, g41: false, g42: false, h: 0, d: 0 };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // Check for empty lines or comments (both ; and parentheses style)
      if (trimmed === '' || trimmed.startsWith(';') || trimmed.startsWith('(')) {
        positions.push({ ...current, comment: true, line: trimmed });
        return;
      }
      
      const x = line.match(/X([-\d.]+)/i);
      const y = line.match(/Y([-\d.]+)/i);
      const z = line.match(/Z([-\d.]+)/i);
      const f = line.match(/F([\d.]+)/i);
      const s = line.match(/S([\d]+)/i);
      const h = line.match(/H([\d]+)/i);
      const d = line.match(/D([\d]+)/i);
      
      // Check for tool compensation codes
      if (/G43/i.test(line)) current.g43 = true;  // Tool length comp on
      if (/G49/i.test(line)) current.g43 = false; // Tool length comp off
      if (/G41/i.test(line)) { current.g41 = true; current.g42 = false; } // Cutter comp left
      if (/G42/i.test(line)) { current.g42 = true; current.g41 = false; } // Cutter comp right
      if (/G40/i.test(line)) { current.g41 = false; current.g42 = false; } // Cutter comp off
      
      if (x) current.x = parseFloat(x[1]);
      if (y) current.y = parseFloat(y[1]);
      if (z) current.z = parseFloat(z[1]);
      if (f) current.f = parseFloat(f[1]);
      if (s) current.s = parseInt(s[1]);
      if (h) current.h = parseInt(h[1]);
      if (d) current.d = parseInt(d[1]);
      
      // Check for rapid move
      const isRapid = /G0?0\b/i.test(line);
      
      positions.push({ ...current, rapid: isRapid, comment: false, line: trimmed });
    });
    
    return positions;
  };
  
  // Store simulation in ref for animation loop
  const simulationRef = useRef(simulation);
  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);
  
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
    const stockMaterial = new THREE.MeshStandardMaterial({ 
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
    const pocketMaterial = new THREE.MeshStandardMaterial({ 
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
    
    // Example Tool - End Mill (properly oriented along Z-axis)
    const toolGroup = new THREE.Group();
    
    // Tool holder (along Z-axis)
    const holderGeometry = new THREE.CylinderGeometry(12, 12, 40, 32);
    const holderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.1
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotation.x = Math.PI / 2; // Rotate to align with Z-axis
    holder.position.z = 20;
    toolGroup.add(holder);
    
    // Cutting tool (along Z-axis)
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 30, 32);
    const toolMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotation.x = Math.PI / 2; // Rotate to align with Z-axis
    tool.position.z = -5;
    toolGroup.add(tool);
    
    // Tool flutes detail
    const fluteCount = 4;
    for (let i = 0; i < fluteCount; i++) {
      const angle = (i * Math.PI * 2) / fluteCount;
      const fluteGeometry = new THREE.BoxGeometry(1, 1, 30);
      const fluteMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x004400,
        emissive: 0x00ff00,
        emissiveIntensity: 0.1
      });
      const flute = new THREE.Mesh(fluteGeometry, fluteMaterial);
      flute.position.x = Math.cos(angle) * 4;
      flute.position.y = Math.sin(angle) * 4;
      flute.position.z = -5;
      toolGroup.add(flute);
    }
    
    // Add tool tip coordinate system (smaller than origin)
    const toolCoordGroup = new THREE.Group();
    
    // X axis - Red
    const toolXGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 4);
    const toolXMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const toolXAxis = new THREE.Mesh(toolXGeometry, toolXMaterial);
    toolXAxis.rotation.z = Math.PI / 2;
    toolXAxis.position.x = 5;
    toolCoordGroup.add(toolXAxis);
    
    // X cone
    const toolXConeGeometry = new THREE.ConeGeometry(0.8, 2, 4);
    const toolXCone = new THREE.Mesh(toolXConeGeometry, toolXMaterial);
    toolXCone.rotation.z = -Math.PI / 2;
    toolXCone.position.x = 10;
    toolCoordGroup.add(toolXCone);
    
    // Y axis - Green  
    const toolYGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 4);
    const toolYMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const toolYAxis = new THREE.Mesh(toolYGeometry, toolYMaterial);
    toolYAxis.rotation.x = Math.PI / 2;
    toolYAxis.position.y = 5;
    toolCoordGroup.add(toolYAxis);
    
    // Y cone
    const toolYConeGeometry = new THREE.ConeGeometry(0.8, 2, 4);
    const toolYCone = new THREE.Mesh(toolYConeGeometry, toolYMaterial);
    toolYCone.rotation.x = Math.PI / 2;
    toolYCone.position.y = 10;
    toolCoordGroup.add(toolYCone);
    
    // Z axis - Blue
    const toolZGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 4);
    const toolZMaterial = new THREE.MeshBasicMaterial({ color: 0x0080ff });
    const toolZAxis = new THREE.Mesh(toolZGeometry, toolZMaterial);
    toolZAxis.position.z = 5;
    toolCoordGroup.add(toolZAxis);
    
    // Z cone
    const toolZConeGeometry = new THREE.ConeGeometry(0.8, 2, 4);
    const toolZCone = new THREE.Mesh(toolZConeGeometry, toolZMaterial);
    toolZCone.position.z = 10;
    toolCoordGroup.add(toolZCone);
    
    // Position at tool tip
    toolCoordGroup.position.z = -20; // At the cutting tip
    toolGroup.add(toolCoordGroup);
    
    toolGroup.position.set(0, 0, 50); // Start at safe height above workpiece
    scene.add(toolGroup);
    toolRef.current = toolGroup;
    
    // Add work origin marker (coordinate system axes)
    const originGroup = new THREE.Group();
    
    // X axis - Red
    const xAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = 15;
    originGroup.add(xAxis);
    
    // X cone
    const xConeGeometry = new THREE.ConeGeometry(2, 5, 8);
    const xCone = new THREE.Mesh(xConeGeometry, xAxisMaterial);
    xCone.rotation.z = -Math.PI / 2;
    xCone.position.x = 30;
    originGroup.add(xCone);
    
    // Y axis - Green
    const yAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
    yAxis.rotation.x = Math.PI / 2;
    yAxis.position.y = 15;
    originGroup.add(yAxis);
    
    // Y cone
    const yConeGeometry = new THREE.ConeGeometry(2, 5, 8);
    const yCone = new THREE.Mesh(yConeGeometry, yAxisMaterial);
    yCone.rotation.x = Math.PI / 2;
    yCone.position.y = 30;
    originGroup.add(yCone);
    
    // Z axis - Blue
    const zAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0080ff });
    const zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
    zAxis.position.z = 15;
    originGroup.add(zAxis);
    
    // Z cone
    const zConeGeometry = new THREE.ConeGeometry(2, 5, 8);
    const zCone = new THREE.Mesh(zConeGeometry, zAxisMaterial);
    zCone.position.z = 30;
    originGroup.add(zCone);
    
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
    const updateToolpath = (workOffsets = null) => {
      // Remove old toolpath
      if (toolpathRef.current) {
        scene.remove(toolpathRef.current);
        toolpathRef.current = null;
      }
      
      // Parse G-code positions
      const positions = parseGCodePositions(project.gcode.channel1);
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
        
        scene.add(toolpathGroup);
        toolpathRef.current = toolpathGroup;
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Only initialize once
  
  // Update toolpath when G-code or work offset changes
  useEffect(() => {
    if (updateToolpathRef.current && project.gcode.channel1) {
      updateToolpathRef.current(setupConfig.workOffsets);
    }
    // Also update origin marker position
    if (originMarkerRef.current) {
      const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      originMarkerRef.current.position.set(activeOffset.x, activeOffset.y, activeOffset.z);
    }
  }, [project.gcode.channel1, setupConfig.workOffsets.activeOffset, setupConfig.workOffsets.G54, setupConfig.workOffsets.G55, setupConfig.workOffsets.G56, setupConfig.workOffsets.G57, setupConfig.workOffsets.G58, setupConfig.workOffsets.G59]);
  
  // Update tool position when simulation changes
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
      
      // Position tool at actual cutting position with work offset and tool compensation
      const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      
      // The tool control point is at the tip when G43 is active
      const toolControlZ = currentPos.g43 ? 
        currentPos.z + activeOffset.z - toolLengthComp :  // Compensated position
        currentPos.z + activeOffset.z + 30;  // Default tool visual offset
      
      toolRef.current.position.set(
        currentPos.x + activeOffset.x, 
        currentPos.y + activeOffset.y, 
        toolControlZ
      );
      
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
  
  // Simple playback timer
  useEffect(() => {
    if (!simulation.isPlaying) return;
    
    const interval = setInterval(() => {
      const lines = project.gcode.channel1.split('\n');
      const positions = parseGCodePositions(project.gcode.channel1);
      
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
        
        // Update position from parsed data
        const pos = positions[nextLine] || prev.position;
        return { 
          ...prev, 
          currentLine: nextLine,
          position: { x: pos.x, y: pos.y, z: pos.z, a: 0, b: 0, c: 0 }
        };
      });
    }, 100 / simulation.speed); // Adjust speed
    
    return () => clearInterval(interval);
  }, [simulation.isPlaying, simulation.speed, project.gcode.channel1]);

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
      
      <div className="toolbar-info">
        <span>{project.name}</span>
        <span>|</span>
        <span>X: {simulation.position.x.toFixed(1)}</span>
        <span>Y: {simulation.position.y.toFixed(1)}</span>
        <span>Z: {simulation.position.z.toFixed(1)}</span>
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

  const stopSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: false,
      currentLine: 0,
      position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 }
    }));
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
        { id: 'new', label: 'New Project', shortcut: 'Ctrl+N', action: newProject },
        { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => document.getElementById('file-input').click() },
        { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: saveProject },
        { id: 'saveAs', label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: saveProject },
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
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { divider: true },
        { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
        { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
        { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
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
        { id: 'tools', label: '🔧 Tool Manager', checked: panels.tools.visible, action: () => togglePanel('tools') },
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
        { id: 'stepForward', label: 'Step Forward', shortcut: 'F10', action: stepForward },
        { id: 'stepBackward', label: 'Step Backward', shortcut: 'F9', action: stepBackward },
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
        { id: 'feedsspeeds', label: 'Feeds & Speeds Optimizer', action: () => togglePanel('feedsSpeeds') },
        { id: 'toollife', label: 'Tool Life Calculator', action: () => togglePanel('toolLife') },
        { id: 'powerTorque', label: 'Power & Torque Calculator', action: () => togglePanel('powerTorque') },
        { id: 'circular', label: 'Circular Interpolation', action: () => togglePanel('circular') },
        { id: 'geometry', label: 'Geometry Tools', action: () => togglePanel('geometry') },
        { divider: true },
        { id: 'pocketwizard', label: 'Pocket Milling Wizard', action: () => togglePanel('pocketMilling') },
        { id: 'shopfloor', label: 'Shop Floor Utilities', action: () => togglePanel('shopFloor') },
        { divider: true },
        { id: 'tooldatabase', label: '🛠️ Real Tool System (Professional)', action: () => togglePanel('toolDatabase') },
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
        { id: 'offsets', label: 'Work Offsets (G54-G59)', action: () => togglePanel('workOffsets') },
        { id: 'tooloffsets', label: 'Tool Offset Table (H/D)', action: () => togglePanel('toolOffsetTable') },
        { id: 'parameters', label: 'Machine Parameters', action: () => {} }
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

  // Mobile Toolbar Component
  const MobileToolbar = () => (
    <div className="mobile-toolbar">
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className={mobileMenuOpen ? 'active' : ''}
      >
        ☰<span>Menu</span>
      </button>
      <button 
        onClick={() => setActiveMobilePanel(activeMobilePanel === 'gcode' ? null : 'gcode')}
        className={activeMobilePanel === 'gcode' ? 'active' : ''}
      >
        📝<span>Code</span>
      </button>
      <button 
        onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        className={simulation.isPlaying ? 'active' : ''}
      >
        {simulation.isPlaying ? '⏸️' : '▶️'}<span>Play</span>
      </button>
      <button 
        onClick={() => setActiveMobilePanel(activeMobilePanel === 'tools' ? null : 'tools')}
        className={activeMobilePanel === 'tools' ? 'active' : ''}
      >
        🔧<span>Tools</span>
      </button>
      <button 
        onClick={() => setActiveMobilePanel(activeMobilePanel === 'setup' ? null : 'setup')}
        className={activeMobilePanel === 'setup' ? 'active' : ''}
      >
        ⚙️<span>Setup</span>
      </button>
    </div>
  );
  
  // Mobile Menu Component
  const MobileMenu = () => (
    <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
      <div className="mobile-menu-header">
        <h3>CNC Pro Suite</h3>
        <button onClick={() => setMobileMenuOpen(false)}>✖</button>
      </div>
      <div className="mobile-menu-items">
        <div className="mobile-menu-item" onClick={() => { togglePanel('feedsSpeeds'); setMobileMenuOpen(false); }}>
          Feeds & Speeds Optimizer
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('toolLife'); setMobileMenuOpen(false); }}>
          Tool Life Calculator
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('powerTorque'); setMobileMenuOpen(false); }}>
          Power & Torque Calculator
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('circular'); setMobileMenuOpen(false); }}>
          Circular Interpolation
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('geometry'); setMobileMenuOpen(false); }}>
          Geometry Tools
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('pocketMilling'); setMobileMenuOpen(false); }}>
          Pocket Milling Wizard
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('dualChannel'); setMobileMenuOpen(false); }}>
          Dual Channel Debugger
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('stepProcessor'); setMobileMenuOpen(false); }}>
          STEP Processor
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('machineConfig'); setMobileMenuOpen(false); }}>
          Machine Configurator
        </div>
        <div className="mobile-menu-item" onClick={() => { togglePanel('setupManager'); setMobileMenuOpen(false); }}>
          Setup Manager
        </div>
      </div>
    </div>
  );
  
  // Mobile Panel Component
  const MobilePanel = () => {
    if (!activeMobilePanel) return null;
    
    let content = null;
    switch(activeMobilePanel) {
      case 'gcode':
        content = (
          <GCodeEditor 
            gcode={project.gcode}
            onChange={(gcode) => setProject(prev => ({ ...prev, gcode }))}
            currentLine={simulation.currentLine}
          />
        );
        break;
      case 'tools':
        content = (
          <ToolManager 
            tools={project.tools}
            onChange={(tools) => setProject(prev => ({ ...prev, tools }))}
          />
        );
        break;
      case 'setup':
        content = (
          <div className="setup-panel">
            <h4>Stock Setup</h4>
            <div className="setup-group">
              <label>Type:</label>
              <select 
                value={setupConfig.stock.type}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  stock: { ...prev.stock, type: e.target.value }
                }))}
              >
                <option value="block">Block</option>
                <option value="cylinder">Cylinder</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="setup-group">
              <label>Dimensions (mm):</label>
              <input 
                type="number" 
                placeholder="X"
                value={setupConfig.stock.dimensions.x}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  stock: { 
                    ...prev.stock, 
                    dimensions: { ...prev.stock.dimensions, x: parseFloat(e.target.value) }
                  }
                }))}
              />
              <input 
                type="number" 
                placeholder="Y"
                value={setupConfig.stock.dimensions.y}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  stock: { 
                    ...prev.stock, 
                    dimensions: { ...prev.stock.dimensions, y: parseFloat(e.target.value) }
                  }
                }))}
              />
              <input 
                type="number" 
                placeholder="Z"
                value={setupConfig.stock.dimensions.z}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  stock: { 
                    ...prev.stock, 
                    dimensions: { ...prev.stock.dimensions, z: parseFloat(e.target.value) }
                  }
                }))}
              />
            </div>
            
            <h4>Fixture Setup</h4>
            <div className="setup-group">
              <label>Type:</label>
              <select 
                value={setupConfig.fixture.type}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  fixture: { ...prev.fixture, type: e.target.value }
                }))}
              >
                <option value="vise">Vise</option>
                <option value="chuck">Chuck</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <h4>Machine Setup</h4>
            <div className="setup-group">
              <label>Type:</label>
              <select 
                value={setupConfig.machine.type}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  machine: { ...prev.machine, type: e.target.value }
                }))}
              >
                <option value="3-axis">3-Axis</option>
                <option value="4-axis">4-Axis</option>
                <option value="5-axis">5-Axis</option>
              </select>
            </div>
            <div className="setup-group">
              <label>Max Spindle (RPM):</label>
              <input 
                type="number" 
                value={setupConfig.machine.spindleMax}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  machine: { ...prev.machine, spindleMax: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
        );
        break;
      default:
        content = null;
    }
    
    return (
      <div className={`mobile-panel ${activeMobilePanel ? 'active' : ''}`}>
        <div className="panel-header">
          <span>{activeMobilePanel === 'gcode' ? 'G-Code Editor' : 
                activeMobilePanel === 'tools' ? 'Tool Manager' : 
                activeMobilePanel === 'setup' ? 'Setup Configuration' : ''}</span>
          <button onClick={() => setActiveMobilePanel(null)}>✖</button>
        </div>
        <div className="panel-content">
          {content}
        </div>
      </div>
    );
  };
  
  return (
    <div className="cnc-pro-suite">
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
      <div ref={mountRef} className="viewport-3d" />
      
      {/* Quick Access Toolbar - Desktop Only */}
      {!isMobile && <QuickToolbar />}
      
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
            <GCodeEditor 
              gcode={project.gcode}
              onChange={(gcode) => setProject(prev => ({ ...prev, gcode }))}
              currentLine={simulation.currentLine}
            />
          )}
          
          {renderPanel('tools',
        <ToolManager 
          tools={toolDatabase}
          onChange={(tools) => setToolDatabase(tools)}
        />
      )}
      
      {renderPanel('toolHolders',
        <ToolHolderSystem 
          onHolderSelect={(assembly) => {
            console.log('Holder selected:', assembly);
            // Update tool assembly in simulation
            setSimulation(prev => ({
              ...prev,
              toolAssembly: assembly
            }));
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
            console.log(`Applying ${type}${register} offset`);
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
      {renderPanel('machineConfig', <MachineConfigurator />)}
          {renderPanel('setupManager', <SetupManager />)}
          
          {/* Setup Panels */}
          {renderPanel('stockSetup', 
            <div className="setup-panel">
              <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Stock Configuration</h3>
              
              <div className="setup-section">
                <h4>Stock Type</h4>
                <select 
                  value={setupConfig.stock.type}
                  onChange={(e) => setSetupConfig(prev => ({
                    ...prev,
                    stock: { ...prev.stock, type: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                >
                  <option value="block">Rectangular Block</option>
                  <option value="cylinder">Cylinder</option>
                  <option value="tube">Tube</option>
                  <option value="custom">Custom Shape</option>
                </select>
              </div>
              
              <div className="setup-section">
                <h4>Dimensions (mm)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label>X (Length)</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.dimensions.x}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          dimensions: { ...prev.stock.dimensions, x: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Y (Width)</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.dimensions.y}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          dimensions: { ...prev.stock.dimensions, y: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Z (Height)</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.dimensions.z}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          dimensions: { ...prev.stock.dimensions, z: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="setup-section">
                <h4>Material</h4>
                <select 
                  value={setupConfig.stock.material}
                  onChange={(e) => setSetupConfig(prev => ({
                    ...prev,
                    stock: { ...prev.stock, material: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="aluminum">Aluminum 6061</option>
                  <option value="steel">Steel 1018</option>
                  <option value="stainless">Stainless 304</option>
                  <option value="brass">Brass</option>
                  <option value="plastic">Plastic (Delrin)</option>
                  <option value="wood">Wood</option>
                </select>
              </div>
              
              <div className="setup-section">
                <h4>Stock Position</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label>X Offset</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.position.x}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          position: { ...prev.stock.position, x: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Y Offset</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.position.y}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          position: { ...prev.stock.position, y: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Z Offset</label>
                    <input 
                      type="number" 
                      value={setupConfig.stock.position.z}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        stock: { 
                          ...prev.stock, 
                          position: { ...prev.stock.position, z: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  // Apply stock to 3D scene
                  if (workpieceRef.current && sceneRef.current) {
                    const scene = sceneRef.current;
                    
                    // Remove old workpiece
                    scene.remove(workpieceRef.current);
                    
                    // Create new workpiece based on type
                    let geometry;
                    const { x, y, z } = setupConfig.stock.dimensions;
                    
                    if (setupConfig.stock.type === 'cylinder') {
                      geometry = new THREE.CylinderGeometry(x/2, x/2, z, 32);
                    } else if (setupConfig.stock.type === 'tube') {
                      geometry = new THREE.CylinderGeometry(x/2, x/2, z, 32, 1, false, 0, Math.PI * 2);
                      const innerGeometry = new THREE.CylinderGeometry(x/2 - 10, x/2 - 10, z, 32);
                      // This would need CSG for proper tube
                    } else {
                      // Default block
                      geometry = new THREE.BoxGeometry(x, y, z);
                    }
                    
                    // Material based on selection
                    const materialColors = {
                      aluminum: 0xc0c0c0,
                      steel: 0x808080,
                      stainless: 0xe0e0e0,
                      brass: 0xb8860b,
                      plastic: 0xffffff,
                      wood: 0x8b4513
                    };
                    
                    const material = new THREE.MeshPhongMaterial({
                      color: materialColors[setupConfig.stock.material] || 0xc0c0c0,
                      metalness: 0.7,
                      roughness: 0.3
                    });
                    
                    const workpiece = new THREE.Mesh(geometry, material);
                    workpiece.position.set(
                      setupConfig.stock.position.x,
                      setupConfig.stock.position.y,
                      setupConfig.stock.position.z + z/2
                    );
                    
                    if (setupConfig.stock.type === 'cylinder' || setupConfig.stock.type === 'tube') {
                      workpiece.rotation.x = Math.PI / 2;
                    }
                    
                    workpiece.castShadow = true;
                    workpiece.receiveShadow = true;
                    
                    scene.add(workpiece);
                    workpieceRef.current = workpiece;
                    
                    // Update toolpath if exists with current work offsets
                    if (updateToolpathRef.current) {
                      updateToolpathRef.current(setupConfig.workOffsets);
                    }
                  }
                }}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#00d4ff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Apply Stock Settings
              </button>
            </div>
          )}
          
          {renderPanel('fixtureSetup',
            <div className="setup-panel">
              <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Fixture Configuration</h3>
              
              <div className="setup-section">
                <h4>Fixture Type</h4>
                <select 
                  value={setupConfig.fixture.type}
                  onChange={(e) => setSetupConfig(prev => ({
                    ...prev,
                    fixture: { ...prev.fixture, type: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                >
                  <option value="vise">Machine Vise</option>
                  <option value="chuck">3-Jaw Chuck</option>
                  <option value="4jaw">4-Jaw Chuck</option>
                  <option value="collet">Collet Chuck</option>
                  <option value="magnetic">Magnetic Chuck</option>
                  <option value="vacuum">Vacuum Table</option>
                  <option value="custom">Custom Fixture</option>
                </select>
              </div>
              
              {setupConfig.fixture.type === 'vise' && (
                <div className="setup-section">
                  <h4>Vise Settings</h4>
                  <div>
                    <label>Jaw Width (mm)</label>
                    <input 
                      type="number" 
                      value={setupConfig.fixture.jawWidth}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        fixture: { ...prev.fixture, jawWidth: parseFloat(e.target.value) }
                      }))}
                      style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                    />
                  </div>
                  <div>
                    <label>Clamping Force (N)</label>
                    <input 
                      type="number" 
                      value={setupConfig.fixture.clampingForce}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        fixture: { ...prev.fixture, clampingForce: parseFloat(e.target.value) }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                </div>
              )}
              
              <div className="setup-section">
                <h4>Fixture Position</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label>X Position</label>
                    <input 
                      type="number" 
                      value={setupConfig.fixture.position.x}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        fixture: { 
                          ...prev.fixture, 
                          position: { ...prev.fixture.position, x: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Y Position</label>
                    <input 
                      type="number" 
                      value={setupConfig.fixture.position.y}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        fixture: { 
                          ...prev.fixture, 
                          position: { ...prev.fixture.position, y: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Z Position</label>
                    <input 
                      type="number" 
                      value={setupConfig.fixture.position.z}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        fixture: { 
                          ...prev.fixture, 
                          position: { ...prev.fixture.position, z: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {renderPanel('machineSetup',
            <div className="setup-panel">
              <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Machine Configuration</h3>
              
              <div className="setup-section">
                <h4>Machine Type</h4>
                <select 
                  value={setupConfig.machine.type}
                  onChange={(e) => setSetupConfig(prev => ({
                    ...prev,
                    machine: { ...prev.machine, type: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                >
                  <option value="3-axis">3-Axis Mill</option>
                  <option value="4-axis">4-Axis Mill</option>
                  <option value="5-axis">5-Axis Mill</option>
                  <option value="lathe">CNC Lathe</option>
                  <option value="mill-turn">Mill-Turn</option>
                </select>
              </div>
              
              <div className="setup-section">
                <h4>Work Envelope (mm)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label>X Travel</label>
                    <input 
                      type="number" 
                      value={setupConfig.machine.workEnvelope.x}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        machine: { 
                          ...prev.machine, 
                          workEnvelope: { ...prev.machine.workEnvelope, x: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Y Travel</label>
                    <input 
                      type="number" 
                      value={setupConfig.machine.workEnvelope.y}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        machine: { 
                          ...prev.machine, 
                          workEnvelope: { ...prev.machine.workEnvelope, y: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div>
                    <label>Z Travel</label>
                    <input 
                      type="number" 
                      value={setupConfig.machine.workEnvelope.z}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        machine: { 
                          ...prev.machine, 
                          workEnvelope: { ...prev.machine.workEnvelope, z: parseFloat(e.target.value) }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="setup-section">
                <h4>Spindle Settings</h4>
                <div>
                  <label>Max Spindle Speed (RPM)</label>
                  <input 
                    type="number" 
                    value={setupConfig.machine.spindleMax}
                    onChange={(e) => setSetupConfig(prev => ({
                      ...prev,
                      machine: { ...prev.machine, spindleMax: parseInt(e.target.value) }
                    }))}
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                  />
                </div>
                <div>
                  <label>Rapid Feed Rate (mm/min)</label>
                  <input 
                    type="number" 
                    value={setupConfig.machine.rapidFeed}
                    onChange={(e) => setSetupConfig(prev => ({
                      ...prev,
                      machine: { ...prev.machine, rapidFeed: parseInt(e.target.value) }
                    }))}
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                  />
                </div>
                <div>
                  <label>Max Feed Rate (mm/min)</label>
                  <input 
                    type="number" 
                    value={setupConfig.machine.maxFeed}
                    onChange={(e) => setSetupConfig(prev => ({
                      ...prev,
                      machine: { ...prev.machine, maxFeed: parseInt(e.target.value) }
                    }))}
                    style={{ width: '100%', padding: '5px' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {renderPanel('partSetup',
            <div className="setup-panel">
              <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Part Setup</h3>
              
              <div className="setup-section">
                <h4>Part Information</h4>
                <div>
                  <label>Part Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter part name"
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                  />
                </div>
                <div>
                  <label>Part Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter part number"
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                  />
                </div>
                <div>
                  <label>Operation</label>
                  <select style={{ width: '100%', padding: '8px' }}>
                    <option>OP10 - Roughing</option>
                    <option>OP20 - Semi-Finishing</option>
                    <option>OP30 - Finishing</option>
                  </select>
                </div>
              </div>
              
              <div className="setup-section">
                <h4>Work Coordinate System</h4>
                <select style={{ width: '100%', padding: '8px', marginBottom: '15px' }}>
                  <option>G54 - Work Offset 1</option>
                  <option>G55 - Work Offset 2</option>
                  <option>G56 - Work Offset 3</option>
                  <option>G57 - Work Offset 4</option>
                </select>
              </div>
              
              <div className="setup-section">
                <h4>Part Zero Location</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <button style={{ padding: '8px', background: '#1a1f2e', border: '1px solid #00d4ff' }}>
                    Top Left Corner
                  </button>
                  <button style={{ padding: '8px', background: '#1a1f2e', border: '1px solid #333' }}>
                    Top Right Corner
                  </button>
                  <button style={{ padding: '8px', background: '#1a1f2e', border: '1px solid #333' }}>
                    Center
                  </button>
                  <button style={{ padding: '8px', background: '#1a1f2e', border: '1px solid #333' }}>
                    Bottom Left Corner
                  </button>
                </div>
              </div>
              
              <div className="setup-section">
                <h4>Safety Settings</h4>
                <div>
                  <label>Safe Z Height (mm)</label>
                  <input 
                    type="number" 
                    defaultValue="25"
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                  />
                </div>
                <div>
                  <label>Clearance Plane (mm)</label>
                  <input 
                    type="number" 
                    defaultValue="5"
                    style={{ width: '100%', padding: '5px' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {renderPanel('workOffsets',
            <div className="setup-panel">
              <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Work Coordinate Systems (G54-G59)</h3>
              
              <div className="setup-section">
                <h4>Active Work Offset</h4>
                <select 
                  value={setupConfig.workOffsets.activeOffset}
                  onChange={(e) => setSetupConfig(prev => ({
                    ...prev,
                    workOffsets: { ...prev.workOffsets, activeOffset: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '8px', marginBottom: '15px', background: '#1a1f2e', color: '#fff', border: '1px solid #00d4ff' }}
                >
                  <option value="G54">G54 - Primary Setup</option>
                  <option value="G55">G55 - Secondary Setup</option>
                  <option value="G56">G56 - Third Setup</option>
                  <option value="G57">G57 - Fourth Setup</option>
                  <option value="G58">G58 - Fifth Setup</option>
                  <option value="G59">G59 - Sixth Setup</option>
                </select>
              </div>
              
              {['G54', 'G55', 'G56', 'G57', 'G58', 'G59'].map(offset => (
                <div key={offset} className="setup-section" style={{ 
                  background: setupConfig.workOffsets.activeOffset === offset ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: setupConfig.workOffsets.activeOffset === offset ? '1px solid #00d4ff' : '1px solid #333'
                }}>
                  <h4 style={{ color: setupConfig.workOffsets.activeOffset === offset ? '#00d4ff' : '#888' }}>
                    {offset} - {setupConfig.workOffsets[offset].description}
                  </h4>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label>Description</label>
                    <input 
                      type="text" 
                      value={setupConfig.workOffsets[offset].description}
                      onChange={(e) => setSetupConfig(prev => ({
                        ...prev,
                        workOffsets: { 
                          ...prev.workOffsets,
                          [offset]: { ...prev.workOffsets[offset], description: e.target.value }
                        }
                      }))}
                      style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label>X Offset (mm)</label>
                      <input 
                        type="number" 
                        value={setupConfig.workOffsets[offset].x}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setSetupConfig(prev => ({
                            ...prev,
                            workOffsets: { 
                              ...prev.workOffsets,
                              [offset]: { ...prev.workOffsets[offset], x: value }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                    <div>
                      <label>Y Offset (mm)</label>
                      <input 
                        type="number" 
                        value={setupConfig.workOffsets[offset].y}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setSetupConfig(prev => ({
                            ...prev,
                            workOffsets: { 
                              ...prev.workOffsets,
                              [offset]: { ...prev.workOffsets[offset], y: value }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                    <div>
                      <label>Z Offset (mm)</label>
                      <input 
                        type="number" 
                        value={setupConfig.workOffsets[offset].z}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setSetupConfig(prev => ({
                            ...prev,
                            workOffsets: { 
                              ...prev.workOffsets,
                              [offset]: { ...prev.workOffsets[offset], z: value }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                  </div>
                  
                  {offset === setupConfig.workOffsets.activeOffset && (
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => {
                          // Zero current axis at machine position
                          const currentPos = simulation.position;
                          setSetupConfig(prev => ({
                            ...prev,
                            workOffsets: { 
                              ...prev.workOffsets,
                              [offset]: { 
                                ...prev.workOffsets[offset], 
                                x: currentPos.x,
                                y: currentPos.y,
                                z: currentPos.z
                              }
                            }
                          }));
                        }}
                        style={{
                          padding: '8px 15px',
                          background: '#00d4ff',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Set from Current Position
                      </button>
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: '#888' }}>
                        (Changes apply automatically to 3D view)
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="setup-section" style={{ marginTop: '20px' }}>
                <h4>Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      // Zero all offsets
                      const resetOffsets = {};
                      ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'].forEach(g => {
                        resetOffsets[g] = { x: 0, y: 0, z: 0, description: setupConfig.workOffsets[g].description };
                      });
                      setSetupConfig(prev => ({
                        ...prev,
                        workOffsets: { 
                          ...prev.workOffsets,
                          ...resetOffsets
                        }
                      }));
                    }}
                    style={{
                      padding: '10px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Zero All Offsets
                  </button>
                  <button 
                    onClick={() => {
                      // Copy active offset to clipboard
                      const offset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
                      const text = `${setupConfig.workOffsets.activeOffset}: X${offset.x} Y${offset.y} Z${offset.z}`;
                      navigator.clipboard.writeText(text);
                    }}
                    style={{
                      padding: '10px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy Active Offset
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {renderPanel('toolDatabase',
            <RealToolSystem 
              onToolAssemblyChange={(assembly) => {
                console.log('Tool assembly updated:', assembly);
                // Update simulation with new tool assembly
                setSimulation(prev => ({
                  ...prev,
                  toolAssembly: assembly,
                  currentToolLength: assembly.totalLength
                }));
                
                // Update tool offset table with new length
                if (assembly.tool && simulation.activeHCode > 0) {
                  const newTable = { ...toolOffsetTable };
                  newTable.H[simulation.activeHCode].lengthGeometry = assembly.totalLength;
                  setToolOffsetTable(newTable);
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