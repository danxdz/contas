import { Workbench, eventBus } from './WorkbenchSystem';

export class SimulationWorkbench extends Workbench {
  constructor() {
    super('Simulation', '🎮', 'Simulation and Verification - Material removal, collision detection, and analysis');
    
    // Register Simulation-specific tools
    this.tools = [
      { id: 'material-removal', name: 'Material Removal', icon: '🔪' },
      { id: 'collision-detection', name: 'Collision Detection', icon: '⚠️' },
      { id: 'time-estimation', name: 'Time Estimation', icon: '⏱️' },
      { id: 'surface-analysis', name: 'Surface Analysis', icon: '📊' }
    ];

    // Register Simulation-specific panels
    this.panels = [
      { id: 'simulation', name: 'Simulation Control', component: 'SimulationControl' },
      { id: 'analysis', name: 'Analysis', component: 'AnalysisPanel' },
      { id: 'viewport', name: '3D Viewport', component: 'Viewport3D' }
    ];

    // Simulation state
    this.simulationState = {
      isRunning: false,
      isPaused: false,
      currentLine: 0,
      currentTime: 0,
      totalTime: 0,
      materialRemoved: 0,
      collisions: [],
      cuttingData: []
    };

    // Register Simulation commands
    this.registerCommand('startSimulation', (gcode, stock, tools) => {
      this.simulationState.isRunning = true;
      this.simulationState.isPaused = false;
      this.simulationState.currentLine = 0;
      
      const simulation = {
        gcode: gcode,
        stock: stock,
        tools: tools,
        startTime: Date.now()
      };
      
      // Start simulation loop
      this.runSimulation(simulation);
      
      eventBus.emit('simulation-started', simulation);
      return simulation;
    });

    this.registerCommand('pauseSimulation', () => {
      this.simulationState.isPaused = true;
      eventBus.emit('simulation-paused', this.simulationState);
      return this.simulationState;
    });

    this.registerCommand('resumeSimulation', () => {
      this.simulationState.isPaused = false;
      eventBus.emit('simulation-resumed', this.simulationState);
      return this.simulationState;
    });

    this.registerCommand('stopSimulation', () => {
      this.simulationState.isRunning = false;
      this.simulationState.isPaused = false;
      eventBus.emit('simulation-stopped', this.simulationState);
      return this.simulationState;
    });

    this.registerCommand('detectCollisions', (toolPath, stock, fixtures) => {
      const collisions = [];
      
      toolPath.forEach((position, index) => {
        // Check tool vs stock collision (rapid moves above stock)
        if (position.isRapid && position.z < 5) {
          collisions.push({
            type: 'rapid-too-low',
            line: index,
            position: position,
            severity: 'warning'
          });
        }
        
        // Check tool vs fixture collision
        if (fixtures) {
          fixtures.forEach(fixture => {
            if (this.checkToolFixtureCollision(position, fixture)) {
              collisions.push({
                type: 'fixture-collision',
                line: index,
                position: position,
                fixture: fixture,
                severity: 'error'
              });
            }
          });
        }
        
        // Check exceeds machine limits
        if (Math.abs(position.x) > 500 || Math.abs(position.y) > 300 || position.z < -100) {
          collisions.push({
            type: 'exceeds-travel',
            line: index,
            position: position,
            severity: 'error'
          });
        }
      });
      
      this.simulationState.collisions = collisions;
      eventBus.emit('collisions-detected', collisions);
      return collisions;
    });

    this.registerCommand('calculateMaterialRemoval', (toolPath, tool, stock) => {
      let totalVolume = 0;
      const removalSegments = [];
      
      for (let i = 1; i < toolPath.length; i++) {
        const prev = toolPath[i - 1];
        const curr = toolPath[i];
        
        if (!curr.isRapid && curr.z < 0) {
          // Calculate swept volume for this segment
          const distance = Math.sqrt(
            Math.pow(curr.x - prev.x, 2) +
            Math.pow(curr.y - prev.y, 2) +
            Math.pow(curr.z - prev.z, 2)
          );
          
          const segmentVolume = Math.PI * Math.pow(tool.diameter / 2, 2) * distance;
          totalVolume += segmentVolume;
          
          removalSegments.push({
            start: prev,
            end: curr,
            volume: segmentVolume,
            feedRate: curr.feedRate
          });
        }
      }
      
      const materialData = {
        totalVolume: totalVolume,
        segments: removalSegments,
        removalRate: totalVolume / this.simulationState.totalTime,
        efficiency: (totalVolume / (stock.width * stock.height * stock.depth)) * 100
      };
      
      this.simulationState.materialRemoved = totalVolume;
      eventBus.emit('material-removal-calculated', materialData);
      return materialData;
    });

    this.registerCommand('estimateMachiningTime', (toolPath) => {
      let totalTime = 0;
      let rapidTime = 0;
      let cuttingTime = 0;
      
      const rapidFeedRate = 10000; // mm/min for rapid moves
      
      for (let i = 1; i < toolPath.length; i++) {
        const prev = toolPath[i - 1];
        const curr = toolPath[i];
        
        const distance = Math.sqrt(
          Math.pow(curr.x - prev.x, 2) +
          Math.pow(curr.y - prev.y, 2) +
          Math.pow(curr.z - prev.z, 2)
        );
        
        if (curr.isRapid) {
          const time = (distance / rapidFeedRate) * 60; // Convert to seconds
          rapidTime += time;
        } else {
          const time = (distance / (curr.feedRate || 100)) * 60; // Convert to seconds
          cuttingTime += time;
        }
      }
      
      totalTime = rapidTime + cuttingTime;
      
      const timeData = {
        totalTime: totalTime,
        rapidTime: rapidTime,
        cuttingTime: cuttingTime,
        rapidPercentage: (rapidTime / totalTime) * 100,
        estimatedCompletion: new Date(Date.now() + totalTime * 1000)
      };
      
      this.simulationState.totalTime = totalTime;
      eventBus.emit('time-estimated', timeData);
      return timeData;
    });

    this.registerCommand('analyzeSurfaceFinish', (toolPath, tool, feedRate) => {
      // Calculate theoretical surface roughness
      const feedPerTooth = feedRate / (tool.flutes * tool.rpm);
      const cusps = [];
      
      // Calculate cusp height for different scenarios
      const ballEndCusp = tool.type === 'ball' ? 
        Math.pow(feedPerTooth, 2) / (8 * tool.diameter) : null;
      
      const scallop = tool.stepover ? 
        tool.diameter - Math.sqrt(Math.pow(tool.diameter, 2) - Math.pow(tool.stepover, 2)) : null;
      
      const surfaceData = {
        theoreticalRa: feedPerTooth * 0.032, // Simplified Ra calculation
        cuspHeight: ballEndCusp,
        scallopHeight: scallop,
        feedMarks: feedPerTooth,
        quality: this.determineSurfaceQuality(feedPerTooth)
      };
      
      eventBus.emit('surface-analyzed', surfaceData);
      return surfaceData;
    });

    this.registerCommand('generateChipLoad', (tool, material, feedRate, spindleSpeed) => {
      const chipLoad = feedRate / (tool.flutes * spindleSpeed);
      const recommendedChipLoad = this.getRecommendedChipLoad(tool, material);
      
      const chipData = {
        actual: chipLoad,
        recommended: recommendedChipLoad,
        percentage: (chipLoad / recommendedChipLoad) * 100,
        status: this.evaluateChipLoad(chipLoad, recommendedChipLoad)
      };
      
      this.simulationState.cuttingData.push(chipData);
      eventBus.emit('chip-load-calculated', chipData);
      return chipData;
    });
  }

