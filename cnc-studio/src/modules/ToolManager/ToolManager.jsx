import React, { useState, useEffect } from 'react';
import { useToolContext } from '../shared/ToolContext';
import './ToolManager.css';

export const meta = {
  id: 'toolManager',
  name: 'Tool Library',
  area: 'right',
  order: 1,
  icon: '🛠️',
};

// Tool type definitions
const TOOL_TYPES = {
  endmill: 'End Mill',
  ballmill: 'Ball Mill',
  drill: 'Drill',
  tap: 'Tap',
  reamer: 'Reamer',
  boring: 'Boring Bar',
  facemill: 'Face Mill',
  chamfer: 'Chamfer Mill',
  thread: 'Thread Mill',
  spot: 'Spot Drill',
  center: 'Center Drill',
  countersink: 'Countersink'
};

// Tool materials
const TOOL_MATERIALS = {
  hss: 'HSS',
  carbide: 'Carbide',
  cobalt: 'Cobalt',
  ceramic: 'Ceramic',
  diamond: 'Diamond',
  cbn: 'CBN'
};

// Holder types
const HOLDER_TYPES = {
  bt30: 'BT30',
  bt40: 'BT40',
  bt50: 'BT50',
  cat40: 'CAT40',
  cat50: 'CAT50',
  hsk63a: 'HSK63A',
  hsk100a: 'HSK100A',
  r8: 'R8',
  mt3: 'MT3',
  mt4: 'MT4',
  er32: 'ER32',
  er40: 'ER40',
  weldon: 'Weldon',
  hydraulic: 'Hydraulic',
  shrinkfit: 'Shrink Fit'
};

export default function ToolManagerModule() {
  const {
    toolLibrary,
    addToolToLibrary,
    updateTool,
    deleteTool,
    calculateCuttingParams,
    eventBus
  } = useToolContext();

  const [selectedTool, setSelectedTool] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('number');
  
  // New tool form state
  const [newTool, setNewTool] = useState({
    number: 1,
    name: '',
    type: 'endmill',
    diameter: 10,
    flutes: 4,
    material: 'carbide',
    coating: 'TiAlN',
    holderType: 'bt40',
    cuttingLength: 30,
    overallLength: 80,
    shankDiameter: 10,
    stickout: 50,
    helixAngle: 30,
    cornerRadius: 0,
    manufacturer: '',
    partNumber: '',
    price: 0,
    notes: ''
  });

  // Cutting parameters state
  const [cuttingParams, setCuttingParams] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState('Aluminum');
  const [selectedOperation, setSelectedOperation] = useState('roughing');

  // Listen to tool events
  useEffect(() => {
    const unsubscribe = eventBus.on('magazine:toolLoaded', ({ tool }) => {
      console.log('Tool loaded in magazine:', tool);
    });
    return unsubscribe;
  }, [eventBus]);

  // Filter and sort tools
  const filteredTools = toolLibrary
    .filter(tool => {
      if (!filter) return true;
      const searchLower = filter.toLowerCase();
      return (
        tool.name?.toLowerCase().includes(searchLower) ||
        tool.type?.toLowerCase().includes(searchLower) ||
        tool.number?.toString().includes(filter) ||
        tool.manufacturer?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return (a.number || 0) - (b.number || 0);
        case 'diameter':
          return (a.diameter || 0) - (b.diameter || 0);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

  const handleAddTool = () => {
    const tool = {
      ...newTool,
      geometry: {
        overallLength: newTool.overallLength,
        cuttingLength: newTool.cuttingLength,
        shankDiameter: newTool.shankDiameter,
        helixAngle: newTool.helixAngle,
        cornerRadius: newTool.cornerRadius
      },
      holder: {
        type: newTool.holderType,
        stickout: newTool.stickout,
        interface: newTool.holderType,
        pullStud: 'standard',
        gauge: newTool.stickout + newTool.overallLength
      },
      cuttingData: {
        vc: 0,
        fz: 0,
        ap: 0,
        ae: 0
      }
    };

    const addedTool = addToolToLibrary(tool);
    setSelectedTool(addedTool);
    setShowAddForm(false);
    
    // Reset form
    setNewTool({
      number: Math.max(...toolLibrary.map(t => t.number || 0), 0) + 1,
      name: '',
      type: 'endmill',
      diameter: 10,
      flutes: 4,
      material: 'carbide',
      coating: 'TiAlN',
      holderType: 'bt40',
      cuttingLength: 30,
      overallLength: 80,
      shankDiameter: 10,
      stickout: 50,
      helixAngle: 30,
      cornerRadius: 0,
      manufacturer: '',
      partNumber: '',
      price: 0,
      notes: ''
    });
  };

  const handleUpdateTool = () => {
    if (selectedTool && editMode) {
      updateTool(selectedTool.id, selectedTool);
      setEditMode(false);
    }
  };

  const handleDeleteTool = () => {
    if (selectedTool && window.confirm(`Delete tool T${selectedTool.number} - ${selectedTool.name}?`)) {
      const success = deleteTool(selectedTool.id);
      if (success) {
        setSelectedTool(null);
        setEditMode(false);
      } else {
        alert('Cannot delete tool - it may be loaded in the magazine');
      }
    }
  };

  const calculateParams = () => {
    if (selectedTool) {
      const params = calculateCuttingParams(selectedTool, selectedMaterial, selectedOperation);
      setCuttingParams(params);
    }
  };

  const exportToolLibrary = () => {
    const dataStr = JSON.stringify(toolLibrary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tool-library-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importToolLibrary = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const tools = JSON.parse(e.target.result);
          tools.forEach(tool => addToolToLibrary(tool));
          alert(`Imported ${tools.length} tools`);
        } catch (error) {
          alert('Error importing tools: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="tool-manager">
      {/* Header Controls */}
      <div className="tool-manager-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tools..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="number">Sort by Number</option>
            <option value="diameter">Sort by Diameter</option>
            <option value="type">Sort by Type</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <div className="action-buttons">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            ➕ Add Tool
          </button>
          <button onClick={exportToolLibrary} className="btn-secondary">
            📥 Export
          </button>
          <label className="btn-secondary">
            📤 Import
            <input
              type="file"
              accept=".json"
              onChange={importToolLibrary}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Add Tool Form */}
      {showAddForm && (
        <div className="add-tool-form">
          <h3>Add New Tool</h3>
          <div className="form-grid">
            <label>
              Tool Number
              <input
                type="number"
                value={newTool.number}
                onChange={(e) => setNewTool({...newTool, number: parseInt(e.target.value)})}
              />
            </label>
            <label>
              Name
              <input
                type="text"
                value={newTool.name}
                onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                placeholder="e.g., 10mm 4F Endmill"
              />
            </label>
            <label>
              Type
              <select
                value={newTool.type}
                onChange={(e) => setNewTool({...newTool, type: e.target.value})}
              >
                {Object.entries(TOOL_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Diameter (mm)
              <input
                type="number"
                step="0.1"
                value={newTool.diameter}
                onChange={(e) => setNewTool({...newTool, diameter: parseFloat(e.target.value)})}
              />
            </label>
            <label>
              Flutes
              <input
                type="number"
                value={newTool.flutes}
                onChange={(e) => setNewTool({...newTool, flutes: parseInt(e.target.value)})}
              />
            </label>
            <label>
              Material
              <select
                value={newTool.material}
                onChange={(e) => setNewTool({...newTool, material: e.target.value})}
              >
                {Object.entries(TOOL_MATERIALS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Coating
              <input
                type="text"
                value={newTool.coating}
                onChange={(e) => setNewTool({...newTool, coating: e.target.value})}
                placeholder="e.g., TiAlN, TiN, DLC"
              />
            </label>
            <label>
              Holder Type
              <select
                value={newTool.holderType}
                onChange={(e) => setNewTool({...newTool, holderType: e.target.value})}
              >
                {Object.entries(HOLDER_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Cutting Length (mm)
              <input
                type="number"
                step="0.1"
                value={newTool.cuttingLength}
                onChange={(e) => setNewTool({...newTool, cuttingLength: parseFloat(e.target.value)})}
              />
            </label>
            <label>
              Overall Length (mm)
              <input
                type="number"
                step="0.1"
                value={newTool.overallLength}
                onChange={(e) => setNewTool({...newTool, overallLength: parseFloat(e.target.value)})}
              />
            </label>
            <label>
              Stickout (mm)
              <input
                type="number"
                step="0.1"
                value={newTool.stickout}
                onChange={(e) => setNewTool({...newTool, stickout: parseFloat(e.target.value)})}
              />
            </label>
            <label>
              Manufacturer
              <input
                type="text"
                value={newTool.manufacturer}
                onChange={(e) => setNewTool({...newTool, manufacturer: e.target.value})}
              />
            </label>
          </div>
          <div className="form-actions">
            <button onClick={handleAddTool} className="btn-primary">Add Tool</button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Tool List */}
      <div className="tool-list">
        {filteredTools.length === 0 ? (
          <div className="empty-state">
            No tools in library. Add your first tool to get started.
          </div>
        ) : (
          filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`tool-item ${selectedTool?.id === tool.id ? 'selected' : ''}`}
              onClick={() => setSelectedTool(tool)}
            >
              <div className="tool-number">T{tool.number}</div>
              <div className="tool-info">
                <div className="tool-name">{tool.name || `${TOOL_TYPES[tool.type]} Ø${tool.diameter}mm`}</div>
                <div className="tool-details">
                  {tool.diameter}mm • {tool.flutes}F • {TOOL_MATERIALS[tool.material]}
                </div>
              </div>
              <div className="tool-wear">
                {tool.wear?.usageTime ? (
                  <span className="wear-indicator" title={`Usage: ${tool.wear.usageTime.toFixed(1)}h`}>
                    ⚠️
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tool Details Panel */}
      {selectedTool && (
        <div className="tool-details">
          <div className="detail-header">
            <h3>T{selectedTool.number} - {selectedTool.name || TOOL_TYPES[selectedTool.type]}</h3>
            <div className="detail-actions">
              {editMode ? (
                <>
                  <button onClick={handleUpdateTool} className="btn-success">✓ Save</button>
                  <button onClick={() => setEditMode(false)} className="btn-secondary">✗ Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditMode(true)} className="btn-primary">✏️ Edit</button>
                  <button onClick={handleDeleteTool} className="btn-danger">🗑️ Delete</button>
                </>
              )}
            </div>
          </div>

          <div className="detail-content">
            {/* Basic Properties */}
            <section className="detail-section">
              <h4>Basic Properties</h4>
              <div className="property-grid">
                <label>
                  Type
                  {editMode ? (
                    <select
                      value={selectedTool.type}
                      onChange={(e) => setSelectedTool({...selectedTool, type: e.target.value})}
                    >
                      {Object.entries(TOOL_TYPES).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{TOOL_TYPES[selectedTool.type]}</span>
                  )}
                </label>
                <label>
                  Diameter
                  {editMode ? (
                    <input
                      type="number"
                      step="0.1"
                      value={selectedTool.diameter}
                      onChange={(e) => setSelectedTool({...selectedTool, diameter: parseFloat(e.target.value)})}
                    />
                  ) : (
                    <span>{selectedTool.diameter} mm</span>
                  )}
                </label>
                <label>
                  Flutes
                  {editMode ? (
                    <input
                      type="number"
                      value={selectedTool.flutes}
                      onChange={(e) => setSelectedTool({...selectedTool, flutes: parseInt(e.target.value)})}
                    />
                  ) : (
                    <span>{selectedTool.flutes}</span>
                  )}
                </label>
                <label>
                  Material
                  {editMode ? (
                    <select
                      value={selectedTool.material}
                      onChange={(e) => setSelectedTool({...selectedTool, material: e.target.value})}
                    >
                      {Object.entries(TOOL_MATERIALS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <span>{TOOL_MATERIALS[selectedTool.material]}</span>
                  )}
                </label>
              </div>
            </section>

            {/* Geometry */}
            <section className="detail-section">
              <h4>Geometry</h4>
              <div className="property-grid">
                <label>
                  Cutting Length
                  <span>{selectedTool.geometry?.cuttingLength || selectedTool.cuttingLength || 0} mm</span>
                </label>
                <label>
                  Overall Length
                  <span>{selectedTool.geometry?.overallLength || selectedTool.overallLength || 0} mm</span>
                </label>
                <label>
                  Helix Angle
                  <span>{selectedTool.geometry?.helixAngle || 30}°</span>
                </label>
                <label>
                  Corner Radius
                  <span>{selectedTool.geometry?.cornerRadius || 0} mm</span>
                </label>
              </div>
            </section>

            {/* Holder Information */}
            <section className="detail-section">
              <h4>Holder</h4>
              <div className="property-grid">
                <label>
                  Holder Type
                  <span>{HOLDER_TYPES[selectedTool.holder?.type] || selectedTool.holderType || 'None'}</span>
                </label>
                <label>
                  Stickout
                  <span>{selectedTool.holder?.stickout || selectedTool.stickout || 0} mm</span>
                </label>
                <label>
                  Gauge Length
                  <span>{selectedTool.holder?.gauge || 0} mm</span>
                </label>
              </div>
            </section>

            {/* Cutting Parameters Calculator */}
            <section className="detail-section">
              <h4>Cutting Parameters</h4>
              <div className="cutting-params">
                <div className="param-inputs">
                  <label>
                    Material
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                    >
                      <option value="Aluminum">Aluminum</option>
                      <option value="Steel">Steel</option>
                      <option value="Stainless">Stainless Steel</option>
                      <option value="Titanium">Titanium</option>
                      <option value="Plastic">Plastic</option>
                    </select>
                  </label>
                  <label>
                    Operation
                    <select
                      value={selectedOperation}
                      onChange={(e) => setSelectedOperation(e.target.value)}
                    >
                      <option value="roughing">Roughing</option>
                      <option value="finishing">Finishing</option>
                      <option value="slotting">Slotting</option>
                    </select>
                  </label>
                  <button onClick={calculateParams} className="btn-primary">Calculate</button>
                </div>
                
                {cuttingParams && (
                  <div className="param-results">
                    <div className="param-item">
                      <span>Spindle Speed:</span>
                      <strong>{cuttingParams.rpm} RPM</strong>
                    </div>
                    <div className="param-item">
                      <span>Feed Rate:</span>
                      <strong>{cuttingParams.feedRate} mm/min</strong>
                    </div>
                    <div className="param-item">
                      <span>Feed/Tooth:</span>
                      <strong>{cuttingParams.fz} mm</strong>
                    </div>
                    <div className="param-item">
                      <span>Cutting Speed:</span>
                      <strong>{cuttingParams.vc} m/min</strong>
                    </div>
                    <div className="param-item">
                      <span>Power Required:</span>
                      <strong>{cuttingParams.power} kW</strong>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Tool Wear */}
            {selectedTool.wear && (
              <section className="detail-section">
                <h4>Wear & Usage</h4>
                <div className="property-grid">
                  <label>
                    Usage Time
                    <span>{(selectedTool.wear.usageTime || 0).toFixed(1)} hours</span>
                  </label>
                  <label>
                    Cutting Distance
                    <span>{(selectedTool.wear.cuttingDistance || 0).toFixed(0)} m</span>
                  </label>
                  <label>
                    Condition
                    <span className={selectedTool.wear.breakage ? 'error' : selectedTool.wear.chipping ? 'warning' : 'success'}>
                      {selectedTool.wear.breakage ? 'Broken' : selectedTool.wear.chipping ? 'Chipped' : 'Good'}
                    </span>
                  </label>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}