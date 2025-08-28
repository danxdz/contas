import React, { useState } from 'react';

const ToolsModule = ({ sharedState, updateState, messageBus }) => {
  const [tools, setTools] = useState(sharedState.project.tools || [
    { id: 1, number: 1, diameter: 10, flutes: 4, type: 'endmill', description: '10mm End Mill' },
    { id: 2, number: 2, diameter: 6, flutes: 3, type: 'endmill', description: '6mm End Mill' },
    { id: 3, number: 3, diameter: 3, flutes: 2, type: 'endmill', description: '3mm End Mill' }
  ]);
  
  const [selectedTool, setSelectedTool] = useState(null);

  const addTool = () => {
    const newTool = {
      id: Date.now(),
      number: tools.length + 1,
      diameter: 10,
      flutes: 4,
      type: 'endmill',
      description: 'New Tool'
    };
    
    const updatedTools = [...tools, newTool];
    setTools(updatedTools);
    updateState('project.tools', updatedTools);
    messageBus.emit('tools:changed', { tools: updatedTools });
  };

  const updateTool = (id, field, value) => {
    const updatedTools = tools.map(tool => 
      tool.id === id ? { ...tool, [field]: value } : tool
    );
    setTools(updatedTools);
    updateState('project.tools', updatedTools);
    messageBus.emit('tools:changed', { tools: updatedTools });
  };

  const deleteTool = (id) => {
    const updatedTools = tools.filter(tool => tool.id !== id);
    setTools(updatedTools);
    updateState('project.tools', updatedTools);
    setSelectedTool(null);
    messageBus.emit('tools:changed', { tools: updatedTools });
  };

  return (
    <div className="module tools-module">
      <div className="module-header">
        Tool Library
      </div>
      <div className="module-content">
        {/* Tool list */}
        <div style={{ marginBottom: '12px' }}>
          {tools.map(tool => (
            <div
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              style={{
                padding: '8px',
                marginBottom: '4px',
                background: selectedTool?.id === tool.id ? '#00d4ff22' : '#2a2f3e',
                border: `1px solid ${selectedTool?.id === tool.id ? '#00d4ff' : '#333'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>T{tool.number}</strong>
                <span style={{ color: '#888' }}>Ø{tool.diameter}mm</span>
              </div>
              <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                {tool.description}
              </div>
            </div>
          ))}
        </div>

        {/* Add tool button */}
        <button
          onClick={addTool}
          style={{
            width: '100%',
            padding: '8px',
            background: '#2a2f3e',
            border: '1px dashed #666',
            color: '#888',
            fontSize: '12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          + Add Tool
        </button>

        {/* Tool details */}
        {selectedTool && (
          <div style={{
            padding: '12px',
            background: '#1a1f2e',
            border: '1px solid #333',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
              Tool Details
            </h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                  Tool Number
                </label>
                <input
                  type="number"
                  value={selectedTool.number}
                  onChange={(e) => updateTool(selectedTool.id, 'number', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={selectedTool.description}
                  onChange={(e) => updateTool(selectedTool.id, 'description', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    Diameter (mm)
                  </label>
                  <input
                    type="number"
                    value={selectedTool.diameter}
                    onChange={(e) => updateTool(selectedTool.id, 'diameter', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    Flutes
                  </label>
                  <input
                    type="number"
                    value={selectedTool.flutes}
                    onChange={(e) => updateTool(selectedTool.id, 'flutes', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                  Type
                </label>
                <select
                  value={selectedTool.type}
                  onChange={(e) => updateTool(selectedTool.id, 'type', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="endmill">End Mill</option>
                  <option value="ballmill">Ball Mill</option>
                  <option value="drill">Drill</option>
                  <option value="facemill">Face Mill</option>
                  <option value="chamfer">Chamfer Mill</option>
                </select>
              </div>
              
              <button
                onClick={() => deleteTool(selectedTool.id)}
                style={{
                  padding: '6px',
                  background: '#aa3333',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Delete Tool
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsModule;