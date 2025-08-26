import React, { useState, useEffect } from 'react';

function ToolLifeCalculator() {
  const [toolType, setToolType] = useState('endmill');
  const [toolMaterial, setToolMaterial] = useState('carbide');
  const [toolCost, setToolCost] = useState('50');
  const [toolDiameter, setToolDiameter] = useState('10');
  const [numberOfFlutes, setNumberOfFlutes] = useState('4');
  
  // Cutting parameters
  const [cuttingSpeed, setCuttingSpeed] = useState('100');
  const [feedRate, setFeedRate] = useState('500');
  const [depthOfCut, setDepthOfCut] = useState('5');
  const [widthOfCut, setWidthOfCut] = useState('5');
  
  // Workpiece material
  const [workMaterial, setWorkMaterial] = useState('steel');
  const [materialHardness, setMaterialHardness] = useState('200');
  
  // Production parameters
  const [partsPerTool, setPartsPerTool] = useState('');
  const [machineRate, setMachineRate] = useState('75'); // $/hour
  const [setupTime, setSetupTime] = useState('15'); // minutes
  const [partQuantity, setPartQuantity] = useState('100');
  
  const [results, setResults] = useState(null);

  // Taylor's tool life equation coefficients
  const taylorCoefficients = {
    'hss-steel': { C: 75, n: 0.125 },
    'hss-aluminum': { C: 500, n: 0.25 },
    'hss-stainless': { C: 40, n: 0.1 },
    'carbide-steel': { C: 200, n: 0.25 },
    'carbide-aluminum': { C: 1000, n: 0.3 },
    'carbide-stainless': { C: 120, n: 0.2 },
    'carbide-titanium': { C: 80, n: 0.15 },
    'ceramic-steel': { C: 300, n: 0.3 },
    'ceramic-cast-iron': { C: 400, n: 0.35 },
  };

  const calculate = () => {
    const diameter = parseFloat(toolDiameter);
    const vc = parseFloat(cuttingSpeed);
    const feed = parseFloat(feedRate);
    const doc = parseFloat(depthOfCut);
    const woc = parseFloat(widthOfCut);
    const cost = parseFloat(toolCost);
    const hourlyRate = parseFloat(machineRate);
    const setup = parseFloat(setupTime);
    const qty = parseFloat(partQuantity);
    
    // Get Taylor coefficient
    const key = `${toolMaterial}-${workMaterial}`;
    const taylor = taylorCoefficients[key] || { C: 100, n: 0.2 };
    
    // Calculate tool life using Taylor's equation: VT^n = C
    const toolLife = Math.pow(taylor.C / vc, 1 / taylor.n); // minutes
    
    // Calculate material removal rate (MRR)
    const mrr = (doc * woc * feed) / 1000; // cm³/min
    
    // Calculate spindle speed
    const rpm = (vc * 1000) / (Math.PI * diameter);
    
    // Calculate cutting time per part (example: 100mm length)
    const cuttingLength = 100; // mm
    const cuttingTimePerPart = cuttingLength / feed; // minutes
    
    // Calculate parts per tool
    const partsPerToolCalc = Math.floor(toolLife / cuttingTimePerPart);
    
    // Cost calculations
    const toolsNeeded = Math.ceil(qty / partsPerToolCalc);
    const totalToolCost = toolsNeeded * cost;
    const costPerPart = totalToolCost / qty;
    
    // Machine time cost
    const totalMachineTime = (qty * cuttingTimePerPart + setup) / 60; // hours
    const machineCost = totalMachineTime * hourlyRate;
    const totalCost = totalToolCost + machineCost;
    
    // Tool wear rate
    const wearRate = 1 / toolLife; // wear per minute
    
    // Recommended parameters for better tool life
    const recommendedVc = taylor.C * Math.pow(toolLife * 1.5, -taylor.n);
    const improvement = ((toolLife * 1.5 - toolLife) / toolLife * 100).toFixed(1);
    
    setResults({
      toolLife: toolLife.toFixed(2),
      mrr: mrr.toFixed(2),
      rpm: Math.round(rpm),
      partsPerTool: partsPerToolCalc,
      toolsNeeded,
      totalToolCost: totalToolCost.toFixed(2),
      costPerPart: costPerPart.toFixed(3),
      machineCost: machineCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalMachineTime: totalMachineTime.toFixed(2),
      wearRate: (wearRate * 100).toFixed(3),
      recommendedVc: recommendedVc.toFixed(1),
      improvement,
      taylorC: taylor.C,
      taylorN: taylor.n
    });
  };

  const optimizeForCost = () => {
    // Find optimal cutting speed for minimum cost
    const key = `${toolMaterial}-${workMaterial}`;
    const taylor = taylorCoefficients[key] || { C: 100, n: 0.2 };
    
    const cost = parseFloat(toolCost);
    const hourlyRate = parseFloat(machineRate);
    
    // Optimal cutting speed formula
    const optimalVc = taylor.C * Math.pow(
      (taylor.n * cost) / ((1 - taylor.n) * hourlyRate / 60),
      taylor.n
    );
    
    setCuttingSpeed(optimalVc.toFixed(1));
    calculate();
  };

  const clearAll = () => {
    setResults(null);
    setPartsPerTool('');
  };

  return (
    <div className="calculator-section">
      <h2>Tool Life & Cost Calculator</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="toolType">Tool Type</label>
          <select
            id="toolType"
            value={toolType}
            onChange={(e) => setToolType(e.target.value)}
          >
            <option value="endmill">End Mill</option>
            <option value="drill">Drill</option>
            <option value="insert">Insert</option>
            <option value="tap">Tap</option>
            <option value="reamer">Reamer</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="toolMaterial">Tool Material</label>
          <select
            id="toolMaterial"
            value={toolMaterial}
            onChange={(e) => setToolMaterial(e.target.value)}
          >
            <option value="hss">HSS</option>
            <option value="carbide">Carbide</option>
            <option value="ceramic">Ceramic</option>
            <option value="cbn">CBN</option>
            <option value="pcd">PCD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="toolCost">Tool Cost ($)</label>
          <input
            type="number"
            id="toolCost"
            value={toolCost}
            onChange={(e) => setToolCost(e.target.value)}
            step="0.01"
            placeholder="Tool cost"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="toolDiameter">Tool Diameter (mm)</label>
          <input
            type="number"
            id="toolDiameter"
            value={toolDiameter}
            onChange={(e) => setToolDiameter(e.target.value)}
            step="0.1"
            placeholder="Diameter"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="workMaterial">Workpiece Material</label>
          <select
            id="workMaterial"
            value={workMaterial}
            onChange={(e) => setWorkMaterial(e.target.value)}
          >
            <option value="steel">Steel</option>
            <option value="stainless">Stainless Steel</option>
            <option value="aluminum">Aluminum</option>
            <option value="titanium">Titanium</option>
            <option value="cast-iron">Cast Iron</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="materialHardness">Hardness (HB)</label>
          <input
            type="number"
            id="materialHardness"
            value={materialHardness}
            onChange={(e) => setMaterialHardness(e.target.value)}
            step="10"
            placeholder="Brinell hardness"
          />
        </div>
      </div>
      
      <h3>Cutting Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cuttingSpeed">Cutting Speed Vc (m/min)</label>
          <input
            type="number"
            id="cuttingSpeed"
            value={cuttingSpeed}
            onChange={(e) => setCuttingSpeed(e.target.value)}
            step="1"
            placeholder="Cutting speed"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="feedRate">Feed Rate (mm/min)</label>
          <input
            type="number"
            id="feedRate"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            step="10"
            placeholder="Feed rate"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="depthOfCut">Depth of Cut (mm)</label>
          <input
            type="number"
            id="depthOfCut"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            step="0.1"
            placeholder="DOC"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="widthOfCut">Width of Cut (mm)</label>
          <input
            type="number"
            id="widthOfCut"
            value={widthOfCut}
            onChange={(e) => setWidthOfCut(e.target.value)}
            step="0.1"
            placeholder="WOC"
          />
        </div>
      </div>
      
      <h3>Production Parameters</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="partQuantity">Part Quantity</label>
          <input
            type="number"
            id="partQuantity"
            value={partQuantity}
            onChange={(e) => setPartQuantity(e.target.value)}
            step="1"
            placeholder="Number of parts"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="machineRate">Machine Rate ($/hour)</label>
          <input
            type="number"
            id="machineRate"
            value={machineRate}
            onChange={(e) => setMachineRate(e.target.value)}
            step="1"
            placeholder="Hourly rate"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="setupTime">Setup Time (min)</label>
          <input
            type="number"
            id="setupTime"
            value={setupTime}
            onChange={(e) => setSetupTime(e.target.value)}
            step="1"
            placeholder="Setup time"
          />
        </div>
      </div>
      
      <div className="button-group">
        <button className="btn" onClick={calculate}>
          Calculate
        </button>
        <button className="btn" onClick={optimizeForCost}>
          Optimize for Cost
        </button>
        <button className="btn btn-secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
      
      {results && (
        <>
          <div className="result-box">
            <h3>Tool Life Analysis</h3>
            
            <div className="result-item">
              <span className="result-label">Estimated Tool Life:</span>
              <span className="result-value">{results.toolLife} minutes</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Parts per Tool:</span>
              <span className="result-value">{results.partsPerTool} parts</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Tool Wear Rate:</span>
              <span className="result-value">{results.wearRate}% per minute</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Material Removal Rate:</span>
              <span className="result-value">{results.mrr} cm³/min</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Spindle Speed:</span>
              <span className="result-value">{results.rpm} RPM</span>
            </div>
            
            <p className="info-text">
              Taylor's equation: V × T^{results.taylorN} = {results.taylorC}
            </p>
          </div>
          
          <div className="result-box">
            <h3>Cost Analysis</h3>
            
            <div className="result-item">
              <span className="result-label">Tools Needed:</span>
              <span className="result-value">{results.toolsNeeded} tools</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Total Tool Cost:</span>
              <span className="result-value">${results.totalToolCost}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Cost per Part (Tool):</span>
              <span className="result-value">${results.costPerPart}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Machine Time Cost:</span>
              <span className="result-value">${results.machineCost}</span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Total Production Cost:</span>
              <span className="result-value" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                ${results.totalCost}
              </span>
            </div>
            
            <div className="result-item">
              <span className="result-label">Total Machine Time:</span>
              <span className="result-value">{results.totalMachineTime} hours</span>
            </div>
          </div>
          
          <div className="result-box">
            <h3>Optimization Suggestion</h3>
            
            <div className="result-item">
              <span className="result-label">Recommended Vc:</span>
              <span className="result-value">{results.recommendedVc} m/min</span>
            </div>
            
            <p className="info-text">
              💡 Reducing cutting speed to {results.recommendedVc} m/min could increase tool life by {results.improvement}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default ToolLifeCalculator;