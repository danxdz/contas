import React, { useState, useRef, useEffect } from 'react';

const GCodeEditorEnhanced = ({ 
  code, 
  onChange, 
  currentLine,
  onLineClick 
}) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // G-code commands database
  const gcodeCommands = {
    'G': [
      { code: 'G0', desc: 'Rapid positioning' },
      { code: 'G1', desc: 'Linear interpolation' },
      { code: 'G2', desc: 'Circular interpolation CW' },
      { code: 'G3', desc: 'Circular interpolation CCW' },
      { code: 'G4', desc: 'Dwell' },
      { code: 'G17', desc: 'XY plane selection' },
      { code: 'G18', desc: 'XZ plane selection' },
      { code: 'G19', desc: 'YZ plane selection' },
      { code: 'G20', desc: 'Inch units' },
      { code: 'G21', desc: 'Metric units' },
      { code: 'G28', desc: 'Return to home' },
      { code: 'G40', desc: 'Cutter comp off' },
      { code: 'G41', desc: 'Cutter comp left' },
      { code: 'G42', desc: 'Cutter comp right' },
      { code: 'G43', desc: 'Tool length comp' },
      { code: 'G49', desc: 'Cancel tool length comp' },
      { code: 'G54', desc: 'Work offset 1' },
      { code: 'G55', desc: 'Work offset 2' },
      { code: 'G56', desc: 'Work offset 3' },
      { code: 'G57', desc: 'Work offset 4' },
      { code: 'G58', desc: 'Work offset 5' },
      { code: 'G59', desc: 'Work offset 6' },
      { code: 'G80', desc: 'Cancel canned cycle' },
      { code: 'G81', desc: 'Drilling cycle' },
      { code: 'G82', desc: 'Drilling with dwell' },
      { code: 'G83', desc: 'Peck drilling' },
      { code: 'G84', desc: 'Tapping cycle' },
      { code: 'G90', desc: 'Absolute positioning' },
      { code: 'G91', desc: 'Incremental positioning' }
    ],
    'M': [
      { code: 'M0', desc: 'Program stop' },
      { code: 'M1', desc: 'Optional stop' },
      { code: 'M2', desc: 'Program end' },
      { code: 'M3', desc: 'Spindle CW' },
      { code: 'M4', desc: 'Spindle CCW' },
      { code: 'M5', desc: 'Spindle stop' },
      { code: 'M6', desc: 'Tool change' },
      { code: 'M7', desc: 'Mist coolant on' },
      { code: 'M8', desc: 'Flood coolant on' },
      { code: 'M9', desc: 'Coolant off' },
      { code: 'M30', desc: 'Program end and rewind' }
    ],
    'params': [
      { code: 'X', desc: 'X coordinate' },
      { code: 'Y', desc: 'Y coordinate' },
      { code: 'Z', desc: 'Z coordinate' },
      { code: 'I', desc: 'Arc center X offset' },
      { code: 'J', desc: 'Arc center Y offset' },
      { code: 'K', desc: 'Arc center Z offset' },
      { code: 'R', desc: 'Arc radius' },
      { code: 'F', desc: 'Feed rate' },
      { code: 'S', desc: 'Spindle speed' },
      { code: 'T', desc: 'Tool number' },
      { code: 'H', desc: 'Tool length offset' },
      { code: 'D', desc: 'Tool diameter offset' },
      { code: 'P', desc: 'Dwell time' },
      { code: 'Q', desc: 'Peck increment' }
    ]
  };

  // Context menu templates
  const contextMenuTemplates = [
    { label: '📐 Work Offset', template: 'G54 ; Work offset 1' },
    { label: '🔧 Tool Change', template: 'T1 M6\nG43 H1 ; Tool length comp' },
    { label: '💧 Coolant On', template: 'M8 ; Flood coolant on' },
    { label: '🔄 Spindle Start', template: 'S1000 M3 ; Spindle CW at 1000 RPM' },
    { label: '➡️ Rapid Move', template: 'G0 X0 Y0 Z5' },
    { label: '✂️ Feed Move', template: 'G1 X10 Y10 F200' },
    { label: '⭕ Arc CW', template: 'G2 X10 Y10 I5 J0' },
    { label: '🔄 Arc CCW', template: 'G3 X10 Y10 I5 J0' },
    { label: '🕳️ Drill Cycle', template: 'G81 Z-10 R2 F100' },
    { label: '🔨 Peck Drill', template: 'G83 Z-20 R2 Q5 F100' },
    { label: '🏁 Program End', template: 'M5 ; Spindle stop\nM9 ; Coolant off\nM30 ; Program end' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    onChange(value);
    
    // Check for autocomplete trigger
    const beforeCursor = value.substring(0, cursorPos);
    const lastWord = beforeCursor.split(/[\s\n]/).pop();
    
    if (lastWord && /^[GMgm]/.test(lastWord)) {
      setCurrentWord(lastWord.toUpperCase());
      
      // Get cursor position in viewport
      const textarea = textareaRef.current;
      const textBeforeCursor = value.substring(0, cursorPos);
      const lines = textBeforeCursor.split('\n');
      const currentLineNum = lines.length - 1;
      const currentCol = lines[lines.length - 1].length;
      
      // Approximate position (simplified)
      const lineHeight = 20;
      const charWidth = 8;
      const x = currentCol * charWidth + 50; // 50 for line numbers
      const y = currentLineNum * lineHeight + 30;
      
      setAutocompletePosition({ x: Math.min(x, 400), y: Math.min(y, 300) });
      setShowAutocomplete(true);
    } else if (lastWord && /^[XYZIJKRFSTHDPQxyzijkrfsthdpq]/.test(lastWord)) {
      setCurrentWord(lastWord.toUpperCase());
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // Insert template at cursor
  const insertTemplate = (template) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + template + text.substring(end);
    
    onChange(newText);
    setShowContextMenu(false);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + template.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Insert autocomplete suggestion
  const insertAutocomplete = (suggestion) => {
    const textarea = textareaRef.current;
    const text = textarea.value;
    const cursorPos = cursorPosition;
    
    // Find the start of the current word
    const beforeCursor = text.substring(0, cursorPos);
    const words = beforeCursor.split(/[\s\n]/);
    const lastWord = words[words.length - 1];
    const wordStart = beforeCursor.lastIndexOf(lastWord);
    
    // Replace the partial word with the suggestion
    const newText = text.substring(0, wordStart) + suggestion.code + ' ' + text.substring(cursorPos);
    onChange(newText);
    setShowAutocomplete(false);
    
    // Move cursor after the inserted word
    setTimeout(() => {
      textarea.focus();
      const newPos = wordStart + suggestion.code.length + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Get filtered suggestions
  const getSuggestions = () => {
    if (!currentWord) return [];
    
    const prefix = currentWord[0];
    let suggestions = [];
    
    if (prefix === 'G') {
      suggestions = gcodeCommands.G.filter(cmd => 
        cmd.code.startsWith(currentWord)
      );
    } else if (prefix === 'M') {
      suggestions = gcodeCommands.M.filter(cmd => 
        cmd.code.startsWith(currentWord)
      );
    } else {
      suggestions = gcodeCommands.params.filter(cmd => 
        cmd.code.startsWith(currentWord)
      );
    }
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete || showContextMenu) {
        setShowAutocomplete(false);
        setShowContextMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAutocomplete, showContextMenu]);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = code.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1);

  return (
    <div style={{ 
      position: 'relative', 
      height: '100%',
      display: 'flex',
      background: '#0a0e1a',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        style={{
          width: '50px',
          padding: '10px 5px',
          background: '#0f1420',
          borderRight: '1px solid #1a1f2e',
          overflow: 'hidden',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '20px',
          color: '#444',
          userSelect: 'none'
        }}
      >
        {lineNumbers.map(num => (
          <div
            key={num}
            onClick={() => onLineClick && onLineClick(num - 1)}
            style={{
              cursor: 'pointer',
              textAlign: 'right',
              paddingRight: '8px',
              color: currentLine === num - 1 ? '#00ff88' : '#444'
            }}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Code Editor Container */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Highlighted Lines Display */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '20px',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              style={{
                color: currentLine === index ? '#00ff88' : 'transparent',
                height: '20px'
              }}
            >
              {line || ' '}
            </div>
          ))}
        </div>
        
        {/* Actual Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleInputChange}
          onContextMenu={handleContextMenu}
          onScroll={handleScroll}
          spellCheck={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '10px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '20px',
            color: '#e0e0e0',
            resize: 'none',
            mixBlendMode: 'screen'
          }}
          placeholder="Enter G-code here... Right-click for templates"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && getSuggestions().length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: autocompletePosition.x,
            top: autocompletePosition.y,
            background: '#1a1f2e',
            border: '1px solid #00d4ff',
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
            zIndex: 1000,
            maxHeight: '200px',
            overflow: 'auto',
            minWidth: '200px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {getSuggestions().map((suggestion, index) => (
            <div
              key={suggestion.code}
              onClick={() => insertAutocomplete(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: index < getSuggestions().length - 1 ? '1px solid #333' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a3f5f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ 
                color: '#00d4ff', 
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                {suggestion.code}
              </span>
              <span style={{ 
                color: '#888', 
                fontSize: '11px',
                marginLeft: '10px'
              }}>
                {suggestion.desc}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            background: '#1a1f2e',
            border: '1px solid #333',
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1001,
            minWidth: '200px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '5px 10px',
            background: '#0f1420',
            borderBottom: '1px solid #333',
            fontSize: '11px',
            color: '#888',
            fontWeight: 'bold'
          }}>
            Insert G-Code Template
          </div>
          {contextMenuTemplates.map((template, index) => (
            <div
              key={index}
              onClick={() => insertTemplate(template.template)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#e0e0e0',
                borderBottom: index < contextMenuTemplates.length - 1 ? '1px solid #222' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a3f5f';
                e.currentTarget.style.color = '#00d4ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >
              {template.label}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default GCodeEditorEnhanced;