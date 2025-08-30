import React, { useState, useRef } from 'react';

export default function MachinePresets({ 
  presets, 
  onLoad, 
  onSave, 
  onDelete, 
  onExport, 
  onImport,
  currentMachine 
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file)
        .then(() => {
          alert('Configuration imported successfully!');
        })
        .catch(error => {
          alert('Failed to import configuration: ' + error.message);
        });
    }
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="machine-presets">
      <div className="presets-header">
        <h3>Saved Configurations</h3>
        <div className="presets-actions">
          <button 
            className="btn-action"
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentMachine}
            title="Save current configuration"
          >
            💾 Save
          </button>
          <button 
            className="btn-action"
            onClick={onExport}
            disabled={!currentMachine}
            title="Export configuration to file"
          >
            📤 Export
          </button>
          <button 
            className="btn-action"
            onClick={() => fileInputRef.current?.click()}
            title="Import configuration from file"
          >
            📥 Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {showSaveDialog && (
        <div className="save-dialog">
          <input
            type="text"
            placeholder="Enter preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
        </div>
      )}

      <div className="presets-list">
        {presets.length === 0 ? (
          <div className="no-presets">
            No saved configurations yet.
          </div>
        ) : (
          presets.map(preset => (
            <div key={preset.id} className="preset-item">
              <div className="preset-info">
                <div className="preset-name">{preset.name}</div>
                <div className="preset-meta">
                  {preset.type} • {preset.axes?.length || 0} axes
                  {preset.savedAt && (
                    <span className="preset-date">
                      {' • '}
                      {new Date(preset.savedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="preset-actions">
                <button 
                  className="btn-load"
                  onClick={() => onLoad(preset.id)}
                  title="Load this configuration"
                >
                  Load
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => {
                    if (confirm(`Delete preset "${preset.name}"?`)) {
                      onDelete(preset.id);
                    }
                  }}
                  title="Delete this preset"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .machine-presets {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          background: #f9f9f9;
        }

        .presets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .presets-header h3 {
          margin: 0;
        }

        .presets-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          background: white;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .btn-action:hover:not(:disabled) {
          background: #f0f0f0;
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-dialog {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          padding: 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #4CAF50;
        }

        .save-dialog input {
          flex: 1;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        .save-dialog button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
        }

        .presets-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .no-presets {
          text-align: center;
          padding: 24px;
          color: #666;
        }

        .preset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 4px;
          margin-bottom: 8px;
          border: 1px solid #e0e0e0;
        }

        .preset-item:hover {
          border-color: #4CAF50;
        }

        .preset-info {
          flex: 1;
        }

        .preset-name {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .preset-meta {
          font-size: 12px;
          color: #666;
        }

        .preset-date {
          color: #999;
        }

        .preset-actions {
          display: flex;
          gap: 8px;
        }

        .btn-load {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-load:hover {
          background: #45a049;
        }

        .btn-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }

        .btn-delete:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}