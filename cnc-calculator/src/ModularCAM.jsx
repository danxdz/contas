import React, { useState, useEffect } from 'react';
import './ModularCAM.css';

// Module Registry - All modules self-register here
const MODULE_REGISTRY = {};

// Register a module
export const registerModule = (id, module) => {
  MODULE_REGISTRY[id] = module;
};

// Core modules that are always loaded
import GCodeModule from './modules/GCodeModule';
import ToolsModule from './modules/ToolsModule';
import ViewportModule from './modules/ViewportModule';
import SetupModule from './modules/SetupModule';

// Register core modules
registerModule('gcode', GCodeModule);
registerModule('tools', ToolsModule);
registerModule('viewport', ViewportModule);
registerModule('setup', SetupModule);

const ModularCAM = () => {
  // Layout state
  const [layout, setLayout] = useState({
    main: 'viewport',
    left: 'gcode',
    right: 'tools',
    bottom: null
  });

  // Active modules
  const [activeModules, setActiveModules] = useState(['viewport', 'gcode', 'tools']);
  
  // Shared state that modules can access
  const [sharedState, setSharedState] = useState({
    project: {
      name: 'Project',
      gcode: '',
      tools: [],
      setup: {}
    },
    simulation: {
      currentLine: 0,
      isPlaying: false
    },
    selection: null
  });

  // Module communication bus
  const messageBus = {
    emit: (event, data) => {
      // Notify all modules of events
      window.dispatchEvent(new CustomEvent(`module:${event}`, { detail: data }));
    },
    on: (event, handler) => {
      window.addEventListener(`module:${event}`, handler);
      return () => window.removeEventListener(`module:${event}`, handler);
    }
  };

  // Update shared state
  const updateSharedState = (path, value) => {
    setSharedState(prev => {
      const newState = { ...prev };
      const keys = path.split('.');
      let current = newState;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newState;
    });
    
    // Notify modules
    messageBus.emit('state:changed', { path, value });
  };

  // Load module dynamically
  const loadModule = async (moduleId) => {
    if (MODULE_REGISTRY[moduleId]) {
      setActiveModules(prev => [...new Set([...prev, moduleId])]);
      return MODULE_REGISTRY[moduleId];
    }
    
    // Try to load from file
    try {
      const module = await import(`./modules/${moduleId}/index.jsx`);
      registerModule(moduleId, module.default);
      setActiveModules(prev => [...new Set([...prev, moduleId])]);
      return module.default;
    } catch (error) {
      console.error(`Failed to load module: ${moduleId}`, error);
      return null;
    }
  };

  // Render a module
  const renderModule = (moduleId, position) => {
    const Module = MODULE_REGISTRY[moduleId];
    if (!Module) return null;

    return (
      <Module
        key={moduleId}
        position={position}
        sharedState={sharedState}
        updateState={updateSharedState}
        messageBus={messageBus}
        loadModule={loadModule}
      />
    );
  };

  return (
    <div className="modular-cam">
      {/* Header - Module selector and controls */}
      <header className="cam-header">
        <div className="header-title">
          <h1>Modular CAM</h1>
          <span className="version">v2.0</span>
        </div>
        
        <div className="module-selector">
          <label>Modules:</label>
          {Object.keys(MODULE_REGISTRY).map(moduleId => (
            <button
              key={moduleId}
              className={activeModules.includes(moduleId) ? 'active' : ''}
              onClick={() => {
                if (activeModules.includes(moduleId)) {
                  setActiveModules(prev => prev.filter(id => id !== moduleId));
                } else {
                  loadModule(moduleId);
                }
              }}
            >
              {moduleId}
            </button>
          ))}
          
          <button 
            className="add-module"
            onClick={() => {
              const moduleId = prompt('Enter module ID to load:');
              if (moduleId) loadModule(moduleId);
            }}
          >
            + Add Module
          </button>
        </div>

        <div className="layout-controls">
          <select 
            value={JSON.stringify(layout)}
            onChange={(e) => setLayout(JSON.parse(e.target.value))}
          >
            <option value={JSON.stringify({ main: 'viewport', left: 'gcode', right: 'tools', bottom: null })}>
              Standard
            </option>
            <option value={JSON.stringify({ main: 'gcode', left: 'tools', right: 'viewport', bottom: 'setup' })}>
              Code Focus
            </option>
            <option value={JSON.stringify({ main: 'viewport', left: null, right: null, bottom: 'gcode' })}>
              Full Screen
            </option>
          </select>
        </div>
      </header>

      {/* Main workspace with flexible layout */}
      <div className="cam-workspace">
        {layout.left && (
          <aside className="panel-left">
            {renderModule(layout.left, 'left')}
          </aside>
        )}
        
        <main className="panel-main">
          {renderModule(layout.main, 'main')}
        </main>
        
        {layout.right && (
          <aside className="panel-right">
            {renderModule(layout.right, 'right')}
          </aside>
        )}
      </div>

      {layout.bottom && (
        <footer className="panel-bottom">
          {renderModule(layout.bottom, 'bottom')}
        </footer>
      )}

      {/* Status bar */}
      <div className="cam-status">
        <span>Modules: {activeModules.length}</span>
        <span>Line: {sharedState.simulation.currentLine}</span>
        <span>{sharedState.simulation.isPlaying ? 'Playing' : 'Stopped'}</span>
        <span className="flex-end">Ready</span>
      </div>
    </div>
  );
};

export default ModularCAM;