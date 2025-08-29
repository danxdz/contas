import React, { useEffect, useRef, useState } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    renderCount: 0
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderCount = useRef(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    let animationId;
    
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime.current;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        frameCount.current = 0;
        lastTime.current = currentTime;
        
        // Get memory usage if available
        let memoryUsage = 0;
        if (performance.memory) {
          memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
        }
        
        setMetrics(prev => ({
          fps,
          renderTime: Math.round(delta / 60), // Average render time
          memoryUsage,
          renderCount: renderCount.current
        }));
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);
  
  useEffect(() => {
    renderCount.current++;
  });
  
  if (!enabled) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #00d4ff',
      borderRadius: '5px',
      padding: '10px',
      color: '#fff',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '150px'
    }}>
      <div style={{ marginBottom: '5px', color: '#00d4ff', fontWeight: 'bold' }}>
        Performance
      </div>
      <div style={{ display: 'grid', gap: '3px' }}>
        <div>
          FPS: <span style={{ 
            color: metrics.fps >= 50 ? '#4caf50' : metrics.fps >= 30 ? '#ff9800' : '#f44336' 
          }}>{metrics.fps}</span>
        </div>
        <div>
          Render: {metrics.renderTime}ms
        </div>
        {metrics.memoryUsage > 0 && (
          <div>
            Memory: <span style={{
              color: metrics.memoryUsage < 100 ? '#4caf50' : metrics.memoryUsage < 200 ? '#ff9800' : '#f44336'
            }}>{metrics.memoryUsage}MB</span>
          </div>
        )}
        <div>
          Renders: {metrics.renderCount}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;