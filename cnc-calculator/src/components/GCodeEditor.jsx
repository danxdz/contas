import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current && currentLine > 0) {
      const lines = gcode[`channel${activeChannel}`].split('\n');
      const lineHeight = 18;
      const scrollTo = currentLine * lineHeight - 100;
      textareaRef.current.scrollTop = scrollTo;
    }
  }, [currentLine, activeChannel]);
  
  const handleChange = (e) => {
    onChange({
      ...gcode,
      [`channel${activeChannel}`]: e.target.value
    });
  };

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translateY(-${e.target.scrollTop}px)`;
    }
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
      
      <div style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0 }}>
        <textarea
          ref={textareaRef}
          className="gcode-textarea"
          value={gcode[`channel${activeChannel}`] || ''}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder="Enter G-code here..."
          style={{
            backgroundColor: '#0a0e1a',
            lineHeight: '18px',
            paddingLeft: '10px',
            paddingBottom: '10px',
            width: '100%',
            height: '100%',
            minHeight: '200px'
          }}
        />
        {currentLine >= 0 && (
          <div
            ref={highlightRef}
            className="gcode-highlight-overlay"
            style={{
              position: 'absolute',
              top: `${currentLine * 18 + 10}px`,
              left: '10px',
              right: '10px',
              height: '18px',
              pointerEvents: 'none',
              color: '#00ff33',
              fontFamily: 'Consolas, Courier New, monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              lineHeight: '18px',
              textShadow: '0 0 10px #00ff33, 0 0 20px #00ff33, 0 0 30px #00ff33',
              whiteSpace: 'pre',
              overflow: 'hidden',
              transform: textareaRef.current ? `translateY(-${textareaRef.current.scrollTop}px)` : 'none'
            }}
          >
            {gcode[`channel${activeChannel}`]?.split('\n')[currentLine] || ''}
          </div>
        )}
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