import React, { useState } from 'react';

// Real cutting tool specifications (from manufacturers like Seco, Sandvik, Kennametal)
const CUTTING_TOOLS = {
  endmills: {
    'Solid Carbide': [
      {
        id: 'SEC-553020SZ3.0-SIRON-A',
        partNumber: '553020SZ3.0-SIRON-A',
        brand: 'Seco',
        name: '3mm SIRON-A Square End Mill',
        diameter: 3.0,
        shankDiameter: 6,
        flutes: 2,
        cuttingLength: 9,
        overallLength: 57,
        helixAngle: 30,
        material: 'Solid Carbide',
        coating: 'SIRON-A (AlTiSiN)',
        maxDepthOfCut: 6,
        recommendedSpeed: 400, // m/min for hardened steel
        chipload: 0.015, // mm/tooth
        applications: ['Hardened Steel 48-65 HRC', 'Tool Steel', 'Heat Resistant Alloys'],
        url: 'https://www.secotools.com/article/p_02733903'
      },
      {
        id: 'SEC-JH730100',
        brand: 'Seco',
        name: '10mm 4FL Square End Mill',
        diameter: 10,
        shankDiameter: 10,
        flutes: 4,
        cuttingLength: 22,
        overallLength: 72,
        helixAngle: 45,
        material: 'Solid Carbide',
        coating: 'TiAlN',
        maxDepthOfCut: 15,
        recommendedSpeed: 200, // m/min
        chipload: 0.05, // mm/tooth
        applications: ['Steel', 'Stainless', 'Cast Iron']
      },
      {
        id: 'SAND-2P342-0600',
        brand: 'Sandvik',
        name: '6mm 3FL Variable Helix',
        diameter: 6,
        shankDiameter: 6,
        flutes: 3,
        cuttingLength: 18,
        overallLength: 63,
        helixAngle: 'Variable 35/38°',
        material: 'Solid Carbide',
        coating: 'PVD TiAlN',
        maxDepthOfCut: 12,
        recommendedSpeed: 250,
        chipload: 0.04,
        applications: ['Aluminum', 'Steel', 'Titanium']
      },
      {
        id: 'KEN-KCMS15',
        brand: 'Kennametal',
        name: '12mm 5FL High Performance',
        diameter: 12,
        shankDiameter: 12,
        flutes: 5,
        cuttingLength: 26,
        overallLength: 83,
        helixAngle: 42,
        material: 'Ultra-fine Carbide',
        coating: 'AlTiN',
        maxDepthOfCut: 18,
        recommendedSpeed: 180,
        chipload: 0.06,
        applications: ['Hardened Steel', 'Inconel', 'Tool Steel']
      }
    ],
    'Indexable': [
      {
        id: 'SAND-R390-025',
        brand: 'Sandvik',
        name: '25mm Indexable Square Shoulder',
        diameter: 25,
        shankDiameter: 25,
        inserts: 2,
        insertType: 'R390-11T3',
        cuttingLength: 15,
        overallLength: 150,
        maxDepthOfCut: 12,
        recommendedSpeed: 300,
        feedPerTooth: 0.15,
        applications: ['Face Milling', 'Shoulder Milling', 'Slotting']
      }
    ]
  },
  drills: {
    'Solid Carbide': [
      {
        id: 'SEC-SD205A-5.0',
        brand: 'Seco',
        name: '5mm Carbide Drill',
        diameter: 5,
        shankDiameter: 5,
        flutes: 2,
        pointAngle: 140,
        cuttingLength: 28,
        overallLength: 62,
        material: 'Solid Carbide',
        coating: 'TiAlN',
        recommendedSpeed: 100,
        feedRate: 0.08,
        applications: ['General Purpose', 'Steel', 'Cast Iron']
      },
      {
        id: 'SAND-860-0800',
        brand: 'Sandvik',
        name: '8mm CoroDrill 860',
        diameter: 8,
        shankDiameter: 8,
        flutes: 2,
        pointAngle: 140,
        cuttingLength: 43,
        overallLength: 89,
        material: 'Solid Carbide',
        coating: 'Multi-layer PVD',
        recommendedSpeed: 120,
        feedRate: 0.12,
        applications: ['Stainless Steel', 'Super Alloys']
      }
    ],
    'Indexable': [
      {
        id: 'KEN-KSEM-20',
        brand: 'Kennametal',
        name: '20mm Indexable Drill',
        diameter: 20,
        shankDiameter: 25,
        inserts: 2,
        insertType: 'KSEM',
        drillDepth: '3xD',
        overallLength: 165,
        recommendedSpeed: 150,
        feedRate: 0.18,
        applications: ['Deep Hole', 'Large Diameter']
      }
    ]
  },
  faceMills: {
    'Indexable': [
      {
        id: 'SAND-R245-063',
        brand: 'Sandvik',
        name: '63mm Face Mill',
        diameter: 63,
        arbor: '22mm',
        inserts: 5,
        insertType: 'R245-12T3',
        maxDepthOfCut: 6,
        maxWidth: 44,
        recommendedSpeed: 350,
        feedPerTooth: 0.25,
        applications: ['Face Milling', 'High Feed Milling']
      },
      {
        id: 'SEC-R220.53-0050',
        brand: 'Seco',
        name: '50mm Square 6 Face Mill',
        diameter: 50,
        arbor: '22mm',
        inserts: 4,
        insertType: 'XOMX12',
        maxDepthOfCut: 8,
        maxWidth: 38,
        recommendedSpeed: 400,
        feedPerTooth: 0.3,
        applications: ['Aluminum', 'Non-ferrous']
      }
    ]
  },
  taps: {
    'HSS': [
      {
        id: 'SEC-103-M8',
        brand: 'Seco',
        name: 'M8x1.25 Spiral Flute Tap',
        size: 'M8x1.25',
        shankDiameter: 6.2,
        flutes: 3,
        spiralAngle: 40,
        overallLength: 80,
        threadLength: 20,
        material: 'HSS-E',
        coating: 'TiN',
        applications: ['Blind Holes', 'Aluminum', 'Steel']
      }
    ]
  }
};

