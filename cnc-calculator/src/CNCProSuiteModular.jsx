import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Workbench System
import { WorkbenchProvider, WorkbenchSwitcher, eventBus } from './workbenches/WorkbenchSystem';
import { CAMWorkbench } from './workbenches/CAMWorkbench';
import { ToolWorkbench } from './workbenches/ToolWorkbench';
import { SetupWorkbench } from './workbenches/SetupWorkbench';
import { SimulationWorkbench } from './workbenches/SimulationWorkbench';

// Components
import GCodeEditor from './components/GCodeEditor';
import ProfessionalToolSystem from './components/ProfessionalToolSystem';
import ToolManager from './components/ToolManager';
import ToolOffsetTable from './components/ToolOffsetTable';

// Initialize workbenches
const workbenches = [
  new CAMWorkbench(),
  new ToolWorkbench(),
  new SetupWorkbench(),
  new SimulationWorkbench()
];

const CNCProSuiteModular = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameId = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const toolRef = useRef(null);
  const toolpathRef = useRef(null);
  const stockRef = useRef(null);

  // State management
  const [activeWorkbench, setActiveWorkbench] = useState(workbenches[0]);
  const [panels, setPanels] = useState({});
  const [simulation, setSimulation] = useState({
    isPlaying: false,
    currentLine: 0,
    positions: [],
    feedRate: 0,
    spindleSpeed: 0,
    toolAssembly: null
  });
  const [gcode, setGcode] = useState('');
  const [tools, setTools] = useState([]);
  const [toolAssemblies, setToolAssemblies] = useState([]);
  const [stock, setStock] = useState({
    width: 200,
    height: 100,
    depth: 50,
    material: 'Aluminum 6061'
  });
  const [workOffsets, setWorkOffsets] = useState({
    G54: { x: 0, y: 0, z: 0 },
    G55: { x: 0, y: 0, z: 0 },
    G56: { x: 0, y: 0, z: 0 },
    G57: { x: 0, y: 0, z: 0 },
    G58: { x: 0, y: 0, z: 0 },
    G59: { x: 0, y: 0, z: 0 }
  });
  const [activeWorkOffset, setActiveWorkOffset] = useState('G54');

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 200, 1000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(200, 200, 300);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(400, 40, 0x404040, 0x303030);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Create stock
    const stockGeometry = new THREE.BoxGeometry(stock.width, stock.depth, stock.height);
    const stockMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b7355,
      transparent: true,
      opacity: 0.8
    });
    const stockMesh = new THREE.Mesh(stockGeometry, stockMaterial);
    stockMesh.position.set(stock.width / 2, stock.depth / 2, -stock.height / 2);
    stockMesh.castShadow = true;
    stockMesh.receiveShadow = true;
    scene.add(stockMesh);
    stockRef.current = stockMesh;

    // Create initial tool
    createTool();

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controlsRef.current.update();
      rendererRef.current.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create tool geometry
  const createTool = (assembly = null) => {
    if (!sceneRef.current) return;

    // Remove old tool
    if (toolRef.current) {
      sceneRef.current.remove(toolRef.current);
    }

    const toolGroup = new THREE.Group();

    if (assembly) {
      // Create detailed tool from assembly
      // Holder
      const holderGeometry = new THREE.CylinderGeometry(15, 25, 80);
      const holderMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
      const holder = new THREE.Mesh(holderGeometry, holderMaterial);
      holder.position.y = 40;
      toolGroup.add(holder);

      // Collet
      const colletGeometry = new THREE.CylinderGeometry(12, 12, 30);
      const colletMaterial = new THREE.MeshPhongMaterial({ color: 0x8a8a8a });
      const collet = new THREE.Mesh(colletGeometry, colletMaterial);
      collet.position.y = -5;
      toolGroup.add(collet);

      // Tool shank
      const shankGeometry = new THREE.CylinderGeometry(
        assembly.tool?.diameter / 2 || 3,
        assembly.tool?.diameter / 2 || 3,
        30
      );
      const shankMaterial = new THREE.MeshPhongMaterial({ color: 0x6a6a6a });
      const shank = new THREE.Mesh(shankGeometry, shankMaterial);
      shank.position.y = -35;
      toolGroup.add(shank);

      // Cutting part
      const cuttingGeometry = new THREE.CylinderGeometry(
        assembly.tool?.diameter / 2 || 3,
        assembly.tool?.diameter / 2 || 3,
        assembly.tool?.length || 20
      );
      const cuttingMaterial = new THREE.MeshPhongMaterial({
        color: assembly.tool?.coating === 'TiAlN' ? 0x9370db : 0xffd700,
        metalness: 0.8,
        roughness: 0.2
      });
      const cutting = new THREE.Mesh(cuttingGeometry, cuttingMaterial);
      cutting.position.y = -50 - (assembly.tool?.length || 20) / 2;
      toolGroup.add(cutting);
    } else {
      // Create simple tool
      const toolGeometry = new THREE.CylinderGeometry(3, 3, 50);
      const toolMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa00 });
      const tool = new THREE.Mesh(toolGeometry, toolMaterial);
      toolGroup.add(tool);
    }

    toolGroup.position.set(0, 0, 50);
    toolGroup.rotation.x = Math.PI;
    sceneRef.current.add(toolGroup);
    toolRef.current = toolGroup;
  };

  // Update tool position based on simulation
  useEffect(() => {
    if (!toolRef.current || !simulation.isPlaying || simulation.positions.length === 0) return;

    const interval = setInterval(() => {
      if (simulation.currentLine < simulation.positions.length) {
        const pos = simulation.positions[simulation.currentLine];
        const offset = workOffsets[activeWorkOffset];
        
        toolRef.current.position.set(
          pos.x + offset.x,
          pos.y + offset.y,
          pos.z + offset.z
        );
        
        setSimulation(prev => ({
          ...prev,
          currentLine: prev.currentLine + 1
        }));
      } else {
        setSimulation(prev => ({ ...prev, isPlaying: false, currentLine: 0 }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [simulation.isPlaying, simulation.currentLine, activeWorkOffset]);

  // Event bus listeners
  useEffect(() => {
    const handleWorkbenchActivated = (workbenchName) => {
      console.log(`Workbench activated: ${workbenchName}`);
      // Update UI based on active workbench
      updatePanelsForWorkbench(workbenchName);
    };

    const handleGCodeParsed = (data) => {
      setSimulation(prev => ({
        ...prev,
        positions: data.positions,
        feedRate: data.feedRate,
        spindleSpeed: data.spindleSpeed
      }));
    };

    const handleToolAssemblyCreated = (assembly) => {
      setToolAssemblies(prev => [...prev, assembly]);
      createTool(assembly);
    };

    eventBus.on('workbench-activated', handleWorkbenchActivated);
    eventBus.on('gcode-parsed', handleGCodeParsed);
    eventBus.on('tool-assembly-created', handleToolAssemblyCreated);

    return () => {
      eventBus.off('workbench-activated', handleWorkbenchActivated);
      eventBus.off('gcode-parsed', handleGCodeParsed);
      eventBus.off('tool-assembly-created', handleToolAssemblyCreated);
    };
  }, []);

  // Update panels based on active workbench
  const updatePanelsForWorkbench = (workbenchName) => {
    const workbench = workbenches.find(wb => wb.name === workbenchName);
    if (!workbench) return;

    const newPanels = {};
    workbench.panels.forEach(panel => {
      newPanels[panel.id] = {
        ...panel,
        visible: true,
        position: getDefaultPosition(panel.id),
        size: getDefaultSize(panel.id)
      };
    });
    setPanels(newPanels);
  };

  const getDefaultPosition = (panelId) => {
    const positions = {
      gcode: { x: 20, y: 100 },
      tools: { x: window.innerWidth - 420, y: 100 },
      setup: { x: 20, y: 400 },
      simulation: { x: window.innerWidth - 420, y: 400 },
      toolpath: { x: 20, y: 200 },
      operations: { x: window.innerWidth - 420, y: 200 }
    };
    return positions[panelId] || { x: 100, y: 100 };
  };

  const getDefaultSize = (panelId) => {
    const sizes = {
      gcode: { width: 400, height: 500 },
      tools: { width: 400, height: 400 },
      setup: { width: 350, height: 300 },
      simulation: { width: 350, height: 250 },
      toolpath: { width: 400, height: 300 },
      operations: { width: 350, height: 300 }
    };
    return sizes[panelId] || { width: 300, height: 200 };
  };

  // Render panel based on component type
  const renderPanelContent = (panel) => {
    switch (panel.component) {
      case 'GCodeEditor':
        return (
          <GCodeEditor
            value={gcode}
            onChange={setGcode}
            onParse={() => {
              const wb = workbenches.find(w => w.name === 'CAM');
              wb.commands.parseGCode(gcode);
            }}
            currentLine={simulation.currentLine}
          />
        );
      case 'ProfessionalToolSystem':
        return (
          <ProfessionalToolSystem
            onToolAssemblyChange={(assembly) => {
              eventBus.emit('tool-assembly-created', assembly);
            }}
          />
        );
      case 'ToolManager':
        return (
          <ToolManager
            tools={tools}
            assemblies={toolAssemblies}
            onToolSelect={(tool) => console.log('Tool selected:', tool)}
          />
        );
      case 'ToolOffsetTable':
        return <ToolOffsetTable />;
      default:
        return <div>Panel: {panel.name}</div>;
    }
  };

  return (
    <WorkbenchProvider workbenches={workbenches} defaultWorkbench={workbenches[0]}>
      <div className="cnc-pro-suite-modular">
        {/* Workbench Switcher Bar */}
        <div className="workbench-bar">
          <WorkbenchSwitcher />
          <div className="workbench-info">
            <span className="app-title">CNC Pro Suite</span>
            <span className="workbench-description">
              {activeWorkbench?.description}
            </span>
          </div>
        </div>

        {/* Main viewport */}
        <div className="viewport-container" ref={mountRef} />

        {/* Floating panels */}
        {Object.values(panels).map(panel => (
          panel.visible && (
            <div
              key={panel.id}
              className="floating-panel"
              style={{
                left: panel.position.x,
                top: panel.position.y,
                width: panel.size.width,
                height: panel.size.height
              }}
            >
              <div className="panel-header">
                <span className="panel-title">{panel.name}</span>
                <button
                  className="panel-close"
                  onClick={() => setPanels(prev => ({
                    ...prev,
                    [panel.id]: { ...prev[panel.id], visible: false }
                  }))}
                >
                  ×
                </button>
              </div>
              <div className="panel-content">
                {renderPanelContent(panel)}
              </div>
            </div>
          )
        ))}

        {/* Control bar */}
        <div className="control-bar">
          <button
            className="control-button"
            onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
          >
            {simulation.isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            className="control-button"
            onClick={() => setSimulation(prev => ({ ...prev, currentLine: 0, isPlaying: false }))}
          >
            ⏹️ Stop
          </button>
          <span className="status-text">
            Line: {simulation.currentLine} / {simulation.positions.length}
          </span>
          <span className="status-text">
            Feed: {simulation.feedRate} mm/min
          </span>
          <span className="status-text">
            Spindle: {simulation.spindleSpeed} RPM
          </span>
        </div>
      </div>
    </WorkbenchProvider>
  );
};

export default CNCProSuiteModular;