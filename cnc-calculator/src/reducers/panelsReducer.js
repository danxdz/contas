/**
 * Panels reducer for managing panel state
 * @param {Object} state - Current panels state
 * @param {Object} action - Action to perform
 * @returns {Object} New panels state
 */
export const panelsReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_PANEL':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          visible: !state[action.panelId].visible
        }
      };
      
    case 'SHOW_PANEL':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          visible: true
        }
      };
      
    case 'HIDE_PANEL':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          visible: false
        }
      };
      
    case 'MINIMIZE_PANEL':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          minimized: !state[action.panelId].minimized
        }
      };
      
    case 'UPDATE_POSITION':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          position: action.position
        }
      };
      
    case 'UPDATE_SIZE':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          size: action.size
        }
      };
      
    case 'UPDATE_Z_INDEX':
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          zIndex: action.zIndex
        }
      };
      
    case 'BRING_TO_FRONT':
      const maxZ = Math.max(...Object.values(state).map(p => p.zIndex || 0));
      return {
        ...state,
        [action.panelId]: {
          ...state[action.panelId],
          zIndex: maxZ + 1
        }
      };
      
    case 'RESET_PANELS':
      return action.initialState || initialPanelsState;
      
    default:
      return state;
  }
};

// Initial panels state
export const initialPanelsState = {
  gcode: {
    visible: false,
    floating: true,
    docked: 'left',
    position: { x: 50, y: 100 },
    size: { width: 450, height: 600 },
    zIndex: 1,
    minimized: false,
    title: 'G-Code Editor'
  },
  tools: {
    visible: false,
    floating: true,
    docked: 'right',
    position: { x: Math.max(100, window.innerWidth - 1400), y: 80 },
    size: { width: 1300, height: 700 },
    zIndex: 2,
    minimized: false,
    title: 'Tool Manager Pro'
  },
  machineControl: {
    visible: false,
    floating: true,
    docked: 'bottom',
    position: { x: 100, y: 100 },
    size: { width: 'auto', height: 'auto' },
    zIndex: 3,
    minimized: false,
    title: 'Machine Control'
  },
  offsetTable: {
    visible: false,
    floating: true,
    docked: 'right',
    position: { x: window.innerWidth - 600, y: 100 },
    size: { width: 550, height: 400 },
    zIndex: 4,
    minimized: false,
    title: 'Tool Offset Table'
  },
  workOffsets: {
    visible: false,
    floating: true,
    docked: 'left',
    position: { x: 50, y: 150 },
    size: { width: 400, height: 500 },
    zIndex: 5,
    minimized: false,
    title: 'Work Offsets'
  },
  stockSetup: {
    visible: false,
    floating: true,
    docked: 'left',
    position: { x: 100, y: 100 },
    size: { width: 400, height: 'auto' },
    zIndex: 6,
    minimized: false,
    title: 'Stock Setup'
  },
  fixtureSetup: {
    visible: false,
    floating: true,
    docked: 'left',
    position: { x: 150, y: 150 },
    size: { width: 400, height: 'auto' },
    zIndex: 7,
    minimized: false,
    title: 'Fixture Setup'
  },
  partSetup: {
    visible: false,
    floating: true,
    docked: 'left',
    position: { x: 200, y: 200 },
    size: { width: 400, height: 'auto' },
    zIndex: 8,
    minimized: false,
    title: 'Part Setup'
  },
  machineSetup: {
    visible: false,
    floating: true,
    docked: 'right',
    position: { x: 250, y: 100 },
    size: { width: 400, height: 'auto' },
    zIndex: 9,
    minimized: false,
    title: 'Machine Setup'
  },
  lightingSetup: {
    visible: false,
    floating: true,
    docked: 'right',
    position: { x: 300, y: 100 },
    size: { width: 450, height: 'auto' },
    zIndex: 10,
    minimized: false,
    title: 'Lighting Setup'
  }
};