import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import './GCodeSimulator.css';

// OrbitControls implementation
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

// Enhanced G-Code Simulator with full Tool Database integration
const GCodeSimulator = () => {
  // Core states
  const [gcode, setGcode] = useState('');
  const [parsedProgram, setParsedProgram] = useState(null);
  const [simulationMode, setSimulationMode] = useState('3D'); // 2D, 3D, or Split
  
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
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 100);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.near = 0.1;
    directionalLight1.shadow.camera.far = 500;
    directionalLight1.shadow.camera.left = -200;
    directionalLight1.shadow.camera.right = 200;
    directionalLight1.shadow.camera.top = 200;
    directionalLight1.shadow.camera.bottom = -200;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -100, 50);
    scene.add(directionalLight2);
    
    // Add grid and axes
    addSceneHelpers();
    
    // Add machine table
    addMachineTable();
    
    // Add fixture
    addFixture();
    
    // Add initial workpiece
    addWorkpiece();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      
      // Update simulation
      if (simulation.isRunning && !simulation.isPaused) {
        updateSimulation();
      }
      
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
    });
    
    return program;
  };
  
  // Update simulation
  const updateSimulation = () => {
    if (!parsedProgram || simulation.currentLine >= parsedProgram.lines.length) {
      setSimulation(prev => ({ ...prev, isRunning: false }));
      return;
    }
    
    const command = parsedProgram.lines[simulation.currentLine];
    
    // Update tool position
    if (toolRef.current) {
      const progress = 0.1 * simulation.speed; // Smooth animation
      toolRef.current.position.x += (command.endPos.x - toolRef.current.position.x) * progress;
      toolRef.current.position.y += (command.endPos.y - toolRef.current.position.y) * progress;
      toolRef.current.position.z += (command.endPos.z - toolRef.current.position.z) * progress;
      
      // Rotation for 5-axis
      if (command.endPos.a !== undefined || command.endPos.b !== undefined) {
        toolRef.current.rotation.x = THREE.MathUtils.degToRad(command.endPos.a || 0);
        toolRef.current.rotation.y = THREE.MathUtils.degToRad(command.endPos.b || 0);
      }
    }
    
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
  
  // Draw toolpath
  const drawToolpath = (command) => {
    if (!sceneRef.current || !simulation.showToolpath) return;
    
    const material = new THREE.LineBasicMaterial({ 
      color: command.type === 'rapid' ? 0xff0000 : 0x00ff00,
      linewidth: 2
    });
    
    const points = [
      new THREE.Vector3(command.startPos.x, command.startPos.y, command.startPos.z),
      new THREE.Vector3(command.endPos.x, command.endPos.y, command.endPos.z)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
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
  
  // Control functions
  const startSimulation = () => {
    if (!parsedProgram) {
      const parsed = parseGCode(gcode);
      setParsedProgram(parsed);
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
  };
  
  const resetSimulation = () => {
    stopSimulation();
    // Clear toolpaths
    if (sceneRef.current) {
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
        <div className="tool-panel">
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
        </div>

        {/* Info Panel */}
        <div className="info-panel">
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
                  <label>Current:</label>
                  <span>{simulation.currentLine + 1}</span>
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
            <button className="btn btn-small">Verify</button>
            <button className="btn btn-small">Optimize</button>
          </div>
        </div>
        <textarea
          value={gcode}
          onChange={(e) => setGcode(e.target.value)}
          placeholder="Paste G-Code here or load from file..."
          className="gcode-textarea"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default GCodeSimulator;