import { Workbench, eventBus } from './WorkbenchSystem';

export class SetupWorkbench extends Workbench {
  constructor() {
    super('Setup', '⚙️', 'Machine Setup - Stock, fixtures, work offsets, and machine configuration');
    
    // Register Setup-specific tools
    this.tools = [
      { id: 'stock-setup', name: 'Stock Setup', icon: '📦' },
      { id: 'fixture-setup', name: 'Fixture Setup', icon: '🔧' },
      { id: 'work-offsets', name: 'Work Offsets', icon: '📍' },
      { id: 'machine-config', name: 'Machine Config', icon: '🏭' }
    ];

    // Register Setup-specific panels
    this.panels = [
      { id: 'setup', name: 'Setup', component: 'SetupPanel' },
      { id: 'work-offsets', name: 'Work Offsets', component: 'WorkOffsetsPanel' },
      { id: 'machine', name: 'Machine', component: 'MachinePanel' }
    ];

    // Machine configurations database
    this.machineConfigs = {
      'Haas VF-2': {
        type: 'VMC',
        travels: { x: 762, y: 406, z: 508 },
        spindle: { maxRPM: 8100, power: 22.4 },
        rapids: { x: 25.4, y: 25.4, z: 25.4 },
        toolChanger: { capacity: 20, type: 'Side-mount' }
      },
      'DMG Mori NHX 4000': {
        type: 'HMC',
        travels: { x: 560, y: 560, z: 660 },
        spindle: { maxRPM: 14000, power: 18.5 },
        rapids: { x: 60, y: 60, z: 60 },
        toolChanger: { capacity: 40, type: 'Chain' }
      },
      'Okuma Genos M560-V': {
        type: 'VMC',
        travels: { x: 1050, y: 560, z: 460 },
        spindle: { maxRPM: 15000, power: 22 },
        rapids: { x: 40, y: 40, z: 32 },
        toolChanger: { capacity: 32, type: 'Drum' }
      }
    };

    // Material database
    this.materials = {
      'Aluminum 6061': {
        density: 2.7,
        hardness: 95,
        machinability: 'Excellent',
        speeds: { hss: 200, carbide: 800 },
        feeds: { roughing: 0.15, finishing: 0.05 }
      },
      'Steel 1018': {
        density: 7.87,
        hardness: 126,
        machinability: 'Good',
        speeds: { hss: 100, carbide: 400 },
        feeds: { roughing: 0.10, finishing: 0.03 }
      },
      'Stainless 316': {
        density: 8.0,
        hardness: 217,
        machinability: 'Fair',
        speeds: { hss: 60, carbide: 200 },
        feeds: { roughing: 0.08, finishing: 0.02 }
      },
      'Titanium Ti-6Al-4V': {
        density: 4.43,
        hardness: 334,
        machinability: 'Poor',
        speeds: { hss: 30, carbide: 100 },
        feeds: { roughing: 0.05, finishing: 0.015 }
      }
    };

    // Register Setup commands
    this.registerCommand('setupStock', (dimensions, material, origin) => {
      const stock = {
        width: dimensions.width,
        height: dimensions.height,
        depth: dimensions.depth,
        material: material,
        origin: origin, // 'top-left', 'center', 'bottom-left', etc.
        volume: dimensions.width * dimensions.height * dimensions.depth,
        weight: this.calculateWeight(dimensions, material)
      };
      
      eventBus.emit('stock-setup-complete', stock);
      return stock;
    });

    this.registerCommand('setupFixture', (type, params) => {
      const fixture = {
        type: type, // 'vise', 'clamps', 'fixture-plate', 'tombstone'
        params: params,
        timestamp: new Date().toISOString()
      };
      
      switch (type) {
        case 'vise':
          fixture.jawWidth = params.jawWidth || 150;
          fixture.jawHeight = params.jawHeight || 50;
          fixture.openingMax = params.openingMax || 200;
          break;
        case 'fixture-plate':
          fixture.holes = this.generateFixtureHoles(params);
          break;
        case 'tombstone':
          fixture.faces = 4;
          fixture.holesPerFace = params.holesPerFace || 20;
          break;
      }
      
      eventBus.emit('fixture-setup-complete', fixture);
      return fixture;
    });

    this.registerCommand('setWorkOffset', (offsetName, values) => {
      const workOffset = {
        name: offsetName, // G54-G59
        x: values.x || 0,
        y: values.y || 0,
        z: values.z || 0,
        a: values.a || 0,
        b: values.b || 0,
        c: values.c || 0
      };
      
      eventBus.emit('work-offset-set', workOffset);
      return workOffset;
    });

    this.registerCommand('configureMachine', (machineName, customParams = {}) => {
      const baseConfig = this.machineConfigs[machineName] || this.machineConfigs['Haas VF-2'];
      const machine = {
        ...baseConfig,
        ...customParams,
        name: machineName,
        timestamp: new Date().toISOString()
      };
      
      eventBus.emit('machine-configured', machine);
      return machine;
    });

    this.registerCommand('calculateSpeeds', (tool, material, operation) => {
      const materialData = this.materials[material];
      const toolMaterial = tool.material === 'Carbide' ? 'carbide' : 'hss';
      
      const sfm = materialData.speeds[toolMaterial];
      const rpm = Math.round((sfm * 12) / (Math.PI * tool.diameter));
      const feedPerTooth = operation === 'roughing' ? 
        materialData.feeds.roughing : materialData.feeds.finishing;
      const feedRate = Math.round(rpm * feedPerTooth * tool.flutes);
      
      const speeds = {
        rpm: Math.min(rpm, 10000), // Cap at machine max
        feedRate: feedRate,
        plungeRate: Math.round(feedRate * 0.3),
        sfm: sfm,
        chipLoad: feedPerTooth
      };
      
      eventBus.emit('speeds-calculated', speeds);
      return speeds;
    });

    this.registerCommand('probeWorkpiece', (probeType, params) => {
      // Simulate probing cycles
      const probeResult = {
        type: probeType, // 'corner', 'center', 'surface', 'bore', 'boss'
        measured: {},
        deviation: {},
        timestamp: new Date().toISOString()
      };
      
      switch (probeType) {
        case 'corner':
          probeResult.measured = {
            x: params.expectedX + (Math.random() - 0.5) * 0.01,
            y: params.expectedY + (Math.random() - 0.5) * 0.01,
            z: params.expectedZ + (Math.random() - 0.5) * 0.005
          };
          break;
        case 'bore':
          probeResult.measured = {
            diameter: params.nominalDiameter + (Math.random() - 0.5) * 0.02,
            centerX: params.centerX + (Math.random() - 0.5) * 0.01,
            centerY: params.centerY + (Math.random() - 0.5) * 0.01
          };
          break;
      }
      
      eventBus.emit('probe-complete', probeResult);
      return probeResult;
    });
  }

  calculateWeight(dimensions, materialName) {
    const material = this.materials[materialName];
    const volume = dimensions.width * dimensions.height * dimensions.depth;
    const volumeCm3 = volume / 1000; // Convert mm³ to cm³
    return (volumeCm3 * material.density).toFixed(2);
  }

  generateFixtureHoles(params) {
    const holes = [];
    const spacing = params.spacing || 50;
    const rows = Math.floor(params.plateWidth / spacing);
    const cols = Math.floor(params.plateLength / spacing);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        holes.push({
          x: (i + 0.5) * spacing,
          y: (j + 0.5) * spacing,
          diameter: params.holeDiameter || 10,
          thread: params.thread || 'M10'
        });
      }
    }
    
    return holes;
  }

  onActivate() {
    console.log('Setup Workbench activated');
    eventBus.emit('workbench-activated', 'Setup');
  }

  onDeactivate() {
    console.log('Setup Workbench deactivated');
    eventBus.emit('workbench-deactivated', 'Setup');
  }
}