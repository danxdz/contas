import React, { useState } from 'react';

const ToolManager = ({ tools = [], onChange }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  
  const defaultTools = [
    { id: 1, tNumber: 'T1', name: '10mm End Mill', diameter: 10, flutes: 4, type: 'endmill' },
    { id: 2, tNumber: 'T2', name: '6mm Drill', diameter: 6, type: 'drill' },
    { id: 3, tNumber: 'T3', name: '50mm Face Mill', diameter: 50, flutes: 5, type: 'facemill' },
    { id: 4, tNumber: 'T4', name: '8mm Slot Mill', diameter: 8, flutes: 2, type: 'slotmill' },
    { id: 5, tNumber: 'T5', name: '12mm Ball End', diameter: 12, flutes: 2, type: 'ballend' },
  ];
  
  const currentTools = tools.length > 0 ? tools : defaultTools;
  
  const addTool = () => {
    const newTool = {
      id: Date.now(),
      tNumber: `T${currentTools.length + 1}`,
      name: 'New Tool',
      diameter: 10,
      flutes: 4,
      type: 'endmill'
    };
    onChange([...currentTools, newTool]);
  };
  
  const deleteTool = (id) => {
    onChange(currentTools.filter(t => t.id !== id));
    setSelectedTool(null);
  };
  
  const updateTool = (id, updates) => {
    onChange(currentTools.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={addTool}
          style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            width: '100%'
          }}
        >
          + Add Tool
        </button>
      </div>
      
      <div className="tool-list" style={{ flex: 1, overflowY: 'auto' }}>
        {currentTools.map(tool => (
          <div 
            key={tool.id}
            className={`tool-item ${selectedTool?.id === tool.id ? 'selected' : ''}`}
            onClick={() => setSelectedTool(tool)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: '#00d4ff' }}>{tool.tNumber}</strong>
              <span style={{ fontSize: '11px', color: '#718096' }}>{tool.type}</span>
            </div>
            <div style={{ fontSize: '12px' }}>{tool.name}</div>
            <div style={{ fontSize: '11px', color: '#718096' }}>
              ⌀{tool.diameter}mm {tool.flutes ? `• ${tool.flutes}FL` : ''}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTool && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00d4ff', fontSize: '12px' }}>
            Edit Tool
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text"
              value={selectedTool.name}
              onChange={(e) => updateTool(selectedTool.id, { name: e.target.value })}
              style={{
                padding: '4px 8px',
                background: '#0a0e1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '11px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number"
                value={selectedTool.diameter}
                onChange={(e) => updateTool(selectedTool.id, { diameter: parseFloat(e.target.value) })}
                placeholder="Diameter"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#0a0e1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  fontSize: '11px'
                }}
              />
              <input 
                type="number"
                value={selectedTool.flutes || ''}
                onChange={(e) => updateTool(selectedTool.id, { flutes: parseInt(e.target.value) })}
                placeholder="Flutes"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#0a0e1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  fontSize: '11px'
                }}
              />
            </div>
            <button 
              onClick={() => deleteTool(selectedTool.id)}
              style={{
                padding: '4px 8px',
                background: '#ff4444',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Delete Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolManager;