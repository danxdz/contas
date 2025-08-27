import React, { useState, useEffect } from 'react';
import './SetupManager.css';

// Default part/stock templates
const DEFAULT_PARTS = {
  'round-bar': {
    id: 'round-bar',
    name: 'Round Bar Stock',
    type: 'cylindrical',
    material: 'Aluminum 6061',
    dimensions: {
      diameter: 50,
      length: 150
    },
    color: '#c0c0c0'
  },
  'square-stock': {
    id: 'square-stock',
    name: 'Square Stock',
    type: 'rectangular',
    material: 'Steel 1018',
    dimensions: {
      width: 100,
      depth: 100,
      height: 50
    },
    color: '#808080'
  },
  'hex-bar': {
    id: 'hex-bar',
    name: 'Hex Bar Stock',
    type: 'hexagonal',
    material: 'Brass',
    dimensions: {
      diameter: 40,
      length: 120
    },
    color: '#b8860b'
  }
};

// Default fixture templates
const DEFAULT_FIXTURES = {
  '3jaw-chuck': {
    id: '3jaw-chuck',
    name: '3-Jaw Chuck',
    type: 'chuck',
    subtype: '3-jaw',
    specs: {
      size: 200,
      throughHole: 52,
      jawStroke: 8,
      maxGrip: 50
    }
  },
  '4jaw-chuck': {
    id: '4jaw-chuck',
    name: '4-Jaw Chuck',
    type: 'chuck',
    subtype: '4-jaw',
    specs: {
      size: 250,
      throughHole: 65,
      jawStroke: 12,
      maxGrip: 75
    }
  },
  'collet-chuck': {
    id: 'collet-chuck',
    name: 'ER32 Collet Chuck',
    type: 'chuck',
    subtype: 'collet',
    specs: {
      colletType: 'ER32',
      minDiameter: 2,
      maxDiameter: 20,
      runout: 0.005
    }
  },
  'kurt-vise': {
    id: 'kurt-vise',
    name: 'Kurt Vise 6"',
    type: 'vise',
    specs: {
      jawWidth: 150,
      jawHeight: 50,
      jawOpening: 200,
      clampForce: 30
    }
  },
  'fixture-plate': {
    id: 'fixture-plate',
    name: 'Fixture Plate',
    type: 'plate',
    specs: {
      width: 300,
      depth: 300,
      thickness: 25,
      holePattern: 'M12x50mm'
    }
  }
};

// Tool templates integrated with Tool Database
const DEFAULT_TOOLS = {
  'endmill-6mm': {
    id: 'endmill-6mm',
    name: '6mm Carbide End Mill',
    type: 'endmill',
    specs: {
      diameter: 6,
      flutes: 4,
      length: 50,
      shankDiameter: 6,
      material: 'Carbide',
      coating: 'TiAlN'
    },
    cutting: {
      vc: 200,
      fz: 0.05,
      ap: 12,
      ae: 3
    }
  },
  'drill-8mm': {
    id: 'drill-8mm',
    name: '8mm HSS Drill',
    type: 'drill',
    specs: {
      diameter: 8,
      flutes: 2,
      length: 80,
      pointAngle: 118,
      material: 'HSS',
      coating: 'TiN'
    },
    cutting: {
      vc: 30,
      fn: 0.15
    }
  },
  'turning-cnmg': {
    id: 'turning-cnmg',
    name: 'CNMG 120408 Turning Insert',
    type: 'turning',
    specs: {
      insertType: 'CNMG',
      size: '120408',
      radius: 0.8,
      material: 'Carbide',
      grade: 'P25'
    },
    cutting: {
      vc: 250,
      fn: 0.25,
      ap: 3
    }
  },
  'boring-bar': {
    id: 'boring-bar',
    name: 'Boring Bar 16mm',
    type: 'boring',
    specs: {
      barDiameter: 16,
      minBore: 20,
      maxDepth: 80,
      insertType: 'CCMT'
    },
    cutting: {
      vc: 150,
      fn: 0.15,
      ap: 1
    }
  }
};