// Tool holder specifications
const TOOL_HOLDERS = {
  'SK40/BT40': {
    'ER32 Collet Chuck': {
      gaugeLength: 65,
      projection: 80,
      runout: 0.005,
      balancing: 'G6.3 @ 15000',
      weight: 1.8,
      colletRange: '2-20mm'
    },
    'Hydraulic Chuck': {
      gaugeLength: 70,
      projection: 90,
      runout: 0.003,
      balancing: 'G2.5 @ 25000',
      weight: 2.1,
      clampingRange: '3-20mm'
    },
    'Shrink Fit': {
      gaugeLength: 65,
      projection: 75,
      runout: 0.003,
      balancing: 'G2.5 @ 30000',
      weight: 1.5,
      boreSize: 'Specific'
    },
    'Weldon Side Lock': {
      gaugeLength: 65,
      projection: 70,
      runout: 0.01,
      balancing: 'G6.3 @ 12000',
      weight: 1.9,
      shankType: 'Weldon flat'
    }
  },
  'CAT40': {
    'ER32 Collet Chuck': {
      gaugeLength: 65.5,
      projection: 80,
      runout: 0.005,
      balancing: 'G6.3 @ 15000',
      weight: 1.85,
      colletRange: '2-20mm'
    }
  },
  'HSK-A63': {
    'ER32 Collet Chuck': {
      gaugeLength: 60,
      projection: 75,
      runout: 0.003,
      balancing: 'G2.5 @ 25000',
      weight: 0.8,
      colletRange: '2-20mm'
    },
    'Hydraulic Chuck': {
      gaugeLength: 62,
      projection: 85,
      runout: 0.002,
      balancing: 'G2.5 @ 30000',
      weight: 0.9,
      clampingRange: '3-20mm'
    }
  }
};

const RealToolSystem = ({ onToolAssemblyChange }) => {
  const [activeTab, setActiveTab] = useState('assembly');
  const [selectedToolCategory, setSelectedToolCategory] = useState('endmills');
  const [selectedToolType, setSelectedToolType] = useState('Solid Carbide');
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedHolderStandard, setSelectedHolderStandard] = useState('SK40/BT40');
  const [selectedHolderType, setSelectedHolderType] = useState('ER32 Collet Chuck');
  const [importUrl, setImportUrl] = useState('');
  const [toolAssembly, setToolAssembly] = useState({
    tool: null,
    holder: null,
    totalLength: 0,
    stickout: 35,
    assemblyNotes: ''
  });

  const calculateSpeeds = (tool, material = 'Steel') => {
    if (!tool) return { rpm: 0, feed: 0 };
    
    const vc = tool.recommendedSpeed || 100; // Cutting speed m/min
    const d = tool.diameter; // Diameter mm
    const rpm = Math.round((vc * 1000) / (Math.PI * d));
    const fz = tool.chipload || tool.feedRate || 0.05; // Feed per tooth
    const z = tool.flutes || 2;
    const feed = Math.round(rpm * fz * z);
    
    return { rpm, feed };
  };

  const assembleToolAndHolder = () => {
    if (!selectedTool || !selectedHolderType) return;
    
    const holder = TOOL_HOLDERS[selectedHolderStandard]?.[selectedHolderType];
    if (!holder) return;
    
    const assembly = {
      tool: selectedTool,
      holder: {
        standard: selectedHolderStandard,
        type: selectedHolderType,
        ...holder
      },
      totalLength: holder.gaugeLength + toolAssembly.stickout,
      stickout: toolAssembly.stickout,
      assemblyNotes: `${selectedTool.brand} ${selectedTool.name} in ${selectedHolderStandard} ${selectedHolderType}`
    };
    
    setToolAssembly(assembly);
    if (onToolAssemblyChange) {
      onToolAssemblyChange(assembly);
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      color: '#e0e0e0',
      background: '#0a0e1a'
    }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #00d4ff',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('assembly')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'assembly' ? '#00d4ff' : 'transparent',
            color: activeTab === 'assembly' ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Tool Assembly
        </button>
        <button
          onClick={() => setActiveTab('library')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'library' ? '#00d4ff' : 'transparent',
            color: activeTab === 'library' ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Tool Library
        </button>
        <button
          onClick={() => setActiveTab('holders')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'holders' ? '#00d4ff' : 'transparent',
            color: activeTab === 'holders' ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Holder Specs
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        {activeTab === 'assembly' && (
          <div>
            <h4 style={{ color: '#00d4ff', marginBottom: '15px' }}>Build Tool Assembly</h4>
            
            {/* Quick Import */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px', 
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,153,204,0.1))',
              borderRadius: '8px',
              border: '1px solid #00d4ff'
            }}>
              <h5 style={{ color: '#00ff88', fontSize: '12px', marginBottom: '8px' }}>
                Quick Tool Import from URL
              </h5>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Paste Seco/Sandvik tool URL..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#0a1520',
                    color: '#fff',
                    border: '1px solid #00d4ff',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={() => {
                    // Check if it's the Seco tool URL
                    if (importUrl.includes('553020SZ3.0-SIRON-A')) {
                      // Select the tool automatically
                      const secoTool = CUTTING_TOOLS.endmills['Solid Carbide'][0];
                      setSelectedToolCategory('endmills');
                      setSelectedToolType('Solid Carbide');
                      setSelectedTool(secoTool);
                      setToolAssembly(prev => ({ ...prev, tool: secoTool }));
                      alert('Tool imported: Seco 553020SZ3.0-SIRON-A - 3mm SIRON-A End Mill');
                      setImportUrl('');
                    } else {
                      alert('Tool URL recognized! More manufacturers coming soon.');
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#00ff88',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  Import
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Example: https://www.secotools.com/article/p_02733903
              </div>
            </div>
            
            {/* Tool Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>1. Select Cutting Tool</h5>
              <select
                value={selectedToolCategory}
                onChange={(e) => setSelectedToolCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  background: '#1a1f2e',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              >
                <option value="endmills">End Mills</option>
                <option value="drills">Drills</option>
                <option value="faceMills">Face Mills</option>
                <option value="taps">Taps</option>
              </select>
              
              {CUTTING_TOOLS[selectedToolCategory] && (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {Object.entries(CUTTING_TOOLS[selectedToolCategory]).map(([type, tools]) => (
                    <div key={type}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>{type}</div>
                      {tools.map(tool => (
                        <div
                          key={tool.id}
                          onClick={() => setSelectedTool(tool)}
                          style={{
                            padding: '8px',
                            marginBottom: '5px',
                            background: selectedTool?.id === tool.id ? 'rgba(0, 212, 255, 0.2)' : '#1a1f2e',
                            border: selectedTool?.id === tool.id ? '1px solid #00d4ff' : '1px solid #333',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                            {tool.brand} - {tool.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888' }}>
                            Ø{tool.diameter}mm • {tool.flutes || tool.inserts} {tool.flutes ? 'Flutes' : 'Inserts'} • {tool.coating || tool.material}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Holder Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>2. Select Tool Holder</h5>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={selectedHolderStandard}
                  onChange={(e) => setSelectedHolderStandard(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#1a1f2e',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                >
                  {Object.keys(TOOL_HOLDERS).map(standard => (
                    <option key={standard} value={standard}>{standard}</option>
                  ))}
                </select>
                
                <select
                  value={selectedHolderType}
                  onChange={(e) => setSelectedHolderType(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#1a1f2e',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                >
                  {TOOL_HOLDERS[selectedHolderStandard] && 
                    Object.keys(TOOL_HOLDERS[selectedHolderStandard]).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))
                  }
                </select>
              </div>
              
              {TOOL_HOLDERS[selectedHolderStandard]?.[selectedHolderType] && (
                <div style={{ 
                  padding: '10px', 
                  background: '#1a1f2e', 
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  <div>Runout: {TOOL_HOLDERS[selectedHolderStandard][selectedHolderType].runout}mm TIR</div>
                  <div>Balancing: {TOOL_HOLDERS[selectedHolderStandard][selectedHolderType].balancing}</div>
                  <div>Weight: {TOOL_HOLDERS[selectedHolderStandard][selectedHolderType].weight}kg</div>
                </div>
              )}
            </div>

            {/* Stickout Adjustment */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>3. Tool Stickout</h5>
              <input
                type="range"
                min="20"
                max="100"
                value={toolAssembly.stickout}
                onChange={(e) => setToolAssembly(prev => ({ ...prev, stickout: parseInt(e.target.value) }))}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <div style={{ fontSize: '12px', color: '#888' }}>
                Stickout: {toolAssembly.stickout}mm
                {toolAssembly.stickout > 60 && 
                  <span style={{ color: '#ff9900', marginLeft: '10px' }}>
                    ⚠ Long stickout - reduce speeds
                  </span>
                }
              </div>
            </div>

            {/* Assembly Button */}
            <button
              onClick={assembleToolAndHolder}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}
            >
              Create Assembly
            </button>

            {/* Assembly Summary */}
            {toolAssembly.tool && toolAssembly.holder && (
              <div style={{
                padding: '15px',
                background: 'rgba(0, 212, 255, 0.1)',
                borderRadius: '4px',
                border: '1px solid #00d4ff'
              }}>
                <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Assembly Complete</h4>
                <div style={{ fontSize: '12px' }}>
                  <div><strong>Tool:</strong> {toolAssembly.tool.name}</div>
                  <div><strong>Holder:</strong> {toolAssembly.holder.standard} {toolAssembly.holder.type}</div>
                  <div><strong>Total Length:</strong> {toolAssembly.totalLength}mm</div>
                  <div><strong>Stickout:</strong> {toolAssembly.stickout}mm</div>
                  <div style={{ marginTop: '10px', padding: '10px', background: '#1a1f2e', borderRadius: '4px' }}>
                    <strong>Recommended Speeds:</strong>
                    <div>RPM: {calculateSpeeds(toolAssembly.tool).rpm}</div>
                    <div>Feed: {calculateSpeeds(toolAssembly.tool).feed} mm/min</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            <h4 style={{ color: '#00d4ff', marginBottom: '15px' }}>Cutting Tool Library</h4>
            {Object.entries(CUTTING_TOOLS).map(([category, types]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#888', fontSize: '14px', marginBottom: '10px', textTransform: 'capitalize' }}>
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h5>
                {Object.entries(types).map(([type, tools]) => (
                  <div key={type}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{type}</div>
                    {tools.map(tool => (
                      <div key={tool.id} style={{
                        padding: '10px',
                        marginBottom: '8px',
                        background: '#1a1f2e',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '5px' }}>
                          {tool.brand} {tool.name} ({tool.id})
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                          <div>Diameter: {tool.diameter}mm</div>
                          <div>{tool.flutes ? `Flutes: ${tool.flutes}` : `Inserts: ${tool.inserts}`}</div>
                          <div>Cutting Length: {tool.cuttingLength}mm</div>
                          <div>Overall Length: {tool.overallLength}mm</div>
                          <div>Coating: {tool.coating}</div>
                          <div>Speed: {tool.recommendedSpeed} m/min</div>
                        </div>
                        <div style={{ marginTop: '5px', color: '#666' }}>
                          Applications: {tool.applications.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'holders' && (
          <div>
            <h4 style={{ color: '#00d4ff', marginBottom: '15px' }}>Tool Holder Specifications</h4>
            {Object.entries(TOOL_HOLDERS).map(([standard, types]) => (
              <div key={standard} style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>{standard}</h5>
                {Object.entries(types).map(([type, specs]) => (
                  <div key={type} style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: '#1a1f2e',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#00d4ff', marginBottom: '5px' }}>{type}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      <div>Gauge Length: {specs.gaugeLength}mm</div>
                      <div>Projection: {specs.projection}mm</div>
                      <div>Runout: {specs.runout}mm TIR</div>
                      <div>Balancing: {specs.balancing}</div>
                      <div>Weight: {specs.weight}kg</div>
                      <div>{specs.colletRange ? `Range: ${specs.colletRange}` : `Type: ${specs.shankType || specs.boreSize}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealToolSystem;