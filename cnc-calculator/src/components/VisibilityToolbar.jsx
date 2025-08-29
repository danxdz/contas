import React from 'react';

const VisibilityToolbar = ({ 
  visibility,
  onToggle,
  style = {}
}) => {
  const items = [
    { id: 'tool', label: 'Tool', icon: '🔧', color: '#00ff88' },
    { id: 'stock', label: 'Stock', icon: '📦', color: '#ffaa00' },
    { id: 'fixture', label: 'Fixture', icon: '🗜️', color: '#ff6666' },
    { id: 'part', label: 'Part', icon: '🔩', color: '#00d4ff' },
    { id: 'toolpath', label: 'Toolpath', icon: '📈', color: '#ff00ff' },
    { id: 'axes', label: 'Axes', icon: '🧭', color: '#ffffff' },
    { id: 'grid', label: 'Grid', icon: '⊞', color: '#444444' },
    { id: 'origins', label: 'Origins', icon: '⊕', color: '#00ff00' }
  ];

  return (
    <div style={{
      position: 'fixed',
      left: '15px',
      top: '70px',
      background: 'linear-gradient(135deg, #1a1f2e, #0f1420)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      borderRadius: '8px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      ...style
    }}>
      <div style={{
        fontSize: '10px',
        color: '#888',
        textAlign: 'center',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Visibility
      </div>
      
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onToggle(item.id)}
          style={{
            width: '40px',
            height: '40px',
            background: visibility[item.id] 
              ? `linear-gradient(135deg, ${item.color}22, ${item.color}44)`
              : 'rgba(42, 47, 62, 0.5)',
            border: visibility[item.id] 
              ? `1px solid ${item.color}`
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: visibility[item.id] ? item.color : '#444',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          title={item.label}
        >
          {item.icon}
          {visibility[item.id] && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '4px',
              height: '4px',
              background: item.color,
              borderRadius: '50%',
              boxShadow: `0 0 4px ${item.color}`
            }} />
          )}
        </button>
      ))}
      
      <div style={{ 
        height: '1px', 
        background: 'rgba(255,255,255,0.1)', 
        margin: '4px 0' 
      }} />
      
      <button
        onClick={() => {
          const allVisible = items.every(item => visibility[item.id]);
          items.forEach(item => onToggle(item.id, !allVisible));
        }}
        style={{
          width: '40px',
          height: '30px',
          background: 'rgba(42, 47, 62, 0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: '#888',
          cursor: 'pointer',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title="Toggle All"
      >
        ALL
      </button>
    </div>
  );
};

export default VisibilityToolbar;