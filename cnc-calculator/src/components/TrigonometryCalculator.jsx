import React, { useState, useEffect } from 'react';

function TrigonometryCalculator() {
  const [angle, setAngle] = useState('');
  const [angleInDegrees, setAngleInDegrees] = useState('');
  const [hypotenuse, setHypotenuse] = useState('');
  const [adjacent, setAdjacent] = useState('');
  const [opposite, setOpposite] = useState('');
  const [inputCount, setInputCount] = useState(0);

  useEffect(() => {
    // Count how many inputs have values
    let count = 0;
    if (angle) count++;
    if (angleInDegrees) count++;
    if (hypotenuse) count++;
    if (adjacent) count++;
    if (opposite) count++;
    setInputCount(count);
  }, [angle, angleInDegrees, hypotenuse, adjacent, opposite]);

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const toDegrees = (radians) => radians * (180 / Math.PI);

  const calculate = () => {
    // Convert angle to radians if provided in degrees
    let angleRad = angle ? parseFloat(angle) : null;
    if (angleInDegrees && !angleRad) {
      angleRad = toRadians(parseFloat(angleInDegrees));
    }

    const h = hypotenuse ? parseFloat(hypotenuse) : null;
    const ca = adjacent ? parseFloat(adjacent) : null;
    const co = opposite ? parseFloat(opposite) : null;

    // Calculate based on what values we have
    if (angleRad !== null && h !== null && !ca && !co) {
      // Have angle and hypotenuse, calculate adjacent and opposite
      const newAdjacent = h * Math.cos(angleRad);
      const newOpposite = h * Math.sin(angleRad);
      setAdjacent(newAdjacent.toFixed(3));
      setOpposite(newOpposite.toFixed(3));
    } 
    else if (angleRad !== null && ca !== null && !h && !co) {
      // Have angle and adjacent, calculate hypotenuse and opposite
      const newHypotenuse = ca / Math.cos(angleRad);
      const newOpposite = ca * Math.tan(angleRad);
      setHypotenuse(newHypotenuse.toFixed(3));
      setOpposite(newOpposite.toFixed(3));
    }
    else if (angleRad !== null && co !== null && !h && !ca) {
      // Have angle and opposite, calculate hypotenuse and adjacent
      const newHypotenuse = co / Math.sin(angleRad);
      const newAdjacent = co / Math.tan(angleRad);
      setHypotenuse(newHypotenuse.toFixed(3));
      setAdjacent(newAdjacent.toFixed(3));
    }
    else if (h !== null && ca !== null && !angleRad && !co) {
      // Have hypotenuse and adjacent, calculate angle and opposite
      const newAngleRad = Math.acos(ca / h);
      const newOpposite = Math.sqrt(h * h - ca * ca);
      setAngle(newAngleRad.toFixed(4));
      setAngleInDegrees(toDegrees(newAngleRad).toFixed(2));
      setOpposite(newOpposite.toFixed(3));
    }
    else if (h !== null && co !== null && !angleRad && !ca) {
      // Have hypotenuse and opposite, calculate angle and adjacent
      const newAngleRad = Math.asin(co / h);
      const newAdjacent = Math.sqrt(h * h - co * co);
      setAngle(newAngleRad.toFixed(4));
      setAngleInDegrees(toDegrees(newAngleRad).toFixed(2));
      setAdjacent(newAdjacent.toFixed(3));
    }
    else if (ca !== null && co !== null && !angleRad && !h) {
      // Have adjacent and opposite, calculate angle and hypotenuse
      const newAngleRad = Math.atan(co / ca);
      const newHypotenuse = Math.sqrt(ca * ca + co * co);
      setAngle(newAngleRad.toFixed(4));
      setAngleInDegrees(toDegrees(newAngleRad).toFixed(2));
      setHypotenuse(newHypotenuse.toFixed(3));
    }
  };

  const clearAll = () => {
    setAngle('');
    setAngleInDegrees('');
    setHypotenuse('');
    setAdjacent('');
    setOpposite('');
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied: ${value}`);
  };

  return (
    <div className="calculator-section">
      <h2>Trigonometry Calculator</h2>
      
      <div className="triangle-diagram">
        <svg className="triangle-svg" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          {/* Triangle */}
          <path d="M 50 150 L 250 150 L 250 50 Z" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="2"/>
          
          {/* Right angle indicator */}
          <path d="M 230 150 L 230 130 L 250 130" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="2"/>
          
          {/* Labels */}
          <text x="150" y="170" textAnchor="middle" fill="#4a5568">Adjacent (CA)</text>
          <text x="260" y="100" textAnchor="start" fill="#4a5568">Opposite (CO)</text>
          <text x="140" y="95" textAnchor="middle" fill="#4a5568">Hypotenuse (H)</text>
          <text x="65" y="140" textAnchor="middle" fill="#667eea">θ</text>
          
          {/* Angle arc */}
          <path d="M 90 150 A 40 40 0 0 0 73 120" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="1.5"/>
        </svg>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="angle">Angle (radians)</label>
          <input
            type="number"
            id="angle"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            step="0.01"
            placeholder="Enter angle in radians"
            disabled={inputCount >= 2 && !angle}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="angleInDegrees">Angle (degrees)</label>
          <input
            type="number"
            id="angleInDegrees"
            value={angleInDegrees}
            onChange={(e) => setAngleInDegrees(e.target.value)}
            step="0.1"
            placeholder="Enter angle in degrees"
            disabled={inputCount >= 2 && !angleInDegrees}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hypotenuse">Hypotenuse (H)</label>
          <input
            type="number"
            id="hypotenuse"
            value={hypotenuse}
            onChange={(e) => setHypotenuse(e.target.value)}
            step="0.1"
            placeholder="Enter hypotenuse"
            disabled={inputCount >= 2 && !hypotenuse}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="adjacent">Adjacent (CA)</label>
          <input
            type="number"
            id="adjacent"
            value={adjacent}
            onChange={(e) => setAdjacent(e.target.value)}
            step="0.1"
            placeholder="Enter adjacent"
            disabled={inputCount >= 2 && !adjacent}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="opposite">Opposite (CO)</label>
          <input
            type="number"
            id="opposite"
            value={opposite}
            onChange={(e) => setOpposite(e.target.value)}
            step="0.1"
            placeholder="Enter opposite"
            disabled={inputCount >= 2 && !opposite}
          />
        </div>
      </div>
      
      <p className="info-text">Enter any 2 values to calculate the remaining values</p>
      
      <div>
        <button className="btn" onClick={calculate} disabled={inputCount < 2}>
          Calculate
        </button>
        <button className="btn btn-secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
      
      {inputCount >= 2 && (
        <div className="result-box">
          <h3>Triangle Values</h3>
          
          {angle && (
            <div className="result-item" onClick={() => copyToClipboard(angle)}>
              <span className="result-label">Angle (radians):</span>
              <span className="result-value">{angle}</span>
            </div>
          )}
          
          {angleInDegrees && (
            <div className="result-item" onClick={() => copyToClipboard(angleInDegrees)}>
              <span className="result-label">Angle (degrees):</span>
              <span className="result-value">{angleInDegrees}°</span>
            </div>
          )}
          
          {hypotenuse && (
            <div className="result-item" onClick={() => copyToClipboard(hypotenuse)}>
              <span className="result-label">Hypotenuse:</span>
              <span className="result-value">{hypotenuse}</span>
            </div>
          )}
          
          {adjacent && (
            <div className="result-item" onClick={() => copyToClipboard(adjacent)}>
              <span className="result-label">Adjacent:</span>
              <span className="result-value">{adjacent}</span>
            </div>
          )}
          
          {opposite && (
            <div className="result-item" onClick={() => copyToClipboard(opposite)}>
              <span className="result-label">Opposite:</span>
              <span className="result-value">{opposite}</span>
            </div>
          )}
          
          <p className="info-text">Click on any result to copy to clipboard</p>
        </div>
      )}
    </div>
  );
}

export default TrigonometryCalculator;