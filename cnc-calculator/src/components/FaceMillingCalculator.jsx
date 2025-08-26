import React, { useState } from 'react';

function FaceMillingCalculator() {
  const [millingType, setMillingType] = useState('face');
  const [cutterDiameter, setCutterDiameter] = useState('');
  const [workpieceLength, setWorkpieceLength] = useState('');
  const [workpieceWidth, setWorkpieceWidth] = useState('');
  const [depthOfCut, setDepthOfCut] = useState('');
  const [numberOfPasses, setNumberOfPasses] = useState('');
  const [overlap, setOverlap] = useState('10'); // percentage
  const [results, setResults] = useState(null);

  const calculate = () => {
    const diameter = parseFloat(cutterDiameter);
    const length = parseFloat(workpieceLength);
    const width = parseFloat(workpieceWidth);
    const depth = parseFloat(depthOfCut);
    const overlapPercent = parseFloat(overlap) / 100;
    
    if (!diameter || !length || !width) return;
    
    // Calculate effective cutting width (considering overlap)
    const effectiveWidth = diameter * (1 - overlapPercent);
    
    // Number of passes needed to cover the width
    const passesWidth = Math.ceil(width / effectiveWidth);
    
    // Total path length
    const pathLength = length * passesWidth;
    
    // Time calculations (assuming feed rate)
    const feedRate = 500; // mm/min (typical value)
    const cuttingTime = pathLength / feedRate;
    
    // Material removal rate (if depth is provided)
    let materialRemoval = 0;
    if (depth) {
      materialRemoval = length * width * depth;
    }
    
    setResults({
      effectiveWidth: effectiveWidth.toFixed(2),
      passesWidth,
      pathLength: pathLength.toFixed(2),
      cuttingTime: cuttingTime.toFixed(2),
      materialRemoval: materialRemoval.toFixed(2),
      stepOver: effectiveWidth.toFixed(2)
    });
  };

  const generateGCode = () => {
    if (!results) return;
    
    const diameter = parseFloat(cutterDiameter);
    const length = parseFloat(workpieceLength);
    const width = parseFloat(workpieceWidth);
    const depth = parseFloat(depthOfCut) || 1;
    const stepOver = parseFloat(results.stepOver);
    
    let gcode = [];
    gcode.push('%; Face Milling Program');
    gcode.push(`%; Cutter Diameter: ${diameter}mm`);
    gcode.push(`%; Workpiece: ${length}mm x ${width}mm`);
    gcode.push('G21 ; Metric units');
    gcode.push('G90 ; Absolute positioning');
    gcode.push('G94 ; Feed rate mm/min');
    gcode.push('');
    gcode.push('G00 Z5 ; Safe height');
    gcode.push('G00 X0 Y0 ; Start position');
    gcode.push('M03 S1000 ; Spindle on');
    gcode.push(`G00 Z${depth + 2} ; Approach height`);
    gcode.push('');
    
    let yPos = 0;
    for (let pass = 0; pass < results.passesWidth; pass++) {
      gcode.push(`; Pass ${pass + 1}`);
      gcode.push(`G00 Y${yPos.toFixed(2)}`);
      gcode.push(`G01 Z-${depth} F100 ; Plunge`);
      gcode.push(`G01 X${length} F500 ; Cut`);
      gcode.push('G00 Z5 ; Retract');
      gcode.push('G00 X0 ; Return');
      yPos += stepOver;
    }
    
    gcode.push('');
    gcode.push('G00 Z25 ; Safe height');
    gcode.push('M05 ; Spindle off');
    gcode.push('M30 ; Program end');
    
    return gcode.join('\n');
  };

  const downloadGCode = () => {
    const gcode = generateGCode();
    if (!gcode) return;
    
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'face_milling.nc';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCutterDiameter('');
    setWorkpieceLength('');
    setWorkpieceWidth('');
    setDepthOfCut('');
    setNumberOfPasses('');
    setOverlap('10');
    setResults(null);
  };

  return (
    <div className="calculator-section">
      <h2>Face Milling Calculator</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cutterDiameter">Cutter Diameter (mm)</label>
          <input
            type="number"
            id="cutterDiameter"
            value={cutterDiameter}
            onChange={(e) => setCutterDiameter(e.target.value)}
            step="0.1"
            placeholder="Enter cutter diameter"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="overlap">Overlap (%)</label>
          <input
            type="number"
            id="overlap"
            value={overlap}
            onChange={(e) => setOverlap(e.target.value)}
            step="5"
            min="0"
            max="50"
            placeholder="Overlap percentage"
          />
          <p className="info-text">Typical: 10-30% for finishing, 30-50% for roughing</p>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="workpieceLength">Workpiece Length - X (mm)</label>
          <input
            type="number"
            id="workpieceLength"
            value={workpieceLength}
            onChange={(e) => setWorkpieceLength(e.target.value)}
            step="0.1"
            placeholder="Length in X direction"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="workpieceWidth">Workpiece Width - Y (mm)</label>
          <input
            type="number"
            id="workpieceWidth"
            value={workpieceWidth}
            onChange={(e) => setWorkpieceWidth(e.target.value)}
            step="0.1"
            placeholder="Width in Y direction"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="depthOfCut">Depth of Cut - Z (mm)</label>
          <input
            type="number"
            id="depthOfCut"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            step="0.1"
            placeholder="Cutting depth"
          />
        </div>
      </div>
      
      <div>
        <button className="btn" onClick={calculate}>
          Calculate
        </button>
        <button className="btn btn-secondary" onClick={clearAll}>
          Clear
        </button>
        {results && (
          <button className="btn" onClick={downloadGCode}>
            Download G-Code
          </button>
        )}
      </div>
      
      {results && (
        <div className="result-box">
          <h3>Milling Results</h3>
          
          <div className="result-item">
            <span className="result-label">Step Over (Effective Width):</span>
            <span className="result-value">{results.stepOver} mm</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Number of Passes:</span>
            <span className="result-value">{results.passesWidth}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Total Path Length:</span>
            <span className="result-value">{results.pathLength} mm</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Estimated Cutting Time:</span>
            <span className="result-value">{results.cuttingTime} min</span>
          </div>
          
          {depthOfCut && (
            <div className="result-item">
              <span className="result-label">Material Removal Volume:</span>
              <span className="result-value">{results.materialRemoval} mm³</span>
            </div>
          )}
          
          <p className="info-text">Time estimate based on 500 mm/min feed rate</p>
        </div>
      )}
      
      {results && (
        <div className="result-box" style={{ marginTop: '20px' }}>
          <h3>G-Code Preview</h3>
          <pre style={{
            background: '#f7fafc',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {generateGCode()}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FaceMillingCalculator;