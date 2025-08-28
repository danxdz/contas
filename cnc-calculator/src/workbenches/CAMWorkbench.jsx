import { Workbench, eventBus } from './WorkbenchSystem';

export class CAMWorkbench extends Workbench {
  constructor() {
    super('CAM', '🔧', 'Computer-Aided Manufacturing - G-code generation and editing');
    
    // Register CAM-specific tools
    this.tools = [
      { id: 'gcode-editor', name: 'G-Code Editor', icon: '📝' },
      { id: 'toolpath-generator', name: 'Toolpath Generator', icon: '🛤️' },
      { id: 'post-processor', name: 'Post Processor', icon: '⚙️' },
      { id: 'gcode-simulator', name: 'G-Code Simulator', icon: '▶️' }
    ];

    // Register CAM-specific panels
    this.panels = [
      { id: 'gcode', name: 'G-Code', component: 'GCodeEditor' },
      { id: 'toolpath', name: 'Toolpath', component: 'ToolpathViewer' },
      { id: 'operations', name: 'Operations', component: 'OperationsPanel' }
    ];

    // Register CAM commands
    this.registerCommand('parseGCode', (gcode) => {
      const lines = gcode.split('\n');
      const positions = [];
      let currentPos = { x: 0, y: 0, z: 0 };
      let feedRate = 0;
      let spindleSpeed = 0;
      let isRapid = false;

      lines.forEach(line => {
        const cleanLine = line.split(';')[0].trim().toUpperCase();
        if (!cleanLine) return;

        // Parse coordinates
        const xMatch = cleanLine.match(/X(-?\d+\.?\d*)/);
        const yMatch = cleanLine.match(/Y(-?\d+\.?\d*)/);
        const zMatch = cleanLine.match(/Z(-?\d+\.?\d*)/);

        if (xMatch) currentPos.x = parseFloat(xMatch[1]);
        if (yMatch) currentPos.y = parseFloat(yMatch[1]);
        if (zMatch) currentPos.z = parseFloat(zMatch[1]);

        // Parse feed rate
        const fMatch = cleanLine.match(/F(\d+\.?\d*)/);
        if (fMatch) feedRate = parseFloat(fMatch[1]);

        // Parse spindle speed
        const sMatch = cleanLine.match(/S(\d+\.?\d*)/);
        if (sMatch) spindleSpeed = parseFloat(sMatch[1]);

        // Check for rapid move
        if (/G0?0\b/.test(cleanLine)) isRapid = true;
        if (/G0?1\b/.test(cleanLine)) isRapid = false;

        positions.push({
          ...currentPos,
          feedRate,
          spindleSpeed,
          isRapid,
          line: cleanLine
        });
      });

      eventBus.emit('gcode-parsed', { positions, feedRate, spindleSpeed });
      return positions;
    });

    this.registerCommand('generateToolpath', (operation, stock, tool) => {
      // Generate toolpath based on operation type
      const toolpath = [];
      
      switch (operation.type) {
        case 'facing':
          // Generate facing toolpath
          const stepover = tool.diameter * 0.75;
          const passes = Math.ceil(stock.width / stepover);
          
          for (let i = 0; i < passes; i++) {
            const y = i * stepover;
            toolpath.push(`G0 X0 Y${y} Z5`);
            toolpath.push(`G1 Z-${operation.depth} F${operation.feedRate}`);
            toolpath.push(`G1 X${stock.length} F${operation.feedRate}`);
            toolpath.push(`G0 Z5`);
          }
          break;
          
        case 'pocket':
          // Generate pocket toolpath
          const pocketStepover = tool.diameter * 0.5;
          const spiralPasses = Math.ceil(Math.min(operation.width, operation.height) / 2 / pocketStepover);
          
          for (let i = 0; i < spiralPasses; i++) {
            const offset = i * pocketStepover;
            toolpath.push(`G0 X${operation.x + offset} Y${operation.y + offset} Z5`);
            toolpath.push(`G1 Z-${operation.depth} F${operation.plungeRate}`);
            toolpath.push(`G1 X${operation.x + operation.width - offset} F${operation.feedRate}`);
            toolpath.push(`G1 Y${operation.y + operation.height - offset}`);
            toolpath.push(`G1 X${operation.x + offset}`);
            toolpath.push(`G1 Y${operation.y + offset}`);
          }
          toolpath.push(`G0 Z5`);
          break;
          
        case 'drilling':
          // Generate drilling cycle
          operation.holes.forEach(hole => {
            toolpath.push(`G0 X${hole.x} Y${hole.y} Z5`);
            toolpath.push(`G81 Z-${hole.depth} R2 F${operation.feedRate}`);
          });
          toolpath.push(`G80`);
          break;
      }
      
      eventBus.emit('toolpath-generated', toolpath);
      return toolpath;
    });

    this.registerCommand('postProcess', (gcode, machine) => {
      // Post-process G-code for specific machine
      let processed = gcode;
      
      // Add machine-specific headers
      const header = [
        `%`,
        `O${machine.programNumber || '0001'}`,
        `(${machine.name || 'CNC Program'})`,
        `(Date: ${new Date().toLocaleDateString()})`,
        `(Machine: ${machine.type || 'Generic'})`,
        ``
      ].join('\n');
      
      // Add safety block
      const safety = [
        `G17 G20 G40 G49 G80 G90`,
        `G91 G28 Z0`,
        `G28 X0 Y0`,
        ``
      ].join('\n');
      
      // Add footer
      const footer = [
        ``,
        `M5`,
        `G91 G28 Z0`,
        `G28 X0 Y0`,
        `M30`,
        `%`
      ].join('\n');
      
      processed = header + safety + processed + footer;
      
      eventBus.emit('gcode-postprocessed', processed);
      return processed;
    });
  }

  onActivate() {
    console.log('CAM Workbench activated');
    eventBus.emit('workbench-activated', 'CAM');
  }

  onDeactivate() {
    console.log('CAM Workbench deactivated');
    eventBus.emit('workbench-deactivated', 'CAM');
  }
}