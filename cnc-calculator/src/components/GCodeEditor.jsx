import React, { useState, useRef, useEffect } from 'react';

const GCodeEditor = ({ gcode, onChange, currentLine }) => {
  const [activeChannel, setActiveChannel] = useState(1);
  const textareaRef = useRef(null);
  
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
    const indicator = e.target.parentElement.querySelector('.line-indicator');
    if (indicator) {
      indicator.style.transform = `translateY(-${e.target.scrollTop}px)`;
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
      
      <div style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Active line indicator */}
        {currentLine >= 0 && (
          <div 
            className="line-indicator"
            style={{
              position: 'absolute',
              left: '2px',
              top: `${currentLine * 18 + 10}px`,
              width: '3px',
              height: '18px',
              backgroundColor: '#00ff33',
              zIndex: 2,
              pointerEvents: 'none',
              transition: 'top 0.2s ease'
            }}>
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '0',
              color: '#00ff33',
              fontSize: '10px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              ▶ L{currentLine + 1}
            </div>
          </div>
        )}
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
            paddingLeft: currentLine >= 0 ? '50px' : '10px',
            paddingBottom: '10px',
            width: '100%',
            height: '100%',
            minHeight: '200px',
            color: '#ffffff',
            transition: 'padding-left 0.2s ease'
          }}
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