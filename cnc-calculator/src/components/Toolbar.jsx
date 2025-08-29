import React from 'react';

export const MainToolbar = ({ 
  handleFileLoad,
  saveProject,
  newProject,
  simulation,
  setSimulation,
  stopSimulation,
  stepBackward,
  stepForward,
  setCameraView,
  togglePanel,
  panels,
  collisionDetection,
  setCollisionDetection,
  materialRemoval,
  setMaterialRemoval,
  setShowShortcutsHelp
}) => (
  <div className="toolbar">
    <div className="toolbar-group">
      <button onClick={() => document.getElementById('file-input').click()} title="Open">
        📂
      </button>
      <input 
        id="file-input"
        type="file"
        accept=".nc,.gcode,.step,.stp,.stl"
        onChange={(e) => handleFileLoad(e.target.files[0])}
        hidden
      />
      <button onClick={saveProject} title="Save">💾</button>
      <button onClick={newProject} title="New">📄</button>
    </div>
    
    <div className="toolbar-group">
      <button 
        onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        className={simulation.isPlaying ? 'active' : ''}
        title="Play/Pause"
      >
        {simulation.isPlaying ? '⏸️' : '▶️'}
      </button>
      <button onClick={stopSimulation} title="Stop">⏹️</button>
      <button onClick={stepBackward} title="Step Back">⏮️</button>
      <button onClick={stepForward} title="Step Forward">⏭️</button>
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
    
    <div className="toolbar-group">
      <button onClick={() => setCameraView('top')} title="Top View">⬆️</button>
      <button onClick={() => setCameraView('front')} title="Front View">➡️</button>
      <button onClick={() => setCameraView('side')} title="Side View">⬅️</button>
      <button onClick={() => setCameraView('iso')} title="Isometric">🔷</button>
    </div>
    
    <div className="toolbar-group">
      <button onClick={() => togglePanel('gcode')} className={panels.gcode.visible ? 'active' : ''} title="G-Code">
        📝
      </button>
      <button onClick={() => togglePanel('tools')} className={panels.tools.visible ? 'active' : ''} title="Tools">
        🔧
      </button>
      <button onClick={() => togglePanel('machineControl')} className={panels.machineControl.visible ? 'active' : ''} title="Control">
        🎮
      </button>
    </div>
    
    <div className="toolbar-group">
      <button 
        onClick={() => setCollisionDetection(!collisionDetection)}
        className={collisionDetection ? 'active' : ''}
        title="Collision Detection"
      >
        ⚠️
      </button>
      {materialRemoval && (
        <button 
          onClick={() => setMaterialRemoval(!materialRemoval)}
          className={materialRemoval ? 'active' : ''}
          title="Material Removal"
        >
          🔨
        </button>
      )}
      <button 
        onClick={() => setShowShortcutsHelp(true)}
        title="Shortcuts (?)"
      >
        ❓
      </button>
      <button 
        onClick={() => togglePanel('lighting')}
        title="Lighting"
        className={panels.lighting?.visible ? 'active' : ''}
      >
        💡
      </button>
    </div>
  </div>
);

export const StatusBar = ({ simulation, project }) => (
  <div className="status-bar">
    <span>Line: {simulation.currentLine}/{project.gcode.channel1.split('\n').filter(l => l.trim() && !l.trim().startsWith(';')).length}</span>
    <span>|</span>
    <span>X: {simulation.position.x.toFixed(1)}</span>
    <span>Y: {simulation.position.y.toFixed(1)}</span>
    <span>Z: {simulation.position.z.toFixed(1)}</span>
    <span title="Feed Rate">F: {simulation.feedRate}</span>
    <span title="Spindle Speed">S: {simulation.spindleSpeed}</span>
    {simulation.g43 && <span style={{ color: '#4caf50' }}>G43 H{simulation.currentH || 0}</span>}
    {simulation.g41 && <span style={{ color: '#ff9800' }}>G41 D{simulation.currentD || 0}</span>}
    {simulation.g42 && <span style={{ color: '#ff9800' }}>G42 D{simulation.currentD || 0}</span>}
  </div>
);