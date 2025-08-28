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
        
        {/* Code display with active line highlighting */}
        <div 
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0a0e1a'
          }}
        >
          <div
            ref={textareaRef}
            style={{
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'Consolas, Courier New, monospace',
              lineHeight: '18px',
              whiteSpace: 'pre',
              minHeight: '100%',
              overflow: 'auto',
              color: '#ffffff'
            }}
            onScroll={(e) => {
              if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = e.target.scrollTop;
              }
            }}
          >
            {gcode[`channel${activeChannel}`]?.split('\n').map((line, index) => (
              <div 
                key={index}
                style={{
                  color: index === currentLine ? '#00ff33' : '#ffffff',
                  fontWeight: index === currentLine ? 'bold' : 'normal',
                  textShadow: index === currentLine ? '0 0 3px #00ff33' : 'none',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  // Allow clicking on lines to edit
                  const textarea = e.target.parentElement.nextSibling;
                  if (textarea) {
                    const lineStart = line.split('\n').slice(0, index).join('\n').length + (index > 0 ? 1 : 0);
                    textarea.setSelectionRange(lineStart, lineStart);
                    textarea.focus();
                  }
                }}
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>
          
          {/* Invisible textarea for editing */}
          <textarea
            value={gcode[`channel${activeChannel}`] || ''}
            onChange={handleChange}
            spellCheck={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
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
              overflow: 'auto',
              opacity: 0.01 // Almost invisible but still interactive
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