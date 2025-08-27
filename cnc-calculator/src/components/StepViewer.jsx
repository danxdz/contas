import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './StepViewer.css';

const StepViewer = ({ onFeatureSelect, onGenerateToolpath }) => {
  const [stepFile, setStepFile] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [viewMode, setViewMode] = useState('3d'); // 3d, features, analysis
  const [processing, setProcessing] = useState(false);
  const [featureStats, setFeatureStats] = useState({});
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const featureMeshesRef = useRef([]);
  
  // Initialize 3D viewer
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1e2a);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(150, 150, 150);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // Axes
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);
    
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Feature detection algorithms
  const detectFeatures = async (stepData) => {
    setProcessing(true);
    const detectedFeatures = [];
    
    // Simulate feature detection (in real implementation, this would parse STEP geometry)
    // For now, we'll create mock features based on common machining operations
    
    // Detect holes
    const holes = detectHoles(stepData);
    detectedFeatures.push(...holes);
    
    // Detect pockets
    const pockets = detectPockets(stepData);
    detectedFeatures.push(...pockets);
    
    // Detect profiles
    const profiles = detectProfiles(stepData);
    detectedFeatures.push(...profiles);
    
    // Detect slots
    const slots = detectSlots(stepData);
    detectedFeatures.push(...slots);
    
    // Detect threads
    const threads = detectThreads(stepData);
    detectedFeatures.push(...threads);
    
    setFeatures(detectedFeatures);
    visualizeFeatures(detectedFeatures);
    calculateFeatureStats(detectedFeatures);
    setProcessing(false);
  };
  
  // Hole detection
  const detectHoles = (stepData) => {
    const holes = [];
    // Mock hole detection - in reality, would analyze cylindrical surfaces
    const mockHoles = [
      { id: 'H1', type: 'hole', diameter: 10, depth: 25, position: { x: 30, y: 0, z: 15 }, axis: 'Z' },
      { id: 'H2', type: 'hole', diameter: 8, depth: 20, position: { x: -30, y: 0, z: 15 }, axis: 'Z' },
      { id: 'H3', type: 'hole', diameter: 12, depth: 30, position: { x: 0, y: 30, z: 15 }, axis: 'Z' },
      { id: 'H4', type: 'hole', diameter: 6, depth: 15, position: { x: 0, y: -30, z: 15 }, axis: 'Z' },
    ];
    
    mockHoles.forEach(hole => {
      holes.push({
        ...hole,
        toolSuggestion: suggestToolForHole(hole),
        operations: ['drill', 'ream'],
        material: 'aluminum',
        tolerance: 'H7'
      });
    });
    
    return holes;
  };
  
  // Pocket detection
  const detectPockets = (stepData) => {
    const pockets = [];
    // Mock pocket detection
    const mockPockets = [
      { 
        id: 'P1', 
        type: 'pocket', 
        width: 40, 
        length: 60, 
        depth: 10,
        cornerRadius: 5,
        position: { x: 0, y: 0, z: 30 },
        bottomType: 'flat'
      },
      { 
        id: 'P2', 
        type: 'pocket', 
        width: 25, 
        length: 25, 
        depth: 8,
        cornerRadius: 3,
        position: { x: 50, y: 50, z: 30 },
        bottomType: 'flat'
      }
    ];
    
    mockPockets.forEach(pocket => {
      pockets.push({
        ...pocket,
        toolSuggestion: suggestToolForPocket(pocket),
        operations: ['roughing', 'finishing'],
        stepover: 0.4,
        material: 'aluminum'
      });
    });
    
    return pockets;
  };
  
  // Profile detection
  const detectProfiles = (stepData) => {
    const profiles = [];
    // Mock profile detection
    const mockProfiles = [
      {
        id: 'PR1',
        type: 'profile',
        contourType: 'external',
        perimeter: 280,
        depth: 20,
        position: { x: 0, y: 0, z: 0 }
      }
    ];
    
    mockProfiles.forEach(profile => {
      profiles.push({
        ...profile,
        toolSuggestion: suggestToolForProfile(profile),
        operations: ['contouring'],
        compensationType: 'left',
        material: 'aluminum'
      });
    });
    
    return profiles;
  };
  
  // Slot detection
  const detectSlots = (stepData) => {
    const slots = [];
    // Mock slot detection
    const mockSlots = [
      {
        id: 'S1',
        type: 'slot',
        width: 10,
        length: 40,
        depth: 5,
        position: { x: -20, y: 20, z: 30 },
        orientation: 0
      }
    ];
    
    mockSlots.forEach(slot => {
      slots.push({
        ...slot,
        toolSuggestion: suggestToolForSlot(slot),
        operations: ['slotting'],
        material: 'aluminum'
      });
    });
    
    return slots;
  };
  
  // Thread detection
  const detectThreads = (stepData) => {
    const threads = [];
    // Mock thread detection
    const mockThreads = [
      {
        id: 'T1',
        type: 'thread',
        diameter: 8,
        pitch: 1.25,
        depth: 15,
        position: { x: 15, y: -15, z: 15 },
        threadType: 'M8x1.25'
      }
    ];
    
    mockThreads.forEach(thread => {
      threads.push({
        ...thread,
        toolSuggestion: suggestToolForThread(thread),
        operations: ['tapping'],
        material: 'aluminum'
      });
    });
    
    return threads;
  };
  
  // Tool suggestion algorithms
  const suggestToolForHole = (hole) => {
    const tools = [];
    
    // Center drill for spotting
    if (hole.depth > hole.diameter) {
      tools.push({
        type: 'center_drill',
        diameter: hole.diameter * 0.3,
        operation: 'spot'
      });
    }
    
    // Main drill
    tools.push({
      type: 'drill',
      diameter: hole.diameter - 0.2, // Leave material for reaming
      flutes: hole.diameter < 10 ? 2 : 3,
      operation: 'drill'
    });
    
    // Reamer for precision
    if (hole.tolerance === 'H7') {
      tools.push({
        type: 'reamer',
        diameter: hole.diameter,
        flutes: 6,
        operation: 'ream'
      });
    }
    
    return tools;
  };
  
  const suggestToolForPocket = (pocket) => {
    const tools = [];
    
    // Roughing tool
    tools.push({
      type: 'endmill',
      diameter: Math.min(pocket.cornerRadius * 2 - 1, pocket.width * 0.5),
      flutes: 3,
      operation: 'roughing'
    });
    
    // Finishing tool
    tools.push({
      type: 'endmill',
      diameter: pocket.cornerRadius * 2,
      flutes: 4,
      operation: 'finishing'
    });
    
    return tools;
  };
  
  const suggestToolForProfile = (profile) => {
    return [{
      type: 'endmill',
      diameter: 10,
      flutes: 4,
      operation: 'contouring'
    }];
  };
  
  const suggestToolForSlot = (slot) => {
    return [{
      type: 'slotmill',
      diameter: slot.width,
      flutes: 2,
      operation: 'slotting'
    }];
  };
  
  const suggestToolForThread = (thread) => {
    return [{
      type: 'tap',
      diameter: thread.diameter,
      pitch: thread.pitch,
      operation: 'tapping'
    }];
  };
  
  // Visualize features in 3D
  const visualizeFeatures = (features) => {
    // Clear existing feature meshes
    featureMeshesRef.current.forEach(mesh => {
      sceneRef.current.remove(mesh);
    });
    featureMeshesRef.current = [];
    
    features.forEach(feature => {
      let mesh;
      
      switch (feature.type) {
        case 'hole':
          const holeGeom = new THREE.CylinderGeometry(
            feature.diameter / 2,
            feature.diameter / 2,
            feature.depth,
            32
          );
          const holeMat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
          });
          mesh = new THREE.Mesh(holeGeom, holeMat);
          mesh.position.set(feature.position.x, feature.position.y, feature.position.z);
          if (feature.axis === 'Z') mesh.rotateX(Math.PI / 2);
          break;
          
        case 'pocket':
          const pocketGeom = new THREE.BoxGeometry(
            feature.width,
            feature.length,
            feature.depth
          );
          const pocketMat = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
          });
          mesh = new THREE.Mesh(pocketGeom, pocketMat);
          mesh.position.set(feature.position.x, feature.position.y, feature.position.z);
          break;
          
        case 'profile':
          // Create a simple box for profile visualization
          const profileGeom = new THREE.BoxGeometry(100, 100, feature.depth);
          const edges = new THREE.EdgesGeometry(profileGeom);
          mesh = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 })
          );
          mesh.position.set(feature.position.x, feature.position.y, feature.position.z);
          break;
          
        case 'slot':
          const slotGeom = new THREE.BoxGeometry(
            feature.length,
            feature.width,
            feature.depth
          );
          const slotMat = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
          });
          mesh = new THREE.Mesh(slotGeom, slotMat);
          mesh.position.set(feature.position.x, feature.position.y, feature.position.z);
          mesh.rotateZ(feature.orientation);
          break;
          
        case 'thread':
          const threadGeom = new THREE.CylinderGeometry(
            feature.diameter / 2,
            feature.diameter / 2,
            feature.depth,
            32,
            1,
            false,
            0,
            Math.PI * 2
          );
          const threadMat = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.5
          });
          mesh = new THREE.Mesh(threadGeom, threadMat);
          mesh.position.set(feature.position.x, feature.position.y, feature.position.z);
          mesh.rotateX(Math.PI / 2);
          break;
      }
      
      if (mesh) {
        mesh.userData = { feature };
        featureMeshesRef.current.push(mesh);
        sceneRef.current.add(mesh);
      }
    });
  };
  
  // Calculate feature statistics
  const calculateFeatureStats = (features) => {
    const stats = {
      totalFeatures: features.length,
      byType: {},
      totalMachiningTime: 0,
      toolsRequired: new Set()
    };
    
    features.forEach(feature => {
      // Count by type
      if (!stats.byType[feature.type]) {
        stats.byType[feature.type] = 0;
      }
      stats.byType[feature.type]++;
      
      // Collect unique tools
      if (feature.toolSuggestion) {
        feature.toolSuggestion.forEach(tool => {
          stats.toolsRequired.add(`${tool.type}_${tool.diameter}`);
        });
      }
      
      // Estimate machining time (simplified)
      let time = 0;
      switch (feature.type) {
        case 'hole':
          time = feature.depth / 100; // minutes
          break;
        case 'pocket':
          time = (feature.width * feature.length * feature.depth) / 5000;
          break;
        case 'profile':
          time = feature.perimeter / 500;
          break;
        case 'slot':
          time = feature.length / 200;
          break;
        case 'thread':
          time = feature.depth / 50;
          break;
      }
      stats.totalMachiningTime += time;
    });
    
    stats.toolsRequired = Array.from(stats.toolsRequired);
    setFeatureStats(stats);
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setStepFile(file);
      // Parse STEP file (simplified - would need proper STEP parser)
      loadStepModel(e.target.result);
      detectFeatures(e.target.result);
    };
    reader.readAsText(file);
  };
  
  // Load STEP model (simplified visualization)
  const loadStepModel = (stepData) => {
    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }
    
    // Create a simple box to represent the part (in reality, would parse STEP geometry)
    const geometry = new THREE.BoxGeometry(100, 100, 40);
    const material = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.8
    });
    const model = new THREE.Mesh(geometry, material);
    model.castShadow = true;
    model.receiveShadow = true;
    
    modelRef.current = model;
    sceneRef.current.add(model);
  };
  
  // Toggle feature selection
  const toggleFeatureSelection = (feature) => {
    setSelectedFeatures(prev => {
      const isSelected = prev.find(f => f.id === feature.id);
      if (isSelected) {
        return prev.filter(f => f.id !== feature.id);
      } else {
        return [...prev, feature];
      }
    });
    
    // Highlight in 3D view
    featureMeshesRef.current.forEach(mesh => {
      if (mesh.userData.feature.id === feature.id) {
        const isSelected = selectedFeatures.find(f => f.id === feature.id);
        if (mesh.material) {
          mesh.material.opacity = isSelected ? 0.8 : 0.5;
          mesh.material.emissive = isSelected ? new THREE.Color(0xffffff) : null;
          mesh.material.emissiveIntensity = isSelected ? 0.3 : 0;
        }
      }
    });
  };
  
  // Generate toolpath for selected features
  const generateToolpath = () => {
    if (selectedFeatures.length === 0) {
      alert('Please select features to generate toolpath');
      return;
    }
    
    const toolpathData = {
      features: selectedFeatures,
      tools: [],
      operations: []
    };
    
    // Collect all required tools
    selectedFeatures.forEach(feature => {
      if (feature.toolSuggestion) {
        toolpathData.tools.push(...feature.toolSuggestion);
      }
    });
    
    // Generate operations sequence
    const operationOrder = ['spot', 'drill', 'roughing', 'finishing', 'ream', 'tapping'];
    
    operationOrder.forEach(opType => {
      selectedFeatures.forEach(feature => {
        if (feature.operations.includes(opType)) {
          toolpathData.operations.push({
            feature: feature.id,
            operation: opType,
            tool: feature.toolSuggestion.find(t => t.operation === opType)
          });
        }
      });
    });
    
    if (onGenerateToolpath) {
      onGenerateToolpath(toolpathData);
    }
  };
  
  return (
    <div className="step-viewer">
      <div className="step-viewer-header">
        <div className="file-controls">
          <input
            type="file"
            accept=".step,.stp,.STEP,.STP"
            onChange={handleFileUpload}
            id="step-file-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="step-file-input" className="file-upload-btn">
            📁 Load STEP File
          </label>
          {stepFile && (
            <span className="file-name">{stepFile.name}</span>
          )}
        </div>
        
        <div className="view-controls">
          <button 
            className={viewMode === '3d' ? 'active' : ''}
            onClick={() => setViewMode('3d')}
          >
            3D View
          </button>
          <button 
            className={viewMode === 'features' ? 'active' : ''}
            onClick={() => setViewMode('features')}
          >
            Features
          </button>
          <button 
            className={viewMode === 'analysis' ? 'active' : ''}
            onClick={() => setViewMode('analysis')}
          >
            Analysis
          </button>
        </div>
        
        <div className="action-controls">
          <button 
            onClick={() => detectFeatures(stepFile)}
            disabled={!stepFile || processing}
          >
            🔍 Detect Features
          </button>
          <button 
            onClick={generateToolpath}
            disabled={selectedFeatures.length === 0}
          >
            🛠️ Generate Toolpath
          </button>
        </div>
      </div>
      
      <div className="step-viewer-content">
        {viewMode === '3d' && (
          <div className="viewer-3d" ref={mountRef} />
        )}
        
        {viewMode === 'features' && (
          <div className="features-panel">
            <h3>Detected Features ({features.length})</h3>
            {processing && <div className="processing">Processing...</div>}
            
            <div className="features-list">
              {features.map(feature => (
                <div 
                  key={feature.id}
                  className={`feature-item ${selectedFeatures.find(f => f.id === feature.id) ? 'selected' : ''}`}
                  onClick={() => toggleFeatureSelection(feature)}
                >
                  <div className="feature-header">
                    <span className="feature-id">{feature.id}</span>
                    <span className="feature-type">{feature.type}</span>
                  </div>
                  
                  <div className="feature-details">
                    {feature.type === 'hole' && (
                      <>
                        <span>⌀{feature.diameter}mm × {feature.depth}mm</span>
                        <span>Pos: ({feature.position.x}, {feature.position.y}, {feature.position.z})</span>
                      </>
                    )}
                    {feature.type === 'pocket' && (
                      <>
                        <span>{feature.width} × {feature.length} × {feature.depth}mm</span>
                        <span>R{feature.cornerRadius}</span>
                      </>
                    )}
                    {feature.type === 'profile' && (
                      <span>Perimeter: {feature.perimeter}mm</span>
                    )}
                    {feature.type === 'slot' && (
                      <span>{feature.width} × {feature.length}mm</span>
                    )}
                    {feature.type === 'thread' && (
                      <span>{feature.threadType}</span>
                    )}
                  </div>
                  
                  <div className="feature-tools">
                    {feature.toolSuggestion && feature.toolSuggestion.map((tool, idx) => (
                      <span key={idx} className="tool-badge">
                        {tool.type} ⌀{tool.diameter}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {viewMode === 'analysis' && (
          <div className="analysis-panel">
            <h3>Feature Analysis</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Features</div>
                <div className="stat-value">{featureStats.totalFeatures || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Estimated Time</div>
                <div className="stat-value">
                  {featureStats.totalMachiningTime?.toFixed(1) || 0} min
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Tools Required</div>
                <div className="stat-value">{featureStats.toolsRequired?.length || 0}</div>
              </div>
            </div>
            
            <div className="feature-breakdown">
              <h4>Features by Type</h4>
              {Object.entries(featureStats.byType || {}).map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-type">{type}</span>
                  <span className="breakdown-count">{count}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ width: `${(count / featureStats.totalFeatures) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="tools-list">
              <h4>Required Tools</h4>
              <div className="tools-grid">
                {featureStats.toolsRequired?.map((tool, idx) => (
                  <div key={idx} className="tool-item">
                    {tool.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="step-viewer-footer">
        <div className="selection-info">
          {selectedFeatures.length} feature(s) selected
        </div>
        <div className="processing-status">
          {processing && "Processing STEP file..."}
        </div>
      </div>
    </div>
  );
};

export default StepViewer;