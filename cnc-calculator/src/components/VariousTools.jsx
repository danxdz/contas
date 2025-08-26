import React, { useState } from 'react';

function VariousTools() {
  // Degree/Radian Converter
  const [degrees, setDegrees] = useState('');
  const [radians, setRadians] = useState('');
  
  // Drill Point Angle Calculator
  const [drillDiameter, setDrillDiameter] = useState('');
  const [pointAngle, setPointAngle] = useState('118');
  const [drillDepth, setDrillDepth] = useState('');
  const [pointLength, setPointLength] = useState('');
  
  // Feed & Speed Quick Reference
  const [material, setMaterial] = useState('aluminum');
  const [operation, setOperation] = useState('drilling');
  
  const convertToRadians = () => {
    if (degrees) {
      const rad = parseFloat(degrees) * (Math.PI / 180);
      setRadians(rad.toFixed(6));
    }
  };
  
  const convertToDegrees = () => {
    if (radians) {
      const deg = parseFloat(radians) * (180 / Math.PI);
      setDegrees(deg.toFixed(3));
    }
  };
  
  const calculateDrillPoint = () => {
    if (drillDiameter && pointAngle) {
      const diameter = parseFloat(drillDiameter);
      const angle = parseFloat(pointAngle);
      const angleRad = angle * (Math.PI / 180);
      
      // Calculate point length
      const pointLen = (diameter / 2) / Math.tan(angleRad / 2);
      setPointLength(pointLen.toFixed(3));
      
      // Calculate total depth including point
      if (drillDepth) {
        const depth = parseFloat(drillDepth);
        const totalDepth = depth + pointLen;
        document.getElementById('totalDepth').value = totalDepth.toFixed(3);
      }
    }
  };
  
  const clearDegreeRadian = () => {
    setDegrees('');
    setRadians('');
  };
  
  const clearDrillCalculator = () => {
    setDrillDiameter('');
    setPointAngle('118');
    setDrillDepth('');
    setPointLength('');
  };
  
  // Quick reference data
  const quickReferenceData = {
    drilling: {
      aluminum: { speed: 100, feed: 0.15 },
      brass: { speed: 90, feed: 0.12 },
      mildSteel: { speed: 30, feed: 0.08 },
      stainlessSteel: { speed: 20, feed: 0.05 },
      castIron: { speed: 25, feed: 0.10 },
      plastic: { speed: 150, feed: 0.20 }
    },
    milling: {
      aluminum: { speed: 300, feed: 0.10 },
      brass: { speed: 200, feed: 0.08 },
      mildSteel: { speed: 80, feed: 0.06 },
      stainlessSteel: { speed: 60, feed: 0.04 },
      castIron: { speed: 70, feed: 0.08 },
      plastic: { speed: 400, feed: 0.15 }
    },
    turning: {
      aluminum: { speed: 250, feed: 0.20 },
      brass: { speed: 180, feed: 0.15 },
      mildSteel: { speed: 100, feed: 0.12 },
      stainlessSteel: { speed: 80, feed: 0.10 },
      castIron: { speed: 90, feed: 0.15 },
      plastic: { speed: 350, feed: 0.25 }
    }
  };

  return (
    <div>
      {/* Degree/Radian Converter */}
      <div className="calculator-section">
        <h2>Degree ↔ Radian Converter</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="degrees">Degrees (°)</label>
            <input
              type="number"
              id="degrees"
              value={degrees}
              onChange={(e) => setDegrees(e.target.value)}
              step="0.1"
              placeholder="Enter degrees"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="radians">Radians (rad)</label>
            <input
              type="number"
              id="radians"
              value={radians}
              onChange={(e) => setRadians(e.target.value)}
              step="0.0001"
              placeholder="Enter radians"
            />
          </div>
        </div>
        
        <div>
          <button className="btn" onClick={convertToRadians}>
            Degrees → Radians
          </button>
          <button className="btn" onClick={convertToDegrees}>
            Radians → Degrees
          </button>
          <button className="btn btn-secondary" onClick={clearDegreeRadian}>
            Clear
          </button>
        </div>
        
        <div className="result-box" style={{ marginTop: '20px' }}>
          <h3>Common Angles Reference</h3>
          <div className="result-item">
            <span className="result-label">30°</span>
            <span className="result-value">π/6 ≈ 0.5236 rad</span>
          </div>
          <div className="result-item">
            <span className="result-label">45°</span>
            <span className="result-value">π/4 ≈ 0.7854 rad</span>
          </div>
          <div className="result-item">
            <span className="result-label">60°</span>
            <span className="result-value">π/3 ≈ 1.0472 rad</span>
          </div>
          <div className="result-item">
            <span className="result-label">90°</span>
            <span className="result-value">π/2 ≈ 1.5708 rad</span>
          </div>
          <div className="result-item">
            <span className="result-label">180°</span>
            <span className="result-value">π ≈ 3.1416 rad</span>
          </div>
        </div>
      </div>
      
      {/* Drill Point Calculator */}
      <div className="calculator-section">
        <h2>Drill Point Calculator</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="drillDiameter">Drill Diameter (mm)</label>
            <input
              type="number"
              id="drillDiameter"
              value={drillDiameter}
              onChange={(e) => setDrillDiameter(e.target.value)}
              step="0.1"
              placeholder="Enter drill diameter"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pointAngle">Point Angle (degrees)</label>
            <select
              id="pointAngle"
              value={pointAngle}
              onChange={(e) => setPointAngle(e.target.value)}
            >
              <option value="90">90° (Soft materials)</option>
              <option value="118">118° (Standard)</option>
              <option value="135">135° (Hard materials)</option>
              <option value="140">140° (Very hard materials)</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="drillDepth">Desired Hole Depth (mm)</label>
            <input
              type="number"
              id="drillDepth"
              value={drillDepth}
              onChange={(e) => setDrillDepth(e.target.value)}
              step="0.1"
              placeholder="Enter hole depth"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pointLength">Point Length (mm)</label>
            <input
              type="number"
              id="pointLength"
              value={pointLength}
              readOnly
              placeholder="Calculated point length"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="totalDepth">Total Drilling Depth (mm)</label>
            <input
              type="number"
              id="totalDepth"
              readOnly
              placeholder="Total depth including point"
            />
          </div>
        </div>
        
        <div>
          <button className="btn" onClick={calculateDrillPoint}>
            Calculate
          </button>
          <button className="btn btn-secondary" onClick={clearDrillCalculator}>
            Clear
          </button>
        </div>
        
        {pointLength && (
          <div className="result-box" style={{ marginTop: '20px' }}>
            <p className="info-text">
              Point length is the additional depth needed to account for the drill tip geometry.
              Add this to your desired hole depth for the total drilling depth.
            </p>
          </div>
        )}
      </div>
      
      {/* Quick Reference Table */}
      <div className="calculator-section">
        <h2>Quick Reference - Cutting Parameters</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operation">Operation Type</label>
            <select
              id="operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              <option value="drilling">Drilling</option>
              <option value="milling">Milling</option>
              <option value="turning">Turning</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="refMaterial">Material</label>
            <select
              id="refMaterial"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="aluminum">Aluminum</option>
              <option value="brass">Brass</option>
              <option value="mildSteel">Mild Steel</option>
              <option value="stainlessSteel">Stainless Steel</option>
              <option value="castIron">Cast Iron</option>
              <option value="plastic">Plastic</option>
            </select>
          </div>
        </div>
        
        <div className="result-box">
          <h3>Recommended Parameters for {operation.charAt(0).toUpperCase() + operation.slice(1)}</h3>
          
          <div className="result-item">
            <span className="result-label">Material:</span>
            <span className="result-value">{material.charAt(0).toUpperCase() + material.slice(1).replace(/([A-Z])/g, ' $1')}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Cutting Speed (Carbide):</span>
            <span className="result-value">
              {quickReferenceData[operation][material].speed} m/min
            </span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Feed Rate:</span>
            <span className="result-value">
              {quickReferenceData[operation][material].feed} mm/rev
            </span>
          </div>
          
          <p className="info-text">
            Note: These are general recommendations. Adjust based on tool condition, 
            machine capability, and specific requirements.
          </p>
        </div>
      </div>
      
      {/* Tap Drill Size Reference */}
      <div className="calculator-section">
        <h2>Common Tap Drill Sizes (Metric)</h2>
        
        <div className="result-box">
          <h3>ISO Metric Coarse Thread</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            <div className="result-item">
              <span className="result-label">M3 × 0.5:</span>
              <span className="result-value">2.5 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M4 × 0.7:</span>
              <span className="result-value">3.3 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M5 × 0.8:</span>
              <span className="result-value">4.2 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M6 × 1.0:</span>
              <span className="result-value">5.0 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M8 × 1.25:</span>
              <span className="result-value">6.8 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M10 × 1.5:</span>
              <span className="result-value">8.5 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M12 × 1.75:</span>
              <span className="result-value">10.2 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M16 × 2.0:</span>
              <span className="result-value">14.0 mm drill</span>
            </div>
            <div className="result-item">
              <span className="result-label">M20 × 2.5:</span>
              <span className="result-value">17.5 mm drill</span>
            </div>
          </div>
          
          <p className="info-text" style={{ marginTop: '15px' }}>
            Formula: Tap Drill Size = Nominal Diameter - Pitch
          </p>
        </div>
      </div>
    </div>
  );
}

export default VariousTools;