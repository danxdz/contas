import React, { useState } from 'react';

const UnifiedTopBar = ({ 
  panels, 
  togglePanel, 
  simulation, 
  onSimulationControl,
  onFileAction,
  onViewChange
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  
  const menus = {
    file: [
      { label: 'New', icon: '📄', action: () => onFileAction('new') },
      { label: 'Open', icon: '📂', action: () => onFileAction('open') },
      { label: 'Save', icon: '💾', action: () => onFileAction('save') },
      { divider: true },
      { label: 'Import', icon: '📥', action: () => onFileAction('import') },
      { label: 'Export', icon: '📤', action: () => onFileAction('export') }
    ],
    view: [
      { label: 'Top', action: () => onViewChange('top') },
      { label: 'Front', action: () => onViewChange('front') },
      { label: 'Right', action: () => onViewChange('right') },
      { label: 'Iso', action: () => onViewChange('iso') },
      { divider: true },
      { label: 'Fit All', icon: '🔍', action: () => onViewChange('fit') }
    ],
    panels: [
      { label: 'G-Code', icon: '📝', action: () => togglePanel('gcode'), active: panels.gcode?.visible },
      { label: 'Tools', icon: '🔧', action: () => togglePanel('tools'), active: panels.tools?.visible },
      { label: 'Setup', icon: '⚙️', action: () => togglePanel('stockSetup'), active: panels.stockSetup?.visible },
      { label: 'Offsets', icon: '📐', action: () => togglePanel('workOffsets'), active: panels.workOffsets?.visible },
      { label: 'Lights', icon: '💡', action: () => togglePanel('lighting'), active: panels.lighting?.visible }
    ]
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '40px',
      background: 'linear-gradient(to bottom, #1a1f2e, #0f1420)',
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 10px',
      zIndex: 10000,
      userSelect: 'none'
    }}>
      {/* Logo/Title */}
      <div style={{ 
        fontWeight: 'bold',
        color: '#00d4ff',
        fontSize: '14px',
        marginRight: '20px'
      }}>
        CNC Pro
      </div>
      
      {/* Menus */}
      <div style={{ display: 'flex', gap: '5px' }}>
        {Object.entries(menus).map(([key, items]) => (
          <div key={key} style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveMenu(activeMenu === key ? null : key)}
              style={{
                padding: '5px 12px',
                background: activeMenu === key ? '#2a3f5f' : 'transparent',
                border: 'none',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '13px',
                borderRadius: '3px',
                textTransform: 'capitalize'
              }}
            >
              {key}
            </button>
            
            {activeMenu === key && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#1a1f2e',
                border: '1px solid #333',
                borderRadius: '4px',
                minWidth: '150px',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                {items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} style={{ height: '1px', background: '#333', margin: '4px 0' }} />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setActiveMenu(null);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: item.active ? '#2a3f5f' : 'transparent',
                        border: 'none',
                        color: item.active ? '#00ff88' : '#e0e0e0',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2a3f5f'}
                      onMouseLeave={(e) => e.target.style.background = item.active ? '#2a3f5f' : 'transparent'}
                    >
                      {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1 }} />
      
      {/* Simulation Controls */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button 
          onClick={() => onSimulationControl('playPause')}
          style={{
            padding: '4px 8px',
            background: simulation?.isPlaying ? '#00ff88' : '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: simulation?.isPlaying ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {simulation?.isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          onClick={() => onSimulationControl('stop')}
          style={{
            padding: '4px 8px',
            background: '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⏹
        </button>
        <button 
          onClick={() => onSimulationControl('reset')}
          style={{
            padding: '4px 8px',
            background: '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄
        </button>
      </div>
      
      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={() => togglePanel('gcode')}
          title="G-Code"
          style={{
            padding: '4px 8px',
            background: panels.gcode?.visible ? '#00d4ff' : '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: panels.gcode?.visible ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📝
        </button>
        <button 
          onClick={() => togglePanel('tools')}
          title="Tools"
          style={{
            padding: '4px 8px',
            background: panels.tools?.visible ? '#00d4ff' : '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: panels.tools?.visible ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔧
        </button>
        <button 
          onClick={() => togglePanel('machineControl')}
          title="Manual Control"
          style={{
            padding: '4px 8px',
            background: panels.machineControl?.visible ? '#00d4ff' : '#2a2f3e',
            border: '1px solid #444',
            borderRadius: '3px',
            color: panels.machineControl?.visible ? '#000' : '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🎮
        </button>
      </div>
      
      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1
          }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default UnifiedTopBar;