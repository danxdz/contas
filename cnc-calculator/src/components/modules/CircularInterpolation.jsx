import React, { useState } from 'react';

function CircularInterpolation() {
  const [mode, setMode] = useState('circular');
  const [direction, setDirection] = useState('CW');
  
  // Circle parameters
  const [centerX, setCenterX] = useState('0');
  const [centerY, setCenterY] = useState('0');
  const [radius, setRadius] = useState('25');
  const [startAngle, setStartAngle] = useState('0');
  const [endAngle, setEndAngle] = useState('360');
  
  // Helical parameters
  const [helixPitch, setHelixPitch] = useState('5');
  const [helixDepth, setHelixDepth] = useState('10');
  
  // Tool parameters
  const [toolDiameter, setToolDiameter] = useState('10');
  const [feedRate, setFeedRate] = useState('500');
  const [plungeRate, setPlungeRate] = useState('100');
  
  const [results, setResults] = useState(null);

  const calculate = () => {
    const r = parseFloat(radius);
    const toolD = parseFloat(toolDiameter);
    const feed = parseFloat(feedRate);
    const startA = parseFloat(startAngle) * Math.PI / 180;
    const endA = parseFloat(endAngle) * Math.PI / 180;
    const cX = parseFloat(centerX);
    const cY = parseFloat(centerY);
    
    // Calculate arc length
    const arcAngle = Math.abs(endA - startA);
    const arcLength = r * arcAngle;
    
    // Calculate start and end points
    const startX = cX + r * Math.cos(startA);
    const startY = cY + r * Math.sin(startA);
    const endX = cX + r * Math.cos(endA);
    const endY = cY + r * Math.sin(endA);
    
    // Calculate I and J offsets (from start point to center)
    const iOffset = cX - startX;
    const jOffset = cY - startY;
    
    // For helical, calculate total Z movement
    let zMovement = 0;
    let numberOfTurns = 1;
    if (mode === 'helical') {
      const depth = parseFloat(helixDepth);
      const pitch = parseFloat(helixPitch);
      numberOfTurns = Math.ceil(depth / pitch);
      zMovement = depth;
    }
    
    // Calculate cutting time
    const totalLength = mode === 'helical' 
      ? Math.sqrt(arcLength * arcLength * numberOfTurns * numberOfTurns + zMovement * zMovement)
      : arcLength;
    const cuttingTime = (totalLength / feed) * 60; // seconds
    
    // Generate G-code
    const gcode = generateGCode();
    
    setResults({
      startX: startX.toFixed(3),
      startY: startY.toFixed(3),
      endX: endX.toFixed(3),
      endY: endY.toFixed(3),
      iOffset: iOffset.toFixed(3),
      jOffset: jOffset.toFixed(3),
      arcLength: arcLength.toFixed(3),
      arcAngle: (arcAngle * 180 / Math.PI).toFixed(1),
      cuttingTime: cuttingTime.toFixed(1),
      numberOfTurns,
      zMovement: zMovement.toFixed(3),
      gcode
    });
  };

  const generateGCode = () => {
    const r = parseFloat(radius);
    const toolD = parseFloat(toolDiameter);
    const feed = parseFloat(feedRate);
    const plunge = parseFloat(plungeRate);
    const startA = parseFloat(startAngle) * Math.PI / 180;
    const endA = parseFloat(endAngle) * Math.PI / 180;
    const cX = parseFloat(centerX);
    const cY = parseFloat(centerY);
    
    const startX = cX + r * Math.cos(startA);
    const startY = cY + r * Math.sin(startA);
    const endX = cX + r * Math.cos(endA);
    const endY = cY + r * Math.sin(endA);
    const iOffset = cX - startX;
    const jOffset = cY - startY;
    
    let gcode = [];
    gcode.push('(CIRCULAR INTERPOLATION)');
    gcode.push(`(Tool Diameter: ${toolD}mm)`);
    gcode.push(`(Radius: ${r}mm)`);
    gcode.push('');
    gcode.push('G90 G94 ; Absolute, mm/min');
    gcode.push(`G00 X${startX.toFixed(3)} Y${startY.toFixed(3)} ; Move to start`);
    gcode.push('G00 Z5 ; Safe height');
    gcode.push(`G01 Z0 F${plunge} ; Plunge`);
    
    if (mode === 'circular') {
      const gCommand = direction === 'CW' ? 'G02' : 'G03';
      if (Math.abs(endA - startA) >= 2 * Math.PI - 0.01) {
        // Full circle
        gcode.push(`${gCommand} I${iOffset.toFixed(3)} J${jOffset.toFixed(3)} F${feed} ; Full circle`);
      } else {
        // Arc
        gcode.push(`${gCommand} X${endX.toFixed(3)} Y${endY.toFixed(3)} I${iOffset.toFixed(3)} J${jOffset.toFixed(3)} F${feed}`);
      }
    } else {
      // Helical interpolation
      const depth = parseFloat(helixDepth);
      const pitch = parseFloat(helixPitch);
      const turns = Math.ceil(depth / pitch);
      const gCommand = direction === 'CW' ? 'G02' : 'G03';
      
      for (let i = 1; i <= turns; i++) {
        const zDepth = Math.min(i * pitch, depth);
        gcode.push(`${gCommand} Z-${zDepth.toFixed(3)} I${iOffset.toFixed(3)} J${jOffset.toFixed(3)} F${feed}`);
      }
    }
    
    gcode.push('G00 Z25 ; Retract');
    gcode.push('M30 ; End');
    
    return gcode.join('\n');
  };

  return (
    <div className="calculator-section">
      <h2>Circular/Helical Interpolation Calculator</h2>
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="radio"
            name="mode"
            checked={mode === 'circular'}
            onChange={() => setMode('circular')}
          />
          Circular (2D)
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="mode"
            checked={mode === 'helical'}
            onChange={() => setMode('helical')}
          />
          Helical (3D)
        </label>
      </div>
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="radio"
            name="direction"
            checked={direction === 'CW'}
            onChange={() => setDirection('CW')}
          />
          G02 - Clockwise
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="direction"
            checked={direction === 'CCW'}
            onChange={() => setDirection('CCW')}
          />
          G03 - Counter-Clockwise
        </label>
      </div>
      
      <h3>Circle Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Center X</label>
          <input
            type="number"
            value={centerX}
            onChange={(e) => setCenterX(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Center Y</label>
          <input
            type="number"
            value={centerY}
            onChange={(e) => setCenterY(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Radius (mm)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            step="0.1"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Angle (degrees)</label>
          <input
            type="number"
            value={startAngle}
            onChange={(e) => setStartAngle(e.target.value)}
            step="1"
          />
        </div>
        
        <div className="form-group">
          <label>End Angle (degrees)</label>
          <input
            type="number"
            value={endAngle}
            onChange={(e) => setEndAngle(e.target.value)}
            step="1"
          />
        </div>
      </div>
      
      {mode === 'helical' && (
        <>
          <h3>Helix Parameters</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Helix Pitch (mm/rev)</label>
              <input
                type="number"
                value={helixPitch}
                onChange={(e) => setHelixPitch(e.target.value)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Total Depth (mm)</label>
              <input
                type="number"
                value={helixDepth}
                onChange={(e) => setHelixDepth(e.target.value)}
                step="0.1"
              />
            </div>
          </div>
        </>
      )}
      
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
          <label>Feed Rate (mm/min)</label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            step="10"
          />
        </div>
      </div>
      
      <button className="btn" onClick={calculate}>
        Calculate & Generate G-Code
      </button>
      
      {results && (
        <>
          <div className="result-box">
            <h3>Calculated Points</h3>
            
            <div className="result-item">
              <span className="result-label">Start Point:</span>
              <span className="result-value">X{results.startX} Y{results.startY}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">End Point:</span>
              <span className="result-value">X{results.endX} Y{results.endY}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">I Offset:</span>
              <span className="result-value">{results.iOffset}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">J Offset:</span>
              <span className="result-value">{results.jOffset}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Arc Length:</span>
              <span className="result-value">{results.arcLength} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Arc Angle:</span>
              <span className="result-value">{results.arcAngle}°</span>
            </div>
            
            {mode === 'helical' && (
              <>
                <div className="result-item">
                  <span className="result-label">Number of Turns:</span>
                  <span className="result-value">{results.numberOfTurns}</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Total Z Movement:</span>
                  <span className="result-value">{results.zMovement} mm</span>
                </div>
              </>
            )}
            
            <div className="result-item">
              <span className="result-label">Cutting Time:</span>
              <span className="result-value">{results.cuttingTime} seconds</span>
            </div>
          </div>
          
          <div className="result-box">
            <h3>G-Code</h3>
            <pre style={{ fontSize: '0.85rem' }}>
              {results.gcode}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default CircularInterpolation;