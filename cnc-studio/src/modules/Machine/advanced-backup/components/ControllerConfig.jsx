import React, { useState } from 'react';
import { controllerPresets } from '../config/controllerPresets';

export default function ControllerConfig({ machine, onControllerUpdate }) {
  const [customParams, setCustomParams] = useState(machine?.controller?.customParams || {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleControllerSelect = (controllerId) => {
    const controller = controllerPresets[controllerId];
    if (controller) {
      onControllerUpdate({
        ...controller,
        customParams: { ...controller.defaultParams }
      });
    }
  };

  const handleParamUpdate = (param, value) => {
    const updatedParams = { ...customParams, [param]: value };
    setCustomParams(updatedParams);
    onControllerUpdate({
      ...machine.controller,
      customParams: updatedParams
    });
  };

  const currentController = machine?.controller;

  return (
    <div className="controller-config">
      <h3>Controller Configuration</h3>

      <div className="controller-selector">
        <label>
          Controller Type:
          <select 
            value={currentController?.id || ''}
            onChange={(e) => handleControllerSelect(e.target.value)}
          >
            <option value="">Select Controller</option>
            {Object.entries(controllerPresets).map(([id, controller]) => (
              <option key={id} value={id}>
                {controller.name} - {controller.manufacturer}
              </option>
            ))}
          </select>
        </label>
      </div>

      {currentController && (
        <div className="controller-details">
          <div className="controller-info">
            <div className="info-row">
              <span className="label">Manufacturer:</span>
              <span className="value">{currentController.manufacturer}</span>
            </div>
            <div className="info-row">
              <span className="label">Model:</span>
              <span className="value">{currentController.model}</span>
            </div>
            <div className="info-row">
              <span className="label">Protocol:</span>
              <span className="value">{currentController.protocol}</span>
            </div>
          </div>

          <div className="controller-params">
            <h4>Basic Parameters</h4>
            <div className="params-grid">
              <label>
                Baud Rate:
                <select 
                  value={customParams.baudRate || currentController.defaultParams?.baudRate || 9600}
                  onChange={(e) => handleParamUpdate('baudRate', parseInt(e.target.value))}
                >
                  <option value="9600">9600</option>
                  <option value="19200">19200</option>
                  <option value="38400">38400</option>
                  <option value="57600">57600</option>
                  <option value="115200">115200</option>
                </select>
              </label>

              <label>
                Data Bits:
                <select 
                  value={customParams.dataBits || currentController.defaultParams?.dataBits || 8}
                  onChange={(e) => handleParamUpdate('dataBits', parseInt(e.target.value))}
                >
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </label>

              <label>
                Stop Bits:
                <select 
                  value={customParams.stopBits || currentController.defaultParams?.stopBits || 1}
                  onChange={(e) => handleParamUpdate('stopBits', parseInt(e.target.value))}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </label>

              <label>
                Parity:
                <select 
                  value={customParams.parity || currentController.defaultParams?.parity || 'none'}
                  onChange={(e) => handleParamUpdate('parity', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="even">Even</option>
                  <option value="odd">Odd</option>
                </select>
              </label>
            </div>
          </div>

          <div className="advanced-section">
            <button 
              className="btn-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </button>

            {showAdvanced && (
              <div className="advanced-params">
                <label>
                  <input
                    type="checkbox"
                    checked={customParams.enableMacros || false}
                    onChange={(e) => handleParamUpdate('enableMacros', e.target.checked)}
                  />
                  Enable Macros
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={customParams.enableSubprograms || false}
                    onChange={(e) => handleParamUpdate('enableSubprograms', e.target.checked)}
                  />
                  Enable Subprograms
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={customParams.enableToolCompensation || false}
                    onChange={(e) => handleParamUpdate('enableToolCompensation', e.target.checked)}
                  />
                  Enable Tool Compensation
                </label>

                <label>
                  Buffer Size (KB):
                  <input
                    type="number"
                    value={customParams.bufferSize || 64}
                    onChange={(e) => handleParamUpdate('bufferSize', parseInt(e.target.value))}
                  />
                </label>

                <label>
                  Timeout (ms):
                  <input
                    type="number"
                    value={customParams.timeout || 5000}
                    onChange={(e) => handleParamUpdate('timeout', parseInt(e.target.value))}
                  />
                </label>

                <label>
                  Custom G-Code Prefix:
                  <input
                    type="text"
                    value={customParams.gcodePrefix || ''}
                    onChange={(e) => handleParamUpdate('gcodePrefix', e.target.value)}
                    placeholder="e.g., %"
                  />
                </label>

                <label>
                  Custom G-Code Suffix:
                  <input
                    type="text"
                    value={customParams.gcodeSuffix || ''}
                    onChange={(e) => handleParamUpdate('gcodeSuffix', e.target.value)}
                    placeholder="e.g., M30"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .controller-config {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          background: #f9f9f9;
        }

        .controller-config h3 {
          margin-top: 0;
        }

        .controller-selector label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .controller-selector select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .controller-details {
          margin-top: 16px;
        }

        .controller-info {
          background: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }

        .info-row .label {
          font-weight: bold;
          color: #666;
        }

        .controller-params h4 {
          margin-bottom: 12px;
        }

        .params-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          background: white;
          padding: 12px;
          border-radius: 4px;
        }

        .params-grid label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
        }

        .params-grid select,
        .params-grid input {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        .advanced-section {
          margin-top: 16px;
        }

        .btn-advanced {
          background: #f0f0f0;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .advanced-params {
          margin-top: 12px;
          background: white;
          padding: 16px;
          border-radius: 4px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .advanced-params label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }

        .advanced-params input[type="checkbox"] {
          margin-right: 4px;
        }

        .advanced-params input[type="number"],
        .advanced-params input[type="text"] {
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}