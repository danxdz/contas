import React, { useState, useEffect } from 'react';

const GCodeModule = ({ sharedState, updateState, messageBus }) => {
  const [code, setCode] = useState(sharedState.project.gcode || '');
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    // Listen for line changes
    const unsubscribe = messageBus.on('line:changed', (e) => {
      setCurrentLine(e.detail.line);
    });
    return unsubscribe;
  }, [messageBus]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    updateState('project.gcode', newCode);
    messageBus.emit('gcode:changed', { code: newCode });
  };

  const parseGCode = () => {
    const lines = code.split('\n');
    const commands = [];
    
    lines.forEach((line, idx) => {
      const cleanLine = line.replace(/;.*$/, '').trim();
      if (cleanLine) {
        const parts = cleanLine.match(/([GM]\d+)|([XYZFST]-?\d*\.?\d+)/g);
        if (parts) {
          commands.push({ line: idx, command: cleanLine, parts });
        }
      }
    });
    
    return commands;
  };

  return (
    <div className="module gcode-module">
      <div className="module-header">
        G-Code Editor
        <div style={{ float: 'right' }}>
          Line: {currentLine + 1} / {code.split('\n').length}
        </div>
      </div>
      <div className="module-content">
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Line numbers */}
          <div style={{
            width: '40px',
            paddingRight: '8px',
            textAlign: 'right',
            color: '#666',
            fontSize: '12px',
            lineHeight: '18px',
            fontFamily: 'monospace'
          }}>
            {code.split('\n').map((_, idx) => (
              <div 
                key={idx}
                style={{
                  background: idx === currentLine ? '#00d4ff22' : 'transparent',
                  color: idx === currentLine ? '#00d4ff' : '#666'
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
          
          {/* Code editor */}
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onScroll={(e) => {
              // Sync line numbers scroll
              const lineNumbers = e.target.previousSibling;
              if (lineNumbers) {
                lineNumbers.scrollTop = e.target.scrollTop;
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#e0e0e0',
              fontSize: '12px',
              lineHeight: '18px',
              fontFamily: 'monospace',
              resize: 'none',
              padding: 0
            }}
            spellCheck={false}
          />
        </div>
        
        {/* Quick actions */}
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid #333',
          display: 'flex',
          gap: '8px'
        }}>
          <button 
            onClick={() => {
              const parsed = parseGCode();
              console.log('Parsed G-Code:', parsed);
              messageBus.emit('gcode:parsed', { commands: parsed });
            }}
            style={{
              padding: '4px 12px',
              background: '#2a2f3e',
              border: '1px solid #333',
              color: '#e0e0e0',
              fontSize: '12px',
              borderRadius: '4px'
            }}
          >
            Parse
          </button>
          
          <button 
            onClick={() => {
              messageBus.emit('simulation:play', {});
            }}
            style={{
              padding: '4px 12px',
              background: '#00d4ff',
              border: 'none',
              color: '#000',
              fontSize: '12px',
              borderRadius: '4px'
            }}
          >
            Simulate
          </button>
          
          <button 
            onClick={() => {
              const blob = new Blob([code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'program.nc';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '4px 12px',
              background: '#2a2f3e',
              border: '1px solid #333',
              color: '#e0e0e0',
              fontSize: '12px',
              borderRadius: '4px'
            }}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default GCodeModule;