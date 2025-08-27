import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// StepViewer3D Component
const StepViewer3D = ({ stepFile, selectedFeatures, viewMode, onViewModeChange }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const stockRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [stockSetup, setStockSetup] = useState({
    visible: false,
    material: 'Aluminum 6061',
    dimensions: { x: 150, y: 100, z: 50 },
    origin: { x: 0, y: 0, z: 0 },
    color: '#888888'
  });
  
  const [fixtureSetup, setFixtureSetup] = useState({
    visible: false,
    type: 'Vise',
    jawWidth: 150,
    clampForce: 500
  });
  
  const [toolSetup, setToolSetup] = useState({
    visible: false,
    type: 'End Mill',
    diameter: 10,
    flutes: 4,
    length: 75
  });
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2e3a);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(200, -200, 200);
    camera.up.set(0, 0, 1);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 200);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid
    const gridHelper = new THREE.GridHelper(300, 30, 0x444444, 0x222222);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);
    
    // Axes
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    
    // Create stock/workpiece
    const createStock = () => {
      const stockGroup = new THREE.Group();
      
      // Main stock block
      const stockGeometry = new THREE.BoxGeometry(
        stockSetup.dimensions.x,
        stockSetup.dimensions.y,
        stockSetup.dimensions.z
      );
      const stockMaterial = new THREE.MeshPhongMaterial({ 
        color: stockSetup.color,
        transparent: true,
        opacity: viewMode === 'wireframe' ? 0.3 : 0.9
      });
      const stock = new THREE.Mesh(stockGeometry, stockMaterial);
      stock.position.set(
        stockSetup.origin.x,
        stockSetup.origin.y,
        stockSetup.origin.z + stockSetup.dimensions.z / 2
      );
      stock.castShadow = true;
      stock.receiveShadow = true;
      stock.userData = { type: 'stock', clickable: true };
      stockGroup.add(stock);
      
      // Add edges for wireframe mode
      if (viewMode === 'wireframe' || viewMode === 'features') {
        const edges = new THREE.EdgesGeometry(stockGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        edgeLines.position.copy(stock.position);
        stockGroup.add(edgeLines);
      }
      
      // Add detected features if in features mode
      if (viewMode === 'features' && stepFile.loaded && stepFile.features) {
        stepFile.features.forEach((feature, idx) => {
          const isSelected = selectedFeatures.includes(idx);
          
          if (feature.type === 'hole') {
            const holeGeometry = new THREE.CylinderGeometry(
              feature.diameter / 2,
              feature.diameter / 2,
              feature.depth || 20,
              32
            );
            const holeMaterial = new THREE.MeshPhongMaterial({ 
              color: isSelected ? 0x00ff00 : 0xff0000,
              transparent: true,
              opacity: 0.7
            });
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.set(0, 0, stockSetup.dimensions.z / 2);
            hole.rotation.x = Math.PI / 2;
            stockGroup.add(hole);
          } else if (feature.type === 'pocket') {
            const pocketGeometry = new THREE.BoxGeometry(
              feature.width || 60,
              feature.length || 80,
              feature.depth || 10
            );
            const pocketMaterial = new THREE.MeshPhongMaterial({ 
              color: isSelected ? 0x00ff00 : 0x0088ff,
              transparent: true,
              opacity: 0.7
            });
            const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
            pocket.position.set(0, 0, stockSetup.dimensions.z - feature.depth / 2);
            stockGroup.add(pocket);
          }
        });
      }
      
      return stockGroup;
    };
    
    // Add stock to scene
    const stockGroup = createStock();
    scene.add(stockGroup);
    stockRef.current = stockGroup;
    
    // Mouse click handler
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData.type === 'stock') {
          setStockSetup(prev => ({ ...prev, visible: true }));
        }
      }
    };
    
    renderer.domElement.addEventListener('click', handleClick);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stepFile, selectedFeatures, viewMode, stockSetup.dimensions]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* View Mode Controls */}
      <div className="step-controls" style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '5px',
        background: 'rgba(42, 46, 58, 0.9)',
        padding: '5px',
        borderRadius: '6px'
      }}>
        <button 
          onClick={() => onViewModeChange('wireframe')}
          className={viewMode === 'wireframe' ? 'active' : ''}
          style={{
            padding: '5px 10px',
            background: viewMode === 'wireframe' ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Wireframe
        </button>
        <button 
          onClick={() => onViewModeChange('shaded')}
          className={viewMode === 'shaded' ? 'active' : ''}
          style={{
            padding: '5px 10px',
            background: viewMode === 'shaded' ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Shaded
        </button>
        <button 
          onClick={() => onViewModeChange('features')}
          className={viewMode === 'features' ? 'active' : ''}
          style={{
            padding: '5px 10px',
            background: viewMode === 'features' ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Features
        </button>
        <button 
          onClick={() => onViewModeChange('toolpaths')}
          className={viewMode === 'toolpaths' ? 'active' : ''}
          style={{
            padding: '5px 10px',
            background: viewMode === 'toolpaths' ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Toolpaths
        </button>
      </div>
      
      {/* Stock Setup Window */}
      {stockSetup.visible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '300px',
          background: 'linear-gradient(135deg, #2a2e3a 0%, #1a1e2a 100%)',
          border: '1px solid rgba(74, 158, 255, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: '#4a9eff', fontSize: '16px' }}>Stock Setup</h3>
            <button 
              onClick={() => setStockSetup(prev => ({ ...prev, visible: false }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
              Material
            </label>
            <select 
              value={stockSetup.material}
              onChange={(e) => setStockSetup(prev => ({ ...prev, material: e.target.value }))}
              style={{
                width: '100%',
                padding: '5px',
                background: '#1a1e2a',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            >
              <option>Aluminum 6061</option>
              <option>Steel 1018</option>
              <option>Stainless 304</option>
              <option>Brass</option>
              <option>Plastic (Delrin)</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
              Dimensions (mm)
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="number"
                value={stockSetup.dimensions.x}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, x: parseFloat(e.target.value) }
                }))}
                placeholder="X"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
              <input 
                type="number"
                value={stockSetup.dimensions.y}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, y: parseFloat(e.target.value) }
                }))}
                placeholder="Y"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
              <input 
                type="number"
                value={stockSetup.dimensions.z}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, z: parseFloat(e.target.value) }
                }))}
                placeholder="Z"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
              Origin Offset
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="number"
                value={stockSetup.origin.x}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  origin: { ...prev.origin, x: parseFloat(e.target.value) }
                }))}
                placeholder="X"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
              <input 
                type="number"
                value={stockSetup.origin.y}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  origin: { ...prev.origin, y: parseFloat(e.target.value) }
                }))}
                placeholder="Y"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
              <input 
                type="number"
                value={stockSetup.origin.z}
                onChange={(e) => setStockSetup(prev => ({ 
                  ...prev, 
                  origin: { ...prev.origin, z: parseFloat(e.target.value) }
                }))}
                placeholder="Z"
                style={{
                  flex: 1,
                  padding: '5px',
                  background: '#1a1e2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                // Apply changes
                setStockSetup(prev => ({ ...prev, visible: false }));
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: 'linear-gradient(135deg, #4a9eff 0%, #0066cc 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Apply
            </button>
            <button 
              onClick={() => {
                // Save setup
                localStorage.setItem('stockSetup', JSON.stringify(stockSetup));
                setStockSetup(prev => ({ ...prev, visible: false }));
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: 'linear-gradient(135deg, #00c853 0%, #00a040 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      {/* Instruction text */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: '#4a9eff',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '4px'
      }}>
        Click on stock to edit setup
      </div>
    </div>
  );
};

const StepProcessor = ({ stepFile, onGenerateCode }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [toolAssignments, setToolAssignments] = useState({});
  const [viewMode, setViewMode] = useState('shaded');
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
        <StepViewer3D 
          stepFile={stepFile}
          selectedFeatures={selectedFeatures}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    </div>
  );
};

export default StepProcessor;