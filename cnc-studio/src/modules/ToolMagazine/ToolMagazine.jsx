import React, { useState, useEffect, useRef } from 'react';
import { useToolContext } from '../shared/ToolContext';
import './ToolMagazine.css';

export const meta = {
  id: 'toolmagazine',
  name: 'Tool Magazine',
  area: 'right',
  order: 2,
  icon: '🔧',
};

// Magazine visualization component
const MagazineVisualization = ({ type, capacity, slots, currentSlot, onSlotClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    if (type === 'carousel' || type === 'turret') {
      // Draw carousel/turret magazine
      const angleStep = (2 * Math.PI) / capacity;
      
      for (let i = 0; i < capacity; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Draw slot
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        
        if (i === currentSlot) {
          ctx.fillStyle = '#4CAF50';
          ctx.fill();
        }
        
        if (slots[i]) {
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        
        // Draw slot number
        ctx.fillStyle = '#FFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), x, y);
      }
      
      // Draw center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#333';
      ctx.fill();
      ctx.strokeStyle = '#666';
      ctx.stroke();
      
    } else if (type === 'chain') {
      // Draw chain magazine
      const cols = Math.ceil(Math.sqrt(capacity));
      const rows = Math.ceil(capacity / cols);
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      
      for (let i = 0; i < capacity; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        
        ctx.beginPath();
        ctx.rect(x - 15, y - 15, 30, 30);
        
        if (i === currentSlot) {
          ctx.fillStyle = '#4CAF50';
          ctx.fill();
        }
        
        if (slots[i]) {
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        
        ctx.fillStyle = '#FFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), x, y);
      }
    }
  }, [type, capacity, slots, currentSlot]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200}
      className="magazine-canvas"
      onClick={(e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Calculate which slot was clicked based on position
        // This is simplified - you'd need more complex math for accurate detection
        onSlotClick && onSlotClick(Math.floor(Math.random() * capacity));
      }}
    />
  );
};

