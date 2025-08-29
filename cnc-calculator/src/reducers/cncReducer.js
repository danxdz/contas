/**
 * CNC Suite State Reducer
 * Manages complex state updates with better performance
 */

// Action Types
export const ActionTypes = {
  // Simulation Actions
  SET_SIMULATION: 'SET_SIMULATION',
  UPDATE_SIMULATION: 'UPDATE_SIMULATION',
  PAUSE_SIMULATION: 'PAUSE_SIMULATION',
  STOP_SIMULATION: 'STOP_SIMULATION',
  RESET_SIMULATION: 'RESET_SIMULATION',
  
  // Panel Actions
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  UPDATE_PANEL: 'UPDATE_PANEL',
  SET_PANEL_POSITION: 'SET_PANEL_POSITION',
  SET_PANEL_SIZE: 'SET_PANEL_SIZE',
  SET_PANEL_ZINDEX: 'SET_PANEL_ZINDEX',
  MINIMIZE_PANEL: 'MINIMIZE_PANEL',
  DOCK_PANEL: 'DOCK_PANEL',
  RESET_PANELS: 'RESET_PANELS',
  
  // Project Actions
  SET_PROJECT: 'SET_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_GCODE: 'UPDATE_GCODE',
  UPDATE_TOOLS: 'UPDATE_TOOLS',
  
  // Setup Actions
  UPDATE_SETUP_CONFIG: 'UPDATE_SETUP_CONFIG',
  UPDATE_STOCK: 'UPDATE_STOCK',
  UPDATE_FIXTURE: 'UPDATE_FIXTURE',
  UPDATE_PART: 'UPDATE_PART',
  UPDATE_MACHINE: 'UPDATE_MACHINE',
  UPDATE_WORK_OFFSETS: 'UPDATE_WORK_OFFSETS',
  
  // Tool Actions
  SET_SELECTED_TOOL: 'SET_SELECTED_TOOL',
  UPDATE_TOOL_OFFSETS: 'UPDATE_TOOL_OFFSETS',
  UPDATE_TOOL_ASSEMBLY: 'UPDATE_TOOL_ASSEMBLY',
  
  // UI Actions
  SET_MOBILE_MODE: 'SET_MOBILE_MODE',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  SET_ACTIVE_MOBILE_PANEL: 'SET_ACTIVE_MOBILE_PANEL',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Collision Actions
  INCREMENT_COLLISION: 'INCREMENT_COLLISION',
  RESET_COLLISIONS: 'RESET_COLLISIONS',
  ADD_COLLISION_HISTORY: 'ADD_COLLISION_HISTORY',
  
  // Settings Actions
  UPDATE_LIGHTING: 'UPDATE_LIGHTING',
  TOGGLE_MATERIAL_REMOVAL: 'TOGGLE_MATERIAL_REMOVAL',
  TOGGLE_COLLISION_DETECTION: 'TOGGLE_COLLISION_DETECTION',
  
  // Batch Actions
  BATCH_UPDATE: 'BATCH_UPDATE'
};

