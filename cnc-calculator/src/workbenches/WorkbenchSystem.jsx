import React, { createContext, useContext, useState, useEffect } from 'react';

// Workbench context for sharing state and functionality
const WorkbenchContext = createContext();

export const useWorkbench = () => {
  const context = useContext(WorkbenchContext);
  if (!context) {
    throw new Error('useWorkbench must be used within WorkbenchProvider');
  }
  return context;
};

// Base Workbench class - similar to FreeCAD's workbench concept
export class Workbench {
  constructor(name, icon, description) {
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.tools = [];
    this.panels = [];
    this.commands = {};
    this.active = false;
  }

  // Add a tool to the workbench
  addTool(tool) {
    this.tools.push(tool);
  }

  // Add a panel to the workbench
  addPanel(panel) {
    this.panels.push(panel);
  }

  // Register a command
  registerCommand(name, command) {
    this.commands[name] = command;
  }

  // Activate the workbench
  activate() {
    this.active = true;
    this.onActivate?.();
  }

  // Deactivate the workbench
  deactivate() {
    this.active = false;
    this.onDeactivate?.();
  }
}

// Workbench Provider Component
export const WorkbenchProvider = ({ children, workbenches, defaultWorkbench }) => {
  const [activeWorkbench, setActiveWorkbench] = useState(defaultWorkbench || workbenches[0]);
  const [sharedState, setSharedState] = useState({
    // Shared state between all workbenches
    project: null,
    gcode: '',
    tools: [],
    simulation: {
      isPlaying: false,
      currentLine: 0,
      positions: [],
      feedRate: 0,
      spindleSpeed: 0,
      toolAssembly: null
    },
    stock: {
      width: 200,
      height: 100,
      depth: 50,
      material: 'Aluminum 6061'
    },
    workOffsets: {
      G54: { x: 0, y: 0, z: 0 },
      G55: { x: 0, y: 0, z: 0 },
      G56: { x: 0, y: 0, z: 0 },
      G57: { x: 0, y: 0, z: 0 },
      G58: { x: 0, y: 0, z: 0 },
      G59: { x: 0, y: 0, z: 0 }
    },
    activeWorkOffset: 'G54',
    toolOffsets: {
      H: Array(99).fill().map(() => ({ geometry: 0, wear: 0 })),
      D: Array(99).fill().map(() => ({ geometry: 0, wear: 0 }))
    }
  });

  // Switch workbench
  const switchWorkbench = (workbench) => {
    if (activeWorkbench) {
      activeWorkbench.deactivate();
    }
    workbench.activate();
    setActiveWorkbench(workbench);
  };

  // Update shared state
  const updateSharedState = (updates) => {
    setSharedState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Execute a command from any workbench
  const executeCommand = (workbenchName, commandName, ...args) => {
    const workbench = workbenches.find(wb => wb.name === workbenchName);
    if (workbench && workbench.commands[commandName]) {
      return workbench.commands[commandName](...args);
    }
    console.warn(`Command ${commandName} not found in workbench ${workbenchName}`);
  };

  const value = {
    workbenches,
    activeWorkbench,
    switchWorkbench,
    sharedState,
    updateSharedState,
    executeCommand
  };

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  );
};

// Workbench Switcher Component
export const WorkbenchSwitcher = () => {
  const { workbenches, activeWorkbench, switchWorkbench } = useWorkbench();

  return (
    <div className="workbench-switcher">
      {workbenches.map(workbench => (
        <button
          key={workbench.name}
          className={`workbench-button ${activeWorkbench === workbench ? 'active' : ''}`}
          onClick={() => switchWorkbench(workbench)}
          title={workbench.description}
        >
          <span className="workbench-icon">{workbench.icon}</span>
          <span className="workbench-name">{workbench.name}</span>
        </button>
      ))}
    </div>
  );
};

// Tool Registry for managing tools across workbenches
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(id, tool) {
    this.tools.set(id, tool);
  }

  get(id) {
    return this.tools.get(id);
  }

  getAll() {
    return Array.from(this.tools.values());
  }

  getByWorkbench(workbenchName) {
    return this.getAll().filter(tool => tool.workbench === workbenchName);
  }
}

// Command Registry for managing commands across workbenches
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(id, command) {
    this.commands.set(id, command);
  }

  execute(id, ...args) {
    const command = this.commands.get(id);
    if (command) {
      return command.execute(...args);
    }
    console.warn(`Command ${id} not found`);
  }

  getAll() {
    return Array.from(this.commands.entries());
  }
}

// Event Bus for inter-workbench communication
export class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off(event, handler) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }
}

// Create global instances
export const toolRegistry = new ToolRegistry();
export const commandRegistry = new CommandRegistry();
export const eventBus = new EventBus();