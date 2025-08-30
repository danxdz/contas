import React, { useState } from 'react';
import MachineSelector from './components/MachineSelector';
import AxisTree from './components/AxisTree';
import ControllerConfig from './components/ControllerConfig';
import MachinePresets from './components/MachinePresets';
import { useMachineState } from './hooks/useMachineState';

export default function MachineModule() {
  const [activeTab, setActiveTab] = useState('config');
  const {
    machine,
    setMachine,
    updateAxes,
    updateController,
    updateSpecifications,
    presets,
    saveAsPreset,
    loadPreset,
    deletePreset,
    exportConfiguration,
    importConfiguration,
    resetConfiguration
  } = useMachineState();

  return (
    <div className="machine-module">
      <div className="module-header">
        <h2>🏭 Machine Configuration</h2>
        {machine && (
          <button 
            className="btn-reset"
            onClick={() => {
              if (confirm('Reset all machine configuration?')) {
                resetConfiguration();
              }
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button 
          className={`tab ${activeTab === 'axes' ? 'active' : ''}`}
          onClick={() => setActiveTab('axes')}
        >
          Axes Setup
        </button>
        <button 
          className={`tab ${activeTab === 'controller' ? 'active' : ''}`}
          onClick={() => setActiveTab('controller')}
        >
          Controller
        </button>
        <button 
          className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'config' && (
          <div className="config-tab">
            <MachineSelector 
              onSelect={setMachine}
              currentMachine={machine}
            />
            
            {machine && (
              <div className="specifications">
                <h3>Machine Specifications</h3>
                <div className="spec-grid">
                  <div className="spec-group">
                    <h4>Work Envelope</h4>
                    <label>
                      X (mm):
                      <input
                        type="number"
                        value={machine.specifications?.workEnvelope?.x || 0}
                        onChange={(e) => updateSpecifications({
                          workEnvelope: {
                            ...machine.specifications?.workEnvelope,
                            x: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                    <label>
                      Y (mm):
                      <input
                        type="number"
                        value={machine.specifications?.workEnvelope?.y || 0}
                        onChange={(e) => updateSpecifications({
                          workEnvelope: {
                            ...machine.specifications?.workEnvelope,
                            y: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                    <label>
                      Z (mm):
                      <input
                        type="number"
                        value={machine.specifications?.workEnvelope?.z || 0}
                        onChange={(e) => updateSpecifications({
                          workEnvelope: {
                            ...machine.specifications?.workEnvelope,
                            z: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                  </div>

                  <div className="spec-group">
                    <h4>Spindle</h4>
                    <label>
                      Min Speed (RPM):
                      <input
                        type="number"
                        value={machine.specifications?.spindleSpeed?.min || 0}
                        onChange={(e) => updateSpecifications({
                          spindleSpeed: {
                            ...machine.specifications?.spindleSpeed,
                            min: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                    <label>
                      Max Speed (RPM):
                      <input
                        type="number"
                        value={machine.specifications?.spindleSpeed?.max || 0}
                        onChange={(e) => updateSpecifications({
                          spindleSpeed: {
                            ...machine.specifications?.spindleSpeed,
                            max: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                  </div>

                  <div className="spec-group">
                    <h4>Feed Rates</h4>
                    <label>
                      Max Feed (mm/min):
                      <input
                        type="number"
                        value={machine.specifications?.feedRate?.max || 0}
                        onChange={(e) => updateSpecifications({
                          feedRate: {
                            ...machine.specifications?.feedRate,
                            max: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                    <label>
                      Max Rapid (mm/min):
                      <input
                        type="number"
                        value={machine.specifications?.rapidRate?.max || 0}
                        onChange={(e) => updateSpecifications({
                          rapidRate: {
                            ...machine.specifications?.rapidRate,
                            max: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </label>
                  </div>

                  <div className="spec-group">
                    <h4>Tool Changer</h4>
                    <label>
                      Tool Capacity:
                      <input
                        type="number"
                        value={machine.specifications?.toolCapacity || 0}
                        onChange={(e) => updateSpecifications({
                          toolCapacity: parseInt(e.target.value)
                        })}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'axes' && (
          <div className="axes-tab">
            {machine ? (
              <AxisTree 
                machine={machine}
                onAxisUpdate={updateAxes}
              />
            ) : (
              <div className="no-machine">
                Please select or create a machine first.
              </div>
            )}
          </div>
        )}

        {activeTab === 'controller' && (
          <div className="controller-tab">
            {machine ? (
              <ControllerConfig 
                machine={machine}
                onControllerUpdate={updateController}
              />
            ) : (
              <div className="no-machine">
                Please select or create a machine first.
              </div>
            )}
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="presets-tab">
            <MachinePresets 
              presets={presets}
              onLoad={loadPreset}
              onSave={saveAsPreset}
              onDelete={deletePreset}
              onExport={exportConfiguration}
              onImport={importConfiguration}
              currentMachine={machine}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .machine-module {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #ddd;
        }

        .module-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .btn-reset {
          background: #f44336;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          background: #f5f5f5;
        }

        .tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #e0e0e0;
        }

        .tab.active {
          background: white;
          border-bottom-color: #4CAF50;
          font-weight: bold;
        }

        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .specifications {
          margin-top: 24px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .specifications h3 {
          margin-top: 0;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .spec-group {
          background: white;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .spec-group h4 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 14px;
        }

        .spec-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .spec-group input {
          width: 100px;
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        .no-machine {
          text-align: center;
          padding: 48px;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}