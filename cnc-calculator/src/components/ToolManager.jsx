import React, { useState } from 'react';

const ToolManager = ({ tools = [], onChange, assemblies = [] }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [viewMode, setViewMode] = useState('assemblies'); // 'assemblies' or 'simple'
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [filterByMaterial, setFilterByMaterial] = useState(false);
  
  // Standard materials database with machinability ratings
  const materials = {
    'Aluminum': {
      group: 'Non-Ferrous',
      alloys: ['6061', '7075', '2024', '5083', 'Cast'],
      hardness: '60-150 HB',
      machinability: 'Excellent',
      chipControl: 'Long chips',
      coolant: 'Optional',
      speeds: { hss: 200, carbide: 800, ceramic: 0 },
      compatibleCoatings: ['Uncoated', 'TiB2', 'DLC', 'ZrN']
    },
    'Steel': {
      group: 'Ferrous',
      alloys: ['1018', '1045', '4140', '4340', 'A36'],
      hardness: '120-300 HB',
      machinability: 'Good',
      chipControl: 'Medium chips',
      coolant: 'Recommended',
      speeds: { hss: 100, carbide: 400, ceramic: 0 },
      compatibleCoatings: ['TiN', 'TiCN', 'TiAlN', 'AlCrN']
    },
    'Stainless Steel': {
      group: 'Ferrous',
      alloys: ['304', '316', '17-4PH', '303', '410'],
      hardness: '150-300 HB',
      machinability: 'Fair',
      chipControl: 'Stringy chips',
      coolant: 'Required',
      speeds: { hss: 60, carbide: 200, ceramic: 0 },
      compatibleCoatings: ['TiAlN', 'AlTiN', 'AlCrN', 'TiCN']
    },
    'Titanium': {
      group: 'Exotic',
      alloys: ['Ti-6Al-4V', 'Grade 2', 'Grade 5', 'Ti-6242'],
      hardness: '300-400 HB',
      machinability: 'Poor',
      chipControl: 'Segmented chips',
      coolant: 'High pressure required',
      speeds: { hss: 30, carbide: 100, ceramic: 150 },
      compatibleCoatings: ['TiAlN', 'AlTiN', 'PVD', 'AlCrN']
    },
    'Inconel': {
      group: 'Super Alloy',
      alloys: ['718', '625', 'X-750', '600'],
      hardness: '250-450 HB',
      machinability: 'Very Poor',
      chipControl: 'Difficult',
      coolant: 'High pressure required',
      speeds: { hss: 20, carbide: 60, ceramic: 200 },
      compatibleCoatings: ['AlTiN', 'TiAlN', 'AlCrN', 'Ceramic']
    },
    'Cast Iron': {
      group: 'Ferrous',
      alloys: ['Gray', 'Ductile', 'Malleable', 'White'],
      hardness: '150-300 HB',
      machinability: 'Good',
      chipControl: 'Powder/Short chips',
      coolant: 'Dry or air',
      speeds: { hss: 80, carbide: 300, ceramic: 500 },
      compatibleCoatings: ['Uncoated', 'TiN', 'TiCN', 'CVD']
    },
    'Brass': {
      group: 'Non-Ferrous',
      alloys: ['360', 'C36000', '260', '353'],
      hardness: '50-100 HB',
      machinability: 'Excellent',
      chipControl: 'Short chips',
      coolant: 'Optional',
      speeds: { hss: 300, carbide: 1000, ceramic: 0 },
      compatibleCoatings: ['Uncoated', 'TiN', 'ZrN']
    },
    'Copper': {
      group: 'Non-Ferrous',
      alloys: ['C110', 'C101', 'Beryllium Copper'],
      hardness: '40-100 HB',
      machinability: 'Good',
      chipControl: 'Long chips',
      coolant: 'Recommended',
      speeds: { hss: 150, carbide: 600, ceramic: 0 },
      compatibleCoatings: ['Uncoated', 'DLC', 'TiB2']
    },
    'Plastics': {
      group: 'Non-Metallic',
      alloys: ['Acetal', 'Nylon', 'PEEK', 'PTFE', 'Polycarbonate'],
      hardness: 'Shore D 50-95',
      machinability: 'Excellent',
      chipControl: 'Continuous chips',
      coolant: 'Air or mist',
      speeds: { hss: 500, carbide: 2000, ceramic: 0 },
      compatibleCoatings: ['Uncoated', 'DLC', 'Diamond']
    },
    'Composites': {
      group: 'Non-Metallic',
      alloys: ['Carbon Fiber', 'Fiberglass', 'Kevlar'],
      hardness: 'Varies',
      machinability: 'Abrasive',
      chipControl: 'Dust/particles',
      coolant: 'Vacuum extraction',
      speeds: { hss: 0, carbide: 1000, ceramic: 0 },
      compatibleCoatings: ['Diamond', 'DLC', 'PCD']
    }
  };

  // Tool coating compatibility
  const coatingCompatibility = {
    'Uncoated': ['Aluminum', 'Brass', 'Plastics', 'Cast Iron'],
    'TiN': ['Steel', 'Cast Iron', 'Brass'],
    'TiCN': ['Steel', 'Cast Iron', 'Stainless Steel'],
    'TiAlN': ['Steel', 'Stainless Steel', 'Titanium', 'Inconel'],
    'AlTiN': ['Stainless Steel', 'Titanium', 'Inconel'],
    'AlCrN': ['Steel', 'Stainless Steel', 'Titanium', 'Inconel'],
    'DLC': ['Aluminum', 'Copper', 'Plastics', 'Composites'],
    'Diamond': ['Composites', 'Plastics'],
    'PCD': ['Composites', 'Aluminum'],
    'CVD': ['Cast Iron', 'Steel'],
    'PVD': ['Titanium', 'Stainless Steel'],
    'ZrN': ['Aluminum', 'Brass'],
    'TiB2': ['Aluminum', 'Copper']
  };
  
  const defaultTools = [
    { 
      id: 1, 
      tNumber: 'T1', 
      name: '10mm End Mill', 
      diameter: 10, 
      flutes: 4, 
      type: 'endmill',
      material: 'Carbide',
      coating: 'TiAlN',
      compatibleMaterials: ['Steel', 'Stainless Steel', 'Titanium']
    },
    { 
      id: 2, 
      tNumber: 'T2', 
      name: '6mm Drill', 
      diameter: 6, 
      type: 'drill',
      material: 'HSS-Co',
      coating: 'TiN',
      compatibleMaterials: ['Steel', 'Cast Iron', 'Brass']
    },
    { 
      id: 3, 
      tNumber: 'T3', 
      name: '50mm Face Mill', 
      diameter: 50, 
      flutes: 5, 
      type: 'facemill',
      material: 'Carbide',
      coating: 'AlTiN',
      compatibleMaterials: ['Stainless Steel', 'Titanium', 'Inconel']
    },
    { 
      id: 4, 
      tNumber: 'T4', 
      name: '8mm Slot Mill', 
      diameter: 8, 
      flutes: 2, 
      type: 'slotmill',
      material: 'Carbide',
      coating: 'Uncoated',
      compatibleMaterials: ['Aluminum', 'Brass', 'Plastics']
    },
    { 
      id: 5, 
      tNumber: 'T5', 
      name: '12mm Ball End', 
      diameter: 12, 
      flutes: 2, 
      type: 'ballend',
      material: 'Carbide',
      coating: 'DLC',
      compatibleMaterials: ['Aluminum', 'Plastics', 'Composites']
    },
  ];
  
  const currentTools = tools.length > 0 ? tools : defaultTools;
  
  // Filter tools by material compatibility
  const getFilteredTools = () => {
    if (!filterByMaterial || selectedMaterial === 'all') {
      return currentTools;
    }
    
    return currentTools.filter(tool => {
      if (!tool.compatibleMaterials) return true;
      return tool.compatibleMaterials.includes(selectedMaterial);
    });
  };

  // Filter assemblies by material compatibility
  const getFilteredAssemblies = () => {
    if (!filterByMaterial || selectedMaterial === 'all') {
      return assemblies;
    }
    
    return assemblies.filter(assembly => {
      const coating = assembly.tool?.coating;
      if (!coating) return true;
      const compatibleMats = coatingCompatibility[coating] || [];
      return compatibleMats.includes(selectedMaterial);
    });
  };
  
  const addTool = () => {
    const newTool = {
      id: Date.now(),
      tNumber: `T${currentTools.length + 1}`,
      name: 'New Tool',
      diameter: 10,
      flutes: 4,
      type: 'endmill',
      material: 'Carbide',
      coating: 'TiAlN',
      compatibleMaterials: ['Steel', 'Stainless Steel']
    };
    onChange([...currentTools, newTool]);
  };
  
  const deleteTool = (id) => {
    onChange(currentTools.filter(t => t.id !== id));
    setSelectedTool(null);
  };
  
  const updateTool = (id, updates) => {
    onChange(currentTools.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Calculate recommended cutting parameters
  const getRecommendedParameters = (tool, material) => {
    if (!material || material === 'all') return null;
    
    const mat = materials[material];
    if (!mat) return null;
    
    const toolMaterial = tool.material?.toLowerCase() || 'carbide';
    let sfm = 0;
    
    if (toolMaterial.includes('hss')) {
      sfm = mat.speeds.hss;
    } else if (toolMaterial.includes('ceramic')) {
      sfm = mat.speeds.ceramic;
    } else {
      sfm = mat.speeds.carbide;
    }
    
    const rpm = Math.round((sfm * 12) / (Math.PI * (tool.diameter / 25.4)));
    const chipLoad = tool.type === 'drill' ? 0.001 : 0.003;
    const feedRate = Math.round(rpm * chipLoad * (tool.flutes || 2));
    
    return {
      sfm,
      rpm: Math.min(rpm, 10000), // Cap at machine max
      feedRate,
      chipLoad,
      coolant: mat.coolant
    };
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Material Filter Section */}
      <div style={{
        padding: '10px',
        background: 'linear-gradient(135deg, #1a1f2e, #0a0e1a)',
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #00d4ff'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '8px'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            fontSize: '12px',
            color: '#00d4ff'
          }}>
            <input
              type="checkbox"
              checked={filterByMaterial}
              onChange={(e) => setFilterByMaterial(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Filter by Material
          </label>
        </div>
        
        {filterByMaterial && (
          <>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                background: '#0a0e1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '12px',
                marginBottom: '8px'
              }}
            >
              <option value="all">All Materials</option>
              {Object.keys(materials).map(mat => (
                <option key={mat} value={mat}>
                  {mat} ({materials[mat].group})
                </option>
              ))}
            </select>
            
            {selectedMaterial !== 'all' && (
              <div style={{
                padding: '8px',
                background: 'rgba(0, 212, 255, 0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#aaa'
              }}>
                <div><strong style={{ color: '#00d4ff' }}>{selectedMaterial}</strong></div>
                <div>Hardness: {materials[selectedMaterial].hardness}</div>
                <div>Machinability: {materials[selectedMaterial].machinability}</div>
                <div>Chip Control: {materials[selectedMaterial].chipControl}</div>
                <div>Coolant: {materials[selectedMaterial].coolant}</div>
                <div style={{ marginTop: '4px', color: '#66ff66' }}>
                  Compatible Coatings: {materials[selectedMaterial].compatibleCoatings.join(', ')}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        gap: '5px', 
        marginBottom: '10px',
        borderBottom: '2px solid #00d4ff',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setViewMode('assemblies')}
          style={{
            flex: 1,
            padding: '6px',
            background: viewMode === 'assemblies' ? '#00d4ff' : '#333',
            color: viewMode === 'assemblies' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px 0 0 4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Tool Assemblies ({getFilteredAssemblies().length})
        </button>
        <button
          onClick={() => setViewMode('simple')}
          style={{
            flex: 1,
            padding: '6px',
            background: viewMode === 'simple' ? '#00d4ff' : '#333',
            color: viewMode === 'simple' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Simple Tools ({getFilteredTools().length})
        </button>
      </div>

      {viewMode === 'assemblies' ? (
        <>
          {/* Assembly List */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
            {getFilteredAssemblies().length > 0 ? (
              getFilteredAssemblies().map((assembly, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    marginBottom: '5px',
                    background: selectedTool === assembly ? '#1a3a4a' : '#1a1f2e',
                    border: selectedTool === assembly ? '1px solid #00d4ff' : '1px solid #333',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedTool(assembly)}
                >
                  <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                    T{idx + 1}: {assembly.tool?.partNumber || 'Assembly'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    {assembly.tool?.manufacturer} - {assembly.tool?.type}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                    Ø{assembly.tool?.diameter}mm | {assembly.holder?.type}
                  </div>
                  <div style={{ fontSize: '11px', color: '#66ff66', marginTop: '2px' }}>
                    Total Length: {assembly.totalLength?.toFixed(1)}mm
                  </div>
                  {assembly.tool?.coating && (
                    <div style={{ fontSize: '11px', color: '#ffaa00', marginTop: '2px' }}>
                      Coating: {assembly.tool.coating}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '12px'
              }}>
                {filterByMaterial && selectedMaterial !== 'all' ? 
                  `No assemblies compatible with ${selectedMaterial}` :
                  'No tool assemblies created yet.'
                }
                <br />
                <br />
                Go to Tools → Real Tool System
                <br />
                to build tool assemblies.
              </div>
            )}
          </div>

          {/* Selected Assembly Details */}
          {selectedTool && viewMode === 'assemblies' && (
            <div style={{
              padding: '10px',
              background: '#0a1520',
              borderRadius: '4px',
              border: '1px solid #00d4ff'
            }}>
              <h4 style={{ color: '#00d4ff', margin: '0 0 10px 0', fontSize: '14px' }}>
                Assembly Details
              </h4>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                <div>Tool: {selectedTool.tool?.partNumber}</div>
                <div>Holder: {selectedTool.holder?.type}</div>
                <div>Stickout: {selectedTool.stickout}mm</div>
                <div>Total Length: {selectedTool.totalLength?.toFixed(1)}mm</div>
                <div>Cutting Length: {selectedTool.tool?.cuttingLength}mm</div>
                <div>Coating: {selectedTool.tool?.coating}</div>
              </div>
              
              {selectedMaterial !== 'all' && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: 'rgba(102, 255, 102, 0.1)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  <div style={{ color: '#66ff66', fontWeight: 'bold', marginBottom: '4px' }}>
                    Recommended Parameters for {selectedMaterial}:
                  </div>
                  {(() => {
                    const params = getRecommendedParameters(selectedTool.tool || {}, selectedMaterial);
                    return params ? (
                      <>
                        <div>Speed: {params.rpm} RPM ({params.sfm} SFM)</div>
                        <div>Feed: {params.feedRate} mm/min</div>
                        <div>Chip Load: {params.chipLoad.toFixed(4)}"</div>
                        <div>Coolant: {params.coolant}</div>
                      </>
                    ) : <div>No recommendations available</div>;
                  })()}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button 
              onClick={addTool}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                width: '100%'
              }}
            >
              + Add Simple Tool
            </button>
          </div>
      
          <div className="tool-list" style={{ flex: 1, overflowY: 'auto' }}>
            {getFilteredTools().map(tool => (
              <div 
                key={tool.id}
                className={`tool-item ${selectedTool?.id === tool.id ? 'selected' : ''}`}
                onClick={() => setSelectedTool(tool)}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  background: selectedTool?.id === tool.id ? '#1a3a4a' : '#1a1f2e',
                  border: selectedTool?.id === tool.id ? '1px solid #00d4ff' : '1px solid #333',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#00d4ff' }}>{tool.tNumber}</strong>
                  <span style={{ fontSize: '11px', color: '#718096' }}>{tool.type}</span>
                </div>
                <div style={{ fontSize: '12px' }}>{tool.name}</div>
                <div style={{ fontSize: '11px', color: '#718096' }}>
                  ⌀{tool.diameter}mm {tool.flutes ? `• ${tool.flutes}FL` : ''}
                </div>
                {tool.coating && (
                  <div style={{ fontSize: '11px', color: '#ffaa00', marginTop: '2px' }}>
                    {tool.material} • {tool.coating}
                  </div>
                )}
                {tool.compatibleMaterials && (
                  <div style={{ fontSize: '10px', color: '#66ff66', marginTop: '2px' }}>
                    ✓ {tool.compatibleMaterials.join(', ')}
                  </div>
                )}
              </div>
            ))}
            
            {getFilteredTools().length === 0 && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '12px'
              }}>
                No tools compatible with {selectedMaterial}
              </div>
            )}
          </div>
      
          {selectedTool && viewMode === 'simple' && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#00d4ff', fontSize: '12px' }}>
                Edit Tool
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text"
                  value={selectedTool.name}
                  onChange={(e) => updateTool(selectedTool.id, { name: e.target.value })}
                  style={{
                    padding: '4px 8px',
                    background: '#0a0e1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontSize: '11px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number"
                    value={selectedTool.diameter}
                    onChange={(e) => updateTool(selectedTool.id, { diameter: parseFloat(e.target.value) })}
                    placeholder="Diameter"
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      background: '#0a0e1a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#e0e0e0',
                      fontSize: '11px'
                    }}
                  />
                  <input 
                    type="number"
                    value={selectedTool.flutes || ''}
                    onChange={(e) => updateTool(selectedTool.id, { flutes: parseInt(e.target.value) })}
                    placeholder="Flutes"
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      background: '#0a0e1a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#e0e0e0',
                      fontSize: '11px'
                    }}
                  />
                </div>
                
                <select
                  value={selectedTool.coating || 'Uncoated'}
                  onChange={(e) => updateTool(selectedTool.id, { 
                    coating: e.target.value,
                    compatibleMaterials: Object.keys(coatingCompatibility[e.target.value] || {})
                  })}
                  style={{
                    padding: '4px 8px',
                    background: '#0a0e1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontSize: '11px'
                  }}
                >
                  {Object.keys(coatingCompatibility).map(coating => (
                    <option key={coating} value={coating}>{coating}</option>
                  ))}
                </select>
                
                {selectedMaterial !== 'all' && (
                  <div style={{
                    padding: '8px',
                    background: 'rgba(102, 255, 102, 0.1)',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <div style={{ color: '#66ff66', fontWeight: 'bold', marginBottom: '4px' }}>
                      Cutting Parameters for {selectedMaterial}:
                    </div>
                    {(() => {
                      const params = getRecommendedParameters(selectedTool, selectedMaterial);
                      return params ? (
                        <>
                          <div>Speed: {params.rpm} RPM</div>
                          <div>Feed: {params.feedRate} mm/min</div>
                          <div>Coolant: {params.coolant}</div>
                        </>
                      ) : <div>No recommendations available</div>;
                    })()}
                  </div>
                )}
                
                <button 
                  onClick={() => deleteTool(selectedTool.id)}
                  style={{
                    padding: '4px 8px',
                    background: '#ff4444',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Delete Tool
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ToolManager;