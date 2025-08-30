import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cnc_machine_config';

export function useMachineState() {
  const [machine, setMachine] = useState(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load machine config:', e);
      }
    }
    return null;
  });

  const [presets, setPresets] = useState(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_presets`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
    return [];
  });

  // Save to localStorage whenever machine changes
  useEffect(() => {
    if (machine) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(machine));
      
      // Update viewer if available
      if (window.cncViewer) {
        // Update table dimensions
        if (machine.specifications?.workEnvelope) {
          window.cncViewer.setTable?.({
            x: machine.specifications.workEnvelope.x / 1000,
            y: machine.specifications.workEnvelope.y / 1000
          });
        }
        
        // Update spindle home
        if (machine.specifications?.workEnvelope?.z) {
          window.cncViewer.setSpindleHome?.(
            machine.specifications.workEnvelope.z / 1000
          );
        }
      }
    }
  }, [machine]);

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_presets`, JSON.stringify(presets));
  }, [presets]);

  const updateMachine = useCallback((updates) => {
    setMachine(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const updateAxes = useCallback((axes) => {
    setMachine(prev => ({
      ...prev,
      axes
    }));
  }, []);

  const updateController = useCallback((controller) => {
    setMachine(prev => ({
      ...prev,
      controller
    }));
  }, []);

  const updateSpecifications = useCallback((specifications) => {
    setMachine(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        ...specifications
      }
    }));
  }, []);

  const saveAsPreset = useCallback((name) => {
    if (machine && name) {
      const preset = {
        ...machine,
        id: `preset_${Date.now()}`,
        name,
        isPreset: true,
        savedAt: new Date().toISOString()
      };
      setPresets(prev => [...prev, preset]);
      return preset;
    }
    return null;
  }, [machine]);

  const loadPreset = useCallback((presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const { isPreset, savedAt, ...machineData } = preset;
      setMachine(machineData);
      return true;
    }
    return false;
  }, [presets]);

  const deletePreset = useCallback((presetId) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  const exportConfiguration = useCallback(() => {
    if (machine) {
      const dataStr = JSON.stringify(machine, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `machine_config_${machine.name || 'unnamed'}_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [machine]);

  const importConfiguration = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          setMachine(config);
          resolve(config);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  const resetConfiguration = useCallback(() => {
    setMachine(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    machine,
    setMachine,
    updateMachine,
    updateAxes,
    updateController,
    updateSpecifications,
    presets,
    saveAsPreset,
    loadPreset,
    deletePreset,
    exportConfiguration,
    importConfiguration,
    resetConfiguration
  };
}