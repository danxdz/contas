import React, { useState, useRef, useEffect } from 'react';

const ModernMenu = ({ 
  project,
  onNewProject,
  onSaveProject,
  onLoadProject,
  onTogglePanel,
  onViewChange,
  simulation,
  onSimulationControl
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = {
    file: {
      label: 'File',
      items: [
        { id: 'new', label: 'New Project', icon: '📄', action: onNewProject, shortcut: 'Ctrl+N' },
        { id: 'open', label: 'Open...', icon: '📂', action: () => document.getElementById('file-input')?.click(), shortcut: 'Ctrl+O' },
        { id: 'save', label: 'Save', icon: '💾', action: onSaveProject, shortcut: 'Ctrl+S' },
        { divider: true },
        { id: 'import', label: 'Import STEP/STL...', icon: '📥', action: () => document.getElementById('import-3d')?.click() },
        { id: 'export', label: 'Export G-Code...', icon: '📤', action: () => {
          const blob = new Blob([project?.gcode?.channel1 || ''], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project?.name || 'program'}.nc`;
          a.click();
          URL.revokeObjectURL(url);
        }},
        { divider: true },
        { id: 'exit', label: 'Exit', icon: '🚪', action: () => window.close() }
      ]
    },
    view: {
      label: 'View',
      items: [
        { id: 'top', label: 'Top View', icon: '⬆️', action: () => onViewChange?.('top'), shortcut: 'T' },
        { id: 'front', label: 'Front View', icon: '➡️', action: () => onViewChange?.('front'), shortcut: 'F' },
        { id: 'side', label: 'Side View', icon: '⬅️', action: () => onViewChange?.('side'), shortcut: 'S' },
        { id: 'iso', label: 'Isometric', icon: '🔷', action: () => onViewChange?.('iso'), shortcut: 'I' },
        { divider: true },
        { id: 'gcode', label: 'G-Code Editor', icon: '📝', action: () => onTogglePanel?.('gcode'), checked: false },
        { id: 'tools', label: 'Tool Manager', icon: '🔧', action: () => onTogglePanel?.('tools'), checked: false },
        { id: 'offsets', label: 'Work Offsets', icon: '📐', action: () => onTogglePanel?.('offsets'), checked: false }
      ]
    },
    simulation: {
      label: 'Simulation',
      items: [
        { id: 'play', label: simulation?.isPlaying ? 'Pause' : 'Play', icon: simulation?.isPlaying ? '⏸️' : '▶️', 
          action: () => onSimulationControl?.('playPause'), shortcut: 'Space' },
        { id: 'stop', label: 'Stop', icon: '⏹️', action: () => onSimulationControl?.('stop'), shortcut: 'Esc' },
        { id: 'reset', label: 'Reset', icon: '🔄', action: () => onSimulationControl?.('reset') },
        { divider: true },
        { id: 'slower', label: 'Slower', icon: '🐢', action: () => onSimulationControl?.('slower') },
        { id: 'faster', label: 'Faster', icon: '🐇', action: () => onSimulationControl?.('faster') },
        { divider: true },
        { id: 'step-forward', label: 'Step Forward', icon: '⏭️', action: () => onSimulationControl?.('stepForward'), shortcut: '→' },
        { id: 'step-backward', label: 'Step Backward', icon: '⏮️', action: () => onSimulationControl?.('stepBackward'), shortcut: '←' }
      ]
    },
    tools: {
      label: 'Tools',
      items: [
        { id: 'tool-manager', label: 'Tool Manager', icon: '🔧', action: () => onTogglePanel?.('tools') },
        { id: 'tool-offsets', label: 'Tool Offsets', icon: '📏', action: () => onTogglePanel?.('toolOffsets') },
        { divider: true },
        { id: 'calculator', label: 'Feeds & Speeds', icon: '🧮', action: () => onTogglePanel?.('calculator') },
        { id: 'probe', label: 'Tool Probe', icon: '📍', action: () => onTogglePanel?.('probe') }
      ]
    },
    help: {
      label: 'Help',
      items: [
        { id: 'docs', label: 'Documentation', icon: '📚', action: () => window.open('/docs', '_blank') },
        { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️', action: () => onTogglePanel?.('shortcuts') },
        { divider: true },
        { id: 'about', label: 'About', icon: 'ℹ️', action: () => onTogglePanel?.('about') }
      ]
    }
  };

  const handleMenuClick = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
      setActiveMenu(null);
    }
  };

  return (
    <div ref={menuRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '35px',
      background: 'linear-gradient(180deg, #2a2f3e 0%, #1a1f2e 100%)',
      borderBottom: '1px solid #0a0e1a',
      display: 'flex',
      alignItems: 'center',
      zIndex: 10000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      userSelect: 'none'
    }}>
      {/* Logo/Brand */}
      <div style={{
        padding: '0 15px',
        fontWeight: 'bold',
        color: '#00d4ff',
        fontSize: '14px'
      }}>
        CNC Pro
      </div>

      {/* Menu Items */}
      {Object.entries(menuItems).map(([key, menu]) => (
        <div key={key} style={{ position: 'relative' }}>
          <button
            onClick={() => handleMenuClick(key)}
            onMouseEnter={() => activeMenu && setActiveMenu(key)}
            style={{
              padding: '0 15px',
              height: '35px',
              background: activeMenu === key ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              border: 'none',
              color: activeMenu === key ? '#00d4ff' : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '13px'
            }}
          >
            {menu.label}
          </button>

          {/* Dropdown */}
          {activeMenu === key && (
            <div style={{
              position: 'absolute',
              top: '35px',
              left: 0,
              minWidth: '220px',
              background: '#1a1f2e',
              border: '1px solid #333',
              borderRadius: '0 0 6px 6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              padding: '4px 0',
              animation: 'slideDown 0.2s ease-out'
            }}>
              {menu.items.map((item, index) => (
                item.divider ? (
                  <div key={index} style={{
                    height: '1px',
                    background: '#333',
                    margin: '4px 0'
                  }} />
                ) : (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      padding: '8px 15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: hoveredItem === item.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                      color: hoveredItem === item.id ? '#00d4ff' : '#e0e0e0',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span style={{
                        fontSize: '11px',
                        color: '#888',
                        marginLeft: '20px'
                      }}>
                        {item.shortcut}
                      </span>
                    )}
                    {item.checked !== undefined && (
                      <span>{item.checked ? '✓' : ''}</span>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Right side status */}
      <div style={{
        marginLeft: 'auto',
        padding: '0 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        color: '#888',
        fontSize: '12px'
      }}>
        {simulation?.isPlaying && (
          <span style={{ color: '#00ff88' }}>● Playing</span>
        )}
        <span>Line: {simulation?.currentLine || 0}</span>
        <span>Speed: {simulation?.speed || 1}x</span>
      </div>

      {/* Hidden file inputs */}
      <input
        id="file-input"
        type="file"
        accept=".nc,.gcode,.txt"
        style={{ display: 'none' }}
        onChange={onLoadProject}
      />
      <input
        id="import-3d"
        type="file"
        accept=".step,.stp,.stl"
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernMenu;