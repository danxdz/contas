import React, { useState } from 'react';

const AssemblyCard = ({ 
  assembly, 
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateWear
}) => {
  const [viewMode, setViewMode] = useState('mini'); // 'mini', 'expanded', 'selected'
  
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
            <div style={{ fontSize: '10px', color: '#888' }}>Length</div>
            <div style={{ fontSize: '14px', color: '#00d4ff', fontWeight: 'bold' }}>
              {assembly.totalLength || 0}mm
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
  );
};

export default AssemblyCard;