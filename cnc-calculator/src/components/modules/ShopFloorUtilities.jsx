import React, { useState, useEffect } from 'react';

function ShopFloorUtilities() {
  const [activeTab, setActiveTab] = useState('timer');
  
  // Production Timer
  const [timer, setTimer] = useState({
    isRunning: false,
    startTime: null,
    elapsed: 0,
    partCount: 0,
    cycleTime: 0,
    targetCycleTime: 60
  });
  
  // Shift Production Tracker
  const [production, setProduction] = useState({
    shiftTarget: 100,
    partsCompleted: 0,
    goodParts: 0,
    scrapParts: 0,
    downtime: 0,
    shiftHours: 8,
    efficiency: 0
  });
  
  // Tool Life Manager
  const [tools, setTools] = useState([
    { id: 1, name: 'End Mill 10mm', currentLife: 450, maxLife: 480, unit: 'min', status: 'good' },
    { id: 2, name: 'Drill 8.5mm', currentLife: 280, maxLife: 300, unit: 'holes', status: 'warning' },
    { id: 3, name: 'Face Mill 50mm', currentLife: 180, maxLife: 240, unit: 'min', status: 'good' }
  ]);
  
  // Maintenance Schedule
  const [maintenance, setMaintenance] = useState([
    { task: 'Spindle Bearing Grease', interval: 500, current: 450, unit: 'hours', status: 'due-soon' },
    { task: 'Way Oil Level', interval: 40, current: 38, unit: 'hours', status: 'due-soon' },
    { task: 'Coolant Concentration', interval: 168, current: 120, unit: 'hours', status: 'ok' },
    { task: 'Filter Replacement', interval: 720, current: 650, unit: 'hours', status: 'ok' }
  ]);
  
  // Quality Control
  const [quality, setQuality] = useState({
    measurements: [],
    nominal: 25.0,
    upperTol: 0.05,
    lowerTol: -0.05,
    cpk: 0,
    average: 0,
    stdDev: 0
  });
  
  // Timer functions
  useEffect(() => {
    let interval;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsed: Date.now() - prev.startTime
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);
  
  const startTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: Date.now() - prev.elapsed
    }));
  };
  
  const stopTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false
    }));
  };
  
  const resetTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      elapsed: 0,
      startTime: null,
      cycleTime: prev.elapsed
    }));
  };
  
  const addPart = () => {
    setTimer(prev => ({
      ...prev,
      partCount: prev.partCount + 1,
      cycleTime: prev.elapsed,
      elapsed: 0,
      startTime: Date.now()
    }));
    setProduction(prev => ({
      ...prev,
      partsCompleted: prev.partsCompleted + 1,
      goodParts: prev.goodParts + 1
    }));
  };
  
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };
  
  // Calculate production efficiency
  useEffect(() => {
    const efficiency = production.shiftTarget > 0 
      ? (production.goodParts / production.shiftTarget * 100).toFixed(1)
      : 0;
    setProduction(prev => ({ ...prev, efficiency }));
  }, [production.goodParts, production.shiftTarget]);
  
  // Add quality measurement
  const addMeasurement = (value) => {
    const newMeasurements = [...quality.measurements, parseFloat(value)];
    const avg = newMeasurements.reduce((a, b) => a + b, 0) / newMeasurements.length;
    const stdDev = Math.sqrt(
      newMeasurements.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / newMeasurements.length
    );
    
    // Calculate Cpk
    const usl = quality.nominal + quality.upperTol;
    const lsl = quality.nominal + quality.lowerTol;
    const cpu = (usl - avg) / (3 * stdDev);
    const cpl = (avg - lsl) / (3 * stdDev);
    const cpk = Math.min(cpu, cpl);
    
    setQuality({
      ...quality,
      measurements: newMeasurements,
      average: avg,
      stdDev: stdDev,
      cpk: isNaN(cpk) ? 0 : cpk
    });
  };
  
  // Update tool life
  const updateToolLife = (toolId, minutes) => {
    setTools(prev => prev.map(tool => {
      if (tool.id === toolId) {
        const newLife = tool.currentLife + minutes;
        const percentage = (newLife / tool.maxLife) * 100;
        const status = percentage >= 90 ? 'critical' : percentage >= 75 ? 'warning' : 'good';
        return { ...tool, currentLife: newLife, status };
      }
      return tool;
    }));
  };
  
  return (
    <div className="calculator-section">
      <h2>Shop Floor Utilities</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          Production Timer
        </button>
        <button 
          className={`tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          Shift Tracker
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Tool Life
        </button>
        <button 
          className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance
        </button>
        <button 
          className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Quality Control
        </button>
      </div>
      
      {activeTab === 'timer' && (
        <div className="tab-content">
          <h3>Production Timer</h3>
          
          <div className="timer-display" style={{
            fontSize: '48px',
            fontFamily: 'monospace',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: timer.isRunning ? '#1a1a1a' : '#2a2a2a',
            color: timer.elapsed > timer.targetCycleTime * 1000 ? '#ff6666' : '#66ff66',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            {formatTime(timer.elapsed)}
          </div>
          
          <div className="form-row">
            <button 
              className="btn"
              onClick={timer.isRunning ? stopTimer : startTimer}
              style={{ backgroundColor: timer.isRunning ? '#ff4444' : '#44ff44' }}
            >
              {timer.isRunning ? '⏸ Stop' : '▶ Start'}
            </button>
            <button className="btn" onClick={resetTimer}>⏹ Reset</button>
            <button className="btn" onClick={addPart}>✓ Part Complete</button>
          </div>
          
          <div className="form-row">
            <div className="stat-box">
              <label>Parts Count</label>
              <div className="stat-value">{timer.partCount}</div>
            </div>
            <div className="stat-box">
              <label>Last Cycle</label>
              <div className="stat-value">{formatTime(timer.cycleTime)}</div>
            </div>
            <div className="stat-box">
              <label>Target Cycle</label>
              <input
                type="number"
                value={timer.targetCycleTime}
                onChange={(e) => setTimer(prev => ({ ...prev, targetCycleTime: parseInt(e.target.value) }))}
                style={{ width: '80px' }}
              /> sec
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tracker' && (
        <div className="tab-content">
          <h3>Shift Production Tracker</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Shift Target</label>
              <input
                type="number"
                value={production.shiftTarget}
                onChange={(e) => setProduction(prev => ({ ...prev, shiftTarget: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>Shift Hours</label>
              <input
                type="number"
                value={production.shiftHours}
                onChange={(e) => setProduction(prev => ({ ...prev, shiftHours: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="production-stats">
            <div className="stat-card" style={{ backgroundColor: '#2a4a2a' }}>
              <h4>Good Parts</h4>
              <div className="big-number">{production.goodParts}</div>
              <button 
                className="small-button"
                onClick={() => setProduction(prev => ({ ...prev, goodParts: prev.goodParts + 1, partsCompleted: prev.partsCompleted + 1 }))}
              >
                +1
              </button>
            </div>
            
            <div className="stat-card" style={{ backgroundColor: '#4a2a2a' }}>
              <h4>Scrap Parts</h4>
              <div className="big-number">{production.scrapParts}</div>
              <button 
                className="small-button"
                onClick={() => setProduction(prev => ({ ...prev, scrapParts: prev.scrapParts + 1, partsCompleted: prev.partsCompleted + 1 }))}
              >
                +1
              </button>
            </div>
            
            <div className="stat-card">
              <h4>Efficiency</h4>
              <div className="big-number">{production.efficiency}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(production.efficiency, 100)}%`,
                    backgroundColor: production.efficiency >= 85 ? '#44ff44' : production.efficiency >= 70 ? '#ffaa44' : '#ff4444'
                  }}
                />
              </div>
            </div>
            
            <div className="stat-card">
              <h4>OEE Score</h4>
              <div className="big-number">
                {((production.goodParts / production.partsCompleted || 0) * (production.efficiency / 100) * 0.95).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <button 
              className="btn"
              onClick={() => setProduction({
                shiftTarget: 100,
                partsCompleted: 0,
                goodParts: 0,
                scrapParts: 0,
                downtime: 0,
                shiftHours: 8,
                efficiency: 0
              })}
            >
              Reset Shift
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'tools' && (
        <div className="tab-content">
          <h3>Tool Life Manager</h3>
          
          <div className="tool-list">
            {tools.map(tool => (
              <div key={tool.id} className="tool-item" style={{
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                borderLeft: `4px solid ${
                  tool.status === 'critical' ? '#ff4444' : 
                  tool.status === 'warning' ? '#ffaa44' : '#44ff44'
                }`
              }}>
                <h4>{tool.name}</h4>
                <div className="form-row">
                  <div>
                    {tool.currentLife} / {tool.maxLife} {tool.unit}
                  </div>
                  <div>
                    {((tool.currentLife / tool.maxLife) * 100).toFixed(1)}% used
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: '10px' }}>
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(tool.currentLife / tool.maxLife) * 100}%`,
                      backgroundColor: 
                        tool.status === 'critical' ? '#ff4444' : 
                        tool.status === 'warning' ? '#ffaa44' : '#44ff44'
                    }}
                  />
                </div>
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <button 
                    className="small-button"
                    onClick={() => updateToolLife(tool.id, 10)}
                  >
                    +10 {tool.unit}
                  </button>
                  <button 
                    className="small-button"
                    onClick={() => setTools(prev => prev.map(t => 
                      t.id === tool.id ? { ...t, currentLife: 0, status: 'good' } : t
                    ))}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'maintenance' && (
        <div className="tab-content">
          <h3>Maintenance Schedule</h3>
          
          <div className="maintenance-list">
            {maintenance.map((task, index) => (
              <div key={index} className="maintenance-item" style={{
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                borderLeft: `4px solid ${
                  task.status === 'overdue' ? '#ff4444' : 
                  task.status === 'due-soon' ? '#ffaa44' : '#44ff44'
                }`
              }}>
                <h4>{task.task}</h4>
                <div className="form-row">
                  <div>
                    {task.current} / {task.interval} {task.unit}
                  </div>
                  <div>
                    Next in: {task.interval - task.current} {task.unit}
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: '10px' }}>
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(task.current / task.interval) * 100}%`,
                      backgroundColor: 
                        task.current >= task.interval ? '#ff4444' : 
                        task.current >= task.interval * 0.9 ? '#ffaa44' : '#44ff44'
                    }}
                  />
                </div>
                <button 
                  className="small-button"
                  style={{ marginTop: '10px' }}
                  onClick={() => setMaintenance(prev => prev.map((t, i) => 
                    i === index ? { ...t, current: 0, status: 'ok' } : t
                  ))}
                >
                  Mark Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'quality' && (
        <div className="tab-content">
          <h3>Quality Control - SPC</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nominal Value</label>
              <input
                type="number"
                value={quality.nominal}
                onChange={(e) => setQuality(prev => ({ ...prev, nominal: parseFloat(e.target.value) }))}
                step="0.001"
              />
            </div>
            <div className="form-group">
              <label>Upper Tolerance</label>
              <input
                type="number"
                value={quality.upperTol}
                onChange={(e) => setQuality(prev => ({ ...prev, upperTol: parseFloat(e.target.value) }))}
                step="0.001"
              />
            </div>
            <div className="form-group">
              <label>Lower Tolerance</label>
              <input
                type="number"
                value={quality.lowerTol}
                onChange={(e) => setQuality(prev => ({ ...prev, lowerTol: parseFloat(e.target.value) }))}
                step="0.001"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Add Measurement</label>
              <input
                type="number"
                step="0.001"
                id="measurement-input"
                placeholder="Enter value"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addMeasurement(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <button 
              className="btn"
              onClick={() => {
                const input = document.getElementById('measurement-input');
                if (input.value) {
                  addMeasurement(input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </button>
          </div>
          
          <div className="quality-stats">
            <div className="stat-card">
              <h4>Sample Size</h4>
              <div className="big-number">{quality.measurements.length}</div>
            </div>
            <div className="stat-card">
              <h4>Average</h4>
              <div className="big-number">{quality.average.toFixed(4)}</div>
            </div>
            <div className="stat-card">
              <h4>Std Dev</h4>
              <div className="big-number">{quality.stdDev.toFixed(4)}</div>
            </div>
            <div className="stat-card" style={{
              backgroundColor: quality.cpk >= 1.33 ? '#2a4a2a' : 
                             quality.cpk >= 1.0 ? '#4a4a2a' : '#4a2a2a'
            }}>
              <h4>Cpk</h4>
              <div className="big-number">{quality.cpk.toFixed(3)}</div>
              <small>
                {quality.cpk >= 1.33 ? 'Excellent' : 
                 quality.cpk >= 1.0 ? 'Capable' : 'Needs Improvement'}
              </small>
            </div>
          </div>
          
          <div className="measurements-list" style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            <h4>Recent Measurements</h4>
            {quality.measurements.slice(-10).reverse().map((val, idx) => (
              <div key={idx} style={{ 
                padding: '5px',
                backgroundColor: idx === 0 ? '#3a3a3a' : 'transparent'
              }}>
                #{quality.measurements.length - idx}: {val.toFixed(4)} 
                {val > quality.nominal + quality.upperTol || val < quality.nominal + quality.lowerTol ? 
                  <span style={{ color: '#ff4444' }}> (OUT OF SPEC)</span> : 
                  <span style={{ color: '#44ff44' }}> ✓</span>
                }
              </div>
            ))}
          </div>
          
          <button 
            className="btn"
            onClick={() => setQuality({
              measurements: [],
              nominal: 25.0,
              upperTol: 0.05,
              lowerTol: -0.05,
              cpk: 0,
              average: 0,
              stdDev: 0
            })}
          >
            Clear Data
          </button>
        </div>
      )}
      
      <style jsx>{`
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        
        .tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        
        .tab:hover {
          color: #aaa;
        }
        
        .tab.active {
          color: #fff;
          border-bottom-color: #4CAF50;
        }
        
        .tab-content {
          padding: 20px;
        }
        
        .stat-box {
          padding: 15px;
          background: #2a2a2a;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          margin-top: 10px;
        }
        
        .production-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .stat-card {
          padding: 20px;
          background: #2a2a2a;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-card h4 {
          margin: 0 0 10px 0;
          color: #888;
        }
        
        .big-number {
          font-size: 36px;
          font-weight: bold;
          color: #fff;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #1a1a1a;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
        }
        
        .small-button {
          padding: 5px 10px;
          font-size: 12px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .small-button:hover {
          background: #444;
        }
        
        .quality-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}

export default ShopFloorUtilities;