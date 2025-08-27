import React, { useState, useEffect } from 'react';
import './MachineConfigurator.css';

const MachineConfigurator = ({ onMachineSelect, currentMachine }) => {
  // Default machine templates
  const defaultTemplates = {
    '3axis-mill-standard': {
      id: '3axis-mill-standard',
      name: 'Standard 3-Axis Mill',
      type: '3axis-mill',
      isTemplate: true,
      specs: {
        // Travel limits
        xTravel: 500,
        yTravel: 400,
        zTravel: 300,
        
        // Spindle specs
        maxRPM: 10000,
        minRPM: 100,
        spindlePower: 5.5, // kW
        toolCapacity: 20,
        
        // Feed rates
        maxFeedRate: 5000, // mm/min
        rapidFeedRate: 10000, // mm/min
        
        // Table
        tableWidth: 600,
        tableLength: 400,
        maxTableLoad: 200, // kg
        tSlots: 5,
        tSlotWidth: 14, // mm
        
        // Accuracy
        positioning: 0.005, // mm
        repeatability: 0.003, // mm
        
        // Tool specs
        maxToolDiameter: 80,
        maxToolLength: 200,
        toolChangeTime: 3, // seconds
        
        // Coolant
        coolantTank: 100, // liters
        coolantTypes: ['Flood', 'Mist', 'Through-spindle'],
        
        // Work envelope
        workpieceMaxHeight: 250,
        workpieceMaxWeight: 150, // kg
      },
      colors: {
        table: '#555555',
        vise: '#4444ff',
        workpiece: '#ccaa88',
        tool: '#ffaa00'
      }
    },
    '5axis-mill-standard': {
      id: '5axis-mill-standard',
      name: 'Standard 5-Axis Mill',
      type: '5axis-mill',
      isTemplate: true,
      specs: {
        xTravel: 700,
        yTravel: 500,
        zTravel: 500,
        aRotation: 120, // degrees
        bRotation: 360, // degrees
        
        maxRPM: 15000,
        minRPM: 50,
        spindlePower: 11, // kW
        toolCapacity: 40,
        
        maxFeedRate: 10000,
        rapidFeedRate: 20000,
        
        tableWidth: 500,
        tableLength: 500,
        maxTableLoad: 300,
        
        positioning: 0.003,
        repeatability: 0.002,
        
        maxToolDiameter: 100,
        maxToolLength: 300,
        toolChangeTime: 2.5,
        
        coolantTank: 200,
        coolantTypes: ['Flood', 'Mist', 'Through-spindle', 'High-pressure'],
        
        workpieceMaxHeight: 400,
        workpieceMaxWeight: 250,
        
        // 5-axis specific
        trunnionType: 'Tilting-rotary',
        simultaneousAxes: true,
        maxTiltSpeed: 30, // rpm
        maxRotarySpeed: 50, // rpm
      },
      colors: {
        table: '#666666',
        vise: '#5555ff',
        workpiece: '#bbaa99',
        tool: '#ff9900'
      }
    },
    'lathe-standard': {
      id: 'lathe-standard',
      name: 'Standard CNC Lathe',
      type: 'lathe',
      isTemplate: true,
      specs: {
        // Turning specs
        swingOverBed: 400, // mm diameter
        swingOverCarriage: 250,
        distanceBetweenCenters: 750,
        maxTurningDiameter: 350,
        maxTurningLength: 700,
        
        // Spindle
        maxRPM: 4000,
        minRPM: 50,
        spindlePower: 7.5,
        spindleBore: 52, // mm
        chuckSize: 200, // mm
        
        // Turret
        toolStations: 12,
        toolChangeTime: 1.5,
        liveTooling: true,
        liveToolRPM: 4000,
        
        // Feed rates
        xFeedRate: 15000, // mm/min
        zFeedRate: 20000,
        rapidTraverse: 30000,
        
        // Accuracy
        positioning: 0.003,
        repeatability: 0.002,
        
        // Bar capacity
        barCapacity: 65, // mm
        
        // Tailstock
        tailstockTravel: 500,
        tailstockQuill: 100,
        
        coolantTank: 150,
        coolantTypes: ['Flood', 'High-pressure'],
        
        // Chuck
        chuckType: '3-jaw',
        jawStroke: 8, // mm per jaw
        maxGripForce: 50, // kN
      },
      colors: {
        chuck: '#666666',
        workpiece: '#aaaaaa',
        bed: '#444444',
        tool: '#ffcc00'
      }
    },
    'swiss-standard': {
      id: 'swiss-standard',
      name: 'Swiss-Type Lathe',
      type: 'swiss',
      isTemplate: true,
      specs: {
        // Swiss specific
        maxBarDiameter: 32,
        guideBushLength: 200,
        mainSpindleTravel: 320, // Z1
        
        // Main spindle
        mainSpindleRPM: 10000,
        mainSpindlePower: 5.5,
        
        // Sub spindle
        hasSubSpindle: true,
        subSpindleRPM: 8000,
        subSpindlePower: 3.7,
        subSpindleTravel: 150, // Z2
        
        // Tools
        toolStations: 20,
        liveToolStations: 8,
        liveToolRPM: 6000,
        
        // Accuracy
        positioning: 0.002,
        repeatability: 0.001,
        
        // Feed rates
        xFeedRate: 20000,
        yFeedRate: 20000,
        zFeedRate: 30000,
        
        coolantTank: 200,
        coolantTypes: ['Flood', 'High-pressure', 'Oil'],
        
        // Back working
        backWorkingTools: 4,
        simultaneousMachining: true,
        
        chipConveyor: true,
        barFeeder: true,
        partsCounter: true,
      },
      colors: {
        guideBush: '#777777',
        mainSpindle: '#666666',
        subSpindle: '#555555',
        workpiece: '#bbbbbb',
        tool: '#ffdd00'
      }
    }
  };

  // State management
  const [machines, setMachines] = useState(() => {
    const saved = localStorage.getItem('customMachines');
    if (saved) {
      return { ...defaultTemplates, ...JSON.parse(saved) };
    }
    return defaultTemplates;
  });

  const [selectedMachine, setSelectedMachine] = useState(currentMachine || '3axis-mill-standard');
  const [editingMachine, setEditingMachine] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Save custom machines to localStorage
  useEffect(() => {
    const customMachines = {};
    Object.entries(machines).forEach(([key, machine]) => {
      if (!machine.isTemplate) {
        customMachines[key] = machine;
      }
    });
    localStorage.setItem('customMachines', JSON.stringify(customMachines));
  }, [machines]);

  // Create new machine based on template
  const createNewMachine = (templateId) => {
    const template = machines[templateId];
    const newId = `custom-${Date.now()}`;
    const newMachine = {
      ...JSON.parse(JSON.stringify(template)), // Deep clone
      id: newId,
      name: `${template.name} (Custom)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    setEditingMachine(newMachine);
    setShowEditor(true);
  };

  // Save edited machine
  const saveMachine = (machine) => {
    const updatedMachine = {
      ...machine,
      modifiedAt: new Date().toISOString()
    };
    
    setMachines(prev => ({
      ...prev,
      [machine.id]: updatedMachine
    }));
    
    setShowEditor(false);
    setEditingMachine(null);
    setSelectedMachine(machine.id);
    
    if (onMachineSelect) {
      onMachineSelect(updatedMachine);
    }
  };

  // Delete custom machine
  const deleteMachine = (machineId) => {
    if (machines[machineId].isTemplate) {
      alert("Cannot delete template machines!");
      return;
    }
    
    if (confirm(`Delete machine "${machines[machineId].name}"?`)) {
      setMachines(prev => {
        const newMachines = { ...prev };
        delete newMachines[machineId];
        return newMachines;
      });
      
      if (selectedMachine === machineId) {
        setSelectedMachine('3axis-mill-standard');
      }
    }
  };

  // Export machine configuration
  const exportMachine = (machineId) => {
    const machine = machines[machineId];
    const dataStr = JSON.stringify(machine, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `${machine.name.replace(/\s+/g, '_')}_config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  // Import machine configuration
  const importMachine = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const machine = JSON.parse(e.target.result);
          machine.id = `imported-${Date.now()}`;
          machine.isTemplate = false;
          machine.importedAt = new Date().toISOString();
          
          setMachines(prev => ({
            ...prev,
            [machine.id]: machine
          }));
          
          alert(`Machine "${machine.name}" imported successfully!`);
        } catch (error) {
          alert('Error importing machine configuration: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter machines based on search
  const filteredMachines = Object.values(machines).filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group machines by type
  const groupedMachines = filteredMachines.reduce((acc, machine) => {
    const type = machine.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(machine);
    return acc;
  }, {});

  return (
    <div className="machine-configurator">
      <div className="configurator-header">
        <h2>Machine Configuration Manager</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <label className="btn btn-import">
            Import
            <input
              type="file"
              accept=".json"
              onChange={importMachine}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="machine-grid">
        {Object.entries(groupedMachines).map(([type, typeMachines]) => (
          <div key={type} className="machine-type-group">
            <h3 className="type-header">
              {type === '3axis-mill' && '3-Axis Mills'}
              {type === '5axis-mill' && '5-Axis Mills'}
              {type === 'lathe' && 'CNC Lathes'}
              {type === 'swiss' && 'Swiss-Type Lathes'}
            </h3>
            
            <div className="machines-list">
              {typeMachines.map(machine => (
                <div
                  key={machine.id}
                  className={`machine-card ${selectedMachine === machine.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMachine(machine.id);
                    if (onMachineSelect) {
                      onMachineSelect(machine);
                    }
                  }}
                >
                  <div className="machine-card-header">
                    <h4>{machine.name}</h4>
                    {machine.isTemplate && <span className="template-badge">Template</span>}
                    {!machine.isTemplate && <span className="custom-badge">Custom</span>}
                  </div>
                  
                  <div className="machine-card-specs">
                    <div className="spec-item">
                      <span className="spec-label">Travel:</span>
                      <span className="spec-value">
                        {machine.specs.xTravel || machine.specs.maxTurningLength}mm
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Spindle:</span>
                      <span className="spec-value">{machine.specs.maxRPM} RPM</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Power:</span>
                      <span className="spec-value">{machine.specs.spindlePower} kW</span>
                    </div>
                  </div>
                  
                  <div className="machine-card-actions">
                    {machine.isTemplate ? (
                      <button
                        className="btn btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          createNewMachine(machine.id);
                        }}
                      >
                        Use as Template
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMachine(machine);
                            setShowEditor(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportMachine(machine.id);
                          }}
                        >
                          Export
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMachine(machine.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Machine Editor Modal */}
      {showEditor && editingMachine && (
        <MachineEditor
          machine={editingMachine}
          onSave={saveMachine}
          onCancel={() => {
            setShowEditor(false);
            setEditingMachine(null);
          }}
        />
      )}
    </div>
  );
};

// Machine Editor Component
const MachineEditor = ({ machine, onSave, onCancel }) => {
  const [editedMachine, setEditedMachine] = useState(JSON.parse(JSON.stringify(machine)));
  const [activeTab, setActiveTab] = useState('general');

  const updateSpec = (path, value) => {
    setEditedMachine(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      // Convert to number if it's a numeric field
      const numValue = parseFloat(value);
      current[keys[keys.length - 1]] = isNaN(numValue) ? value : numValue;
      
      return updated;
    });
  };

  const renderSpecFields = () => {
    const specs = editedMachine.specs;
    const machineType = editedMachine.type;

    switch (activeTab) {
      case 'general':
        return (
          <div className="spec-group">
            <h3>General Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Machine Name</label>
                <input
                  type="text"
                  value={editedMachine.name}
                  onChange={(e) => setEditedMachine(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Machine Type</label>
                <select
                  value={editedMachine.type}
                  onChange={(e) => setEditedMachine(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="3axis-mill">3-Axis Mill</option>
                  <option value="5axis-mill">5-Axis Mill</option>
                  <option value="lathe">CNC Lathe</option>
                  <option value="swiss">Swiss-Type Lathe</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'travel':
        return (
          <div className="spec-group">
            <h3>Travel & Work Envelope</h3>
            <div className="form-row">
              {(machineType === '3axis-mill' || machineType === '5axis-mill') ? (
                <>
                  <div className="form-group">
                    <label>X Travel (mm)</label>
                    <input
                      type="number"
                      value={specs.xTravel}
                      onChange={(e) => updateSpec('specs.xTravel', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Y Travel (mm)</label>
                    <input
                      type="number"
                      value={specs.yTravel}
                      onChange={(e) => updateSpec('specs.yTravel', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Z Travel (mm)</label>
                    <input
                      type="number"
                      value={specs.zTravel}
                      onChange={(e) => updateSpec('specs.zTravel', e.target.value)}
                    />
                  </div>
                  {machineType === '5axis-mill' && (
                    <>
                      <div className="form-group">
                        <label>A Rotation (°)</label>
                        <input
                          type="number"
                          value={specs.aRotation}
                          onChange={(e) => updateSpec('specs.aRotation', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>B Rotation (°)</label>
                        <input
                          type="number"
                          value={specs.bRotation}
                          onChange={(e) => updateSpec('specs.bRotation', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Max Turning Diameter (mm)</label>
                    <input
                      type="number"
                      value={specs.maxTurningDiameter || specs.maxBarDiameter}
                      onChange={(e) => updateSpec('specs.maxTurningDiameter', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Turning Length (mm)</label>
                    <input
                      type="number"
                      value={specs.maxTurningLength || specs.mainSpindleTravel}
                      onChange={(e) => updateSpec('specs.maxTurningLength', e.target.value)}
                    />
                  </div>
                  {machineType === 'lathe' && (
                    <div className="form-group">
                      <label>Swing Over Bed (mm)</label>
                      <input
                        type="number"
                        value={specs.swingOverBed}
                        onChange={(e) => updateSpec('specs.swingOverBed', e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'spindle':
        return (
          <div className="spec-group">
            <h3>Spindle Specifications</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Max RPM</label>
                <input
                  type="number"
                  value={specs.maxRPM || specs.mainSpindleRPM}
                  onChange={(e) => updateSpec('specs.maxRPM', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Min RPM</label>
                <input
                  type="number"
                  value={specs.minRPM}
                  onChange={(e) => updateSpec('specs.minRPM', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Spindle Power (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={specs.spindlePower || specs.mainSpindlePower}
                  onChange={(e) => updateSpec('specs.spindlePower', e.target.value)}
                />
              </div>
              {machineType === 'lathe' && (
                <div className="form-group">
                  <label>Spindle Bore (mm)</label>
                  <input
                    type="number"
                    value={specs.spindleBore}
                    onChange={(e) => updateSpec('specs.spindleBore', e.target.value)}
                  />
                </div>
              )}
              {machineType === 'swiss' && specs.hasSubSpindle && (
                <>
                  <div className="form-group">
                    <label>Sub-Spindle RPM</label>
                    <input
                      type="number"
                      value={specs.subSpindleRPM}
                      onChange={(e) => updateSpec('specs.subSpindleRPM', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sub-Spindle Power (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={specs.subSpindlePower}
                      onChange={(e) => updateSpec('specs.subSpindlePower', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'tooling':
        return (
          <div className="spec-group">
            <h3>Tooling & Tool Change</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tool Capacity</label>
                <input
                  type="number"
                  value={specs.toolCapacity || specs.toolStations}
                  onChange={(e) => updateSpec('specs.toolCapacity', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tool Change Time (sec)</label>
                <input
                  type="number"
                  step="0.1"
                  value={specs.toolChangeTime}
                  onChange={(e) => updateSpec('specs.toolChangeTime', e.target.value)}
                />
              </div>
              {(machineType === '3axis-mill' || machineType === '5axis-mill') && (
                <>
                  <div className="form-group">
                    <label>Max Tool Diameter (mm)</label>
                    <input
                      type="number"
                      value={specs.maxToolDiameter}
                      onChange={(e) => updateSpec('specs.maxToolDiameter', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Tool Length (mm)</label>
                    <input
                      type="number"
                      value={specs.maxToolLength}
                      onChange={(e) => updateSpec('specs.maxToolLength', e.target.value)}
                    />
                  </div>
                </>
              )}
              {(machineType === 'lathe' || machineType === 'swiss') && (
                <>
                  <div className="form-group">
                    <label>Live Tooling</label>
                    <select
                      value={specs.liveTooling ? 'yes' : 'no'}
                      onChange={(e) => updateSpec('specs.liveTooling', e.target.value === 'yes')}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {specs.liveTooling && (
                    <div className="form-group">
                      <label>Live Tool RPM</label>
                      <input
                        type="number"
                        value={specs.liveToolRPM}
                        onChange={(e) => updateSpec('specs.liveToolRPM', e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'accuracy':
        return (
          <div className="spec-group">
            <h3>Accuracy & Performance</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Positioning Accuracy (mm)</label>
                <input
                  type="number"
                  step="0.001"
                  value={specs.positioning}
                  onChange={(e) => updateSpec('specs.positioning', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Repeatability (mm)</label>
                <input
                  type="number"
                  step="0.001"
                  value={specs.repeatability}
                  onChange={(e) => updateSpec('specs.repeatability', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Max Feed Rate (mm/min)</label>
                <input
                  type="number"
                  value={specs.maxFeedRate || specs.zFeedRate}
                  onChange={(e) => updateSpec('specs.maxFeedRate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Rapid Traverse (mm/min)</label>
                <input
                  type="number"
                  value={specs.rapidFeedRate || specs.rapidTraverse}
                  onChange={(e) => updateSpec('specs.rapidFeedRate', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'table':
        if (machineType === '3axis-mill' || machineType === '5axis-mill') {
          return (
            <div className="spec-group">
              <h3>Table & Workholding</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Table Width (mm)</label>
                  <input
                    type="number"
                    value={specs.tableWidth}
                    onChange={(e) => updateSpec('specs.tableWidth', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Table Length (mm)</label>
                  <input
                    type="number"
                    value={specs.tableLength}
                    onChange={(e) => updateSpec('specs.tableLength', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Max Table Load (kg)</label>
                  <input
                    type="number"
                    value={specs.maxTableLoad}
                    onChange={(e) => updateSpec('specs.maxTableLoad', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>T-Slots</label>
                  <input
                    type="number"
                    value={specs.tSlots}
                    onChange={(e) => updateSpec('specs.tSlots', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>T-Slot Width (mm)</label>
                  <input
                    type="number"
                    value={specs.tSlotWidth}
                    onChange={(e) => updateSpec('specs.tSlotWidth', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        } else if (machineType === 'lathe') {
          return (
            <div className="spec-group">
              <h3>Chuck & Workholding</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Chuck Size (mm)</label>
                  <input
                    type="number"
                    value={specs.chuckSize}
                    onChange={(e) => updateSpec('specs.chuckSize', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Chuck Type</label>
                  <select
                    value={specs.chuckType}
                    onChange={(e) => updateSpec('specs.chuckType', e.target.value)}
                  >
                    <option value="3-jaw">3-Jaw</option>
                    <option value="4-jaw">4-Jaw</option>
                    <option value="6-jaw">6-Jaw</option>
                    <option value="collet">Collet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bar Capacity (mm)</label>
                  <input
                    type="number"
                    value={specs.barCapacity}
                    onChange={(e) => updateSpec('specs.barCapacity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Max Grip Force (kN)</label>
                  <input
                    type="number"
                    value={specs.maxGripForce}
                    onChange={(e) => updateSpec('specs.maxGripForce', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        }
        return null;

      case 'coolant':
        return (
          <div className="spec-group">
            <h3>Coolant System</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Coolant Tank (liters)</label>
                <input
                  type="number"
                  value={specs.coolantTank}
                  onChange={(e) => updateSpec('specs.coolantTank', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Coolant Types</label>
                <div className="checkbox-group">
                  {['Flood', 'Mist', 'Through-spindle', 'High-pressure', 'Oil'].map(type => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={specs.coolantTypes?.includes(type)}
                        onChange={(e) => {
                          const types = specs.coolantTypes || [];
                          if (e.target.checked) {
                            updateSpec('specs.coolantTypes', [...types, type]);
                          } else {
                            updateSpec('specs.coolantTypes', types.filter(t => t !== type));
                          }
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="spec-group">
            <h3>Visual Customization</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Table/Chuck Color</label>
                <input
                  type="color"
                  value={editedMachine.colors?.table || editedMachine.colors?.chuck || '#666666'}
                  onChange={(e) => updateSpec('colors.table', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Workpiece Color</label>
                <input
                  type="color"
                  value={editedMachine.colors?.workpiece || '#aaaaaa'}
                  onChange={(e) => updateSpec('colors.workpiece', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tool Color</label>
                <input
                  type="color"
                  value={editedMachine.colors?.tool || '#ffaa00'}
                  onChange={(e) => updateSpec('colors.tool', e.target.value)}
                />
              </div>
              {(editedMachine.type === '3axis-mill' || editedMachine.type === '5axis-mill') && (
                <div className="form-group">
                  <label>Vise Color</label>
                  <input
                    type="color"
                    value={editedMachine.colors?.vise || '#4444ff'}
                    onChange={(e) => updateSpec('colors.vise', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content machine-editor">
        <div className="modal-header">
          <h2>{machine.id ? 'Edit Machine' : 'New Machine'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="editor-tabs">
          <button
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab-button ${activeTab === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveTab('travel')}
          >
            Travel
          </button>
          <button
            className={`tab-button ${activeTab === 'spindle' ? 'active' : ''}`}
            onClick={() => setActiveTab('spindle')}
          >
            Spindle
          </button>
          <button
            className={`tab-button ${activeTab === 'tooling' ? 'active' : ''}`}
            onClick={() => setActiveTab('tooling')}
          >
            Tooling
          </button>
          <button
            className={`tab-button ${activeTab === 'accuracy' ? 'active' : ''}`}
            onClick={() => setActiveTab('accuracy')}
          >
            Accuracy
          </button>
          <button
            className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            {editedMachine.type.includes('mill') ? 'Table' : 'Chuck'}
          </button>
          <button
            className={`tab-button ${activeTab === 'coolant' ? 'active' : ''}`}
            onClick={() => setActiveTab('coolant')}
          >
            Coolant
          </button>
          <button
            className={`tab-button ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
        </div>

        <div className="editor-content">
          {renderSpecFields()}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(editedMachine)}>
            Save Machine
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineConfigurator;