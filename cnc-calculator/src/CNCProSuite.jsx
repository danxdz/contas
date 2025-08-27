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
    name: 'Untitled Project',
    gcode: {
      channel1: `; Main Program
G21 G90 G94
G54
T1 M06
S12000 M03
G00 X0 Y0 Z5`,
      channel2: `; Sub Program
G21 G90 G94
G55
T11 M06
S8000 M03
G00 X0 Y0 Z5`
    },
    stepFile: null,
    features: [],
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
    const controlsRef = { current: controls };

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
    // STEP file processing
    setProject(prev => ({
      ...prev,
      stepFile: file.name,
      features: [
        { type: 'pocket', depth: 10, width: 50, length: 80 },
        { type: 'hole', diameter: 10, depth: 20 },
        { type: 'slot', width: 8, length: 40, depth: 5 }
      ]
    }));
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
    if (!cameraRef.current) return;
    const positions = {
      top: [0, 0, 800],
      front: [0, -800, 0],
      side: [800, 0, 0],
      iso: [400, 400, 600]
    };
    const pos = positions[view];
    if (pos) {
      cameraRef.current.position.set(...pos);
      cameraRef.current.lookAt(0, 0, 0);
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
        { id: 'import', label: 'Import STEP...', action: () => togglePanel('stepProcessor') },
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
        { id: 'calculator', label: 'Feeds & Speeds Calculator', action: () => {} },
        { id: 'converter', label: 'Unit Converter', action: () => {} },
        { id: 'trigonometry', label: 'Trigonometry Calculator', action: () => {} },
        { divider: true },
        { id: 'toollib', label: 'Tool Library', action: () => togglePanel('tools') },
        { id: 'materials', label: 'Material Database', action: () => {} },
        { divider: true },
        { id: 'postprocessor', label: 'Post Processor', action: () => {} }
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
          stepFile={{ loaded: !!project.stepFile, fileName: project.stepFile, features: project.features }}
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