  runSimulation(simulation) {
    if (!this.simulationState.isRunning) return;
    if (this.simulationState.isPaused) {
      setTimeout(() => this.runSimulation(simulation), 100);
      return;
    }
    
    // Process next line of G-code
    const lines = simulation.gcode.split('\n');
    if (this.simulationState.currentLine < lines.length) {
      const line = lines[this.simulationState.currentLine];
      
      // Emit current line for visualization
      eventBus.emit('simulation-line', {
        line: line,
        lineNumber: this.simulationState.currentLine,
        progress: (this.simulationState.currentLine / lines.length) * 100
      });
      
      this.simulationState.currentLine++;
      this.simulationState.currentTime += 0.1; // Simulated time increment
      
      // Continue simulation
      setTimeout(() => this.runSimulation(simulation), 50);
    } else {
      // Simulation complete
      this.simulationState.isRunning = false;
      eventBus.emit('simulation-complete', this.simulationState);
    }
  }

  checkToolFixtureCollision(position, fixture) {
    // Simplified collision detection
    if (fixture.type === 'vise') {
      // Check if tool intersects vise jaws
      if (position.z < -fixture.jawHeight && 
          position.y > -fixture.jawWidth/2 && 
          position.y < fixture.jawWidth/2) {
        return true;
      }
    }
    return false;
  }

  determineSurfaceQuality(feedPerTooth) {
    if (feedPerTooth < 0.05) return 'Excellent';
    if (feedPerTooth < 0.1) return 'Good';
    if (feedPerTooth < 0.2) return 'Fair';
    return 'Poor';
  }

  getRecommendedChipLoad(tool, material) {
    // Simplified recommendation based on tool diameter and material
    const baseChipLoad = {
      'Aluminum': 0.15,
      'Steel': 0.10,
      'Stainless': 0.08,
      'Titanium': 0.05
    };
    
    const materialBase = baseChipLoad[material.split(' ')[0]] || 0.1;
    return materialBase * (tool.diameter / 10); // Scale by tool diameter
  }

  evaluateChipLoad(actual, recommended) {
    const ratio = actual / recommended;
    if (ratio < 0.5) return 'Too Conservative';
    if (ratio < 0.8) return 'Conservative';
    if (ratio < 1.2) return 'Optimal';
    if (ratio < 1.5) return 'Aggressive';
    return 'Too Aggressive';
  }

  onActivate() {
    console.log('Simulation Workbench activated');
    eventBus.emit('workbench-activated', 'Simulation');
  }

  onDeactivate() {
    console.log('Simulation Workbench deactivated');
    eventBus.emit('workbench-deactivated', 'Simulation');
  }
}