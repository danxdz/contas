import React, { useState } from 'react';
import GCodeEditor from './GCodeEditor';
import ToolManager from './ToolManager';
import ProfessionalToolSystem from './ProfessionalToolSystem';
import ToolOffsetTable from './ToolOffsetTable';

const DesktopLayout = ({ 
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
  setSetupConfig,
  scene3D
}) => {
  const [panels, setPanels] = useState({
    gcode: { visible: true, position: { x: 20, y: 80 }, size: { width: 400, height: 500 } },
    tools: { visible: true, position: { x: window.innerWidth - 370, y: 80 }, size: { width: 350, height: 500 } },
    professional: { visible: false, position: { x: 100, y: 100 }, size: { width: 800, height: 600 } },
    offsets: { visible: false, position: { x: 150, y: 120 }, size: { width: 600, height: 500 } }
  });

  const [draggedPanel, setDraggedPanel] = useState(null);

  const handlePanelDragStart = (e, panelId) => {
    setDraggedPanel(panelId);
    const panel = panels[panelId];
    const offsetX = e.clientX - panel.position.x;
    const offsetY = e.clientY - panel.position.y;

    const handleMouseMove = (e) => {
      setPanels(prev => ({
        ...prev,
        [panelId]: {
          ...prev[panelId],
          position: {
            x: e.clientX - offsetX,
            y: e.clientY - offsetY
          }
        }
      }));
    };

    const handleMouseUp = () => {
      setDraggedPanel(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const Panel = ({ id, title, children }) => {
    const panel = panels[id];
    if (!panel.visible) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: panel.position.x,
          top: panel.position.y,
          width: panel.size.width,
          height: panel.size.height,
          background: '#0a1520',
          border: '1px solid #00d4ff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          zIndex: draggedPanel === id ? 1000 : 100,
          pointerEvents: 'auto'
        }}
      >
        <div
          onMouseDown={(e) => handlePanelDragStart(e, id)}
          style={{
            padding: '10px 15px',
            background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'move',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{title}</span>
          <button
            onClick={() => setPanels(prev => ({
              ...prev,
              [id]: { ...prev[id], visible: false }
            }))}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
      {/* Top Menu Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        background: 'rgba(26, 31, 46, 0.95)',
        borderBottom: '1px solid #00d4ff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '20px',
        pointerEvents: 'auto',
        zIndex: 1000
      }}>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CNC Pro Suite - Modular Edition
        </h1>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setPanels(prev => ({
              ...prev,
              gcode: { ...prev.gcode, visible: !prev.gcode.visible }
            }))}
            style={{
              padding: '8px 15px',
              background: panels.gcode.visible ? '#00d4ff' : '#333',
              color: panels.gcode.visible ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            G-Code
          </button>
          
          <button
            onClick={() => setPanels(prev => ({
              ...prev,
              tools: { ...prev.tools, visible: !prev.tools.visible }
            }))}
            style={{
              padding: '8px 15px',
              background: panels.tools.visible ? '#00d4ff' : '#333',
              color: panels.tools.visible ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Tools
          </button>
          
          <button
            onClick={() => setPanels(prev => ({
              ...prev,
              professional: { ...prev.professional, visible: !prev.professional.visible }
            }))}
            style={{
              padding: '8px 15px',
              background: panels.professional.visible ? '#00d4ff' : '#333',
              color: panels.professional.visible ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Professional Tools
          </button>
          
          <button
            onClick={() => setPanels(prev => ({
              ...prev,
              offsets: { ...prev.offsets, visible: !prev.offsets.visible }
            }))}
            style={{
              padding: '8px 15px',
              background: panels.offsets.visible ? '#00d4ff' : '#333',
              color: panels.offsets.visible ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Offsets
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(26, 31, 46, 0.95)',
        border: '1px solid #00d4ff',
        borderRadius: '25px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        pointerEvents: 'auto',
        zIndex: 100
      }}>
        <button
          onClick={() => setSimulation(prev => ({ ...prev, currentLine: 0 }))}
          style={{
            padding: '8px 12px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⏮
        </button>
        
        <button
          onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
          style={{
            padding: '8px 20px',
            background: simulation.isPlaying ? '#ff4444' : '#00d4ff',
            color: simulation.isPlaying ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {simulation.isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button
          onClick={() => setSimulation(prev => ({ 
            ...prev, 
            currentLine: Math.min(prev.currentLine + 1, project.gcode.channel1.split('\n').length - 1)
          }))}
          style={{
            padding: '8px 12px',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⏭
        </button>
        
        <div style={{ 
          padding: '5px 10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#00ff88'
        }}>
          Line: {simulation.currentLine + 1} / {project.gcode.channel1.split('\n').length}
        </div>
        
        <label style={{ fontSize: '12px', color: '#888' }}>
          Speed:
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={simulation.speed}
            onChange={(e) => setSimulation(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
            style={{ width: '80px', marginLeft: '5px' }}
          />
          {simulation.speed}x
        </label>
      </div>

      {/* Panels */}
      <Panel id="gcode" title="G-Code Editor">
        <GCodeEditor 
          gcode={project.gcode}
          onChange={(gcode) => setProject(prev => ({ ...prev, gcode }))}
          currentLine={simulation.currentLine}
        />
      </Panel>

      <Panel id="tools" title="Tool Manager">
        <ToolManager 
          tools={toolDatabase}
          onChange={setToolDatabase}
          assemblies={toolAssemblies}
        />
      </Panel>

      <Panel id="professional" title="Professional Tool System">
        <ProfessionalToolSystem 
          onToolAssemblyChange={(assembly) => {
            setToolAssemblies(prev => [...prev, assembly]);
            setSimulation(prev => ({
              ...prev,
              toolAssembly: assembly,
              currentToolLength: assembly.totalLength
            }));
            if (window.updateTool3D) {
              window.updateTool3D(assembly);
            }
          }}
        />
      </Panel>

      <Panel id="offsets" title="Tool Offset Table">
        <ToolOffsetTable 
          offsetTable={toolOffsetTable}
          setOffsetTable={setToolOffsetTable}
          activeHCode={simulation.activeHCode}
          activeDCode={simulation.activeDCode}
        />
      </Panel>
    </div>
  );
};

export default DesktopLayout;