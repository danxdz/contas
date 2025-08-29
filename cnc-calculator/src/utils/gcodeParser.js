// G-code parsing utilities

export const parseToolsFromGCode = (gcode) => {
  const tools = new Map();
  const lines = gcode.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim().toUpperCase();
    
    // Look for T commands (tool changes)
    const tMatch = trimmed.match(/T(\d+)/);
    if (tMatch) {
      const toolNumber = parseInt(tMatch[1]);
      if (!tools.has(toolNumber)) {
        tools.set(toolNumber, {
          number: toolNumber,
          hCode: null,
          dCode: null,
          usageLines: []
        });
      }
      tools.get(toolNumber).usageLines.push(line);
    }
    
    // Look for H codes (tool length compensation)
    const hMatch = trimmed.match(/H(\d+)/);
    if (hMatch) {
      const hCode = parseInt(hMatch[1]);
      // Associate with the current or most recent tool
      const currentTool = Array.from(tools.values()).pop();
      if (currentTool) {
        currentTool.hCode = hCode;
      }
    }
    
    // Look for D codes (cutter diameter compensation)
    const dMatch = trimmed.match(/D(\d+)/);
    if (dMatch && !trimmed.includes('G0')) { // Avoid G0D moves
      const dCode = parseInt(dMatch[1]);
      const currentTool = Array.from(tools.values()).pop();
      if (currentTool) {
        currentTool.dCode = dCode;
      }
    }
  });
  
  return Array.from(tools.values());
};

export const parseGCodePositions = (gcode) => {
  const lines = gcode.split('\n');
  const positions = [];
  // Machine home position (G28 returns here)
  const machineHome = { x: 0, y: 0, z: 200 };  // Z200 is typical machine home
  // Start at machine home position
  let current = { 
    x: machineHome.x, 
    y: machineHome.y, 
    z: machineHome.z, 
    f: 500, 
    s: 0, 
    g43: false, 
    g41: false, 
    g42: false, 
    h: 0, 
    d: 0,
    workOffset: 'G54'  // Default work offset
  };
  let isRelative = false;  // G91 mode
  
  lines.forEach(line => {
    const trimmed = line.trim();
    // Check for empty lines or comments (both ; and parentheses style)
    if (trimmed === '' || trimmed.startsWith(';') || trimmed.startsWith('(')) {
      positions.push({ ...current, comment: true, line: trimmed });
      return;
    }
    
    // Check for G28 (Return to home)
    if (/G28/i.test(line)) {
      // G28 can be used with intermediate point or direct
      // G28 Z0 means go to Z0 first, then home Z
      // G28 G91 Z0 means move Z by 0 (no move) then home Z
      const hasG91 = /G91/i.test(line);
      const x = line.match(/X([-\d.]+)/i);
      const y = line.match(/Y([-\d.]+)/i);
      const z = line.match(/Z([-\d.]+)/i);
      
      // If G91 is in the line, intermediate moves are relative
      if (hasG91) {
        // Move to intermediate point (relative)
        if (x) current.x += parseFloat(x[1]);
        if (y) current.y += parseFloat(y[1]);
        if (z) current.z += parseFloat(z[1]);
        positions.push({ ...current, rapid: true, comment: false, line: trimmed + ' (intermediate)' });
      } else if (x || y || z) {
        // Move to intermediate point (absolute)
        if (x) current.x = parseFloat(x[1]);
        if (y) current.y = parseFloat(y[1]);
        if (z) current.z = parseFloat(z[1]);
        positions.push({ ...current, rapid: true, comment: false, line: trimmed + ' (intermediate)' });
      }
      
      // Then move to home for specified axes
      if (z || (!x && !y && !z)) current.z = machineHome.z;  // Home Z if specified or no axes
      if (x || (!x && !y && !z && line.match(/X/i))) current.x = machineHome.x;
      if (y || (!x && !y && !z && line.match(/Y/i))) current.y = machineHome.y;
      
      positions.push({ ...current, rapid: true, comment: false, line: trimmed + ' (home)' });
      return;
    }
    
    // Check for G90/G91 (absolute/relative mode)
    if (/G90/i.test(line)) isRelative = false;
    if (/G91/i.test(line)) isRelative = true;
    
    const x = line.match(/X([-\d.]+)/i);
    const y = line.match(/Y([-\d.]+)/i);
    const z = line.match(/Z([-\d.]+)/i);
    const f = line.match(/F([\d.]+)/i);
    const s = line.match(/S([\d]+)/i);
    const h = line.match(/H([\d]+)/i);
    const d = line.match(/D([\d]+)/i);
    
    // Check for work offset codes (G54-G59)
    if (/G54/i.test(line)) current.workOffset = 'G54';
    if (/G55/i.test(line)) current.workOffset = 'G55';
    if (/G56/i.test(line)) current.workOffset = 'G56';
    if (/G57/i.test(line)) current.workOffset = 'G57';
    if (/G58/i.test(line)) current.workOffset = 'G58';
    if (/G59/i.test(line)) current.workOffset = 'G59';
    
    // Check for tool compensation codes
    if (/G43/i.test(line)) current.g43 = true;  // Tool length comp on
    if (/G49/i.test(line)) current.g43 = false; // Tool length comp off
    if (/G41/i.test(line)) { current.g41 = true; current.g42 = false; } // Cutter comp left
    if (/G42/i.test(line)) { current.g42 = true; current.g41 = false; } // Cutter comp right
    if (/G40/i.test(line)) { current.g41 = false; current.g42 = false; } // Cutter comp off
    
    // Handle relative vs absolute positioning
    if (isRelative) {
      if (x) current.x += parseFloat(x[1]);
      if (y) current.y += parseFloat(y[1]);
      if (z) current.z += parseFloat(z[1]);
    } else {
      if (x) current.x = parseFloat(x[1]);
      if (y) current.y = parseFloat(y[1]);
      if (z) current.z = parseFloat(z[1]);
    }
    
    if (f) current.f = parseFloat(f[1]);
    if (s) current.s = parseInt(s[1]);
    if (h) current.h = parseInt(h[1]);
    if (d) current.d = parseInt(d[1]);
    
    // Check for rapid move (G0 or G00)
    const isRapid = /G0+\b/i.test(line);
    
    positions.push({ ...current, rapid: isRapid, comment: false, line: trimmed });
  });
  
  return positions;
};