// Initial State
export const initialState = {
  // Simulation State
  simulation: {
    isPlaying: false,
    isPaused: false,
    currentLine: 0,
    position: { x: 0, y: 0, z: 250 },
    feedRate: 1000,
    spindleSpeed: 0,
    currentTool: null,
    g43Active: false,
    workOffset: 'G54',
    absoluteMode: true,
    units: 'mm',
    coolant: false,
    totalLines: 0,
    estimatedTime: 0,
    elapsedTime: 0
  },
  
  // Panel State
  panels: {
    visibility: {
      gcodeEditor: true,
      toolManager: false,
      offsetTable: false,
      workOffsets: false,
      stockSetup: false,
      fixtureSetup: false,
      partSetup: false,
      machineSetup: false,
      lighting: false,
      feedsSpeeds: false,
      toolLife: false,
      powerTorque: false,
      circular: false,
      geometry: false,
      pocketMilling: false,
      shopFloor: false,
      machineConfig: false,
      setupManager: false,
      machineControl: false,
      features: false,
      console: false
    },
    positions: {},
    sizes: {},
    zIndices: {},
    minimized: {},
    docked: {}
  },
  
  // Project State
  project: {
    name: 'Untitled Project',
    gcode: {
      channel1: '',
      channel2: ''
    },
    tools: [],
    features: [],
    setup: null,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '2.0.0'
    }
  },
  
  // Setup Configuration
  setupConfig: {
    stock: {
      type: 'box',
      dimensions: { x: 200, y: 150, z: 50 },
      position: { x: 0, y: 0, z: 0 },
      material: 'aluminum',
      visible: true
    },
    fixture: {
      type: 'vise',
      jawWidth: 150,
      jawHeight: 50,
      position: { x: 0, y: 0, z: -50 },
      visible: true
    },
    part: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      visible: false
    },
    machine: {
      type: '3-axis',
      travels: { x: 800, y: 600, z: 500 },
      spindleMax: 24000,
      rapidRate: 10000
    },
    workOffsets: {
      G54: { x: 0, y: 0, z: 50, active: true },
      G55: { x: 0, y: 0, z: 0, active: false },
      G56: { x: 0, y: 0, z: 0, active: false },
      G57: { x: 0, y: 0, z: 0, active: false },
      G58: { x: 0, y: 0, z: 0, active: false },
      G59: { x: 0, y: 0, z: 0, active: false }
    }
  },
  
  // Tool State
  tools: {
    selected: null,
    assemblies: [],
    offsets: {
      geometry: {},
      wear: {}
    }
  },
  
  // UI State
  ui: {
    isMobile: false,
    mobileMenuOpen: false,
    activeMobilePanel: null,
    theme: 'dark',
    language: 'en'
  },
  
  // Error State
  error: null,
  
  // Collision State
  collision: {
    count: 0,
    history: [],
    stopOnCollision: true,
    detectionEnabled: true
  },
  
  // Settings
  settings: {
    lighting: {
      ambient: { enabled: true, intensity: 0.5, color: '#ffffff' },
      directional1: { 
        enabled: true, intensity: 0.8, color: '#ffffff',
        position: { x: 200, y: 200, z: 400 }, castShadow: true 
      },
      directional2: { 
        enabled: true, intensity: 0.4, color: '#e0e0ff',
        position: { x: -200, y: 100, z: -200 }, castShadow: false 
      },
      spot1: { 
        enabled: false, intensity: 0.6, color: '#ffff00',
        position: { x: 0, y: 0, z: 300 }, angle: Math.PI / 6, 
        penumbra: 0.1, castShadow: true 
      },
      hemisphere: { 
        enabled: true, skyColor: '#87ceeb', 
        groundColor: '#362907', intensity: 0.3 
      }
    },
    materialRemoval: true,
    collisionDetection: true,
    autoSave: true,
    autoSaveInterval: 60000
  }
};

// Reducer Function
export const cncReducer = (state = initialState, action) => {
  switch (action.type) {
    // Simulation Actions
    case ActionTypes.SET_SIMULATION:
      return {
        ...state,
        simulation: action.payload
      };
      
    case ActionTypes.UPDATE_SIMULATION:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          ...action.payload
        }
      };
      
    case ActionTypes.PAUSE_SIMULATION:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isPlaying: false,
          isPaused: true
        }
      };
      
    case ActionTypes.STOP_SIMULATION:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isPlaying: false,
          isPaused: false,
          currentLine: 0,
          position: { x: 0, y: 0, z: 250 }
        }
      };
      
    case ActionTypes.RESET_SIMULATION:
      return {
        ...state,
        simulation: {
          ...initialState.simulation,
          workOffset: state.simulation.workOffset
        }
      };
    
    // Panel Actions
    case ActionTypes.TOGGLE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          visibility: {
            ...state.panels.visibility,
            [action.payload]: !state.panels.visibility[action.payload]
          }
        }
      };
      
    case ActionTypes.UPDATE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          ...action.payload
        }
      };
      
    case ActionTypes.SET_PANEL_POSITION:
      return {
        ...state,
        panels: {
          ...state.panels,
          positions: {
            ...state.panels.positions,
            [action.payload.panel]: action.payload.position
          }
        }
      };
      
    case ActionTypes.SET_PANEL_SIZE:
      return {
        ...state,
        panels: {
          ...state.panels,
          sizes: {
            ...state.panels.sizes,
            [action.payload.panel]: action.payload.size
          }
        }
      };
      
    case ActionTypes.SET_PANEL_ZINDEX:
      return {
        ...state,
        panels: {
          ...state.panels,
          zIndices: {
            ...state.panels.zIndices,
            [action.payload.panel]: action.payload.zIndex
          }
        }
      };
      
    case ActionTypes.MINIMIZE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          minimized: {
            ...state.panels.minimized,
            [action.payload]: !state.panels.minimized[action.payload]
          }
        }
      };
      
    case ActionTypes.DOCK_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          docked: {
            ...state.panels.docked,
            [action.payload.panel]: action.payload.position
          }
        }
      };
      
    case ActionTypes.RESET_PANELS:
      return {
        ...state,
        panels: initialState.panels
      };
    
    // Project Actions
    case ActionTypes.SET_PROJECT:
      return {
        ...state,
        project: action.payload
      };
      
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        project: {
          ...state.project,
          ...action.payload,
          metadata: {
            ...state.project.metadata,
            modified: new Date().toISOString()
          }
        }
      };
      
    case ActionTypes.UPDATE_GCODE:
      return {
        ...state,
        project: {
          ...state.project,
          gcode: {
            ...state.project.gcode,
            [action.payload.channel]: action.payload.code
          }
        }
      };
      
    case ActionTypes.UPDATE_TOOLS:
      return {
        ...state,
        project: {
          ...state.project,
          tools: action.payload
        }
      };
    
    // Setup Actions
    case ActionTypes.UPDATE_SETUP_CONFIG:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          ...action.payload
        }
      };
      
    case ActionTypes.UPDATE_STOCK:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          stock: {
            ...state.setupConfig.stock,
            ...action.payload
          }
        }
      };
      
    case ActionTypes.UPDATE_FIXTURE:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          fixture: {
            ...state.setupConfig.fixture,
            ...action.payload
          }
        }
      };
      
    case ActionTypes.UPDATE_PART:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          part: {
            ...state.setupConfig.part,
            ...action.payload
          }
        }
      };
      
    case ActionTypes.UPDATE_MACHINE:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          machine: {
            ...state.setupConfig.machine,
            ...action.payload
          }
        }
      };
      
    case ActionTypes.UPDATE_WORK_OFFSETS:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          workOffsets: action.payload
        }
      };
    
    // Tool Actions
    case ActionTypes.SET_SELECTED_TOOL:
      return {
        ...state,
        tools: {
          ...state.tools,
          selected: action.payload
        }
      };
      
    case ActionTypes.UPDATE_TOOL_OFFSETS:
      return {
        ...state,
        tools: {
          ...state.tools,
          offsets: action.payload
        }
      };
      
    case ActionTypes.UPDATE_TOOL_ASSEMBLY:
      return {
        ...state,
        tools: {
          ...state.tools,
          assemblies: action.payload
        }
      };
    
    // UI Actions
    case ActionTypes.SET_MOBILE_MODE:
      return {
        ...state,
        ui: {
          ...state.ui,
          isMobile: action.payload
        }
      };
      
    case ActionTypes.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        ui: {
          ...state.ui,
          mobileMenuOpen: !state.ui.mobileMenuOpen
        }
      };
      
    case ActionTypes.SET_ACTIVE_MOBILE_PANEL:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeMobilePanel: action.payload
        }
      };
    
    // Error Actions
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    // Collision Actions
    case ActionTypes.INCREMENT_COLLISION:
      return {
        ...state,
        collision: {
          ...state.collision,
          count: state.collision.count + 1
        }
      };
      
    case ActionTypes.RESET_COLLISIONS:
      return {
        ...state,
        collision: {
          ...state.collision,
          count: 0,
          history: []
        }
      };
      
    case ActionTypes.ADD_COLLISION_HISTORY:
      return {
        ...state,
        collision: {
          ...state.collision,
          history: [...state.collision.history, action.payload]
        }
      };
    
    // Settings Actions
    case ActionTypes.UPDATE_LIGHTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          lighting: action.payload
        }
      };
      
    case ActionTypes.TOGGLE_MATERIAL_REMOVAL:
      return {
        ...state,
        settings: {
          ...state.settings,
          materialRemoval: !state.settings.materialRemoval
        }
      };
      
    case ActionTypes.TOGGLE_COLLISION_DETECTION:
      return {
        ...state,
        settings: {
          ...state.settings,
          collisionDetection: !state.settings.collisionDetection
        }
      };
    
    // Batch Actions
    case ActionTypes.BATCH_UPDATE:
      return action.payload.reduce((acc, update) => {
        return cncReducer(acc, update);
      }, state);
    
    default:
      return state;
  }
};

