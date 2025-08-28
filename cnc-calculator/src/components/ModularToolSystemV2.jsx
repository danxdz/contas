import React, { useState, useEffect } from 'react';

// Import the standards from the original system
import { 
  TOOL_HOLDER_STANDARDS, 
  COLLET_SYSTEMS, 
  EXTENSIONS, 
  CUTTING_TOOLS 
} from './ModularToolSystem';

const ModularToolSystemV2 = ({ onAssemblyCreate }) => {
  const [selectedComponents, setSelectedComponents] = useState({
    tool: null,
    holder: null,
    collet: null,
    extension: null
  });
  
  const [expandedSection, setExpandedSection] = useState('tool');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Calculate assembly properties
  const calculateAssemblyLength = () => {
    let length = 0;
    if (selectedComponents.holder) {
      const holder = findHolderData(selectedComponents.holder);
      length += holder?.gaugeLength || 0;
    }
    if (selectedComponents.extension) {
      length += selectedComponents.extension.length || 0;
    }
    if (selectedComponents.tool) {
      length += selectedComponents.tool.oal || 0;
    }
    return length;
  };

  const calculateMaxRPM = () => {
    let rpm = 50000;
    if (selectedComponents.holder) {
      const holder = findHolderData(selectedComponents.holder);
      rpm = Math.min(rpm, holder?.maxRPM || 50000);
    }
    if (selectedComponents.extension) {
      rpm = Math.floor(rpm * (1 - selectedComponents.extension.length / 1000));
    }
    return rpm;
  };

  const findHolderData = (holderName) => {
    for (const standard of Object.values(TOOL_HOLDER_STANDARDS)) {
      if (standard[holderName]) return standard[holderName];
    }
    return null;
  };

  const findColletData = (colletName) => {
    for (const system of Object.values(COLLET_SYSTEMS)) {
      if (system.types && system.types[colletName]) {
        return system.types[colletName];
      }
    }
    return null;
  };

  // Get all tools as flat list
  const getAllTools = () => {
    const tools = [];
    Object.entries(CUTTING_TOOLS).forEach(([brand, categories]) => {
      Object.entries(categories).forEach(([category, items]) => {
        items.forEach(tool => {
          tools.push({
            ...tool,
            brand: brand.charAt(0).toUpperCase() + brand.slice(1),
            category
          });
        });
      });
    });
    return tools;
  };

  // Filter tools
  const getFilteredTools = () => {
    let tools = getAllTools();
    
    if (filterBrand !== 'all') {
      tools = tools.filter(t => t.brand.toLowerCase() === filterBrand.toLowerCase());
    }
    
    if (filterType !== 'all') {
      tools = tools.filter(t => t.category === filterType);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      tools = tools.filter(t => 
        t.partNumber.toLowerCase().includes(search) ||
        t.type.toLowerCase().includes(search) ||
        t.series?.toLowerCase().includes(search)
      );
    }
    
    return tools;
  };

  // Create assembly
  const createAssembly = () => {
    if (!selectedComponents.tool || !selectedComponents.holder) {
      alert('Please select at least a tool and holder');
      return;
    }

    const assembly = {
      id: Date.now(),
      components: { ...selectedComponents },
      totalLength: calculateAssemblyLength(),
      maxRPM: calculateMaxRPM(),
      timestamp: new Date().toISOString(),
      name: generateAssemblyName()
    };

    if (onAssemblyCreate) {
      onAssemblyCreate(assembly);
    }

    // Show success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #00ff88, #00d4ff);
      color: #000;
      padding: 20px 40px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0,255,136,0.4);
    `;
    successDiv.textContent = '✓ Assembly Created Successfully!';
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 2000);
  };

  const generateAssemblyName = () => {
    const parts = [];
    if (selectedComponents.holder) parts.push(selectedComponents.holder);
    if (selectedComponents.tool) parts.push(`D${selectedComponents.tool.diameter}`);
    return parts.join('-') || 'Assembly';
  };

  // Component Section
  const ComponentSection = ({ 
    title, 
    icon, 
    isExpanded, 
    onToggle, 
    selected, 
    children 
  }) => (
    <div style={{
      marginBottom: '15px',
      background: '#1a1f2e',
      borderRadius: '8px',
      border: selected ? '2px solid #00ff88' : '1px solid #333',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '15px',
          background: isExpanded ? 'linear-gradient(135deg, #2a2f3e, #1a1f2e)' : '#1a1f2e',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: selected ? '#00ff88' : '#fff'
          }}>
            {title}
          </span>
          {selected && (
            <span style={{
              padding: '2px 8px',
              background: '#00ff88',
              color: '#000',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              SELECTED
            </span>
          )}
        </div>
        <span style={{ 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>
      {isExpanded && (
        <div style={{ padding: '15px', borderTop: '1px solid #333' }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0e1a',
      color: '#e0e0e0'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #1a1f2e, #0a0e1a)',
        borderBottom: '2px solid #00d4ff'
      }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          color: '#00d4ff',
          fontSize: '20px'
        }}>
          🔧 Tool Assembly Builder
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#888',
          fontSize: '12px'
        }}>
          Select components to build your tool assembly
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '20px'
      }}>
        {/* 1. Tool Selection */}
        <ComponentSection
          title="Cutting Tool"
          icon="🔪"
          isExpanded={expandedSection === 'tool'}
          onToggle={() => setExpandedSection(expandedSection === 'tool' ? null : 'tool')}
          selected={selectedComponents.tool}
        >
          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              style={{
                padding: '8px',
                background: '#0a0e1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '12px'
              }}
            >
              <option value="all">All Brands</option>
              <option value="sandvik">Sandvik</option>
              <option value="seco">Seco</option>
              <option value="kennametal">Kennametal</option>
              <option value="walter">Walter</option>
              <option value="iscar">Iscar</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px',
                background: '#0a0e1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '12px'
              }}
            >
              <option value="all">All Types</option>
              <option value="endmills">End Mills</option>
              <option value="drills">Drills</option>
              <option value="taps">Taps</option>
            </select>

            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px',
                background: '#0a0e1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Tool Dropdown */}
          <select
            value={selectedComponents.tool?.partNumber || ''}
            onChange={(e) => {
              const tool = getAllTools().find(t => t.partNumber === e.target.value);
              setSelectedComponents(prev => ({ ...prev, tool }));
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0a0e1a',
              border: '2px solid #00d4ff',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            <option value="">Select a cutting tool...</option>
            {getFilteredTools().map(tool => (
              <option key={tool.partNumber} value={tool.partNumber}>
                {tool.brand} - {tool.partNumber} - Ø{tool.diameter}mm {tool.flutes}FL - ${tool.price}
              </option>
            ))}
          </select>

          {/* Selected Tool Info */}
          {selectedComponents.tool && (
            <div style={{
              padding: '10px',
              background: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '6px',
              border: '1px solid #00ff88',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#00ff88', marginBottom: '5px' }}>
                {selectedComponents.tool.partNumber}
              </div>
              <div style={{ color: '#aaa' }}>
                {selectedComponents.tool.series} - {selectedComponents.tool.type}
              </div>
              <div style={{ marginTop: '5px' }}>
                <span style={{ color: '#888' }}>Diameter: </span>
                <span style={{ color: '#fff' }}>{selectedComponents.tool.diameter}mm</span>
                <span style={{ color: '#888', marginLeft: '10px' }}>Flutes: </span>
                <span style={{ color: '#fff' }}>{selectedComponents.tool.flutes}</span>
              </div>
              <div>
                <span style={{ color: '#888' }}>Coating: </span>
                <span style={{ color: '#ffaa00' }}>{selectedComponents.tool.coating}</span>
              </div>
            </div>
          )}
        </ComponentSection>

        {/* 2. Holder Selection */}
        <ComponentSection
          title="Tool Holder"
          icon="🔩"
          isExpanded={expandedSection === 'holder'}
          onToggle={() => setExpandedSection(expandedSection === 'holder' ? null : 'holder')}
          selected={selectedComponents.holder}
        >
          <select
            value={selectedComponents.holder || ''}
            onChange={(e) => setSelectedComponents(prev => ({ ...prev, holder: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0a0e1a',
              border: '2px solid #00d4ff',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            <option value="">Select a tool holder...</option>
            <optgroup label="ISO Standard">
              <option value="ISO30">ISO30 - 48.4mm gauge</option>
              <option value="ISO40">ISO40 - 65.4mm gauge</option>
              <option value="ISO50">ISO50 - 101.6mm gauge</option>
            </optgroup>
            <optgroup label="BT (Japanese)">
              <option value="BT30">BT30 - 48.5mm gauge</option>
              <option value="BT40">BT40 - 65.5mm gauge</option>
              <option value="BT50">BT50 - 101.5mm gauge</option>
            </optgroup>
            <optgroup label="CAT (American)">
              <option value="CAT30">CAT30 - 62.7mm gauge</option>
              <option value="CAT40">CAT40 - 89.0mm gauge</option>
              <option value="CAT50">CAT50 - 135.1mm gauge</option>
            </optgroup>
            <optgroup label="HSK (High Speed)">
              <option value="HSK-A63">HSK-A63 - 48mm shank</option>
              <option value="HSK-A100">HSK-A100 - 60mm shank</option>
            </optgroup>
          </select>

          {selectedComponents.holder && (
            <div style={{
              padding: '10px',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '6px',
              border: '1px solid #00d4ff',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                {selectedComponents.holder}
              </div>
              {(() => {
                const holder = findHolderData(selectedComponents.holder);
                return holder && (
                  <>
                    <div>
                      <span style={{ color: '#888' }}>Max RPM: </span>
                      <span style={{ color: '#fff' }}>{holder.maxRPM}</span>
                    </div>
                    <div>
                      <span style={{ color: '#888' }}>Torque: </span>
                      <span style={{ color: '#fff' }}>{holder.torqueCapacity}Nm</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </ComponentSection>

        {/* 3. Collet Selection (Optional) */}
        <ComponentSection
          title="Collet System (Optional)"
          icon="⭕"
          isExpanded={expandedSection === 'collet'}
          onToggle={() => setExpandedSection(expandedSection === 'collet' ? null : 'collet')}
          selected={selectedComponents.collet}
        >
          <select
            value={selectedComponents.collet || ''}
            onChange={(e) => setSelectedComponents(prev => ({ ...prev, collet: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0a0e1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '14px'
            }}
          >
            <option value="">No collet / Direct mount</option>
            <optgroup label="ER Collets">
              <option value="ER11">ER11 (0.5-7mm)</option>
              <option value="ER16">ER16 (1-10mm)</option>
              <option value="ER20">ER20 (1-13mm)</option>
              <option value="ER25">ER25 (1-16mm)</option>
              <option value="ER32">ER32 (2-20mm)</option>
              <option value="ER40">ER40 (3-26mm)</option>
            </optgroup>
            <optgroup label="Precision">
              <option value="Shrink Fit">Shrink Fit (< 0.003mm runout)</option>
              <option value="Hydraulic">Hydraulic Chuck</option>
            </optgroup>
            <optgroup label="Heavy Duty">
              <option value="Weldon">Weldon Side Lock</option>
            </optgroup>
          </select>
        </ComponentSection>

        {/* 4. Extension (Optional) */}
        <ComponentSection
          title="Extension (Optional)"
          icon="📏"
          isExpanded={expandedSection === 'extension'}
          onToggle={() => setExpandedSection(expandedSection === 'extension' ? null : 'extension')}
          selected={selectedComponents.extension}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '10px'
          }}>
            <button
              onClick={() => setSelectedComponents(prev => ({ ...prev, extension: null }))}
              style={{
                padding: '10px',
                background: !selectedComponents.extension ? '#00d4ff' : '#1a1f2e',
                color: !selectedComponents.extension ? '#000' : '#888',
                border: '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: !selectedComponents.extension ? 'bold' : 'normal'
              }}
            >
              None
            </button>
            {[50, 75, 100, 150, 200, 250, 300].map(length => (
              <button
                key={length}
                onClick={() => setSelectedComponents(prev => ({ 
                  ...prev, 
                  extension: { type: 'straight', length } 
                }))}
                style={{
                  padding: '10px',
                  background: selectedComponents.extension?.length === length ? '#00d4ff' : '#1a1f2e',
                  color: selectedComponents.extension?.length === length ? '#000' : '#888',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedComponents.extension?.length === length ? 'bold' : 'normal'
                }}
              >
                {length}mm
              </button>
            ))}
          </div>
        </ComponentSection>
      </div>

      {/* Assembly Summary & Create Button */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #1a1f2e, #2a2f3e)',
        borderTop: '2px solid #333'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div style={{
            padding: '10px',
            background: '#0a0e1a',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>
              Total Length
            </div>
            <div style={{ fontSize: '20px', color: '#00ff88', fontWeight: 'bold' }}>
              {calculateAssemblyLength()}mm
            </div>
          </div>
          <div style={{
            padding: '10px',
            background: '#0a0e1a',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>
              Max RPM
            </div>
            <div style={{ fontSize: '20px', color: '#ffaa00', fontWeight: 'bold' }}>
              {calculateMaxRPM()}
            </div>
          </div>
        </div>

        <button
          onClick={createAssembly}
          disabled={!selectedComponents.tool || !selectedComponents.holder}
          style={{
            width: '100%',
            padding: '15px',
            background: (!selectedComponents.tool || !selectedComponents.holder) 
              ? '#333' 
              : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: (!selectedComponents.tool || !selectedComponents.holder) ? '#666' : '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (!selectedComponents.tool || !selectedComponents.holder) 
              ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {(!selectedComponents.tool || !selectedComponents.holder) 
            ? 'Select Tool & Holder to Continue' 
            : '✓ Create Tool Assembly'}
        </button>
      </div>
    </div>
  );
};

// Export the standards for use in V2
export { TOOL_HOLDER_STANDARDS, COLLET_SYSTEMS, EXTENSIONS, CUTTING_TOOLS } from './ModularToolSystem';

export default ModularToolSystemV2;