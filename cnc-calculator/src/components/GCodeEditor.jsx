import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current && currentLine > 0) {
      const lineHeight = 18;
      const scrollTo = currentLine * lineHeight - 100;
      textareaRef.current.scrollTop = scrollTo;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTo;
      }
    }
  }, [currentLine, activeChannel]);
  
  const handleChange = (e) => {
    onChange({
      ...gcode,
      [`channel${activeChannel}`]: e.target.value
    });
  };
  
  const insertCommand = (command) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = gcode[`channel${activeChannel}`];
    const newText = text.substring(0, start) + command + text.substring(end);
    
    onChange({
      ...gcode,
      [`channel${activeChannel}`]: newText
    });
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + command.length;
      textarea.focus();
    }, 0);
  };
  
  return (
    <div className="gcode-editor-content">
      <div className="gcode-tabs">
        <button 
          className={`gcode-tab ${activeChannel === 1 ? 'active' : ''}`}
          onClick={() => setActiveChannel(1)}
        >
          Channel 1
        </button>
        <button 
          className={`gcode-tab ${activeChannel === 2 ? 'active' : ''}`}
          onClick={() => setActiveChannel(2)}
        >
          Channel 2
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          onClick={() => insertCommand('G00 ')}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Rapid
        </button>
        <button 
          onClick={() => insertCommand('G01 ')}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Linear
        </button>
        <button 
          onClick={() => insertCommand('G02 ')}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Arc CW
        </button>
        <button 
          onClick={() => insertCommand('G03 ')}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Arc CCW
        </button>
        <button 
          onClick={() => insertCommand('M06 T')}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          Tool Change
        </button>
      </div>
      
      <div style={{ 
        position: 'relative', 
        flex: 1, 
        display: 'flex',
        backgroundColor: '#0a0e1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {/* Line numbers column */}
        <div 
          ref={lineNumbersRef}
          style={{
            width: '50px',
            backgroundColor: '#050810',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#4a5568',
            fontSize: '14px',
            fontFamily: 'Consolas, Courier New, monospace',
            lineHeight: '18px',
            padding: '10px 0',
            textAlign: 'right',
            paddingRight: '10px',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {gcode[`channel${activeChannel}`]?.split('\n').map((_, index) => (
            <div 
              key={index}
              style={{
                color: index === currentLine ? '#00ff33' : '#4a5568',
                fontWeight: index === currentLine ? 'bold' : 'normal'
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code textarea with syntax highlighting */}
        <textarea
          ref={textareaRef}
          className="gcode-textarea"
          value={gcode[`channel${activeChannel}`] || ''}
          onChange={handleChange}
          onScroll={(e) => {
            if (lineNumbersRef.current) {
              lineNumbersRef.current.scrollTop = e.target.scrollTop;
            }
          }}
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            fontFamily: 'Consolas, Courier New, monospace',
            lineHeight: '18px',
            backgroundColor: '#0a0e1a',
            color: '#ffffff',
            caretColor: '#00ff33',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'auto',
            whiteSpace: 'pre'
          }}
          placeholder="Enter G-code here..."
        />
      </div>
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '11px', 
        color: '#718096',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Line: {currentLine + 1}</span>
        <span>Total: {gcode[`channel${activeChannel}`]?.split('\n').length || 0} lines</span>
      </div>
    </div>
  );
};

export default GCodeEditor;