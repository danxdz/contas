import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import './CNCMasterSuite.css';

// Module imports
import DualChannelDebugger from './components/DualChannelDebugger';
import StepProcessor from './components/StepProcessor';
import ToolpathGenerator from './components/ToolpathGenerator';
import SimulationEngine from './components/SimulationEngine';

// Calculator modules
import {
  ToolLifeCalculator,
  CircularInterpolation,
  PowerTorqueCalculator,
  GeometryTools,
  PocketMillingWizard,
  FeedsSpeedsOptimizer,
  ToolDatabase
} from './components/modules/index.jsx';

const CNCMasterSuite = () => {
  // Core states
  const [layout, setLayout] = useState({
    menuVisible: true,
    leftPanel: { visible: true, width: 350, activeTab: 'program' },
    rightPanel: { visible: true, width: 300, activeTab: 'tools' },
    bottomPanel: { visible: false, height: 200, activeTab: 'console' },
    centerView: 'simulator' // simulator, dual-channel, step-processor
  });

  const [project, setProject] = useState({
    name: 'New Project',
    type: 'milling', // milling, turning, swiss, multi-spindle
    channels: 1, // 1 or 2 for dual-channel
    units: 'metric',
    machine: {
      type: '3-axis',
      maxTravel: { x: 500, y: 400, z: 300 },
      maxSpindle: 24000,
      toolCapacity: 20
    }
  });

  const [program, setProgram] = useState({
    channel1: `; Channel 1 - Main Spindle
G21 G90 G94
G54
T1 M06
S12000 M03
G00 X0 Y0 Z5
; Your program here`,
    channel2: `; Channel 2 - Sub Spindle
G21 G90 G94
G55
T11 M06
S8000 M03
G00 X0 Y0 Z5
; Your program here`,
    activeChannel: 1,
    currentLine: { ch1: 0, ch2: 0 },
    synchronization: []
  });

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    isPaused: false,
    speed: 1.0,
    showToolpath: true,
    showTool: true,
    showStock: true,
    materialRemoval: false,
    collisionDetection: false
  });

  const [stepFile, setStepFile] = useState({
    loaded: false,
    fileName: null,
    features: [], // Detected features from STEP
    suggestedTools: [],
    generatedCode: null
  });

  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current || layout.centerView !== 'simulator') return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1e2a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(300, 300, 500);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 200);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [layout.centerView]);

  // Menu structure
  const menuItems = {
    file: {
      label: 'File',
      items: [
        { id: 'new', label: 'New Project', shortcut: 'Ctrl+N', action: () => newProject() },
        { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => openFile() },
        { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => saveProject() },
        { divider: true },
        { id: 'import-step', label: 'Import STEP...', action: () => importSTEP() },
        { id: 'import-gcode', label: 'Import G-code...', action: () => importGCode() },
        { divider: true },
        { id: 'export', label: 'Export G-code...', action: () => exportGCode() },
        { divider: true },
        { id: 'exit', label: 'Exit', action: () => window.close() }
      ]
    },
    edit: {
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
        { divider: true },
        { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
        { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
        { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' }
      ]
    },
    view: {
      label: 'View',
      items: [
        { id: 'simulator', label: 'Simulator', checked: layout.centerView === 'simulator', action: () => setCenterView('simulator') },
        { id: 'dual-channel', label: 'Dual Channel', checked: layout.centerView === 'dual-channel', action: () => setCenterView('dual-channel') },
        { id: 'step-processor', label: 'STEP Processor', checked: layout.centerView === 'step-processor', action: () => setCenterView('step-processor') },
        { divider: true },
        { id: 'left-panel', label: 'Left Panel', checked: layout.leftPanel.visible, action: () => togglePanel('left') },
        { id: 'right-panel', label: 'Right Panel', checked: layout.rightPanel.visible, action: () => togglePanel('right') },
        { id: 'bottom-panel', label: 'Bottom Panel', checked: layout.bottomPanel.visible, action: () => togglePanel('bottom') },
        { divider: true },
        { id: 'fullscreen', label: 'Fullscreen', shortcut: 'F11', action: () => toggleFullscreen() }
      ]
    },
    machine: {
      label: 'Machine',
      items: [
        { id: '3-axis', label: '3-Axis Mill', checked: project.machine.type === '3-axis', action: () => setMachineType('3-axis') },
        { id: '4-axis', label: '4-Axis Mill', checked: project.machine.type === '4-axis', action: () => setMachineType('4-axis') },
        { id: '5-axis', label: '5-Axis Mill', checked: project.machine.type === '5-axis', action: () => setMachineType('5-axis') },
        { divider: true },
        { id: 'lathe', label: 'CNC Lathe', checked: project.machine.type === 'lathe', action: () => setMachineType('lathe') },
        { id: 'swiss', label: 'Swiss Type', checked: project.machine.type === 'swiss', action: () => setMachineType('swiss') },
        { id: 'multi-spindle', label: 'Multi-Spindle', checked: project.machine.type === 'multi-spindle', action: () => setMachineType('multi-spindle') },
        { divider: true },
        { id: 'configure', label: 'Configure Machine...', action: () => openMachineConfig() }
      ]
    },
    tools: {
      label: 'Tools',
      items: [
        { id: 'tool-database', label: 'Tool Database', action: () => openToolDatabase() },
        { id: 'tool-setter', label: 'Tool Setter', action: () => openToolSetter() },
        { divider: true },
        { id: 'feeds-speeds', label: 'Feeds & Speeds Calculator', action: () => openCalculator('feeds-speeds') },
        { id: 'thread-calc', label: 'Thread Calculator', action: () => openCalculator('thread') },
        { id: 'trig-calc', label: 'Trigonometry Calculator', action: () => openCalculator('trig') }
      ]
    },
    simulation: {
      label: 'Simulation',
      items: [
        { id: 'play', label: 'Play/Pause', shortcut: 'Space', action: () => togglePlayPause() },
        { id: 'stop', label: 'Stop', action: () => stopSimulation() },
        { id: 'step', label: 'Step Forward', shortcut: 'F10', action: () => stepForward() },
        { divider: true },
        { id: 'material-removal', label: 'Material Removal', checked: simulation.materialRemoval, action: () => toggleMaterialRemoval() },
        { id: 'collision', label: 'Collision Detection', checked: simulation.collisionDetection, action: () => toggleCollisionDetection() },
        { divider: true },
        { id: 'speed', label: 'Simulation Speed...', action: () => openSpeedControl() }
      ]
    },
    help: {
      label: 'Help',
      items: [
        { id: 'documentation', label: 'Documentation', action: () => openDocs() },
        { id: 'tutorials', label: 'Tutorials', action: () => openTutorials() },
        { divider: true },
        { id: 'about', label: 'About CNC Master Suite', action: () => showAbout() }
      ]
    }
  };

  // Action handlers
  const newProject = () => {
    setProject({
      name: 'New Project',
      type: 'milling',
      channels: 1,
      units: 'metric',
      machine: { type: '3-axis', maxTravel: { x: 500, y: 400, z: 300 }, maxSpindle: 24000, toolCapacity: 20 }
    });
    setProgram({
      channel1: `; New Program\nG21 G90 G94\nG54\n`,
      channel2: `; Channel 2\nG21 G90 G94\nG55\n`,
      activeChannel: 1,
      currentLine: { ch1: 0, ch2: 0 },
      synchronization: []
    });
  };

  const openFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cnc,.nc,.gcode,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProgram(prev => ({ ...prev, channel1: event.target.result }));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const importSTEP = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.step,.stp,.iges,.igs';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Process STEP file
        processSTEPFile(file);
      }
    };
    input.click();
  };

  const processSTEPFile = async (file) => {
    // This would integrate with a STEP processing library
    // For now, we'll simulate the process
    setStepFile({
      loaded: true,
      fileName: file.name,
      features: [
        { type: 'pocket', depth: 10, width: 50, length: 80 },
        { type: 'hole', diameter: 10, depth: 20, count: 4 },
        { type: 'slot', width: 8, length: 40, depth: 5 }
      ],
      suggestedTools: [
        { type: 'endmill', diameter: 10, flutes: 4 },
        { type: 'drill', diameter: 10 },
        { type: 'slotmill', diameter: 8, flutes: 2 }
      ],
      generatedCode: null
    });
    
    // Switch to STEP processor view
    setLayout(prev => ({ ...prev, centerView: 'step-processor' }));
  };

  const exportGCode = () => {
    const gcode = project.channels === 2 
      ? `; Channel 1\n${program.channel1}\n\n; Channel 2\n${program.channel2}`
      : program.channel1;
    
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.nc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setCenterView = (view) => {
    setLayout(prev => ({ ...prev, centerView: view }));
  };

  const togglePanel = (panel) => {
    setLayout(prev => ({
      ...prev,
      [`${panel}Panel`]: {
        ...prev[`${panel}Panel`],
        visible: !prev[`${panel}Panel`].visible
      }
    }));
  };

  const setMachineType = (type) => {
    setProject(prev => ({
      ...prev,
      machine: { ...prev.machine, type },
      channels: ['swiss', 'multi-spindle'].includes(type) ? 2 : 1
    }));
  };

  const togglePlayPause = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
      isPaused: prev.isPlaying
    }));
  };

  const renderCenterView = () => {
    switch(layout.centerView) {
      case 'simulator':
        return (
          <div ref={mountRef} className="simulator-viewport" />
        );
      case 'dual-channel':
        return (
          <DualChannelDebugger 
            program={program}
            setProgram={setProgram}
            simulation={simulation}
          />
        );
      case 'step-processor':
        return (
          <StepProcessor 
            stepFile={stepFile}
            onGenerateCode={(code) => setProgram(prev => ({ ...prev, channel1: code }))}
          />
        );
      default:
        return <div>Select a view</div>;
    }
  };

  // Placeholder functions for menu actions
  const saveProject = () => console.log('Save project');
  const importGCode = () => console.log('Import G-code');
  const toggleFullscreen = () => document.documentElement.requestFullscreen();
  const openMachineConfig = () => console.log('Open machine config');
  const openToolDatabase = () => console.log('Open tool database');
  const openToolSetter = () => console.log('Open tool setter');
  const openCalculator = (type) => console.log(`Open ${type} calculator`);
  const stopSimulation = () => setSimulation(prev => ({ ...prev, isPlaying: false, currentLine: { ch1: 0, ch2: 0 } }));
  const stepForward = () => console.log('Step forward');
  const toggleMaterialRemoval = () => setSimulation(prev => ({ ...prev, materialRemoval: !prev.materialRemoval }));
  const toggleCollisionDetection = () => setSimulation(prev => ({ ...prev, collisionDetection: !prev.collisionDetection }));
  const openSpeedControl = () => console.log('Open speed control');
  const openDocs = () => window.open('https://github.com/danxdz/contas', '_blank');
  const openTutorials = () => console.log('Open tutorials');
  const showAbout = () => alert('CNC Master Suite v1.0\nA comprehensive CNC programming and simulation platform');

  return (
    <div className="cnc-master-suite">
      {/* Menu Bar */}
      {layout.menuVisible && (
        <div className="menu-bar">
          {Object.entries(menuItems).map(([key, menu]) => (
            <div key={key} className="menu-item">
              <button className="menu-button">{menu.label}</button>
              <div className="menu-dropdown">
                {menu.items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} className="menu-divider" />
                  ) : (
                    <button 
                      key={item.id}
                      className="menu-option"
                      onClick={item.action}
                    >
                      <span className="menu-label">{item.label}</span>
                      {item.checked && <span className="menu-check">✓</span>}
                      {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button title="New" onClick={newProject}>📄</button>
          <button title="Open" onClick={openFile}>📁</button>
          <button title="Save" onClick={saveProject}>💾</button>
        </div>
        <div className="toolbar-separator" />
        <div className="toolbar-group">
          <button title="Play/Pause" onClick={togglePlayPause}>
            {simulation.isPlaying ? '⏸️' : '▶️'}
          </button>
          <button title="Stop" onClick={stopSimulation}>⏹️</button>
          <button title="Step" onClick={stepForward}>⏭️</button>
        </div>
        <div className="toolbar-separator" />
        <div className="toolbar-group">
          <span className="toolbar-info">
            {project.name} | {project.machine.type} | 
            {project.channels === 2 ? ' Dual Channel' : ' Single Channel'}
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Panel */}
        {layout.leftPanel.visible && (
          <div className="panel panel-left" style={{ width: layout.leftPanel.width }}>
            <div className="panel-tabs">
              <button 
                className={layout.leftPanel.activeTab === 'program' ? 'active' : ''}
                onClick={() => setLayout(prev => ({ 
                  ...prev, 
                  leftPanel: { ...prev.leftPanel, activeTab: 'program' }
                }))}
              >
                Program
              </button>
              <button 
                className={layout.leftPanel.activeTab === 'features' ? 'active' : ''}
                onClick={() => setLayout(prev => ({ 
                  ...prev, 
                  leftPanel: { ...prev.leftPanel, activeTab: 'features' }
                }))}
              >
                Features
              </button>
            </div>
            <div className="panel-content">
              {layout.leftPanel.activeTab === 'program' && (
                <div className="code-editor">
                  <textarea 
                    value={program.activeChannel === 1 ? program.channel1 : program.channel2}
                    onChange={(e) => setProgram(prev => ({
                      ...prev,
                      [program.activeChannel === 1 ? 'channel1' : 'channel2']: e.target.value
                    }))}
                    spellCheck={false}
                  />
                </div>
              )}
              {layout.leftPanel.activeTab === 'features' && stepFile.loaded && (
                <div className="features-list">
                  <h3>Detected Features</h3>
                  {stepFile.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <span>{feature.type}</span>
                      <span>{JSON.stringify(feature)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center View */}
        <div className="center-view">
          {renderCenterView()}
        </div>

        {/* Right Panel */}
        {layout.rightPanel.visible && (
          <div className="panel panel-right" style={{ width: layout.rightPanel.width }}>
            <div className="panel-tabs">
              <button 
                className={layout.rightPanel.activeTab === 'tools' ? 'active' : ''}
                onClick={() => setLayout(prev => ({ 
                  ...prev, 
                  rightPanel: { ...prev.rightPanel, activeTab: 'tools' }
                }))}
              >
                Tools
              </button>
              <button 
                className={layout.rightPanel.activeTab === 'setup' ? 'active' : ''}
                onClick={() => setLayout(prev => ({ 
                  ...prev, 
                  rightPanel: { ...prev.rightPanel, activeTab: 'setup' }
                }))}
              >
                Setup
              </button>
            </div>
            <div className="panel-content">
              {layout.rightPanel.activeTab === 'tools' && (
                <div className="tools-panel">
                  <h3>Tool Library</h3>
                  {stepFile.suggestedTools.map((tool, idx) => (
                    <div key={idx} className="tool-item">
                      T{idx + 1}: {tool.type} ⌀{tool.diameter}mm
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      {layout.bottomPanel.visible && (
        <div className="panel panel-bottom" style={{ height: layout.bottomPanel.height }}>
          <div className="panel-tabs">
            <button className={layout.bottomPanel.activeTab === 'console' ? 'active' : ''}>Console</button>
            <button className={layout.bottomPanel.activeTab === 'variables' ? 'active' : ''}>Variables</button>
          </div>
          <div className="panel-content">
            <div className="console">
              Ready...
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="status-bar">
        <span>Ready</span>
        <span className="status-separator">|</span>
        <span>Line: {program.currentLine.ch1}</span>
        <span className="status-separator">|</span>
        <span>X: 0.000 Y: 0.000 Z: 0.000</span>
        <span className="status-separator">|</span>
        <span>F: 0 S: 0</span>
      </div>
    </div>
  );
};

export default CNCMasterSuite;