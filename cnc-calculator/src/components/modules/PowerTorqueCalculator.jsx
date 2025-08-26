import React, { useState } from 'react';

function PowerTorqueCalculator() {
  const [operation, setOperation] = useState('milling');
  
  // Cutting parameters
  const [cuttingSpeed, setCuttingSpeed] = useState('100');
  const [feedRate, setFeedRate] = useState('0.1');
  const [depthOfCut, setDepthOfCut] = useState('5');
  const [widthOfCut, setWidthOfCut] = useState('10');
  const [toolDiameter, setToolDiameter] = useState('10');
  const [numberOfTeeth, setNumberOfTeeth] = useState('4');
  
  // Material properties
  const [material, setMaterial] = useState('steel');
  const [specificCuttingForce, setSpecificCuttingForce] = useState('2500');
  
  // Machine specs
  const [maxSpindlePower, setMaxSpindlePower] = useState('10');
  const [maxSpindleTorque, setMaxSpindleTorque] = useState('50');
  const [maxSpindleSpeed, setMaxSpindleSpeed] = useState('10000');
  const [efficiency, setEfficiency] = useState('80');
  
  const [results, setResults] = useState(null);

  // Material specific cutting force values (N/mm²)
  const materialData = {
    aluminum: { kc: 800, mc: 0.25, hardness: 75 },
    brass: { kc: 1500, mc: 0.20, hardness: 100 },
    bronze: { kc: 1800, mc: 0.22, hardness: 120 },
    steel: { kc: 2500, mc: 0.25, hardness: 200 },
    stainlessSteel: { kc: 2800, mc: 0.27, hardness: 250 },
    castIron: { kc: 1200, mc: 0.23, hardness: 180 },
    titanium: { kc: 3500, mc: 0.30, hardness: 350 },
    inconel: { kc: 4000, mc: 0.32, hardness: 400 },
    hardSteel: { kc: 3200, mc: 0.28, hardness: 450 },
    plastic: { kc: 200, mc: 0.15, hardness: 20 }
  };

  const calculate = () => {
    const vc = parseFloat(cuttingSpeed);
    const fz = parseFloat(feedRate);
    const ap = parseFloat(depthOfCut);
    const ae = parseFloat(widthOfCut);
    const d = parseFloat(toolDiameter);
    const z = parseInt(numberOfTeeth);
    const kc = parseFloat(specificCuttingForce);
    const eff = parseFloat(efficiency) / 100;
    
    // Calculate spindle speed (RPM)
    const n = (vc * 1000) / (Math.PI * d);
    
    // Calculate feed speed (mm/min)
    const vf = fz * z * n;
    
    // Calculate material removal rate (cm³/min)
    const Q = (ap * ae * vf) / 1000;
    
    // Calculate chip thickness
    const hm = fz * Math.sqrt(ae / d);
    
    // Corrected specific cutting force (considering chip thickness)
    const matData = materialData[material];
    const kc_corrected = kc * Math.pow(hm, -matData.mc);
    
    // Calculate cutting force components
    let Fc, Ft, Fr, F_total;
    
    if (operation === 'milling') {
      // Tangential cutting force
      Ft = (ap * ae * kc_corrected) / (fz * z);
      
      // Feed force (approximately 30-50% of tangential)
      Fc = 0.4 * Ft;
      
      // Radial force (approximately 30-40% of tangential)
      Fr = 0.35 * Ft;
      
      // Total force
      F_total = Math.sqrt(Fc * Fc + Ft * Ft + Fr * Fr);
      
    } else if (operation === 'drilling') {
      // Drilling torque calculation
      const drillDia = d;
      const feedPerRev = fz * 2; // for 2-flute drill
      
      // Thrust force (N)
      Ft = 0.5 * kc * drillDia * feedPerRev;
      
      // Cutting force
      Fc = kc * (drillDia * feedPerRev) / 4;
      
      F_total = Math.sqrt(Ft * Ft + Fc * Fc);
      
    } else { // turning
      // Main cutting force
      Fc = kc_corrected * ap * fz;
      
      // Feed force
      Ft = 0.3 * Fc;
      
      // Radial force
      Fr = 0.2 * Fc;
      
      F_total = Math.sqrt(Fc * Fc + Ft * Ft + Fr * Fr);
    }
    
    // Calculate torque (Nm)
    const T = operation === 'drilling' 
      ? (Fc * d) / 2000  // Drilling torque
      : (Ft * d) / 2000; // Milling/turning torque
    
    // Calculate cutting power (kW)
    const Pc = operation === 'drilling'
      ? (T * n * 2 * Math.PI) / 60000  // Power from torque
      : (Fc * vc) / 60000;  // Power from force and speed
    
    // Calculate required spindle power (considering efficiency)
    const Ps = Pc / eff;
    
    // Calculate specific cutting energy (J/cm³)
    const specificEnergy = Q > 0 ? (Pc * 60) / Q : 0;
    
    // Check machine capability
    const maxPower = parseFloat(maxSpindlePower);
    const maxTorque = parseFloat(maxSpindleTorque);
    const maxRPM = parseFloat(maxSpindleSpeed);
    
    const powerUtilization = (Ps / maxPower) * 100;
    const torqueUtilization = (T / maxTorque) * 100;
    const speedUtilization = (n / maxRPM) * 100;
    
    const canMachine = powerUtilization <= 100 && torqueUtilization <= 100 && speedUtilization <= 100;
    
    // Calculate optimal parameters for available power
    const optimalVc = Math.sqrt((maxPower * eff * 60000) / (kc_corrected * ap * ae));
    const optimalFeed = (maxPower * eff * 60000) / (kc_corrected * ap * ae * n * z);
    
    setResults({
      spindleSpeed: n.toFixed(0),
      feedSpeed: vf.toFixed(0),
      mrr: Q.toFixed(2),
      chipThickness: hm.toFixed(4),
      kcCorrected: kc_corrected.toFixed(0),
      cuttingForce: Fc.toFixed(1),
      tangentialForce: Ft.toFixed(1),
      radialForce: Fr.toFixed(1),
      totalForce: F_total.toFixed(1),
      torque: T.toFixed(2),
      cuttingPower: Pc.toFixed(2),
      spindlePower: Ps.toFixed(2),
      specificEnergy: specificEnergy.toFixed(1),
      powerUtilization: powerUtilization.toFixed(1),
      torqueUtilization: torqueUtilization.toFixed(1),
      speedUtilization: speedUtilization.toFixed(1),
      canMachine,
      optimalVc: optimalVc.toFixed(0),
      optimalFeed: optimalFeed.toFixed(3),
      warnings: generateWarnings(powerUtilization, torqueUtilization, speedUtilization)
    });
  };

  const generateWarnings = (power, torque, speed) => {
    const warnings = [];
    
    if (power > 100) warnings.push(`⚠️ Power requirement exceeds machine capacity by ${(power - 100).toFixed(1)}%`);
    if (torque > 100) warnings.push(`⚠️ Torque requirement exceeds machine capacity by ${(torque - 100).toFixed(1)}%`);
    if (speed > 100) warnings.push(`⚠️ Speed requirement exceeds machine capacity by ${(speed - 100).toFixed(1)}%`);
    
    if (power > 80 && power <= 100) warnings.push(`⚡ Running at ${power.toFixed(0)}% power - consider reducing parameters`);
    if (torque > 80 && torque <= 100) warnings.push(`🔧 Running at ${torque.toFixed(0)}% torque - monitor for stalling`);
    
    return warnings;
  };

  const loadMaterialPreset = () => {
    const data = materialData[material];
    setSpecificCuttingForce(data.kc.toString());
  };

  return (
    <div className="calculator-section">
      <h2>Power & Torque Calculator</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Operation Type</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="milling">Milling</option>
            <option value="drilling">Drilling</option>
            <option value="turning">Turning</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}>
            <option value="aluminum">Aluminum</option>
            <option value="brass">Brass</option>
            <option value="bronze">Bronze</option>
            <option value="steel">Steel (C45)</option>
            <option value="stainlessSteel">Stainless Steel</option>
            <option value="castIron">Cast Iron</option>
            <option value="titanium">Titanium</option>
            <option value="inconel">Inconel</option>
            <option value="hardSteel">Hardened Steel</option>
            <option value="plastic">Plastic</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Specific Cutting Force kc (N/mm²)</label>
          <input
            type="number"
            value={specificCuttingForce}
            onChange={(e) => setSpecificCuttingForce(e.target.value)}
            step="100"
          />
          <button className="btn btn-small" onClick={loadMaterialPreset}>
            Load Preset
          </button>
        </div>
      </div>
      
      <h3>Cutting Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Cutting Speed Vc (m/min)</label>
          <input
            type="number"
            value={cuttingSpeed}
            onChange={(e) => setCuttingSpeed(e.target.value)}
            step="10"
          />
        </div>
        
        <div className="form-group">
          <label>Feed per Tooth fz (mm)</label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label>Tool Diameter (mm)</label>
          <input
            type="number"
            value={toolDiameter}
            onChange={(e) => setToolDiameter(e.target.value)}
            step="0.1"
          />
        </div>
        
        {operation === 'milling' && (
          <div className="form-group">
            <label>Number of Teeth</label>
            <input
              type="number"
              value={numberOfTeeth}
              onChange={(e) => setNumberOfTeeth(e.target.value)}
              step="1"
            />
          </div>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Depth of Cut ap (mm)</label>
          <input
            type="number"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            step="0.1"
          />
        </div>
        
        {operation === 'milling' && (
          <div className="form-group">
            <label>Width of Cut ae (mm)</label>
            <input
              type="number"
              value={widthOfCut}
              onChange={(e) => setWidthOfCut(e.target.value)}
              step="0.1"
            />
          </div>
        )}
      </div>
      
      <h3>Machine Specifications</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Max Spindle Power (kW)</label>
          <input
            type="number"
            value={maxSpindlePower}
            onChange={(e) => setMaxSpindlePower(e.target.value)}
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label>Max Spindle Torque (Nm)</label>
          <input
            type="number"
            value={maxSpindleTorque}
            onChange={(e) => setMaxSpindleTorque(e.target.value)}
            step="1"
          />
        </div>
        
        <div className="form-group">
          <label>Max Spindle Speed (RPM)</label>
          <input
            type="number"
            value={maxSpindleSpeed}
            onChange={(e) => setMaxSpindleSpeed(e.target.value)}
            step="100"
          />
        </div>
        
        <div className="form-group">
          <label>Machine Efficiency (%)</label>
          <input
            type="number"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
            step="5"
            min="50"
            max="100"
          />
        </div>
      </div>
      
      <button className="btn" onClick={calculate}>
        Calculate Power & Torque
      </button>
      
      {results && (
        <>
          <div className="result-box">
            <h3>Cutting Forces</h3>
            
            <div className="result-item">
              <span className="result-label">Cutting Force Fc:</span>
              <span className="result-value">{results.cuttingForce} N</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Tangential Force Ft:</span>
              <span className="result-value">{results.tangentialForce} N</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Radial Force Fr:</span>
              <span className="result-value">{results.radialForce} N</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Total Force:</span>
              <span className="result-value">{results.totalForce} N</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Chip Thickness:</span>
              <span className="result-value">{results.chipThickness} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Corrected kc:</span>
              <span className="result-value">{results.kcCorrected} N/mm²</span>
            </div>
          </div>
          
          <div className="result-box">
            <h3>Power & Torque Requirements</h3>
            
            <div className="result-item">
              <span className="result-label">Spindle Speed:</span>
              <span className="result-value">{results.spindleSpeed} RPM</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Required Torque:</span>
              <span className="result-value">{results.torque} Nm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Cutting Power:</span>
              <span className="result-value">{results.cuttingPower} kW</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Spindle Power Required:</span>
              <span className="result-value" style={{ 
                fontWeight: 'bold',
                color: results.powerUtilization > 100 ? 'var(--danger)' : 'var(--success)'
              }}>
                {results.spindlePower} kW
              </span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Material Removal Rate:</span>
              <span className="result-value">{results.mrr} cm³/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Specific Cutting Energy:</span>
              <span className="result-value">{results.specificEnergy} J/cm³</span>
            </div>
          </div>
          
          <div className="result-box">
            <h3>Machine Capability Check</h3>
            
            <div className="result-item">
              <span className="result-label">Power Utilization:</span>
              <span className="result-value" style={{
                color: results.powerUtilization > 100 ? 'var(--danger)' : 
                       results.powerUtilization > 80 ? 'var(--warning)' : 'var(--success)'
              }}>
                {results.powerUtilization}%
              </span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Torque Utilization:</span>
              <span className="result-value" style={{
                color: results.torqueUtilization > 100 ? 'var(--danger)' : 
                       results.torqueUtilization > 80 ? 'var(--warning)' : 'var(--success)'
              }}>
                {results.torqueUtilization}%
              </span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Speed Utilization:</span>
              <span className="result-value" style={{
                color: results.speedUtilization > 100 ? 'var(--danger)' : 'var(--success)'
              }}>
                {results.speedUtilization}%
              </span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Can Machine:</span>
              <span className="result-value" style={{
                fontWeight: 'bold',
                color: results.canMachine ? 'var(--success)' : 'var(--danger)'
              }}>
                {results.canMachine ? '✅ YES' : '❌ NO'}
              </span>
            </div>
            
            {results.warnings.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {results.warnings.map((warning, index) => (
                  <p key={index} className="info-text" style={{ color: 'var(--warning)' }}>
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          {!results.canMachine && (
            <div className="result-box">
              <h3>Optimization Suggestions</h3>
              
              <div className="result-item">
                <span className="result-label">Reduce Vc to:</span>
                <span className="result-value">{results.optimalVc} m/min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Or reduce feed to:</span>
                <span className="result-value">{results.optimalFeed} mm/tooth</span>
              </div>
              
              <p className="info-text">
                💡 Consider reducing depth of cut, using multiple passes, or selecting a different tool/material combination.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PowerTorqueCalculator;