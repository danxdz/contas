import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './DualChannelEditor.css';

const DualChannelEditor = ({ program, setProgram, simulation }) => {
  // Editor states
  const [activeChannel, setActiveChannel] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ ch1: 0, ch2: 0 });
  const [selectedLines, setSelectedLines] = useState({ ch1: [], ch2: [] });
  const [breakpoints, setBreakpoints] = useState({ ch1: [], ch2: [] });
  const [editMode, setEditMode] = useState('edit'); // edit, debug, sync
  
  // Simulation states
  const [stack1, setStack1] = useState([]);
  const [stack2, setStack2] = useState([]);
  const [variables, setVariables] = useState({});
  const [syncPoints, setSyncPoints] = useState([]);
  const [toolPosition, setToolPosition] = useState({ 
    ch1: { x: 0, y: 0, z: 0, a: 0, b: 0 },
    ch2: { x: 0, y: 0, z: 0, a: 0, b: 0 }
  });
  
  // Refs
  const editor1Ref = useRef(null);
  const editor2Ref = useRef(null);
  const viewport3DRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);
  const tool1Ref = useRef(null);
  const tool2Ref = useRef(null);
  
  // Initialize 3D visualization
  useEffect(() => {
    if (!viewport3DRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1e2a);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      viewport3DRef.current.clientWidth / viewport3DRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(400, 400, 600);
    camera.up.set(0, 0, 1);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewport3DRef.current.clientWidth, viewport3DRef.current.clientHeight);
    viewport3DRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 200);
    scene.add(directionalLight);
    
    // Grid
    const gridHelper = new THREE.GridHelper(600, 60, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);
    
    // Axes
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    
    // Add machine representation
    addMachineVisualization(scene);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      updateToolPositions();
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (viewport3DRef.current && renderer.domElement) {
        viewport3DRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Add machine visualization
  const addMachineVisualization = (scene) => {
    // Main spindle (Channel 1)
    const mainSpindleGeom = new THREE.CylinderGeometry(30, 30, 60, 32);
    const mainSpindleMat = new THREE.MeshPhongMaterial({ color: 0x4444ff });
    const mainSpindle = new THREE.Mesh(mainSpindleGeom, mainSpindleMat);
    mainSpindle.position.set(-150, 0, 50);
    mainSpindle.rotateX(Math.PI / 2);
    scene.add(mainSpindle);
    
    // Sub spindle (Channel 2)
    const subSpindleGeom = new THREE.CylinderGeometry(30, 30, 60, 32);
    const subSpindleMat = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const subSpindle = new THREE.Mesh(subSpindleGeom, subSpindleMat);
    subSpindle.position.set(150, 0, 50);
    subSpindle.rotateX(Math.PI / 2);
    scene.add(subSpindle);
    
    // Tool 1
    const tool1Group = new THREE.Group();
    const tool1Geom = new THREE.CylinderGeometry(5, 5, 40, 16);
    const tool1Mat = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2
    });
    const tool1 = new THREE.Mesh(tool1Geom, tool1Mat);
    tool1.rotateX(-Math.PI / 2);
    tool1Group.add(tool1);
    tool1Group.position.set(-150, 0, 100);
    tool1Ref.current = tool1Group;
    scene.add(tool1Group);
    
    // Tool 2
    const tool2Group = new THREE.Group();
    const tool2Geom = new THREE.CylinderGeometry(5, 5, 40, 16);
    const tool2Mat = new THREE.MeshPhongMaterial({ 
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.2
    });
    const tool2 = new THREE.Mesh(tool2Geom, tool2Mat);
    tool2.rotateX(-Math.PI / 2);
    tool2Group.add(tool2);
    tool2Group.position.set(150, 0, 100);
    tool2Ref.current = tool2Group;
    scene.add(tool2Group);
    
    // Workpiece
    const workpieceGeom = new THREE.CylinderGeometry(40, 40, 200, 32);
    const workpieceMat = new THREE.MeshPhongMaterial({ 
      color: 0x8888ff,
      transparent: true,
      opacity: 0.7
    });
    const workpiece = new THREE.Mesh(workpieceGeom, workpieceMat);
    workpiece.rotateZ(Math.PI / 2);
    workpiece.position.set(0, 0, 50);
    scene.add(workpiece);
  };
  
  // Update tool positions based on parsed G-code
  const updateToolPositions = () => {
    if (tool1Ref.current) {
      tool1Ref.current.position.set(
        -150 + toolPosition.ch1.x,
        toolPosition.ch1.y,
        100 + toolPosition.ch1.z
      );
    }
    if (tool2Ref.current) {
      tool2Ref.current.position.set(
        150 + toolPosition.ch2.x,
        toolPosition.ch2.y,
        100 + toolPosition.ch2.z
      );
    }
  };
  
  // Parse line and update position
  const parseLine = (line, channel) => {
    const position = { ...toolPosition[`ch${channel}`] };
    const parts = line.toUpperCase().split(/\s+/);
    
    parts.forEach(part => {
      if (part.startsWith('X')) position.x = parseFloat(part.slice(1)) || 0;
      if (part.startsWith('Y')) position.y = parseFloat(part.slice(1)) || 0;
      if (part.startsWith('Z')) position.z = parseFloat(part.slice(1)) || 0;
      if (part.startsWith('A')) position.a = parseFloat(part.slice(1)) || 0;
      if (part.startsWith('B')) position.b = parseFloat(part.slice(1)) || 0;
    });
    
    setToolPosition(prev => ({
      ...prev,
      [`ch${channel}`]: position
    }));
    
    // Check for variables
    if (line.includes('#')) {
      const varMatch = line.match(/#(\d+)\s*=\s*([\d.-]+)/);
      if (varMatch) {
        setVariables(prev => ({
          ...prev,
          [`#${varMatch[1]}`]: parseFloat(varMatch[2])
        }));
      }
    }
    
    // Check for WAIT command
    if (line.includes('WAIT')) {
      setSyncPoints(prev => [...prev, { 
        channel, 
        line: program.currentLine[`ch${channel}`],
        type: 'WAIT'
      }]);
    }
  };
  
  // Handle text change with live parsing
  const handleTextChange = (channel, value) => {
    setProgram(prev => ({
      ...prev,
      [`channel${channel}`]: value
    }));
    
    // Live parse the current line
    const lines = value.split('\n');
    const currentLineIdx = program.currentLine[`ch${channel}`];
    if (lines[currentLineIdx]) {
      parseLine(lines[currentLineIdx], channel);
    }
  };
  
  // Step execution
  const stepExecution = useCallback(() => {
    const lines1 = program.channel1.split('\n');
    const lines2 = program.channel2.split('\n');
    
    let newLine1 = program.currentLine.ch1;
    let newLine2 = program.currentLine.ch2;
    
    // Check for breakpoints
    if (breakpoints.ch1.includes(newLine1) || breakpoints.ch2.includes(newLine2)) {
      console.log('Breakpoint hit!');
      return;
    }
    
    // Process channel 1
    if (newLine1 < lines1.length) {
      const line = lines1[newLine1];
      if (!line.trim().startsWith(';')) { // Skip comments
        parseLine(line, 1);
        
        // Handle subroutine calls
        if (line.includes('M98')) {
          setStack1(prev => [...prev, `P${line.match(/P(\d+)/)?.[1] || '?'}`]);
        } else if (line.includes('M99')) {
          setStack1(prev => prev.slice(0, -1));
        }
      }
      newLine1++;
    }
    
    // Process channel 2
    if (newLine2 < lines2.length) {
      const line = lines2[newLine2];
      if (!line.trim().startsWith(';')) {
        parseLine(line, 2);
        
        if (line.includes('M98')) {
          setStack2(prev => [...prev, `P${line.match(/P(\d+)/)?.[1] || '?'}`]);
        } else if (line.includes('M99')) {
          setStack2(prev => prev.slice(0, -1));
        }
      }
      newLine2++;
    }
    
    setProgram(prev => ({
      ...prev,
      currentLine: { ch1: newLine1, ch2: newLine2 }
    }));
  }, [program, breakpoints]);
  
  // Toggle breakpoint
  const toggleBreakpoint = (channel, lineNumber) => {
    setBreakpoints(prev => {
      const channelKey = `ch${channel}`;
      const current = prev[channelKey];
      if (current.includes(lineNumber)) {
        return {
          ...prev,
          [channelKey]: current.filter(l => l !== lineNumber)
        };
      } else {
        return {
          ...prev,
          [channelKey]: [...current, lineNumber]
        };
      }
    });
  };
  
  // Auto-scroll to current line
  useEffect(() => {
    if (editor1Ref.current) {
      const lineHeight = 20;
      const scrollTop = program.currentLine.ch1 * lineHeight - 100;
      editor1Ref.current.scrollTop = scrollTop;
    }
    if (editor2Ref.current) {
      const lineHeight = 20;
      const scrollTop = program.currentLine.ch2 * lineHeight - 100;
      editor2Ref.current.scrollTop = scrollTop;
    }
  }, [program.currentLine]);
  
  // Render line numbers with features
  const renderLineNumbers = (channel, lineCount) => {
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      const isCurrentLine = i === program.currentLine[`ch${channel}`];
      const hasBreakpoint = breakpoints[`ch${channel}`].includes(i);
      const isSelected = selectedLines[`ch${channel}`].includes(i);
      
      lines.push(
        <div 
          key={i}
          className={`line-number ${isCurrentLine ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => toggleBreakpoint(channel, i)}
        >
          {hasBreakpoint && <span className="breakpoint">●</span>}
          <span className="line-num">{i + 1}</span>
        </div>
      );
    }
    return lines;
  };
  
  return (
    <div className="dual-channel-editor">
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button 
            className={editMode === 'edit' ? 'active' : ''}
            onClick={() => setEditMode('edit')}
            title="Edit Mode"
          >
            ✏️ Edit
          </button>
          <button 
            className={editMode === 'debug' ? 'active' : ''}
            onClick={() => setEditMode('debug')}
            title="Debug Mode"
          >
            🐛 Debug
          </button>
          <button 
            className={editMode === 'sync' ? 'active' : ''}
            onClick={() => setEditMode('sync')}
            title="Sync Mode"
          >
            🔄 Sync
          </button>
        </div>
        
        <div className="toolbar-separator" />
        
        <div className="toolbar-group">
          <button onClick={() => stepExecution()} title="Step">⏭️</button>
          <button onClick={() => {
            const interval = setInterval(() => {
              stepExecution();
              if (program.currentLine.ch1 >= program.channel1.split('\n').length &&
                  program.currentLine.ch2 >= program.channel2.split('\n').length) {
                clearInterval(interval);
              }
            }, 100);
          }} title="Run">▶️</button>
          <button onClick={() => setProgram(prev => ({
            ...prev,
            currentLine: { ch1: 0, ch2: 0 }
          }))} title="Reset">⏹️</button>
        </div>
        
        <div className="toolbar-separator" />
        
        <div className="toolbar-info">
          <span>CH1: Line {program.currentLine.ch1 + 1} | X:{toolPosition.ch1.x.toFixed(2)} Y:{toolPosition.ch1.y.toFixed(2)} Z:{toolPosition.ch1.z.toFixed(2)}</span>
          <span className="separator">|</span>
          <span>CH2: Line {program.currentLine.ch2 + 1} | X:{toolPosition.ch2.x.toFixed(2)} Y:{toolPosition.ch2.y.toFixed(2)} Z:{toolPosition.ch2.z.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="editor-layout">
        {/* Channel 1 Editor */}
        <div className="channel-editor">
          <div className="channel-header">
            <span className="channel-title">Channel 1 - Main Spindle</span>
            <span className="channel-stack">Stack: [{stack1.join(' → ') || 'MAIN'}]</span>
          </div>
          <div className="editor-container">
            <div className="line-numbers">
              {renderLineNumbers(1, program.channel1.split('\n').length)}
            </div>
            <textarea
              ref={editor1Ref}
              className="code-editor"
              value={program.channel1}
              onChange={(e) => handleTextChange(1, e.target.value)}
              onScroll={(e) => {
                // Sync scroll with line numbers
                const lineNumbersDiv = e.target.previousSibling;
                if (lineNumbersDiv) {
                  lineNumbersDiv.scrollTop = e.target.scrollTop;
                }
              }}
              spellCheck={false}
              style={{
                backgroundImage: `linear-gradient(
                  transparent ${program.currentLine.ch1 * 20}px,
                  rgba(0, 212, 255, 0.1) ${program.currentLine.ch1 * 20}px,
                  rgba(0, 212, 255, 0.1) ${(program.currentLine.ch1 + 1) * 20}px,
                  transparent ${(program.currentLine.ch1 + 1) * 20}px
                )`
              }}
            />
          </div>
        </div>
        
        {/* Center Panel - 3D Visualization & Variables */}
        <div className="center-panel">
          <div className="visualization-3d" ref={viewport3DRef} />
          
          <div className="info-panel">
            <div className="variables-section">
              <h4>Variables</h4>
              <div className="variables-list">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="variable-item">
                    <span className="var-name">{key}</span>
                    <span className="var-value">{value}</span>
                  </div>
                ))}
                {Object.keys(variables).length === 0 && (
                  <div className="empty-state">No variables set</div>
                )}
              </div>
            </div>
            
            <div className="sync-section">
              <h4>Synchronization</h4>
              <div className="sync-list">
                {syncPoints.map((point, idx) => (
                  <div key={idx} className="sync-item">
                    CH{point.channel} Line {point.line}: {point.type}
                  </div>
                ))}
                {syncPoints.length === 0 && (
                  <div className="empty-state">No sync points</div>
                )}
              </div>
            </div>
            
            {editMode === 'debug' && (
              <div className="debug-controls">
                <h4>Debug Controls</h4>
                <button onClick={stepExecution}>Step Forward</button>
                <button onClick={() => {
                  setStack1([]);
                  setStack2([]);
                  setVariables({});
                  setSyncPoints([]);
                }}>Clear State</button>
              </div>
            )}
          </div>
        </div>
        
        {/* Channel 2 Editor */}
        <div className="channel-editor">
          <div className="channel-header">
            <span className="channel-title">Channel 2 - Sub Spindle</span>
            <span className="channel-stack">Stack: [{stack2.join(' → ') || 'MAIN'}]</span>
          </div>
          <div className="editor-container">
            <div className="line-numbers">
              {renderLineNumbers(2, program.channel2.split('\n').length)}
            </div>
            <textarea
              ref={editor2Ref}
              className="code-editor"
              value={program.channel2}
              onChange={(e) => handleTextChange(2, e.target.value)}
              onScroll={(e) => {
                const lineNumbersDiv = e.target.previousSibling;
                if (lineNumbersDiv) {
                  lineNumbersDiv.scrollTop = e.target.scrollTop;
                }
              }}
              spellCheck={false}
              style={{
                backgroundImage: `linear-gradient(
                  transparent ${program.currentLine.ch2 * 20}px,
                  rgba(255, 170, 0, 0.1) ${program.currentLine.ch2 * 20}px,
                  rgba(255, 170, 0, 0.1) ${(program.currentLine.ch2 + 1) * 20}px,
                  transparent ${(program.currentLine.ch2 + 1) * 20}px
                )`
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="editor-status-bar">
        <span className="status-item">Mode: {editMode.toUpperCase()}</span>
        <span className="status-item">Variables: {Object.keys(variables).length}</span>
        <span className="status-item">Sync Points: {syncPoints.length}</span>
        <span className="status-item">Breakpoints: CH1[{breakpoints.ch1.length}] CH2[{breakpoints.ch2.length}]</span>
      </div>
    </div>
  );
};

export default DualChannelEditor;