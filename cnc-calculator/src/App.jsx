import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import MobileLayout from './components/MobileLayout';
import DesktopLayout from './components/DesktopLayout';
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
    <div className="app" style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative'
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
  );
};

export default App;