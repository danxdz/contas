import React, { useState, useEffect } from 'react';

export const meta = {
  id: 'toolmagazine',
  name: 'Tool Magazine',
  area: 'left',
  order: 5,
  icon: '🔧',
};

export default function ToolMagazineModule() {
  const [currentTool, setCurrentTool] = useState(1);
  const [magazineType, setMagazineType] = useState('carousel'); // carousel, turret, chain
  const [capacity, setCapacity] = useState(20);
  const [tools, setTools] = useState(() => {
    // Initialize with some default tools
    const defaultTools = {};
    for (let i = 1; i <= 5; i++) {
      defaultTools[i] = {
        diameter: i === 1 ? 6 : i === 2 ? 10 : i === 3 ? 12 : i === 4 ? 3 : 20,
        length: 50 + i * 10,
        type: i === 4 ? 'drill' : 'endmill'
      };
    }
    return defaultTools;
  });

  // Update current tool in viewer if available
  useEffect(() => {
    if (window.cncViewer && window.cncViewer.setCurrentTool) {
      window.cncViewer.setCurrentTool(currentTool);
    }
  }, [currentTool]);

  const handleToolChange = (toolNum) => {
    if (toolNum >= 0 && toolNum <= capacity) {
      setCurrentTool(toolNum);
    }
  };

  const updateTool = (toolNum, field, value) => {
    setTools(prev => ({
      ...prev,
      [toolNum]: {
        ...prev[toolNum],
        [field]: value
      }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Current Tool Display */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '4px 8px',
        background: 'rgba(76, 175, 80, 0.1)',
        borderRadius: '3px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Current Tool</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>T{currentTool}</span>
      </div>

      {/* Magazine Type */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '11px' }}>Magazine Type</span>
        <select 
          value={magazineType}
          onChange={(e) => setMagazineType(e.target.value)}
          style={{ fontSize: '11px' }}
        >
          <option value="carousel">Carousel</option>
          <option value="turret">Turret</option>
          <option value="chain">Chain</option>
        </select>
      </label>

      {/* Tool Selection */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button 
          onClick={() => handleToolChange(currentTool - 1)}
          disabled={currentTool <= 0}
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          ←
        </button>
        <input
          type="number"
          value={currentTool}
          onChange={(e) => handleToolChange(parseInt(e.target.value) || 0)}
          min="0"
          max={capacity}
          style={{ width: '40px', textAlign: 'center', fontSize: '11px' }}
        />
        <button 
          onClick={() => handleToolChange(currentTool + 1)}
          disabled={currentTool >= capacity}
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          →
        </button>
        <span style={{ fontSize: '10px', color: '#666' }}>/ {capacity}</span>
      </div>

      {/* Quick Tool Select */}
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5].map(t => (
          <button
            key={t}
            onClick={() => setCurrentTool(t)}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              background: currentTool === t ? '#4CAF50' : undefined,
              color: currentTool === t ? 'white' : undefined,
              border: '1px solid #ccc',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            T{t}
          </button>
        ))}
      </div>

      {/* Tool Details */}
      {currentTool > 0 && tools[currentTool] && (
        <div style={{ 
          padding: '6px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '3px',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            T{currentTool} Details
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <label style={{ flex: 1 }}>
              <span style={{ fontSize: '10px' }}>Ø</span>
              <input
                type="number"
                value={tools[currentTool].diameter || ''}
                onChange={(e) => updateTool(currentTool, 'diameter', parseFloat(e.target.value))}
                style={{ width: '100%', fontSize: '10px' }}
                placeholder="mm"
              />
            </label>
            <label style={{ flex: 1 }}>
              <span style={{ fontSize: '10px' }}>L</span>
              <input
                type="number"
                value={tools[currentTool].length || ''}
                onChange={(e) => updateTool(currentTool, 'length', parseFloat(e.target.value))}
                style={{ width: '100%', fontSize: '10px' }}
                placeholder="mm"
              />
            </label>
          </div>
          <select
            value={tools[currentTool].type || 'endmill'}
            onChange={(e) => updateTool(currentTool, 'type', e.target.value)}
            style={{ width: '100%', fontSize: '10px' }}
          >
            <option value="endmill">End Mill</option>
            <option value="drill">Drill</option>
            <option value="tap">Tap</option>
            <option value="reamer">Reamer</option>
            <option value="boring">Boring Bar</option>
          </select>
        </div>
      )}

      {/* Tool List */}
      <div style={{ fontSize: '10px', color: '#666', marginTop: 4 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Loaded Tools:</div>
        {Object.entries(tools).map(([num, tool]) => (
          <div key={num} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>T{num}</span>
            <span>Ø{tool.diameter}mm {tool.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}