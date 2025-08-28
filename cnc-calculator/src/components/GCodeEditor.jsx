import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const codeDisplayRef = useRef(null);
  
  useEffect(() => {
    if (codeDisplayRef.current && currentLine > 0) {
      const lineHeight = 18;
      const scrollTo = currentLine * lineHeight - 100;
      codeDisplayRef.current.scrollTop = scrollTo;
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
        
        {/* Code display area */}
        <div 
          ref={codeDisplayRef}
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative'
          }}
          onScroll={(e) => {
            if (lineNumbersRef.current) {
              lineNumbersRef.current.scrollTop = e.target.scrollTop;
            }
          }}
        >
          <div style={{
            padding: '10px',
            fontSize: '14px',
            fontFamily: 'Consolas, Courier New, monospace',
            lineHeight: '18px',
            whiteSpace: 'pre',
            minHeight: '200px'
          }}>
            {gcode[`channel${activeChannel}`]?.split('\n').map((line, index) => (
              <div 
                key={index}
                style={{
                  color: index === currentLine ? '#00ff33' : '#ffffff',
                  fontWeight: index === currentLine ? 'bold' : 'normal',
                  textShadow: index === currentLine ? '0 0 2px #00ff33' : 'none'
                }}
              >
                {line || ' '}
              </div>
            ))}
          </div>
          
          {/* Hidden textarea for editing */}
          <textarea
            ref={textareaRef}
            value={gcode[`channel${activeChannel}`] || ''}
            onChange={handleChange}
            spellCheck={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'Consolas, Courier New, monospace',
              lineHeight: '18px',
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: '#00ff33',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflow: 'auto'
            }}
            placeholder=""
          />
        </div>
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