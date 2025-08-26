import React, { useState } from 'react';

function GeometryTools() {
  const [activeTab, setActiveTab] = useState('boltCircle');
  
  // Bolt Circle Calculator states
  const [numberOfHoles, setNumberOfHoles] = useState('6');
  const [boltCircleDiameter, setBoltCircleDiameter] = useState('100');
  const [startAngle, setStartAngle] = useState('0');
  const [centerX, setCenterX] = useState('0');
  const [centerY, setCenterY] = useState('0');
  const [boltResults, setBoltResults] = useState(null);
  
  // Chamfer/Countersink Calculator states
  const [chamferAngle, setChamferAngle] = useState('90');
  const [chamferDiameter, setChamferDiameter] = useState('10');
  const [chamferDepth, setChamferDepth] = useState('');
  const [holeDiameter, setHoleDiameter] = useState('5');
  const [chamferResults, setChamferResults] = useState(null);
  
  // Ball Nose Calculator states
  const [ballDiameter, setBallDiameter] = useState('10');
  const [stepoverPercent, setStepoverPercent] = useState('50');
  const [scallop, setScallop] = useState('');
  const [ballResults, setBallResults] = useState(null);
  
  // Compound Angle Calculator states
  const [angleA, setAngleA] = useState('45');
  const [angleB, setAngleB] = useState('30');
  const [compoundResults, setCompoundResults] = useState(null);

  // Bolt Circle Calculator
  const calculateBoltCircle = () => {
    const n = parseInt(numberOfHoles);
    const bcd = parseFloat(boltCircleDiameter);
    const start = parseFloat(startAngle) * Math.PI / 180;
    const cx = parseFloat(centerX);
    const cy = parseFloat(centerY);
    
    const holes = [];
    const angleIncrement = (2 * Math.PI) / n;
    
    for (let i = 0; i < n; i++) {
      const angle = start + (i * angleIncrement);
      const x = cx + (bcd / 2) * Math.cos(angle);
      const y = cy + (bcd / 2) * Math.sin(angle);
      
      holes.push({
        number: i + 1,
        x: x.toFixed(3),
        y: y.toFixed(3),
        angle: ((angle * 180 / Math.PI) % 360).toFixed(1)
      });
    }
    
    // Calculate chord length (distance between adjacent holes)
    const chordLength = bcd * Math.sin(angleIncrement / 2);
    
    // Generate G-code
    const gcode = generateBoltCircleGCode(holes);
    
    setBoltResults({
      holes,
      chordLength: chordLength.toFixed(3),
      angleIncrement: (angleIncrement * 180 / Math.PI).toFixed(2),
      gcode
    });
  };
  
  const generateBoltCircleGCode = (holes) => {
    const lines = [];
    lines.push('(BOLT CIRCLE PATTERN)');
    lines.push(`(Number of holes: ${numberOfHoles})`);
    lines.push(`(BCD: ${boltCircleDiameter}mm)`);
    lines.push('');
    lines.push('G90 G94 ; Absolute, mm/min');
    lines.push('G00 Z5 ; Safe height');
    
    holes.forEach(hole => {
      lines.push(`(Hole ${hole.number})`);
      lines.push(`G00 X${hole.x} Y${hole.y}`);
      lines.push('G81 Z-10 R2 F100 ; Drilling cycle');
    });
    
    lines.push('G80 ; Cancel cycle');
    lines.push('G00 Z25');
    lines.push('M30');
    
    return lines.join('\n');
  };
  
  // Chamfer/Countersink Calculator
  const calculateChamfer = () => {
    const angle = parseFloat(chamferAngle);
    const diameter = parseFloat(chamferDiameter);
    const hole = parseFloat(holeDiameter);
    
    // Calculate depth from diameter
    const halfAngle = (angle / 2) * Math.PI / 180;
    const depth = (diameter - hole) / (2 * Math.tan(halfAngle));
    
    // Calculate tool diameter for given depth
    let toolDiameter = 0;
    if (chamferDepth) {
      const d = parseFloat(chamferDepth);
      toolDiameter = hole + (2 * d * Math.tan(halfAngle));
    }
    
    // Calculate cutting parameters
    const cuttingSpeed = 50; // m/min for HSS
    const rpm = (cuttingSpeed * 1000) / (Math.PI * diameter);
    const feedPerTooth = 0.05;
    const feed = feedPerTooth * 2 * rpm; // 2-flute tool
    
    setChamferResults({
      depth: depth.toFixed(3),
      toolDiameter: toolDiameter.toFixed(3),
      rpm: Math.round(rpm),
      feed: Math.round(feed),
      halfAngle: (angle / 2).toFixed(1)
    });
  };
  
  // Ball Nose Calculator
  const calculateBallNose = () => {
    const d = parseFloat(ballDiameter);
    const stepover = parseFloat(stepoverPercent) / 100;
    
    // Calculate scallop height
    const ae = d * stepover; // actual stepover
    const r = d / 2; // ball radius
    const h = r - Math.sqrt(r * r - (ae / 2) * (ae / 2)); // scallop height
    
    // Calculate effective diameter at different depths
    const depths = [0.1, 0.5, 1, 2, 5];
    const effectiveDiameters = depths.map(depth => {
      if (depth >= r) return d;
      const dEff = 2 * Math.sqrt(r * r - (r - depth) * (r - depth));
      return {
        depth: depth,
        diameter: dEff.toFixed(3),
        speed: ((100 * 1000) / (Math.PI * dEff)).toFixed(0) // RPM at 100 m/min
      };
    });
    
    // Calculate optimal stepover for target scallop
    let optimalStepover = 0;
    if (scallop) {
      const targetScallop = parseFloat(scallop);
      optimalStepover = 2 * Math.sqrt(2 * r * targetScallop - targetScallop * targetScallop);
    }
    
    setBallResults({
      scallop: h.toFixed(4),
      actualStepover: ae.toFixed(3),
      optimalStepover: optimalStepover.toFixed(3),
      optimalPercent: optimalStepover ? ((optimalStepover / d) * 100).toFixed(1) : 0,
      effectiveDiameters,
      radius: r.toFixed(2)
    });
  };
  
  // Compound Angle Calculator
  const calculateCompoundAngle = () => {
    const a = parseFloat(angleA) * Math.PI / 180;
    const b = parseFloat(angleB) * Math.PI / 180;
    
    // Calculate resultant angle
    const resultant = Math.acos(Math.cos(a) * Math.cos(b));
    
    // Calculate machine angles for 5-axis
    const tiltAngle = Math.atan(Math.tan(a) / Math.cos(b));
    const rotaryAngle = Math.atan(Math.tan(b) / Math.cos(a));
    
    // Calculate vector components
    const vx = Math.sin(a) * Math.cos(b);
    const vy = Math.sin(b);
    const vz = Math.cos(a) * Math.cos(b);
    
    setCompoundResults({
      resultant: (resultant * 180 / Math.PI).toFixed(2),
      tiltAngle: (tiltAngle * 180 / Math.PI).toFixed(2),
      rotaryAngle: (rotaryAngle * 180 / Math.PI).toFixed(2),
      vector: {
        x: vx.toFixed(4),
        y: vy.toFixed(4),
        z: vz.toFixed(4)
      }
    });
  };

  return (
    <div className="calculator-section">
      <h2>Advanced Geometry Tools</h2>
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="radio"
            name="geometryTab"
            checked={activeTab === 'boltCircle'}
            onChange={() => setActiveTab('boltCircle')}
          />
          Bolt Circle
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="geometryTab"
            checked={activeTab === 'chamfer'}
            onChange={() => setActiveTab('chamfer')}
          />
          Chamfer/Countersink
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="geometryTab"
            checked={activeTab === 'ballNose'}
            onChange={() => setActiveTab('ballNose')}
          />
          Ball Nose
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="geometryTab"
            checked={activeTab === 'compound'}
            onChange={() => setActiveTab('compound')}
          />
          Compound Angles
        </label>
      </div>
      
      {activeTab === 'boltCircle' && (
        <div>
          <h3>Bolt Circle Pattern Calculator</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Number of Holes</label>
              <input
                type="number"
                value={numberOfHoles}
                onChange={(e) => setNumberOfHoles(e.target.value)}
                min="2"
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label>Bolt Circle Diameter (mm)</label>
              <input
                type="number"
                value={boltCircleDiameter}
                onChange={(e) => setBoltCircleDiameter(e.target.value)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Start Angle (degrees)</label>
              <input
                type="number"
                value={startAngle}
                onChange={(e) => setStartAngle(e.target.value)}
                step="1"
              />
            </div>
          </div>
          
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
          </div>
          
          <button className="btn" onClick={calculateBoltCircle}>
            Calculate Hole Positions
          </button>
          
          {boltResults && (
            <>
              <div className="result-box">
                <h3>Hole Coordinates</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>Hole #</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Angle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boltResults.holes.map(hole => (
                        <tr key={hole.number}>
                          <td>{hole.number}</td>
                          <td>{hole.x}</td>
                          <td>{hole.y}</td>
                          <td>{hole.angle}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Chord Length:</span>
                  <span className="result-value">{boltResults.chordLength} mm</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Angle Between Holes:</span>
                  <span className="result-value">{boltResults.angleIncrement}°</span>
                </div>
              </div>
              
              <div className="result-box">
                <h3>G-Code</h3>
                <pre style={{ fontSize: '0.8rem' }}>
                  {boltResults.gcode}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
      
      {activeTab === 'chamfer' && (
        <div>
          <h3>Chamfer & Countersink Calculator</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Chamfer Angle (included)</label>
              <select 
                value={chamferAngle}
                onChange={(e) => setChamferAngle(e.target.value)}
              >
                <option value="60">60° (Metric)</option>
                <option value="82">82° (UNC)</option>
                <option value="90">90° (Standard)</option>
                <option value="100">100° (UNF)</option>
                <option value="120">120° (Sheet metal)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Chamfer Diameter (mm)</label>
              <input
                type="number"
                value={chamferDiameter}
                onChange={(e) => setChamferDiameter(e.target.value)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Hole Diameter (mm)</label>
              <input
                type="number"
                value={holeDiameter}
                onChange={(e) => setHoleDiameter(e.target.value)}
                step="0.1"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Target Depth (mm) - Optional</label>
              <input
                type="number"
                value={chamferDepth}
                onChange={(e) => setChamferDepth(e.target.value)}
                step="0.01"
                placeholder="Calculate tool diameter"
              />
            </div>
          </div>
          
          <button className="btn" onClick={calculateChamfer}>
            Calculate Chamfer
          </button>
          
          {chamferResults && (
            <div className="result-box">
              <h3>Chamfer Parameters</h3>
              
              <div className="result-item">
                <span className="result-label">Required Depth:</span>
                <span className="result-value">{chamferResults.depth} mm</span>
              </div>
              
              {chamferDepth && (
                <div className="result-item">
                  <span className="result-label">Tool Diameter for Depth:</span>
                  <span className="result-value">{chamferResults.toolDiameter} mm</span>
                </div>
              )}
              
              <div className="result-item">
                <span className="result-label">Half Angle:</span>
                <span className="result-value">{chamferResults.halfAngle}°</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Recommended RPM:</span>
                <span className="result-value">{chamferResults.rpm}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Feed Rate:</span>
                <span className="result-value">{chamferResults.feed} mm/min</span>
              </div>
              
              <p className="info-text">
                💡 For countersink screws, add 0.1-0.2mm to calculated depth for proper seating
              </p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'ballNose' && (
        <div>
          <h3>Ball Nose & Scallop Calculator</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ball Diameter (mm)</label>
              <input
                type="number"
                value={ballDiameter}
                onChange={(e) => setBallDiameter(e.target.value)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Stepover (%)</label>
              <input
                type="number"
                value={stepoverPercent}
                onChange={(e) => setStepoverPercent(e.target.value)}
                step="5"
                min="5"
                max="95"
              />
            </div>
            
            <div className="form-group">
              <label>Target Scallop (mm) - Optional</label>
              <input
                type="number"
                value={scallop}
                onChange={(e) => setScallop(e.target.value)}
                step="0.001"
                placeholder="Calculate optimal stepover"
              />
            </div>
          </div>
          
          <button className="btn" onClick={calculateBallNose}>
            Calculate
          </button>
          
          {ballResults && (
            <>
              <div className="result-box">
                <h3>Scallop Results</h3>
                
                <div className="result-item">
                  <span className="result-label">Scallop Height:</span>
                  <span className="result-value">{ballResults.scallop} mm</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Actual Stepover:</span>
                  <span className="result-value">{ballResults.actualStepover} mm</span>
                </div>
                
                {scallop && (
                  <>
                    <div className="result-item">
                      <span className="result-label">Optimal Stepover:</span>
                      <span className="result-value">{ballResults.optimalStepover} mm</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="result-label">Optimal Percentage:</span>
                      <span className="result-value">{ballResults.optimalPercent}%</span>
                    </div>
                  </>
                )}
                
                <div className="result-item">
                  <span className="result-label">Ball Radius:</span>
                  <span className="result-value">{ballResults.radius} mm</span>
                </div>
              </div>
              
              <div className="result-box">
                <h3>Effective Diameter at Depth</h3>
                
                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Depth (mm)</th>
                      <th>Effective Ø (mm)</th>
                      <th>RPM @ 100m/min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ballResults.effectiveDiameters.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.depth}</td>
                        <td>{item.diameter}</td>
                        <td>{item.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <p className="info-text">
                  💡 Adjust spindle speed based on effective diameter at cutting depth
                </p>
              </div>
            </>
          )}
        </div>
      )}
      
      {activeTab === 'compound' && (
        <div>
          <h3>Compound Angle Calculator</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Angle A (degrees)</label>
              <input
                type="number"
                value={angleA}
                onChange={(e) => setAngleA(e.target.value)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Angle B (degrees)</label>
              <input
                type="number"
                value={angleB}
                onChange={(e) => setAngleB(e.target.value)}
                step="0.1"
              />
            </div>
          </div>
          
          <button className="btn" onClick={calculateCompoundAngle}>
            Calculate Compound Angle
          </button>
          
          {compoundResults && (
            <div className="result-box">
              <h3>Compound Angle Results</h3>
              
              <div className="result-item">
                <span className="result-label">Resultant Angle:</span>
                <span className="result-value">{compoundResults.resultant}°</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Machine Tilt (A-axis):</span>
                <span className="result-value">{compoundResults.tiltAngle}°</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Machine Rotary (B-axis):</span>
                <span className="result-value">{compoundResults.rotaryAngle}°</span>
              </div>
              
              <h4 style={{ marginTop: '15px' }}>Unit Vector</h4>
              
              <div className="result-item">
                <span className="result-label">X Component:</span>
                <span className="result-value">{compoundResults.vector.x}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Y Component:</span>
                <span className="result-value">{compoundResults.vector.y}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Z Component:</span>
                <span className="result-value">{compoundResults.vector.z}</span>
              </div>
              
              <p className="info-text">
                💡 Use these values for 5-axis machining setup
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GeometryTools;