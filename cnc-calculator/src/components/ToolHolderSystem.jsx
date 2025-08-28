import React, { useState } from 'react';

// Industry standard tool holder specifications
const TOOL_HOLDER_STANDARDS = {
  // ISO 7388 / DIN 69871 (SK/BT taper)
  ISO: {
    'SK30/BT30': {
      taper: 'ISO 30',
      flangeD: 46,
      gaugeLength: 48.5,
      pullStud: 'M12',
      maxRPM: 20000,
      weight: 0.8,
      applications: ['Light milling', 'Drilling', 'Small parts']
    },
    'SK40/BT40': {
      taper: 'ISO 40',
      flangeD: 63.5,
      gaugeLength: 65.5,
      pullStud: 'M16',
      maxRPM: 15000,
      weight: 1.8,
      applications: ['General milling', 'Drilling', 'Boring']
    },
    'SK50/BT50': {
      taper: 'ISO 50',
      flangeD: 100,
      gaugeLength: 102,
      pullStud: 'M24',
      maxRPM: 10000,
      weight: 5.2,
      applications: ['Heavy milling', 'Large boring', 'Face milling']
    }
  },
  
  // CAT (ANSI/ASME B5.50)
  CAT: {
    'CAT30': {
      taper: 'CAT 30',
      flangeD: 46,
      gaugeLength: 48.5,
      pullStud: '5/8"-11',
      maxRPM: 20000,
      weight: 0.8,
      applications: ['Light milling', 'High speed']
    },
    'CAT40': {
      taper: 'CAT 40',
      flangeD: 63.5,
      gaugeLength: 65.5,
      pullStud: '5/8"-11',
      maxRPM: 15000,
      weight: 1.8,
      applications: ['Standard milling', 'Most common in USA']
    },
    'CAT50': {
      taper: 'CAT 50',
      flangeD: 100,
      gaugeLength: 102,
      pullStud: '1"-8',
      maxRPM: 10000,
      weight: 5.2,
      applications: ['Heavy cutting', 'Large workpieces']
    }
  },
  
  // HSK (DIN 69893)
  HSK: {
    'HSK-A63': {
      taper: 'HSK-A63',
      flangeD: 63,
      contactD: 48,
      length: 60,
      clampingForce: 25000,
      maxRPM: 25000,
      weight: 0.5,
      applications: ['High speed machining', 'Precision work', '5-axis']
    },
    'HSK-A100': {
      taper: 'HSK-A100',
      flangeD: 100,
      contactD: 76,
      length: 80,
      clampingForce: 45000,
      maxRPM: 18000,
      weight: 1.5,
      applications: ['Heavy duty HSC', 'Large tools']
    },
    'HSK-E40': {
      taper: 'HSK-E40',
      flangeD: 40,
      contactD: 30,
      length: 50,
      clampingForce: 11000,
      maxRPM: 40000,
      weight: 0.2,
      applications: ['High speed spindles', 'Small tools', 'Precision']
    }
  },
  
  // Collet Systems
  COLLET: {
    'ER32': {
      type: 'ER Collet',
      range: '2-20mm',
      accuracy: 0.005,
      maxRPM: 30000,
      nutType: 'Standard/Mini',
      applications: ['End mills', 'Drills', 'Reamers']
    },
    'ER40': {
      type: 'ER Collet',
      range: '3-26mm',
      accuracy: 0.005,
      maxRPM: 25000,
      nutType: 'Standard',
      applications: ['Larger end mills', 'Shell mills']
    }
  }
};

// Tool holder types
const HOLDER_TYPES = {
  'End Mill Holder': {
    description: 'Weldon shank holders for end mills',
    features: ['Side lock screw', 'High grip force', 'Good for roughing'],
    runout: 0.01
  },
  'Collet Chuck': {
    description: 'ER collet system for various tool diameters',
    features: ['Wide clamping range', 'Good balance', 'Quick change'],
    runout: 0.005
  },
  'Hydraulic Chuck': {
    description: 'Hydraulic expansion for superior grip',
    features: ['Excellent runout', 'Vibration damping', 'Long tool life'],
    runout: 0.003
  },
  'Shrink Fit': {
    description: 'Thermal shrink fitting for maximum precision',
    features: ['Best runout', 'Slim profile', 'High speed capable'],
    runout: 0.003
  },
  'Shell Mill Holder': {
    description: 'For face mills and shell mills',
    features: ['Drive keys', 'Coolant through', 'Heavy duty'],
    runout: 0.01
  }
};

