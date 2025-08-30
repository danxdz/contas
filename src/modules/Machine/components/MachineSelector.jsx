import React, { useState } from 'react';
import { machinePresets } from '../config/machinePresets';

export default function MachineSelector({ onSelect, currentMachine }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handlePresetSelect = (preset) => {
    onSelect(preset);
    setShowCustom(false);
  };

  const handleCreateCustom = () => {
    if (customName.trim()) {
      const customMachine = {
        id: `custom_${Date.now()}`,
        name: customName,
        type: 'custom',
        axes: [],
        controller: null,
        specifications: {
          workEnvelope: { x: 500, y: 400, z: 300 },
          spindleSpeed: { min: 100, max: 20000 },
          feedRate: { max: 10000 },
          rapidRate: { max: 30000 }
        }
      };
      onSelect(customMachine);
      setCustomName('');
      setShowCustom(false);
    }
  };

  return (
    <div className="machine-selector">
      <h3>Machine Configuration</h3>
      
      <div className="preset-machines">
        <h4>Preset Machines</h4>
        <div className="machine-grid">
          {Object.entries(machinePresets).map(([key, preset]) => (
            <div 
              key={key}
              className={`machine-card ${currentMachine?.id === preset.id ? 'selected' : ''}`}
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="machine-icon">{preset.icon}</div>
              <div className="machine-name">{preset.name}</div>
              <div className="machine-type">{preset.type}</div>
              <div className="machine-axes">
                {preset.axes.map(axis => axis.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-machine">
        <button 
          className="btn-custom"
          onClick={() => setShowCustom(!showCustom)}
        >
          + Create Custom Machine
        </button>
        
        {showCustom && (
          <div className="custom-form">
            <input
              type="text"
              placeholder="Machine Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <button onClick={handleCreateCustom}>Create</button>
            <button onClick={() => setShowCustom(false)}>Cancel</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .machine-selector {
          padding: 16px;
        }

        .machine-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin: 12px 0;
        }

        .machine-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .machine-card:hover {
          border-color: #4CAF50;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .machine-card.selected {
          border-color: #4CAF50;
          background: #f0f8f0;
        }

        .machine-icon {
          font-size: 32px;
          text-align: center;
          margin-bottom: 8px;
        }

        .machine-name {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .machine-type {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .machine-axes {
          font-size: 11px;
          color: #888;
        }

        .custom-machine {
          margin-top: 20px;
        }

        .btn-custom {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .custom-form {
          margin-top: 12px;
          display: flex;
          gap: 8px;
        }

        .custom-form input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .custom-form button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}