import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  MM_PER_INCH,
  getWorldScale,
  setWorldScale as setGlobalWorldScale,
  mmToWorld,
  worldToMm,
  inToMm,
  mmToIn,
  toMm,
  fromMm
} from './units';

// Create context
const UnitsContext = createContext(null);

// LocalStorage keys
const STORAGE_KEYS = {
  UNITS: 'cnc-studio-units',
  WORLD_SCALE: 'cnc-studio-world-scale'
};

/**
 * UnitsContext Provider
 * Provides units state and conversion functions to all child components
 */
export function UnitsProvider({ children }) {
  // Initialize from localStorage or defaults
  const [units, setUnitsState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.UNITS);
    return stored === 'inch' ? 'inch' : 'mm';
  });

  const [worldScale, setWorldScaleState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.WORLD_SCALE);
    const scale = stored ? parseFloat(stored) : 0.01;
    setGlobalWorldScale(scale); // Sync with global
    return scale;
  });

  // Persist units to localStorage
  const setUnits = useCallback((newUnits) => {
    if (newUnits === 'mm' || newUnits === 'inch') {
      setUnitsState(newUnits);
      localStorage.setItem(STORAGE_KEYS.UNITS, newUnits);
    }
  }, []);

  // Persist world scale to localStorage
  const setWorldScale = useCallback((scale) => {
    if (typeof scale === 'number' && scale > 0) {
      setWorldScaleState(scale);
      setGlobalWorldScale(scale); // Sync with global
      localStorage.setItem(STORAGE_KEYS.WORLD_SCALE, scale.toString());
      
      // Notify viewer if it exists
      if (window.cncViewer?.setWorldScale) {
        window.cncViewer.setWorldScale(scale);
      }
    }
  }, []);

  // Context value with all utilities
  const value = {
    // State
    units,
    setUnits,
    worldScale,
    setWorldScale,
    
    // Constants
    MM_PER_INCH,
    
    // Converters
    converters: {
      mmToWorld,
      worldToMm,
      inToMm,
      mmToIn,
      toMm,
      fromMm
    }
  };

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
}

/**
 * Hook to use the UnitsContext
 * @returns {Object} Units context value
 */
export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
}

// Export for convenience
export default UnitsContext;