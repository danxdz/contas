import React, { useState } from 'react';

function PocketMillingWizard() {
  // Pocket dimensions
  const [pocketLength, setPocketLength] = useState('50');
  const [pocketWidth, setPocketWidth] = useState('30');
  const [pocketDepth, setPocketDepth] = useState('10');
  const [cornerRadius, setCornerRadius] = useState('5');
  const [pocketShape, setPocketShape] = useState('rectangle');
  
  // Tool parameters
  const [toolDiameter, setToolDiameter] = useState('10');
  const [toolFlutes, setToolFlutes] = useState('4');
  const [fluteLength, setFluteLength] = useState('30');
  
  // Cutting parameters
  const [spindleSpeed, setSpindleSpeed] = useState('5000');
  const [feedRate, setFeedRate] = useState('1000');
  const [depthPerPass, setDepthPerPass] = useState('2');
  const [stepover, setStepover] = useState('40');
  const [plungeRate, setPlungeRate] = useState('300');
  
  // Strategy options
  const [strategy, setStrategy] = useState('spiral');
  const [climbMilling, setClimbMilling] = useState(true);
  const [helicalEntry, setHelicalEntry] = useState(true);
  const [finishPass, setFinishPass] = useState(true);
  const [finishAllowance, setFinishAllowance] = useState('0.2');
  
  // Machine settings
  const [coolant, setCoolant] = useState('flood');
  const [safeHeight, setSafeHeight] = useState('10');
  const [rapidHeight, setRapidHeight] = useState('2');
  
  const [results, setResults] = useState(null);

  const calculate = () => {
    const length = parseFloat(pocketLength);
    const width = parseFloat(pocketWidth);
    const depth = parseFloat(pocketDepth);
    const radius = parseFloat(cornerRadius);
    const tool = parseFloat(toolDiameter);
    const doc = parseFloat(depthPerPass);
    const woc = parseFloat(stepover) / 100;
    const finish = parseFloat(finishAllowance);
    const feed = parseFloat(feedRate);
    const plunge = parseFloat(plungeRate);
    const rpm = parseFloat(spindleSpeed);
    
    // Validate inputs
    if (radius < tool / 2) {
      alert(`Corner radius must be at least ${(tool / 2).toFixed(1)}mm (tool radius)`);
      return;
    }
    
    // Calculate effective pocket dimensions (accounting for tool)
    const effectiveLength = length - tool - (finish * 2);
    const effectiveWidth = width - tool - (finish * 2);
    
    // Calculate number of depth passes
    const depthPasses = Math.ceil(depth / doc);
    const actualDepthPerPass = depth / depthPasses;
    
    // Calculate stepover distance
    const stepoverDist = tool * woc;
    
    // Calculate number of passes for width
    const widthPasses = Math.ceil(effectiveWidth / stepoverDist);
    const actualStepover = effectiveWidth / widthPasses;
    
    // Calculate toolpath length based on strategy
    let pathLength = 0;
    let entryTime = 0;
    
    if (strategy === 'spiral') {
      // Spiral from center outward
      const spirals = Math.min(widthPasses, Math.ceil(effectiveLength / stepoverDist / 2));
      pathLength = spirals * 2 * Math.PI * (effectiveLength + effectiveWidth) / 2;
      entryTime = helicalEntry ? (depth / plunge) * 60 : 0; // Helical entry time
      
    } else if (strategy === 'zigzag') {
      // Back and forth pattern
      const passes = Math.ceil(effectiveWidth / stepoverDist);
      pathLength = passes * effectiveLength + (passes - 1) * stepoverDist;
      entryTime = depth / plunge * 60; // Straight plunge
      
    } else if (strategy === 'contour') {
      // Contour parallel to walls
      const contours = widthPasses;
      pathLength = contours * 2 * (effectiveLength + effectiveWidth - 2 * stepoverDist * contours);
      entryTime = helicalEntry ? (depth / plunge) * 60 : 0;
    }
    
    // Add depth passes
    pathLength *= depthPasses;
    
    // Add finish pass if enabled
    if (finishPass) {
      pathLength += 2 * (length + width);
    }
    
    // Calculate cutting time
    const cuttingTime = (pathLength / feed) + (entryTime * depthPasses / 60);
    
    // Calculate material removal rate
    const mrr = actualStepover * actualDepthPerPass * feed / 1000; // cm³/min
    
    // Calculate required power (simplified)
    const kc = 2500; // Specific cutting force for steel (N/mm²)
    const power = (mrr * kc) / 60000; // kW
    
    // Generate G-code
    const gcode = generatePocketGCode({
      length, width, depth, radius, tool,
      rpm, feed, plunge, 
      depthPasses, actualDepthPerPass,
      widthPasses, actualStepover,
      strategy, climbMilling, helicalEntry,
      finishPass, finish,
      coolant, safeHeight: parseFloat(safeHeight), rapidHeight: parseFloat(rapidHeight)
    });
    
    setResults({
      depthPasses,
      actualDepthPerPass: actualDepthPerPass.toFixed(3),
      widthPasses,
      actualStepover: actualStepover.toFixed(3),
      stepoverPercent: ((actualStepover / tool) * 100).toFixed(1),
      pathLength: pathLength.toFixed(0),
      cuttingTime: cuttingTime.toFixed(2),
      mrr: mrr.toFixed(2),
      power: power.toFixed(2),
      gcode
    });
  };
  
  const generatePocketGCode = (params) => {
    const lines = [];
    
    // Header
    lines.push('(POCKET MILLING WIZARD)');
    lines.push(`(Pocket: ${params.length} x ${params.width} x ${params.depth}mm)`);
    lines.push(`(Tool: Ø${params.tool}mm)`);
    lines.push(`(Strategy: ${strategy.toUpperCase()})`);
    lines.push(`(Generated: ${new Date().toLocaleString()})`);
    lines.push('');
    
    // Safety block
    lines.push('G90 G94 G17 ; Absolute, mm/min, XY plane');
    lines.push('G21 ; Metric');
    lines.push('G40 G49 G80 ; Cancel comp, length, cycles');
    lines.push('');
    
    // Tool change
    lines.push('T1 M6 ; Tool change');
    lines.push(`S${params.rpm} M3 ; Spindle CW`);
    lines.push(`G43 H1 Z${params.safeHeight} ; Tool length comp`);
    
    // Coolant
    if (params.coolant === 'flood') lines.push('M8 ; Flood coolant');
    else if (params.coolant === 'mist') lines.push('M7 ; Mist coolant');
    
    // Move to start position
    lines.push(`G00 X${(params.length / 2).toFixed(3)} Y${(params.width / 2).toFixed(3)}`);
    lines.push(`G00 Z${params.rapidHeight}`);
    
    // Generate pocket passes
    let currentDepth = 0;
    
    for (let pass = 1; pass <= params.depthPasses; pass++) {
      currentDepth = Math.min(currentDepth + params.actualDepthPerPass, params.depth);
      
      lines.push('');
      lines.push(`(Pass ${pass}/${params.depthPasses} - Depth: ${currentDepth.toFixed(3)}mm)`);
      
      if (params.helicalEntry && params.strategy !== 'zigzag') {
        // Helical entry
        lines.push(`G02 X${(params.length / 2 + 5).toFixed(3)} Y${(params.width / 2).toFixed(3)} Z${-currentDepth.toFixed(3)} I5 J0 F${params.plunge}`);
      } else {
        // Straight plunge
        lines.push(`G01 Z${-currentDepth.toFixed(3)} F${params.plunge}`);
      }
      
      // Generate toolpath based on strategy
      if (params.strategy === 'spiral') {
        generateSpiralPath(lines, params, currentDepth);
      } else if (params.strategy === 'zigzag') {
        generateZigzagPath(lines, params, currentDepth);
      } else if (params.strategy === 'contour') {
        generateContourPath(lines, params, currentDepth);
      }
      
      // Retract
      lines.push(`G00 Z${params.rapidHeight}`);
    }
    
    // Finish pass
    if (params.finishPass) {
      lines.push('');
      lines.push('(FINISH PASS)');
      lines.push(`G00 X${(params.tool / 2 + params.finish).toFixed(3)} Y${(params.tool / 2 + params.finish).toFixed(3)}`);
      lines.push(`G01 Z${-params.depth.toFixed(3)} F${params.plunge}`);
      lines.push(`G01 X${(params.length - params.tool / 2 - params.finish).toFixed(3)} F${params.feed * 0.7}`);
      lines.push(`G01 Y${(params.width - params.tool / 2 - params.finish).toFixed(3)}`);
      lines.push(`G01 X${(params.tool / 2 + params.finish).toFixed(3)}`);
      lines.push(`G01 Y${(params.tool / 2 + params.finish).toFixed(3)}`);
    }
    
    // Footer
    lines.push('');
    lines.push(`G00 Z${params.safeHeight} ; Retract`);
    lines.push('M9 ; Coolant off');
    lines.push('M5 ; Spindle stop');
    lines.push('G91 G28 Z0 ; Home Z');
    lines.push('G90');
    lines.push('M30 ; Program end');
    
    return lines.join('\n');
  };
  
  const generateSpiralPath = (lines, params, depth) => {
    lines.push('(SPIRAL PATTERN)');
    // Simplified spiral - would need more complex math for true spiral
    let x = params.length / 2;
    let y = params.width / 2;
    let step = params.actualStepover;
    
    for (let i = 0; i < params.widthPasses; i++) {
      const offset = i * step;
      lines.push(`G01 X${(x + offset).toFixed(3)} Y${y.toFixed(3)} F${params.feed}`);
      lines.push(`G01 X${(x + offset).toFixed(3)} Y${(y + offset).toFixed(3)}`);
      lines.push(`G01 X${(x - offset).toFixed(3)} Y${(y + offset).toFixed(3)}`);
      lines.push(`G01 X${(x - offset).toFixed(3)} Y${(y - offset).toFixed(3)}`);
      lines.push(`G01 X${(x + offset + step).toFixed(3)} Y${(y - offset).toFixed(3)}`);
    }
  };
  
  const generateZigzagPath = (lines, params, depth) => {
    lines.push('(ZIGZAG PATTERN)');
    let direction = 1;
    
    for (let i = 0; i < params.widthPasses; i++) {
      const y = params.tool / 2 + i * params.actualStepover;
      
      if (direction > 0) {
        lines.push(`G01 X${(params.length - params.tool / 2).toFixed(3)} Y${y.toFixed(3)} F${params.feed}`);
      } else {
        lines.push(`G01 X${(params.tool / 2).toFixed(3)} Y${y.toFixed(3)} F${params.feed}`);
      }
      
      if (i < params.widthPasses - 1) {
        lines.push(`G01 Y${(y + params.actualStepover).toFixed(3)}`);
      }
      
      direction *= -1;
    }
  };
  
  const generateContourPath = (lines, params, depth) => {
    lines.push('(CONTOUR PATTERN)');
    
    for (let i = 0; i < params.widthPasses; i++) {
      const offset = params.tool / 2 + i * params.actualStepover;
      
      lines.push(`G01 X${(params.length - offset).toFixed(3)} Y${offset.toFixed(3)} F${params.feed}`);
      lines.push(`G01 X${(params.length - offset).toFixed(3)} Y${(params.width - offset).toFixed(3)}`);
      lines.push(`G01 X${offset.toFixed(3)} Y${(params.width - offset).toFixed(3)}`);
      lines.push(`G01 X${offset.toFixed(3)} Y${offset.toFixed(3)}`);
      
      if (i < params.widthPasses - 1) {
        lines.push(`G01 X${(offset + params.actualStepover).toFixed(3)} Y${offset.toFixed(3)}`);
      }
    }
  };

  return (
    <div className="calculator-section">
      <h2>Pocket Milling Wizard</h2>
      
      <h3>Pocket Dimensions</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Shape</label>
          <select value={pocketShape} onChange={(e) => setPocketShape(e.target.value)}>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle (Coming Soon)</option>
            <option value="polygon">Polygon (Coming Soon)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Length X (mm)</label>
          <input
            type="number"
            value={pocketLength}
            onChange={(e) => setPocketLength(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Width Y (mm)</label>
          <input
            type="number"
            value={pocketWidth}
            onChange={(e) => setPocketWidth(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Depth Z (mm)</label>
          <input
            type="number"
            value={pocketDepth}
            onChange={(e) => setPocketDepth(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Corner Radius (mm)</label>
          <input
            type="number"
            value={cornerRadius}
            onChange={(e) => setCornerRadius(e.target.value)}
            step="0.1"
            min={parseFloat(toolDiameter) / 2 || 0}
          />
        </div>
      </div>
      
      <h3>Tool Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Tool Diameter (mm)</label>
          <input
            type="number"
            value={toolDiameter}
            onChange={(e) => setToolDiameter(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Number of Flutes</label>
          <input
            type="number"
            value={toolFlutes}
            onChange={(e) => setToolFlutes(e.target.value)}
            step="1"
            min="1"
            max="8"
          />
        </div>
        
        <div className="form-group">
          <label>Flute Length (mm)</label>
          <input
            type="number"
            value={fluteLength}
            onChange={(e) => setFluteLength(e.target.value)}
            step="1"
          />
        </div>
      </div>
      
      <h3>Cutting Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Spindle Speed (RPM)</label>
          <input
            type="number"
            value={spindleSpeed}
            onChange={(e) => setSpindleSpeed(e.target.value)}
            step="100"
          />
        </div>
        
        <div className="form-group">
          <label>Feed Rate (mm/min)</label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            step="50"
          />
        </div>
        
        <div className="form-group">
          <label>Depth per Pass (mm)</label>
          <input
            type="number"
            value={depthPerPass}
            onChange={(e) => setDepthPerPass(e.target.value)}
            step="0.1"
            max={fluteLength}
          />
        </div>
        
        <div className="form-group">
          <label>Stepover (%)</label>
          <input
            type="number"
            value={stepover}
            onChange={(e) => setStepover(e.target.value)}
            step="5"
            min="10"
            max="90"
          />
        </div>
        
        <div className="form-group">
          <label>Plunge Rate (mm/min)</label>
          <input
            type="number"
            value={plungeRate}
            onChange={(e) => setPlungeRate(e.target.value)}
            step="50"
          />
        </div>
      </div>
      
      <h3>Strategy Options</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Milling Strategy</label>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            <option value="spiral">Spiral (Inside-Out)</option>
            <option value="zigzag">Zigzag (Back & Forth)</option>
            <option value="contour">Contour (Follow Walls)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Milling Direction</label>
          <select value={climbMilling} onChange={(e) => setClimbMilling(e.target.value === 'true')}>
            <option value="true">Climb Milling</option>
            <option value="false">Conventional</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Entry Method</label>
          <select value={helicalEntry} onChange={(e) => setHelicalEntry(e.target.value === 'true')}>
            <option value="true">Helical Entry</option>
            <option value="false">Straight Plunge</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={finishPass}
              onChange={(e) => setFinishPass(e.target.checked)}
            />
            Enable Finish Pass
          </label>
        </div>
        
        {finishPass && (
          <div className="form-group">
            <label>Finish Allowance (mm)</label>
            <input
              type="number"
              value={finishAllowance}
              onChange={(e) => setFinishAllowance(e.target.value)}
              step="0.05"
              min="0.05"
              max="1"
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Coolant</label>
          <select value={coolant} onChange={(e) => setCoolant(e.target.value)}>
            <option value="flood">Flood</option>
            <option value="mist">Mist</option>
            <option value="air">Air Blast</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Safe Height (mm)</label>
          <input
            type="number"
            value={safeHeight}
            onChange={(e) => setSafeHeight(e.target.value)}
            step="1"
          />
        </div>
        
        <div className="form-group">
          <label>Rapid Height (mm)</label>
          <input
            type="number"
            value={rapidHeight}
            onChange={(e) => setRapidHeight(e.target.value)}
            step="1"
          />
        </div>
      </div>
      
      <button className="btn" onClick={calculate}>
        Generate Pocket Toolpath
      </button>
      
      {results && (
        <>
          <div className="result-box">
            <h3>Toolpath Analysis</h3>
            
            <div className="result-item">
              <span className="result-label">Depth Passes:</span>
              <span className="result-value">{results.depthPasses}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Actual Depth/Pass:</span>
              <span className="result-value">{results.actualDepthPerPass} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Width Passes:</span>
              <span className="result-value">{results.widthPasses}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Actual Stepover:</span>
              <span className="result-value">{results.actualStepover} mm ({results.stepoverPercent}%)</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Total Path Length:</span>
              <span className="result-value">{results.pathLength} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Cutting Time:</span>
              <span className="result-value">{results.cuttingTime} min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Material Removal Rate:</span>
              <span className="result-value">{results.mrr} cm³/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Required Power:</span>
              <span className="result-value">{results.power} kW</span>
            </div>
          </div>
          
          <div className="result-box">
            <h3>G-Code Preview</h3>
            <pre style={{ 
              fontSize: '0.8rem', 
              maxHeight: '400px', 
              overflowY: 'auto',
              backgroundColor: 'var(--input-bg)',
              padding: '10px',
              borderRadius: '4px'
            }}>
              {results.gcode.split('\n').slice(0, 100).join('\n')}
              {results.gcode.split('\n').length > 100 && '\n... (truncated)'}
            </pre>
            
            <button 
              className="btn"
              onClick={() => {
                const blob = new Blob([results.gcode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pocket_${pocketLength}x${pocketWidth}x${pocketDepth}.nc`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download G-Code
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PocketMillingWizard;