import React, { useState, useEffect } from 'react';
import Tool3DImporter from './Tool3DImporter';

// ISO/DIN Standard Tool Holder Dimensions
const HOLDER_STANDARDS = {
  'ISO30': {
    taper: 'ISO 30',
    bigEnd: 31.75,
    gaugeLength: 48.4,
    pullStud: 'M12',
    maxRPM: 20000,
    weight: 1.2
  },
  'ISO40': {
    taper: 'ISO 40', 
    bigEnd: 44.45,
    gaugeLength: 65.4,
    pullStud: 'M16',
    maxRPM: 15000,
    weight: 2.5
  },
  'ISO50': {
    taper: 'ISO 50',
    bigEnd: 69.85,
    gaugeLength: 101.6,
    pullStud: 'M24',
    maxRPM: 10000,
    weight: 6.8
  },
  'BT30': {
    taper: 'BT 30 (JIS)',
    bigEnd: 31.75,
    gaugeLength: 48.0,
    pullStud: 'MAS-BT30',
    maxRPM: 20000,
    weight: 1.1
  },
  'BT40': {
    taper: 'BT 40 (JIS)',
    bigEnd: 44.45,
    gaugeLength: 65.0,
    pullStud: 'MAS-BT40',
    maxRPM: 15000,
    weight: 2.3
  },
  'CAT40': {
    taper: 'CAT 40 (ANSI)',
    bigEnd: 44.45,
    gaugeLength: 89.0,
    pullStud: '5/8"-11',
    maxRPM: 15000,
    weight: 2.8
  },
  'CAT50': {
    taper: 'CAT 50 (ANSI)',
    bigEnd: 69.85,
    gaugeLength: 135.0,
    pullStud: '1"-8',
    maxRPM: 10000,
    weight: 7.5
  },
  'HSK-A63': {
    taper: 'HSK-A63',
    bigEnd: 63.0,
    gaugeLength: 60.0,
    pullStud: 'None (Face contact)',
    maxRPM: 25000,
    weight: 1.0
  }
};

// Real cutting tools from manufacturers
const REAL_TOOLS = [
  // SECO Tools
  {
    id: 'SECO-553020SZ3.0-SIRON-A',
    manufacturer: 'Seco Tools',
    partNumber: '553020SZ3.0-SIRON-A',
    description: '3mm Square End Mill SIRON-A',
    type: 'End Mill',
    diameter: 3.0,
    shankDiameter: 6.0,
    flutes: 2,
    cuttingLength: 9,
    overallLength: 57,
    coating: 'SIRON-A (AlTiSiN)',
    substrate: 'Micro Grain Carbide',
    helixAngle: 30,
    application: 'Hardened Steel 48-65 HRC',
    cuttingSpeed: 400, // m/min
    feedPerTooth: 0.015, // mm
    price: 89.50,
    inStock: true
  },
  {
    id: 'SECO-JS554100E2C.500Z4',
    manufacturer: 'Seco Tools',
    partNumber: 'JS554100E2C.500Z4',
    description: '10mm High Performance End Mill',
    type: 'End Mill',
    diameter: 10.0,
    shankDiameter: 10.0,
    flutes: 4,
    cuttingLength: 22,
    overallLength: 72,
    coating: 'TiAlN',
    substrate: 'Ultra Fine Carbide',
    helixAngle: 45,
    application: 'General Milling - Steel, Stainless',
    cuttingSpeed: 200,
    feedPerTooth: 0.05,
    price: 145.00,
    inStock: true
  },
  // SANDVIK Tools
  {
    id: 'SANDVIK-2P342-0600-PA-1630',
    manufacturer: 'Sandvik Coromant',
    partNumber: '2P342-0600-PA 1630',
    description: '6mm CoroMill Plura HD',
    type: 'End Mill',
    diameter: 6.0,
    shankDiameter: 6.0,
    flutes: 4,
    cuttingLength: 13,
    overallLength: 57,
    coating: 'PVD AlCrN',
    substrate: 'GC1630 Grade',
    helixAngle: 42,
    application: 'ISO P - Steel',
    cuttingSpeed: 250,
    feedPerTooth: 0.03,
    price: 112.00,
    inStock: true
  },
  {
    id: 'SANDVIK-R216.24-16050-BS32P',
    manufacturer: 'Sandvik Coromant',
    partNumber: 'R216.24-16050-BS32P',
    description: '16mm Ball Nose CoroMill 216',
    type: 'Ball Mill',
    diameter: 16.0,
    shankDiameter: 16.0,
    flutes: 2,
    cuttingLength: 32,
    overallLength: 92,
    coating: 'TiAlN',
    substrate: '1P240 Grade',
    helixAngle: 30,
    application: 'Die & Mold, 3D Profiling',
    cuttingSpeed: 180,
    feedPerTooth: 0.08,
    price: 225.00,
    inStock: true
  },
  // KENNAMETAL Tools
  {
    id: 'KENNAMETAL-KSEM0800AFPN-KC643M',
    manufacturer: 'Kennametal',
    partNumber: 'KSEM0800AFPN KC643M',
    description: '8mm 4-Flute AlTiN End Mill',
    type: 'End Mill',
    diameter: 8.0,
    shankDiameter: 8.0,
    flutes: 4,
    cuttingLength: 19,
    overallLength: 63,
    coating: 'AlTiN Nano',
    substrate: 'KC643M Grade',
    helixAngle: 38,
    application: 'High Temp Alloys, Titanium',
    cuttingSpeed: 150,
    feedPerTooth: 0.04,
    price: 158.00,
    inStock: true
  },
  // WALTER Tools
  {
    id: 'WALTER-MC232-12.0A4C-WJ30TA',
    manufacturer: 'Walter',
    partNumber: 'MC232-12.0A4C-WJ30TA',
    description: '12mm Prototyp Protomax Ti',
    type: 'End Mill',
    diameter: 12.0,
    shankDiameter: 12.0,
    flutes: 4,
    cuttingLength: 26,
    overallLength: 83,
    coating: 'TiAlN+WJ30TA',
    substrate: 'Carbide',
    helixAngle: 'Variable 38/41°',
    application: 'Titanium, Inconel',
    cuttingSpeed: 120,
    feedPerTooth: 0.06,
    price: 189.00,
    inStock: true
  },
  // ISCAR Tools
  {
    id: 'ISCAR-EC-E4L-10-22C10-72',
    manufacturer: 'Iscar',
    partNumber: 'EC-E4L 10-22C10-72',
    description: '10mm CHATTERFREE End Mill',
    type: 'End Mill',
    diameter: 10.0,
    shankDiameter: 10.0,
    flutes: 4,
    cuttingLength: 22,
    overallLength: 72,
    coating: 'IC902 AlTiN+TiN',
    substrate: 'Carbide',
    helixAngle: 'Variable Pitch',
    application: 'Anti-Vibration, Deep Pockets',
    cuttingSpeed: 180,
    feedPerTooth: 0.045,
    price: 167.00,
    inStock: true
  }
];

// Collet standards (DIN 6499)
const COLLET_SYSTEMS = {
  'ER16': { range: '1-10mm', accuracy: '0.005mm', maxRPM: 30000 },
  'ER20': { range: '1-13mm', accuracy: '0.005mm', maxRPM: 28000 },
  'ER25': { range: '1-16mm', accuracy: '0.005mm', maxRPM: 25000 },
  'ER32': { range: '2-20mm', accuracy: '0.005mm', maxRPM: 22000 },
  'ER40': { range: '3-26mm', accuracy: '0.008mm', maxRPM: 18000 }
};

const ProfessionalToolSystem = ({ onToolAssemblyChange }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedHolder, setSelectedHolder] = useState('ISO40');
  const [selectedCollet, setSelectedCollet] = useState('ER32');
  const [stickout, setStickout] = useState(35);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('All');
  const [importUrl, setImportUrl] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library', '3d-import', 'assembly'
  const [imported3DModel, setImported3DModel] = useState(null);
  
  // Calculate assembly
  const calculateAssembly = () => {
    if (!selectedTool) return null;
    
    const holder = HOLDER_STANDARDS[selectedHolder];
    const totalLength = holder.gaugeLength + stickout + selectedTool.cuttingLength;
    
    return {
      tool: selectedTool,
      holder: {
        standard: selectedHolder,
        ...holder,
        collet: selectedCollet
      },
      stickout,
      totalLength,
      maxRPM: Math.min(holder.maxRPM, 60000 / (Math.PI * selectedTool.diameter) * selectedTool.cuttingSpeed),
      timestamp: new Date().toISOString()
    };
  };
  
  // Import tool from URL
  const importFromUrl = () => {
    // Check for known tool patterns in URL
    const patterns = [
      { regex: /553020SZ3\.0-SIRON-A/i, toolId: 'SECO-553020SZ3.0-SIRON-A' },
      { regex: /JS554100E2C/i, toolId: 'SECO-JS554100E2C.500Z4' },
      { regex: /2P342-0600/i, toolId: 'SANDVIK-2P342-0600-PA-1630' },
      { regex: /R216\.24/i, toolId: 'SANDVIK-R216.24-16050-BS32P' },
      { regex: /KSEM0800/i, toolId: 'KENNAMETAL-KSEM0800AFPN-KC643M' },
      { regex: /MC232/i, toolId: 'WALTER-MC232-12.0A4C-WJ30TA' },
      { regex: /EC-E4L/i, toolId: 'ISCAR-EC-E4L-10-22C10-72' }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(importUrl)) {
        const tool = REAL_TOOLS.find(t => t.id === pattern.toolId);
        if (tool) {
          setSelectedTool(tool);
          setImportUrl('');
          return;
        }
      }
    }
    
    alert('Tool not found. Please check the URL or part number.');
  };
  
  // Filter tools
  const filteredTools = REAL_TOOLS.filter(tool => {
    const matchesSearch = searchTerm === '' || 
      tool.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = filterManufacturer === 'All' || 
      tool.manufacturer === filterManufacturer;
    return matchesSearch && matchesManufacturer;
  });
  
  // Get unique manufacturers
  const manufacturers = ['All', ...new Set(REAL_TOOLS.map(t => t.manufacturer))];
  
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#0a0e1a',
      color: '#e0e0e0'
    }}>
      <h3 style={{ color: '#00d4ff', padding: '15px', margin: 0 }}>
        Professional Tool Management System
      </h3>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #00d4ff',
        background: '#1a1f2e'
      }}>
        <button
          onClick={() => setActiveTab('library')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'library' ? '#00d4ff' : 'transparent',
            color: activeTab === 'library' ? '#000' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'library' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          📚 Tool Library
        </button>
        <button
          onClick={() => setActiveTab('3d-import')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === '3d-import' ? '#00d4ff' : 'transparent',
            color: activeTab === '3d-import' ? '#000' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === '3d-import' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          🎯 3D Import
        </button>
        <button
          onClick={() => setActiveTab('assembly')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'assembly' ? '#00d4ff' : 'transparent',
            color: activeTab === 'assembly' ? '#000' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'assembly' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          🔧 Assembly Builder
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'library' && (
        <>
          {/* Import Section */}
          <div style={{ 
            padding: '15px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,153,204,0.05))',
            borderBottom: '1px solid #333'
          }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Paste tool URL or part number..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#1a1f2e',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={importFromUrl}
                style={{
                  padding: '8px 20px',
                  background: '#00ff88',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Import
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', gap: '10px', padding: '15px', overflow: 'hidden' }}>
        
        {/* Tool Selection */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>
            CUTTING TOOLS LIBRARY
          </h4>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#1a1f2e',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
            >
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#1a1f2e',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
            />
          </div>
          
          {/* Tool List */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            border: '1px solid #333',
            borderRadius: '4px',
            background: '#0a1520'
          }}>
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #222',
                  cursor: 'pointer',
                  background: selectedTool?.id === tool.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedTool?.id === tool.id ? 'rgba(0,212,255,0.1)' : 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#00d4ff', fontSize: '11px' }}>
                    {tool.partNumber}
                  </strong>
                  <span style={{ color: tool.inStock ? '#00ff88' : '#ff4444', fontSize: '10px' }}>
                    {tool.inStock ? '✓ In Stock' : 'Order'}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {tool.manufacturer} | {tool.type} | Ø{tool.diameter}mm
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  {tool.coating} | {tool.flutes}FL | €{tool.price}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Assembly Configuration */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>
            TOOL ASSEMBLY
          </h4>
          
          {selectedTool ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Selected Tool Info */}
              <div style={{ 
                padding: '10px',
                background: '#1a1f2e',
                borderRadius: '4px',
                border: '1px solid #00d4ff'
              }}>
                <h5 style={{ color: '#00ff88', margin: '0 0 8px 0', fontSize: '12px' }}>
                  Selected Tool
                </h5>
                <div style={{ fontSize: '11px', color: '#ccc' }}>
                  <div>{selectedTool.manufacturer}</div>
                  <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                    {selectedTool.partNumber}
                  </div>
                  <div>{selectedTool.description}</div>
                  <div style={{ marginTop: '5px', color: '#888' }}>
                    Ø{selectedTool.diameter}mm | {selectedTool.flutes}FL | L={selectedTool.cuttingLength}mm
                  </div>
                </div>
              </div>
              
              {/* Holder Selection */}
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>Tool Holder Standard</label>
                <select
                  value={selectedHolder}
                  onChange={(e) => setSelectedHolder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '5px',
                    background: '#1a1f2e',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                >
                  {Object.keys(HOLDER_STANDARDS).map(key => (
                    <option key={key} value={key}>
                      {key} - {HOLDER_STANDARDS[key].taper}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Collet Selection */}
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>Collet System</label>
                <select
                  value={selectedCollet}
                  onChange={(e) => setSelectedCollet(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '5px',
                    background: '#1a1f2e',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                >
                  {Object.keys(COLLET_SYSTEMS).map(key => (
                    <option key={key} value={key}>
                      {key} ({COLLET_SYSTEMS[key].range})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Stickout */}
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>
                  Tool Stickout: {stickout}mm
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={stickout}
                  onChange={(e) => setStickout(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '5px' }}
                />
              </div>
              
              {/* Assembly Summary */}
              {calculateAssembly() && (
                <div style={{ 
                  padding: '10px',
                  background: '#0a1520',
                  borderRadius: '4px',
                  border: '1px solid #00d4ff'
                }}>
                  <h5 style={{ color: '#00d4ff', margin: '0 0 8px 0', fontSize: '12px' }}>
                    Assembly Summary
                  </h5>
                  <div style={{ fontSize: '11px', color: '#ccc' }}>
                    <div>Total Length: <strong style={{ color: '#00ff88' }}>
                      {calculateAssembly().totalLength.toFixed(1)}mm
                    </strong></div>
                    <div>Max RPM: {Math.round(calculateAssembly().maxRPM)}</div>
                    <div>Holder: {HOLDER_STANDARDS[selectedHolder].taper}</div>
                    <div>Pull Stud: {HOLDER_STANDARDS[selectedHolder].pullStud}</div>
                  </div>
                </div>
              )}
              
              {/* Create Assembly Button */}
              <button
                onClick={() => {
                  const assembly = calculateAssembly();
                  if (assembly && onToolAssemblyChange) {
                    onToolAssemblyChange(assembly);
                  }
                }}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                CREATE TOOL ASSEMBLY
              </button>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#666',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              Select a tool from the library or import from URL
            </div>
          )}
        </div>
      </div>
      
      {/* Cutting Parameters */}
      {selectedTool && (
        <div style={{ 
          padding: '15px',
          background: '#1a1f2e',
          borderTop: '1px solid #333'
        }}>
          <h5 style={{ color: '#888', fontSize: '11px', margin: '0 0 8px 0' }}>
            RECOMMENDED CUTTING PARAMETERS
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '10px' }}>
            <div>
              <div style={{ color: '#666' }}>Speed</div>
              <div style={{ color: '#00d4ff' }}>{selectedTool.cuttingSpeed} m/min</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Feed/Tooth</div>
              <div style={{ color: '#00d4ff' }}>{selectedTool.feedPerTooth} mm</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Application</div>
              <div style={{ color: '#00d4ff' }}>{selectedTool.application}</div>
            </div>
            <div>
              <div style={{ color: '#666' }}>Helix</div>
              <div style={{ color: '#00d4ff' }}>{selectedTool.helixAngle}°</div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
      
      {/* 3D Import Tab */}
      {activeTab === '3d-import' && (
        <div style={{ padding: '15px' }}>
          <Tool3DImporter
            onModelLoaded={(model) => {
              setImported3DModel(model);
              // Update the 3D scene if callback exists
              if (window.updateTool3D) {
                window.updateTool3D({ model3D: model });
              }
            }}
            onToolDataExtracted={(toolData) => {
              // Create a tool from extracted data
              const newTool = {
                ...toolData,
                id: Date.now(),
                price: toolData.price || 0,
                stock: 'In Stock'
              };
              setSelectedTool(newTool);
              
              // Auto-switch to assembly tab
              setActiveTab('assembly');
            }}
          />
        </div>
      )}
      
      {/* Assembly Builder Tab */}
      {activeTab === 'assembly' && (
        <div style={{ padding: '15px' }}>
          <h4 style={{ color: '#00d4ff', marginBottom: '15px' }}>
            🔧 Tool Assembly Builder
          </h4>
          
          {selectedTool ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              {/* Selected Tool Info */}
              <div style={{
                padding: '15px',
                background: '#1a1f2e',
                borderRadius: '4px',
                border: '1px solid #00d4ff'
              }}>
                <h5 style={{ color: '#00ff88', margin: '0 0 10px 0' }}>
                  Selected Tool
                </h5>
                <div style={{ fontSize: '12px', color: '#ccc' }}>
                  <div>{selectedTool.manufacturer}</div>
                  <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                    {selectedTool.partNumber}
                  </div>
                  <div>{selectedTool.description}</div>
                  <div style={{ marginTop: '5px', color: '#888' }}>
                    Ø{selectedTool.diameter}mm | {selectedTool.flutes}FL
                  </div>
                  {imported3DModel && (
                    <div style={{ color: '#66ff66', marginTop: '5px' }}>
                      ✅ 3D Model Loaded
                    </div>
                  )}
                </div>
              </div>
              
              {/* Assembly Configuration */}
              <div style={{
                padding: '15px',
                background: '#1a1f2e',
                borderRadius: '4px',
                border: '1px solid #333'
              }}>
                <h5 style={{ color: '#888', margin: '0 0 10px 0' }}>
                  Assembly Configuration
                </h5>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>Holder</label>
                  <select
                    value={selectedHolder}
                    onChange={(e) => setSelectedHolder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: '#0a0e1a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}
                  >
                    {Object.keys(HOLDER_STANDARDS).map(key => (
                      <option key={key} value={key}>
                        {key} - {HOLDER_STANDARDS[key].taper}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>Collet</label>
                  <select
                    value={selectedCollet}
                    onChange={(e) => setSelectedCollet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: '#0a0e1a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}
                  >
                    {Object.keys(COLLET_STANDARDS).map(key => (
                      <option key={key} value={key}>
                        {key} ({COLLET_STANDARDS[key].range})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>
                    Stickout: {stickout}mm
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={stickout}
                    onChange={(e) => setStickout(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: '5px' }}
                  />
                </div>
                
                <button
                  onClick={createAssembly}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Create Assembly
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              Select a tool from the library or import a 3D model to create an assembly
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalToolSystem;