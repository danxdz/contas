// Simulation state reducer for better state management

export const simulationInitialState = {
  isPlaying: false,
  isPaused: false,
  currentLine: 0,
  position: { x: 0, y: 0, z: 250 },
  speed: 1,
  toolAssembly: null,
  error: null,
  loading: false
};

export const SIMULATION_ACTIONS = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  STOP: 'STOP',
  RESET: 'RESET',
  SET_SPEED: 'SET_SPEED',
  SET_POSITION: 'SET_POSITION',
  SET_LINE: 'SET_LINE',
  STEP_FORWARD: 'STEP_FORWARD',
  STEP_BACKWARD: 'STEP_BACKWARD',
  SET_TOOL: 'SET_TOOL',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

export function simulationReducer(state, action) {
  switch (action.type) {
    case SIMULATION_ACTIONS.PLAY:
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        error: null
      };
      
    case SIMULATION_ACTIONS.PAUSE:
      return {
        ...state,
        isPlaying: false,
        isPaused: true
      };
      
    case SIMULATION_ACTIONS.STOP:
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentLine: 0,
        position: { x: 0, y: 0, z: 250 }
      };
      
    case SIMULATION_ACTIONS.RESET:
      return {
        ...simulationInitialState,
        toolAssembly: state.toolAssembly
      };
      
    case SIMULATION_ACTIONS.SET_SPEED:
      return {
        ...state,
        speed: Math.max(0.1, Math.min(10, action.payload))
      };
      
    case SIMULATION_ACTIONS.SET_POSITION:
      return {
        ...state,
        position: { ...state.position, ...action.payload }
      };
      
    case SIMULATION_ACTIONS.SET_LINE:
      return {
        ...state,
        currentLine: Math.max(0, action.payload)
      };
      
    case SIMULATION_ACTIONS.STEP_FORWARD:
      return {
        ...state,
        currentLine: state.currentLine + 1,
        position: action.payload || state.position
      };
      
    case SIMULATION_ACTIONS.STEP_BACKWARD:
      return {
        ...state,
        currentLine: Math.max(0, state.currentLine - 1),
        position: action.payload || state.position
      };
      
    case SIMULATION_ACTIONS.SET_TOOL:
      return {
        ...state,
        toolAssembly: action.payload
      };
      
    case SIMULATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isPlaying: false,
        loading: false
      };
      
    case SIMULATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case SIMULATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    default:
      return state;
  }
}