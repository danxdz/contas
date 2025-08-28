import React, { useRef, useEffect } from 'react';

const GCodeSyntaxHighlighter = ({ 
  code, 
  onChange, 
  currentLine,
  onLineClick 
}) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // G-code syntax colors based on industry standards
  const syntaxColors = {
    gCode: '#00ff88',        // Green for G codes
    mCode: '#ff00ff',        // Magenta for M codes
    coordinates: '#00b4ff',  // Blue for X, Y, Z
    feedRate: '#00ffff',     // Cyan for F
    spindleSpeed: '#ffff00', // Yellow for S
    toolNumber: '#ff8800',   // Orange for T
    lineNumber: '#ff88ff',   // Pink for N
    comment: '#666666',      // Gray for comments
    parameter: '#ffaa00',    // Amber for I, J, K, R
    offset: '#ff6666',       // Red for H, D
    value: '#ffffff',        // White for numbers
    default: '#e0e0e0'       // Default text color
  };

  // Parse and colorize a line of G-code
  const highlightLine = (line, isActive) => {
    if (!line) return { __html: '&nbsp;' };
    
    // If it's a comment
    if (line.trim().startsWith(';') || line.trim().startsWith('(')) {
      return { 
        __html: `<span style="color: ${syntaxColors.comment}">${escapeHtml(line)}</span>` 
      };
    }

    // Parse the line into tokens
    let highlighted = line;
    
    // Highlight patterns
    const patterns = [
      { regex: /\bG\d+(\.\d+)?/gi, color: syntaxColors.gCode },
      { regex: /\bM\d+/gi, color: syntaxColors.mCode },
      { regex: /\b[XYZ]-?\d*\.?\d+/gi, color: syntaxColors.coordinates },
      { regex: /\b[IJK]-?\d*\.?\d+/gi, color: syntaxColors.parameter },
      { regex: /\bF\d*\.?\d+/gi, color: syntaxColors.feedRate },
      { regex: /\bS\d+/gi, color: syntaxColors.spindleSpeed },
      { regex: /\bT\d+/gi, color: syntaxColors.toolNumber },
      { regex: /\bN\d+/gi, color: syntaxColors.lineNumber },
      { regex: /\b[HD]\d+/gi, color: syntaxColors.offset },
      { regex: /\bR-?\d*\.?\d+/gi, color: syntaxColors.parameter },
      { regex: /\bP\d*\.?\d+/gi, color: syntaxColors.parameter },
      { regex: /\bQ\d*\.?\d+/gi, color: syntaxColors.parameter },
      { regex: /\(.*?\)/g, color: syntaxColors.comment },
      { regex: /;.*/g, color: syntaxColors.comment }
    ];

    // Apply highlighting
    patterns.forEach(({ regex, color }) => {
      highlighted = highlighted.replace(regex, (match) => {
        return `<span style="color: ${color}">${match}</span>`;
      });
    });

    // If this is the active line, make it brighter
    if (isActive) {
      highlighted = `<span style="filter: brightness(1.5); font-weight: bold">${highlighted}</span>`;
    }

    return { __html: highlighted };
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  // Sync scroll between elements
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current && highlightRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = code.split('\n');

  return (
    <div style={{ 
      position: 'relative', 
      height: '100%',
      display: 'flex',
      background: '#0a0e1a',
      fontFamily: 'monospace',
      fontSize: '13px',
      lineHeight: '20px'
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
          color: '#444',
          userSelect: 'none'
        }}
      >
        {lines.map((_, index) => (
          <div
            key={index}
            onClick={() => onLineClick && onLineClick(index)}
            style={{
              cursor: 'pointer',
              textAlign: 'right',
              paddingRight: '8px',
              height: '20px',
              color: currentLine === index ? '#00ff88' : '#444',
              fontWeight: currentLine === index ? 'bold' : 'normal'
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code Container */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Syntax Highlighted Display */}
        <div
          ref={highlightRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '10px',
            overflow: 'auto',
            pointerEvents: 'none',
            whiteSpace: 'pre',
            wordWrap: 'break-word'
          }}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              style={{ height: '20px' }}
              dangerouslySetInnerHTML={highlightLine(line, currentLine === index)}
            />
          ))}
        </div>

        {/* Transparent Textarea for Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
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
            color: 'transparent',
            caretColor: '#00ff88',
            resize: 'none',
            whiteSpace: 'pre',
            wordWrap: 'break-word',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit'
          }}
          placeholder="Enter G-code here..."
        />
      </div>

      {/* Legend/Help */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        padding: '5px 10px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '4px',
        fontSize: '10px',
        display: 'flex',
        gap: '10px',
        opacity: 0.6
      }}>
        <span style={{ color: syntaxColors.gCode }}>G</span>
        <span style={{ color: syntaxColors.mCode }}>M</span>
        <span style={{ color: syntaxColors.coordinates }}>XYZ</span>
        <span style={{ color: syntaxColors.feedRate }}>F</span>
        <span style={{ color: syntaxColors.spindleSpeed }}>S</span>
        <span style={{ color: syntaxColors.toolNumber }}>T</span>
      </div>
    </div>
  );
};

export default GCodeSyntaxHighlighter;