import React, { useState } from 'react';

const MenuBar = ({ 
  togglePanel, 
  setPanels,
  saveProject,
  loadProject,
  newProject,
  setupConfig,
  setSetupConfig,
  handleFileLoad
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuAction = (item) => {
    if (item.action) {
      item.action();
      setActiveMenu(null);
    }
  };

  const menuStructure = {
    file: {
      label: 'File',
      items: [
        { id: 'new', label: 'New', shortcut: 'Ctrl+N', action: newProject },
        { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => document.getElementById('file-input').click() },
        { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: saveProject },
        { divider: true },
        { id: 'import', label: 'Import STEP/STL...', action: () => document.getElementById('import-3d').click() },
        { id: 'export', label: 'Export G-Code...', action: () => {
          const blob = new Blob([project.gcode.channel1], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'program.nc';
          a.click();
        }}
      ]
    },
    edit: {
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
        { divider: true },
        { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
        { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
        { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' }
      ]
    },
    view: {
      label: 'View',
      items: [
        { id: 'gcode', label: 'G-Code Editor', checked: true, action: () => togglePanel('gcode') },
        { id: 'tools', label: 'Tool Manager', action: () => togglePanel('tools') },
        { id: 'machine', label: 'Machine Control', action: () => togglePanel('machineControl') },
        { divider: true },
        { id: 'top', label: 'Top View', shortcut: 'T' },
        { id: 'front', label: 'Front View', shortcut: 'F' },
        { id: 'side', label: 'Side View', shortcut: 'S' },
        { id: 'iso', label: 'Isometric', shortcut: 'I' }
      ]
    },
    setup: {
      label: 'Setup',
      items: [
        { id: 'stock', label: 'Stock Setup...', action: () => togglePanel('stockSetup') },
        { id: 'part', label: 'Part Setup...', action: () => togglePanel('partSetup') },
        { id: 'fixture', label: 'Fixture Setup...', action: () => togglePanel('fixtureSetup') },
        { id: 'machine', label: 'Machine Setup...', action: () => togglePanel('machineSetup') },
        { id: 'workoffsets', label: 'Work Offsets...', action: () => togglePanel('workOffsets') },
        { divider: true },
        { id: 'setupwizard', label: 'Setup Wizard', action: () => {
          setPanels(prev => ({
            ...prev,
            stockSetup: { ...prev.stockSetup, visible: true },
            fixtureSetup: { ...prev.fixtureSetup, visible: true },
            machineSetup: { ...prev.machineSetup, visible: true },
            partSetup: { ...prev.partSetup, visible: true }
          }));
        }}
      ]
    },
    tools: {
      label: 'Tools',
      items: [
        { id: 'calculator', label: 'Feeds & Speeds', action: () => togglePanel('feedsCalculator') },
        { id: 'converter', label: 'Unit Converter', action: () => togglePanel('unitConverter') },
        { id: 'threadmill', label: 'Thread Mill', action: () => togglePanel('threadMill') },
        { divider: true },
        { id: 'probe', label: 'Probe Cycles', action: () => togglePanel('probeCycles') },
        { id: 'macro', label: 'Macro Variables', action: () => togglePanel('macroVariables') }
      ]
    },
    machine: {
      label: 'Machine',
      items: [
        { id: 'config', label: 'Machine Config', action: () => togglePanel('machineConfig') },
        { id: 'offsets', label: 'Work Offsets', action: () => togglePanel('workOffsets') },
        { id: 'control', label: 'Machine Control', action: () => togglePanel('machineControl') }
      ]
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-items">
        {Object.entries(menuStructure).map(([key, menu]) => (
          <div 
            key={key}
            className={`menu-item ${activeMenu === key ? 'active' : ''}`}
            onMouseEnter={() => setActiveMenu(key)}
            onClick={() => setActiveMenu(activeMenu === key ? null : key)}
          >
            {menu.label}
            {activeMenu === key && (
              <div className="menu-dropdown" onMouseLeave={() => setActiveMenu(null)}>
                {menu.items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} className="menu-divider" />
                  ) : (
                    <div 
                      key={item.id}
                      className="menu-dropdown-item"
                      onClick={() => handleMenuAction(item)}
                    >
                      {item.checked !== undefined && (
                        <span className="menu-check">{item.checked ? '✓' : ' '}</span>
                      )}
                      {item.label}
                      {item.shortcut && (
                        <span className="menu-shortcut">{item.shortcut}</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;