import React, { useState, useRef, useEffect } from 'react';

function GCodeVisualizer() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gcode, setGcode] = useState(`; Sample G-Code
G21 ; Metric
G90 ; Absolute positioning
G00 Z5 ; Safe height
G00 X0 Y0 ; Home
G01 Z-1 F100 ; Plunge
G01 X50 Y0 F500 ; Cut
G02 X100 Y50 I50 J0 ; Arc CW
G01 X100 Y100 ; Cut
G01 X0 Y100 ; Cut
G01 X0 Y0 ; Return
G00 Z5 ; Retract
M30 ; End`);
  
  const [parsedData, setParsedData] = useState(null);
  const [viewSettings, setViewSettings] = useState({
    zoom: 2,
    offsetX: 50,
    offsetY: 50,
    showGrid: true,
    showCoords: true,
    showRapids: true,
    colorBySpeed: false
  });
  
  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentLine: 0,
    speed: 1,
    showToolpath: true,
    showTool: true,
    toolDiameter: 10
  });
  
  const [statistics, setStatistics] = useState(null);
  const [errors, setErrors] = useState([]);

  // Parse G-Code
  const parseGCode = () => {
    const lines = gcode.split('\n');
    const commands = [];
    const errors = [];
    
    let currentPos = { x: 0, y: 0, z: 0 };
    let feedRate = 100;
    let rapidMode = true;
    let absoluteMode = true;
    let units = 'mm';
    let bounds = {
      minX: 0, maxX: 0,
      minY: 0, maxY: 0,
      minZ: 0, maxZ: 0
    };
    
    lines.forEach((line, index) => {
      // Remove comments and trim
      const cleanLine = line.split(';')[0].trim();
      if (!cleanLine) return;
      
      // Parse command
      const parts = cleanLine.split(/\s+/);
      const command = parts[0].toUpperCase();
      
      const params = {};
      parts.slice(1).forEach(part => {
        const letter = part[0].toUpperCase();
        const value = parseFloat(part.slice(1));
        if (!isNaN(value)) {
          params[letter] = value;
        }
      });
      
      // Create command object
      const cmd = {
        line: index + 1,
        original: line,
        command,
        params,
        startPos: { ...currentPos },
        endPos: { ...currentPos },
        type: 'move',
        feedRate,
        rapidMode
      };
      
      // Process different G-codes
      switch (command) {
        case 'G00': // Rapid positioning
          rapidMode = true;
          cmd.type = 'rapid';
          break;
          
        case 'G01': // Linear interpolation
          rapidMode = false;
          cmd.type = 'cut';
          break;
          
        case 'G02': // Circular interpolation CW
          rapidMode = false;
          cmd.type = 'arc_cw';
          break;
          
        case 'G03': // Circular interpolation CCW
          rapidMode = false;
          cmd.type = 'arc_ccw';
          break;
          
        case 'G20': // Imperial
          units = 'inch';
          break;
          
        case 'G21': // Metric
          units = 'mm';
          break;
          
        case 'G90': // Absolute
          absoluteMode = true;
          break;
          
        case 'G91': // Incremental
          absoluteMode = false;
          break;
          
        case 'G81': // Drilling cycle
          cmd.type = 'drill';
          break;
          
        default:
          if (command.startsWith('M')) {
            cmd.type = 'machine';
          }
      }
      
      // Update feedrate
      if (params.F !== undefined) {
        feedRate = params.F;
        cmd.feedRate = feedRate;
      }
      
      // Calculate new position
      if (params.X !== undefined) {
        cmd.endPos.x = absoluteMode ? params.X : currentPos.x + params.X;
      }
      if (params.Y !== undefined) {
        cmd.endPos.y = absoluteMode ? params.Y : currentPos.y + params.Y;
      }
      if (params.Z !== undefined) {
        cmd.endPos.z = absoluteMode ? params.Z : currentPos.z + params.Z;
      }
      
      // Handle arcs
      if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        if (params.I !== undefined) cmd.centerOffset = { i: params.I, j: params.J || 0 };
        if (params.R !== undefined) cmd.radius = params.R;
      }
      
      // Update bounds
      bounds.minX = Math.min(bounds.minX, cmd.endPos.x);
      bounds.maxX = Math.max(bounds.maxX, cmd.endPos.x);
      bounds.minY = Math.min(bounds.minY, cmd.endPos.y);
      bounds.maxY = Math.max(bounds.maxY, cmd.endPos.y);
      bounds.minZ = Math.min(bounds.minZ, cmd.endPos.z);
      bounds.maxZ = Math.max(bounds.maxZ, cmd.endPos.z);
      
      // Update current position
      currentPos = { ...cmd.endPos };
      
      // Add to commands if it's a movement
      if (cmd.type !== 'machine' && (params.X !== undefined || params.Y !== undefined || params.Z !== undefined)) {
        commands.push(cmd);
      }
    });
    
    // Calculate statistics
    const stats = calculateStatistics(commands, bounds);
    
    setParsedData({ commands, bounds, units });
    setStatistics(stats);
    setErrors(errors);
  };
  
  // Calculate statistics
  const calculateStatistics = (commands, bounds) => {
    let totalDistance = 0;
    let cuttingDistance = 0;
    let rapidDistance = 0;
    let cuttingTime = 0;
    let rapidTime = 0;
    
    commands.forEach(cmd => {
      const dx = cmd.endPos.x - cmd.startPos.x;
      const dy = cmd.endPos.y - cmd.startPos.y;
      const dz = cmd.endPos.z - cmd.startPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      totalDistance += distance;
      
      if (cmd.type === 'rapid') {
        rapidDistance += distance;
        rapidTime += distance / 5000 * 60; // Assume 5000 mm/min rapid
      } else if (cmd.type === 'cut' || cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        cuttingDistance += distance;
        cuttingTime += distance / cmd.feedRate * 60; // Convert to seconds
      }
    });
    
    return {
      totalDistance: totalDistance.toFixed(2),
      cuttingDistance: cuttingDistance.toFixed(2),
      rapidDistance: rapidDistance.toFixed(2),
      totalTime: ((cuttingTime + rapidTime) / 60).toFixed(2), // Minutes
      cuttingTime: (cuttingTime / 60).toFixed(2),
      rapidTime: (rapidTime / 60).toFixed(2),
      boundingBox: {
        width: (bounds.maxX - bounds.minX).toFixed(2),
        height: (bounds.maxY - bounds.minY).toFixed(2),
        depth: (bounds.maxZ - bounds.minZ).toFixed(2)
      },
      commandCount: commands.length
    };
  };
  
  // Draw on canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !parsedData) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set transform for zoom and pan
    ctx.save();
    ctx.translate(viewSettings.offsetX, viewSettings.offsetY);
    ctx.scale(viewSettings.zoom, -viewSettings.zoom); // Flip Y axis for CNC coordinates
    
    // Draw grid
    if (viewSettings.showGrid) {
      drawGrid(ctx, parsedData.bounds);
    }
    
    // Draw toolpath
    drawToolpath(ctx, parsedData.commands);
    
    // Draw tool position
    if (playback.showTool && playback.currentLine > 0) {
      drawTool(ctx, parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)]);
    }
    
    ctx.restore();
    
    // Draw coordinates
    if (viewSettings.showCoords) {
      drawCoordinates(ctx, parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)] || { endPos: { x: 0, y: 0, z: 0 } });
    }
  };
  
  const drawGrid = (ctx, bounds) => {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5 / viewSettings.zoom;
    
    const gridSize = 10; // 10mm grid
    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const endX = Math.ceil(bounds.maxX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    const endY = Math.ceil(bounds.maxY / gridSize) * gridSize;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    // Origin
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1 / viewSettings.zoom;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(0, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(endX, 0);
    ctx.stroke();
  };
  
  const drawToolpath = (ctx, commands) => {
    const linesToDraw = playback.showToolpath ? commands.length : playback.currentLine;
    
    for (let i = 0; i < Math.min(linesToDraw, commands.length); i++) {
      const cmd = commands[i];
      
      // Set color based on type
      if (cmd.type === 'rapid') {
        ctx.strokeStyle = viewSettings.showRapids ? 'rgba(255, 165, 0, 0.5)' : 'transparent';
        ctx.setLineDash([2, 2]);
      } else if (cmd.type === 'cut') {
        ctx.strokeStyle = viewSettings.colorBySpeed 
          ? `hsl(${120 - (cmd.feedRate / 1000) * 120}, 100%, 50%)`
          : 'rgba(0, 100, 255, 0.8)';
        ctx.setLineDash([]);
      } else if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        ctx.strokeStyle = 'rgba(0, 200, 100, 0.8)';
        ctx.setLineDash([]);
      }
      
      ctx.lineWidth = cmd.type === 'rapid' ? 0.5 / viewSettings.zoom : 1 / viewSettings.zoom;
      
      if (cmd.type === 'arc_cw' || cmd.type === 'arc_ccw') {
        // Draw arc
        if (cmd.centerOffset) {
          const centerX = cmd.startPos.x + cmd.centerOffset.i;
          const centerY = cmd.startPos.y + cmd.centerOffset.j;
          const radius = Math.sqrt(cmd.centerOffset.i * cmd.centerOffset.i + cmd.centerOffset.j * cmd.centerOffset.j);
          
          const startAngle = Math.atan2(cmd.startPos.y - centerY, cmd.startPos.x - centerX);
          const endAngle = Math.atan2(cmd.endPos.y - centerY, cmd.endPos.x - centerX);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle, cmd.type === 'arc_cw');
          ctx.stroke();
        }
      } else {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(cmd.startPos.x, cmd.startPos.y);
        ctx.lineTo(cmd.endPos.x, cmd.endPos.y);
        ctx.stroke();
      }
      
      // Highlight current line
      if (i === playback.currentLine - 1) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2 / viewSettings.zoom;
        ctx.beginPath();
        ctx.moveTo(cmd.startPos.x, cmd.startPos.y);
        ctx.lineTo(cmd.endPos.x, cmd.endPos.y);
        ctx.stroke();
      }
    }
  };
  
  const drawTool = (ctx, cmd) => {
    if (!cmd) return;
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.lineWidth = 1 / viewSettings.zoom;
    
    const toolRadius = playback.toolDiameter / 2;
    
    ctx.beginPath();
    ctx.arc(cmd.endPos.x, cmd.endPos.y, toolRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw crosshair
    ctx.beginPath();
    ctx.moveTo(cmd.endPos.x - toolRadius, cmd.endPos.y);
    ctx.lineTo(cmd.endPos.x + toolRadius, cmd.endPos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cmd.endPos.x, cmd.endPos.y - toolRadius);
    ctx.lineTo(cmd.endPos.x, cmd.endPos.y + toolRadius);
    ctx.stroke();
  };
  
  const drawCoordinates = (ctx, cmd) => {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`X: ${cmd.endPos.x.toFixed(2)}`, 10, 20);
    ctx.fillText(`Y: ${cmd.endPos.y.toFixed(2)}`, 10, 40);
    ctx.fillText(`Z: ${cmd.endPos.z.toFixed(2)}`, 10, 60);
    
    if (playback.currentLine > 0 && parsedData) {
      const currentCmd = parsedData.commands[Math.min(playback.currentLine - 1, parsedData.commands.length - 1)];
      ctx.fillText(`F: ${currentCmd.feedRate} mm/min`, 10, 80);
      ctx.fillText(`Line: ${playback.currentLine}/${parsedData.commands.length}`, 10, 100);
    }
  };
  
  // Animation loop
  const animate = () => {
    if (playback.isPlaying && parsedData) {
      setPlayback(prev => ({
        ...prev,
        currentLine: Math.min(prev.currentLine + prev.speed, parsedData.commands.length)
      }));
      
      if (playback.currentLine >= parsedData.commands.length) {
        setPlayback(prev => ({ ...prev, isPlaying: false }));
      }
    }
    
    draw();
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Handle canvas mouse events
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    let lastX = startX;
    let lastY = startY;
    
    const handleMouseMove = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setViewSettings(prev => ({
        ...prev,
        offsetX: prev.offsetX + (currentX - lastX),
        offsetY: prev.offsetY + (currentY - lastY)
      }));
      
      lastX = currentX;
      lastY = currentY;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewSettings(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(10, prev.zoom * delta))
    }));
  };
  
  // Effects
  useEffect(() => {
    parseGCode();
  }, [gcode]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size
      const updateCanvasSize = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 400;
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      
      // Start animation loop
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [parsedData, viewSettings, playback]);

  return (
    <div className="calculator-section">
      <h2>G-Code Simulator & Visualizer</h2>
      
      <div className="form-row">
        <div style={{ flex: 1 }}>
          <label>G-Code Input</label>
          <textarea
            value={gcode}
            onChange={(e) => setGcode(e.target.value)}
            style={{ 
              width: '100%', 
              height: '200px', 
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
            placeholder="Paste your G-code here..."
          />
          
          <div className="form-row" style={{ marginTop: '10px' }}>
            <button className="btn" onClick={parseGCode}>
              Parse & Visualize
            </button>
            
            <input
              type="file"
              accept=".nc,.gcode,.txt"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setGcode(e.target.result);
                  reader.readAsText(file);
                }
              }}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="btn">
              Load File
            </label>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a1a'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleCanvasWheel}
          style={{ 
            display: 'block',
            cursor: 'move',
            width: '100%',
            height: '400px'
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '12px'
        }}>
          <div>Zoom: {(viewSettings.zoom * 100).toFixed(0)}%</div>
          <div>Click & drag to pan</div>
          <div>Scroll to zoom</div>
        </div>
      </div>
      
      <div className="form-row" style={{ marginTop: '10px' }}>
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        >
          {playback.isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ ...prev, currentLine: 0 }))}
        >
          ⏮ Reset
        </button>
        
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ 
            ...prev, 
            currentLine: Math.max(0, prev.currentLine - 1)
          }))}
        >
          ⏪ Step Back
        </button>
        
        <button 
          className="btn"
          onClick={() => setPlayback(prev => ({ 
            ...prev, 
            currentLine: Math.min(parsedData?.commands.length || 0, prev.currentLine + 1)
          }))}
        >
          ⏩ Step Forward
        </button>
        
        <div className="form-group">
          <label>Speed</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={playback.speed}
            onChange={(e) => setPlayback(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
          />
          <span>{playback.speed}x</span>
        </div>
      </div>
      
      <div className="form-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showGrid}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
          />
          Show Grid
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showCoords}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showCoords: e.target.checked }))}
          />
          Show Coordinates
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.showRapids}
            onChange={(e) => setViewSettings(prev => ({ ...prev, showRapids: e.target.checked }))}
          />
          Show Rapids
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={viewSettings.colorBySpeed}
            onChange={(e) => setViewSettings(prev => ({ ...prev, colorBySpeed: e.target.checked }))}
          />
          Color by Speed
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={playback.showToolpath}
            onChange={(e) => setPlayback(prev => ({ ...prev, showToolpath: e.target.checked }))}
          />
          Show Full Path
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={playback.showTool}
            onChange={(e) => setPlayback(prev => ({ ...prev, showTool: e.target.checked }))}
          />
          Show Tool
        </label>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Tool Diameter (mm)</label>
          <input
            type="number"
            value={playback.toolDiameter}
            onChange={(e) => setPlayback(prev => ({ ...prev, toolDiameter: parseFloat(e.target.value) }))}
            step="0.1"
            min="0.1"
            max="50"
          />
        </div>
        
        <button 
          className="btn"
          onClick={() => {
            setViewSettings({
              zoom: 2,
              offsetX: 50,
              offsetY: 50,
              showGrid: true,
              showCoords: true,
              showRapids: true,
              colorBySpeed: false
            });
          }}
        >
          Reset View
        </button>
        
        <button 
          className="btn"
          onClick={() => {
            if (parsedData) {
              const bounds = parsedData.bounds;
              const width = canvasRef.current.width;
              const height = canvasRef.current.height;
              
              const scaleX = (width - 100) / (bounds.maxX - bounds.minX);
              const scaleY = (height - 100) / (bounds.maxY - bounds.minY);
              const scale = Math.min(scaleX, scaleY);
              
              setViewSettings(prev => ({
                ...prev,
                zoom: scale,
                offsetX: width / 2 - (bounds.maxX + bounds.minX) / 2 * scale,
                offsetY: height / 2 + (bounds.maxY + bounds.minY) / 2 * scale
              }));
            }
          }}
        >
          Fit to View
        </button>
      </div>
      
      {statistics && (
        <div className="result-box">
          <h3>Toolpath Statistics</h3>
          
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Total Distance:</span>
                <span className="result-value">{statistics.totalDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Cutting Distance:</span>
                <span className="result-value">{statistics.cuttingDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Rapid Distance:</span>
                <span className="result-value">{statistics.rapidDistance} mm</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Commands:</span>
                <span className="result-value">{statistics.commandCount}</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Total Time:</span>
                <span className="result-value">{statistics.totalTime} min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Cutting Time:</span>
                <span className="result-value">{statistics.cuttingTime} min</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Rapid Time:</span>
                <span className="result-value">{statistics.rapidTime} min</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="result-item">
                <span className="result-label">Bounding Box:</span>
                <span className="result-value">
                  {statistics.boundingBox.width} × {statistics.boundingBox.height} × {statistics.boundingBox.depth} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="result-box" style={{ borderColor: 'var(--danger)' }}>
          <h3>Errors & Warnings</h3>
          {errors.map((error, idx) => (
            <p key={idx} className="info-text" style={{ color: 'var(--danger)' }}>
              Line {error.line}: {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default GCodeVisualizer;