const ToolHolderSystem = ({ onHolderSelect, onToolAssemblyUpdate }) => {
  const [selectedStandard, setSelectedStandard] = useState('ISO');
  const [selectedHolder, setSelectedHolder] = useState(null);
  const [selectedHolderType, setSelectedHolderType] = useState('Collet Chuck');
  const [toolAssembly, setToolAssembly] = useState({
    holder: null,
    holderType: null,
    tool: null,
    totalLength: 0,
    totalWeight: 0
  });

  const handleHolderSelect = (holderSpec, standard, size) => {
    const assembly = {
      ...toolAssembly,
      holder: holderSpec,
      holderStandard: standard,
      holderSize: size,
      holderType: selectedHolderType
    };
    setToolAssembly(assembly);
    setSelectedHolder(size);
    
    if (onHolderSelect) {
      onHolderSelect(assembly);
    }
  };

  const calculateAssemblyLength = () => {
    let totalLength = 0;
    if (toolAssembly.holder) {
      totalLength += toolAssembly.holder.gaugeLength || toolAssembly.holder.length || 0;
    }
    if (toolAssembly.tool) {
      totalLength += toolAssembly.tool.length || 0;
    }
    return totalLength;
  };

  return (
    <div style={{ 
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: '#e0e0e0'
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Tool Holder Management System</h3>
      
      {/* Standard Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Holder Standard</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.keys(TOOL_HOLDER_STANDARDS).map(standard => (
            <button
              key={standard}
              onClick={() => setSelectedStandard(standard)}
              style={{
                padding: '8px 16px',
                background: selectedStandard === standard ? '#00d4ff' : '#1a1f2e',
                color: selectedStandard === standard ? '#000' : '#fff',
                border: '1px solid #00d4ff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {standard}
            </button>
          ))}
        </div>
      </div>

      {/* Holder Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Holder Type</h4>
        <select
          value={selectedHolderType}
          onChange={(e) => setSelectedHolderType(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1a1f2e',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '4px'
          }}
        >
          {Object.keys(HOLDER_TYPES).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {HOLDER_TYPES[selectedHolderType] && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <div>{HOLDER_TYPES[selectedHolderType].description}</div>
            <div>Runout: {HOLDER_TYPES[selectedHolderType].runout}mm TIR</div>
          </div>
        )}
      </div>

      {/* Available Holders */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h4 style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>
          Available {selectedStandard} Holders
        </h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.entries(TOOL_HOLDER_STANDARDS[selectedStandard]).map(([size, spec]) => (
            <div
              key={size}
              onClick={() => handleHolderSelect(spec, selectedStandard, size)}
              style={{
                padding: '15px',
                background: selectedHolder === size ? 'rgba(0, 212, 255, 0.1)' : '#1a1f2e',
                border: selectedHolder === size ? '2px solid #00d4ff' : '1px solid #333',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#00d4ff' }}>{size}</strong>
                <span style={{ color: '#888', fontSize: '12px' }}>
                  Max {spec.maxRPM?.toLocaleString() || 'N/A'} RPM
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#666' }}>Flange: </span>
                  <span>{spec.flangeD || spec.contactD}mm</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Length: </span>
                  <span>{spec.gaugeLength || spec.length || spec.range}mm</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Weight: </span>
                  <span>{spec.weight || 'N/A'}kg</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Pull Stud: </span>
                  <span>{spec.pullStud || 'N/A'}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                {spec.applications && spec.applications.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assembly Summary */}
      {toolAssembly.holder && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '4px',
          border: '1px solid #00d4ff'
        }}>
          <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Current Assembly</h4>
          <div style={{ fontSize: '12px' }}>
            <div>Holder: {toolAssembly.holderStandard} {toolAssembly.holderSize}</div>
            <div>Type: {toolAssembly.holderType}</div>
            <div>Total Length: {calculateAssemblyLength().toFixed(1)}mm</div>
            {toolAssembly.tool && <div>Tool: {toolAssembly.tool.name}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolHolderSystem;