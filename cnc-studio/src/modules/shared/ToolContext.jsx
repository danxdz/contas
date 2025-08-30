import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Tool Context for sharing tool state across modules
const ToolContext = createContext();

// Custom hook to use tool context
export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within ToolProvider');
  }
  return context;
};

// Event emitter for tool-related events
class ToolEventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Tool Provider Component
export const ToolProvider = ({ children }) => {
  // Tool library - all available tools
  const [toolLibrary, setToolLibrary] = useState(() => {
    const saved = localStorage.getItem('cnc-tool-library');
    return saved ? JSON.parse(saved) : [];
  });

  // Magazine state - tools currently loaded in magazine
  const [magazine, setMagazine] = useState(() => {
    const saved = localStorage.getItem('cnc-magazine-state');
    return saved ? JSON.parse(saved) : {
      type: 'carousel', // carousel, turret, chain, rack
      capacity: 24,
      slots: {},
      currentSlot: 0,
      changeTime: 3.5, // seconds
      maxToolWeight: 15, // kg
      maxToolDiameter: 100, // mm
      maxToolLength: 300 // mm
    };
  });

  // Current tool in spindle
  const [currentTool, setCurrentTool] = useState(null);
  
  // Tool change state
  const [toolChangeState, setToolChangeState] = useState({
    isChanging: false,
    targetTool: null,
    progress: 0,
    stage: null // 'spindle-stop', 'retract', 'orient', 'unclamp', 'exchange', 'clamp', 'return'
  });

  // Tool wear and compensation
  const [toolCompensation, setToolCompensation] = useState({
    lengthOffsets: {}, // H offsets
    diameterOffsets: {}, // D offsets
    wearOffsets: {}
  });

  // Tool usage statistics
  const [toolStats, setToolStats] = useState({});

  // Event bus for module communication
  const [eventBus] = useState(() => new ToolEventBus());

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('cnc-tool-library', JSON.stringify(toolLibrary));
  }, [toolLibrary]);

  useEffect(() => {
    localStorage.setItem('cnc-magazine-state', JSON.stringify(magazine));
  }, [magazine]);

  // Add tool to library
  const addToolToLibrary = useCallback((tool) => {
    const newTool = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...tool,
      // Ensure all properties exist
      cuttingData: tool.cuttingData || {
        vc: 0, // cutting speed m/min
        fz: 0, // feed per tooth
        ap: 0, // axial depth
        ae: 0  // radial depth
      },
      geometry: tool.geometry || {
        overallLength: 0,
        cuttingLength: 0,
        shankDiameter: 0,
        helixAngle: 30,
        cornerRadius: 0
      },
      holder: tool.holder || {
        type: 'none',
        interface: 'none',
        pullStud: 'none',
        gauge: 0
      },
      wear: tool.wear || {
        flankWear: 0,
        craterWear: 0,
        tipWear: 0,
        chipping: false,
        breakage: false,
        usageTime: 0,
        cuttingDistance: 0
      }
    };

    setToolLibrary(prev => [...prev, newTool]);
    eventBus.emit('tool:added', newTool);
    return newTool;
  }, [eventBus]);

  // Update tool in library
  const updateTool = useCallback((toolId, updates) => {
    setToolLibrary(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, ...updates } : tool
    ));
    eventBus.emit('tool:updated', { toolId, updates });
  }, [eventBus]);

  // Delete tool from library
  const deleteTool = useCallback((toolId) => {
    // Check if tool is in magazine
    const slotWithTool = Object.entries(magazine.slots).find(([_, tool]) => tool?.id === toolId);
    if (slotWithTool) {
      console.warn(`Tool ${toolId} is currently in magazine slot ${slotWithTool[0]}`);
      return false;
    }
    
    setToolLibrary(prev => prev.filter(tool => tool.id !== toolId));
    eventBus.emit('tool:deleted', toolId);
    return true;
  }, [magazine.slots, eventBus]);

  // Load tool into magazine slot
  const loadToolInMagazine = useCallback((toolId, slot) => {
    const tool = toolLibrary.find(t => t.id === toolId);
    if (!tool) {
      console.error(`Tool ${toolId} not found in library`);
      return false;
    }

    if (slot < 0 || slot >= magazine.capacity) {
      console.error(`Invalid slot ${slot}. Magazine capacity is ${magazine.capacity}`);
      return false;
    }

    // Check tool constraints
    if (tool.diameter > magazine.maxToolDiameter) {
      console.error(`Tool diameter ${tool.diameter}mm exceeds maximum ${magazine.maxToolDiameter}mm`);
      return false;
    }

    if (tool.geometry?.overallLength > magazine.maxToolLength) {
      console.error(`Tool length exceeds maximum ${magazine.maxToolLength}mm`);
      return false;
    }

    setMagazine(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [slot]: tool
      }
    }));

    eventBus.emit('magazine:toolLoaded', { tool, slot });
    return true;
  }, [toolLibrary, magazine.capacity, magazine.maxToolDiameter, magazine.maxToolLength, eventBus]);

  // Remove tool from magazine
  const unloadToolFromMagazine = useCallback((slot) => {
    if (currentTool?.slot === slot) {
      console.error('Cannot unload tool currently in spindle');
      return false;
    }

    setMagazine(prev => {
      const newSlots = { ...prev.slots };
      delete newSlots[slot];
      return {
        ...prev,
        slots: newSlots
      };
    });

    eventBus.emit('magazine:toolUnloaded', { slot });
    return true;
  }, [currentTool, eventBus]);

  // Simulate tool change
  const changeToolTo = useCallback(async (targetSlot) => {
    if (toolChangeState.isChanging) {
      console.error('Tool change already in progress');
      return false;
    }

    const targetTool = magazine.slots[targetSlot];
    if (!targetTool && targetSlot !== 0) {
      console.error(`No tool in slot ${targetSlot}`);
      return false;
    }

    // Start tool change sequence
    setToolChangeState({
      isChanging: true,
      targetTool: targetSlot,
      progress: 0,
      stage: 'spindle-stop'
    });

    eventBus.emit('toolchange:start', { current: currentTool, target: targetSlot });

    // Simulate tool change stages
    const stages = [
      { name: 'spindle-stop', duration: 500 },
      { name: 'retract', duration: 800 },
      { name: 'orient', duration: 600 },
      { name: 'unclamp', duration: 400 },
      { name: 'exchange', duration: 1500 },
      { name: 'clamp', duration: 400 },
      { name: 'return', duration: 800 }
    ];

    let totalProgress = 0;
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

    for (const stage of stages) {
      setToolChangeState(prev => ({
        ...prev,
        stage: stage.name,
        progress: (totalProgress / totalDuration) * 100
      }));

      eventBus.emit('toolchange:stage', stage.name);
      
      // Wait for stage duration
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      totalProgress += stage.duration;
    }

    // Update current tool
    if (targetSlot === 0) {
      setCurrentTool(null);
    } else {
      setCurrentTool({
        ...targetTool,
        slot: targetSlot
      });
    }

    // Update magazine current slot
    setMagazine(prev => ({
      ...prev,
      currentSlot: targetSlot
    }));

    // Complete tool change
    setToolChangeState({
      isChanging: false,
      targetTool: null,
      progress: 100,
      stage: null
    });

    eventBus.emit('toolchange:complete', { tool: targetTool, slot: targetSlot });
    return true;
  }, [toolChangeState.isChanging, magazine.slots, currentTool, eventBus]);

  // Update tool compensation
  const setToolOffset = useCallback((type, number, value) => {
    setToolCompensation(prev => ({
      ...prev,
      [`${type}Offsets`]: {
        ...prev[`${type}Offsets`],
        [number]: value
      }
    }));
    eventBus.emit('compensation:updated', { type, number, value });
  }, [eventBus]);

  // Track tool usage
  const updateToolUsage = useCallback((toolId, usage) => {
    setToolStats(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ...usage,
        lastUsed: new Date().toISOString()
      }
    }));

    // Update wear if cutting
    if (usage.cuttingTime) {
      setToolLibrary(prev => prev.map(tool => {
        if (tool.id === toolId) {
          const wear = tool.wear || {};
          return {
            ...tool,
            wear: {
              ...wear,
              usageTime: (wear.usageTime || 0) + usage.cuttingTime,
              cuttingDistance: (wear.cuttingDistance || 0) + (usage.cuttingDistance || 0)
            }
          };
        }
        return tool;
      }));
    }

    eventBus.emit('tool:usageUpdated', { toolId, usage });
  }, [eventBus]);

  // Calculate cutting parameters
  const calculateCuttingParams = useCallback((tool, material, operation) => {
    // Basic cutting parameter calculation
    const materials = {
      'Aluminum': { vc: 300, kc: 0.25 },
      'Steel': { vc: 150, kc: 0.35 },
      'Stainless': { vc: 80, kc: 0.40 },
      'Titanium': { vc: 50, kc: 0.45 },
      'Plastic': { vc: 500, kc: 0.15 }
    };

    const mat = materials[material] || materials['Aluminum'];
    const diameter = tool.diameter || 10;
    const flutes = tool.flutes || 2;

    // Calculate RPM
    const rpm = Math.round((mat.vc * 1000) / (Math.PI * diameter));
    
    // Calculate feed per tooth based on operation
    const fzFactors = {
      'roughing': 0.1,
      'finishing': 0.05,
      'slotting': 0.08
    };
    const fz = diameter * (fzFactors[operation] || 0.08) * mat.kc;
    
    // Calculate feed rate
    const feedRate = Math.round(fz * flutes * rpm);

    return {
      rpm: Math.min(rpm, 20000), // Max spindle speed
      feedRate: Math.min(feedRate, 5000), // Max feed rate
      fz: fz.toFixed(3),
      vc: mat.vc,
      power: ((mat.vc * diameter * 0.5 * feedRate * mat.kc) / 60000).toFixed(2) // kW
    };
  }, []);

  const value = {
    // State
    toolLibrary,
    magazine,
    currentTool,
    toolChangeState,
    toolCompensation,
    toolStats,
    
    // Actions
    addToolToLibrary,
    updateTool,
    deleteTool,
    loadToolInMagazine,
    unloadToolFromMagazine,
    changeToolTo,
    setToolOffset,
    updateToolUsage,
    calculateCuttingParams,
    
    // Event bus
    eventBus,
    
    // Magazine settings
    setMagazine
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};

export default ToolContext;