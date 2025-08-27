import React, { useState, useEffect, useRef } from 'react';

const DualChannelDebugger = ({ program, setProgram, simulation }) => {
  const [stack1, setStack1] = useState([]);
  const [stack2, setStack2] = useState([]);
  const [variables, setVariables] = useState({});
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (simulation.isPlaying && !simulation.isPaused) {
      startExecution();
    } else {
      stopExecution();
    }
  }, [simulation.isPlaying, simulation.isPaused]);

  const startExecution = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      stepExecution();
    }, 100 / simulation.speed);
  };

  const stopExecution = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stepExecution = () => {
    // Step through both channels
    setProgram(prev => {
      const lines1 = prev.channel1.split('\n');
      const lines2 = prev.channel2.split('\n');
      
      let newLine1 = prev.currentLine.ch1;
      let newLine2 = prev.currentLine.ch2;
      
      // Process channel 1
      if (newLine1 < lines1.length - 1) {
        const line = lines1[newLine1];
        if (line.includes('WAIT')) {
          // Wait for synchronization
        } else {
          newLine1++;
        }
      }
      
      // Process channel 2
      if (newLine2 < lines2.length - 1) {
        const line = lines2[newLine2];
        if (line.includes('WAIT')) {
          // Wait for synchronization
        } else {
          newLine2++;
        }
      }
      
      // Check if both channels are done
      if (newLine1 >= lines1.length - 1 && newLine2 >= lines2.length - 1) {
        stopExecution();
      }
      
      return {
        ...prev,
        currentLine: { ch1: newLine1, ch2: newLine2 }
      };
    });
  };

  const reset = () => {
    setProgram(prev => ({
      ...prev,
      currentLine: { ch1: 0, ch2: 0 }
    }));
    setStack1([]);
    setStack2([]);
    setVariables({});
  };

  const renderChannel = (channelNum, code, currentLine, stack) => {
    const lines = code.split('\n');
    
    return (
      <div className="channel-panel">
        <div className="channel-header">
          Channel {channelNum} {channelNum === 1 ? '- Main Spindle' : '- Sub Spindle'}
        </div>
        <div className="channel-content">
          {lines.map((line, idx) => (
            <div 
              key={idx}
              style={{
                backgroundColor: idx === currentLine ? '#3e3e42' : 'transparent',
                color: idx === currentLine ? '#ffffff' : '#d4d4d4',
                padding: '2px 4px'
              }}
            >
              <span style={{ color: '#606060', marginRight: '10px', display: 'inline-block', width: '30px', textAlign: 'right' }}>
                {idx + 1}
              </span>
              {line}
            </div>
          ))}
        </div>
        <div className="channel-stack">
          Stack: {stack.length > 0 ? stack.join(' → ') : '[]'}
        </div>
      </div>
    );
  };

  return (
    <div className="dual-channel-view">
      {renderChannel(1, program.channel1, program.currentLine.ch1, stack1)}
      
      <div style={{ width: '300px', background: '#252526', borderLeft: '1px solid #3e3e42', borderRight: '1px solid #3e3e42' }}>
        <div className="channel-header">Variables & Sync</div>
        <div style={{ padding: '10px', color: '#d4d4d4', fontSize: '11px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Variables:</strong>
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} style={{ marginLeft: '10px', marginTop: '4px' }}>
                {key} = {value}
              </div>
            ))}
            {Object.keys(variables).length === 0 && (
              <div style={{ marginLeft: '10px', color: '#606060' }}>No variables set</div>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Synchronization:</strong>
            <div style={{ marginLeft: '10px', marginTop: '4px', color: '#606060' }}>
              No sync points active
            </div>
          </div>
          
          <div>
            <strong>Status:</strong>
            <div style={{ marginLeft: '10px', marginTop: '4px' }}>
              {running ? '🟢 Running' : '🔴 Stopped'}
            </div>
            <div style={{ marginLeft: '10px', marginTop: '4px' }}>
              Speed: {simulation.speed}x
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={stepExecution}
              style={{
                width: '100%',
                padding: '6px',
                background: '#0e639c',
                border: 'none',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              Step Forward
            </button>
            <button 
              onClick={reset}
              style={{
                width: '100%',
                padding: '6px',
                background: '#6c6c6c',
                border: 'none',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {renderChannel(2, program.channel2, program.currentLine.ch2, stack2)}
    </div>
  );
};

export default DualChannelDebugger;