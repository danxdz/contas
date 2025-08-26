import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Machine configurations
const MACHINE_CONFIGS = {
  '3axis-mill': {
    name: '3-Axis Milling',
    description: 'XY table, Z spindle',
    toolTypes: ['End Mill', 'Drill', 'Face Mill', 'Ball Nose'],
    example: `; 3-Axis Milling Example
G90 G21 ; Absolute, Metric
G00 Z5 ; Safe height
G00 X0 Y0 ; Rapid to origin
G01 Z-1 F100 ; Plunge
G01 X50 Y0 F500 ; Cut
G02 X100 Y50 I50 J0 ; Arc CW
G01 X100 Y100 ; Cut
G01 X0 Y100 ; Cut
G01 X0 Y0 ; Return
G00 Z5 ; Retract
M30 ; End`
  },
  '5axis-mill': {
    name: '5-Axis Milling',
    description: 'XYZ + A/B rotation',
    toolTypes: ['End Mill', 'Ball Nose', 'Tapered Mill'],
    example: `; 5-Axis Complex Turbine Blade Example
; Simultaneous 5-axis contouring
G90 G21 G94 ; Absolute, Metric, Feed/min
G43 H1 ; Tool length comp
G00 X0 Y0 Z100 A0 B0 ; Safe position

; --- First blade surface ---
G00 X20 Y0 Z50 A0 B0
G00 Z10
; Leading edge
G01 X20 Y0 Z5 A-15 B0 F500
G01 X25 Y5 Z4 A-20 B5 F300
G01 X30 Y10 Z3 A-25 B10
G01 X35 Y15 Z2 A-30 B15
; Blade surface
G01 X40 Y20 Z1 A-35 B20
G01 X45 Y25 Z0 A-40 B25
G01 X50 Y30 Z-1 A-45 B30
G01 X55 Y35 Z-2 A-40 B25
G01 X60 Y40 Z-3 A-35 B20
; Trailing edge
G01 X65 Y45 Z-2 A-30 B15
G01 X70 Y50 Z-1 A-25 B10
G01 X75 Y55 Z0 A-20 B5
G01 X80 Y60 Z1 A-15 B0

; --- Transition curve ---
G00 Z20
G00 X80 Y60 Z20 A0 B45
G01 Z5 F200
G02 X60 Y80 Z3 I-20 J0 A15 B45 F250
G03 X40 Y60 Z1 I0 J-20 A30 B30
G02 X60 Y40 Z-1 I20 J0 A45 B15

; --- Second blade surface (opposite angle) ---
G00 Z30
G00 X20 Y80 A60 B-30
G01 Z5 F300
G01 X25 Y75 Z4 A55 B-25
G01 X30 Y70 Z3 A50 B-20
G01 X40 Y60 Z2 A45 B-15
G01 X50 Y50 Z1 A40 B-10
G01 X60 Y40 Z0 A35 B-5
G01 X70 Y30 Z-1 A30 B0
G01 X80 Y20 Z-2 A25 B5

; --- Finishing pass with tool tilt ---
G00 Z50
G00 X0 Y0 A0 B0
G00 X30 Y30 A45 B45
G01 Z0 F150
; Spiral finishing
G02 X40 Y30 Z-0.5 I5 J0 A43 B43
G02 X30 Y40 Z-1 I-5 J5 A41 B41
G02 X20 Y30 Z-1.5 I-5 J-5 A39 B39
G02 X30 Y20 Z-2 I5 J-5 A37 B37
G01 X40 Y30 Z-2.5 A35 B35

; Return to safe position
G00 Z100
G00 X0 Y0 A0 B0
M30 ; End program`
  },
  'lathe': {
    name: 'CNC Lathe/Turning',
    description: 'X radial, Z axial',
    toolTypes: ['Turning Tool', 'Boring Bar', 'Grooving', 'Threading'],
    example: `; CNC Lathe Example
G90 G21 G95 ; Absolute, Metric, Feed/Rev
G00 X50 Z5 ; Safe position
G00 X20 Z0 ; Start position
G01 X20 Z-30 F0.2 ; Turn
G01 X25 Z-30 ; Face
G01 X25 Z-50 ; Turn
G02 X30 Z-55 R5 ; Radius
G01 X30 Z-80 ; Turn
G01 X50 Z-80 ; Retract
G00 X50 Z5 ; Safe position
M30`
  },
  'swiss': {
    name: 'Swiss-Type Lathe',
    description: 'Guide bushing, live tools',
    toolTypes: ['Turning', 'Live End Mill', 'Live Drill'],
    example: `; Swiss Lathe Example
G90 G21
G00 X20 Z5
G01 Z-10 F0.1
G01 X15 F0.05
G01 Z-25
G01 X10
G01 Z-40
G00 X25 Z5
M30`
  }
};

function GCodeVisualizer() {
  const canvasRef = useRef(null);
  const canvas3DRef = useRef(null);
  const animationRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const toolpathRef = useRef(null);
  const toolRef = useRef(null);
  
  const [gcode, setGcode] = useState(MACHINE_CONFIGS['3axis-mill'].example);
  
  const [parsedData, setParsedData] = useState(null);
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [machineType, setMachineType] = useState('3axis-mill'); // Machine type
  const [viewSettings, setViewSettings] = useState({
    zoom: 2,
    offsetX: 50,
    offsetY: 50,
    showGrid: true,
    showCoords: true,
    showRapids: true,
    colorBySpeed: false,
    show3DAxes: true,
    show3DGrid: true
  });
  
  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentLine: 0,
    speed: 0.002,  // MUCH slower default speed
    showToolpath: true,
    showTool: true,
    toolDiameter: 10,
    toolType: 'End Mill'  // Tool type based on machine
  });
  
  const [statistics, setStatistics] = useState(null);
  const [errors, setErrors] = useState([]);

  // Parse G-Code
  const parseGCode = () => {
    const lines = gcode.split('\n');
    const commands = [];
    const errors = [];
    
    let currentPos = { x: 0, y: 0, z: 0, a: 0, b: 0 };
    let feedRate = 100;
    let rapidMode = true;
    let absoluteMode = true;
    let units = 'mm';
    let bounds = {
      minX: 0, maxX: 0,
      minY: 0, maxY: 0,
      minZ: 0, maxZ: 0
    };
    
    lines.forEach((line, index) => {
      // Remove comments and trim
      const cleanLine = line.split(';')[0].trim();
      if (!cleanLine) return;
      
      // Parse command
      const parts = cleanLine.split(/\s+/);
      const command = parts[0].toUpperCase();
      
      const params = {};
      parts.slice(1).forEach(part => {
        const letter = part[0].toUpperCase();
        const value = parseFloat(part.slice(1));
        if (!isNaN(value)) {
          params[letter] = value;
        }
      });
      
      // Create command object
      const cmd = {
        line: index + 1,
        original: line,
        command,
        params,
        startPos: { ...currentPos },
        endPos: { ...currentPos },
        type: 'move',
        feedRate,
        rapidMode
      };
      
      // Process different G-codes
      switch (command) {
        case 'G00': // Rapid positioning
          rapidMode = true;
          cmd.type = 'rapid';
          break;
          
        case 'G01': // Linear interpolation
          rapidMode = false;
          cmd.type = 'cut';
          break;
          
        case 'G02': // Circular interpolation CW
          rapidMode = false;
          cmd.type = 'arc_cw';
          break;
          
        case 'G03': // Circular interpolation CCW
          rapidMode = false;
          cmd.type = 'arc_ccw';
          break;
          
        case 'G20': // Imperial
          units = 'inch';
          break;
          
        case 'G21': // Metric
          units = 'mm';
          break;
          
        case 'G90': // Absolute
          absoluteMode = true;
          break;
          
        case 'G91': // Incremental
          absoluteMode = false;
          break;
          
        case 'G81': // Drilling cycle
          cmd.type = 'drill';
          break;
          
        default:
          if (command.startsWith('M')) {
            cmd.type = 'machine';
          }
      }
      
      // Update feedrate
      if (params.F !== undefined) {
        feedRate = params.F;
        cmd.feedRate = feedRate;
      }
      
      // Calculate new position
      if (params.X !== undefined) {
        cmd.endPos.x = absoluteMode ? params.X : currentPos.x + params.X;
      }
      if (params.Y !== undefined) {
        cmd.endPos.y = absoluteMode ? params.Y : currentPos.y + params.Y;
      }
      if (params.Z !== undefined) {
        cmd.endPos.z = absoluteMode ? params.Z : currentPos.z + params.Z;
      }
      if (params.A !== undefined) {
        cmd.endPos.a = absoluteMode ? params.A : currentPos.a + params.A;
      }
      if (params.B !== undefined) {
        cmd.endPos.b = absoluteMode ? params.B : currentPos.b + params.B;
      }
      
      // Handle arcs
      if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        if (params.I !== undefined) cmd.centerOffset = { i: params.I, j: params.J || 0 };
        if (params.R !== undefined) cmd.radius = params.R;
      }
      
      // Update bounds
      bounds.minX = Math.min(bounds.minX, cmd.endPos.x);
      bounds.maxX = Math.max(bounds.maxX, cmd.endPos.x);
      bounds.minY = Math.min(bounds.minY, cmd.endPos.y);
      bounds.maxY = Math.max(bounds.maxY, cmd.endPos.y);
      bounds.minZ = Math.min(bounds.minZ, cmd.endPos.z);
      bounds.maxZ = Math.max(bounds.maxZ, cmd.endPos.z);
      
      // Update current position
      currentPos = { ...cmd.endPos };
      
      // Add to commands if it's a movement
      if (cmd.type !== 'machine' && (params.X !== undefined || params.Y !== undefined || params.Z !== undefined)) {
        commands.push(cmd);
      }
    });
    
    // Calculate statistics
    const stats = calculateStatistics(commands, bounds);
    
    setParsedData({ commands, bounds, units });
    setStatistics(stats);
    setErrors(errors);
  };
  
  // Calculate statistics
  const calculateStatistics = (commands, bounds) => {
    let totalDistance = 0;
    let cuttingDistance = 0;
    let rapidDistance = 0;
    let cuttingTime = 0;
    let rapidTime = 0;
    
    commands.forEach(cmd => {
      const dx = cmd.endPos.x - cmd.startPos.x;
      const dy = cmd.endPos.y - cmd.startPos.y;
      const dz = cmd.endPos.z - cmd.startPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      totalDistance += distance;
      
      if (cmd.type === 'rapid') {
        rapidDistance += distance;
        rapidTime += distance / 5000 * 60; // Assume 5000 mm/min rapid
      } else if (cmd.type === 'cut' || cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        cuttingDistance += distance;
        cuttingTime += distance / cmd.feedRate * 60; // Convert to seconds
      }
    });
    
    return {
      totalDistance: totalDistance.toFixed(2),
      cuttingDistance: cuttingDistance.toFixed(2),
      rapidDistance: rapidDistance.toFixed(2),
      totalTime: ((cuttingTime + rapidTime) / 60).toFixed(2), // Minutes
      cuttingTime: (cuttingTime / 60).toFixed(2),
      rapidTime: (rapidTime / 60).toFixed(2),
      boundingBox: {
        width: (bounds.maxX - bounds.minX).toFixed(2),
        height: (bounds.maxY - bounds.minY).toFixed(2),
        depth: (bounds.maxZ - bounds.minZ).toFixed(2)
      },
      commandCount: commands.length
    };
  };
  
  // Draw on canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !parsedData) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set transform for zoom and pan
    ctx.save();
    ctx.translate(viewSettings.offsetX, viewSettings.offsetY);
    ctx.scale(viewSettings.zoom, -viewSettings.zoom); // Flip Y axis for CNC coordinates
    
    // Draw grid
    if (viewSettings.showGrid) {
      drawGrid(ctx, parsedData.bounds);
    }
    
    // Draw toolpath
    drawToolpath(ctx, parsedData.commands);
    
    // Draw tool position
    if (playback.showTool && playback.currentLine > 0) {
      drawTool(ctx, parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)]);
    }
    
    ctx.restore();
    
    // Draw coordinates
    if (viewSettings.showCoords) {
      drawCoordinates(ctx, parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)] || { endPos: { x: 0, y: 0, z: 0 } });
    }
  };
  
  const drawGrid = (ctx, bounds) => {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5 / viewSettings.zoom;
    
    const gridSize = 10; // 10mm grid
    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const endX = Math.ceil(bounds.maxX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    const endY = Math.ceil(bounds.maxY / gridSize) * gridSize;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    // Origin
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1 / viewSettings.zoom;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(0, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(endX, 0);
    ctx.stroke();
  };
  
  const drawToolpath = (ctx, commands) => {
    const linesToDraw = playback.showToolpath ? commands.length : playback.currentLine;
    
    for (let i = 0; i < Math.min(linesToDraw, commands.length); i++) {
      const cmd = commands[i];
      
      // Set color based on type
      if (cmd.type === 'rapid') {
        ctx.strokeStyle = viewSettings.showRapids ? 'rgba(255, 165, 0, 0.5)' : 'transparent';
        ctx.setLineDash([2, 2]);
      } else if (cmd.type === 'cut') {
        ctx.strokeStyle = viewSettings.colorBySpeed 
          ? `hsl(${120 - (cmd.feedRate / 1000) * 120}, 100%, 50%)`
          : 'rgba(0, 100, 255, 0.8)';
        ctx.setLineDash([]);
      } else if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        ctx.strokeStyle = 'rgba(0, 200, 100, 0.8)';
        ctx.setLineDash([]);
      }
      
      ctx.lineWidth = cmd.type === 'rapid' ? 0.5 / viewSettings.zoom : 1 / viewSettings.zoom;
      
      if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        // Draw arc
        if (cmd.centerOffset) {
          const centerX = cmd.startPos.x + cmd.centerOffset.i;
          const centerY = cmd.startPos.y + cmd.centerOffset.j;
          const radius = Math.sqrt(cmd.centerOffset.i * cmd.centerOffset.i + cmd.centerOffset.j * cmd.centerOffset.j);
          
          const startAngle = Math.atan2(cmd.startPos.y - centerY, cmd.startPos.x - centerX);
          const endAngle = Math.atan2(cmd.endPos.y - centerY, cmd.endPos.x - centerX);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle, cmd.type === 'arc_cw');
          ctx.stroke();
        }
      } else {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(cmd.startPos.x, cmd.startPos.y);
        ctx.lineTo(cmd.endPos.x, cmd.endPos.y);
        ctx.stroke();
      }
      
      // Highlight current line
      if (i === playback.currentLine - 1) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2 / viewSettings.zoom;
        ctx.beginPath();
        ctx.moveTo(cmd.startPos.x, cmd.startPos.y);
        ctx.lineTo(cmd.endPos.x, cmd.endPos.y);
        ctx.stroke();
      }
    }
  };
  
  const drawTool = (ctx, cmd) => {
    if (!cmd) return;
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.lineWidth = 1 / viewSettings.zoom;
    
    const toolRadius = playback.toolDiameter / 2;
    
    ctx.beginPath();
    ctx.arc(cmd.endPos.x, cmd.endPos.y, toolRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw crosshair
    ctx.beginPath();
    ctx.moveTo(cmd.endPos.x - toolRadius, cmd.endPos.y);
    ctx.lineTo(cmd.endPos.x + toolRadius, cmd.endPos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cmd.endPos.x, cmd.endPos.y - toolRadius);
    ctx.lineTo(cmd.endPos.x, cmd.endPos.y + toolRadius);
    ctx.stroke();
  };
  
  const drawCoordinates = (ctx, cmd) => {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`X: ${cmd.endPos.x.toFixed(2)}`, 10, 20);
    ctx.fillText(`Y: ${cmd.endPos.y.toFixed(2)}`, 10, 40);
    ctx.fillText(`Z: ${cmd.endPos.z.toFixed(2)}`, 10, 60);
    
    if (playback.currentLine > 0 && parsedData) {
      const currentCmd = parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)];
      ctx.fillText(`F: ${currentCmd.feedRate} mm/min`, 10, 80);
      ctx.fillText(`Line: ${playback.currentLine}/${parsedData.commands.length}`, 10, 100);
    }
  };
  
  // Initialize 3D scene
  const init3D = () => {
    if (!canvas3DRef.current) return;
    
    // Clean up any existing renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas3DRef.current.clientWidth / canvas3DRef.current.clientHeight,
      0.1,
      10000
    );
    camera.up.set(0, 0, 1); // Set Z as up direction for CNC convention
    camera.position.set(200, 200, 200);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup - create new renderer each time
    try {
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas3DRef.current,
        antialias: true,
        alpha: true
      });
      renderer.setSize(canvas3DRef.current.clientWidth, canvas3DRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      return;
    }
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add another light from below for better tool visibility
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-50, -50, 100);
    scene.add(directionalLight2);
    
    // Add axes helper with labels
    if (viewSettings.show3DAxes) {
      const axesHelper = new THREE.AxesHelper(100);
      scene.add(axesHelper);
      
      // Add axis labels using sprites
      const addAxisLabel = (text, position, color) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        context.font = 'Bold 48px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(10, 10, 1);
        scene.add(sprite);
      };
      
      addAxisLabel('X', new THREE.Vector3(110, 0, 0), '#ff0000');
      addAxisLabel('Y', new THREE.Vector3(0, 110, 0), '#00ff00');
      addAxisLabel('Z', new THREE.Vector3(0, 0, 110), '#0000ff');
    }
    
    // Add grid
    if (viewSettings.show3DGrid) {
      const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
      gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
      scene.add(gridHelper);
    }
    
    // Simple orbit controls
    const controls = {
      mouseX: 0,
      mouseY: 0,
      isMouseDown: false,
      rotationX: -Math.PI / 6,
      rotationY: Math.PI / 4,
      distance: 400
    };
    controlsRef.current = controls;
    
    // Mouse controls for 3D
    const handle3DMouseDown = (e) => {
      controls.isMouseDown = true;
      controls.mouseX = e.clientX;
      controls.mouseY = e.clientY;
    };
    
    const handle3DMouseMove = (e) => {
      if (!controls.isMouseDown) return;
      
      const deltaX = e.clientX - controls.mouseX;
      const deltaY = e.clientY - controls.mouseY;
      
      controls.rotationY += deltaX * 0.01;
      controls.rotationX += deltaY * 0.01;
      
      controls.mouseX = e.clientX;
      controls.mouseY = e.clientY;
      
      updateCamera();
    };
    
    const handle3DMouseUp = () => {
      controls.isMouseDown = false;
    };
    
    const handle3DWheel = (e) => {
      e.preventDefault();
      controls.distance *= e.deltaY > 0 ? 1.1 : 0.9;
      controls.distance = Math.max(50, Math.min(2000, controls.distance));
      updateCamera();
    };
    
    const updateCamera = () => {
      camera.position.x = controls.distance * Math.cos(controls.rotationX) * Math.cos(controls.rotationY);
      camera.position.y = controls.distance * Math.cos(controls.rotationX) * Math.sin(controls.rotationY);
      camera.position.z = controls.distance * Math.sin(controls.rotationX);
      camera.lookAt(0, 0, 0);
    };
    
    canvas3DRef.current.addEventListener('mousedown', handle3DMouseDown);
    canvas3DRef.current.addEventListener('mousemove', handle3DMouseMove);
    canvas3DRef.current.addEventListener('mouseup', handle3DMouseUp);
    canvas3DRef.current.addEventListener('wheel', handle3DWheel, { passive: false });
    
    updateCamera();
    
    // Cleanup function
    return () => {
      canvas3DRef.current?.removeEventListener('mousedown', handle3DMouseDown);
      canvas3DRef.current?.removeEventListener('mousemove', handle3DMouseMove);
      canvas3DRef.current?.removeEventListener('mouseup', handle3DMouseUp);
      canvas3DRef.current?.removeEventListener('wheel', handle3DWheel, { passive: false });
    };
  };
  
  // Update only tool position (not recreate)
  const updateToolPosition = () => {
    if (!parsedData || !toolRef.current) return;
    
    // Calculate current tool position based on playback
    let toolPos = { x: 0, y: 0, z: 0, a: 0, b: 0 };
    
    if (parsedData.commands.length > 0) {
      if (playback.currentLine === 0) {
        // At start, use the first command's start position
        if (parsedData.commands[0]) {
          toolPos = { ...parsedData.commands[0].startPos };
        }
      } else if (playback.currentLine >= parsedData.commands.length) {
        // At end, use last command's end position
        const lastCmd = parsedData.commands[parsedData.commands.length - 1];
        toolPos = { ...lastCmd.endPos };
      } else {
        // During playback, interpolate position
        const cmdIndex = Math.floor(playback.currentLine) - 1;
        const progress = playback.currentLine - Math.floor(playback.currentLine);
        
        if (cmdIndex >= 0 && cmdIndex < parsedData.commands.length) {
          const currentCmd = parsedData.commands[cmdIndex];
          
          if (currentCmd) {
            // If we have progress, interpolate all axes including rotations
            if (progress > 0) {
              toolPos = {
                x: currentCmd.startPos.x + (currentCmd.endPos.x - currentCmd.startPos.x) * progress,
                y: currentCmd.startPos.y + (currentCmd.endPos.y - currentCmd.startPos.y) * progress,
                z: currentCmd.startPos.z + (currentCmd.endPos.z - currentCmd.startPos.z) * progress,
                a: (currentCmd.startPos.a || 0) + ((currentCmd.endPos.a || 0) - (currentCmd.startPos.a || 0)) * progress,
                b: (currentCmd.startPos.b || 0) + ((currentCmd.endPos.b || 0) - (currentCmd.startPos.b || 0)) * progress
              };
            } else {
              // At the start of a command
              toolPos = { ...currentCmd.startPos };
            }
          }
        } else if (cmdIndex === -1 && parsedData.commands[0]) {
          // Special case: currentLine is between 0 and 1
          const firstCmd = parsedData.commands[0];
          toolPos = { ...firstCmd.startPos };
        }
      }
    }
    
    // Update tool group position
    toolRef.current.position.set(toolPos.x, toolPos.y, toolPos.z);
    
    // Apply rotations for 5-axis (A rotates around X, B rotates around Y)
    if (toolPos.a !== undefined || toolPos.b !== undefined) {
      toolRef.current.rotation.x = (toolPos.a || 0) * Math.PI / 180; // Convert degrees to radians
      toolRef.current.rotation.y = (toolPos.b || 0) * Math.PI / 180;
    }
  };
  
  // Draw 3D toolpath and create tool
  const draw3D = () => {
    if (!parsedData || !sceneRef.current) return;
    
    // For lathe, we need to handle differently
    const isLathe = machineType === 'lathe' || machineType === 'swiss';
    
    // Remove old toolpath group
    if (toolpathRef.current) {
      // Dispose of all geometries and materials in the group
      toolpathRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      sceneRef.current.remove(toolpathRef.current);
      toolpathRef.current = null;
    }
    
    // Remove old tool if exists
    if (toolRef.current) {
      toolRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      sceneRef.current.remove(toolRef.current);
      toolRef.current = null;
    }
    
    const group = new THREE.Group();
    
    // Draw toolpath lines
    const linesToDraw = playback.showToolpath ? parsedData.commands.length : playback.currentLine;
    
    for (let i = 0; i < Math.min(linesToDraw, parsedData.commands.length); i++) {
      const cmd = parsedData.commands[i];
      
      const points = [];
      
      if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        // Draw arc as segments
        if (cmd.centerOffset) {
          const centerX = cmd.startPos.x + cmd.centerOffset.i;
          const centerY = cmd.startPos.y + cmd.centerOffset.j;
          const radius = Math.sqrt(cmd.centerOffset.i * cmd.centerOffset.i + cmd.centerOffset.j * cmd.centerOffset.j);
          
          const startAngle = Math.atan2(cmd.startPos.y - centerY, cmd.startPos.x - centerX);
          const endAngle = Math.atan2(cmd.endPos.y - centerY, cmd.endPos.x - centerX);
          
          const segments = 32;
          for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            let angle = startAngle + (endAngle - startAngle) * t;
            if (cmd.type === 'arc_cw' && endAngle > startAngle) {
              angle = startAngle - (2 * Math.PI - (endAngle - startAngle)) * t;
            }
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const z = cmd.startPos.z + (cmd.endPos.z - cmd.startPos.z) * t;
            
            points.push(new THREE.Vector3(x, y, z));
          }
        }
      } else {
        // Linear move
        points.push(new THREE.Vector3(cmd.startPos.x, cmd.startPos.y, cmd.startPos.z));
        points.push(new THREE.Vector3(cmd.endPos.x, cmd.endPos.y, cmd.endPos.z));
      }
      
      if (points.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        let material;
        if (cmd.type === 'rapid') {
          material = new THREE.LineBasicMaterial({ 
            color: viewSettings.showRapids ? 0xffa500 : 0x000000,
            opacity: viewSettings.showRapids ? 0.5 : 0,
            transparent: true
          });
        } else if (cmd.type === 'cut') {
          const color = viewSettings.colorBySpeed 
            ? new THREE.Color().setHSL((120 - (cmd.feedRate / 1000) * 120) / 360, 1, 0.5)
            : 0x0064ff;
          material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        } else {
          material = new THREE.LineBasicMaterial({ color: 0x00c864, linewidth: 2 });
        }
        
        const line = new THREE.Line(geometry, material);
        group.add(line);
        
        // Highlight current line
        if (i === playback.currentLine - 1) {
          const highlightMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff0000, 
            linewidth: 3 
          });
          const highlightLine = new THREE.Line(geometry.clone(), highlightMaterial);
          group.add(highlightLine);
        }
      }
    }
    
    sceneRef.current.add(group);
    toolpathRef.current = group;
    
    // Create tool (only if showing and doesn't exist)
    if (playback.showTool) {
      const toolGroup = new THREE.Group();
      
      if (isLathe) {
        // Create lathe turning tool
        const toolLength = 20;
        const toolWidth = 10;
        const toolHeight = 10;
        
        // Tool insert (cutting tip)
        const insertGeometry = new THREE.BoxGeometry(toolWidth, toolHeight, toolLength);
        const insertMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.3
        });
        const insert = new THREE.Mesh(insertGeometry, insertMaterial);
        insert.position.set(0, 0, toolLength / 2);
        
        // Tool holder
        const holderGeometry = new THREE.BoxGeometry(toolWidth * 1.5, toolHeight * 1.5, toolLength * 2);
        const holderMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x444444,
          metalness: 0.8
        });
        const holder = new THREE.Mesh(holderGeometry, holderMaterial);
        holder.position.set(0, 0, toolLength * 1.5);
        
        toolGroup.add(insert);
        toolGroup.add(holder);
        
        // Add workpiece (rotating cylinder for lathe)
        const workpieceRadius = 30;
        const workpieceLength = 100;
        const workpieceGeometry = new THREE.CylinderGeometry(
          workpieceRadius, workpieceRadius, workpieceLength, 32
        );
        const workpieceMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x8888ff,
          opacity: 0.7,
          transparent: true
        });
        const workpiece = new THREE.Mesh(workpieceGeometry, workpieceMaterial);
        workpiece.rotation.z = Math.PI / 2; // Rotate to align with Z axis
        workpiece.position.set(0, 0, -workpieceLength / 2);
        sceneRef.current.add(workpiece);
        
      } else {
        // Create milling tool
        const toolLength = 40;
        const toolGeometry = new THREE.CylinderGeometry(
          playback.toolDiameter / 2,
          playback.toolDiameter / 2,
          toolLength,
          16
        );
        
        const toolMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff0000,
          emissive: 0xff0000,
          emissiveIntensity: 0.3,
          opacity: 0.8,
          transparent: true,
          shininess: 100
        });
        
        const tool = new THREE.Mesh(toolGeometry, toolMaterial);
        tool.rotation.x = -Math.PI / 2;
        tool.position.set(0, 0, toolLength / 2);
        
        // Add holder/shank
        const shankGeometry = new THREE.CylinderGeometry(
          playback.toolDiameter / 2 + 1,
          playback.toolDiameter / 2 + 1,
          20,
          16
        );
        const shankMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x888888,
          metalness: 0.8,
          roughness: 0.2
        });
        const shank = new THREE.Mesh(shankGeometry, shankMaterial);
        shank.rotation.x = -Math.PI / 2;
        shank.position.set(0, 0, toolLength + 10);
        
        // Add tip
        const tipGeometry = new THREE.SphereGeometry(playback.toolDiameter / 2 * 1.1, 16, 16);
        const tipMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5
        });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0, 0);
        
        toolGroup.add(tool);
        toolGroup.add(shank);
        toolGroup.add(tip);
      }
      
      sceneRef.current.add(toolGroup);
      toolRef.current = toolGroup;
      
      // Set initial position
      updateToolPosition();
    }
    
    // Add bounding box
    if (parsedData.bounds) {
      const boxGeometry = new THREE.BoxGeometry(
        parsedData.bounds.maxX - parsedData.bounds.minX,
        parsedData.bounds.maxY - parsedData.bounds.minY,
        parsedData.bounds.maxZ - parsedData.bounds.minZ
      );
      const boxMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        wireframe: true,
        opacity: 0.2,
        transparent: true
      });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(
        (parsedData.bounds.maxX + parsedData.bounds.minX) / 2,
        (parsedData.bounds.maxY + parsedData.bounds.minY) / 2,
        (parsedData.bounds.maxZ + parsedData.bounds.minZ) / 2
      );
      group.add(box);
    }
  };
  
  // Animation loop for 2D only (rendering only, no state updates)
  const animate = () => {
    if (viewMode !== '2D') return;
    
    draw();
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Handle canvas mouse events
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    let lastX = startX;
    let lastY = startY;
    
    const handleMouseMove = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setViewSettings(prev => ({
        ...prev,
        offsetX: prev.offsetX + (currentX - lastX),
        offsetY: prev.offsetY + (currentY - lastY)
      }));
      
      lastX = currentX;
      lastY = currentY;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewSettings(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(10, prev.zoom * delta))
    }));
  };
  
  // Effects
  useEffect(() => {
    parseGCode();
    // Reset playback when G-code changes
    setPlayback(prev => ({ ...prev, currentLine: 0, isPlaying: false }));
  }, [gcode]);
  
  // Handle 2D canvas and animation
  useEffect(() => {
    if (viewMode === '2D' && canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set canvas size
      const updateCanvasSize = () => {
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = 400;
        }
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      
      // Start animation loop for 2D
      const startAnimation = () => {
        if (viewMode === '2D') {
          animate();
        }
      };
      startAnimation();
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }
  }, [parsedData, viewSettings, playback, viewMode]);
  
  // Initialize 3D when switching to 3D mode
  useEffect(() => {
    if (viewMode === '3D' && canvas3DRef.current) {
      // Small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        const cleanup = init3D();
        
        // Start render loop for 3D (only rendering, no state updates)
        // Initial draw
        draw3D();
        
        let frameId;
        const render3DLoop = () => {
          if (viewMode === '3D' && rendererRef.current && sceneRef.current && cameraRef.current) {
            // Don't redraw everything, just render the scene
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            frameId = requestAnimationFrame(render3DLoop);
          }
        };
        render3DLoop();
        
        return () => {
          if (frameId) cancelAnimationFrame(frameId);
        };
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Additional cleanup
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
        if (sceneRef.current) {
          sceneRef.current = null;
        }
        if (cameraRef.current) {
          cameraRef.current = null;
        }
      };
    }
  }, [viewMode, parsedData]);
  
  // Handle window resize for 3D
  useEffect(() => {
    if (viewMode === '3D' && canvas3DRef.current) {
      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = canvas3DRef.current.clientWidth / canvas3DRef.current.clientHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(canvas3DRef.current.clientWidth, canvas3DRef.current.clientHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [viewMode]);
  
  // Handle playback animation for both 2D and 3D
  useEffect(() => {
    if (playback.isPlaying && parsedData) {
      let animationId;
      let lastTime = performance.now();
      
      const updatePlayback = (currentTime) => {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Update based on time elapsed (60fps = 16.67ms per frame)
        // speed is lines per frame at 60fps, so adjust for actual frame time
        const linesPerMs = playback.speed / 16.67;
        const linesToAdvance = linesPerMs * deltaTime;
        
        setPlayback(prev => {
          const newLine = Math.min(prev.currentLine + linesToAdvance, parsedData.commands.length);
          if (newLine >= parsedData.commands.length) {
            return { ...prev, currentLine: parsedData.commands.length, isPlaying: false };
          }
          return { ...prev, currentLine: newLine };
        });
        
        animationId = requestAnimationFrame(updatePlayback);
      };
      
      animationId = requestAnimationFrame(updatePlayback);
      
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
      };
    }
  }, [playback.isPlaying, playback.speed, parsedData]);
  
  // Handle 3D scene updates when playback changes
  useEffect(() => {
    if (viewMode === '3D' && rendererRef.current && sceneRef.current && cameraRef.current) {
      // Only update tool position, don't recreate everything
      if (toolRef.current && playback.showTool) {
        updateToolPosition();
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback.currentLine, viewMode]);

  return (
    <div className="calculator-section">
      <h2>G-Code Simulator & Visualizer</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Machine Type</label>
          <select 
            value={machineType} 
            onChange={(e) => {
              setMachineType(e.target.value);
              setGcode(MACHINE_CONFIGS[e.target.value].example);
              setPlayback(prev => ({ 
                ...prev, 
                toolType: MACHINE_CONFIGS[e.target.value].toolTypes[0] 
              }));
            }}
          >
            {Object.entries(MACHINE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
            {MACHINE_CONFIGS[machineType].description}
          </small>
        </div>
        
        <div className="form-group">
          <label>View Mode</label>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="2D">2D View</option>
            <option value="3D">3D View</option>
          </select>
        </div>
        
        {/* View Cube for 3D navigation */}
        {viewMode === '3D' && (
          <div className="form-group" style={{ width: '100%' }}>
            <label>Quick Views</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(0, -300, 100);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Front
              </button>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(0, 300, 100);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Back
              </button>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(-300, 0, 100);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Left
              </button>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(300, 0, 100);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Right
              </button>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(0, 0, 400);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Top
              </button>
              <button 
                type="button"
                className="small-button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(200, 200, 200);
                    cameraRef.current.lookAt(0, 0, 0);
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                Iso
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="form-row">
        <div style={{ flex: 1 }}>
          <label>G-Code Input</label>
          <div style={{ 
            position: 'relative',
            width: '100%',
            height: '200px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {/* Line numbers and highlighting overlay */}
            {parsedData && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '40px',
                height: '100%',
                backgroundColor: '#f0f0f0',
                borderRight: '1px solid #ddd',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1
              }}>
                {gcode.split('\n').map((_, index) => (
                  <div
                    key={index}
                    style={{
                      height: '1.2em',
                      lineHeight: '1.2em',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      paddingRight: '5px',
                      textAlign: 'right',
                      color: parsedData && playback.currentLine > 0 && 
                             parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)]?.line === index + 1 
                             ? '#ff0000' : '#666',
                      backgroundColor: parsedData && playback.currentLine > 0 && 
                                     parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)]?.line === index + 1 
                                     ? '#ffeeee' : 'transparent',
                      fontWeight: parsedData && playback.currentLine > 0 && 
                                parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)]?.line === index + 1 
                                ? 'bold' : 'normal'
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
            
            {/* G-code textarea */}
            <textarea
              value={gcode}
              onChange={(e) => setGcode(e.target.value)}
              ref={(el) => {
                if (el && parsedData && playback.isPlaying && playback.currentLine > 0) {
                  // Auto-scroll to current line
                  const currentCmd = parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)];
                  if (currentCmd) {
                    const lineHeight = 14.4; // 1.2em * 12px
                    const scrollTop = Math.max(0, (currentCmd.line - 6) * lineHeight);
                    if (Math.abs(el.scrollTop - scrollTop) > lineHeight * 2) {
                      el.scrollTop = scrollTop;
                    }
                  }
                }
              }}
              style={{ 
                position: 'absolute',
                left: parsedData ? '40px' : '0',
                top: 0,
                width: parsedData ? 'calc(100% - 40px)' : '100%',
                height: '100%',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.2em',
                padding: '0 5px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent'
              }}
              placeholder="Paste your G-code here..."
            />
            
            {/* Current line highlight */}
            {parsedData && playback.currentLine > 0 && parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)] && (
              <div style={{
                position: 'absolute',
                left: '40px',
                top: `${(parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)].line - 1) * 14.4}px`,
                width: 'calc(100% - 40px)',
                height: '14.4px',
                backgroundColor: 'rgba(255, 255, 0, 0.3)',
                pointerEvents: 'none',
                zIndex: 0,
                transition: 'top 0.1s ease-out'
              }} />
            )}
          </div>
          
          <div className="form-row" style={{ marginTop: '10px' }}>
            <button className="btn" onClick={parseGCode}>
              Parse & Visualize
            </button>
            
            <input
              type="file"
              accept=".nc,.gcode,.txt"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setGcode(e.target.result);
                  reader.readAsText(file);
                }
              }}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="btn">
              Load File
            </label>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a1a'
      }}>
        <div style={{ display: viewMode === '2D' ? 'block' : 'none' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleCanvasWheel}
            style={{ 
              display: 'block',
              cursor: 'move',
              width: '100%',
              height: '400px'
            }}
          />
          
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px'
          }}>
            <div>Zoom: {(viewSettings.zoom * 100).toFixed(0)}%</div>
            <div>Click & drag to pan</div>
            <div>Scroll to zoom</div>
          </div>
        </div>
        
        <div style={{ display: viewMode === '3D' ? 'block' : 'none' }}>
          <canvas
            ref={canvas3DRef}
            width={800}
            height={400}
            style={{ 
              display: 'block',
              cursor: 'grab',
              width: '100%',
              height: '400px'
            }}
          />
          
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px'
          }}>
            <div>3D View</div>
            <div>Click & drag to rotate</div>
            <div>Scroll to zoom</div>
            <div>X: Red, Y: Green, Z: Blue</div>
          </div>
        </div>
      </div>
      
      <div className="form-row" style={{ marginTop: '10px' }}>
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        >
          {playback.isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button 
          className="btn"
          onClick={() => {
            setPlayback(prev => ({ ...prev, currentLine: 0, isPlaying: false }));
            // Force tool position update after reset
            setTimeout(() => {
              if (toolRef.current) {
                updateToolPosition();
              }
            }, 50);
          }}
        >
          ⏹ Reset
        </button>
        
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ 
            ...prev, 
            currentLine: Math.max(0, prev.currentLine - 1)
          }))}
        >
          ⏪ Step Back
        </button>
        
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ 
            ...prev, 
            currentLine: Math.min(parsedData?.commands.length || 0, prev.currentLine + 1)
          }))}
        >
          ⏩ Step Forward
        </button>
        
        <div className="form-group">
          <label>Playback Speed</label>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={playback.speed}
            onChange={(e) => setPlayback(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
          />
          <span style={{ minWidth: '100px', display: 'inline-block' }}>
            {playback.speed < 0.005 ? 'Very Slow' : 
             playback.speed < 0.02 ? 'Slow' : 
             playback.speed < 0.05 ? 'Normal' : 'Fast'} 
            ({(playback.speed * 60).toFixed(1)} lines/sec)
          </span>
        </div>
      </div>
      
      <div className="form-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showGrid}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
          />
          Show Grid
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showCoords}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showCoords: e.target.checked }))}
          />
          Show Coordinates
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showRapids}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showRapids: e.target.checked }))}
          />
          Show Rapids
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.colorBySpeed}
            onChange={(e) => setViewSettings(prev => ({ ...prev, colorBySpeed: e.target.checked }))}
          />
          Color by Speed
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={playback.showToolpath}
            onChange={(e) => setPlayback(prev => ({ ...prev, showToolpath: e.target.checked }))}
          />
          Show Full Path
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={playback.showTool}
            onChange={(e) => setPlayback(prev => ({ ...prev, showTool: e.target.checked }))}
          />
          Show Tool
        </label>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Tool Type</label>
          <select
            value={playback.toolType}
            onChange={(e) => setPlayback(prev => ({ ...prev, toolType: e.target.value }))}
          >
            {MACHINE_CONFIGS[machineType].toolTypes.map(tool => (
              <option key={tool} value={tool}>{tool}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Tool Diameter (mm)</label>
          <input
            type="number"
            value={playback.toolDiameter}
            onChange={(e) => setPlayback(prev => ({ ...prev, toolDiameter: parseFloat(e.target.value) }))}
            step="0.1"
            min="0.1"
            max="50"
          />
        </div>
        
        <button 
          className="btn"
          onClick={() => {
            setViewSettings({
              zoom: 2,
              offsetX: 50,
              offsetY: 50,
              showGrid: true,
              showCoords: true,
              showRapids: true,
              colorBySpeed: false
            });
          }}
        >
          Reset View
        </button>
        
        <button 
          className="btn"
          onClick={() => {
            if (parsedData) {
              const bounds = parsedData.bounds;
              const width = canvasRef.current.width;
              const height = canvasRef.current.height;
              
              const scaleX = (width - 100) / (bounds.maxX - bounds.minX);
              const scaleY = (height - 100) / (bounds.maxY - bounds.minY);
              const scale = Math.min(scaleX, scaleY);
              
              setViewSettings(prev => ({
                ...prev,
                zoom: scale,
                offsetX: width / 2 - (bounds.maxX + bounds.minX) / 2 * scale,
                offsetY: height / 2 + (bounds.maxY + bounds.minY) / 2 * scale
              }));
            }
          }}
        >
          Fit to View
        </button>
      </div>
      
      {statistics && (
        <div className="result-box">
          <h3>Toolpath Statistics</h3>
          
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Total Distance:</span>
                <span className="result-value">{statistics.totalDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Cutting Distance:</span>
                <span className="result-value">{statistics.cuttingDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Rapid Distance:</span>
                <span className="result-value">{statistics.rapidDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Commands:</span>
                <span className="result-value">{statistics.commandCount}</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Total Time:</span>
                <span className="result-value">{statistics.totalTime} min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Cutting Time:</span>
                <span className="result-value">{statistics.cuttingTime} min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Rapid Time:</span>
                <span className="result-value">{statistics.rapidTime} min</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Bounding Box:</span>
                <span className="result-value">
                  {statistics.boundingBox.width} × {statistics.boundingBox.height} × {statistics.boundingBox.depth} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="result-box" style={{ borderColor: 'var(--danger)' }}>
          <h3>Errors & Warnings</h3>
          {errors.map((error, idx) => (
            <p key={idx} className="info-text" style={{ color: 'var(--danger)' }}>
              Line {error.line}: {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default GCodeVisualizer;