export default function ToolMagazineModule() {
  const {
    toolLibrary,
    magazine,
    setMagazine,
    currentTool,
    toolChangeState,
    loadToolInMagazine,
    unloadToolFromMagazine,
    changeToolTo,
    eventBus
  } = useToolContext();

  const [selectedSlot, setSelectedSlot] = useState(0);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedToolToLoad, setSelectedToolToLoad] = useState(null);
  const [atcMode, setAtcMode] = useState('manual'); // manual, semi-auto, auto
  const [magazineStats, setMagazineStats] = useState({
    totalTools: 0,
    emptySlots: 0,
    changeCount: 0,
    avgChangeTime: 0
  });

  // Update magazine stats
  useEffect(() => {
    const totalTools = Object.keys(magazine.slots).length;
    const emptySlots = magazine.capacity - totalTools;
    
    setMagazineStats(prev => ({
      ...prev,
      totalTools,
      emptySlots
    }));
  }, [magazine]);

  // Listen to tool change events
  useEffect(() => {
    const unsubscribe = eventBus.on('toolchange:complete', () => {
      setMagazineStats(prev => ({
        ...prev,
        changeCount: prev.changeCount + 1
      }));
    });
    return unsubscribe;
  }, [eventBus]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    
    if (atcMode === 'auto' && slot !== magazine.currentSlot) {
      // Auto tool change
      changeToolTo(slot);
    }
  };

  const handleLoadTool = () => {
    if (selectedToolToLoad && selectedSlot !== undefined) {
      const success = loadToolInMagazine(selectedToolToLoad, selectedSlot);
      if (success) {
        setShowLoadDialog(false);
        setSelectedToolToLoad(null);
      }
    }
  };

  const handleUnloadTool = () => {
    if (selectedSlot !== undefined && magazine.slots[selectedSlot]) {
      if (window.confirm(`Unload tool from slot ${selectedSlot}?`)) {
        unloadToolFromMagazine(selectedSlot);
      }
    }
  };

  const handleToolChange = () => {
    if (selectedSlot !== undefined) {
      changeToolTo(selectedSlot);
    }
  };

  const handleEmergencyStop = () => {
    // In a real system, this would trigger an emergency stop
    console.error('EMERGENCY STOP ACTIVATED');
    alert('Emergency Stop! Tool change aborted.');
  };

  // Quick access slots (commonly used tools)
  const quickAccessSlots = [0, 1, 2, 3, 4, 5];

  return (
    <div className="tool-magazine">
      {/* Magazine Status */}
      <div className="magazine-status">
        <div className="status-item">
          <span className="status-label">Current Tool</span>
          <span className="status-value">
            {currentTool ? `T${currentTool.number}` : 'Empty'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Magazine</span>
          <span className="status-value">
            {magazineStats.totalTools}/{magazine.capacity}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">ATC Mode</span>
          <select 
            value={atcMode} 
            onChange={(e) => setAtcMode(e.target.value)}
            className="status-select"
          >
            <option value="manual">Manual</option>
            <option value="semi-auto">Semi-Auto</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* Tool Change Progress */}
      {toolChangeState.isChanging && (
        <div className="tool-change-progress">
          <div className="progress-header">
            <span>Tool Change in Progress</span>
            <button onClick={handleEmergencyStop} className="btn-emergency">
              ⚠️ E-STOP
            </button>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${toolChangeState.progress}%` }}
            />
          </div>
          <div className="progress-stage">
            Stage: {toolChangeState.stage}
          </div>
        </div>
      )}

      {/* Magazine Configuration */}
      <div className="magazine-config">
        <label>
          Magazine Type
          <select 
            value={magazine.type}
            onChange={(e) => setMagazine({...magazine, type: e.target.value})}
          >
            <option value="carousel">Carousel</option>
            <option value="turret">Turret</option>
            <option value="chain">Chain</option>
            <option value="rack">Rack</option>
          </select>
        </label>
        <label>
          Capacity
          <input
            type="number"
            value={magazine.capacity}
            onChange={(e) => setMagazine({...magazine, capacity: parseInt(e.target.value)})}
            min="1"
            max="99"
          />
        </label>
        <label>
          Change Time (s)
          <input
            type="number"
            step="0.1"
            value={magazine.changeTime}
            onChange={(e) => setMagazine({...magazine, changeTime: parseFloat(e.target.value)})}
          />
        </label>
      </div>

      {/* Magazine Visualization */}
      <div className="magazine-visual">
        <MagazineVisualization
          type={magazine.type}
          capacity={magazine.capacity}
          slots={magazine.slots}
          currentSlot={magazine.currentSlot}
          onSlotClick={handleSlotSelect}
        />
      </div>

      {/* Quick Access */}
      <div className="quick-access">
        <h4>Quick Access</h4>
        <div className="quick-slots">
          {quickAccessSlots.map(slot => (
            <button
              key={slot}
              onClick={() => handleSlotSelect(slot)}
              className={`quick-slot ${magazine.currentSlot === slot ? 'current' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
              title={magazine.slots[slot] ? `T${magazine.slots[slot].number} - ${magazine.slots[slot].name}` : 'Empty'}
            >
              <div className="slot-number">#{slot}</div>
              <div className="slot-tool">
                {magazine.slots[slot] ? `T${magazine.slots[slot].number}` : '—'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Details */}
      <div className="slot-details">
        <h4>Slot #{selectedSlot}</h4>
        {magazine.slots[selectedSlot] ? (
          <div className="tool-in-slot">
            <div className="tool-info">
              <strong>T{magazine.slots[selectedSlot].number}</strong>
              <span>{magazine.slots[selectedSlot].name || 'Unnamed Tool'}</span>
            </div>
            <div className="tool-specs">
              <span>Ø{magazine.slots[selectedSlot].diameter}mm</span>
              <span>{magazine.slots[selectedSlot].flutes}F</span>
              <span>{magazine.slots[selectedSlot].type}</span>
            </div>
            <div className="slot-actions">
              <button 
                onClick={handleToolChange}
                disabled={toolChangeState.isChanging || magazine.currentSlot === selectedSlot}
                className="btn-primary"
              >
                Load Tool
              </button>
              <button 
                onClick={handleUnloadTool}
                disabled={magazine.currentSlot === selectedSlot}
                className="btn-secondary"
              >
                Unload
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-slot">
            <p>Empty Slot</p>
            <button 
              onClick={() => setShowLoadDialog(true)}
              className="btn-primary"
            >
              Load Tool
            </button>
          </div>
        )}
      </div>

      {/* Load Tool Dialog */}
      {showLoadDialog && (
        <div className="load-dialog">
          <div className="dialog-content">
            <h3>Load Tool into Slot #{selectedSlot}</h3>
            <div className="tool-list">
              {toolLibrary.map(tool => (
                <div
                  key={tool.id}
                  className={`tool-option ${selectedToolToLoad === tool.id ? 'selected' : ''}`}
                  onClick={() => setSelectedToolToLoad(tool.id)}
                >
                  <strong>T{tool.number}</strong>
                  <span>{tool.name || `${tool.type} Ø${tool.diameter}mm`}</span>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button onClick={handleLoadTool} className="btn-primary">Load</button>
              <button onClick={() => setShowLoadDialog(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Magazine Statistics */}
      <div className="magazine-stats">
        <h4>Statistics</h4>
        <div className="stats-grid">
          <div className="stat">
            <span>Tool Changes</span>
            <strong>{magazineStats.changeCount}</strong>
          </div>
          <div className="stat">
            <span>Empty Slots</span>
            <strong>{magazineStats.emptySlots}</strong>
          </div>
          <div className="stat">
            <span>Utilization</span>
            <strong>{((magazineStats.totalTools / magazine.capacity) * 100).toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      {/* Tool Constraints */}
      <div className="tool-constraints">
        <h4>Constraints</h4>
        <div className="constraint-list">
          <div className="constraint">
            <span>Max Diameter</span>
            <strong>{magazine.maxToolDiameter}mm</strong>
          </div>
          <div className="constraint">
            <span>Max Length</span>
            <strong>{magazine.maxToolLength}mm</strong>
          </div>
          <div className="constraint">
            <span>Max Weight</span>
            <strong>{magazine.maxToolWeight}kg</strong>
          </div>
        </div>
      </div>
    </div>
  );
}