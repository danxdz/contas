import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { simulationReducer, simulationInitialState, SIMULATION_ACTIONS } from '../reducers/simulationReducer';

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Custom hooks for using context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return context;
}

// Provider component
export function AppProvider({ children }) {
  const [simulationState, simulationDispatch] = useReducer(
    simulationReducer,
    simulationInitialState
  );
  
  // Combined state
  const state = {
    simulation: simulationState
  };
  
  // Action creators
  const actions = {
    simulation: {
      play: useCallback(() => 
        simulationDispatch({ type: SIMULATION_ACTIONS.PLAY }), []),
      pause: useCallback(() => 
        simulationDispatch({ type: SIMULATION_ACTIONS.PAUSE }), []),
      stop: useCallback(() => 
        simulationDispatch({ type: SIMULATION_ACTIONS.STOP }), []),
      reset: useCallback(() => 
        simulationDispatch({ type: SIMULATION_ACTIONS.RESET }), []),
      setSpeed: useCallback((speed) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_SPEED, payload: speed }), []),
      setPosition: useCallback((position) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_POSITION, payload: position }), []),
      setLine: useCallback((line) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_LINE, payload: line }), []),
      stepForward: useCallback((position) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.STEP_FORWARD, payload: position }), []),
      stepBackward: useCallback((position) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.STEP_BACKWARD, payload: position }), []),
      setTool: useCallback((tool) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_TOOL, payload: tool }), []),
      setError: useCallback((error) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_ERROR, payload: error }), []),
      clearError: useCallback(() => 
        simulationDispatch({ type: SIMULATION_ACTIONS.CLEAR_ERROR }), []),
      setLoading: useCallback((loading) => 
        simulationDispatch({ type: SIMULATION_ACTIONS.SET_LOADING, payload: loading }), [])
    }
  };
  
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={actions}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}