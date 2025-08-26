import React, { useState } from 'react';

function ThreadCalculator() {
  const [dm, setDm] = useState('');
  const [passo, setPasso] = useState('');
  const [results, setResults] = useState({
    re: '',
    ri: '',
    afEx: '',
    afIn: '',
    dma: ''
  });

  const calculateThread = () => {
    if (dm && passo) {
      const dmValue = parseFloat(dm);
      const passoValue = parseFloat(passo);
      
      // External thread root diameter
      const re = dmValue - (1.2268 * passoValue);
      
      // Internal thread root diameter
      const constantF = 2 * (0.045 * passoValue);
      const ri = dmValue + constantF;
      
      // External thread depth
      const afEx = 0.61343 * passoValue;
      
      // Internal thread calculations
      const dma = dmValue - (1.0825 * passoValue);
      const afIn = (ri - dma) / 2;
      
      setResults({
        re: re.toFixed(3),
        ri: ri.toFixed(3),
        afEx: afEx.toFixed(3),
        afIn: afIn.toFixed(3),
        dma: dma.toFixed(3)
      });
    }
  };

  const autoCalculatePitch = () => {
    const dmValue = parseFloat(dm);
    if (!dmValue) return;
    
    let pitch = 0.25;
    
    if (dmValue < 1.4) pitch = 0.25;
    else if (dmValue >= 1.4 && dmValue < 1.6) pitch = 0.3;
    else if (dmValue >= 1.6 && dmValue < 2) pitch = 0.35;
    else if (dmValue >= 2 && dmValue < 2.2) pitch = 0.4;
    else if (dmValue >= 2.2 && dmValue < 3) pitch = 0.45;
    else if (dmValue >= 3 && dmValue < 3.5) pitch = 0.5;
    else if (dmValue >= 3.5 && dmValue < 4) pitch = 0.6;
    else if (dmValue >= 4 && dmValue < 4.5) pitch = 0.7;
    else if (dmValue >= 4.5 && dmValue < 5) pitch = 0.75;
    else if (dmValue >= 5 && dmValue < 6) pitch = 0.8;
    else if (dmValue >= 6 && dmValue < 8) pitch = 1;
    else if (dmValue >= 8 && dmValue < 10) pitch = 1.25;
    else if (dmValue >= 10 && dmValue < 12) pitch = 1.5;
    else if (dmValue >= 12 && dmValue < 18) pitch = 2;
    else if (dmValue >= 18 && dmValue < 24) pitch = 2.5;
    else if (dmValue >= 24 && dmValue < 30) pitch = 3;
    else if (dmValue >= 30 && dmValue < 36) pitch = 3.5;
    else if (dmValue >= 36 && dmValue < 42) pitch = 4;
    else if (dmValue >= 42) pitch = 4.5;
    
    setPasso(pitch.toString());
  };

  const clearAll = () => {
    setDm('');
    setPasso('');
    setResults({
      re: '',
      ri: '',
      afEx: '',
      afIn: '',
      dma: ''
    });
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied: ${value}`);
  };

  return (
    <div className="calculator-section">
      <h2>Thread Calculator (Metric ISO)</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dm">Nominal Diameter (mm)</label>
          <input
            type="number"
            id="dm"
            value={dm}
            onChange={(e) => setDm(e.target.value)}
            step="0.1"
            placeholder="Enter diameter"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="passo">Pitch (mm)</label>
          <input
            type="number"
            id="passo"
            value={passo}
            onChange={(e) => setPasso(e.target.value)}
            step="0.05"
            placeholder="Enter pitch"
          />
        </div>
      </div>
      
      <div>
        <button className="btn" onClick={calculateThread}>
          Calculate
        </button>
        <button className="btn btn-secondary" onClick={autoCalculatePitch}>
          Auto Pitch
        </button>
        <button className="btn btn-secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
      
      {results.re && (
        <div className="result-box">
          <h3>Results</h3>
          
          <div className="result-item" onClick={() => copyToClipboard(results.re)}>
            <span className="result-label">External Root Diameter (Re):</span>
            <span className="result-value">{results.re} mm</span>
          </div>
          
          <div className="result-item" onClick={() => copyToClipboard(results.ri)}>
            <span className="result-label">Internal Root Diameter (Ri):</span>
            <span className="result-value">{results.ri} mm</span>
          </div>
          
          <div className="result-item" onClick={() => copyToClipboard(results.afEx)}>
            <span className="result-label">External Thread Depth:</span>
            <span className="result-value">{results.afEx} mm</span>
          </div>
          
          <div className="result-item" onClick={() => copyToClipboard(results.afIn)}>
            <span className="result-label">Internal Thread Depth:</span>
            <span className="result-value">{results.afIn} mm</span>
          </div>
          
          <div className="result-item" onClick={() => copyToClipboard(results.dma)}>
            <span className="result-label">Mean Diameter:</span>
            <span className="result-value">{results.dma} mm</span>
          </div>
          
          <p className="info-text">Click on any result to copy to clipboard</p>
        </div>
      )}
    </div>
  );
}

export default ThreadCalculator;