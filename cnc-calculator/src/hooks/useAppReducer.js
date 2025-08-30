import { useReducer, useCallback } from 'react';

// Action types
const ActionTypes = {
  // Simulation actions
  SET_SIMULATION: 'SET_SIMULATION',
  PLAY_SIMULATION: 'PLAY_SIMULATION',
  PAUSE_SIMULATION: 'PAUSE_SIMULATION',
  STOP_SIMULATION: 'STOP_SIMULATION',
  RESET_SIMULATION: 'RESET_SIMULATION',
  STEP_FORWARD: 'STEP_FORWARD',
  STEP_BACKWARD: 'STEP_BACKWARD',
  
  // Panel actions
  SET_PANEL_VISIBILITY: 'SET_PANEL_VISIBILITY',
  SET_PANEL_POSITION: 'SET_PANEL_POSITION',
  SET_PANEL_SIZE: 'SET_PANEL_SIZE',
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  MINIMIZE_PANEL: 'MINIMIZE_PANEL',
  CLOSE_ALL_PANELS: 'CLOSE_ALL_PANELS',
  
  // Setup actions
  SET_SETUP_CONFIG: 'SET_SETUP_CONFIG',
  UPDATE_WORK_OFFSET: 'UPDATE_WORK_OFFSET',
  SET_ACTIVE_OFFSET: 'SET_ACTIVE_OFFSET',
  UPDATE_STOCK: 'UPDATE_STOCK',
  UPDATE_FIXTURE: 'UPDATE_FIXTURE',
  UPDATE_MACHINE: 'UPDATE_MACHINE',
  
  // Tool actions
  SET_TOOL_OFFSET: 'SET_TOOL_OFFSET',
  UPDATE_TOOL_ASSEMBLY: 'UPDATE_TOOL_ASSEMBLY',
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  
  // Project actions
  SET_PROJECT: 'SET_PROJECT',
  UPDATE_GCODE: 'UPDATE_GCODE',
  
  // UI actions
  SET_MOBILE: 'SET_MOBILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Batch updates
  BATCH_UPDATE: 'BATCH_UPDATE'
};

// Initial state
const initialState = {
  simulation: {
    isPlaying: false,
    currentLine: 0,
    position: { x: 0, y: 0, z: 250 },
    speed: 1.0,
    toolAssembly: null,
    currentToolLength: 0,
    toolLengthCompActive: false,
    cutterCompActive: false,
    activeHCode: 1,
    activeDCode: 0,
    spindleSpeed: 0,
    feedRate: 100,
    programTools: []
  },
  
  panels: {
    gcode: { visible: true, minimized: false, x: 10, y: 60, width: 400, height: 500 },
    tools: { visible: false, minimized: false, x: 420, y: 60, width: 400, height: 600 },
    offsets: { visible: false, minimized: false, x: 830, y: 60, width: 350, height: 400 },
    setup: { visible: false, minimized: false, x: 10, y: 470, width: 400, height: 400 },
    lighting: { visible: false, minimized: false, x: 420, y: 470, width: 350, height: 400 }
  },
  
  setupConfig: {
    stock: {
      type: 'rectangular',
      dimensions: { x: 200, y: 150, z: 50 },
      position: { x: 0, y: 0, z: 0 },
      material: 'aluminum'
    },
    fixture: {
      type: 'vise',
      jawWidth: 150,
      jawHeight: 50,
      clampingForce: 5000
    },
    machine: {
      type: '3-axis',
      travels: { x: 500, y: 400, z: 300 },
      spindleRange: { min: 100, max: 24000 },
      rapidFeedRate: 10000
    },
    workOffsets: {
      activeOffset: 'G54',
      G54: { x: 0, y: 0, z: 50 },
      G55: { x: 100, y: 100, z: 0 },
      G56: { x: 0, y: 0, z: 0 },
      G57: { x: 0, y: 0, z: 0 },
      G58: { x: 0, y: 0, z: 0 },
      G59: { x: 0, y: 0, z: 0 }
    }
  },
  
  project: {
    name: 'New Project',
    gcode: {
      channel1: '',
      channel2: ''
    },
    features: [],
    suggestedTools: []
  },
  
  ui: {
    isMobile: false,
    error: null,
    loading: false
  }
};

// Reducer function
function appReducer(state, action) {
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
        simulation: { ...state.simulation, isPlaying: true }
      };
      
    case ActionTypes.PAUSE_SIMULATION:
      return {
        ...state,
        simulation: { ...state.simulation, isPlaying: false }
      };
      
    case ActionTypes.STOP_SIMULATION:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isPlaying: false,
          currentLine: 0,
          position: { x: 0, y: 0, z: 250 }
        }
      };
      
    case ActionTypes.RESET_SIMULATION:
      return {
        ...state,
        simulation: {
          ...initialState.simulation,
          speed: state.simulation.speed,
          toolAssembly: state.simulation.toolAssembly
        }
      };
      
    case ActionTypes.STEP_FORWARD:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          currentLine: state.simulation.currentLine + 1
        }
      };
      
    case ActionTypes.STEP_BACKWARD:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          currentLine: Math.max(0, state.simulation.currentLine - 1)
        }
      };
      
    // Panel actions
    case ActionTypes.SET_PANEL_VISIBILITY:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panel]: {
            ...state.panels[action.payload.panel],
            visible: action.payload.visible
          }
        }
      };
      
    case ActionTypes.TOGGLE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload]: {
            ...state.panels[action.payload],
            visible: !state.panels[action.payload].visible
          }
        }
      };
      
    case ActionTypes.MINIMIZE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload]: {
            ...state.panels[action.payload],
            minimized: !state.panels[action.payload].minimized
          }
        }
      };
      
    case ActionTypes.SET_PANEL_POSITION:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panel]: {
            ...state.panels[action.payload.panel],
            x: action.payload.x,
            y: action.payload.y
          }
        }
      };
      
    case ActionTypes.SET_PANEL_SIZE:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.panel]: {
            ...state.panels[action.payload.panel],
            width: action.payload.width,
            height: action.payload.height
          }
        }
      };
      
    case ActionTypes.CLOSE_ALL_PANELS:
      const closedPanels = {};
      Object.keys(state.panels).forEach(key => {
        closedPanels[key] = { ...state.panels[key], visible: false };
      });
      return {
        ...state,
        panels: closedPanels
      };
      
    // Setup actions
    case ActionTypes.SET_SETUP_CONFIG:
      return {
        ...state,
        setupConfig: { ...state.setupConfig, ...action.payload }
      };
      
    case ActionTypes.UPDATE_WORK_OFFSET:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          workOffsets: {
            ...state.setupConfig.workOffsets,
            [action.payload.offset]: action.payload.values
          }
        }
      };
      
    case ActionTypes.SET_ACTIVE_OFFSET:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          workOffsets: {
            ...state.setupConfig.workOffsets,
            activeOffset: action.payload
          }
        }
      };
      
    case ActionTypes.UPDATE_STOCK:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          stock: { ...state.setupConfig.stock, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_FIXTURE:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          fixture: { ...state.setupConfig.fixture, ...action.payload }
        }
      };
      
    case ActionTypes.UPDATE_MACHINE:
      return {
        ...state,
        setupConfig: {
          ...state.setupConfig,
          machine: { ...state.setupConfig.machine, ...action.payload }
        }
      };
      
    // Tool actions
    case ActionTypes.SET_TOOL_OFFSET:
      return {
        ...state,
        toolOffsetTable: action.payload
      };
      
    case ActionTypes.UPDATE_TOOL_ASSEMBLY:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          toolAssembly: action.payload
        }
      };
      
    case ActionTypes.SET_ACTIVE_TOOL:
      return {
        ...state,
        simulation: {
          ...state.simulation,
          toolAssembly: action.payload.assembly,
          currentToolLength: action.payload.length
        }
      };
      
    // Project actions
    case ActionTypes.SET_PROJECT:
      return {
        ...state,
        project: { ...state.project, ...action.payload }
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
      
    // UI actions
    case ActionTypes.SET_MOBILE:
      return {
        ...state,
        ui: { ...state.ui, isMobile: action.payload }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: null }
      };
      
    // Batch updates for performance
    case ActionTypes.BATCH_UPDATE:
      return action.payload.reduce((acc, update) => {
        return appReducer(acc, update);
      }, state);
      
    default:
      return state;
  }
}

// Custom hook
export function useAppReducer(initialStateOverride = {}) {
  const [state, dispatch] = useReducer(
    appReducer, 
    { ...initialState, ...initialStateOverride }
  );
  
  // Create memoized action creators
  const actions = useCallback({
    // Simulation actions
    setSimulation: (payload) => dispatch({ type: ActionTypes.SET_SIMULATION, payload }),
    playSimulation: () => dispatch({ type: ActionTypes.PLAY_SIMULATION }),
    pauseSimulation: () => dispatch({ type: ActionTypes.PAUSE_SIMULATION }),
    stopSimulation: () => dispatch({ type: ActionTypes.STOP_SIMULATION }),
    resetSimulation: () => dispatch({ type: ActionTypes.RESET_SIMULATION }),
    stepForward: () => dispatch({ type: ActionTypes.STEP_FORWARD }),
    stepBackward: () => dispatch({ type: ActionTypes.STEP_BACKWARD }),
    
    // Panel actions
    setPanelVisibility: (panel, visible) => 
      dispatch({ type: ActionTypes.SET_PANEL_VISIBILITY, payload: { panel, visible } }),
    togglePanel: (panel) => dispatch({ type: ActionTypes.TOGGLE_PANEL, payload: panel }),
    minimizePanel: (panel) => dispatch({ type: ActionTypes.MINIMIZE_PANEL, payload: panel }),
    setPanelPosition: (panel, x, y) => 
      dispatch({ type: ActionTypes.SET_PANEL_POSITION, payload: { panel, x, y } }),
    setPanelSize: (panel, width, height) => 
      dispatch({ type: ActionTypes.SET_PANEL_SIZE, payload: { panel, width, height } }),
    closeAllPanels: () => dispatch({ type: ActionTypes.CLOSE_ALL_PANELS }),
    
    // Setup actions
    setSetupConfig: (payload) => dispatch({ type: ActionTypes.SET_SETUP_CONFIG, payload }),
    updateWorkOffset: (offset, values) => 
      dispatch({ type: ActionTypes.UPDATE_WORK_OFFSET, payload: { offset, values } }),
    setActiveOffset: (offset) => dispatch({ type: ActionTypes.SET_ACTIVE_OFFSET, payload: offset }),
    updateStock: (payload) => dispatch({ type: ActionTypes.UPDATE_STOCK, payload }),
    updateFixture: (payload) => dispatch({ type: ActionTypes.UPDATE_FIXTURE, payload }),
    updateMachine: (payload) => dispatch({ type: ActionTypes.UPDATE_MACHINE, payload }),
    
    // Tool actions
    setToolOffset: (payload) => dispatch({ type: ActionTypes.SET_TOOL_OFFSET, payload }),
    updateToolAssembly: (assembly) => 
      dispatch({ type: ActionTypes.UPDATE_TOOL_ASSEMBLY, payload: assembly }),
    setActiveTool: (assembly, length) => 
      dispatch({ type: ActionTypes.SET_ACTIVE_TOOL, payload: { assembly, length } }),
    
    // Project actions
    setProject: (payload) => dispatch({ type: ActionTypes.SET_PROJECT, payload }),
    updateGCode: (channel, code) => 
      dispatch({ type: ActionTypes.UPDATE_GCODE, payload: { channel, code } }),
    
    // UI actions
    setMobile: (isMobile) => dispatch({ type: ActionTypes.SET_MOBILE, payload: isMobile }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    // Batch update for performance
    batchUpdate: (updates) => dispatch({ type: ActionTypes.BATCH_UPDATE, payload: updates })
  }, [dispatch]);
  
  return {
    state,
    dispatch,
    actions
  };
}

export { ActionTypes };
export default useAppReducer;