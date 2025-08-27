import React, { useState, useRef, useEffect } from 'react';
import './FloatingWindow.css';

const FloatingWindow = ({ 
  id, 
  title, 
  children, 
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 350, height: 250 },
  onClose,
  icon = '📊',
  resizable = true,
  minimizable = true
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('floating-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (isResizing) {
      const newWidth = e.clientX - position.x;
      const newHeight = e.clientY - position.y;
      setSize({
        width: Math.max(200, newWidth),
        height: Math.max(150, newHeight)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart]);

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition(initialPosition);
      setSize(initialSize);
    } else {
      setPosition({ x: 0, y: 60 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - 60 
      });
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      ref={windowRef}
      className={`floating-window ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? 'auto' : `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="floating-header">
        <div className="floating-title">
          <span className="floating-icon">{icon}</span>
          {title}
        </div>
        <div className="floating-controls">
          {minimizable && (
            <button 
              className="floating-btn minimize"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              {isMinimized ? '▢' : '−'}
            </button>
          )}
          <button 
            className="floating-btn maximize"
            onClick={toggleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            □
          </button>
          <button 
            className="floating-btn close"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="floating-content">
            {children}
          </div>
          
          {resizable && !isMaximized && (
            <div 
              className="resize-handle"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

// Quick Info Display Component
export const QuickInfo = ({ data }) => {
  return (
    <div className="quick-info">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="info-row">
          <span className="info-label">{key}:</span>
          <span className="info-value">{value}</span>
        </div>
      ))}
    </div>
  );
};

// Tool Info Display
export const ToolInfoWindow = ({ tool }) => {
  if (!tool) return <div>No tool selected</div>;
  
  return (
    <div className="tool-info-window">
      <h3>{tool.tNumber} - {tool.name}</h3>
      
      <div className="tool-details">
        <div className="detail-group">
          <h4>Specifications</h4>
          <div className="detail-item">
            <span>Type:</span>
            <span>{tool.type}</span>
          </div>
          <div className="detail-item">
            <span>Diameter:</span>
            <span>{tool.diameter}mm</span>
          </div>
          <div className="detail-item">
            <span>Flutes:</span>
            <span>{tool.flutes}</span>
          </div>
          <div className="detail-item">
            <span>Material:</span>
            <span>{tool.material}</span>
          </div>
          <div className="detail-item">
            <span>Coating:</span>
            <span>{tool.coating}</span>
          </div>
        </div>
        
        <div className="detail-group">
          <h4>Cutting Parameters</h4>
          {tool.rpm && (
            <>
              <h5>RPM</h5>
              {Object.entries(tool.rpm).map(([material, value]) => (
                value > 0 && (
                  <div key={material} className="param-item">
                    <span>{material}:</span>
                    <span>{value} RPM</span>
                  </div>
                )
              ))}
            </>
          )}
          {tool.feed && (
            <>
              <h5>Feed Rate</h5>
              {Object.entries(tool.feed).map(([material, value]) => (
                value > 0 && (
                  <div key={material} className="param-item">
                    <span>{material}:</span>
                    <span>{value} mm/tooth</span>
                  </div>
                )
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Calculation Results Window
export const ResultsWindow = ({ title, results }) => {
  return (
    <div className="results-window">
      <h3>{title}</h3>
      <div className="results-grid">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <div className="result-label">{result.label}</div>
            <div className="result-value">
              {result.value}
              {result.unit && <span className="result-unit">{result.unit}</span>}
            </div>
            {result.status && (
              <div className={`result-status ${result.status}`}>
                {result.status === 'good' ? '✓' : result.status === 'warning' ? '⚠' : '✗'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Live Monitoring Window
export const MonitoringWindow = ({ data, title = "Live Monitoring" }) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    if (data) {
      setHistory(prev => [...prev.slice(-19), data]);
    }
  }, [data]);
  
  return (
    <div className="monitoring-window">
      <div className="monitoring-current">
        <h4>Current Values</h4>
        {data && Object.entries(data).map(([key, value]) => (
          <div key={key} className="monitor-item">
            <span className="monitor-label">{key}:</span>
            <span className="monitor-value">{value}</span>
          </div>
        ))}
      </div>
      
      <div className="monitoring-graph">
        <h4>History</h4>
        <div className="graph-container">
          {history.map((item, index) => (
            <div 
              key={index} 
              className="graph-bar"
              style={{ 
                height: `${(item.value || 0) * 2}px`,
                opacity: 0.3 + (index / history.length) * 0.7
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingWindow;