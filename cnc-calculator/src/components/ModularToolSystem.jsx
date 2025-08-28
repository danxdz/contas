import React, { useState, useEffect } from 'react';

// ============================================
// INDUSTRY STANDARD TOOL HOLDER SPECIFICATIONS
// ============================================

const TOOL_HOLDER_STANDARDS = {
  // ISO Taper Standards (7:24 taper ratio = 16.26°)
  ISO: {
    'ISO30': {
      standard: 'ISO 7388-1',
      taperSize: 30,
      bigEndDiameter: 31.75,
      gaugeLength: 48.4,
      flangeDiameter: 50,
      pullStud: 'M12',
      maxRPM: 20000,
      torqueCapacity: 150, // Nm
      balancing: 'G2.5 at 20000 RPM'
    },
    'ISO40': {
      standard: 'ISO 7388-1',
      taperSize: 40,
      bigEndDiameter: 44.45,
      gaugeLength: 65.4,
      flangeDiameter: 63,
      pullStud: 'M16',
      maxRPM: 15000,
      torqueCapacity: 350,
      balancing: 'G2.5 at 15000 RPM'
    },
    'ISO50': {
      standard: 'ISO 7388-1',
      taperSize: 50,
      bigEndDiameter: 69.85,
      gaugeLength: 101.6,
      flangeDiameter: 100,
      pullStud: 'M24',
      maxRPM: 10000,
      torqueCapacity: 900,
      balancing: 'G2.5 at 10000 RPM'
    }
  },
  
  // BT (MAS-BT) Japanese Standard
  BT: {
    'BT30': {
      standard: 'MAS 403 (JIS B 6339)',
      taperSize: 30,
      bigEndDiameter: 31.75,
      gaugeLength: 48.5,
      flangeDiameter: 46,
      pullStud: 'MAS-BT30 (45°)',
      maxRPM: 20000,
      torqueCapacity: 150,
      note: 'Symmetrical design, dual contact'
    },
    'BT40': {
      standard: 'MAS 403 (JIS B 6339)',
      taperSize: 40,
      bigEndDiameter: 44.45,
      gaugeLength: 65.5,
      flangeDiameter: 63.5,
      pullStud: 'MAS-BT40 (45°)',
      maxRPM: 15000,
      torqueCapacity: 350
    },
    'BT50': {
      standard: 'MAS 403 (JIS B 6339)',
      taperSize: 50,
      bigEndDiameter: 69.85,
      gaugeLength: 101.5,
      flangeDiameter: 100,
      pullStud: 'MAS-BT50 (45°)',
      maxRPM: 10000,
      torqueCapacity: 900
    }
  },
  
  // CAT (CV) American Standard
  CAT: {
    'CAT30': {
      standard: 'ANSI/ASME B5.50',
      taperSize: 30,
      bigEndDiameter: 31.75,
      gaugeLength: 62.7,
      flangeDiameter: 62.7,
      pullStud: '3/8"-16 UNC',
      maxRPM: 15000,
      torqueCapacity: 150
    },
    'CAT40': {
      standard: 'ANSI/ASME B5.50',
      taperSize: 40,
      bigEndDiameter: 44.45,
      gaugeLength: 89.0,
      flangeDiameter: 76.2,
      pullStud: '5/8"-11 UNC',
      maxRPM: 12000,
      torqueCapacity: 350
    },
    'CAT50': {
      standard: 'ANSI/ASME B5.50',
      taperSize: 50,
      bigEndDiameter: 69.85,
      gaugeLength: 135.1,
      flangeDiameter: 101.6,
      pullStud: '1"-8 UNC',
      maxRPM: 8000,
      torqueCapacity: 900
    }
  },
  
  // HSK (Hollow Shank Taper) German Standard - High Speed/Precision
  HSK: {
    'HSK-A63': {
      standard: 'DIN 69893-1',
      type: 'A',
      size: 63,
      flangeDiameter: 63,
      shankLength: 48,
      taperRatio: '1:10',
      clampingForce: 11000, // N
      maxRPM: 25000,
      torqueCapacity: 200,
      runoutAccuracy: 0.003, // mm
      note: 'Dual contact (taper + face), automatic tool change'
    },
    'HSK-A100': {
      standard: 'DIN 69893-1',
      type: 'A',
      size: 100,
      flangeDiameter: 100,
      shankLength: 60,
      taperRatio: '1:10',
      clampingForce: 28000,
      maxRPM: 18000,
      torqueCapacity: 630,
      runoutAccuracy: 0.003
    },
    'HSK-E40': {
      standard: 'DIN 69893-5',
      type: 'E',
      size: 40,
      flangeDiameter: 40,
      shankLength: 36,
      taperRatio: '1:10',
      maxRPM: 40000,
      torqueCapacity: 50,
      note: 'High speed variant, manual change'
    },
    'HSK-F63': {
      standard: 'DIN 69893-6',
      type: 'F',
      size: 63,
      flangeDiameter: 63,
      shankLength: 48,
      taperRatio: '1:10',
      maxRPM: 30000,
      torqueCapacity: 150,
      note: 'High speed automatic change'
    }
  }
};

// ============================================
// COLLET SYSTEMS AND SPECIFICATIONS
// ============================================

const COLLET_SYSTEMS = {
  'ER': {
    standard: 'DIN 6499',
    description: 'Most common collet system, high precision',
    types: {
      'ER11': { range: '0.5-7mm', collets: 13, accuracy: '0.005mm' },
      'ER16': { range: '1-10mm', collets: 10, accuracy: '0.005mm' },
      'ER20': { range: '1-13mm', collets: 13, accuracy: '0.005mm' },
      'ER25': { range: '1-16mm', collets: 16, accuracy: '0.005mm' },
      'ER32': { range: '2-20mm', collets: 19, accuracy: '0.005mm' },
      'ER40': { range: '3-26mm', collets: 23, accuracy: '0.008mm' }
    }
  },
  'OZ': {
    standard: 'EOC-OZ',
    description: 'High precision, segment clamping',
    types: {
      'OZ16': { range: '1-10mm', accuracy: '0.003mm' },
      'OZ25': { range: '1-16mm', accuracy: '0.003mm' }
    }
  },
  'TG': {
    standard: 'DIN 6388',
    description: 'Tap collets for rigid tapping',
    types: {
      'TG75': { range: 'M3-M12', length: 75 },
      'TG100': { range: 'M3-M20', length: 100 }
    }
  },
  'SK': {
    standard: 'Shrink Fit',
    description: 'Thermal shrink fit, highest precision',
    runout: '< 0.003mm at 3xD',
    balancing: 'G2.5 at 40000 RPM'
  },
  'Hydraulic': {
    standard: 'Hydraulic Chuck',
    description: 'Hydraulic expansion, high damping',
    runout: '< 0.003mm',
    damping: 'Excellent vibration damping'
  },
  'Weldon': {
    standard: 'DIN 1835-B',
    description: 'Side lock for heavy milling',
    flatLength: 'According to tool diameter',
    torqueTransmission: 'Excellent'
  }
};

// ============================================
// EXTENSION AND ADAPTER SPECIFICATIONS
// ============================================

const EXTENSIONS = {
  straight: {
    lengths: [50, 75, 100, 150, 200, 250, 300], // mm
    diameters: {
      'CAT40': 50,
      'BT40': 50,
      'ISO40': 50,
      'HSK63': 50
    },
    runoutIncrease: '0.002mm per 100mm',
    stiffness: 'Decreases with length³'
  },
  reduced: {
    description: 'Reduced shank extensions for deep cavities',
    reductions: ['40to32', '50to40', '50to32'],
    lengths: [100, 150, 200]
  },
  modular: {
    standard: 'Capto C6-C10',
    description: 'Modular quick-change system',
    repeatability: '0.002mm',
    changetime: '< 10 seconds'
  }
};

// ============================================
// REAL CUTTING TOOLS FROM MAJOR MANUFACTURERS
// ============================================

const CUTTING_TOOLS = {
  // SANDVIK COROMANT
  sandvik: {
    endmills: [
      {
        partNumber: '1P230-0400-XA 1630',
        series: 'CoroMill Plura',
        type: 'Solid Carbide End Mill',
        diameter: 4,
        flutes: 4,
        cuttingLength: 11,
        oal: 50,
        shankDiameter: 6,
        coating: 'PVD AlTiN',
        substrate: 'GC1630',
        helixAngle: 45,
        applications: ['Steel', 'Stainless', 'Cast Iron'],
        maxAp: 8, // mm
        price: 89.50
      },
      {
        partNumber: '2P342-1000-PA 1730',
        series: 'CoroMill Plura HD',
        type: 'Heavy Duty End Mill',
        diameter: 10,
        flutes: 5,
        cuttingLength: 22,
        oal: 72,
        shankDiameter: 10,
        coating: 'Zertivo Technology',
        substrate: 'GC1730',
        helixAngle: 42,
        applications: ['ISO-P', 'ISO-M', 'ISO-K'],
        chipBreaker: true,
        price: 156.00
      },
      {
        partNumber: '2B230-1200-SC 4240',
        series: 'CoroMill Century',
        type: 'Ball Nose End Mill',
        diameter: 12,
        flutes: 2,
        cuttingLength: 26,
        oal: 83,
        shankDiameter: 12,
        coating: 'CVD TiCN+Al2O3+TiN',
        substrate: 'GC4240',
        applications: ['Hardened Steel', 'Die & Mold'],
        hardnessRange: '48-65 HRC',
        price: 198.00
      }
    ],
    drills: [
      {
        partNumber: '860.1-0800-024A1-PM 4234',
        series: 'CoroDrill 860',
        type: 'Solid Carbide Drill',
        diameter: 8,
        flutes: 2,
        pointAngle: 140,
        cuttingLength: 43,
        oal: 89,
        shankDiameter: 8,
        coating: 'PVD AlTiCrN',
        substrate: 'GC4234',
        coolantThrough: true,
        applications: ['Steel', 'Cast Iron', 'Stainless'],
        price: 125.00
      }
    ]
  },
  
  // SECO TOOLS
  seco: {
    endmills: [
      {
        partNumber: 'JH730050D4R050.0Z4-SIRON-A',
        series: 'JH730 SIRON-A',
        type: 'High Performance End Mill',
        diameter: 5,
        flutes: 4,
        cuttingLength: 13,
        oal: 50,
        shankDiameter: 6,
        coating: 'SIRON-A',
        substrate: 'Ultra-fine Carbide',
        helixAngle: 45,
        cornerRadius: 0.5,
        applications: ['Aluminum', 'Non-Ferrous'],
        maxAe: 5, // mm
        maxAp: 13, // mm
        price: 72.00
      },
      {
        partNumber: 'JH770120E2R100.0Z5-MEGA-T',
        series: 'JH770 MEGA-T',
        type: 'Titanium Optimized',
        diameter: 12,
        flutes: 5,
        cuttingLength: 36,
        oal: 92,
        shankDiameter: 12,
        coating: 'MEGA-T',
        substrate: 'Special Carbide',
        helixAngle: 38,
        applications: ['Titanium', 'Inconel', 'Super Alloys'],
        chipBreaker: 'Variable pitch',
        price: 245.00
      }
    ],
    taps: [
      {
        partNumber: 'TM08X125ISO3B-NRT',
        series: 'Threadmaster',
        type: 'Spiral Flute Tap',
        size: 'M8x1.25',
        class: '6H',
        flutes: 3,
        spiralAngle: 40,
        oal: 80,
        shankDiameter: 6.2,
        coating: 'T4 Technology',
        applications: ['Steel', 'Stainless'],
        blindHoleCapable: true,
        price: 45.00
      }
    ]
  },
  
  // KENNAMETAL
  kennametal: {
    endmills: [
      {
        partNumber: 'HARVI I TE 4F K600',
        series: 'HARVI I TE',
        type: 'Universal End Mill',
        diameter: 6,
        flutes: 4,
        cuttingLength: 13,
        oal: 57,
        shankDiameter: 6,
        coating: 'KCMS15',
        substrate: 'Ultra-fine Carbide',
        helixAngle: 45,
        variablePitch: true,
        applications: ['Multi-Material'],
        tempResistance: 1100, // °C
        price: 95.00
      },
      {
        partNumber: 'DODEKA M12',
        series: 'DODEKA',
        type: 'Indexable Mini Mill',
        diameter: 12,
        inserts: 2,
        maxDepth: 8.5,
        shankDiameter: 12,
        insertType: 'LNKT0602',
        applications: ['General Milling'],
        economical: true,
        price: 185.00
      }
    ]
  },
  
  // WALTER
  walter: {
    endmills: [
      {
        partNumber: 'MC232-10.0A3WJ30LT',
        series: 'MC232 Advance',
        type: 'Roughing End Mill',
        diameter: 10,
        flutes: 3,
        cuttingLength: 30,
        oal: 75,
        shankDiameter: 10,
        coating: 'WJ30LT',
        substrate: 'Carbide',
        helixAngle: 30,
        chipDivider: 'Wave profile',
        mrr: 'High', // Material Removal Rate
        price: 142.00
      }
    ]
  },
  
  // ISCAR
  iscar: {
    endmills: [
      {
        partNumber: 'ECK-H4L 10-22/60C10-72 IC900',
        series: 'CHATFREE',
        type: 'Multi-Flute End Mill',
        diameter: 10,
        flutes: 4,
        cuttingLength: 22,
        oal: 72,
        shankDiameter: 10,
        coating: 'IC900 PVD TiAlN',
        substrate: 'Submicron Carbide',
        variableHelix: true,
        chatterFree: true,
        applications: ['All Materials'],
        price: 118.00
      }
    ]
  }
};

// ============================================
// MODULAR TOOL SYSTEM COMPONENT
// ============================================

const ModularToolSystem = ({ onAssemblyCreate }) => {
  const [activeTab, setActiveTab] = useState('tools');
  const [selectedComponents, setSelectedComponents] = useState({
    tool: null,
    holder: null,
    collet: null,
    extension: null
  });
  const [assembly, setAssembly] = useState(null);

  // Calculate total assembly length
  const calculateAssemblyLength = () => {
    let totalLength = 0;
    
    if (selectedComponents.holder) {
      const holderData = getHolderData(selectedComponents.holder);
      totalLength += holderData.gaugeLength || 0;
    }
    
    if (selectedComponents.extension) {
      totalLength += selectedComponents.extension.length || 0;
    }
    
    if (selectedComponents.tool) {
      totalLength += selectedComponents.tool.oal || 0;
    }
    
    return totalLength;
  };

  // Get holder data from standards
  const getHolderData = (holderType) => {
    for (const standard of Object.values(TOOL_HOLDER_STANDARDS)) {
      if (standard[holderType]) {
        return standard[holderType];
      }
    }
    return {};
  };

  // Create assembly from selected components
  const createAssembly = () => {
    const newAssembly = {
      id: Date.now(),
      name: generateAssemblyName(),
      components: { ...selectedComponents },
      totalLength: calculateAssemblyLength(),
      maxRPM: calculateMaxRPM(),
      timestamp: new Date().toISOString()
    };
    
    setAssembly(newAssembly);
    if (onAssemblyCreate) {
      onAssemblyCreate(newAssembly);
    }
  };

  // Generate assembly name
  const generateAssemblyName = () => {
    const parts = [];
    if (selectedComponents.holder) parts.push(selectedComponents.holder);
    if (selectedComponents.tool) parts.push(`D${selectedComponents.tool.diameter}`);
    return parts.join('-') || 'Custom Assembly';
  };

  // Calculate max RPM for assembly
  const calculateMaxRPM = () => {
    let maxRPM = 50000;
    
    if (selectedComponents.holder) {
      const holderData = getHolderData(selectedComponents.holder);
      maxRPM = Math.min(maxRPM, holderData.maxRPM || 50000);
    }
    
    if (selectedComponents.extension) {
      // Reduce max RPM based on extension length
      const reductionFactor = 1 - (selectedComponents.extension.length / 1000);
      maxRPM = Math.floor(maxRPM * reductionFactor);
    }
    
    return maxRPM;
  };

  return (
    <div style={{
      padding: '20px',
      background: '#0a0e1a',
      color: '#e0e0e0',
      height: '100%',
      overflow: 'auto'
    }}>
      <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>
        Professional Modular Tool System
      </h2>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #333'
      }}>
        {['tools', 'holders', 'collets', 'extensions', 'assembly'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#00d4ff' : 'transparent',
              color: activeTab === tab ? '#000' : '#888',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #00d4ff' : 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>
            Cutting Tools - Industry Standards
          </h3>
          {Object.entries(CUTTING_TOOLS).map(([brand, categories]) => (
            <div key={brand} style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                color: '#ffaa00', 
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                {brand}
              </h4>
              {Object.entries(categories).map(([category, tools]) => (
                <div key={category}>
                  <h5 style={{ color: '#888', marginBottom: '10px' }}>
                    {category}
                  </h5>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '10px'
                  }}>
                    {tools.map(tool => (
                      <div
                        key={tool.partNumber}
                        onClick={() => setSelectedComponents(prev => ({ ...prev, tool }))}
                        style={{
                          padding: '10px',
                          background: selectedComponents.tool?.partNumber === tool.partNumber 
                            ? '#1a3a4a' : '#1a1f2e',
                          border: selectedComponents.tool?.partNumber === tool.partNumber
                            ? '2px solid #00d4ff' : '1px solid #333',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                          {tool.partNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {tool.series} - {tool.type}
                        </div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
                          Ø{tool.diameter}mm × {tool.flutes}FL | L={tool.cuttingLength}mm
                        </div>
                        <div style={{ fontSize: '11px', color: '#66ff66' }}>
                          {tool.coating} | ${tool.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Holders Tab */}
      {activeTab === 'holders' && (
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>
            Tool Holders - International Standards
          </h3>
          {Object.entries(TOOL_HOLDER_STANDARDS).map(([standard, holders]) => (
            <div key={standard} style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#ffaa00', marginBottom: '10px' }}>
                {standard} Standard
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '10px'
              }}>
                {Object.entries(holders).map(([type, specs]) => (
                  <div
                    key={type}
                    onClick={() => setSelectedComponents(prev => ({ ...prev, holder: type }))}
                    style={{
                      padding: '10px',
                      background: selectedComponents.holder === type 
                        ? '#1a3a4a' : '#1a1f2e',
                      border: selectedComponents.holder === type
                        ? '2px solid #00d4ff' : '1px solid #333',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                      {type}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                      Standard: {specs.standard}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>
                      Gauge: {specs.gaugeLength}mm | Flange: Ø{specs.flangeDiameter}mm
                    </div>
                    <div style={{ fontSize: '11px', color: '#66ff66' }}>
                      Max RPM: {specs.maxRPM} | Torque: {specs.torqueCapacity}Nm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collets Tab */}
      {activeTab === 'collets' && (
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>
            Collet Systems
          </h3>
          {Object.entries(COLLET_SYSTEMS).map(([system, data]) => (
            <div key={system} style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#ffaa00', marginBottom: '10px' }}>
                {system} - {data.standard}
              </h4>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                {data.description}
              </p>
              {data.types && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {Object.entries(data.types).map(([type, specs]) => (
                    <div
                      key={type}
                      onClick={() => setSelectedComponents(prev => ({ ...prev, collet: type }))}
                      style={{
                        padding: '10px',
                        background: selectedComponents.collet === type 
                          ? '#1a3a4a' : '#1a1f2e',
                        border: selectedComponents.collet === type
                          ? '2px solid #00d4ff' : '1px solid #333',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                        {type}
                      </div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        Range: {specs.range}
                      </div>
                      <div style={{ fontSize: '11px', color: '#66ff66' }}>
                        Accuracy: {specs.accuracy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extensions Tab */}
      {activeTab === 'extensions' && (
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>
            Extensions & Adapters
          </h3>
          {Object.entries(EXTENSIONS).map(([type, data]) => (
            <div key={type} style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#ffaa00', marginBottom: '10px', textTransform: 'capitalize' }}>
                {type} Extensions
              </h4>
              {data.description && (
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                  {data.description}
                </p>
              )}
              {data.lengths && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '10px'
                }}>
                  {data.lengths.map(length => (
                    <div
                      key={length}
                      onClick={() => setSelectedComponents(prev => ({ 
                        ...prev, 
                        extension: { type, length } 
                      }))}
                      style={{
                        padding: '10px',
                        background: selectedComponents.extension?.length === length 
                          ? '#1a3a4a' : '#1a1f2e',
                        border: selectedComponents.extension?.length === length
                          ? '2px solid #00d4ff' : '1px solid #333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                        {length}mm
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assembly Tab */}
      {activeTab === 'assembly' && (
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>
            Tool Assembly Builder
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Selected Components */}
            <div style={{
              padding: '15px',
              background: '#1a1f2e',
              borderRadius: '4px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>
                Selected Components
              </h4>
              
              {selectedComponents.holder && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Holder</div>
                  <div style={{ color: '#fff' }}>{selectedComponents.holder}</div>
                </div>
              )}
              
              {selectedComponents.collet && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Collet</div>
                  <div style={{ color: '#fff' }}>{selectedComponents.collet}</div>
                </div>
              )}
              
              {selectedComponents.extension && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Extension</div>
                  <div style={{ color: '#fff' }}>
                    {selectedComponents.extension.type} - {selectedComponents.extension.length}mm
                  </div>
                </div>
              )}
              
              {selectedComponents.tool && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Tool</div>
                  <div style={{ color: '#fff' }}>{selectedComponents.tool.partNumber}</div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>
                    Ø{selectedComponents.tool.diameter}mm
                  </div>
                </div>
              )}
            </div>

            {/* Assembly Properties */}
            <div style={{
              padding: '15px',
              background: '#1a1f2e',
              borderRadius: '4px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>
                Assembly Properties
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ color: '#888', fontSize: '11px' }}>Total Length</div>
                <div style={{ color: '#66ff66', fontSize: '18px', fontWeight: 'bold' }}>
                  {calculateAssemblyLength()}mm
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ color: '#888', fontSize: '11px' }}>Max RPM</div>
                <div style={{ color: '#ffaa00' }}>
                  {calculateMaxRPM()} RPM
                </div>
              </div>
              
              <button
                onClick={createAssembly}
                disabled={!selectedComponents.holder || !selectedComponents.tool}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '15px',
                  background: (!selectedComponents.holder || !selectedComponents.tool) 
                    ? '#333' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: (!selectedComponents.holder || !selectedComponents.tool) 
                    ? '#666' : '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!selectedComponents.holder || !selectedComponents.tool) 
                    ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Assembly
              </button>
            </div>
          </div>

          {/* Created Assembly */}
          {assembly && (
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,212,255,0.1))',
              borderRadius: '4px',
              border: '1px solid #00ff88'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>
                ✓ Assembly Created
              </h4>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                <div>ID: {assembly.id}</div>
                <div>Name: {assembly.name}</div>
                <div>Total Length: {assembly.totalLength}mm</div>
                <div>Max RPM: {assembly.maxRPM}</div>
                <div>Created: {new Date(assembly.timestamp).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModularToolSystem;