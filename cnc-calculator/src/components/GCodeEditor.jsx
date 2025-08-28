import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  
  // Auto-scroll to current line
  useEffect(() => {
    if (textareaRef.current && currentLine >= 0) {
      const lineHeight = 18;
      const scrollTo = currentLine * lineHeight - 100;
      textareaRef.current.scrollTop = scrollTo;
      setScrollTop(scrollTo);
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
      
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          flex: 1, 
          display: 'flex',
          backgroundColor: '#0a0e1a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {/* Simple line highlight bar that moves behind the text */}
        {currentLine >= 0 && (
          <div
            style={{
              position: 'absolute',
              top: `${currentLine * 18 + 10}px`,
              left: 0,
              right: 0,
              height: '18px',
              backgroundColor: 'rgba(0, 255, 51, 0.15)',
              borderLeft: '3px solid #00ff33',
              zIndex: 0,
              transition: 'top 0.2s ease',
              transform: `translateY(-${scrollTop}px)`
            }}
          />
        )}
        
        {/* Single textarea with line numbers as background */}
        <textarea
          ref={textareaRef}
          className="gcode-textarea"
          value={gcode[`channel${activeChannel}`] || ''}
          onChange={handleChange}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '10px 10px 10px 60px',
            fontSize: '14px',
            fontFamily: 'Consolas, Courier New, monospace',
            lineHeight: '18px',
            backgroundColor: 'transparent',
            color: '#ffffff',
            caretColor: '#00ff33',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'auto',
            zIndex: 1,
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 17px,
              rgba(255, 255, 255, 0.02) 17px,
              rgba(255, 255, 255, 0.02) 18px
            )`,
            backgroundAttachment: 'local'
          }}
          onScroll={(e) => {
            setScrollTop(e.target.scrollTop);
          }}
          placeholder="Enter G-code here..."
        />
        
        {/* Line numbers overlay - non-interactive */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50px',
            height: '100%',
            backgroundColor: '#050810',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '10px 10px 10px 0',
              fontSize: '14px',
              fontFamily: 'Consolas, Courier New, monospace',
              lineHeight: '18px',
              textAlign: 'right',
              color: '#4a5568',
              transform: `translateY(-${scrollTop}px)`
            }}
          >
            {gcode[`channel${activeChannel}`]?.split('\n').map((_, index) => (
              <div 
                key={index}
                style={{
                  height: '18px',
                  color: index === currentLine ? '#00ff33' : '#4a5568',
                  fontWeight: index === currentLine ? 'bold' : 'normal'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
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