const SetupManager = ({ onSetupChange, currentSetup }) => {
  // State for parts
  const [parts, setParts] = useState(() => {
    const saved = localStorage.getItem('customParts');
    return saved ? { ...DEFAULT_PARTS, ...JSON.parse(saved) } : DEFAULT_PARTS;
  });

  // State for fixtures
  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem('customFixtures');
    return saved ? { ...DEFAULT_FIXTURES, ...JSON.parse(saved) } : DEFAULT_FIXTURES;
  });

  // State for tools
  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem('customTools');
    return saved ? { ...DEFAULT_TOOLS, ...JSON.parse(saved) } : DEFAULT_TOOLS;
  });

  // State for complete setups
  const [setups, setSetups] = useState(() => {
    const saved = localStorage.getItem('savedSetups');
    return saved ? JSON.parse(saved) : {};
  });

  // Current active setup
  const [activeSetup, setActiveSetup] = useState({
    name: 'Current Setup',
    part: null,
    fixture: null,
    tool: null,
    workOffset: { x: 0, y: 0, z: 0 },
    toolOffset: { length: 0, radius: 0 }
  });

  // UI state
  const [activeTab, setActiveTab] = useState('parts');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Save to localStorage
  useEffect(() => {
    const customParts = Object.entries(parts)
      .filter(([key, part]) => !DEFAULT_PARTS[key])
      .reduce((acc, [key, part]) => ({ ...acc, [key]: part }), {});
    localStorage.setItem('customParts', JSON.stringify(customParts));
  }, [parts]);

  useEffect(() => {
    const customFixtures = Object.entries(fixtures)
      .filter(([key, fixture]) => !DEFAULT_FIXTURES[key])
      .reduce((acc, [key, fixture]) => ({ ...acc, [key]: fixture }), {});
    localStorage.setItem('customFixtures', JSON.stringify(customFixtures));
  }, [fixtures]);

  useEffect(() => {
    const customTools = Object.entries(tools)
      .filter(([key, tool]) => !DEFAULT_TOOLS[key])
      .reduce((acc, [key, tool]) => ({ ...acc, [key]: tool }), {});
    localStorage.setItem('customTools', JSON.stringify(customTools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem('savedSetups', JSON.stringify(setups));
  }, [setups]);

  // Notify parent of setup changes
  useEffect(() => {
    if (onSetupChange) {
      onSetupChange(activeSetup);
    }
  }, [activeSetup]);

  // Create new item from template
  const createFromTemplate = (type, templateId) => {
    let template, collection;
    
    switch (type) {
      case 'part':
        template = parts[templateId];
        collection = parts;
        break;
      case 'fixture':
        template = fixtures[templateId];
        collection = fixtures;
        break;
      case 'tool':
        template = tools[templateId];
        collection = tools;
        break;
      default:
        return;
    }

    const newItem = {
      ...JSON.parse(JSON.stringify(template)),
      id: `custom-${Date.now()}`,
      name: `${template.name} (Custom)`,
      isCustom: true
    };

    setEditingItem(newItem);
    setEditingType(type);
    setShowEditor(true);
  };

  // Save edited item
  const saveItem = (item, type) => {
    switch (type) {
      case 'part':
        setParts(prev => ({ ...prev, [item.id]: item }));
        break;
      case 'fixture':
        setFixtures(prev => ({ ...prev, [item.id]: item }));
        break;
      case 'tool':
        setTools(prev => ({ ...prev, [item.id]: item }));
        break;
    }
    
    setShowEditor(false);
    setEditingItem(null);
    setEditingType(null);
  };

  // Delete custom item
  const deleteItem = (itemId, type) => {
    const collections = { part: parts, fixture: fixtures, tool: tools };
    const setters = { part: setParts, fixture: setFixtures, tool: setTools };
    const defaults = { part: DEFAULT_PARTS, fixture: DEFAULT_FIXTURES, tool: DEFAULT_TOOLS };
    
    if (defaults[type][itemId]) {
      alert("Cannot delete default items!");
      return;
    }

    if (confirm(`Delete this ${type}?`)) {
      setters[type](prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }
  };

  // Select item for active setup
  const selectItem = (itemId, type) => {
    const collections = { part: parts, fixture: fixtures, tool: tools };
    const item = collections[type][itemId];
    
    setActiveSetup(prev => ({
      ...prev,
      [type]: item
    }));
  };

  // Save complete setup
  const saveSetup = () => {
    const setupName = prompt('Enter setup name:', activeSetup.name);
    if (setupName) {
      const setupToSave = {
        ...activeSetup,
        name: setupName,
        id: `setup-${Date.now()}`,
        savedAt: new Date().toISOString()
      };
      
      setSetups(prev => ({
        ...prev,
        [setupToSave.id]: setupToSave
      }));
      
      alert(`Setup "${setupName}" saved!`);
    }
  };

  // Load saved setup
  const loadSetup = (setupId) => {
    const setup = setups[setupId];
    if (setup) {
      setActiveSetup(setup);
      alert(`Setup "${setup.name}" loaded!`);
    }
  };

  // Export setup
  const exportSetup = () => {
    const dataStr = JSON.stringify(activeSetup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const fileName = `${activeSetup.name.replace(/\s+/g, '_')}_setup.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  // Import setup
  const importSetup = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const setup = JSON.parse(e.target.result);
          setActiveSetup(setup);
          alert(`Setup "${setup.name}" imported!`);
        } catch (error) {
          alert('Error importing setup: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter items based on search
  const filterItems = (items) => {
    if (!searchTerm) return items;
    
    return Object.entries(items).filter(([key, item]) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material?.toLowerCase().includes(searchTerm.toLowerCase())
    ).reduce((acc, [key, item]) => ({ ...acc, [key]: item }), {});
  };

  const filteredParts = filterItems(parts);
  const filteredFixtures = filterItems(fixtures);
  const filteredTools = filterItems(tools);

  return (
    <div className="setup-manager">
      <div className="setup-header">
        <h3>Setup Manager</h3>
        <div className="setup-actions">
          <button className="btn btn-small" onClick={saveSetup}>
            💾 Save Setup
          </button>
          <button className="btn btn-small" onClick={exportSetup}>
            📤 Export
          </button>
          <label className="btn btn-small">
            📥 Import
            <input
              type="file"
              accept=".json"
              onChange={importSetup}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Current Setup Display */}
      <div className="current-setup">
        <h4>Active Setup: {activeSetup.name}</h4>
        <div className="setup-summary">
          <div className="setup-item">
            <span className="label">Part:</span>
            <span className="value">{activeSetup.part?.name || 'None'}</span>
          </div>
          <div className="setup-item">
            <span className="label">Fixture:</span>
            <span className="value">{activeSetup.fixture?.name || 'None'}</span>
          </div>
          <div className="setup-item">
            <span className="label">Tool:</span>
            <span className="value">{activeSetup.tool?.name || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Saved Setups */}
      {Object.keys(setups).length > 0 && (
        <div className="saved-setups">
          <h4>Saved Setups</h4>
          <div className="setups-grid">
            {Object.values(setups).map(setup => (
              <div key={setup.id} className="setup-card">
                <h5>{setup.name}</h5>
                <small>{new Date(setup.savedAt).toLocaleString()}</small>
                <button 
                  className="btn btn-small"
                  onClick={() => loadSetup(setup.id)}
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'parts' ? 'active' : ''}`}
          onClick={() => setActiveTab('parts')}
        >
          🔧 Parts/Stock
        </button>
        <button
          className={`tab-button ${activeTab === 'fixtures' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixtures')}
        >
          🗜️ Fixtures
        </button>
        <button
          className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🔨 Tools
        </button>
        <button
          className={`tab-button ${activeTab === 'offsets' ? 'active' : ''}`}
          onClick={() => setActiveTab('offsets')}
        >
          📐 Offsets
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'parts' && (
          <div className="items-grid">
            {Object.values(filteredParts).map(part => (
              <div key={part.id} className="item-card">
                <div className="item-preview">
                  <div 
                    className={`preview-shape ${part.type}`}
                    style={{ backgroundColor: part.color }}
                  />
                </div>
                <h4>{part.name}</h4>
                <p className="item-type">{part.type}</p>
                <p className="item-material">{part.material}</p>
                <div className="item-dimensions">
                  {part.type === 'cylindrical' ? (
                    <span>⌀{part.dimensions.diameter} × {part.dimensions.length}mm</span>
                  ) : (
                    <span>{part.dimensions.width} × {part.dimensions.depth} × {part.dimensions.height}mm</span>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => selectItem(part.id, 'part')}
                  >
                    Select
                  </button>
                  {!DEFAULT_PARTS[part.id] ? (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => {
                          setEditingItem(part);
                          setEditingType('part');
                          setShowEditor(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => deleteItem(part.id, 'part')}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-small"
                      onClick={() => createFromTemplate('part', part.id)}
                    >
                      Duplicate
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="item-card add-new" onClick={() => createFromTemplate('part', 'round-bar')}>
              <div className="add-icon">+</div>
              <h4>Add New Part</h4>
            </div>
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="items-grid">
            {Object.values(filteredFixtures).map(fixture => (
              <div key={fixture.id} className="item-card">
                <div className="item-preview">
                  <div className={`preview-fixture ${fixture.type}`} />
                </div>
                <h4>{fixture.name}</h4>
                <p className="item-type">{fixture.type}</p>
                {fixture.subtype && <p className="item-subtype">{fixture.subtype}</p>}
                <div className="item-specs">
                  {fixture.type === 'chuck' && (
                    <span>Size: {fixture.specs.size}mm</span>
                  )}
                  {fixture.type === 'vise' && (
                    <span>Opening: {fixture.specs.jawOpening}mm</span>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => selectItem(fixture.id, 'fixture')}
                  >
                    Select
                  </button>
                  {!DEFAULT_FIXTURES[fixture.id] ? (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => {
                          setEditingItem(fixture);
                          setEditingType('fixture');
                          setShowEditor(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => deleteItem(fixture.id, 'fixture')}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-small"
                      onClick={() => createFromTemplate('fixture', fixture.id)}
                    >
                      Duplicate
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="item-card add-new" onClick={() => createFromTemplate('fixture', '3jaw-chuck')}>
              <div className="add-icon">+</div>
              <h4>Add New Fixture</h4>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="items-grid">
            {Object.values(filteredTools).map(tool => (
              <div key={tool.id} className="item-card">
                <div className="item-preview">
                  <div className={`preview-tool ${tool.type}`} />
                </div>
                <h4>{tool.name}</h4>
                <p className="item-type">{tool.type}</p>
                <div className="item-specs">
                  <span>⌀{tool.specs.diameter}mm</span>
                  {tool.specs.flutes && <span> • {tool.specs.flutes}FL</span>}
                  <span> • {tool.specs.material}</span>
                </div>
                <div className="cutting-params">
                  <span>Vc: {tool.cutting.vc} m/min</span>
                  {tool.cutting.fz && <span> • fz: {tool.cutting.fz}</span>}
                  {tool.cutting.fn && <span> • fn: {tool.cutting.fn}</span>}
                </div>
                <div className="item-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => selectItem(tool.id, 'tool')}
                  >
                    Select
                  </button>
                  {!DEFAULT_TOOLS[tool.id] ? (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => {
                          setEditingItem(tool);
                          setEditingType('tool');
                          setShowEditor(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => deleteItem(tool.id, 'tool')}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-small"
                      onClick={() => createFromTemplate('tool', tool.id)}
                    >
                      Duplicate
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="item-card add-new" onClick={() => createFromTemplate('tool', 'endmill-6mm')}>
              <div className="add-icon">+</div>
              <h4>Add New Tool</h4>
            </div>
          </div>
        )}

        {activeTab === 'offsets' && (
          <div className="offsets-panel">
            <h4>Work Coordinate Offset (G54)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>X Offset</label>
                <input
                  type="number"
                  value={activeSetup.workOffset.x}
                  onChange={(e) => setActiveSetup(prev => ({
                    ...prev,
                    workOffset: { ...prev.workOffset, x: parseFloat(e.target.value) }
                  }))}
                  step="0.001"
                />
              </div>
              <div className="form-group">
                <label>Y Offset</label>
                <input
                  type="number"
                  value={activeSetup.workOffset.y}
                  onChange={(e) => setActiveSetup(prev => ({
                    ...prev,
                    workOffset: { ...prev.workOffset, y: parseFloat(e.target.value) }
                  }))}
                  step="0.001"
                />
              </div>
              <div className="form-group">
                <label>Z Offset</label>
                <input
                  type="number"
                  value={activeSetup.workOffset.z}
                  onChange={(e) => setActiveSetup(prev => ({
                    ...prev,
                    workOffset: { ...prev.workOffset, z: parseFloat(e.target.value) }
                  }))}
                  step="0.001"
                />
              </div>
            </div>

            <h4>Tool Offset</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Tool Length (H)</label>
                <input
                  type="number"
                  value={activeSetup.toolOffset.length}
                  onChange={(e) => setActiveSetup(prev => ({
                    ...prev,
                    toolOffset: { ...prev.toolOffset, length: parseFloat(e.target.value) }
                  }))}
                  step="0.001"
                />
              </div>
              <div className="form-group">
                <label>Tool Radius (D)</label>
                <input
                  type="number"
                  value={activeSetup.toolOffset.radius}
                  onChange={(e) => setActiveSetup(prev => ({
                    ...prev,
                    toolOffset: { ...prev.toolOffset, radius: parseFloat(e.target.value) }
                  }))}
                  step="0.001"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && editingItem && (
        <ItemEditor
          item={editingItem}
          type={editingType}
          onSave={(item) => saveItem(item, editingType)}
          onCancel={() => {
            setShowEditor(false);
            setEditingItem(null);
            setEditingType(null);
          }}
        />
      )}
    </div>
  );
};

// Item Editor Component
const ItemEditor = ({ item, type, onSave, onCancel }) => {
  const [editedItem, setEditedItem] = useState(JSON.parse(JSON.stringify(item)));

  const updateField = (path, value) => {
    setEditedItem(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const numValue = parseFloat(value);
      current[keys[keys.length - 1]] = isNaN(numValue) ? value : numValue;
      
      return updated;
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content item-editor">
        <div className="modal-header">
          <h3>Edit {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="editor-content">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editedItem.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          {type === 'part' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={editedItem.type}
                    onChange={(e) => updateField('type', e.target.value)}
                  >
                    <option value="cylindrical">Cylindrical</option>
                    <option value="rectangular">Rectangular</option>
                    <option value="hexagonal">Hexagonal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    value={editedItem.material}
                    onChange={(e) => updateField('material', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={editedItem.color}
                    onChange={(e) => updateField('color', e.target.value)}
                  />
                </div>
              </div>

              <h4>Dimensions</h4>
              <div className="form-row">
                {editedItem.type === 'cylindrical' || editedItem.type === 'hexagonal' ? (
                  <>
                    <div className="form-group">
                      <label>Diameter (mm)</label>
                      <input
                        type="number"
                        value={editedItem.dimensions.diameter}
                        onChange={(e) => updateField('dimensions.diameter', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Length (mm)</label>
                      <input
                        type="number"
                        value={editedItem.dimensions.length}
                        onChange={(e) => updateField('dimensions.length', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Width (mm)</label>
                      <input
                        type="number"
                        value={editedItem.dimensions.width}
                        onChange={(e) => updateField('dimensions.width', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Depth (mm)</label>
                      <input
                        type="number"
                        value={editedItem.dimensions.depth}
                        onChange={(e) => updateField('dimensions.depth', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (mm)</label>
                      <input
                        type="number"
                        value={editedItem.dimensions.height}
                        onChange={(e) => updateField('dimensions.height', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {type === 'tool' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={editedItem.type}
                    onChange={(e) => updateField('type', e.target.value)}
                  >
                    <option value="endmill">End Mill</option>
                    <option value="drill">Drill</option>
                    <option value="turning">Turning</option>
                    <option value="boring">Boring</option>
                    <option value="threading">Threading</option>
                    <option value="grooving">Grooving</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <select
                    value={editedItem.specs.material}
                    onChange={(e) => updateField('specs.material', e.target.value)}
                  >
                    <option value="HSS">HSS</option>
                    <option value="Carbide">Carbide</option>
                    <option value="Cobalt">Cobalt</option>
                    <option value="Ceramic">Ceramic</option>
                  </select>
                </div>
              </div>

              <h4>Specifications</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Diameter (mm)</label>
                  <input
                    type="number"
                    value={editedItem.specs.diameter}
                    onChange={(e) => updateField('specs.diameter', e.target.value)}
                    step="0.1"
                  />
                </div>
                {editedItem.type === 'endmill' || editedItem.type === 'drill' ? (
                  <div className="form-group">
                    <label>Flutes</label>
                    <input
                      type="number"
                      value={editedItem.specs.flutes}
                      onChange={(e) => updateField('specs.flutes', e.target.value)}
                    />
                  </div>
                ) : null}
                <div className="form-group">
                  <label>Length (mm)</label>
                  <input
                    type="number"
                    value={editedItem.specs.length}
                    onChange={(e) => updateField('specs.length', e.target.value)}
                  />
                </div>
              </div>

              <h4>Cutting Parameters</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Cutting Speed (m/min)</label>
                  <input
                    type="number"
                    value={editedItem.cutting.vc}
                    onChange={(e) => updateField('cutting.vc', e.target.value)}
                  />
                </div>
                {editedItem.cutting.fz !== undefined && (
                  <div className="form-group">
                    <label>Feed/Tooth (mm)</label>
                    <input
                      type="number"
                      value={editedItem.cutting.fz}
                      onChange={(e) => updateField('cutting.fz', e.target.value)}
                      step="0.01"
                    />
                  </div>
                )}
                {editedItem.cutting.fn !== undefined && (
                  <div className="form-group">
                    <label>Feed/Rev (mm)</label>
                    <input
                      type="number"
                      value={editedItem.cutting.fn}
                      onChange={(e) => updateField('cutting.fn', e.target.value)}
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(editedItem)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupManager;