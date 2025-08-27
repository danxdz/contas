import React, { useState } from 'react';

const StepProcessor = ({ stepFile, onGenerateCode }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [toolAssignments, setToolAssignments] = useState({});
  const [parameters, setParameters] = useState({
    feedRate: 500,
    spindleSpeed: 3000,
    depthOfCut: 2,
    stepOver: 50,
    clearanceHeight: 5,
    rapidHeight: 25
  });

  const generateCode = () => {
    let gcode = `; Generated from STEP file: ${stepFile.fileName}\n`;
    gcode += `; Features: ${selectedFeatures.length} selected\n`;
    gcode += `G21 G90 G94 ; Metric, Absolute, Feed/min\n`;
    gcode += `G17 G49 G40 ; XY plane, Cancel tool length, Cancel cutter comp\n`;
    gcode += `G54 ; Work offset\n\n`;

    selectedFeatures.forEach((featureIdx) => {
      const feature = stepFile.features[featureIdx];
      const tool = stepFile.suggestedTools[toolAssignments[featureIdx] || 0];
      
      gcode += `; Feature: ${feature.type}\n`;
      gcode += `T${(toolAssignments[featureIdx] || 0) + 1} M06 ; Tool change\n`;
      gcode += `S${parameters.spindleSpeed} M03 ; Spindle on\n`;
      gcode += `G00 Z${parameters.rapidHeight} ; Rapid to safe height\n`;
      
      if (feature.type === 'pocket') {
        gcode += generatePocketCode(feature, tool, parameters);
      } else if (feature.type === 'hole') {
        gcode += generateHoleCode(feature, tool, parameters);
      } else if (feature.type === 'slot') {
        gcode += generateSlotCode(feature, tool, parameters);
      }
      
      gcode += `G00 Z${parameters.rapidHeight} ; Retract\n`;
      gcode += `M05 ; Spindle off\n\n`;
    });
    
    gcode += `M30 ; Program end\n`;
    
    onGenerateCode(gcode);
  };

  const generatePocketCode = (feature, tool, params) => {
    let code = '';
    const passes = Math.ceil(feature.depth / params.depthOfCut);
    
    for (let i = 1; i <= passes; i++) {
      const depth = Math.min(i * params.depthOfCut, feature.depth);
      code += `; Pass ${i} of ${passes}, depth: ${depth}mm\n`;
      code += `G00 X${feature.width/2} Y${feature.length/2}\n`;
      code += `G01 Z${-depth} F${params.feedRate/2}\n`;
      code += `G01 X${-feature.width/2} F${params.feedRate}\n`;
      code += `G01 Y${-feature.length/2}\n`;
      code += `G01 X${feature.width/2}\n`;
      code += `G01 Y${feature.length/2}\n`;
      code += `G00 Z${params.clearanceHeight}\n`;
    }
    
    return code;
  };

  const generateHoleCode = (feature, tool, params) => {
    let code = '';
    code += `G00 X0 Y0 ; Move to hole center\n`;
    code += `G81 Z${-feature.depth} R${params.clearanceHeight} F${params.feedRate/3} ; Drilling cycle\n`;
    code += `G80 ; Cancel cycle\n`;
    return code;
  };

  const generateSlotCode = (feature, tool, params) => {
    let code = '';
    code += `G00 X${-feature.length/2} Y0\n`;
    code += `G01 Z${-feature.depth} F${params.feedRate/2}\n`;
    code += `G01 X${feature.length/2} F${params.feedRate}\n`;
    code += `G00 Z${params.clearanceHeight}\n`;
    return code;
  };

  const toggleFeature = (idx) => {
    setSelectedFeatures(prev => 
      prev.includes(idx) 
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  if (!stepFile.loaded) {
    return (
      <div className="step-processor-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No STEP File Loaded</h2>
          <p>Use File → Import STEP to load a STEP file</p>
          <p style={{ marginTop: '20px', fontSize: '11px', color: '#999' }}>
            Supported formats: .step, .stp, .iges, .igs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-processor-view">
      <div className="step-sidebar">
        <h2 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
          STEP: {stepFile.fileName}
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Detected Features</h3>
          {stepFile.features.map((feature, idx) => (
            <div 
              key={idx}
              style={{
                padding: '8px',
                marginBottom: '8px',
                background: selectedFeatures.includes(idx) ? '#e3f2fd' : '#f5f5f5',
                border: selectedFeatures.includes(idx) ? '2px solid #2196f3' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => toggleFeature(idx)}
            >
              <input 
                type="checkbox" 
                checked={selectedFeatures.includes(idx)}
                onChange={() => {}}
                style={{ marginRight: '8px' }}
              />
              <strong>{feature.type.toUpperCase()}</strong>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {Object.entries(feature).filter(([k]) => k !== 'type').map(([k, v]) => 
                  `${k}: ${v}`
                ).join(', ')}
              </div>
              
              {selectedFeatures.includes(idx) && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '11px' }}>
                    Assign Tool:
                    <select 
                      value={toolAssignments[idx] || 0}
                      onChange={(e) => setToolAssignments(prev => ({
                        ...prev,
                        [idx]: parseInt(e.target.value)
                      }))}
                      style={{ marginLeft: '8px', fontSize: '11px' }}
                    >
                      {stepFile.suggestedTools.map((tool, toolIdx) => (
                        <option key={toolIdx} value={toolIdx}>
                          T{toolIdx + 1}: {tool.type} ⌀{tool.diameter}mm
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Parameters</h3>
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}:
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    [key]: parseFloat(e.target.value)
                  }))}
                  style={{ width: '80px', fontSize: '11px' }}
                />
              </label>
            </div>
          ))}
        </div>
        
        <button 
          onClick={generateCode}
          disabled={selectedFeatures.length === 0}
          style={{
            width: '100%',
            padding: '10px',
            background: selectedFeatures.length > 0 ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: selectedFeatures.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Generate G-Code ({selectedFeatures.length} features)
        </button>
      </div>
      
      <div className="step-viewer">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3>3D Preview</h3>
            <p>STEP file visualization will appear here</p>
            <p style={{ marginTop: '10px', fontSize: '11px' }}>
              Feature detection and toolpath generation based on geometry
            </p>
          </div>
        </div>
        
        <div className="step-controls">
          <button>Wireframe</button>
          <button>Shaded</button>
          <button>Features</button>
          <button>Toolpaths</button>
        </div>
      </div>
    </div>
  );
};

export default StepProcessor;