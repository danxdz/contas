import { Workbench, eventBus } from './WorkbenchSystem';

export class ToolWorkbench extends Workbench {
  constructor() {
    super('Tools', '🔨', 'Tool Management - Tool library, holders, and assemblies');
    
    // Register Tool-specific tools
    this.tools = [
      { id: 'tool-library', name: 'Tool Library', icon: '📚' },
      { id: 'tool-builder', name: 'Tool Builder', icon: '🔧' },
      { id: 'holder-manager', name: 'Holder Manager', icon: '🔩' },
      { id: 'tool-offsets', name: 'Tool Offsets', icon: '📏' }
    ];

    // Register Tool-specific panels
    this.panels = [
      { id: 'tools', name: 'Tool Manager', component: 'ToolManager' },
      { id: 'tool-builder', name: 'Tool Builder', component: 'ProfessionalToolSystem' },
      { id: 'tool-offsets', name: 'Tool Offset Table', component: 'ToolOffsetTable' }
    ];

    // Tool database with real manufacturer data
    this.toolDatabase = {
      endmills: [
        {
          manufacturer: 'Seco',
          partNumber: '553050307',
          type: 'Square End Mill',
          diameter: 6,
          flutes: 4,
          length: 50,
          coating: 'TiAlN',
          material: 'Carbide'
        },
        {
          manufacturer: 'Sandvik',
          partNumber: '2P341-0600-PA',
          type: 'Ball End Mill',
          diameter: 6,
          flutes: 2,
          length: 45,
          coating: 'PVD',
          material: 'Carbide'
        }
      ],
      drills: [
        {
          manufacturer: 'Kennametal',
          partNumber: 'KC7315',
          type: 'Twist Drill',
          diameter: 8.5,
          flutes: 2,
          length: 90,
          coating: 'TiN',
          material: 'Carbide'
        }
      ],
      holders: {
        ISO30: { taperAngle: 16.26, gaugeLength: 48.5, flangeDiameter: 50 },
        ISO40: { taperAngle: 16.26, gaugeLength: 65.5, flangeDiameter: 63 },
        ISO50: { taperAngle: 16.26, gaugeLength: 101.5, flangeDiameter: 100 },
        BT30: { taperAngle: 16.26, gaugeLength: 48.5, flangeDiameter: 62.7 },
        BT40: { taperAngle: 16.26, gaugeLength: 65.5, flangeDiameter: 76.2 },
        CAT40: { taperAngle: 16.26, gaugeLength: 65.5, flangeDiameter: 76.2 },
        CAT50: { taperAngle: 16.26, gaugeLength: 101.5, flangeDiameter: 101.6 },
        'HSK-A63': { taperAngle: 0, gaugeLength: 60, flangeDiameter: 63 }
      }
    };

    // Register Tool commands
    this.registerCommand('createToolAssembly', (tool, holder, collet) => {
      const assembly = {
        id: Date.now(),
        tool: tool,
        holder: holder,
        collet: collet,
        totalLength: this.calculateTotalLength(tool, holder, collet),
        timestamp: new Date().toISOString()
      };
      
      eventBus.emit('tool-assembly-created', assembly);
      return assembly;
    });

    this.registerCommand('importToolFromURL', async (url) => {
      // Parse manufacturer URLs
      let tool = null;
      
      if (url.includes('secotools.com')) {
        // Parse Seco tool URL
        const partMatch = url.match(/\/([A-Z0-9-]+)/);
        if (partMatch) {
          tool = this.toolDatabase.endmills.find(t => 
            t.manufacturer === 'Seco' && t.partNumber.includes(partMatch[1])
          );
        }
      } else if (url.includes('sandvik.coromant')) {
        // Parse Sandvik tool URL
        const partMatch = url.match(/product\/([A-Z0-9-]+)/);
        if (partMatch) {
          tool = this.toolDatabase.endmills.find(t => 
            t.manufacturer === 'Sandvik' && t.partNumber.includes(partMatch[1])
          );
        }
      }
      
      if (tool) {
        eventBus.emit('tool-imported', tool);
        return tool;
      }
      
      throw new Error('Tool not found or URL not recognized');
    });

    this.registerCommand('calculateToolOffsets', (assembly, referencePoint) => {
      const offsets = {
        lengthOffset: assembly.totalLength - referencePoint.z,
        diameterOffset: assembly.tool.diameter,
        H: Math.abs(assembly.totalLength - referencePoint.z),
        D: assembly.tool.diameter / 2
      };
      
      eventBus.emit('tool-offsets-calculated', offsets);
      return offsets;
    });

    this.registerCommand('generateToolPath3D', (assembly) => {
      // Generate 3D representation of tool assembly
      const geometry = {
        holder: this.generateHolderGeometry(assembly.holder),
        collet: this.generateColletGeometry(assembly.collet),
        tool: this.generateToolGeometry(assembly.tool)
      };
      
      eventBus.emit('tool-3d-generated', geometry);
      return geometry;
    });
  }

  calculateTotalLength(tool, holder, collet) {
    const holderData = this.toolDatabase.holders[holder];
    const colletLength = collet ? 30 : 0; // Standard collet length
    const toolStickout = tool.length * 0.7; // 70% stickout
    
    return holderData.gaugeLength + colletLength + toolStickout;
  }

  generateHolderGeometry(holderType) {
    const holder = this.toolDatabase.holders[holderType];
    return {
      type: 'cone',
      radiusTop: holder.flangeDiameter / 2,
      radiusBottom: 20,
      height: holder.gaugeLength,
      color: 0x4a4a4a
    };
  }

  generateColletGeometry(colletType) {
    return {
      type: 'cylinder',
      radius: 15,
      height: 30,
      color: 0x8a8a8a
    };
  }

  generateToolGeometry(tool) {
    return {
      type: tool.type.includes('Ball') ? 'sphere-cylinder' : 'cylinder',
      radius: tool.diameter / 2,
      height: tool.length,
      flutes: tool.flutes,
      coating: tool.coating,
      color: tool.coating === 'TiAlN' ? 0x9370db : 0xffd700
    };
  }

  onActivate() {
    console.log('Tool Workbench activated');
    eventBus.emit('workbench-activated', 'Tools');
  }

  onDeactivate() {
    console.log('Tool Workbench deactivated');
    eventBus.emit('workbench-deactivated', 'Tools');
  }
}