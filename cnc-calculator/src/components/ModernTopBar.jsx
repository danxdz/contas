import React, { useState } from 'react';

const ModernTopBar = ({ 
  panels, 
  togglePanel, 
  simulation, 
  onSimulationControl,
  onFileAction,
  onViewChange,
  projectName = 'Untitled'
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Organized menu structure with icons
  const menuItems = [
    {
      id: 'file',
      icon: '📁',
      label: 'File',
      items: [
        { id: 'new', label: 'New Project', icon: '📄', shortcut: 'Ctrl+N', action: () => onFileAction('new') },
        { id: 'open', label: 'Open', icon: '📂', shortcut: 'Ctrl+O', action: () => onFileAction('open') },
        { id: 'save', label: 'Save', icon: '💾', shortcut: 'Ctrl+S', action: () => onFileAction('save') },
        { divider: true },
        { id: 'import', label: 'Import G-Code', icon: '📥', action: () => onFileAction('import') },
        { id: 'export', label: 'Export', icon: '📤', action: () => onFileAction('export') }
      ]
    },
    {
      id: 'view',
      icon: '👁️',
      label: 'View',
      items: [
        { id: 'top', label: 'Top View', shortcut: '1', action: () => onViewChange('top') },
        { id: 'front', label: 'Front View', shortcut: '2', action: () => onViewChange('front') },
        { id: 'right', label: 'Right View', shortcut: '3', action: () => onViewChange('right') },
        { id: 'iso', label: 'Isometric', shortcut: '4', action: () => onViewChange('iso') },
        { divider: true },
        { id: 'fit', label: 'Fit All', icon: '🔍', shortcut: 'F', action: () => onViewChange('fit') },
        { id: 'grid', label: 'Toggle Grid', icon: '⊞', action: () => onViewChange('grid') }
      ]
    },
    {
      id: 'tools',
      icon: '🛠️',
      label: 'Tools',
      items: [
        { id: 'gcode', label: 'G-Code Editor', icon: '📝', checked: panels.gcode?.visible, action: () => togglePanel('gcode') },
        { id: 'toolmanager', label: 'Tool Manager', icon: '🔧', checked: panels.tools?.visible, action: () => togglePanel('tools') },
        { id: 'offsets', label: 'Work Offsets', icon: '📐', checked: panels.workOffsets?.visible, action: () => togglePanel('workOffsets') },
        { divider: true },
        { id: 'manual', label: 'Manual Control', icon: '🎮', checked: panels.machineControl?.visible, action: () => togglePanel('machineControl') },
        { id: 'lighting', label: 'Lighting', icon: '💡', checked: panels.lighting?.visible, action: () => togglePanel('lighting') }
      ]
    },
    {
      id: 'setup',
      icon: '⚙️',
      label: 'Setup',
      items: [
        { id: 'stock', label: 'Stock Setup', icon: '📦', action: () => togglePanel('stockSetup') },
        { id: 'fixture', label: 'Fixture Setup', icon: '🗜️', action: () => togglePanel('fixtureSetup') },
        { id: 'part', label: 'Part Setup', icon: '🔩', action: () => togglePanel('partSetup') },
        { id: 'machine', label: 'Machine Setup', icon: '🏭', action: () => togglePanel('machineSetup') }
      ]
    }
  ];

  // Quick access toolbar items
  const quickTools = [
    { id: 'gcode', icon: '📝', title: 'G-Code', panel: 'gcode' },
    { id: 'tools', icon: '🔧', title: 'Tools', panel: 'tools' },
    { id: 'manual', icon: '🎮', title: 'Manual', panel: 'machineControl' },
    { id: 'offsets', icon: '📐', title: 'Offsets', panel: 'workOffsets' },
    { id: 'lighting', icon: '💡', title: 'Lighting', panel: 'lighting' }
  ];

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: 'linear-gradient(to bottom, #1a1f2e 0%, #141822 100%)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '0 15px',
        zIndex: 10000,
        userSelect: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {/* Logo/Brand */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '16px'
          }}>
            CNC
          </div>
          <div style={{ 
            color: '#888',
            fontSize: '12px',
            borderLeft: '1px solid #333',
            paddingLeft: '10px'
          }}>
            {projectName}
          </div>
        </div>

        {/* Main Menu */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {menuItems.map(menu => (
            <div key={menu.id} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                onMouseEnter={() => activeMenu && setActiveMenu(menu.id)}
                style={{
                  padding: '8px 12px',
                  background: activeMenu === menu.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeMenu === menu.id ? '#00d4ff' : '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '16px' }}>{menu.icon}</span>
                {menu.label}
              </button>
              
              {activeMenu === menu.id && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#1a1f2e',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '8px',
                  minWidth: '200px',
                  marginTop: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  overflow: 'hidden'
                }}>
                  {menu.items.map((item, idx) => (
                    item.divider ? (
                      <div key={idx} style={{ 
                        height: '1px', 
                        background: 'rgba(255,255,255,0.1)', 
                        margin: '4px 0' 
                      }} />
                    ) : (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setActiveMenu(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 15px',
                          background: 'transparent',
                          border: 'none',
                          color: item.checked ? '#00ff88' : '#e0e0e0',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 212, 255, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.icon && <span style={{ fontSize: '16px' }}>{item.icon}</span>}
                          <span>{item.label}</span>
                          {item.checked && <span style={{ color: '#00ff88' }}>✓</span>}
                        </div>
                        {item.shortcut && (
                          <span style={{ 
                            fontSize: '10px', 
                            color: '#666',
                            marginLeft: '20px'
                          }}>
                            {item.shortcut}
                          </span>
                        )}
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
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          padding: '4px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '6px'
        }}>
          <button 
            onClick={() => onSimulationControl('playPause')}
            style={{
              width: '32px',
              height: '32px',
              background: simulation?.isPlaying ? '#00ff88' : 'rgba(42, 47, 62, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: simulation?.isPlaying ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={simulation?.isPlaying ? 'Pause' : 'Play'}
          >
            {simulation?.isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={() => onSimulationControl('stop')}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(42, 47, 62, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Stop"
          >
            ⏹
          </button>
          <button 
            onClick={() => onSimulationControl('step')}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(42, 47, 62, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Step"
          >
            ⏭
          </button>
        </div>

        {/* Quick Access Toolbar */}
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          borderLeft: '1px solid #333',
          paddingLeft: '15px'
        }}>
          {quickTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => togglePanel(tool.panel)}
              style={{
                width: '36px',
                height: '36px',
                background: panels[tool.panel]?.visible 
                  ? 'linear-gradient(135deg, #00d4ff, #0099cc)' 
                  : 'rgba(42, 47, 62, 0.5)',
                border: panels[tool.panel]?.visible 
                  ? '1px solid #00d4ff' 
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: panels[tool.panel]?.visible ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title={tool.title}
            >
              {tool.icon}
              {panels[tool.panel]?.visible && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '6px',
                  height: '6px',
                  background: '#00ff88',
                  borderRadius: '50%'
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Settings/User */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          borderLeft: '1px solid #333',
          paddingLeft: '15px'
        }}>
          <button
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(42, 47, 62, 0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
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
            zIndex: 9999
          }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </>
  );
};

export default ModernTopBar;