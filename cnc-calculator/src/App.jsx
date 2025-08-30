import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import MobileLayout from './components/MobileLayout';
import DesktopLayout from './components/DesktopLayout';
<<<<<<< HEAD
import ModernTopBar from './components/ModernTopBar';
=======
import ErrorBoundary from './components/ErrorBoundary';
>>>>>>> cursor/create-cnc-studio-status-bar-module-1378
import './App.css';

const App = () => {
  // Detect device type
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Core application state
  const [project, setProject] = useState({
    name: 'New Project',
    gcode: {
      channel1: `; CNC PROGRAM EXAMPLE
G21 G90 G94 ; Metric, Absolute, Feed/min
G17 G40 G49 ; XY Plane, Cancel comp, Cancel length offset
G54 ; Work coordinate system 1

; Tool Change
T1 M06 ; Load Tool 1
S12000 M03 ; Spindle ON CW at 12000 RPM
G43 H1 Z100 ; Apply tool length offset, move to safe height
M08 ; Coolant ON

; Rapid to start position
G0 X0 Y0
G0 Z5 ; Safe approach

; Cutting operation
G01 Z-5 F300 ; Plunge
G01 X50 F800 ; Cut
G01 Y50
G01 X0
G01 Y0

; Retract
G0 Z100 ; Safe height
M09 ; Coolant OFF
M05 ; Spindle OFF
M30 ; Program end`,
      channel2: ''
    }
  });

  const [simulation, setSimulation] = useState({
    isPlaying: false,
    currentLine: 0,
    speed: 1.0,
    toolAssembly: null,
    currentToolLength: 0,
    toolLengthCompActive: false,
    cutterCompActive: false,
    activeHCode: 1,
    activeDCode: 0,
    spindleSpeed: 0,
    feedRate: 100
  });

  const [toolDatabase, setToolDatabase] = useState([]);
  const [toolAssemblies, setToolAssemblies] = useState([]);
  
  const [setupConfig, setSetupConfig] = useState({
    workOffsets: {
      activeOffset: 'G54',
      G54: { x: 0, y: 0, z: 0, description: 'Primary Setup' },
      G55: { x: 100, y: 100, z: 0, description: 'Secondary Setup' },
      G56: { x: 0, y: 0, z: 0, description: '' },
      G57: { x: 0, y: 0, z: 0, description: '' },
      G58: { x: 0, y: 0, z: 0, description: '' },
      G59: { x: 0, y: 0, z: 0, description: '' }
    }
  });

  const [toolOffsetTable, setToolOffsetTable] = useState({
    H: Array(100).fill(null).map((_, i) => ({
      register: i,
      lengthGeometry: 0,
      lengthWear: 0
    })),
    D: Array(100).fill(null).map((_, i) => ({
      register: i,
      diameterGeometry: 0,
      diameterWear: 0
    }))
  });

  const [scene3D, setScene3D] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle simulation playback
  useEffect(() => {
    if (!simulation.isPlaying) return;

    const interval = setInterval(() => {
      setSimulation(prev => {
        const lines = project.gcode.channel1.split('\n').length;
        const nextLine = (prev.currentLine + 1) % lines;
        return { ...prev, currentLine: nextLine };
      });
    }, 1000 / simulation.speed);

    return () => clearInterval(interval);
  }, [simulation.isPlaying, simulation.speed, project.gcode.channel1]);

  const handleSceneReady = (sceneObjects) => {
    setScene3D(sceneObjects);
    console.log('3D Scene ready', sceneObjects);
  };

  // Menu handlers
  const handleNewProject = () => {
    setProject({
      name: 'New Project',
      gcode: {
        channel1: `; New CNC Program\nG21 G90 G94\nG17 G40 G49\nG54\n\nM30`,
        channel2: ''
      }
    });
    setSimulation(prev => ({ ...prev, currentLine: 0, isPlaying: false }));
  };

  const handleSaveProject = () => {
    const projectData = JSON.stringify({ project, setupConfig, toolDatabase });
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.cnc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.project) setProject(data.project);
          if (data.setupConfig) setSetupConfig(data.setupConfig);
          if (data.toolDatabase) setToolDatabase(data.toolDatabase);
        } catch (err) {
          console.error('Failed to load project:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTogglePanel = (panelName) => {
    // This would toggle panels in desktop layout
    console.log('Toggle panel:', panelName);
  };

  const handleViewChange = (view) => {
    if (scene3D?.setCameraView) {
      scene3D.setCameraView(view);
    }
  };

  const handleSimulationControl = (action) => {
    switch (action) {
      case 'playPause':
        setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
        break;
      case 'stop':
        setSimulation(prev => ({ ...prev, isPlaying: false, currentLine: 0 }));
        break;
      case 'reset':
        setSimulation(prev => ({ ...prev, currentLine: 0, isPlaying: false }));
        break;
      case 'slower':
        setSimulation(prev => ({ ...prev, speed: Math.max(0.25, prev.speed / 2) }));
        break;
      case 'faster':
        setSimulation(prev => ({ ...prev, speed: Math.min(4, prev.speed * 2) }));
        break;
      case 'stepForward':
        setSimulation(prev => {
          const lines = project.gcode.channel1.split('\n').length;
          return { ...prev, currentLine: Math.min(lines - 1, prev.currentLine + 1) };
        });
        break;
      case 'stepBackward':
        setSimulation(prev => ({ 
          ...prev, 
          currentLine: Math.max(0, prev.currentLine - 1) 
        }));
        break;
    }
  };

  // Common props for both layouts
  const commonProps = {
    project,
    setProject,
    simulation,
    setSimulation,
    toolDatabase,
    setToolDatabase,
    toolAssemblies,
    setToolAssemblies,
    toolOffsetTable,
    setToolOffsetTable,
    setupConfig,
    setSetupConfig
  };

  return (
<<<<<<< HEAD
    <div className="app" style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Modern Top Bar - Desktop only */}
      {!isMobile && (
        <ModernTopBar
          panels={{
            gcode: { visible: false },
            tools: { visible: false },
            workOffsets: { visible: false },
            machineControl: { visible: false },
            lighting: { visible: false }
          }}
          togglePanel={handleTogglePanel}
          simulation={simulation}
          onSimulationControl={handleSimulationControl}
          onFileAction={(action) => {
            switch(action) {
              case 'new': handleNewProject(); break;
              case 'save': handleSaveProject(); break;
              case 'open': document.getElementById('file-input')?.click(); break;
              case 'import': document.getElementById('file-input')?.click(); break;
              case 'export': handleSaveProject(); break;
            }
          }}
          onViewChange={handleViewChange}
          projectName={project.name}
        />
      )}

      {/* 3D Scene - Always rendered but may be hidden on mobile */}
      <div style={{ 
        position: 'absolute',
        top: !isMobile ? 35 : 0, // Account for menu height on desktop
        left: 0,
        width: '100%',
        height: !isMobile ? 'calc(100% - 35px)' : '100%',
        display: isMobile && simulation.currentTab !== 'viewer' ? 'none' : 'block'
=======
    <ErrorBoundary>
      <div className="app" style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative'
>>>>>>> cursor/create-cnc-studio-status-bar-module-1378
      }}>
        {/* 3D Scene - Always rendered but may be hidden on mobile */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: isMobile && simulation.currentTab !== 'viewer' ? 'none' : 'block'
        }}>
          <Scene3D
            simulation={simulation}
            gcode={project.gcode.channel1}
            setupConfig={setupConfig}
            toolOffsetTable={toolOffsetTable}
            onSceneReady={handleSceneReady}
          />
        </div>

<<<<<<< HEAD
      {/* UI Layout */}
      <div style={{ 
        position: 'absolute',
        top: !isMobile ? 35 : 0, // Account for menu height on desktop
        left: 0,
        width: '100%',
        height: !isMobile ? 'calc(100% - 35px)' : '100%',
        pointerEvents: isMobile ? 'auto' : 'none'
      }}>
        {isMobile ? (
          <MobileLayout {...commonProps} />
        ) : (
          <DesktopLayout {...commonProps} scene3D={scene3D} />
        )}
      </div>

      {/* Hidden file input for loading projects */}
      <input
        id="file-input"
        type="file"
        accept=".nc,.gcode,.txt,.cnc"
        style={{ display: 'none' }}
        onChange={handleLoadProject}
      />
    </div>
=======
        {/* UI Layout */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: isMobile ? 'auto' : 'none'
        }}>
          {isMobile ? (
            <MobileLayout {...commonProps} />
          ) : (
            <DesktopLayout {...commonProps} scene3D={scene3D} />
          )}
        </div>
      </div>
    </ErrorBoundary>
>>>>>>> cursor/create-cnc-studio-status-bar-module-1378
  );
};

export default App;