// Action Creators
export const actions = {
  // Simulation
  setSimulation: (simulation) => ({ type: ActionTypes.SET_SIMULATION, payload: simulation }),
  updateSimulation: (updates) => ({ type: ActionTypes.UPDATE_SIMULATION, payload: updates }),
  pauseSimulation: () => ({ type: ActionTypes.PAUSE_SIMULATION }),
  stopSimulation: () => ({ type: ActionTypes.STOP_SIMULATION }),
  resetSimulation: () => ({ type: ActionTypes.RESET_SIMULATION }),
  
  // Panels
  togglePanel: (panel) => ({ type: ActionTypes.TOGGLE_PANEL, payload: panel }),
  updatePanel: (updates) => ({ type: ActionTypes.UPDATE_PANEL, payload: updates }),
  setPanelPosition: (panel, position) => ({ type: ActionTypes.SET_PANEL_POSITION, payload: { panel, position } }),
  setPanelSize: (panel, size) => ({ type: ActionTypes.SET_PANEL_SIZE, payload: { panel, size } }),
  setPanelZIndex: (panel, zIndex) => ({ type: ActionTypes.SET_PANEL_ZINDEX, payload: { panel, zIndex } }),
  minimizePanel: (panel) => ({ type: ActionTypes.MINIMIZE_PANEL, payload: panel }),
  dockPanel: (panel, position) => ({ type: ActionTypes.DOCK_PANEL, payload: { panel, position } }),
  resetPanels: () => ({ type: ActionTypes.RESET_PANELS }),
  
  // Project
  setProject: (project) => ({ type: ActionTypes.SET_PROJECT, payload: project }),
  updateProject: (updates) => ({ type: ActionTypes.UPDATE_PROJECT, payload: updates }),
  updateGCode: (channel, code) => ({ type: ActionTypes.UPDATE_GCODE, payload: { channel, code } }),
  updateTools: (tools) => ({ type: ActionTypes.UPDATE_TOOLS, payload: tools }),
  
  // Setup
  updateSetupConfig: (config) => ({ type: ActionTypes.UPDATE_SETUP_CONFIG, payload: config }),
  updateStock: (stock) => ({ type: ActionTypes.UPDATE_STOCK, payload: stock }),
  updateFixture: (fixture) => ({ type: ActionTypes.UPDATE_FIXTURE, payload: fixture }),
  updatePart: (part) => ({ type: ActionTypes.UPDATE_PART, payload: part }),
  updateMachine: (machine) => ({ type: ActionTypes.UPDATE_MACHINE, payload: machine }),
  updateWorkOffsets: (offsets) => ({ type: ActionTypes.UPDATE_WORK_OFFSETS, payload: offsets }),
  
  // Tools
  setSelectedTool: (tool) => ({ type: ActionTypes.SET_SELECTED_TOOL, payload: tool }),
  updateToolOffsets: (offsets) => ({ type: ActionTypes.UPDATE_TOOL_OFFSETS, payload: offsets }),
  updateToolAssembly: (assemblies) => ({ type: ActionTypes.UPDATE_TOOL_ASSEMBLY, payload: assemblies }),
  
  // UI
  setMobileMode: (isMobile) => ({ type: ActionTypes.SET_MOBILE_MODE, payload: isMobile }),
  toggleMobileMenu: () => ({ type: ActionTypes.TOGGLE_MOBILE_MENU }),
  setActiveMobilePanel: (panel) => ({ type: ActionTypes.SET_ACTIVE_MOBILE_PANEL, payload: panel }),
  
  // Errors
  setError: (error) => ({ type: ActionTypes.SET_ERROR, payload: error }),
  clearError: () => ({ type: ActionTypes.CLEAR_ERROR }),
  
  // Collisions
  incrementCollision: () => ({ type: ActionTypes.INCREMENT_COLLISION }),
  resetCollisions: () => ({ type: ActionTypes.RESET_COLLISIONS }),
  addCollisionHistory: (collision) => ({ type: ActionTypes.ADD_COLLISION_HISTORY, payload: collision }),
  
  // Settings
  updateLighting: (lighting) => ({ type: ActionTypes.UPDATE_LIGHTING, payload: lighting }),
  toggleMaterialRemoval: () => ({ type: ActionTypes.TOGGLE_MATERIAL_REMOVAL }),
  toggleCollisionDetection: () => ({ type: ActionTypes.TOGGLE_COLLISION_DETECTION }),
  
  // Batch
  batchUpdate: (updates) => ({ type: ActionTypes.BATCH_UPDATE, payload: updates })
};

export default cncReducer;