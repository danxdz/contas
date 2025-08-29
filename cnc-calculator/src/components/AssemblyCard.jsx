import React, { useState } from 'react';

const AssemblyCard = ({ 
  assembly, 
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateWear,
  onUpdateStickout
}) => {
  const [viewMode, setViewMode] = useState('mini'); // 'mini', 'expanded', 'selected'
  const [showStickoutModal, setShowStickoutModal] = useState(false);
  const [newStickout, setNewStickout] = useState(assembly.components?.tool?.stickout || 30);
  
  const handleClick = (e) => {
    e.stopPropagation();
    
    if (viewMode === 'mini') {
      setViewMode('expanded');
    } else if (viewMode === 'expanded') {
      setViewMode('selected');
      onSelect(assembly);
    } else {
      setViewMode('mini');
    }
  };

  // Mini view - just basic info
  if (viewMode === 'mini') {
    return (
      <div
        onClick={handleClick}
        data-assembly-id={assembly.id}
        style={{
          padding: '10px 15px',
          background: isSelected ? 
            'linear-gradient(135deg, #1a3f3e, #1a1f2e)' : '#1a1f2e',
          border: isSelected ? '2px solid #00ff88' : '1px solid #333',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          marginBottom: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(5px)';
          e.currentTarget.style.borderColor = '#00d4ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.borderColor = isSelected ? '#00ff88' : '#333';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Tool Number Badge */}
            <div style={{
              padding: '5px 10px',
              background: assembly.inUse ? '#00ff88' : '#2a3f5f',
              color: assembly.inUse ? '#000' : '#00d4ff',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {assembly.tNumber}
            </div>
            
            {/* Basic Info */}
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#fff'
              }}>
                {assembly.name || 'Tool Assembly'}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#888',
                marginTop: '2px'
              }}>
                Ø{assembly.components?.tool?.diameter || 0}mm • 
                {assembly.components?.tool?.flutes || 0}FL • 
                {assembly.components?.holder || 'No holder'}
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Wear indicator dot */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: assembly.wearLevel > 80 ? '#ff4444' :
                         assembly.wearLevel > 50 ? '#ffaa00' : '#00ff88'
            }} title={`Wear: ${assembly.wearLevel || 0}%`} />
            
            {/* Expand indicator */}
            <span style={{ 
              color: '#666',
              fontSize: '12px'
            }}>
              ▶
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view - more details
  if (viewMode === 'expanded') {
    return (
      <div
        style={{
          padding: '15px',
          background: isSelected ? 
            'linear-gradient(135deg, #1a3f3e, #1a1f2e)' : '#1a1f2e',
          border: isSelected ? '2px solid #00ff88' : '2px solid #00d4ff',
          borderRadius: '8px',
          marginBottom: '10px',
          transition: 'all 0.3s'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'start',
          marginBottom: '15px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                padding: '5px 12px',
                background: assembly.inUse ? '#00ff88' : '#2a3f5f',
                color: assembly.inUse ? '#000' : '#00d4ff',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {assembly.tNumber}
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#fff'
              }}>
                {assembly.name || 'Tool Assembly'}
              </div>
            </div>
            
            {/* Tool Details */}
            <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
              <div><span style={{ color: '#888' }}>Tool:</span> {assembly.components?.tool?.partNumber || 'None'}</div>
              <div><span style={{ color: '#888' }}>Holder:</span> {assembly.components?.holder || 'None'}</div>
              {assembly.components?.collet && (
                <div><span style={{ color: '#888' }}>Collet:</span> {assembly.components.collet}</div>
              )}
              {assembly.components?.extension && (
                <div><span style={{ color: '#888' }}>Extension:</span> {assembly.components.extension.length}mm</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStickoutModal(true);
              }}
              style={{
                padding: '6px 10px',
                background: '#2a3f5f',
                color: '#00d4ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Adjust Stickout"
            >
              📏
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(assembly);
              }}
              style={{
                padding: '6px 10px',
                background: '#2a3f5f',
                color: '#00d4ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(assembly);
              }}
              style={{
                padding: '6px 10px',
                background: '#2a5f3f',
                color: '#00ff88',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Duplicate"
            >
              📋
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(assembly.id);
              }}
              style={{
                padding: '6px 10px',
                background: '#5f2a2a',
                color: '#ff4444',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Specifications Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '15px',
          padding: '10px',
          background: '#0a0e1a',
          borderRadius: '6px'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Diameter</div>
            <div style={{ fontSize: '14px', color: '#00d4ff', fontWeight: 'bold' }}>
              Ø{assembly.components?.tool?.diameter || 0}mm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Flutes</div>
            <div style={{ fontSize: '14px', color: '#00d4ff', fontWeight: 'bold' }}>
              {assembly.components?.tool?.flutes || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Stickout</div>
            <div style={{ fontSize: '14px', color: '#00ff88', fontWeight: 'bold' }}>
              {assembly.components?.tool?.stickout || 30}mm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Total Length</div>
            <div style={{ fontSize: '14px', color: '#00d4ff', fontWeight: 'bold' }}>
              {(() => {
                const holderGaugeLengths = {
                  'BT30': 45, 'BT40': 65, 'BT50': 100,
                  'CAT40': 65, 'CAT50': 100,
                  'HSK63': 50, 'HSK100': 60,
                  'ER32': 40, 'ER40': 45,
                  'default': 60
                };
                const holderType = assembly.components?.holder?.type?.split('/')[0] || 'default';
                const holderGauge = holderGaugeLengths[holderType] || holderGaugeLengths.default;
                const stickout = assembly.components?.tool?.stickout || 30;
                const extensions = assembly.components?.extension?.length || 0;
                return holderGauge + stickout + extensions;
              })()}mm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Max RPM</div>
            <div style={{ fontSize: '14px', color: '#ffaa00', fontWeight: 'bold' }}>
              {assembly.maxRPM || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Usage</div>
            <div style={{ fontSize: '14px', color: '#ffaa00', fontWeight: 'bold' }}>
              {assembly.usageCount || 0}x
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>Time</div>
            <div style={{ fontSize: '14px', color: '#ffaa00', fontWeight: 'bold' }}>
              {assembly.totalCuttingTime || 0}min
            </div>
          </div>
        </div>

        {/* Wear Level */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '11px',
            marginBottom: '5px'
          }}>
            <span style={{ color: '#888' }}>Tool Wear</span>
            <span style={{ color: '#fff' }}>{assembly.wearLevel || 0}%</span>
          </div>
          <div style={{
            height: '6px',
            background: '#333',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              width: `${assembly.wearLevel || 0}%`,
              height: '100%',
              background: assembly.wearLevel > 80 ? '#ff4444' :
                         assembly.wearLevel > 50 ? '#ffaa00' : '#00ff88',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClick}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✓ Use in Simulation
        </button>
      </div>
    );
  }

  // Selected view - minimal with active indicator
  return (
    <>
      <div
        onClick={handleClick}
        style={{
          padding: '12px 15px',
          background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '8px',
          transition: 'all 0.3s',
          boxShadow: '0 4px 20px rgba(0,255,136,0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '5px 10px',
              background: '#000',
              color: '#00ff88',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {assembly.tNumber}
            </div>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#000'
              }}>
                ACTIVE IN SIMULATION
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#003333'
              }}>
                {assembly.name || 'Tool Assembly'}
              </div>
            </div>
          </div>
          <span style={{ 
            color: '#000',
            fontSize: '12px'
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {/* Stickout Adjustment Modal */}
      {showStickoutModal && (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowStickoutModal(false)}>
          <div style={{
            background: '#1a1f2e',
            borderRadius: '12px',
            padding: '25px',
            width: '400px',
            border: '2px solid #00d4ff',
            boxShadow: '0 10px 40px rgba(0,212,255,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>
              Adjust Tool Stickout
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Current Stickout</span>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                  {newStickout}mm
                </span>
              </div>
              
              <input
                type="range"
                min="10"
                max="100"
                value={newStickout}
                onChange={(e) => setNewStickout(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${(newStickout - 10) / 90 * 100}%, #333 ${(newStickout - 10) / 90 * 100}%, #333 100%)`,
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer'
                }}
              />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '10px', 
                color: '#666',
                marginTop: '5px'
              }}>
                <span>10mm</span>
                <span>Short</span>
                <span>Normal</span>
                <span>Long</span>
                <span>100mm</span>
              </div>
            </div>
            
            <div style={{
              padding: '10px',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#888'
            }}>
              💡 Shorter stickout = Better rigidity, less chatter<br/>
              📏 Total Length: {(() => {
                const holderGaugeLengths = {
                  'BT30': 45, 'BT40': 65, 'BT50': 100,
                  'CAT40': 65, 'CAT50': 100,
                  'HSK63': 50, 'HSK100': 60,
                  'ER32': 40, 'ER40': 45,
                  'default': 60
                };
                const holderType = assembly.components?.holder?.type?.split('/')[0] || 'default';
                const holderGauge = holderGaugeLengths[holderType] || holderGaugeLengths.default;
                const extensions = assembly.components?.extension?.length || 0;
                return holderGauge + newStickout + extensions;
              })()}mm
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (onUpdateStickout) {
                    onUpdateStickout(assembly.id, newStickout);
                  }
                  setShowStickoutModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Apply Changes
              </button>
              <button
                onClick={() => setShowStickoutModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#333',
                  color: '#888',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
};

export default AssemblyCard;