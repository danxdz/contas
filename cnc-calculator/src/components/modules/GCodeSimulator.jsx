import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './GCodeSimulator.css';

// Custom OrbitControls implementation (commented out - using Three.js version)
/*
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3();
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    
    this.rotateSpeed = 0.005;
    this.zoomSpeed = 1;
    this.panSpeed = 0.5;
    
    this.mouseButtons = {
      LEFT: 0,
      MIDDLE: 1,
      RIGHT: 2
    };
    
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    this.panOffset = new THREE.Vector3();
    
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    
    this.state = 0; // 0: none, 1: rotate, 2: pan, 3: zoom
    
    this.init();
  }
  
  init() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  onMouseDown(event) {
    event.preventDefault();
    
    if (event.button === this.mouseButtons.LEFT) {
      this.state = 1; // rotate
      this.rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === this.mouseButtons.RIGHT) {
      this.state = 2; // pan
      this.rotateStart.set(event.clientX, event.clientY);
    }
    
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
  }
  
  onMouseMove(event) {
    event.preventDefault();
    
    if (this.state === 1) {
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      
      this.sphericalDelta.theta -= this.rotateDelta.x * this.rotateSpeed;
      this.sphericalDelta.phi -= this.rotateDelta.y * this.rotateSpeed;
      
      this.rotateStart.copy(this.rotateEnd);
    } else if (this.state === 2) {
      const deltaX = event.clientX - this.rotateStart.x;
      const deltaY = event.clientY - this.rotateStart.y;
      
      this.panOffset.x -= deltaX * this.panSpeed;
      this.panOffset.y += deltaY * this.panSpeed;
      
      this.rotateStart.set(event.clientX, event.clientY);
    }
  }
  
  onMouseUp() {
    this.state = 0;
    this.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.domElement.removeEventListener('mouseup', this.onMouseUp);
  }
  
  onMouseWheel(event) {
    event.preventDefault();
    
    if (event.deltaY < 0) {
      this.spherical.radius *= 0.9;
    } else {
      this.spherical.radius *= 1.1;
    }
  }
  
  update() {
    const offset = new THREE.Vector3();
    const position = this.camera.position;
    
    offset.copy(position).sub(this.target);
    this.spherical.setFromVector3(offset);
    
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    
    this.spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.spherical.phi));
    
    offset.setFromSpherical(this.spherical);
    
    position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    
    this.target.add(this.panOffset);
    position.add(this.panOffset);
    
    if (this.enableDamping) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);
      this.panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.panOffset.set(0, 0, 0);
    }
  }
}
*/

// Enhanced G-Code Simulator with full Tool Database integration
const GCodeSimulator = () => {
  // Core states
  const [gcode, setGcode] = useState(`; Sample G-Code Program
G21 ; Metric units
G90 ; Absolute positioning
G17 ; XY plane
G00 Z5 ; Rapid to safe height
G00 X0 Y0 ; Move to origin
M03 S12000 ; Spindle on
G00 X10 Y10 ; Position
G01 Z-2 F100 ; Plunge
G01 X50 Y10 F300 ; Cut
G01 X50 Y50 ; Cut
G01 X10 Y50 ; Cut
G01 X10 Y10 ; Cut
G00 Z5 ; Retract
M05 ; Spindle off
M30 ; Program end`);
  const [parsedProgram, setParsedProgram] = useState(null);
  const [simulationMode, setSimulationMode] = useState('3D'); // 2D, 3D, or Split
  
  // Panel states for collapsing
  const [panelStates, setPanelStates] = useState({
    toolPanel: window.innerWidth > 968,
    infoPanel: window.innerWidth > 968
  });
  
  // Tool Database Integration
  const [toolDatabase, setToolDatabase] = useState(() => {
    const saved = localStorage.getItem('toolDatabase');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeTools, setActiveTools] = useState({}); // T1, T2, etc.
  const [currentTool, setCurrentTool] = useState(null);
  
  // Machine State
  const [machineState, setMachineState] = useState({
    position: { x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
    feedRate: 0,
    spindleSpeed: 0,
    spindleOn: false,
    coolant: 'off', // off, flood, mist, through
    units: 'mm', // mm or inch
    absolute: true, // G90/G91
    plane: 'XY', // G17/G18/G19
    compensation: 'none', // G40/G41/G42
    workOffset: 'G54',
    toolOffset: { length: 0, radius: 0 }
  });
  
  // Simulation Control
  const [simulation, setSimulation] = useState({
    isRunning: false,
    isPaused: false,
    currentLine: 0,
    speed: 1.0, // Simulation speed multiplier
    showToolpath: true,
    showTool: true,
    showWorkpiece: true,
    showFixture: true,
    showChips: true,
    showCoolant: true,
    materialRemoval: true,
    collisionDetection: true
  });
  
  // Material & Cutting
  const [workpiece, setWorkpiece] = useState({
    type: 'block', // block, cylinder, custom
    material: 'aluminum',
    dimensions: { x: 100, y: 80, z: 30 },
    position: { x: 0, y: 0, z: 0 },
    color: 0xc0c0c0,
    removed: [] // Track removed material
  });
  
  // Fixture Management
  const [fixture, setFixture] = useState({
    type: 'vise', // vise, chuck, fixture-plate, custom
    specs: {
      jawOpening: 150,
      jawHeight: 50,
      clampForce: 30
    },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  });
  
  const [fixtureLibrary, setFixtureLibrary] = useState(() => {
    const saved = localStorage.getItem('fixtureLibrary');
    return saved ? JSON.parse(saved) : {
      'kurt-vise-6': {
        id: 'kurt-vise-6',
        name: 'Kurt Vise 6"',
        type: 'vise',
        specs: {
          jawWidth: 150,
          jawHeight: 50,
          jawOpening: 200,
          clampForce: 30
        }
      },
      '3jaw-chuck-200': {
        id: '3jaw-chuck-200',
        name: '3-Jaw Chuck 200mm',
        type: 'chuck',
        specs: {
          size: 200,
          jawCount: 3,
          throughHole: 52,
          maxGrip: 50
        }
      },
      'fixture-plate-300': {
        id: 'fixture-plate-300',
        name: 'Fixture Plate 300x300',
        type: 'plate',
        specs: {
          width: 300,
          depth: 300,
          thickness: 25,
          holePattern: 'M12x50mm'
        }
      }
    };
  });
  
  const [cuttingData, setCuttingData] = useState({
    chipLoad: 0,
    materialRemovalRate: 0,
    cuttingForce: 0,
    power: 0,
    toolWear: 0,
    surfaceFinish: 0
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
  const animationRef = useRef(null);
  
  // Editor refs
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  
  // Parse initial G-code on mount
  useEffect(() => {
    if (gcode && !parsedProgram) {
      const parsed = parseGCode(gcode);
      setParsedProgram(parsed);
    }
  }, []);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 100, 1000);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(200, 150, 200);
    camera.up.set(0, 0, 1); // Z-up for CNC
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Professional OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true; // Pan parallel to screen
    controls.minDistance = 20;
    controls.maxDistance = 800;
    controls.maxPolarAngle = Math.PI * 0.9; // Prevent going under ground
    controls.target.set(0, 0, 0);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controlsRef.current = controls;
    
    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(100, 100, 100);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 0.1;
    directionalLight1.shadow.camera.far = 500;
    directionalLight1.shadow.camera.left = -200;
    directionalLight1.shadow.camera.right = 200;
    directionalLight1.shadow.camera.top = 200;
    directionalLight1.shadow.camera.bottom = -200;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-100, -100, 50);
    scene.add(directionalLight2);
    
    // Add hemisphere light for better ambient
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.5);
    scene.add(hemisphereLight);
    
    // Add point light for tool area
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);
    
    // Add grid and axes
    addSceneHelpers();
    
    // Add machine table
    addMachineTable();
    
    // Add fixture
    addFixture();
    
    // Add initial workpiece
    addWorkpiece();
    
    // Create initial tool
    createInitialTool();
    
    // Parse initial G-code if available
    const initialParsed = parseGCode(gcode);
    setParsedProgram(initialParsed);
    if (initialParsed && initialParsed.commands) {
      drawToolpath(initialParsed);
    }
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      
      // Auto-collapse panels on small screens
      if (window.innerWidth <= 968) {
        setPanelStates({ toolPanel: false, infoPanel: false });
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Handle panel state changes - resize viewport
  useEffect(() => {
    if (!rendererRef.current || !mountRef.current || !cameraRef.current) return;
    
    // Wait for CSS transition to complete
    const timer = setTimeout(() => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    }, 300); // Match CSS transition duration
    
    return () => clearTimeout(timer);
  }, [panelStates]);
  
  // Handle simulation updates
  useEffect(() => {
    if (!simulation.isRunning || simulation.isPaused) return;
    
    const interval = setInterval(() => {
      updateSimulation();
      setSimulation(prev => ({
        ...prev,
        currentLine: Math.min(prev.currentLine + 1, parsedProgram?.lines?.length || 0)
      }));
    }, 100 / simulation.speed); // Adjust speed
    
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.isPaused, simulation.speed, simulation.currentLine]);
  
  // Auto-scroll to current line
  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current && simulation.currentLine >= 0) {
      // Use exact line height from CSS (1.4em at 11px = 15.4px)
      const lineHeight = 15.4; // 1.4em * 11px
      const containerHeight = textareaRef.current.clientHeight;
      
      // Calculate scroll position to center the current line
      const targetScroll = (simulation.currentLine * lineHeight) - (containerHeight / 2) + (lineHeight / 2);
      
      // Apply scroll with bounds checking
      const finalScroll = Math.max(0, Math.min(targetScroll, textareaRef.current.scrollHeight - containerHeight));
      
      // Sync both elements
      textareaRef.current.scrollTop = finalScroll;
      lineNumbersRef.current.scrollTop = finalScroll;
    }
  }, [simulation.currentLine]);
  
  // Add scene helpers (grid, axes)
  const addSceneHelpers = () => {
    if (!sceneRef.current) return;
    
    // Grid
    const gridHelper = new THREE.GridHelper(400, 40, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
    sceneRef.current.add(gridHelper);
    
    // Axes
    const axesHelper = new THREE.AxesHelper(100);
    sceneRef.current.add(axesHelper);
    
    // Axis labels
    const addLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      context.font = 'Bold 48px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.fillText(text, 32, 48);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(10, 10, 1);
      sceneRef.current.add(sprite);
    };
    
    addLabel('X', new THREE.Vector3(110, 0, 0), '#ff0000');
    addLabel('Y', new THREE.Vector3(0, 110, 0), '#00ff00');
    addLabel('Z', new THREE.Vector3(0, 0, 110), '#0000ff');
  };
  
  // Add machine table
  const addMachineTable = () => {
    if (!sceneRef.current) return;
    
    // Table
    const tableGeometry = new THREE.BoxGeometry(500, 400, 20);
    const tableMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x404040,
      metalness: 0.8,
      roughness: 0.2
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.z = -20;
    table.receiveShadow = true;
    table.name = 'table';
    sceneRef.current.add(table);
    
    // T-slots
    for (let i = -3; i <= 3; i++) {
      const slotGeometry = new THREE.BoxGeometry(500, 3, 5);
      const slotMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
      const slot = new THREE.Mesh(slotGeometry, slotMaterial);
      slot.position.set(0, i * 50, -8);
      slot.name = 'table';
      sceneRef.current.add(slot);
    }
  };
  
  // Add fixture to scene
  const addFixture = () => {
    if (!sceneRef.current) return;
    
    // Remove old fixture
    const oldFixtures = [];
    sceneRef.current.traverse(child => {
      if (child.name === 'fixture') {
        oldFixtures.push(child);
      }
    });
    oldFixtures.forEach(child => sceneRef.current.remove(child));
    
    const fixtureGroup = new THREE.Group();
    fixtureGroup.name = 'fixture';
    
    switch (fixture.type) {
      case 'vise':
        // Fixed jaw
        const fixedJawGeometry = new THREE.BoxGeometry(
          fixture.specs.jawWidth || 150,
          15,
          fixture.specs.jawHeight || 50
        );
        const viseMaterial = new THREE.MeshPhongMaterial({
          color: 0x4444ff,
          metalness: 0.8,
          roughness: 0.2
        });
        const fixedJaw = new THREE.Mesh(fixedJawGeometry, viseMaterial);
        fixedJaw.position.set(0, -30, 25);
        fixtureGroup.add(fixedJaw);
        
        // Movable jaw
        const movableJawGeometry = new THREE.BoxGeometry(
          fixture.specs.jawWidth || 150,
          12,
          fixture.specs.jawHeight || 50
        );
        const movableJaw = new THREE.Mesh(movableJawGeometry, viseMaterial);
        movableJaw.position.set(0, 30, 25);
        fixtureGroup.add(movableJaw);
        
        // Vise base
        const baseGeometry = new THREE.BoxGeometry(
          (fixture.specs.jawWidth || 150) + 40,
          80,
          10
        );
        const baseMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 0, 5);
        fixtureGroup.add(base);
        break;
        
      case 'chuck':
        // Chuck body
        const chuckRadius = (fixture.specs.size || 200) / 2;
        const chuckGeometry = new THREE.CylinderGeometry(
          chuckRadius,
          chuckRadius * 1.2,
          30,
          32
        );
        const chuckMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          metalness: 0.8,
          roughness: 0.2
        });
        const chuck = new THREE.Mesh(chuckGeometry, chuckMaterial);
        chuck.rotation.x = Math.PI / 2;
        fixtureGroup.add(chuck);
        
        // Chuck jaws
        const jawCount = fixture.specs.jawCount || 3;
        for (let i = 0; i < jawCount; i++) {
          const angle = (i * 360 / jawCount) * Math.PI / 180;
          const jawGeometry = new THREE.BoxGeometry(10, 15, 30);
          const jawMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
          const jaw = new THREE.Mesh(jawGeometry, jawMaterial);
          jaw.position.set(
            Math.cos(angle) * (chuckRadius - 10),
            Math.sin(angle) * (chuckRadius - 10),
            0
          );
          jaw.rotation.z = angle;
          fixtureGroup.add(jaw);
        }
        break;
        
      case 'plate':
        // Fixture plate
        const plateGeometry = new THREE.BoxGeometry(
          fixture.specs.width || 300,
          fixture.specs.depth || 300,
          fixture.specs.thickness || 25
        );
        const plateMaterial = new THREE.MeshPhongMaterial({
          color: 0x888888,
          metalness: 0.7,
          roughness: 0.3
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.z = (fixture.specs.thickness || 25) / 2;
        fixtureGroup.add(plate);
        
        // Add hole pattern visualization
        const holeRadius = 3;
        const holeSpacing = 50;
        for (let x = -2; x <= 2; x++) {
          for (let y = -2; y <= 2; y++) {
            const holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, fixture.specs.thickness || 25, 16);
            const holeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.set(x * holeSpacing, y * holeSpacing, (fixture.specs.thickness || 25) / 2);
            hole.rotation.x = Math.PI / 2;
            fixtureGroup.add(hole);
          }
        }
        break;
    }
    
    // Apply position and rotation
    fixtureGroup.position.set(
      fixture.position.x,
      fixture.position.y,
      fixture.position.z
    );
    fixtureGroup.rotation.set(
      fixture.rotation.x,
      fixture.rotation.y,
      fixture.rotation.z
    );
    
    sceneRef.current.add(fixtureGroup);
  };
  
  // Add workpiece
  const addWorkpiece = () => {
    if (!sceneRef.current) return;
    
    // Remove old workpiece
    if (workpieceRef.current) {
      sceneRef.current.remove(workpieceRef.current);
    }
    
    let geometry;
    if (workpiece.type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(
        workpiece.dimensions.x / 2,
        workpiece.dimensions.x / 2,
        workpiece.dimensions.z,
        32
      );
    } else {
      geometry = new THREE.BoxGeometry(
        workpiece.dimensions.x,
        workpiece.dimensions.y,
        workpiece.dimensions.z
      );
    }
    
    const material = new THREE.MeshPhongMaterial({ 
      color: workpiece.color,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      workpiece.position.x,
      workpiece.position.y,
      workpiece.position.z + workpiece.dimensions.z / 2
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    workpieceRef.current = mesh;
    sceneRef.current.add(mesh);
  };
  
  // Create initial tool
  const createInitialTool = () => {
    if (!sceneRef.current) return;
    
    // Remove old tool if exists
    if (toolRef.current) {
      sceneRef.current.remove(toolRef.current);
    }
    
    const toolGroup = new THREE.Group();
    
    // Default end mill
    const toolGeometry = new THREE.CylinderGeometry(3, 3, 30, 16);
    const toolMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotation.x = Math.PI / 2; // Align with Z axis
    toolGroup.add(tool);
    
    // Tool holder
    const holderGeometry = new THREE.CylinderGeometry(5, 5, 20, 16);
    const holderMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotation.x = Math.PI / 2;
    holder.position.z = 25;
    toolGroup.add(holder);
    
    // Position at origin
    toolGroup.position.set(0, 0, 20);
    
    sceneRef.current.add(toolGroup);
    toolRef.current = toolGroup;
  };
  
  // Create tool from database
  const createToolFromDatabase = (toolData) => {
    if (!sceneRef.current || !toolData) return;
    
    // Remove old tool
    if (toolRef.current) {
      sceneRef.current.remove(toolRef.current);
    }
    
    const toolGroup = new THREE.Group();
    
    // Tool geometry based on type
    let toolGeometry;
    const diameter = toolData.diameter || 10;
    const length = toolData.length || 50;
    
    switch (toolData.type) {
      case 'endmill':
      case 'ballnose':
        // Cutting part
        toolGeometry = toolData.type === 'ballnose'
          ? new THREE.SphereGeometry(diameter / 2, 16, 16)
          : new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16);
        break;
        
      case 'drill':
        // Drill with point
        toolGeometry = new THREE.ConeGeometry(diameter / 2, length * 0.3, 16);
        break;
        
      case 'chamfer':
        // Chamfer mill
        toolGeometry = new THREE.ConeGeometry(diameter / 2, length, 16);
        break;
        
      default:
        toolGeometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16);
    }
    
    // Tool material with coating color
    const toolColor = toolData.coating === 'TiN' ? 0xffd700 :
                     toolData.coating === 'TiAlN' ? 0x9370db :
                     toolData.coating === 'DLC' ? 0x2f4f4f :
                     0xc0c0c0; // Uncoated
    
    const toolMaterial = new THREE.MeshPhongMaterial({ 
      color: toolColor,
      metalness: 0.9,
      roughness: 0.1,
      emissive: toolColor,
      emissiveIntensity: 0.1
    });
    
    const toolMesh = new THREE.Mesh(toolGeometry, toolMaterial);
    toolMesh.rotation.x = -Math.PI / 2;
    toolMesh.position.z = length / 2;
    toolGroup.add(toolMesh);
    
    // Add shank
    const shankGeometry = new THREE.CylinderGeometry(
      (toolData.shankDiameter || diameter) / 2,
      (toolData.shankDiameter || diameter) / 2,
      30,
      16
    );
    const shankMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const shank = new THREE.Mesh(shankGeometry, shankMaterial);
    shank.rotation.x = -Math.PI / 2;
    shank.position.z = length + 15;
    toolGroup.add(shank);
    
    // Add holder
    const holderGeometry = new THREE.CylinderGeometry(15, 20, 40, 16);
    const holderMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotation.x = -Math.PI / 2;
    holder.position.z = length + 40;
    toolGroup.add(holder);
    
    // Add flutes visualization for end mills
    if (toolData.type === 'endmill' && toolData.flutes) {
      for (let i = 0; i < toolData.flutes; i++) {
        const angle = (i * 2 * Math.PI) / toolData.flutes;
        const fluteGeometry = new THREE.BoxGeometry(1, diameter * 0.8, length * 0.8);
        const fluteMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x222222,
          opacity: 0.3,
          transparent: true
        });
        const flute = new THREE.Mesh(fluteGeometry, fluteMaterial);
        flute.rotation.x = -Math.PI / 2;
        flute.rotation.z = angle;
        flute.position.z = length / 2;
        toolGroup.add(flute);
      }
    }
    
    toolRef.current = toolGroup;
    sceneRef.current.add(toolGroup);
    
    return toolGroup;
  };
  
  // Parse G-Code
  const parseGCode = (code) => {
    const lines = code.split('\n');
    const program = {
      lines: [],
      commands: [],
      tools: {},
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
      estimatedTime: 0
    };
    
    let currentPos = { x: 0, y: 0, z: 0, a: 0, b: 0 };
    let currentFeed = 0;
    let currentSpeed = 0;
    let currentTool = null;
    
    lines.forEach((line, index) => {
      // Remove comments and trim
      const cleanLine = line.split(/[;(]/)[0].trim();
      if (!cleanLine) return;
      
      const command = {
        line: index + 1,
        raw: line,
        type: null,
        params: {},
        startPos: { ...currentPos },
        endPos: { ...currentPos },
        feed: currentFeed,
        speed: currentSpeed,
        tool: currentTool
      };
      
      // Parse command codes
      const codes = cleanLine.match(/[A-Z][-+]?\d*\.?\d*/gi) || [];
      codes.forEach(code => {
        const letter = code[0].toUpperCase();
        const value = parseFloat(code.substring(1));
        command.params[letter] = value;
      });
      
      // Process G-codes
      if (command.params.G !== undefined) {
        const g = Math.floor(command.params.G);
        switch (g) {
          case 0: // Rapid
          case 1: // Linear
            command.type = g === 0 ? 'rapid' : 'feed';
            ['X', 'Y', 'Z', 'A', 'B'].forEach(axis => {
              if (command.params[axis] !== undefined) {
                command.endPos[axis.toLowerCase()] = command.params[axis];
                currentPos[axis.toLowerCase()] = command.params[axis];
              }
            });
            if (command.params.F !== undefined) {
              currentFeed = command.params.F;
              command.feed = currentFeed;
            }
            break;
            
          case 2: // CW Arc
          case 3: // CCW Arc
            command.type = g === 2 ? 'arc_cw' : 'arc_ccw';
            command.center = {
              x: currentPos.x + (command.params.I || 0),
              y: currentPos.y + (command.params.J || 0)
            };
            ['X', 'Y', 'Z'].forEach(axis => {
              if (command.params[axis] !== undefined) {
                command.endPos[axis.toLowerCase()] = command.params[axis];
                currentPos[axis.toLowerCase()] = command.params[axis];
              }
            });
            break;
        }
      }
      
      // Process M-codes
      if (command.params.M !== undefined) {
        const m = Math.floor(command.params.M);
        switch (m) {
          case 3: // Spindle CW
          case 4: // Spindle CCW
            command.type = 'spindle_on';
            if (command.params.S !== undefined) {
              currentSpeed = command.params.S;
              command.speed = currentSpeed;
            }
            break;
          case 5: // Spindle off
            command.type = 'spindle_off';
            break;
          case 6: // Tool change
            command.type = 'tool_change';
            if (command.params.T !== undefined) {
              currentTool = `T${command.params.T}`;
              command.tool = currentTool;
            }
            break;
          case 8: // Coolant on
            command.type = 'coolant_on';
            break;
          case 9: // Coolant off
            command.type = 'coolant_off';
            break;
        }
      }
      
      // Update bounds
      ['x', 'y', 'z'].forEach(axis => {
        const key = axis.toUpperCase();
        program.bounds[`min${key}`] = Math.min(program.bounds[`min${key}`], command.endPos[axis]);
        program.bounds[`max${key}`] = Math.max(program.bounds[`max${key}`], command.endPos[axis]);
      });
      
      // Estimate time
      if (command.type === 'feed' && command.feed > 0) {
        const distance = Math.sqrt(
          Math.pow(command.endPos.x - command.startPos.x, 2) +
          Math.pow(command.endPos.y - command.startPos.y, 2) +
          Math.pow(command.endPos.z - command.startPos.z, 2)
        );
        program.estimatedTime += (distance / command.feed) * 60; // seconds
      }
      
      program.lines.push(command);
      
      // Add to commands array if it's a movement command
      if (command.type && (command.type === 'rapid' || command.type === 'feed')) {
        program.commands.push({
          type: command.params.G === 0 ? 'G00' : 'G01',
          startPos: command.startPos,
          endPos: command.endPos,
          feed: command.feed
        });
      }
    });
    
    return program;
  };
  
  // Update simulation
  const updateSimulation = () => {
    if (!parsedProgram || simulation.currentLine >= parsedProgram.lines.length) {
      setSimulation(prev => ({ ...prev, isRunning: false }));
      return;
    }
    
    // Update tool position
    if (toolRef.current && parsedProgram.commands && parsedProgram.commands.length > 0) {
      const progress = simulation.currentLine / Math.max(1, parsedProgram.lines.length - 1);
      const commandIndex = Math.floor(progress * parsedProgram.commands.length);
      const command = parsedProgram.commands[Math.min(commandIndex, parsedProgram.commands.length - 1)];
      
      if (command && command.endPos) {
        toolRef.current.position.set(
          command.endPos.x,
          command.endPos.y,
          command.endPos.z + 20 // Tool offset
        );
      }
    }
    
    const command = parsedProgram.lines[simulation.currentLine];
    
    // Material removal simulation
    if (simulation.materialRemoval && command.type === 'feed') {
      simulateMaterialRemoval(command);
    }
    
    // Update cutting data
    updateCuttingData(command);
    
    // Draw toolpath
    drawToolpath(command);
    
    // Check if command complete
    const tolerance = 0.1;
    if (toolRef.current &&
        Math.abs(toolRef.current.position.x - command.endPos.x) < tolerance &&
        Math.abs(toolRef.current.position.y - command.endPos.y) < tolerance &&
        Math.abs(toolRef.current.position.z - command.endPos.z) < tolerance) {
      setSimulation(prev => ({ ...prev, currentLine: prev.currentLine + 1 }));
    }
  };
  
  // Simulate material removal
  const simulateMaterialRemoval = (command) => {
    // This would implement actual material removal visualization
    // For now, just track removed volume
    if (workpieceRef.current && currentTool) {
      const toolData = activeTools[currentTool];
      if (toolData) {
        const removalVolume = toolData.diameter * 
          (command.feed / 60) * 
          (toolData.diameter * 0.5); // Simplified calculation
        
        setWorkpiece(prev => ({
          ...prev,
          removed: [...prev.removed, { 
            position: command.endPos,
            volume: removalVolume 
          }]
        }));
      }
    }
  };
  
  // Update cutting data
  const updateCuttingData = (command) => {
    if (!currentTool || !activeTools[currentTool]) return;
    
    const tool = activeTools[currentTool];
    const feed = command.feed || 0;
    const speed = command.speed || 0;
    
    // Calculate cutting parameters
    const chipLoad = tool.flutes ? feed / (speed * tool.flutes) : 0;
    const mrr = (tool.diameter * tool.diameter * Math.PI / 4) * feed / 1000; // cm³/min
    const power = mrr * 2.5; // Simplified power calculation (kW)
    
    setCuttingData({
      chipLoad: chipLoad.toFixed(4),
      materialRemovalRate: mrr.toFixed(2),
      cuttingForce: (power * 60).toFixed(0),
      power: power.toFixed(2),
      toolWear: Math.min(100, (simulation.currentLine / parsedProgram.lines.length) * 100),
      surfaceFinish: (chipLoad * 1000).toFixed(1)
    });
  };
  
  // Draw full toolpath
  const drawToolpath = (parsedProgram) => {
    if (!sceneRef.current || !parsedProgram || !parsedProgram.commands) return;
    
    // Remove old toolpath
    if (toolpathRef.current) {
      sceneRef.current.remove(toolpathRef.current);
    }
    
    const toolpathGroup = new THREE.Group();
    
    parsedProgram.commands.forEach(command => {
      if (command.startPos && command.endPos) {
        const material = new THREE.LineBasicMaterial({ 
          color: command.type === 'G00' ? 0xff0000 : 0x00ff00,
          linewidth: 2
        });
        
        const points = [
          new THREE.Vector3(command.startPos.x, command.startPos.y, command.startPos.z),
          new THREE.Vector3(command.endPos.x, command.endPos.y, command.endPos.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        toolpathGroup.add(line);
      }
    });
    
    sceneRef.current.add(toolpathGroup);
    toolpathRef.current = toolpathGroup;
  };
  
  // Tool selection from database
  const selectToolFromDatabase = (toolId) => {
    const tool = toolDatabase[toolId];
    if (tool) {
      const toolNumber = prompt('Enter tool number (T1, T2, etc.):', 'T1');
      if (toolNumber) {
        setActiveTools(prev => ({
          ...prev,
          [toolNumber]: tool
        }));
        setCurrentTool(toolNumber);
        createToolFromDatabase(tool);
      }
    }
  };
  
  // Load G-Code file
  const loadGCodeFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGcode(e.target.result);
        const parsed = parseGCode(e.target.result);
        setParsedProgram(parsed);
      };
      reader.readAsText(file);
    }
  };
  
  // Verify G-Code
  const verifyGCode = () => {
    const errors = [];
    const warnings = [];
    const lines = gcode.split('\n');
    
    let hasSpindleOn = false;
    let hasCoolant = false;
    let currentZ = 0;
    let rapidInMaterial = false;
    
    lines.forEach((line, index) => {
      const cleanLine = line.split(/[;(]/)[0].trim();
      if (!cleanLine) return;
      
      // Check for spindle on before cutting
      if (cleanLine.includes('M03') || cleanLine.includes('M04')) {
        hasSpindleOn = true;
      }
      
      // Check for coolant
      if (cleanLine.includes('M08')) {
        hasCoolant = true;
      }
      
      // Check for G01/G02/G03 without spindle on
      if ((cleanLine.includes('G01') || cleanLine.includes('G02') || cleanLine.includes('G03')) && !hasSpindleOn) {
        errors.push(`Line ${index + 1}: Cutting move without spindle on`);
      }
      
      // Check for rapid moves below Z0
      if (cleanLine.includes('G00')) {
        const zMatch = cleanLine.match(/Z([-\d.]+)/);
        if (zMatch && parseFloat(zMatch[1]) < 0) {
          warnings.push(`Line ${index + 1}: Rapid move below Z0 - verify clearance`);
        }
      }
      
      // Check for missing feedrate
      if (cleanLine.includes('G01') && !cleanLine.includes('F') && index > 0) {
        const prevHasFeed = lines.slice(0, index).some(l => l.includes('F'));
        if (!prevHasFeed) {
          errors.push(`Line ${index + 1}: Feed move without feedrate`);
        }
      }
    });
    
    // Program-level checks
    if (!hasSpindleOn) {
      warnings.push('No spindle start command (M03/M04) found');
    }
    
    if (!hasCoolant) {
      warnings.push('No coolant command (M08) found - verify if needed');
    }
    
    // Update error state
    setErrors(errors.length > 0 ? errors : warnings.length > 0 ? warnings : ['✓ G-Code verified successfully']);
    
    // Show alert with results
    if (errors.length > 0) {
      alert(`Verification Failed!\n\nErrors:\n${errors.join('\n')}`);
    } else if (warnings.length > 0) {
      alert(`Verification Complete with Warnings:\n\n${warnings.join('\n')}`);
    } else {
      alert('✓ G-Code verified successfully! No issues found.');
    }
  };
  
  // Optimize G-Code
  const optimizeGCode = () => {
    const lines = gcode.split('\n');
    const optimized = [];
    let lastG = null;
    let lastF = null;
    let lastS = null;
    let changes = 0;
    
    lines.forEach((line, index) => {
      let optimizedLine = line;
      const cleanLine = line.split(/[;(]/)[0].trim();
      
      if (cleanLine) {
        // Remove redundant G commands
        if (cleanLine.includes('G00') || cleanLine.includes('G01')) {
          const g = cleanLine.includes('G00') ? 'G00' : 'G01';
          if (g === lastG && index > 0) {
            optimizedLine = optimizedLine.replace(g + ' ', '').replace(g, '');
            changes++;
          }
          lastG = g;
        }
        
        // Remove redundant F commands
        const fMatch = cleanLine.match(/F([\d.]+)/);
        if (fMatch) {
          if (fMatch[1] === lastF) {
            optimizedLine = optimizedLine.replace(/F[\d.]+\s?/, '');
            changes++;
          }
          lastF = fMatch[1];
        }
        
        // Remove redundant S commands
        const sMatch = cleanLine.match(/S([\d.]+)/);
        if (sMatch) {
          if (sMatch[1] === lastS) {
            optimizedLine = optimizedLine.replace(/S[\d.]+\s?/, '');
            changes++;
          }
          lastS = sMatch[1];
        }
        
        // Remove trailing spaces
        optimizedLine = optimizedLine.trimEnd();
      }
      
      optimized.push(optimizedLine);
    });
    
    // Remove empty lines at end
    while (optimized.length > 0 && optimized[optimized.length - 1].trim() === '') {
      optimized.pop();
      changes++;
    }
    
    setGcode(optimized.join('\n'));
    setParsedProgram(parseGCode(optimized.join('\n')));
    
    alert(`✓ Optimization complete!\n\n${changes} redundant commands removed.\nProgram size reduced by ${((gcode.length - optimized.join('\n').length) / gcode.length * 100).toFixed(1)}%`);
  };
  
  // Control functions
  const startSimulation = () => {
    if (!parsedProgram) {
      const parsed = parseGCode(gcode);
      setParsedProgram(parsed);
      if (parsed && parsed.commands) {
        drawToolpath(parsed);
      }
    }
    setSimulation(prev => ({ ...prev, isRunning: true, isPaused: false }));
  };
  
  const pauseSimulation = () => {
    setSimulation(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };
  
  const stopSimulation = () => {
    setSimulation(prev => ({ 
      ...prev, 
      isRunning: false, 
      isPaused: false, 
      currentLine: 0 
    }));
    // Reset tool position
    if (toolRef.current) {
      toolRef.current.position.set(0, 0, 20);
    }
  };
  
  const resetSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentLine: 0
    }));
    // Reset tool to origin
    if (toolRef.current) {
      toolRef.current.position.set(0, 0, 20);
    }
  };
  
  const stepForward = () => {
    // Parse G-code if not already parsed
    let program = parsedProgram;
    if (!program && gcode) {
      program = parseGCode(gcode);
      setParsedProgram(program);
      if (program && program.commands) {
        drawToolpath(program);
      }
    }
    
    if (program && simulation.currentLine < program.lines.length - 1) {
      const nextLine = simulation.currentLine + 1;
      setSimulation(prev => ({
        ...prev,
        currentLine: nextLine
      }));
      
      // Update tool position for this step
      if (toolRef.current && program.commands && program.commands.length > 0) {
        const progress = nextLine / Math.max(1, program.lines.length - 1);
        const commandIndex = Math.floor(progress * program.commands.length);
        const command = program.commands[Math.min(commandIndex, program.commands.length - 1)];
        
        if (command && command.endPos) {
          toolRef.current.position.set(
            command.endPos.x,
            command.endPos.y,
            command.endPos.z + 20 // Tool offset
          );
        }
      }
    }
  };
  
  const stepBackward = () => {
    // Parse G-code if not already parsed
    let program = parsedProgram;
    if (!program && gcode) {
      program = parseGCode(gcode);
      setParsedProgram(program);
      if (program && program.commands) {
        drawToolpath(program);
      }
    }
    
    if (simulation.currentLine > 0) {
      const prevLine = simulation.currentLine - 1;
      setSimulation(prev => ({
        ...prev,
        currentLine: prevLine
      }));
      
      // Update tool position for this step
      if (toolRef.current && program.commands && program.commands.length > 0) {
        const progress = prevLine / Math.max(1, program.lines.length - 1);
        const commandIndex = Math.floor(progress * program.commands.length);
        const command = program.commands[Math.min(commandIndex, program.commands.length - 1)];
        
        if (command && command.endPos) {
          toolRef.current.position.set(
            command.endPos.x,
            command.endPos.y,
            command.endPos.z + 20 // Tool offset
          );
        } else if (prevLine === 0) {
          // Return to origin
          toolRef.current.position.set(0, 0, 20);
        }
      }
    }
  };
  
  const resetView = () => {
    // Reset camera to default position
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(200, 150, 200);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      const toRemove = [];
      sceneRef.current.traverse(child => {
        if (child instanceof THREE.Line) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(child => sceneRef.current.remove(child));
    }
    // Reset workpiece
    addWorkpiece();
  };

  return (
    <div className="gcode-simulator">
      <div className="simulator-header">
        <h2>Advanced G-Code Simulator</h2>
        <div className="header-controls">
          <label className="file-input-label">
            📁 Load G-Code
            <input
              type="file"
              accept=".nc,.gcode,.txt"
              onChange={loadGCodeFile}
              style={{ display: 'none' }}
            />
          </label>
          <select
            value={simulationMode}
            onChange={(e) => setSimulationMode(e.target.value)}
            className="mode-selector"
          >
            <option value="2D">2D View</option>
            <option value="3D">3D View</option>
            <option value="Split">Split View</option>
          </select>
        </div>
      </div>

      <div className="simulator-layout">
        {/* Tool & Fixture Panel */}
        <div className={`tool-panel ${!panelStates.toolPanel ? 'collapsed' : ''}`}>
          <button 
            className="panel-toggle"
            onClick={() => {
              setPanelStates(prev => ({ ...prev, toolPanel: !prev.toolPanel }));
              // Trigger resize after panel animation
              setTimeout(() => {
                if (rendererRef.current && mountRef.current) {
                  const width = mountRef.current.clientWidth;
                  const height = mountRef.current.clientHeight;
                  rendererRef.current.setSize(width, height);
                  if (cameraRef.current) {
                    cameraRef.current.aspect = width / height;
                    cameraRef.current.updateProjectionMatrix();
                  }
                }
              }, 300);
            }}
            title={panelStates.toolPanel ? 'Collapse' : 'Expand'}
          >
            {panelStates.toolPanel ? '◀' : '▶'}
          </button>
          <h3>Setup</h3>
          
          {/* Fixture Section */}
          <div className="fixture-section">
            <h4>Fixture Setup</h4>
            <div className="fixture-selector">
              <select
                value={fixture.type}
                onChange={(e) => {
                  setFixture(prev => ({ ...prev, type: e.target.value }));
                  setTimeout(() => addFixture(), 100);
                }}
                className="fixture-select"
              >
                <option value="vise">Vise</option>
                <option value="chuck">Chuck</option>
                <option value="plate">Fixture Plate</option>
              </select>
            </div>
            
            <div className="fixture-library">
              <h5>Fixture Library</h5>
              {Object.values(fixtureLibrary).map(fix => (
                <div 
                  key={fix.id}
                  className="fixture-item"
                  onClick={() => {
                    setFixture(prev => ({
                      ...prev,
                      type: fix.type,
                      specs: fix.specs
                    }));
                    setTimeout(() => addFixture(), 100);
                  }}
                >
                  <span>{fix.name}</span>
                  <span className="fixture-type">{fix.type}</span>
                </div>
              ))}
            </div>
            
            {/* Fixture Position Controls */}
            <div className="position-controls">
              <h5>Position</h5>
              <div className="control-row">
                <label>X:</label>
                <input
                  type="number"
                  value={fixture.position.x}
                  onChange={(e) => {
                    setFixture(prev => ({
                      ...prev,
                      position: { ...prev.position, x: parseFloat(e.target.value) }
                    }));
                    setTimeout(() => addFixture(), 100);
                  }}
                  step="1"
                  className="position-input"
                />
              </div>
              <div className="control-row">
                <label>Y:</label>
                <input
                  type="number"
                  value={fixture.position.y}
                  onChange={(e) => {
                    setFixture(prev => ({
                      ...prev,
                      position: { ...prev.position, y: parseFloat(e.target.value) }
                    }));
                    setTimeout(() => addFixture(), 100);
                  }}
                  step="1"
                  className="position-input"
                />
              </div>
              <div className="control-row">
                <label>Z:</label>
                <input
                  type="number"
                  value={fixture.position.z}
                  onChange={(e) => {
                    setFixture(prev => ({
                      ...prev,
                      position: { ...prev.position, z: parseFloat(e.target.value) }
                    }));
                    setTimeout(() => addFixture(), 100);
                  }}
                  step="1"
                  className="position-input"
                />
              </div>
            </div>
          </div>
          
          <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)' }} />
          
          {/* Workpiece Section */}
          <div className="workpiece-section">
            <h4>Workpiece Setup</h4>
            <div className="workpiece-type">
              <select
                value={workpiece.type}
                onChange={(e) => {
                  setWorkpiece(prev => ({ ...prev, type: e.target.value }));
                  setTimeout(() => addWorkpiece(), 100);
                }}
                className="workpiece-select"
              >
                <option value="block">Block</option>
                <option value="cylinder">Cylinder</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="workpiece-dimensions">
              <div className="dimension-input">
                <label>X/⌀</label>
                <input
                  type="number"
                  value={workpiece.dimensions.x}
                  onChange={(e) => {
                    setWorkpiece(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, x: parseFloat(e.target.value) || 100 }
                    }));
                    setTimeout(() => addWorkpiece(), 100);
                  }}
                  step="1"
                />
              </div>
              <div className="dimension-input">
                <label>Y</label>
                <input
                  type="number"
                  value={workpiece.dimensions.y}
                  onChange={(e) => {
                    setWorkpiece(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, y: parseFloat(e.target.value) || 100 }
                    }));
                    setTimeout(() => addWorkpiece(), 100);
                  }}
                  step="1"
                  disabled={workpiece.type === 'cylinder'}
                />
              </div>
              <div className="dimension-input">
                <label>Z</label>
                <input
                  type="number"
                  value={workpiece.dimensions.z}
                  onChange={(e) => {
                    setWorkpiece(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, z: parseFloat(e.target.value) || 50 }
                    }));
                    setTimeout(() => addWorkpiece(), 100);
                  }}
                  step="1"
                />
              </div>
            </div>
            
            <div className="workpiece-material">
              <label>Material</label>
              <select
                value={workpiece.material}
                onChange={(e) => {
                  setWorkpiece(prev => ({ ...prev, material: e.target.value }));
                  setTimeout(() => addWorkpiece(), 100);
                }}
                className="material-select"
              >
                <option value="aluminum">Aluminum</option>
                <option value="steel">Steel</option>
                <option value="plastic">Plastic</option>
                <option value="wood">Wood</option>
              </select>
            </div>
          </div>
          
          <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)' }} />
          
          <h4>Tool Setup</h4>
          <div className="active-tools">
            <h4>Active Tools</h4>
            {Object.entries(activeTools).map(([toolNum, tool]) => (
              <div key={toolNum} className="active-tool-item">
                <span className="tool-number">{toolNum}</span>
                <span className="tool-name">{tool.name}</span>
                <span className="tool-diameter">⌀{tool.diameter}mm</span>
                {currentTool === toolNum && <span className="current-badge">Active</span>}
              </div>
            ))}
          </div>
          
          <div className="tool-database-section">
            <h4>Tool Database</h4>
            <div className="tool-list">
              {Object.entries(toolDatabase).slice(0, 5).map(([id, tool]) => (
                <div 
                  key={id} 
                  className="tool-item"
                  onClick={() => selectToolFromDatabase(id)}
                >
                  <span>{tool.name}</span>
                  <span>⌀{tool.diameter}mm</span>
                </div>
              ))}
            </div>
            <button className="btn btn-small">Manage Tools</button>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="main-viewport">
          <div className="viewport-container" ref={mountRef} />
          
          {/* Simulation Controls */}
          <div className="simulation-controls">
            <button 
              className="btn btn-play"
              onClick={startSimulation}
              disabled={simulation.isRunning && !simulation.isPaused}
            >
              ▶ Play
            </button>
            <button 
              className="btn btn-pause"
              onClick={pauseSimulation}
              disabled={!simulation.isRunning}
            >
              ⏸ Pause
            </button>
            <button 
              className="btn btn-stop"
              onClick={stopSimulation}
              disabled={!simulation.isRunning}
            >
              ⏹ Stop
            </button>
            <button 
              className="btn btn-reset"
              onClick={resetSimulation}
            >
              ↺ Reset
            </button>
            <button 
              className="btn btn-step-back"
              onClick={stepBackward}
              disabled={simulation.isRunning || simulation.currentLine === 0}
            >
              ⏮ Step-
            </button>
            <button 
              className="btn btn-step-forward"
              onClick={stepForward}
              disabled={simulation.isRunning || !parsedProgram || simulation.currentLine >= parsedProgram.lines.length - 1}
            >
              ⏭ Step+
            </button>
            
            <div className="speed-control">
              <label>Speed:</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={simulation.speed}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  speed: parseFloat(e.target.value) 
                }))}
              />
              <span>{simulation.speed}x</span>
            </div>
          </div>
          
          {/* View Options */}
          <div className="view-options">
            <label>
              <input
                type="checkbox"
                checked={simulation.showToolpath}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  showToolpath: e.target.checked 
                }))}
              />
              Toolpath
            </label>
            <label>
              <input
                type="checkbox"
                checked={simulation.showTool}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  showTool: e.target.checked 
                }))}
              />
              Tool
            </label>
            <label>
              <input
                type="checkbox"
                checked={simulation.showWorkpiece}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  showWorkpiece: e.target.checked 
                }))}
              />
              Workpiece
            </label>
            <label>
              <input
                type="checkbox"
                checked={simulation.showFixture}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  showFixture: e.target.checked 
                }))}
              />
              Fixture
            </label>
            <label>
              <input
                type="checkbox"
                checked={simulation.materialRemoval}
                onChange={(e) => setSimulation(prev => ({ 
                  ...prev, 
                  materialRemoval: e.target.checked 
                }))}
              />
              Material Removal
            </label>
          </div>
          
          {/* Camera Views */}
          <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
            <h5 style={{ color: 'white', fontSize: '10px', marginBottom: '6px' }}>Quick Views</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              <button 
                className="btn btn-small"
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(0, 0, 300);
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                  }
                }}
                style={{ fontSize: '9px', padding: '2px' }}
              >
                Top
              </button>
              <button 
                className="btn btn-small"
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(300, 0, 0);
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                  }
                }}
                style={{ fontSize: '9px', padding: '2px' }}
              >
                Front
              </button>
              <button 
                className="btn btn-small"
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(0, 300, 0);
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                  }
                }}
                style={{ fontSize: '9px', padding: '2px' }}
              >
                Side
              </button>
              <button 
                className="btn btn-small"
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(200, 150, 200);
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                  }
                }}
                style={{ fontSize: '9px', padding: '2px', gridColumn: 'span 3' }}
              >
                Isometric
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className={`info-panel ${!panelStates.infoPanel ? 'collapsed' : ''}`}>
          <button 
            className="panel-toggle"
            onClick={() => {
              setPanelStates(prev => ({ ...prev, infoPanel: !prev.infoPanel }));
              // Trigger resize after panel animation
              setTimeout(() => {
                if (rendererRef.current && mountRef.current) {
                  const width = mountRef.current.clientWidth;
                  const height = mountRef.current.clientHeight;
                  rendererRef.current.setSize(width, height);
                  if (cameraRef.current) {
                    cameraRef.current.aspect = width / height;
                    cameraRef.current.updateProjectionMatrix();
                  }
                }
              }, 300);
            }}
            title={panelStates.infoPanel ? 'Collapse' : 'Expand'}
          >
            {panelStates.infoPanel ? '▶' : '◀'}
          </button>
          <h3>Cutting Data</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Chip Load:</label>
              <span>{cuttingData.chipLoad} mm/tooth</span>
            </div>
            <div className="data-item">
              <label>MRR:</label>
              <span>{cuttingData.materialRemovalRate} cm³/min</span>
            </div>
            <div className="data-item">
              <label>Cutting Force:</label>
              <span>{cuttingData.cuttingForce} N</span>
            </div>
            <div className="data-item">
              <label>Power:</label>
              <span>{cuttingData.power} kW</span>
            </div>
            <div className="data-item">
              <label>Tool Wear:</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${cuttingData.toolWear}%`,
                    backgroundColor: cuttingData.toolWear > 80 ? '#ff4444' : 
                                    cuttingData.toolWear > 50 ? '#ffaa00' : '#44ff44'
                  }}
                />
              </div>
            </div>
            <div className="data-item">
              <label>Surface Finish:</label>
              <span>{cuttingData.surfaceFinish} µm</span>
            </div>
          </div>
          
          <h3>Machine State</h3>
          <div className="state-grid">
            <div className="state-item">
              <label>Position:</label>
              <span>
                X:{machineState.position.x.toFixed(3)} 
                Y:{machineState.position.y.toFixed(3)} 
                Z:{machineState.position.z.toFixed(3)}
              </span>
            </div>
            <div className="state-item">
              <label>Feed Rate:</label>
              <span>{machineState.feedRate} mm/min</span>
            </div>
            <div className="state-item">
              <label>Spindle:</label>
              <span>{machineState.spindleSpeed} RPM</span>
            </div>
            <div className="state-item">
              <label>Coolant:</label>
              <span className={`coolant-${machineState.coolant}`}>
                {machineState.coolant.toUpperCase()}
              </span>
            </div>
          </div>
          
          {parsedProgram && (
            <>
              <h3>Program Info</h3>
              <div className="program-info">
                <div className="info-item">
                  <label>Lines:</label>
                  <span>{parsedProgram.lines.length}</span>
                </div>
                <div className="info-item">
                  <label>Current Line:</label>
                  <span>{simulation.currentLine + 1} / {parsedProgram.lines.length}</span>
                </div>
                <div className="info-item">
                  <label>Est. Time:</label>
                  <span>{Math.floor(parsedProgram.estimatedTime / 60)}:{(parsedProgram.estimatedTime % 60).toFixed(0).padStart(2, '0')}</span>
                </div>
                <div className="info-item">
                  <label>Bounds:</label>
                  <span>
                    {(parsedProgram.bounds.maxX - parsedProgram.bounds.minX).toFixed(1)} × 
                    {(parsedProgram.bounds.maxY - parsedProgram.bounds.minY).toFixed(1)} × 
                    {(parsedProgram.bounds.maxZ - parsedProgram.bounds.minZ).toFixed(1)} mm
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* G-Code Editor */}
      <div className="gcode-editor">
        <div className="editor-header">
          <h3>G-Code Program</h3>
          <div className="editor-actions">
            <button className="btn btn-small" onClick={verifyGCode}>Verify</button>
            <button className="btn btn-small" onClick={optimizeGCode}>Optimize</button>
          </div>
        </div>
        <div className="gcode-content" style={{ position: 'relative', height: '100%', display: 'flex', overflow: 'hidden' }}>
          <div 
            ref={lineNumbersRef}
            className="line-numbers" 
            style={{ 
              width: '45px', 
              backgroundColor: 'var(--bg-tertiary)', 
              overflowY: 'auto',
              overflowX: 'hidden',
              fontSize: '11px',
              lineHeight: '15.4px', // Fixed pixel value matching textarea
              padding: '6px 4px',
              textAlign: 'right',
              userSelect: 'none',
              fontFamily: 'var(--font-mono)',
              scrollbarWidth: 'none', // Hide scrollbar
              msOverflowStyle: 'none' // Hide scrollbar IE/Edge
            }}
            onScroll={(e) => {
              // Sync textarea scroll with line numbers
              if (textareaRef.current) {
                textareaRef.current.scrollTop = e.target.scrollTop;
              }
            }}
          >
            {gcode.split('\n').map((_, i) => (
              <div 
                key={i} 
                style={{
                  height: '15.4px', // Fixed pixel height matching line-height
                  lineHeight: '15.4px',
                  backgroundColor: simulation.currentLine === i ? '#ffeb3b' : 'transparent',
                  color: simulation.currentLine === i ? '#000' : 'var(--text-muted)',
                  fontWeight: simulation.currentLine === i ? 'bold' : 'normal',
                  padding: '0 4px',
                  borderRadius: simulation.currentLine === i ? '2px' : '0',
                  boxSizing: 'border-box'
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={gcode}
            onChange={(e) => {
              setGcode(e.target.value);
              setParsedProgram(null);
            }}
            onScroll={(e) => {
              // Sync line numbers scroll with textarea
              if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = e.target.scrollTop;
              }
            }}
            placeholder="Paste G-Code here or load from file..."
            className="gcode-textarea"
            spellCheck={false}
            style={{
              flex: 1,
              paddingLeft: '8px',
              lineHeight: '15.4px', // Fixed pixel value for consistency
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              backgroundImage: simulation.currentLine >= 0 ? 
                `linear-gradient(transparent ${(simulation.currentLine) * 15.4}px, rgba(255, 235, 59, 0.2) ${(simulation.currentLine) * 15.4}px, rgba(255, 235, 59, 0.2) ${(simulation.currentLine + 1) * 15.4}px, transparent ${(simulation.currentLine + 1) * 15.4}px)` : 
                'none',
              backgroundAttachment: 'local' // Make background scroll with content
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GCodeSimulator;