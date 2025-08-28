import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const codeDisplayRef = useRef(null);
  
  // Synchronize scrolling and highlighting
  useEffect(() => {
    if (currentLine >= 0) {
      const lineHeight = 18;
      const scrollTo = currentLine * lineHeight - 100;
      
      // Scroll all three elements together
      if (textareaRef.current) {
        textareaRef.current.scrollTop = scrollTo;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTo;
      }
      if (codeDisplayRef.current) {
        codeDisplayRef.current.scrollTop = scrollTo;
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
        {/* Line numbers column - synchronized scroll */}
        <div 
          style={{
            width: '50px',
            backgroundColor: '#050810',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            ref={lineNumbersRef}
            style={{
              padding: '10px 10px 10px 0',
              fontSize: '14px',
              fontFamily: 'Consolas, Courier New, monospace',
              lineHeight: '18px',
              textAlign: 'right',
              color: '#4a5568',
              userSelect: 'none'
            }}
          >
            {gcode[`channel${activeChannel}`]?.split('\n').map((_, index) => (
              <div 
                key={index}
                style={{
                  height: '18px',
                  color: index === currentLine ? '#00ff33' : '#4a5568',
                  fontWeight: index === currentLine ? 'bold' : 'normal',
                  transition: 'color 0.2s ease'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main editor area */}
        <div 
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Code display - visible, shows highlighting */}
          <div
            ref={codeDisplayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'Consolas, Courier New, monospace',
              lineHeight: '18px',
              overflow: 'auto',
              pointerEvents: 'none', // Let textarea handle interactions
              zIndex: 1
            }}
            onScroll={(e) => {
              // Sync scroll with line numbers
              if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = e.target.scrollTop;
              }
            }}
          >
            {gcode[`channel${activeChannel}`]?.split('\n').map((line, index) => (
              <div 
                key={index}
                style={{
                  height: '18px',
                  color: index === currentLine ? '#00ff33' : '#ffffff',
                  fontWeight: index === currentLine ? 'bold' : 'normal',
                  textShadow: index === currentLine ? '0 0 3px #00ff33' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'pre'
                }}
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>
          
          {/* Actual textarea for editing - transparent but interactive */}
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
              overflow: 'auto',
              zIndex: 2
            }}
            onScroll={(e) => {
              // Sync all scrolls together
              const scrollTop = e.target.scrollTop;
              if (codeDisplayRef.current) {
                codeDisplayRef.current.scrollTop = scrollTop;
              }
              if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = scrollTop;
              }
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