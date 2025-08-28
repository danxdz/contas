import React, { useState } from 'react';

const ToolOffsetTable = ({ 
  offsetTable, 
  setOffsetTable, 
  activeHCode, 
  activeDCode,
  onApplyOffset 
}) => {
  const [activeTab, setActiveTab] = useState('length'); // 'length' or 'diameter'
  const [editingCell, setEditingCell] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter offsets based on search
  const filterOffsets = (offsets) => {
    if (!searchTerm) return offsets.slice(1, 21); // Show first 20 by default
    const term = searchTerm.toLowerCase();
    return offsets.filter((offset, idx) => 
      idx > 0 && (
        idx.toString().includes(term) ||
        offset.lengthGeometry?.toString().includes(term) ||
        offset.diameterGeometry?.toString().includes(term)
      )
    );
  };

  const handleCellEdit = (type, register, field, value) => {
    const newTable = { ...offsetTable };
    if (type === 'H') {
      newTable.H[register][field] = parseFloat(value) || 0;
    } else {
      newTable.D[register][field] = parseFloat(value) || 0;
    }
    setOffsetTable(newTable);
    setEditingCell(null);
  };

  const handleKeyPress = (e, type, register, field) => {
    if (e.key === 'Enter') {
      handleCellEdit(type, register, field, e.target.value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const copyOffsetToClipboard = (type, register) => {
    const offset = type === 'H' ? offsetTable.H[register] : offsetTable.D[register];
    const text = `${type}${register}: Geometry=${offset.lengthGeometry || offset.diameterGeometry}, Wear=${offset.lengthWear || offset.diameterWear}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#0a0e1a',
      color: '#e0e0e0'
    }}>
      <h3 style={{ color: '#00d4ff', padding: '15px 20px', margin: 0 }}>
        Tool Offset Table (Machine)
      </h3>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #00d4ff',
        padding: '0 20px'
      }}>
        <button
          onClick={() => setActiveTab('length')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'length' ? '#00d4ff' : 'transparent',
            color: activeTab === 'length' ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          H - Length Offsets
        </button>
        <button
          onClick={() => setActiveTab('diameter')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'diameter' ? '#00d4ff' : 'transparent',
            color: activeTab === 'diameter' ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          D - Diameter Offsets
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '15px 20px' }}>
        <input
          type="text"
          placeholder="Search offset number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff'
          }}
        />
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
        {activeTab === 'length' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #00d4ff' }}>
                <th style={{ padding: '10px', textAlign: 'left', color: '#00d4ff' }}>H#</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Length Geometry</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Length Wear</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Total</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterOffsets(offsetTable.H).map((offset, idx) => {
                const register = offset.register;
                const isActive = register === activeHCode;
                const total = (offset.lengthGeometry + offset.lengthWear).toFixed(3);
                
                return (
                  <tr 
                    key={register}
                    style={{ 
                      background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                      borderBottom: '1px solid #333'
                    }}
                  >
                    <td style={{ 
                      padding: '8px', 
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? '#00ff33' : '#fff'
                    }}>
                      H{register}
                      {isActive && <span style={{ marginLeft: '5px', fontSize: '10px' }}>●</span>}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {editingCell === `H-${register}-geometry` ? (
                        <input
                          type="number"
                          defaultValue={offset.lengthGeometry}
                          onBlur={(e) => handleCellEdit('H', register, 'lengthGeometry', e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, 'H', register, 'lengthGeometry')}
                          autoFocus
                          style={{
                            width: '80px',
                            padding: '4px',
                            background: '#1a1f2e',
                            border: '1px solid #00d4ff',
                            borderRadius: '2px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell(`H-${register}-geometry`)}
                          style={{ cursor: 'pointer', padding: '4px 8px' }}
                        >
                          {offset.lengthGeometry.toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {editingCell === `H-${register}-wear` ? (
                        <input
                          type="number"
                          defaultValue={offset.lengthWear}
                          onBlur={(e) => handleCellEdit('H', register, 'lengthWear', e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, 'H', register, 'lengthWear')}
                          autoFocus
                          style={{
                            width: '80px',
                            padding: '4px',
                            background: '#1a1f2e',
                            border: '1px solid #00d4ff',
                            borderRadius: '2px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell(`H-${register}-wear`)}
                          style={{ 
                            cursor: 'pointer', 
                            padding: '4px 8px',
                            color: offset.lengthWear !== 0 ? '#ffaa00' : '#fff'
                          }}
                        >
                          {offset.lengthWear.toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: isActive ? '#00ff33' : '#888'
                    }}>
                      {total}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => copyOffsetToClipboard('H', register)}
                        style={{
                          padding: '4px 8px',
                          marginRight: '5px',
                          background: '#333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => {
                          const newTable = { ...offsetTable };
                          newTable.H[register] = { register, lengthGeometry: 0, lengthWear: 0 };
                          setOffsetTable(newTable);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#aa3333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                        title="Clear offset"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #00d4ff' }}>
                <th style={{ padding: '10px', textAlign: 'left', color: '#00d4ff' }}>D#</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Diameter Geometry</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Diameter Wear</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Total Radius</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#00d4ff' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterOffsets(offsetTable.D).map((offset, idx) => {
                const register = offset.register;
                const isActive = register === activeDCode;
                const totalRadius = ((offset.diameterGeometry + offset.diameterWear) / 2).toFixed(3);
                
                return (
                  <tr 
                    key={register}
                    style={{ 
                      background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                      borderBottom: '1px solid #333'
                    }}
                  >
                    <td style={{ 
                      padding: '8px', 
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? '#00ff33' : '#fff'
                    }}>
                      D{register}
                      {isActive && <span style={{ marginLeft: '5px', fontSize: '10px' }}>●</span>}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {editingCell === `D-${register}-geometry` ? (
                        <input
                          type="number"
                          defaultValue={offset.diameterGeometry}
                          onBlur={(e) => handleCellEdit('D', register, 'diameterGeometry', e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, 'D', register, 'diameterGeometry')}
                          autoFocus
                          style={{
                            width: '80px',
                            padding: '4px',
                            background: '#1a1f2e',
                            border: '1px solid #00d4ff',
                            borderRadius: '2px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell(`D-${register}-geometry`)}
                          style={{ cursor: 'pointer', padding: '4px 8px' }}
                        >
                          {offset.diameterGeometry.toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {editingCell === `D-${register}-wear` ? (
                        <input
                          type="number"
                          defaultValue={offset.diameterWear}
                          onBlur={(e) => handleCellEdit('D', register, 'diameterWear', e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, 'D', register, 'diameterWear')}
                          autoFocus
                          style={{
                            width: '80px',
                            padding: '4px',
                            background: '#1a1f2e',
                            border: '1px solid #00d4ff',
                            borderRadius: '2px',
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell(`D-${register}-wear`)}
                          style={{ 
                            cursor: 'pointer', 
                            padding: '4px 8px',
                            color: offset.diameterWear !== 0 ? '#ffaa00' : '#fff'
                          }}
                        >
                          {offset.diameterWear.toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: isActive ? '#00ff33' : '#888'
                    }}>
                      {totalRadius}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => copyOffsetToClipboard('D', register)}
                        style={{
                          padding: '4px 8px',
                          marginRight: '5px',
                          background: '#333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => {
                          const newTable = { ...offsetTable };
                          newTable.D[register] = { register, diameterGeometry: 0, diameterWear: 0 };
                          setOffsetTable(newTable);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#aa3333',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                        title="Clear offset"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Bar */}
      <div style={{ 
        padding: '10px 20px', 
        background: '#1a1f2e', 
        borderTop: '1px solid #333',
        fontSize: '12px',
        color: '#888'
      }}>
        <strong>Active:</strong> 
        {activeHCode > 0 && ` H${activeHCode} (${(offsetTable.H[activeHCode].lengthGeometry + offsetTable.H[activeHCode].lengthWear).toFixed(3)}mm)`}
        {activeDCode > 0 && ` D${activeDCode} (R${((offsetTable.D[activeDCode].diameterGeometry + offsetTable.D[activeDCode].diameterWear) / 2).toFixed(3)}mm)`}
        {!activeHCode && !activeDCode && ' None'}
      </div>
    </div>
  );
};

export default ToolOffsetTable;