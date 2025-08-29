/**
 * Simulation reducer for managing simulation state
 * @param {Object} state - Current simulation state
 * @param {Object} action - Action to perform
 * @returns {Object} New simulation state
 */
export const simulationReducer = (state, action) => {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        isPlaying: true
      };
      
    case 'PAUSE':
      return {
        ...state,
        isPlaying: false
      };
      
    case 'STOP':
      return {
        ...state,
        isPlaying: false,
        currentLine: 0,
        position: { x: 0, y: 0, z: 250 }
      };
      
    case 'RESET':
      return {
        ...simulationInitialState,
        speed: state.speed // Keep speed preference
      };
      
    case 'SET_SPEED':
      return {
        ...state,
        speed: Math.max(0.1, Math.min(10, action.speed))
      };
      
    case 'SET_CURRENT_LINE':
      return {
        ...state,
        currentLine: action.line
      };
      
    case 'NEXT_LINE':
      return {
        ...state,
        currentLine: state.currentLine + 1
      };
      
    case 'PREVIOUS_LINE':
      return {
        ...state,
        currentLine: Math.max(0, state.currentLine - 1)
      };
      
    case 'UPDATE_POSITION':
      return {
        ...state,
        position: action.position
      };
      
    case 'SET_TOOL_ASSEMBLY':
      return {
        ...state,
        toolAssembly: action.assembly
      };
      
    case 'UPDATE_FEED_RATE':
      return {
        ...state,
        feedRate: action.feedRate
      };
      
    case 'UPDATE_SPINDLE_SPEED':
      return {
        ...state,
        spindleSpeed: action.spindleSpeed
      };
      
    case 'SET_RAPID_MODE':
      return {
        ...state,
        rapidMode: action.rapidMode
      };
      
    case 'SET_INTERPOLATION':
      return {
        ...state,
        interpolation: action.interpolation
      };
      
    case 'SET_INTERPOLATION_PROGRESS':
      return {
        ...state,
        interpolationProgress: action.progress
      };
      
    case 'SET_COLLISION':
      return {
        ...state,
        hasCollision: action.hasCollision,
        collisionPoint: action.point || null
      };
      
    case 'SET_ACTIVE_TOOL':
      return {
        ...state,
        activeTool: action.tool,
        toolCompensation: {
          ...state.toolCompensation,
          H: action.tool?.H || 0,
          D: action.tool?.D || 0
        }
      };
      
    case 'SET_TOOL_COMPENSATION':
      return {
        ...state,
        toolCompensation: {
          ...state.toolCompensation,
          ...action.compensation
        }
      };
      
    case 'SET_WORK_OFFSET':
      return {
        ...state,
        activeWorkOffset: action.offset
      };
      
    case 'TOGGLE_MATERIAL_REMOVAL':
      return {
        ...state,
        showMaterialRemoval: !state.showMaterialRemoval
      };
      
    case 'TOGGLE_COLLISION_DETECTION':
      return {
        ...state,
        collisionDetection: !state.collisionDetection
      };
      
    case 'SET_MOBILE_TAB':
      return {
        ...state,
        currentTab: action.tab
      };
      
    default:
      return state;
  }
};

// Initial simulation state
export const simulationInitialState = {
  isPlaying: false,
  currentLine: 0,
  speed: 1,
  position: { x: 0, y: 0, z: 250 },
  feedRate: 0,
  spindleSpeed: 0,
  rapidMode: true,
  interpolation: null,
  interpolationProgress: 0,
  hasCollision: false,
  collisionPoint: null,
  toolAssembly: null,
  activeTool: null,
  toolCompensation: {
    active: false,
    H: 0,
    D: 0,
    wearH: 0,
    wearD: 0
  },
  activeWorkOffset: 'G54',
  showMaterialRemoval: true,
  collisionDetection: true,
  currentTab: 'viewer' // For mobile
};