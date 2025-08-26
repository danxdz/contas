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
  const [material, setMaterial] = useState('aluminum6061');
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
  
  // Comprehensive real-world cutting data
  const quickReferenceData = {
    drilling: {
      // Aluminum Alloys
      aluminum6061: { 
        name: 'Aluminum 6061-T6',
        hss: { speed: 100, feed: 0.15, sfm: 330 },
        carbide: { speed: 300, feed: 0.20, sfm: 1000 },
        coolant: 'Flood or MQL',
        notes: 'Good machinability, use sharp tools'
      },
      aluminum7075: { 
        name: 'Aluminum 7075-T6',
        hss: { speed: 90, feed: 0.12, sfm: 300 },
        carbide: { speed: 280, feed: 0.18, sfm: 920 },
        coolant: 'Flood recommended',
        notes: 'Harder than 6061, watch for chip evacuation'
      },
      aluminum2024: { 
        name: 'Aluminum 2024-T3',
        hss: { speed: 85, feed: 0.13, sfm: 280 },
        carbide: { speed: 250, feed: 0.17, sfm: 820 },
        coolant: 'Flood or air blast',
        notes: 'Gummy chips, use polished flutes'
      },
      aluminumCast: { 
        name: 'Cast Aluminum (356)',
        hss: { speed: 120, feed: 0.18, sfm: 400 },
        carbide: { speed: 350, feed: 0.25, sfm: 1150 },
        coolant: 'Air blast preferred',
        notes: 'Silicon content affects tool wear'
      },
      
      // Steel Alloys
      mildSteel1018: { 
        name: 'Mild Steel 1018',
        hss: { speed: 30, feed: 0.08, sfm: 100 },
        carbide: { speed: 120, feed: 0.12, sfm: 400 },
        coolant: 'Flood required',
        notes: 'Good machinability, forms built-up edge'
      },
      steel1045: { 
        name: 'Steel 1045',
        hss: { speed: 25, feed: 0.07, sfm: 80 },
        carbide: { speed: 100, feed: 0.10, sfm: 330 },
        coolant: 'Flood required',
        notes: 'Medium carbon, harder than 1018'
      },
      steel4140: { 
        name: 'Steel 4140 (28-32 HRC)',
        hss: { speed: 20, feed: 0.06, sfm: 65 },
        carbide: { speed: 90, feed: 0.09, sfm: 300 },
        coolant: 'Flood required',
        notes: 'Alloy steel, use coated carbide'
      },
      steel4140Hard: { 
        name: 'Steel 4140 (38-42 HRC)',
        hss: { speed: 12, feed: 0.04, sfm: 40 },
        carbide: { speed: 60, feed: 0.06, sfm: 200 },
        coolant: 'Flood required',
        notes: 'Hard, use TiAlN coated tools'
      },
      toolSteelD2: { 
        name: 'Tool Steel D2 (58-62 HRC)',
        hss: { speed: 8, feed: 0.02, sfm: 25 },
        carbide: { speed: 40, feed: 0.03, sfm: 130 },
        coolant: 'Flood required',
        notes: 'Very hard, carbide only recommended'
      },
      
      // Stainless Steel
      stainless304: { 
        name: 'Stainless 304',
        hss: { speed: 20, feed: 0.05, sfm: 65 },
        carbide: { speed: 60, feed: 0.08, sfm: 200 },
        coolant: 'Flood required',
        notes: 'Work hardens, maintain constant feed'
      },
      stainless316: { 
        name: 'Stainless 316',
        hss: { speed: 18, feed: 0.04, sfm: 60 },
        carbide: { speed: 55, feed: 0.07, sfm: 180 },
        coolant: 'Flood required',
        notes: 'Tougher than 304, use sharp tools'
      },
      stainless17_4: { 
        name: 'Stainless 17-4 PH',
        hss: { speed: 15, feed: 0.04, sfm: 50 },
        carbide: { speed: 50, feed: 0.06, sfm: 165 },
        coolant: 'Flood required',
        notes: 'Precipitation hardening, varies by condition'
      },
      
      // Cast Iron
      castIronGray: { 
        name: 'Gray Cast Iron',
        hss: { speed: 25, feed: 0.10, sfm: 80 },
        carbide: { speed: 80, feed: 0.15, sfm: 260 },
        coolant: 'Dry or air blast',
        notes: 'Abrasive, produces powder chips'
      },
      castIronDuctile: { 
        name: 'Ductile Cast Iron',
        hss: { speed: 22, feed: 0.08, sfm: 70 },
        carbide: { speed: 70, feed: 0.12, sfm: 230 },
        coolant: 'Dry or air blast',
        notes: 'Tougher than gray iron'
      },
      
      // Exotic Materials
      titanium: { 
        name: 'Titanium Grade 5',
        hss: { speed: 15, feed: 0.03, sfm: 50 },
        carbide: { speed: 40, feed: 0.05, sfm: 130 },
        coolant: 'Flood required (high pressure)',
        notes: 'Low thermal conductivity, use sharp tools'
      },
      inconel718: { 
        name: 'Inconel 718',
        hss: { speed: 10, feed: 0.02, sfm: 30 },
        carbide: { speed: 30, feed: 0.04, sfm: 100 },
        coolant: 'Flood required (high pressure)',
        notes: 'Work hardens severely, constant feed critical'
      },
      hastelloy: { 
        name: 'Hastelloy C-276',
        hss: { speed: 8, feed: 0.02, sfm: 25 },
        carbide: { speed: 25, feed: 0.03, sfm: 80 },
        coolant: 'Flood required',
        notes: 'Extremely tough, use positive rake tools'
      },
      
      // Non-Ferrous
      brass360: { 
        name: 'Brass 360',
        hss: { speed: 90, feed: 0.12, sfm: 300 },
        carbide: { speed: 200, feed: 0.18, sfm: 650 },
        coolant: 'Optional (dry or mist)',
        notes: 'Free machining, excellent finish'
      },
      copperC110: { 
        name: 'Copper C110',
        hss: { speed: 70, feed: 0.10, sfm: 230 },
        carbide: { speed: 150, feed: 0.15, sfm: 500 },
        coolant: 'Flood or mist',
        notes: 'Soft, use sharp tools and high rake'
      },
      bronze: { 
        name: 'Bronze 932',
        hss: { speed: 60, feed: 0.10, sfm: 200 },
        carbide: { speed: 150, feed: 0.15, sfm: 500 },
        coolant: 'Optional',
        notes: 'Good machinability, watch for chip control'
      },
      
      // Plastics
      acrylic: { 
        name: 'Acrylic (PMMA)',
        hss: { speed: 150, feed: 0.20, sfm: 500 },
        carbide: { speed: 400, feed: 0.30, sfm: 1300 },
        coolant: 'Air blast only',
        notes: 'Melts easily, use sharp tools and air'
      },
      delrin: { 
        name: 'Delrin (POM)',
        hss: { speed: 120, feed: 0.18, sfm: 400 },
        carbide: { speed: 350, feed: 0.25, sfm: 1150 },
        coolant: 'Air blast',
        notes: 'Good chip control, watch for heat'
      },
      nylon: { 
        name: 'Nylon 6/6',
        hss: { speed: 100, feed: 0.15, sfm: 330 },
        carbide: { speed: 300, feed: 0.22, sfm: 1000 },
        coolant: 'Air blast',
        notes: 'Flexible, use sharp tools'
      },
      hdpe: { 
        name: 'HDPE',
        hss: { speed: 180, feed: 0.25, sfm: 600 },
        carbide: { speed: 500, feed: 0.35, sfm: 1650 },
        coolant: 'Air blast',
        notes: 'Very soft, single flute tools work well'
      }
    },
    milling: {
      // Similar structure but with milling-specific parameters
      aluminum6061: { 
        name: 'Aluminum 6061-T6',
        hss: { speed: 300, feed: 0.10, sfm: 1000, chipload: 0.003 },
        carbide: { speed: 800, feed: 0.15, sfm: 2600, chipload: 0.005 },
        coolant: 'Flood, mist, or MQL',
        notes: 'High speed, light cuts for best finish'
      },
      mildSteel1018: { 
        name: 'Mild Steel 1018',
        hss: { speed: 80, feed: 0.06, sfm: 260, chipload: 0.002 },
        carbide: { speed: 300, feed: 0.10, sfm: 1000, chipload: 0.004 },
        coolant: 'Flood required',
        notes: 'Watch for built-up edge at low speeds'
      },
      stainless304: { 
        name: 'Stainless 304',
        hss: { speed: 60, feed: 0.04, sfm: 200, chipload: 0.001 },
        carbide: { speed: 180, feed: 0.06, sfm: 600, chipload: 0.003 },
        coolant: 'Flood required',
        notes: 'Climb milling preferred, maintain chip load'
      },
      titanium: { 
        name: 'Titanium Grade 5',
        hss: { speed: 40, feed: 0.02, sfm: 130, chipload: 0.001 },
        carbide: { speed: 120, feed: 0.04, sfm: 400, chipload: 0.002 },
        coolant: 'Flood (high pressure)',
        notes: 'Use 5-7% radial engagement for best tool life'
      }
    },
    turning: {
      aluminum6061: { 
        name: 'Aluminum 6061-T6',
        hss: { speed: 250, feed: 0.20, sfm: 820, doc: 0.100 },
        carbide: { speed: 600, feed: 0.25, sfm: 2000, doc: 0.150 },
        coolant: 'Flood or dry',
        notes: 'Use positive rake inserts'
      },
      mildSteel1018: { 
        name: 'Mild Steel 1018',
        hss: { speed: 100, feed: 0.12, sfm: 330, doc: 0.080 },
        carbide: { speed: 350, feed: 0.18, sfm: 1150, doc: 0.125 },
        coolant: 'Flood',
        notes: 'CNMG inserts work well'
      },
      stainless304: { 
        name: 'Stainless 304',
        hss: { speed: 80, feed: 0.10, sfm: 260, doc: 0.060 },
        carbide: { speed: 250, feed: 0.15, sfm: 820, doc: 0.100 },
        coolant: 'Flood required',
        notes: 'Use sharp inserts, constant DOC'
      }
    }
  };

  // Get current material data
  const getMaterialData = () => {
    const data = quickReferenceData[operation][material];
    if (!data) {
      // Return first available material if selected doesn't exist in operation
      const firstKey = Object.keys(quickReferenceData[operation])[0];
      return quickReferenceData[operation][firstKey];
    }
    return data;
  };

  const currentData = getMaterialData();

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
      
      {/* Enhanced Quick Reference Table */}
      <div className="calculator-section">
        <h2>Professional Cutting Parameters Database</h2>
        
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
            <label htmlFor="refMaterial">Material Grade</label>
            <select
              id="refMaterial"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            >
              <optgroup label="Aluminum Alloys">
                <option value="aluminum6061">Aluminum 6061-T6</option>
                <option value="aluminum7075">Aluminum 7075-T6</option>
                <option value="aluminum2024">Aluminum 2024-T3</option>
                <option value="aluminumCast">Cast Aluminum 356</option>
              </optgroup>
              <optgroup label="Carbon Steels">
                <option value="mildSteel1018">Mild Steel 1018</option>
                <option value="steel1045">Steel 1045</option>
                <option value="steel4140">Steel 4140 (28-32 HRC)</option>
                <option value="steel4140Hard">Steel 4140 (38-42 HRC)</option>
                <option value="toolSteelD2">Tool Steel D2 (58-62 HRC)</option>
              </optgroup>
              <optgroup label="Stainless Steels">
                <option value="stainless304">Stainless 304</option>
                <option value="stainless316">Stainless 316</option>
                <option value="stainless17_4">Stainless 17-4 PH</option>
              </optgroup>
              <optgroup label="Cast Iron">
                <option value="castIronGray">Gray Cast Iron</option>
                <option value="castIronDuctile">Ductile Cast Iron</option>
              </optgroup>
              <optgroup label="Exotic Materials">
                <option value="titanium">Titanium Grade 5</option>
                <option value="inconel718">Inconel 718</option>
                <option value="hastelloy">Hastelloy C-276</option>
              </optgroup>
              <optgroup label="Non-Ferrous">
                <option value="brass360">Brass 360</option>
                <option value="copperC110">Copper C110</option>
                <option value="bronze">Bronze 932</option>
              </optgroup>
              <optgroup label="Plastics">
                <option value="acrylic">Acrylic (PMMA)</option>
                <option value="delrin">Delrin (POM)</option>
                <option value="nylon">Nylon 6/6</option>
                <option value="hdpe">HDPE</option>
              </optgroup>
            </select>
          </div>
        </div>
        
        <div className="result-box">
          <h3>{currentData.name} - {operation.charAt(0).toUpperCase() + operation.slice(1)} Parameters</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>HSS Tools</h4>
              <div className="result-item">
                <span className="result-label">Cutting Speed:</span>
                <span className="result-value">{currentData.hss.speed} m/min</span>
              </div>
              <div className="result-item">
                <span className="result-label">Feed Rate:</span>
                <span className="result-value">{currentData.hss.feed} mm/rev</span>
              </div>
              {currentData.hss.sfm && (
                <div className="result-item">
                  <span className="result-label">SFM:</span>
                  <span className="result-value">{currentData.hss.sfm}</span>
                </div>
              )}
              {currentData.hss.chipload && (
                <div className="result-item">
                  <span className="result-label">Chip Load:</span>
                  <span className="result-value">{currentData.hss.chipload}" per tooth</span>
                </div>
              )}
              {currentData.hss.doc && (
                <div className="result-item">
                  <span className="result-label">Depth of Cut:</span>
                  <span className="result-value">{currentData.hss.doc}"</span>
                </div>
              )}
            </div>
            
            <div>
              <h4 style={{ color: '#764ba2', marginBottom: '10px' }}>Carbide Tools</h4>
              <div className="result-item">
                <span className="result-label">Cutting Speed:</span>
                <span className="result-value">{currentData.carbide.speed} m/min</span>
              </div>
              <div className="result-item">
                <span className="result-label">Feed Rate:</span>
                <span className="result-value">{currentData.carbide.feed} mm/rev</span>
              </div>
              {currentData.carbide.sfm && (
                <div className="result-item">
                  <span className="result-label">SFM:</span>
                  <span className="result-value">{currentData.carbide.sfm}</span>
                </div>
              )}
              {currentData.carbide.chipload && (
                <div className="result-item">
                  <span className="result-label">Chip Load:</span>
                  <span className="result-value">{currentData.carbide.chipload}" per tooth</span>
                </div>
              )}
              {currentData.carbide.doc && (
                <div className="result-item">
                  <span className="result-label">Depth of Cut:</span>
                  <span className="result-value">{currentData.carbide.doc}"</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="result-item">
            <span className="result-label">Coolant:</span>
            <span className="result-value">{currentData.coolant}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Notes:</span>
            <span className="result-value">{currentData.notes}</span>
          </div>
          
          <p className="info-text" style={{ marginTop: '15px' }}>
            ⚠️ These are starting point recommendations. Adjust based on:
            machine rigidity, tool condition, workholding, required finish, and specific application.
            Always start conservatively and increase parameters gradually.
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
            Formula: Tap Drill Size = Nominal Diameter - Pitch (for ~75% thread engagement)
          </p>
        </div>
      </div>
    </div>
  );
}

export default VariousTools;