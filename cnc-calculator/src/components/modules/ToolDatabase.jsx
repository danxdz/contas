import React, { useState, useEffect } from 'react';

function ToolDatabase() {
  const [tools, setTools] = useState([]);
  const [editingTool, setEditingTool] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Tool form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'endmill',
    material: 'carbide',
    coating: 'altin',
    diameter: '',
    flutes: '',
    fluteLength: '',
    overallLength: '',
    shankDiameter: '',
    helixAngle: '30',
    cornerRadius: '0',
    manufacturer: '',
    partNumber: '',
    price: '',
    notes: '',
    cuttingParams: {
      aluminum: { vc: '', fz: '', ap: '', ae: '' },
      steel: { vc: '', fz: '', ap: '', ae: '' },
      stainless: { vc: '', fz: '', ap: '', ae: '' },
      titanium: { vc: '', fz: '', ap: '', ae: '' }
    },
    usageStats: {
      totalTime: 0,
      totalDistance: 0,
      partsCount: 0,
      lastUsed: null
    }
  });

  // Load tools from localStorage on mount
  useEffect(() => {
    const savedTools = localStorage.getItem('cncToolDatabase');
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        console.error('Error loading tool database:', e);
      }
    } else {
      // Load sample tools if no database exists
      loadSampleTools();
    }
  }, []);

  // Save tools to localStorage whenever they change
  useEffect(() => {
    if (tools.length > 0) {
      localStorage.setItem('cncToolDatabase', JSON.stringify(tools));
    }
  }, [tools]);

  const loadSampleTools = () => {
    const sampleTools = [
      {
        id: 'tool_1',
        name: '3-Flute Aluminum Endmill',
        type: 'endmill',
        material: 'carbide',
        coating: 'zrn',
        diameter: '10',
        flutes: '3',
        fluteLength: '30',
        overallLength: '75',
        shankDiameter: '10',
        helixAngle: '45',
        cornerRadius: '0',
        manufacturer: 'Kennametal',
        partNumber: 'KC730M',
        price: '85',
        notes: 'High performance for aluminum, excellent chip evacuation',
        cuttingParams: {
          aluminum: { vc: '400', fz: '0.15', ap: '20', ae: '5' },
          steel: { vc: '', fz: '', ap: '', ae: '' },
          stainless: { vc: '', fz: '', ap: '', ae: '' },
          titanium: { vc: '', fz: '', ap: '', ae: '' }
        },
        usageStats: {
          totalTime: 1250,
          totalDistance: 45000,
          partsCount: 125,
          lastUsed: '2024-01-15'
        }
      },
      {
        id: 'tool_2',
        name: '4-Flute General Purpose',
        type: 'endmill',
        material: 'carbide',
        coating: 'altin',
        diameter: '6',
        flutes: '4',
        fluteLength: '20',
        overallLength: '60',
        shankDiameter: '6',
        helixAngle: '30',
        cornerRadius: '0.5',
        manufacturer: 'Sandvik',
        partNumber: 'CoroMill 390',
        price: '65',
        notes: 'Versatile tool for various materials',
        cuttingParams: {
          aluminum: { vc: '250', fz: '0.08', ap: '12', ae: '3' },
          steel: { vc: '120', fz: '0.06', ap: '8', ae: '2' },
          stainless: { vc: '80', fz: '0.04', ap: '5', ae: '1.5' },
          titanium: { vc: '50', fz: '0.03', ap: '3', ae: '1' }
        },
        usageStats: {
          totalTime: 890,
          totalDistance: 32000,
          partsCount: 78,
          lastUsed: '2024-01-18'
        }
      }
    ];
    setTools(sampleTools);
  };

  const generateToolId = () => {
    return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTool) {
      // Update existing tool
      setTools(tools.map(tool => 
        tool.id === editingTool.id ? { ...formData, id: editingTool.id } : tool
      ));
    } else {
      // Add new tool
      const newTool = {
        ...formData,
        id: generateToolId(),
        usageStats: {
          totalTime: 0,
          totalDistance: 0,
          partsCount: 0,
          lastUsed: null
        }
      };
      setTools([...tools, newTool]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: 'endmill',
      material: 'carbide',
      coating: 'altin',
      diameter: '',
      flutes: '',
      fluteLength: '',
      overallLength: '',
      shankDiameter: '',
      helixAngle: '30',
      cornerRadius: '0',
      manufacturer: '',
      partNumber: '',
      price: '',
      notes: '',
      cuttingParams: {
        aluminum: { vc: '', fz: '', ap: '', ae: '' },
        steel: { vc: '', fz: '', ap: '', ae: '' },
        stainless: { vc: '', fz: '', ap: '', ae: '' },
        titanium: { vc: '', fz: '', ap: '', ae: '' }
      },
      usageStats: {
        totalTime: 0,
        totalDistance: 0,
        partsCount: 0,
        lastUsed: null
      }
    });
    setEditingTool(null);
    setShowForm(false);
  };

  const editTool = (tool) => {
    setFormData(tool);
    setEditingTool(tool);
    setShowForm(true);
  };

  const deleteTool = (toolId) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      setTools(tools.filter(tool => tool.id !== toolId));
    }
  };

  const duplicateTool = (tool) => {
    const newTool = {
      ...tool,
      id: generateToolId(),
      name: `${tool.name} (Copy)`,
      usageStats: {
        totalTime: 0,
        totalDistance: 0,
        partsCount: 0,
        lastUsed: null
      }
    };
    setTools([...tools, newTool]);
  };

  const exportDatabase = () => {
    const dataStr = JSON.stringify(tools, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tool_database_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importDatabase = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTools = JSON.parse(event.target.result);
        if (Array.isArray(importedTools)) {
          const mergeOption = window.confirm('Merge with existing tools? (Cancel to replace)');
          if (mergeOption) {
            // Merge, avoiding duplicates by checking part numbers
            const existingPartNumbers = tools.map(t => t.partNumber);
            const newTools = importedTools.filter(t => !existingPartNumbers.includes(t.partNumber));
            setTools([...tools, ...newTools]);
          } else {
            // Replace
            setTools(importedTools);
          }
        }
      } catch (error) {
        alert('Error importing database: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'Diameter', 'Flutes', 'Material', 'Coating', 'Manufacturer', 'Part Number', 'Price'];
    const csvContent = [
      headers.join(','),
      ...tools.map(tool => [
        tool.name,
        tool.type,
        tool.diameter,
        tool.flutes,
        tool.material,
        tool.coating,
        tool.manufacturer,
        tool.partNumber,
        tool.price
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tool_database_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter and sort tools
  const filteredTools = tools
    .filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || tool.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'diameter':
          return parseFloat(a.diameter) - parseFloat(b.diameter);
        case 'recent':
          return (b.usageStats.lastUsed || '').localeCompare(a.usageStats.lastUsed || '');
        case 'usage':
          return b.usageStats.totalTime - a.usageStats.totalTime;
        default:
          return 0;
      }
    });

  const updateCuttingParam = (material, param, value) => {
    setFormData({
      ...formData,
      cuttingParams: {
        ...formData.cuttingParams,
        [material]: {
          ...formData.cuttingParams[material],
          [param]: value
        }
      }
    });
  };

  return (
    <div className="calculator-section">
      <h2>Tool Database & Library</h2>
      
      <div className="form-row">
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Tool'}
        </button>
        
        <button className="btn" onClick={exportDatabase}>
          📥 Export JSON
        </button>
        
        <button className="btn" onClick={exportToCSV}>
          📊 Export CSV
        </button>
        
        <input
          type="file"
          accept=".json"
          onChange={importDatabase}
          style={{ display: 'none' }}
          id="import-file"
        />
        <label htmlFor="import-file" className="btn">
          📤 Import JSON
        </label>
      </div>
      
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="endmill">End Mills</option>
            <option value="drill">Drills</option>
            <option value="tap">Taps</option>
            <option value="reamer">Reamers</option>
            <option value="chamfer">Chamfer Mills</option>
            <option value="ballnose">Ball Nose</option>
            <option value="facemill">Face Mills</option>
          </select>
        </div>
        
        <div className="form-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="diameter">Sort by Diameter</option>
            <option value="recent">Recently Used</option>
            <option value="usage">Most Used</option>
          </select>
        </div>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="result-box" style={{ marginBottom: '20px' }}>
          <h3>{editingTool ? 'Edit Tool' : 'Add New Tool'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Tool Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Tool Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="endmill">End Mill</option>
                <option value="drill">Drill</option>
                <option value="tap">Tap</option>
                <option value="reamer">Reamer</option>
                <option value="chamfer">Chamfer Mill</option>
                <option value="ballnose">Ball Nose</option>
                <option value="facemill">Face Mill</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Material</label>
              <select 
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              >
                <option value="hss">HSS</option>
                <option value="carbide">Carbide</option>
                <option value="cobalt">Cobalt</option>
                <option value="ceramic">Ceramic</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Coating</label>
              <select 
                value={formData.coating}
                onChange={(e) => setFormData({ ...formData, coating: e.target.value })}
              >
                <option value="none">None</option>
                <option value="tin">TiN</option>
                <option value="tialn">TiAlN</option>
                <option value="altin">AlTiN</option>
                <option value="zrn">ZrN</option>
                <option value="dlc">DLC</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>
          
          <h4>Dimensions</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Diameter (mm) *</label>
              <input
                type="number"
                value={formData.diameter}
                onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Number of Flutes *</label>
              <input
                type="number"
                value={formData.flutes}
                onChange={(e) => setFormData({ ...formData, flutes: e.target.value })}
                min="1"
                max="12"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Flute Length (mm)</label>
              <input
                type="number"
                value={formData.fluteLength}
                onChange={(e) => setFormData({ ...formData, fluteLength: e.target.value })}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Overall Length (mm)</label>
              <input
                type="number"
                value={formData.overallLength}
                onChange={(e) => setFormData({ ...formData, overallLength: e.target.value })}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Shank Diameter (mm)</label>
              <input
                type="number"
                value={formData.shankDiameter}
                onChange={(e) => setFormData({ ...formData, shankDiameter: e.target.value })}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Helix Angle (°)</label>
              <input
                type="number"
                value={formData.helixAngle}
                onChange={(e) => setFormData({ ...formData, helixAngle: e.target.value })}
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label>Corner Radius (mm)</label>
              <input
                type="number"
                value={formData.cornerRadius}
                onChange={(e) => setFormData({ ...formData, cornerRadius: e.target.value })}
                step="0.01"
              />
            </div>
          </div>
          
          <h4>Tool Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Part Number</label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              style={{ width: '100%' }}
            />
          </div>
          
          <h4>Cutting Parameters (Optional)</h4>
          {['aluminum', 'steel', 'stainless', 'titanium'].map(material => (
            <div key={material} style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{material}</label>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Vc (m/min)"
                    value={formData.cuttingParams[material].vc}
                    onChange={(e) => updateCuttingParam(material, 'vc', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="fz (mm)"
                    value={formData.cuttingParams[material].fz}
                    onChange={(e) => updateCuttingParam(material, 'fz', e.target.value)}
                    step="0.001"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="ap (mm)"
                    value={formData.cuttingParams[material].ap}
                    onChange={(e) => updateCuttingParam(material, 'ap', e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="ae (mm)"
                    value={formData.cuttingParams[material].ae}
                    onChange={(e) => updateCuttingParam(material, 'ae', e.target.value)}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="form-row">
            <button type="submit" className="btn">
              {editingTool ? 'Update Tool' : 'Add Tool'}
            </button>
            <button type="button" className="btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
      
      <div className="result-box">
        <h3>Tool Library ({filteredTools.length} tools)</h3>
        
        {filteredTools.length === 0 ? (
          <p className="info-text">No tools found. Add your first tool to get started!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {filteredTools.map(tool => (
              <div key={tool.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: 'var(--card-bg)'
              }}>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{tool.name}</h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {tool.type} • Ø{tool.diameter}mm • {tool.flutes} flutes • {tool.material}/{tool.coating}
                    </div>
                    {tool.manufacturer && (
                      <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                        {tool.manufacturer} {tool.partNumber && `• ${tool.partNumber}`}
                        {tool.price && ` • $${tool.price}`}
                      </div>
                    )}
                    {tool.notes && (
                      <div style={{ fontSize: '0.85rem', marginTop: '5px', fontStyle: 'italic' }}>
                        {tool.notes}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', marginTop: '5px', color: 'var(--info)' }}>
                      Usage: {tool.usageStats.totalTime} min • {tool.usageStats.partsCount} parts
                      {tool.usageStats.lastUsed && ` • Last: ${tool.usageStats.lastUsed}`}
                    </div>
                  </div>
                  
                  <div className="form-row" style={{ flex: 0, gap: '5px' }}>
                    <button 
                      className="btn btn-small"
                      onClick={() => editTool(tool)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-small"
                      onClick={() => duplicateTool(tool)}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button 
                      className="btn btn-small"
                      onClick={() => deleteTool(tool.id)}
                      title="Delete"
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {/* Show cutting parameters if available */}
                {Object.entries(tool.cuttingParams).some(([_, params]) => params.vc) && (
                  <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <strong>Cutting Parameters:</strong>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
                      {Object.entries(tool.cuttingParams).map(([material, params]) => 
                        params.vc && (
                          <div key={material}>
                            <strong style={{ textTransform: 'capitalize' }}>{material}:</strong> 
                            {` Vc=${params.vc} fz=${params.fz} ap=${params.ap} ae=${params.ae}`}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolDatabase;