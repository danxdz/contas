import React, { useState } from 'react';

function FeedsSpeedsOptimizer() {
  // Material and tool parameters
  const [material, setMaterial] = useState('aluminum');
  const [toolMaterial, setToolMaterial] = useState('carbide');
  const [toolDiameter, setToolDiameter] = useState('10');
  const [toolFlutes, setToolFlutes] = useState('3');
  const [fluteLength, setFluteLength] = useState('30');
  const [helixAngle, setHelixAngle] = useState('30');
  const [coating, setCoating] = useState('altin');
  
  // Cutting conditions
  const [operation, setOperation] = useState('slotting');
  const [axialDepth, setAxialDepth] = useState('10');
  const [radialDepth, setRadialDepth] = useState('10');
  const [targetMRR, setTargetMRR] = useState('50');
  
  // Machine constraints
  const [maxRPM, setMaxRPM] = useState('20000');
  const [maxPower, setMaxPower] = useState('10');
  const [maxFeed, setMaxFeed] = useState('5000');
  
  // Optimization preferences
  const [optimizeFor, setOptimizeFor] = useState('mrr');
  const [enableChipThinning, setEnableChipThinning] = useState(true);
  const [enableHSM, setEnableHSM] = useState(false);
  const [stabilityLobes, setStabilityLobes] = useState(false);
  
  const [results, setResults] = useState(null);

  // Material database with cutting parameters
  const materialDatabase = {
    aluminum: {
      name: 'Aluminum (6061)',
      kc: 800,
      mc: 0.25,
      vc_hss: 100,
      vc_carbide: 300,
      fz_roughing: 0.15,
      fz_finishing: 0.08,
      ae_max: 0.5,
      ap_max: 2.0
    },
    steel: {
      name: 'Steel (1045)',
      kc: 2500,
      mc: 0.25,
      vc_hss: 25,
      vc_carbide: 120,
      fz_roughing: 0.10,
      fz_finishing: 0.05,
      ae_max: 0.3,
      ap_max: 1.0
    },
    stainless: {
      name: 'Stainless Steel (316)',
      kc: 2800,
      mc: 0.27,
      vc_hss: 20,
      vc_carbide: 80,
      fz_roughing: 0.08,
      fz_finishing: 0.04,
      ae_max: 0.25,
      ap_max: 0.75
    },
    titanium: {
      name: 'Titanium (Ti6Al4V)',
      kc: 3500,
      mc: 0.30,
      vc_hss: 15,
      vc_carbide: 50,
      fz_roughing: 0.06,
      fz_finishing: 0.03,
      ae_max: 0.2,
      ap_max: 0.5
    },
    inconel: {
      name: 'Inconel 718',
      kc: 4000,
      mc: 0.32,
      vc_hss: 10,
      vc_carbide: 30,
      fz_roughing: 0.05,
      fz_finishing: 0.025,
      ae_max: 0.15,
      ap_max: 0.4
    },
    brass: {
      name: 'Brass (360)',
      kc: 1500,
      mc: 0.20,
      vc_hss: 120,
      vc_carbide: 350,
      fz_roughing: 0.18,
      fz_finishing: 0.10,
      ae_max: 0.6,
      ap_max: 2.5
    }
  };

  // Coating factors
  const coatingFactors = {
    none: { speed: 1.0, life: 1.0 },
    tin: { speed: 1.2, life: 2.0 },
    tialn: { speed: 1.3, life: 2.5 },
    altin: { speed: 1.4, life: 3.0 },
    dlc: { speed: 1.5, life: 4.0 },
    diamond: { speed: 1.6, life: 5.0 }
  };

  const calculate = () => {
    const mat = materialDatabase[material];
    const d = parseFloat(toolDiameter);
    const z = parseInt(toolFlutes);
    const ap = parseFloat(axialDepth);
    const ae = parseFloat(radialDepth);
    const maxN = parseFloat(maxRPM);
    const maxP = parseFloat(maxPower);
    const maxVf = parseFloat(maxFeed);
    const helix = parseFloat(helixAngle);
    const flute = parseFloat(fluteLength);
    
    // Get base cutting speed
    let vc = toolMaterial === 'carbide' ? mat.vc_carbide : mat.vc_hss;
    
    // Apply coating factor
    vc *= coatingFactors[coating].speed;
    
    // Calculate base parameters
    let n = (vc * 1000) / (Math.PI * d);
    n = Math.min(n, maxN);
    
    // Actual cutting speed at limited RPM
    const actualVc = (n * Math.PI * d) / 1000;
    
    // Base feed per tooth
    let fz = operation === 'finishing' ? mat.fz_finishing : mat.fz_roughing;
    
    // Calculate chip thinning factor
    let chipThinningFactor = 1;
    if (enableChipThinning && ae < d) {
      const engagementAngle = 2 * Math.acos(1 - ae / d);
      const avgChipThickness = (180 / engagementAngle) * (Math.PI / 180);
      chipThinningFactor = 1 / avgChipThickness;
      
      if (chipThinningFactor > 2) chipThinningFactor = 2; // Safety limit
    }
    
    // Apply chip thinning
    if (enableChipThinning) {
      fz *= chipThinningFactor;
    }
    
    // Calculate feed rate
    let vf = fz * z * n;
    vf = Math.min(vf, maxVf);
    
    // Recalculate actual feed per tooth if limited
    const actualFz = vf / (z * n);
    
    // Material removal rate
    const mrr = (ap * ae * vf) / 1000; // cm³/min
    
    // Calculate cutting forces and power
    const hm = actualFz * Math.sqrt(ae / d); // Average chip thickness
    const kc_corrected = mat.kc * Math.pow(hm, -mat.mc);
    const cuttingPower = (mrr * kc_corrected) / 60000; // kW
    
    // HSM (High Speed Machining) adjustments
    let hsmParams = null;
    if (enableHSM) {
      // Trochoidal milling parameters
      const trochoidalStepover = d * 0.1; // 10% stepover
      const trochoidalPitch = d * 0.5; // 50% forward step
      const hsmSpeed = actualVc * 1.5; // Increase speed for HSM
      const hsmFeed = vf * 1.2; // Increase feed
      
      hsmParams = {
        stepover: trochoidalStepover.toFixed(2),
        pitch: trochoidalPitch.toFixed(2),
        speed: hsmSpeed.toFixed(0),
        feed: hsmFeed.toFixed(0),
        entryType: 'helical',
        helicalRampAngle: 3 // degrees
      };
    }
    
    // Stability analysis (simplified)
    let stabilityData = null;
    if (stabilityLobes) {
      // Calculate natural frequency (simplified model)
      const stiffness = 50000000; // N/m (typical for machine tool)
      const mass = 50; // kg (spindle mass)
      const naturalFreq = Math.sqrt(stiffness / mass) / (2 * Math.PI); // Hz
      
      // Calculate stability lobes
      const lobes = [];
      for (let lobe = 0; lobe <= 5; lobe++) {
        const stableSpeed = (60 * naturalFreq) / (z * (lobe + 0.5));
        if (stableSpeed <= maxN) {
          lobes.push({
            lobe,
            speed: stableSpeed.toFixed(0),
            depth: (ap * (1 + lobe * 0.2)).toFixed(2) // Simplified depth calculation
          });
        }
      }
      
      stabilityData = {
        naturalFrequency: naturalFreq.toFixed(0),
        lobes,
        currentStability: n < lobes[0]?.speed ? 'Stable' : 'Check stability'
      };
    }
    
    // Optimization results based on preference
    let optimizedParams = {};
    
    if (optimizeFor === 'mrr') {
      // Maximize MRR
      optimizedParams = {
        n: n,
        vf: vf,
        ap: Math.min(ap * 1.2, flute),
        ae: Math.min(ae * 1.1, d * mat.ae_max),
        strategy: 'Aggressive roughing'
      };
    } else if (optimizeFor === 'finish') {
      // Optimize for surface finish
      optimizedParams = {
        n: Math.min(n * 1.2, maxN),
        vf: vf * 0.7,
        ap: ap * 0.5,
        ae: ae * 0.3,
        strategy: 'Fine finishing'
      };
    } else if (optimizeFor === 'life') {
      // Optimize for tool life
      optimizedParams = {
        n: n * 0.8,
        vf: vf * 0.8,
        ap: ap * 0.9,
        ae: ae * 0.9,
        strategy: 'Conservative, extended tool life'
      };
    } else if (optimizeFor === 'power') {
      // Optimize for available power
      const powerRatio = maxP / cuttingPower;
      optimizedParams = {
        n: n,
        vf: vf * Math.min(powerRatio, 1),
        ap: ap * Math.min(powerRatio, 1),
        ae: ae,
        strategy: 'Power-limited optimization'
      };
    }
    
    // Calculate optimized MRR
    const optimizedMRR = (optimizedParams.ap * optimizedParams.ae * optimizedParams.vf) / 1000;
    
    // Surface finish estimation (Ra)
    const surfaceFinish = Math.pow(actualFz, 2) / (8 * (d / 2)) * 1000; // μm
    
    // Tool deflection calculation
    const cuttingForce = kc_corrected * ap * ae * actualFz;
    const deflection = (cuttingForce * Math.pow(ap, 3)) / (3 * 200000 * Math.PI * Math.pow(d, 4) / 64); // mm
    
    setResults({
      baseParameters: {
        speed: actualVc.toFixed(0),
        rpm: n.toFixed(0),
        feedRate: vf.toFixed(0),
        feedPerTooth: actualFz.toFixed(4),
        mrr: mrr.toFixed(2),
        power: cuttingPower.toFixed(2),
        powerUtilization: ((cuttingPower / maxP) * 100).toFixed(1)
      },
      chipThinning: {
        enabled: enableChipThinning,
        factor: chipThinningFactor.toFixed(2),
        adjustedFz: (fz * chipThinningFactor).toFixed(4),
        engagementPercent: ((ae / d) * 100).toFixed(1)
      },
      optimized: {
        rpm: optimizedParams.n.toFixed(0),
        feed: optimizedParams.vf.toFixed(0),
        axialDepth: optimizedParams.ap.toFixed(2),
        radialDepth: optimizedParams.ae.toFixed(2),
        mrr: optimizedMRR.toFixed(2),
        strategy: optimizedParams.strategy,
        improvement: ((optimizedMRR / mrr - 1) * 100).toFixed(1)
      },
      quality: {
        surfaceFinish: surfaceFinish.toFixed(2),
        deflection: deflection.toFixed(4),
        deflectionPercent: ((deflection / (d * 0.001)) * 100).toFixed(2)
      },
      hsm: hsmParams,
      stability: stabilityData,
      recommendations: generateRecommendations(
        actualVc, n, actualFz, mrr, cuttingPower, 
        maxP, surfaceFinish, deflection, mat
      )
    });
  };
  
  const generateRecommendations = (vc, n, fz, mrr, power, maxPower, finish, deflection, mat) => {
    const recommendations = [];
    
    // Speed recommendations
    if (vc < mat.vc_carbide * 0.7) {
      recommendations.push('⚡ Cutting speed is conservative. Consider increasing RPM for better productivity.');
    }
    if (vc > mat.vc_carbide * 1.3) {
      recommendations.push('⚠️ Cutting speed is aggressive. Monitor tool wear closely.');
    }
    
    // Feed recommendations
    if (fz < mat.fz_finishing) {
      recommendations.push('📉 Feed per tooth is very low. Risk of rubbing and work hardening.');
    }
    if (fz > mat.fz_roughing * 1.5) {
      recommendations.push('⚠️ Feed per tooth is high. Check chip evacuation and tool strength.');
    }
    
    // Power recommendations
    if (power > maxPower * 0.8) {
      recommendations.push('⚡ Operating near power limit. Consider reducing cutting parameters.');
    }
    if (power < maxPower * 0.3) {
      recommendations.push('💡 Significant power headroom available. Parameters can be increased.');
    }
    
    // Surface finish
    if (finish > 3.2) {
      recommendations.push('🔧 Surface finish is rough. Reduce feed or add finishing pass.');
    }
    
    // Deflection
    if (deflection > 0.05) {
      recommendations.push('📏 Excessive tool deflection. Reduce stick-out or cutting forces.');
    }
    
    // HSM suggestion
    if (material === 'titanium' || material === 'inconel') {
      recommendations.push('🚀 Consider HSM strategies for difficult materials.');
    }
    
    // Chip thinning
    if (!enableChipThinning && parseFloat(radialDepth) < parseFloat(toolDiameter) * 0.5) {
      recommendations.push('💡 Enable chip thinning compensation for light radial engagement.');
    }
    
    return recommendations;
  };

  return (
    <div className="calculator-section">
      <h2>Advanced Feeds & Speeds Optimizer</h2>
      
      <h3>Material & Tool Setup</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Workpiece Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}>
            <option value="aluminum">Aluminum 6061</option>
            <option value="steel">Steel 1045</option>
            <option value="stainless">Stainless 316</option>
            <option value="titanium">Titanium Ti6Al4V</option>
            <option value="inconel">Inconel 718</option>
            <option value="brass">Brass 360</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Tool Material</label>
          <select value={toolMaterial} onChange={(e) => setToolMaterial(e.target.value)}>
            <option value="hss">HSS</option>
            <option value="carbide">Carbide</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Coating</label>
          <select value={coating} onChange={(e) => setCoating(e.target.value)}>
            <option value="none">None</option>
            <option value="tin">TiN</option>
            <option value="tialn">TiAlN</option>
            <option value="altin">AlTiN</option>
            <option value="dlc">DLC</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>
      
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
            min="1"
            max="12"
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
        
        <div className="form-group">
          <label>Helix Angle (°)</label>
          <input
            type="number"
            value={helixAngle}
            onChange={(e) => setHelixAngle(e.target.value)}
            step="5"
            min="0"
            max="60"
          />
        </div>
      </div>
      
      <h3>Cutting Conditions</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Operation Type</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="slotting">Slotting</option>
            <option value="pocketing">Pocketing</option>
            <option value="profiling">Profiling</option>
            <option value="facing">Facing</option>
            <option value="finishing">Finishing</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Axial Depth ap (mm)</label>
          <input
            type="number"
            value={axialDepth}
            onChange={(e) => setAxialDepth(e.target.value)}
            step="0.1"
            max={fluteLength}
          />
        </div>
        
        <div className="form-group">
          <label>Radial Depth ae (mm)</label>
          <input
            type="number"
            value={radialDepth}
            onChange={(e) => setRadialDepth(e.target.value)}
            step="0.1"
            max={toolDiameter}
          />
        </div>
        
        <div className="form-group">
          <label>Target MRR (cm³/min)</label>
          <input
            type="number"
            value={targetMRR}
            onChange={(e) => setTargetMRR(e.target.value)}
            step="5"
          />
        </div>
      </div>
      
      <h3>Machine Constraints</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Max Spindle Speed (RPM)</label>
          <input
            type="number"
            value={maxRPM}
            onChange={(e) => setMaxRPM(e.target.value)}
            step="1000"
          />
        </div>
        
        <div className="form-group">
          <label>Max Power (kW)</label>
          <input
            type="number"
            value={maxPower}
            onChange={(e) => setMaxPower(e.target.value)}
            step="0.5"
          />
        </div>
        
        <div className="form-group">
          <label>Max Feed Rate (mm/min)</label>
          <input
            type="number"
            value={maxFeed}
            onChange={(e) => setMaxFeed(e.target.value)}
            step="100"
          />
        </div>
      </div>
      
      <h3>Optimization Settings</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Optimize For</label>
          <select value={optimizeFor} onChange={(e) => setOptimizeFor(e.target.value)}>
            <option value="mrr">Maximum MRR</option>
            <option value="finish">Surface Finish</option>
            <option value="life">Tool Life</option>
            <option value="power">Available Power</option>
          </select>
        </div>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enableChipThinning}
            onChange={(e) => setEnableChipThinning(e.target.checked)}
          />
          Enable Chip Thinning
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enableHSM}
            onChange={(e) => setEnableHSM(e.target.checked)}
          />
          HSM Strategy
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={stabilityLobes}
            onChange={(e) => setStabilityLobes(e.target.checked)}
          />
          Stability Analysis
        </label>
      </div>
      
      <button className="btn" onClick={calculate}>
        Optimize Parameters
      </button>
      
      {results && (
        <>
          <div className="result-box">
            <h3>Base Cutting Parameters</h3>
            
            <div className="result-item">
              <span className="result-label">Cutting Speed Vc:</span>
              <span className="result-value">{results.baseParameters.speed} m/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Spindle Speed:</span>
              <span className="result-value">{results.baseParameters.rpm} RPM</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Feed Rate:</span>
              <span className="result-value">{results.baseParameters.feedRate} mm/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Feed per Tooth:</span>
              <span className="result-value">{results.baseParameters.feedPerTooth} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Material Removal Rate:</span>
              <span className="result-value">{results.baseParameters.mrr} cm³/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Cutting Power:</span>
              <span className="result-value">{results.baseParameters.power} kW ({results.baseParameters.powerUtilization}%)</span>
            </div>
          </div>
          
          {results.chipThinning.enabled && (
            <div className="result-box">
              <h3>Chip Thinning Compensation</h3>
              
              <div className="result-item">
                <span className="result-label">Radial Engagement:</span>
                <span className="result-value">{results.chipThinning.engagementPercent}%</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Compensation Factor:</span>
                <span className="result-value">{results.chipThinning.factor}×</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Adjusted Feed/Tooth:</span>
                <span className="result-value">{results.chipThinning.adjustedFz} mm</span>
              </div>
            </div>
          )}
          
          <div className="result-box" style={{ borderColor: 'var(--success)' }}>
            <h3>🎯 Optimized Parameters ({optimizeFor})</h3>
            
            <div className="result-item">
              <span className="result-label">Optimized RPM:</span>
              <span className="result-value">{results.optimized.rpm}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Optimized Feed:</span>
              <span className="result-value">{results.optimized.feed} mm/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Optimized ap:</span>
              <span className="result-value">{results.optimized.axialDepth} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Optimized ae:</span>
              <span className="result-value">{results.optimized.radialDepth} mm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Optimized MRR:</span>
              <span className="result-value">{results.optimized.mrr} cm³/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Strategy:</span>
              <span className="result-value">{results.optimized.strategy}</span>
            </div>
            
            {results.optimized.improvement !== '0.0' && (
              <div className="result-item">
                <span className="result-label">MRR Improvement:</span>
                <span className="result-value" style={{
                  color: parseFloat(results.optimized.improvement) > 0 ? 'var(--success)' : 'var(--warning)'
                }}>
                  {results.optimized.improvement}%
                </span>
              </div>
            )}
          </div>
          
          <div className="result-box">
            <h3>Quality Metrics</h3>
            
            <div className="result-item">
              <span className="result-label">Surface Finish Ra:</span>
              <span className="result-value">{results.quality.surfaceFinish} μm</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Tool Deflection:</span>
              <span className="result-value">{results.quality.deflection} mm ({results.quality.deflectionPercent}% of tolerance)</span>
            </div>
          </div>
          
          {results.hsm && (
            <div className="result-box">
              <h3>HSM Strategy Parameters</h3>
              
              <div className="result-item">
                <span className="result-label">Trochoidal Stepover:</span>
                <span className="result-value">{results.hsm.stepover} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Forward Pitch:</span>
                <span className="result-value">{results.hsm.pitch} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">HSM Speed:</span>
                <span className="result-value">{results.hsm.speed} m/min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">HSM Feed:</span>
                <span className="result-value">{results.hsm.feed} mm/min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Entry Type:</span>
                <span className="result-value">{results.hsm.entryType}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Ramp Angle:</span>
                <span className="result-value">{results.hsm.helicalRampAngle}°</span>
              </div>
            </div>
          )}
          
          {results.stability && (
            <div className="result-box">
              <h3>Stability Analysis</h3>
              
              <div className="result-item">
                <span className="result-label">Natural Frequency:</span>
                <span className="result-value">{results.stability.naturalFrequency} Hz</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Current Status:</span>
                <span className="result-value">{results.stability.currentStability}</span>
              </div>
              
              <h4>Stability Lobes</h4>
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Lobe #</th>
                    <th>Stable Speed (RPM)</th>
                    <th>Max Depth (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.stability.lobes.map(lobe => (
                    <tr key={lobe.lobe}>
                      <td>{lobe.lobe}</td>
                      <td>{lobe.speed}</td>
                      <td>{lobe.depth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {results.recommendations.length > 0 && (
            <div className="result-box">
              <h3>Recommendations</h3>
              {results.recommendations.map((rec, idx) => (
                <p key={idx} className="info-text">
                  {rec}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FeedsSpeedsOptimizer;