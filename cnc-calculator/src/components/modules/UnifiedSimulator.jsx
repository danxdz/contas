import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import FloatingWindow, { ToolInfoWindow, ResultsWindow, MonitoringWindow } from '../FloatingWindow';
import './UnifiedSimulator.css';

const UnifiedSimulator = ({ toolDatabase = [] }) => {
  // Default sample G-code
  const defaultGcode = `; Sample G-Code Program
G90 G94 G17 ; Absolute, mm/min, XY plane
G21 ; Metric
G28 G91 Z0 ; Home Z
G90

; Tool Change
T1 M06
S12000 M03 ; Spindle on
M08 ; Coolant on

; Square Pattern
G00 X0 Y0 Z5 ; Start position
G01 Z-5 F500 ; Plunge
G01 X50 Y0 F2500 ; Line 1
G01 X50 Y50 ; Line 2
G01 X0 Y50 ; Line 3
G01 X0 Y0 ; Line 4
G00 Z5 ; Retract

; Circle
G00 X75 Y25
G01 Z-5 F500
G02 X75 Y25 I25 J0 F2000
G00 Z5

; End
M05 ; Spindle off
M09 ; Coolant off
M30 ; Program end`;

  // Core States
  const [gcode, setGcode] = useState(defaultGcode);
  const [parsedGcode, setParsedGcode] = useState(null);
  const [simulation, setSimulation] = useState({
    isPlaying: false,
    isPaused: false,
    currentLine: 0,
    totalLines: 0,
    speed: 1.0,
    currentPosition: { x: 0, y: 0, z: 0, a: 0, b: 0 },
    feedRate: 0,
    spindleSpeed: 0,
    activeTool: null,
    coolant: false,
    estimatedTime: 0,
    elapsedTime: 0
  });

  // Machine Setup
  const [machineSetup, setMachineSetup] = useState({
    type: '3-axis', // 3-axis, 4-axis, 5-axis, lathe
    workOffset: 'G54',
    offsets: {
      G54: { x: 0, y: 0, z: 0 },
      G55: { x: 100, y: 100, z: 0 },
      G56: { x: 200, y: 200, z: 0 },
      G57: { x: 0, y: 0, z: 0 },
      G58: { x: 0, y: 0, z: 0 },
      G59: { x: 0, y: 0, z: 0 }
    },
    stock: {
      type: 'block', // block, cylinder, custom
      dimensions: { x: 100, y: 100, z: 50 },
      material: 'aluminum',
      position: { x: 0, y: 0, z: 0 }
    },
    fixture: {
      type: 'vise', // vise, chuck, fixture-plate, custom
      position: { x: 0, y: 0, z: 0 }
    },
    tools: {} // Tool assignments T1, T2, etc.
  });

  // UI States
  const [activePanel, setActivePanel] = useState('program'); // program, tools, setup, analysis
  const [floatingWindows, setFloatingWindows] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // 2d, 3d, split
  const [displayOptions, setDisplayOptions] = useState({
    showToolpath: true,
    showTool: true,
    showStock: true,
    showFixture: true,
    showTable: true,
    showGrid: true,
    showAxes: true,
    materialRemoval: false,
    collisionDetection: false
  });

  // Three.js refs
  const mountRef = useRef(null);
  const mount2DRef = useRef(null);
  const sceneRef = useRef(null);
  const scene2DRef = useRef(null);
  const rendererRef = useRef(null);
  const renderer2DRef = useRef(null);
  const cameraRef = useRef(null);
  const camera2DRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  const toolpathRef = useRef(null);
  const toolRef = useRef(null);
  const stockRef = useRef(null);

  // Time-based animation
  const lastTimeRef = useRef(0);
  const playbackSpeedRef = useRef(1.0);

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 500, 2000);
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

    // Add machine components
    addMachineTable(scene);
    addFixture(scene);
    addStock(scene);
    addTool(scene);

    // Animation loop
    const animate = (time) => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      
      // Store time for playback updates
      lastTimeRef.current = time;
    };
    animate(0);

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Parse default G-code on mount
  useEffect(() => {
    const parsed = parseGcode(defaultGcode);
    setParsedGcode(parsed);
    if (sceneRef.current) {
      drawToolpath(parsed.commands);
    }
  }, []);

  // Handle playback animation
  useEffect(() => {
    if (!simulation.isPlaying || simulation.isPaused) return;
    
    const interval = setInterval(() => {
      if (parsedGcode && simulation.currentLine < parsedGcode.commands.length) {
        updateSimulation();
      } else {
        setSimulation(prev => ({ ...prev, isPlaying: false }));
      }
    }, 100 / simulation.speed); // Adjust speed
    
    return () => clearInterval(interval);
  }, [simulation.isPlaying, simulation.isPaused, simulation.currentLine, simulation.speed, parsedGcode]);

  // Add machine table
  const addMachineTable = (scene) => {
    const tableGeometry = new THREE.BoxGeometry(800, 500, 20);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.z = -10;
    table.receiveShadow = true;
    scene.add(table);

    // T-slots
    for (let i = -200; i <= 200; i += 100) {
      const slotGeometry = new THREE.BoxGeometry(800, 10, 5);
      const slotMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
      const slot = new THREE.Mesh(slotGeometry, slotMaterial);
      slot.position.set(0, i, 0);
      scene.add(slot);
    }
  };

  // Add fixture
  const addFixture = (scene) => {
    const fixtureGroup = new THREE.Group();
    
    if (machineSetup.fixture.type === 'vise') {
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
  };

  // Add stock
  const addStock = (scene) => {
    if (stockRef.current) {
      scene.remove(stockRef.current);
    }

    const { type, dimensions } = machineSetup.stock;
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
    stock.position.z = dimensions.z / 2 + 40;
    stock.castShadow = true;
    stock.receiveShadow = true;
    stockRef.current = stock;
    scene.add(stock);
  };

  // Add tool
  const addTool = (scene) => {
    if (toolRef.current) {
      scene.remove(toolRef.current);
    }

    const toolGroup = new THREE.Group();

    // Tool holder
    const holderGeometry = new THREE.CylinderGeometry(20, 20, 50, 16);
    const holderMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotateX(-Math.PI / 2);
    holder.position.z = 25;
    toolGroup.add(holder);

    // Get active tool from database
    const activeTool = simulation.activeTool ? 
      toolDatabase.find(t => t.tNumber === simulation.activeTool) : null;
    
    const diameter = activeTool ? activeTool.diameter : 10;
    const length = activeTool ? activeTool.fluteLength : 30;

    // Cutting tool
    const toolGeometry = new THREE.CylinderGeometry(
      diameter / 2, 
      diameter / 2, 
      length, 
      16
    );
    const toolMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.2
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotateX(-Math.PI / 2);
    tool.position.z = -length / 2 - 20;
    toolGroup.add(tool);

    toolGroup.position.set(0, 0, 200);
    toolRef.current = toolGroup;
    scene.add(toolGroup);
  };

  // Parse G-code
  const parseGcode = (code) => {
    const lines = code.split('\n');
    const commands = [];
    let currentPos = { x: 0, y: 0, z: 0, a: 0, b: 0 };
    let feedRate = 0;
    let spindleSpeed = 0;
    let activeTool = null;
    
    lines.forEach((line, index) => {
      const cleanLine = line.split(/[;(]/)[0].trim();
      if (!cleanLine) return;
      
      const parts = cleanLine.split(/\s+/);
      const command = { line: index, code: cleanLine, type: null };
      
      parts.forEach(part => {
        const letter = part[0];
        const value = parseFloat(part.substring(1));
        
        switch(letter) {
          case 'G':
            if (value === 0 || value === 1) {
              command.type = value === 0 ? 'rapid' : 'linear';
            } else if (value === 2 || value === 3) {
              command.type = value === 2 ? 'arc_cw' : 'arc_ccw';
            }
            break;
          case 'X':
            command.x = value;
            break;
          case 'Y':
            command.y = value;
            break;
          case 'Z':
            command.z = value;
            break;
          case 'F':
            feedRate = value;
            command.feedRate = value;
            break;
          case 'S':
            spindleSpeed = value;
            command.spindleSpeed = value;
            break;
          case 'T':
            activeTool = `T${value}`;
            command.tool = activeTool;
            break;
          case 'M':
            if (value === 3 || value === 4) {
              command.spindleOn = true;
              command.spindleDir = value === 3 ? 'CW' : 'CCW';
            } else if (value === 5) {
              command.spindleOff = true;
            } else if (value === 8) {
              command.coolantOn = true;
            } else if (value === 9) {
              command.coolantOff = true;
            }
            break;
        }
      });
      
      if (command.type) {
        command.startPos = { ...currentPos };
        if (command.x !== undefined) currentPos.x = command.x;
        if (command.y !== undefined) currentPos.y = command.y;
        if (command.z !== undefined) currentPos.z = command.z;
        command.endPos = { ...currentPos };
        command.feedRate = feedRate;
        command.spindleSpeed = spindleSpeed;
        command.tool = activeTool;
        commands.push(command);
      }
    });
    
    return {
      commands,
      totalLines: lines.length,
      boundingBox: calculateBoundingBox(commands)
    };
  };

  // Calculate bounding box
  const calculateBoundingBox = (commands) => {
    let min = { x: Infinity, y: Infinity, z: Infinity };
    let max = { x: -Infinity, y: -Infinity, z: -Infinity };
    
    commands.forEach(cmd => {
      if (cmd.endPos) {
        min.x = Math.min(min.x, cmd.endPos.x);
        min.y = Math.min(min.y, cmd.endPos.y);
        min.z = Math.min(min.z, cmd.endPos.z);
        max.x = Math.max(max.x, cmd.endPos.x);
        max.y = Math.max(max.y, cmd.endPos.y);
        max.z = Math.max(max.z, cmd.endPos.z);
      }
    });
    
    return { min, max };
  };

  // Draw toolpath
  const drawToolpath = (commands) => {
    if (!sceneRef.current) return;
    
    // Remove existing toolpath
    if (toolpathRef.current) {
      sceneRef.current.remove(toolpathRef.current);
    }
    
    const toolpathGroup = new THREE.Group();
    const rapidMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    const feedMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const executedMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
    
    commands.forEach((cmd, index) => {
      if (!cmd.startPos || !cmd.endPos) return;
      
      const points = [
        new THREE.Vector3(cmd.startPos.x, cmd.startPos.y, cmd.startPos.z),
        new THREE.Vector3(cmd.endPos.x, cmd.endPos.y, cmd.endPos.z)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = index < simulation.currentLine ? executedMaterial :
                       cmd.type === 'rapid' ? rapidMaterial : feedMaterial;
      const line = new THREE.Line(geometry, material);
      toolpathGroup.add(line);
    });
    
    toolpathRef.current = toolpathGroup;
    sceneRef.current.add(toolpathGroup);
  };

  // Update simulation
  const updateSimulation = () => {
    if (!parsedGcode || simulation.currentLine >= parsedGcode.commands.length) {
      setSimulation(prev => ({ ...prev, isPlaying: false }));
      return;
    }
    
    const currentCommand = parsedGcode.commands[simulation.currentLine];
    
    // Update tool position
    if (toolRef.current && currentCommand.endPos) {
      toolRef.current.position.set(
        currentCommand.endPos.x,
        currentCommand.endPos.y,
        currentCommand.endPos.z + 100
      );
    }
    
    // Update simulation state
    setSimulation(prev => ({
      ...prev,
      currentLine: prev.currentLine + 1,
      currentPosition: currentCommand.endPos || prev.currentPosition,
      feedRate: currentCommand.feedRate || prev.feedRate,
      spindleSpeed: currentCommand.spindleSpeed || prev.spindleSpeed,
      activeTool: currentCommand.tool || prev.activeTool,
      coolant: currentCommand.coolantOn ? true : currentCommand.coolantOff ? false : prev.coolant
    }));
    
    // Redraw toolpath with executed lines
    if (parsedGcode) {
      drawToolpath(parsedGcode.commands);
    }
  };

  // Load G-code file
  const loadGcodeFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setGcode(content);
      const parsed = parseGcode(content);
      setParsedGcode(parsed);
      drawToolpath(parsed.commands);
      setSimulation(prev => ({
        ...prev,
        totalLines: parsed.totalLines,
        currentLine: 0
      }));
    };
    reader.readAsText(file);
  };

  // Control functions
  const play = () => {
    if (!parsedGcode) {
      const parsed = parseGcode(gcode);
      setParsedGcode(parsed);
      drawToolpath(parsed.commands);
    }
    setSimulation(prev => ({ ...prev, isPlaying: true, isPaused: false }));
  };

  const pause = () => {
    setSimulation(prev => ({ ...prev, isPaused: true }));
  };

  const stop = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentLine: 0
    }));
    if (toolRef.current) {
      toolRef.current.position.set(0, 0, 200);
    }
    if (parsedGcode) {
      drawToolpath(parsedGcode.commands);
    }
  };

  const stepForward = () => {
    if (parsedGcode && simulation.currentLine < parsedGcode.commands.length) {
      updateSimulation();
    }
  };

  const stepBackward = () => {
    if (simulation.currentLine > 0) {
      setSimulation(prev => ({ ...prev, currentLine: prev.currentLine - 1 }));
      if (parsedGcode) {
        drawToolpath(parsedGcode.commands);
      }
    }
  };

  // Tool assignment
  const assignToolToTNumber = (tNumber, toolId) => {
    const tool = toolDatabase.find(t => t.id === toolId);
    if (tool) {
      setMachineSetup(prev => ({
        ...prev,
        tools: {
          ...prev.tools,
          [tNumber]: tool
        }
      }));
    }
  };

  // Add floating window
  const addFloatingWindow = (type, data) => {
    const newWindow = {
      id: Date.now(),
      type,
      data,
      position: { x: 100 + floatingWindows.length * 30, y: 100 + floatingWindows.length * 30 }
    };
    setFloatingWindows(prev => [...prev, newWindow]);
  };

  // Generate optimized G-code
  const generateGcode = () => {
    const header = `; UNIFIED SIMULATOR G-CODE
; Generated: ${new Date().toLocaleString()}
; Machine: ${machineSetup.type}
; Work Offset: ${machineSetup.workOffset}
; Stock: ${machineSetup.stock.type} ${machineSetup.stock.dimensions.x}x${machineSetup.stock.dimensions.y}x${machineSetup.stock.dimensions.z}mm

; Safety Block
G90 G94 G17 G49 G40 G80
G21 ; Metric
${machineSetup.workOffset} ; Work offset
G28 G91 Z0 ; Home Z
G90

`;
    setGcode(header);
  };

  // Camera presets
  const setCameraView = (view) => {
    if (!cameraRef.current) return;
    
    const positions = {
      top: [0, 0, 500],
      front: [0, -500, 0],
      side: [500, 0, 0],
      iso: [300, 300, 500]
    };
    
    const pos = positions[view];
    if (pos) {
      cameraRef.current.position.set(...pos);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="unified-simulator">
      {/* Header Toolbar */}
      <div className="simulator-toolbar">
        <div className="toolbar-section">
          <button className="toolbar-btn" onClick={() => document.getElementById('file-input').click()}>
            📁 Load
          </button>
          <input 
            id="file-input"
            type="file" 
            accept=".nc,.gcode,.txt" 
            onChange={loadGcodeFile}
            style={{ display: 'none' }}
          />
          <button className="toolbar-btn" onClick={generateGcode}>
            📝 New
          </button>
          <button className="toolbar-btn">
            💾 Save
          </button>
        </div>
        
        <div className="toolbar-section">
          <button className={`toolbar-btn ${simulation.isPlaying ? 'active' : ''}`} onClick={play}>
            ▶️ Play
          </button>
          <button className="toolbar-btn" onClick={pause}>
            ⏸️ Pause
          </button>
          <button className="toolbar-btn" onClick={stop}>
            ⏹️ Stop
          </button>
          <button className="toolbar-btn" onClick={stepBackward}>
            ⏮️
          </button>
          <button className="toolbar-btn" onClick={stepForward}>
            ⏭️
          </button>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={simulation.speed}
            onChange={(e) => setSimulation(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
            className="speed-slider"
          />
          <span className="speed-display">{simulation.speed}x</span>
        </div>
        
        <div className="toolbar-section">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="view-selector"
          >
            <option value="3d">3D View</option>
            <option value="2d">2D View</option>
            <option value="split">Split View</option>
          </select>
          <button className="toolbar-btn" onClick={() => setCameraView('top')}>Top</button>
          <button className="toolbar-btn" onClick={() => setCameraView('front')}>Front</button>
          <button className="toolbar-btn" onClick={() => setCameraView('side')}>Side</button>
          <button className="toolbar-btn" onClick={() => setCameraView('iso')}>Iso</button>
        </div>
        
        <div className="toolbar-section">
          <button 
            className="toolbar-btn"
            onClick={() => addFloatingWindow('toolInfo', selectedTool)}
          >
            🛠️ Tool Info
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => addFloatingWindow('monitoring', simulation)}
          >
            📊 Monitor
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="simulator-layout">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="panel-tabs">
            <button 
              className={`tab-btn ${activePanel === 'program' ? 'active' : ''}`}
              onClick={() => setActivePanel('program')}
            >
              Program
            </button>
            <button 
              className={`tab-btn ${activePanel === 'tools' ? 'active' : ''}`}
              onClick={() => setActivePanel('tools')}
            >
              Tools
            </button>
            <button 
              className={`tab-btn ${activePanel === 'setup' ? 'active' : ''}`}
              onClick={() => setActivePanel('setup')}
            >
              Setup
            </button>
            <button 
              className={`tab-btn ${activePanel === 'analysis' ? 'active' : ''}`}
              onClick={() => setActivePanel('analysis')}
            >
              Analysis
            </button>
          </div>
          
          <div className="panel-content">
            {activePanel === 'program' && (
              <div className="program-panel">
                <div className="gcode-editor">
                  <div className="line-numbers">
                    {gcode.split('\n').map((_, i) => (
                      <div 
                        key={i} 
                        className={`line-number ${i === simulation.currentLine ? 'active' : ''}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={gcode}
                    onChange={(e) => setGcode(e.target.value)}
                    className="gcode-textarea"
                    spellCheck={false}
                  />
                </div>
                <div className="program-info">
                  <div className="info-item">
                    <span>Line:</span>
                    <span>{simulation.currentLine}/{simulation.totalLines}</span>
                  </div>
                  <div className="info-item">
                    <span>Position:</span>
                    <span>X{simulation.currentPosition.x.toFixed(2)} Y{simulation.currentPosition.y.toFixed(2)} Z{simulation.currentPosition.z.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span>Feed:</span>
                    <span>{simulation.feedRate} mm/min</span>
                  </div>
                  <div className="info-item">
                    <span>Spindle:</span>
                    <span>{simulation.spindleSpeed} RPM</span>
                  </div>
                  <div className="info-item">
                    <span>Tool:</span>
                    <span>{simulation.activeTool || 'None'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {activePanel === 'tools' && (
              <div className="tools-panel">
                <h3>Tool Assignments</h3>
                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'].map(tNumber => (
                  <div key={tNumber} className="tool-assignment">
                    <span className="t-number">{tNumber}</span>
                    <select 
                      onChange={(e) => assignToolToTNumber(tNumber, e.target.value)}
                      className="tool-select"
                    >
                      <option value="">-- Select Tool --</option>
                      {toolDatabase.map(tool => (
                        <option key={tool.id} value={tool.id}>
                          {tool.name}
                        </option>
                      ))}
                    </select>
                    {machineSetup.tools[tNumber] && (
                      <div className="tool-details">
                        <span>⌀{machineSetup.tools[tNumber].diameter}mm</span>
                        <span>{machineSetup.tools[tNumber].type}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {activePanel === 'setup' && (
              <div className="setup-panel">
                <h3>Machine Setup</h3>
                <div className="setup-section">
                  <h4>Work Offset</h4>
                  <select 
                    value={machineSetup.workOffset}
                    onChange={(e) => setMachineSetup(prev => ({ ...prev, workOffset: e.target.value }))}
                    className="offset-select"
                  >
                    {Object.keys(machineSetup.offsets).map(offset => (
                      <option key={offset} value={offset}>{offset}</option>
                    ))}
                  </select>
                  <div className="offset-values">
                    {Object.entries(machineSetup.offsets[machineSetup.workOffset]).map(([axis, value]) => (
                      <div key={axis} className="offset-input">
                        <label>{axis.toUpperCase()}:</label>
                        <input 
                          type="number" 
                          value={value}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value) || 0;
                            setMachineSetup(prev => ({
                              ...prev,
                              offsets: {
                                ...prev.offsets,
                                [machineSetup.workOffset]: {
                                  ...prev.offsets[machineSetup.workOffset],
                                  [axis]: newValue
                                }
                              }
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="setup-section">
                  <h4>Stock</h4>
                  <select 
                    value={machineSetup.stock.type}
                    onChange={(e) => setMachineSetup(prev => ({
                      ...prev,
                      stock: { ...prev.stock, type: e.target.value }
                    }))}
                    className="stock-select"
                  >
                    <option value="block">Block</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="custom">Custom</option>
                  </select>
                  <div className="stock-dimensions">
                    {['x', 'y', 'z'].map(axis => (
                      <div key={axis} className="dimension-input">
                        <label>{axis.toUpperCase()}:</label>
                        <input 
                          type="number"
                          value={machineSetup.stock.dimensions[axis]}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setMachineSetup(prev => ({
                              ...prev,
                              stock: {
                                ...prev.stock,
                                dimensions: {
                                  ...prev.stock.dimensions,
                                  [axis]: value
                                }
                              }
                            }));
                            if (sceneRef.current) {
                              addStock(sceneRef.current);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="setup-section">
                  <h4>Fixture</h4>
                  <select 
                    value={machineSetup.fixture.type}
                    onChange={(e) => setMachineSetup(prev => ({
                      ...prev,
                      fixture: { ...prev.fixture, type: e.target.value }
                    }))}
                    className="fixture-select"
                  >
                    <option value="vise">Vise</option>
                    <option value="chuck">Chuck</option>
                    <option value="fixture-plate">Fixture Plate</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            )}
            
            {activePanel === 'analysis' && (
              <div className="analysis-panel">
                <h3>Program Analysis</h3>
                <div className="analysis-item">
                  <span>Total Lines:</span>
                  <span>{simulation.totalLines}</span>
                </div>
                <div className="analysis-item">
                  <span>Rapid Moves:</span>
                  <span>{parsedGcode?.commands.filter(c => c.type === 'rapid').length || 0}</span>
                </div>
                <div className="analysis-item">
                  <span>Feed Moves:</span>
                  <span>{parsedGcode?.commands.filter(c => c.type === 'linear').length || 0}</span>
                </div>
                {parsedGcode?.boundingBox && (
                  <>
                    <div className="analysis-item">
                      <span>Min Position:</span>
                      <span>
                        X{parsedGcode.boundingBox.min.x.toFixed(2)} 
                        Y{parsedGcode.boundingBox.min.y.toFixed(2)} 
                        Z{parsedGcode.boundingBox.min.z.toFixed(2)}
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span>Max Position:</span>
                      <span>
                        X{parsedGcode.boundingBox.max.x.toFixed(2)} 
                        Y{parsedGcode.boundingBox.max.y.toFixed(2)} 
                        Z{parsedGcode.boundingBox.max.z.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center - 3D Viewport */}
        <div className="viewport-container">
          {viewMode === '3d' && (
            <div ref={mountRef} className="viewport-3d" />
          )}
          {viewMode === '2d' && (
            <div ref={mount2DRef} className="viewport-2d" />
          )}
          {viewMode === 'split' && (
            <>
              <div ref={mountRef} className="viewport-3d split" />
              <div ref={mount2DRef} className="viewport-2d split" />
            </>
          )}
          
          {/* Display Options */}
          <div className="display-options">
            {Object.entries(displayOptions).map(([key, value]) => (
              <label key={key} className="display-option">
                <input 
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setDisplayOptions(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                />
                <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Panel - Tool Database */}
        <div className="right-panel">
          <h3>Tool Database</h3>
          <div className="tool-list">
            {toolDatabase.map(tool => (
              <div 
                key={tool.id}
                className={`tool-item ${selectedTool?.id === tool.id ? 'selected' : ''}`}
                onClick={() => setSelectedTool(tool)}
              >
                <div className="tool-header">
                  <span className="tool-number">{tool.tNumber}</span>
                  <span className="tool-name">{tool.name}</span>
                </div>
                <div className="tool-info">
                  <span>⌀{tool.diameter}mm</span>
                  <span>{tool.flutes}FL</span>
                  <span>{tool.coating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Windows */}
      {floatingWindows.map(window => (
        <FloatingWindow
          key={window.id}
          id={window.id}
          title={window.type === 'toolInfo' ? 'Tool Information' : 'Live Monitoring'}
          initialPosition={window.position}
          onClose={() => setFloatingWindows(prev => prev.filter(w => w.id !== window.id))}
        >
          {window.type === 'toolInfo' && <ToolInfoWindow tool={window.data} />}
          {window.type === 'monitoring' && <MonitoringWindow data={window.data} />}
        </FloatingWindow>
      ))}

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Mode:</span>
          <span className="status-value">{machineSetup.type}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Offset:</span>
          <span className="status-value">{machineSetup.workOffset}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Tool:</span>
          <span className="status-value">{simulation.activeTool || 'None'}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Feed:</span>
          <span className="status-value">{simulation.feedRate} mm/min</span>
        </div>
        <div className="status-item">
          <span className="status-label">Spindle:</span>
          <span className="status-value">{simulation.spindleSpeed} RPM</span>
        </div>
        <div className="status-item">
          <span className="status-label">Coolant:</span>
          <span className={`status-value ${simulation.coolant ? 'active' : ''}`}>
            {simulation.coolant ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSimulator;