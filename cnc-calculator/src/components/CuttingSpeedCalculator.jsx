import React, { useState, useEffect } from 'react';

function CuttingSpeedCalculator() {
  const [mode, setMode] = useState('milling'); // 'milling' or 'turning'
  
  // Common parameters
  const [diameter, setDiameter] = useState('');
  const [vc, setVc] = useState('');
  const [rpm, setRpm] = useState('');
  const [feedPerTooth, setFeedPerTooth] = useState('0.1');
  const [numberOfTeeth, setNumberOfTeeth] = useState('2');
  const [feedRate, setFeedRate] = useState('');
  
  // Tool type
  const [toolType, setToolType] = useState('hss');
  
  // Cutting parameters
  const [ae, setAe] = useState(''); // Radial depth
  const [ap, setAp] = useState(''); // Axial depth
  
  // Material cutting speeds (m/min)
  const cuttingSpeedData = {
    hss: {
      aluminum: 100,
      brass: 90,
      bronze: 60,
      castIron: 25,
      mildSteel: 30,
      stainlessSteel: 20,
      titanium: 15,
      plastic: 150
    },
    carbide: {
      aluminum: 300,
      brass: 200,
      bronze: 150,
      castIron: 80,
      mildSteel: 120,
      stainlessSteel: 60,
      titanium: 40,
      plastic: 400
    }
  };
  
  const [selectedMaterial, setSelectedMaterial] = useState('aluminum');

  useEffect(() => {
    // Auto-calculate number of teeth based on diameter and tool type
    if (diameter && toolType === 'hss') {
      if (parseFloat(diameter) < 4) {
        setNumberOfTeeth('2');
      } else {
        setNumberOfTeeth('4');
      }
    } else if (diameter && toolType === 'carbide') {
      if (parseFloat(diameter) < 20) {
        setNumberOfTeeth('2');
      } else if (parseFloat(diameter) < 60) {
        setNumberOfTeeth('4');
      } else {
        setNumberOfTeeth('6');
      }
    }
  }, [diameter, toolType]);

  useEffect(() => {
    // Auto-calculate cutting depths
    if (diameter) {
      const d = parseFloat(diameter);
      if (mode === 'milling') {
        // Slotting
        setAe(d.toFixed(2));
        setAp((d * 0.05).toFixed(2));
      }
    }
  }, [diameter, mode]);

  const calculateRPM = () => {
    if (diameter && vc) {
      const d = parseFloat(diameter);
      const v = parseFloat(vc);
      const calculatedRpm = (v * 1000) / (Math.PI * d);
      setRpm(Math.round(calculatedRpm).toString());
      
      // Calculate feed rate
      if (feedPerTooth && numberOfTeeth) {
        const fz = parseFloat(feedPerTooth);
        const z = parseInt(numberOfTeeth);
        const vf = calculatedRpm * fz * z;
        setFeedRate(Math.round(vf).toString());
      }
    }
  };

  const calculateVc = () => {
    if (diameter && rpm) {
      const d = parseFloat(diameter);
      const n = parseFloat(rpm);
      const calculatedVc = (Math.PI * d * n) / 1000;
      setVc(calculatedVc.toFixed(1));
      
      // Calculate feed rate
      if (feedPerTooth && numberOfTeeth) {
        const fz = parseFloat(feedPerTooth);
        const z = parseInt(numberOfTeeth);
        const vf = n * fz * z;
        setFeedRate(Math.round(vf).toString());
      }
    }
  };

  const applySuggestedVc = () => {
    const suggestedVc = cuttingSpeedData[toolType][selectedMaterial];
    setVc(suggestedVc.toString());
  };

  const clearAll = () => {
    setDiameter('');
    setVc('');
    setRpm('');
    setFeedPerTooth('0.1');
    setNumberOfTeeth('2');
    setFeedRate('');
    setAe('');
    setAp('');
  };

  return (
    <div className="calculator-section">
      <h2>Cutting Speed Calculator</h2>
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="radio"
            name="mode"
            checked={mode === 'milling'}
            onChange={() => setMode('milling')}
          />
          Milling
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="mode"
            checked={mode === 'turning'}
            onChange={() => setMode('turning')}
          />
          Turning
        </label>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="toolType">Tool Material</label>
          <select
            id="toolType"
            value={toolType}
            onChange={(e) => setToolType(e.target.value)}
          >
            <option value="hss">HSS (High Speed Steel)</option>
            <option value="carbide">Carbide</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="material">Workpiece Material</label>
          <select
            id="material"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
          >
            <option value="aluminum">Aluminum</option>
            <option value="brass">Brass</option>
            <option value="bronze">Bronze</option>
            <option value="castIron">Cast Iron</option>
            <option value="mildSteel">Mild Steel</option>
            <option value="stainlessSteel">Stainless Steel</option>
            <option value="titanium">Titanium</option>
            <option value="plastic">Plastic</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="diameter">Tool Diameter (mm)</label>
          <input
            type="number"
            id="diameter"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            step="0.1"
            placeholder="Enter diameter"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="vc">Cutting Speed Vc (m/min)</label>
          <input
            type="number"
            id="vc"
            value={vc}
            onChange={(e) => setVc(e.target.value)}
            step="1"
            placeholder="Enter cutting speed"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rpm">Spindle Speed (RPM)</label>
          <input
            type="number"
            id="rpm"
            value={rpm}
            onChange={(e) => setRpm(e.target.value)}
            step="10"
            placeholder="Enter RPM"
          />
        </div>
      </div>
      
      {mode === 'milling' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfTeeth">Number of Teeth</label>
              <select
                id="numberOfTeeth"
                value={numberOfTeeth}
                onChange={(e) => setNumberOfTeeth(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="8">8</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="feedPerTooth">Feed per Tooth fz (mm)</label>
              <input
                type="number"
                id="feedPerTooth"
                value={feedPerTooth}
                onChange={(e) => setFeedPerTooth(e.target.value)}
                step="0.01"
                placeholder="Feed per tooth"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="feedRate">Feed Rate (mm/min)</label>
              <input
                type="number"
                id="feedRate"
                value={feedRate}
                readOnly
                placeholder="Calculated feed rate"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ae">Radial Depth ae (mm)</label>
              <input
                type="number"
                id="ae"
                value={ae}
                onChange={(e) => setAe(e.target.value)}
                step="0.1"
                placeholder="Radial depth of cut"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="ap">Axial Depth ap (mm)</label>
              <input
                type="number"
                id="ap"
                value={ap}
                onChange={(e) => setAp(e.target.value)}
                step="0.1"
                placeholder="Axial depth of cut"
              />
            </div>
          </div>
        </>
      )}
      
      <div>
        <button className="btn" onClick={applySuggestedVc}>
          Suggest Vc
        </button>
        <button className="btn" onClick={calculateRPM}>
          Calculate RPM
        </button>
        <button className="btn" onClick={calculateVc}>
          Calculate Vc
        </button>
        <button className="btn btn-secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
      
      {rpm && vc && (
        <div className="result-box">
          <h3>Cutting Parameters</h3>
          
          <div className="result-item">
            <span className="result-label">Spindle Speed:</span>
            <span className="result-value">{rpm} RPM</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Cutting Speed:</span>
            <span className="result-value">{vc} m/min</span>
          </div>
          
          {mode === 'milling' && feedRate && (
            <>
              <div className="result-item">
                <span className="result-label">Feed Rate:</span>
                <span className="result-value">{feedRate} mm/min</span>
              </div>
              
              {ae && (
                <div className="result-item">
                  <span className="result-label">Radial Depth ae:</span>
                  <span className="result-value">{ae} mm</span>
                </div>
              )}
              
              {ap && (
                <div className="result-item">
                  <span className="result-label">Axial Depth ap:</span>
                  <span className="result-value">{ap} mm</span>
                </div>
              )}
            </>
          )}
          
          <p className="info-text">
            Suggested Vc for {toolType.toUpperCase()} on {selectedMaterial}: {cuttingSpeedData[toolType][selectedMaterial]} m/min
          </p>
        </div>
      )}
    </div>
  );
}

export default CuttingSpeedCalculator;