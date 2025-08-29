// Action types
export const ActionTypes = {
  // Simulation actions
  SET_SIMULATION: 'SET_SIMULATION',
  UPDATE_SIMULATION_POSITION: 'UPDATE_SIMULATION_POSITION',
  PLAY_SIMULATION: 'PLAY_SIMULATION',
  PAUSE_SIMULATION: 'PAUSE_SIMULATION',
  STOP_SIMULATION: 'STOP_SIMULATION',
  RESET_SIMULATION: 'RESET_SIMULATION',
  STEP_SIMULATION: 'STEP_SIMULATION',
  
  // Panel actions
  SET_PANEL_VISIBILITY: 'SET_PANEL_VISIBILITY',
  SET_PANEL_POSITION: 'SET_PANEL_POSITION',
  SET_PANEL_SIZE: 'SET_PANEL_SIZE',
  MINIMIZE_PANEL: 'MINIMIZE_PANEL',
  SET_ACTIVE_PANEL: 'SET_ACTIVE_PANEL',
  RESET_PANELS: 'RESET_PANELS',
  
  // Setup actions
  UPDATE_STOCK_SETUP: 'UPDATE_STOCK_SETUP',
  UPDATE_FIXTURE_SETUP: 'UPDATE_FIXTURE_SETUP',
  UPDATE_PART_SETUP: 'UPDATE_PART_SETUP',
  UPDATE_MACHINE_SETUP: 'UPDATE_MACHINE_SETUP',
  RESET_SETUP: 'RESET_SETUP',
  
  // Tool actions
  SET_TOOL_DATABASE: 'SET_TOOL_DATABASE',
  ADD_TOOL: 'ADD_TOOL',
  UPDATE_TOOL: 'UPDATE_TOOL',
  DELETE_TOOL: 'DELETE_TOOL',
  SET_TOOL_ASSEMBLIES: 'SET_TOOL_ASSEMBLIES',
  UPDATE_TOOL_OFFSETS: 'UPDATE_TOOL_OFFSETS',
  
  // Project actions
  LOAD_PROJECT: 'LOAD_PROJECT',
  SAVE_PROJECT: 'SAVE_PROJECT',
  UPDATE_PROJECT_INFO: 'UPDATE_PROJECT_INFO',
  SET_GCODE: 'SET_GCODE',
  
  // UI actions
  SET_MOBILE: 'SET_MOBILE',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  SET_ACTIVE_MOBILE_PANEL: 'SET_ACTIVE_MOBILE_PANEL',
  TOGGLE_BOTTOM_SHEET: 'TOGGLE_BOTTOM_SHEET',
  
  // Feature toggles
  TOGGLE_MATERIAL_REMOVAL: 'TOGGLE_MATERIAL_REMOVAL',
  TOGGLE_COLLISION_DETECTION: 'TOGGLE_COLLISION_DETECTION',
  SET_COLLISION_COUNT: 'SET_COLLISION_COUNT',
  ADD_COLLISION: 'ADD_COLLISION',
  CLEAR_COLLISIONS: 'CLEAR_COLLISIONS',
  
  // Batch updates
  BATCH_UPDATE: 'BATCH_UPDATE'
};

// Initial state
export const initialState = {
  // Simulation state
  simulation: {
    isPlaying: false,
    isPaused: false,
    currentLine: 0,
    position: { x: 0, y: 0, z: 250 },
    feedRate: 1000,
    spindleSpeed: 0,
    spindleOn: false,
    coolantOn: false,
    selectedTool: null,
    g43Active: false,
    activeOffset: 'G54',
    g90Absolute: true,
    totalLines: 0,
    elapsedTime: 0,
    estimatedTime: 0
  },
  
  // Panel state
  panels: {
    gcode: { 
      visible: true, minimized: false, docked: true,
      position: { x: 20, y: 100 }, size: { width: 400, height: 600 }
    },
    tools: { 
      visible: false, minimized: false, docked: false,
      position: { x: 450, y: 100 }, size: { width: 450, height: 700 }
    },
    offsets: { 
      visible: false, minimized: false, docked: false,
      position: { x: 920, y: 100 }, size: { width: 350, height: 400 }
    },
    workOffsets: { 
      visible: false, minimized: false, docked: false,
      position: { x: 920, y: 520 }, size: { width: 350, height: 400 }
    },
    stock: { 
      visible: false, minimized: false, docked: false,
      position: { x: 450, y: 100 }, size: { width: 350, height: 300 }
    },
    fixture: { 
      visible: false, minimized: false, docked: false,
      position: { x: 450, y: 420 }, size: { width: 350, height: 300 }
    },
    part: { 
      visible: false, minimized: false, docked: false,
      position: { x: 820, y: 100 }, size: { width: 350, height: 300 }
    },
    machine: { 
      visible: false, minimized: false, docked: false,
      position: { x: 820, y: 420 }, size: { width: 350, height: 300 }
    },
    lighting: { 
      visible: false, minimized: false, docked: false,
      position: { x: 920, y: 100 }, size: { width: 400, height: 500 }
    }
  },
  activePanelId: null,
  
  // Setup configuration
  setupConfig: {
    stock: {
      type: 'rectangular',
      dimensions: { x: 200, y: 150, z: 50 },
      position: { x: 0, y: 0, z: 0 },
      material: 'Aluminum 6061',
      color: '#808080'
    },
    fixture: {
      type: 'vise',
      jawWidth: 150,
      jawHeight: 50,
      jawOpening: 100,
      position: { x: 0, y: 0, z: -50 }
    },
    part: {
      visible: false,
      opacity: 0.7,
      color: '#4CAF50',
      file: null
    },
    machine: {
      type: '3-axis',
      travels: { x: 800, y: 600, z: 500 },
      spindleRange: { min: 0, max: 24000 },
      rapidRate: 15000,
      maxFeedRate: 10000
    }
  },
  
  // Tool state
  toolDatabase: [],
  toolAssemblies: [],
  toolOffsetTable: {
    geometryOffsets: Array(99).fill(null).map(() => ({ x: 0, y: 0, z: 0 })),
    wearOffsets: Array(99).fill(null).map(() => ({ x: 0, y: 0, z: 0 })),
    diameterOffsets: Array(99).fill(null).map(() => ({ geometry: 0, wear: 0 }))
  },
  
  // Project state
  project: {
    name: 'Untitled Project',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    gcode: '',
    notes: ''
  },
  
  // UI state
  ui: {
    isMobile: false,
    mobileMenuOpen: false,
    activeMobilePanel: null,
    mobileBottomSheet: false
  },
  
  // Features state
  features: {
    materialRemoval: true,
    collisionDetection: true,
    stopOnCollision: true,
    collisionCount: 0,
    collisionHistory: []
  }
};

// Reducer function
export const appReducer = (state = initialState, action) => {
  switch (action.type) {
    // Simulation actions
    case ActionTypes.SET_SIMULATION:
      return {
        ...state,
        simulation: { ...state.simulation, ...action.payload }
      };
      
    case ActionTypes.PLAY_SIMULATION:
      return {
        ...state,
        simulation: { ...state.simulation, isPlaying: true, isPaused: false }
      };
      
    case ActionTypes.PAUSE_SIMULATION:
      return {
        ...state,
        simulation: { ...state.simulation, isPlaying: false, isPaused: true }
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
          activeOffset: state.simulation.activeOffset,
          selectedTool: state.simulation.selectedTool
        }
      };
      
    // Panel actions
    case ActionTypes.SET_PANEL_VISIBILITY:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panelId]: {
            ...state.panels[action.payload.panelId],
            visible: action.payload.visible
          }
        }
      };
      
    case ActionTypes.SET_PANEL_POSITION:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panelId]: {
            ...state.panels[action.payload.panelId],
            position: action.payload.position
          }
        }
      };
      
    case ActionTypes.SET_PANEL_SIZE:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panelId]: {
            ...state.panels[action.payload.panelId],
            size: action.payload.size
          }
        }
      };
      
    case ActionTypes.MINIMIZE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panelId]: {
            ...state.panels[action.payload.panelId],
            minimized: action.payload.minimized
          }
        }
      };
      
    case ActionTypes.SET_ACTIVE_PANEL:
      return {
        ...state,
        activePanelId: action.payload
      };
      
    // Setup actions
    case ActionTypes.UPDATE_STOCK_SETUP:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          stock: { ...state.setupConfig.stock, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_FIXTURE_SETUP:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          fixture: { ...state.setupConfig.fixture, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_PART_SETUP:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          part: { ...state.setupConfig.part, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_MACHINE_SETUP:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          machine: { ...state.setupConfig.machine, ...action.payload }
        }
      };
      
    // Tool actions
    case ActionTypes.SET_TOOL_DATABASE:
      return {
        ...state,
        toolDatabase: action.payload
      };
      
    case ActionTypes.ADD_TOOL:
      return {
        ...state,
        toolDatabase: [...state.toolDatabase, action.payload]
      };
      
    case ActionTypes.UPDATE_TOOL:
      return {
        ...state,
        toolDatabase: state.toolDatabase.map(tool =>
          tool.id === action.payload.id ? action.payload : tool
        )
      };
      
    case ActionTypes.DELETE_TOOL:
      return {
        ...state,
        toolDatabase: state.toolDatabase.filter(tool => tool.id !== action.payload)
      };
      
    case ActionTypes.SET_TOOL_ASSEMBLIES:
      return {
        ...state,
        toolAssemblies: action.payload
      };
      
    case ActionTypes.UPDATE_TOOL_OFFSETS:
      return {
        ...state,
        toolOffsetTable: { ...state.toolOffsetTable, ...action.payload }
      };
      
    // Project actions
    case ActionTypes.LOAD_PROJECT:
      return {
        ...state,
        ...action.payload
      };
      
    case ActionTypes.UPDATE_PROJECT_INFO:
      return {
        ...state,
        project: { ...state.project, ...action.payload }
      };
      
    case ActionTypes.SET_GCODE:
      return {
        ...state,
        project: {
          ...state.project,
          gcode: action.payload,
          modified: new Date().toISOString()
        }
      };
      
    // UI actions
    case ActionTypes.SET_MOBILE:
      return {
        ...state,
        ui: { ...state.ui, isMobile: action.payload }
      };
      
    case ActionTypes.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        ui: { ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen }
      };
      
    case ActionTypes.SET_ACTIVE_MOBILE_PANEL:
      return {
        ...state,
        ui: { ...state.ui, activeMobilePanel: action.payload }
      };
      
    // Feature toggles
    case ActionTypes.TOGGLE_MATERIAL_REMOVAL:
      return {
        ...state,
        features: { ...state.features, materialRemoval: !state.features.materialRemoval }
      };
      
    case ActionTypes.TOGGLE_COLLISION_DETECTION:
      return {
        ...state,
        features: { ...state.features, collisionDetection: !state.features.collisionDetection }
      };
      
    case ActionTypes.ADD_COLLISION:
      return {
        ...state,
        features: {
          ...state.features,
          collisionCount: state.features.collisionCount + 1,
          collisionHistory: [...state.features.collisionHistory, action.payload]
        }
      };
      
    case ActionTypes.CLEAR_COLLISIONS:
      return {
        ...state,
        features: {
          ...state.features,
          collisionCount: 0,
          collisionHistory: []
        }
      };
      
    // Batch updates
    case ActionTypes.BATCH_UPDATE:
      return action.payload.reduce((acc, update) => 
        appReducer(acc, update), state
      );
      
    default:
      return state;
  }
};

// Action creators
export const actions = {
  // Simulation
  setSimulation: (updates) => ({ type: ActionTypes.SET_SIMULATION, payload: updates }),
  playSimulation: () => ({ type: ActionTypes.PLAY_SIMULATION }),
  pauseSimulation: () => ({ type: ActionTypes.PAUSE_SIMULATION }),
  stopSimulation: () => ({ type: ActionTypes.STOP_SIMULATION }),
  resetSimulation: () => ({ type: ActionTypes.RESET_SIMULATION }),
  
  // Panels
  setPanelVisibility: (panelId, visible) => ({ 
    type: ActionTypes.SET_PANEL_VISIBILITY, 
    payload: { panelId, visible } 
  }),
  setPanelPosition: (panelId, position) => ({ 
    type: ActionTypes.SET_PANEL_POSITION, 
    payload: { panelId, position } 
  }),
  setPanelSize: (panelId, size) => ({ 
    type: ActionTypes.SET_PANEL_SIZE, 
    payload: { panelId, size } 
  }),
  minimizePanel: (panelId, minimized) => ({ 
    type: ActionTypes.MINIMIZE_PANEL, 
    payload: { panelId, minimized } 
  }),
  setActivePanel: (panelId) => ({ 
    type: ActionTypes.SET_ACTIVE_PANEL, 
    payload: panelId 
  }),
  
  // Setup
  updateStockSetup: (updates) => ({ type: ActionTypes.UPDATE_STOCK_SETUP, payload: updates }),
  updateFixtureSetup: (updates) => ({ type: ActionTypes.UPDATE_FIXTURE_SETUP, payload: updates }),
  updatePartSetup: (updates) => ({ type: ActionTypes.UPDATE_PART_SETUP, payload: updates }),
  updateMachineSetup: (updates) => ({ type: ActionTypes.UPDATE_MACHINE_SETUP, payload: updates }),
  
  // Tools
  setToolDatabase: (tools) => ({ type: ActionTypes.SET_TOOL_DATABASE, payload: tools }),
  addTool: (tool) => ({ type: ActionTypes.ADD_TOOL, payload: tool }),
  updateTool: (tool) => ({ type: ActionTypes.UPDATE_TOOL, payload: tool }),
  deleteTool: (toolId) => ({ type: ActionTypes.DELETE_TOOL, payload: toolId }),
  setToolAssemblies: (assemblies) => ({ type: ActionTypes.SET_TOOL_ASSEMBLIES, payload: assemblies }),
  updateToolOffsets: (offsets) => ({ type: ActionTypes.UPDATE_TOOL_OFFSETS, payload: offsets }),
  
  // Project
  loadProject: (project) => ({ type: ActionTypes.LOAD_PROJECT, payload: project }),
  updateProjectInfo: (info) => ({ type: ActionTypes.UPDATE_PROJECT_INFO, payload: info }),
  setGCode: (gcode) => ({ type: ActionTypes.SET_GCODE, payload: gcode }),
  
  // UI
  setMobile: (isMobile) => ({ type: ActionTypes.SET_MOBILE, payload: isMobile }),
  toggleMobileMenu: () => ({ type: ActionTypes.TOGGLE_MOBILE_MENU }),
  setActiveMobilePanel: (panel) => ({ type: ActionTypes.SET_ACTIVE_MOBILE_PANEL, payload: panel }),
  
  // Features
  toggleMaterialRemoval: () => ({ type: ActionTypes.TOGGLE_MATERIAL_REMOVAL }),
  toggleCollisionDetection: () => ({ type: ActionTypes.TOGGLE_COLLISION_DETECTION }),
  addCollision: (collision) => ({ type: ActionTypes.ADD_COLLISION, payload: collision }),
  clearCollisions: () => ({ type: ActionTypes.CLEAR_COLLISIONS }),
  
  // Batch
  batchUpdate: (updates) => ({ type: ActionTypes.BATCH_UPDATE, payload: updates })
};