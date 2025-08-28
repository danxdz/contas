import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const FeatureRecognition = ({ onFeaturesDetected, modelFile }) => {
  const [features, setFeatures] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelGeometry, setModelGeometry] = useState(null);
  const canvasRef = useRef(null);

  // Feature types
  const FEATURE_TYPES = {
    POCKET: 'pocket',
    HOLE: 'hole',
    SLOT: 'slot',
    BOSS: 'boss',
    FACE: 'face',
    CHAMFER: 'chamfer',
    FILLET: 'fillet',
    THREAD: 'thread',
    GROOVE: 'groove',
    STEP: 'step'
  };

  // Analyze geometry for features
  const analyzeGeometry = async (geometry) => {
    setAnalyzing(true);
    setProgress(0);
    const detectedFeatures = [];

    // Get geometry data
    const vertices = geometry.attributes.position.array;
    const normals = geometry.attributes.normal?.array;
    const faces = [];

    // Build face list from vertices
    for (let i = 0; i < vertices.length; i += 9) {
      faces.push({
        v1: new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]),
        v2: new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]),
        v3: new THREE.Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]),
        normal: normals ? new THREE.Vector3(
          (normals[i] + normals[i + 3] + normals[i + 6]) / 3,
          (normals[i + 1] + normals[i + 4] + normals[i + 7]) / 3,
          (normals[i + 2] + normals[i + 5] + normals[i + 8]) / 3
        ).normalize() : null
      });
    }

    setProgress(20);

    // Detect planar surfaces
    const planarSurfaces = detectPlanarSurfaces(faces);
    setProgress(40);

    // Detect cylindrical features (holes, bosses)
    const cylindricalFeatures = detectCylindricalFeatures(geometry);
    setProgress(60);

    // Detect pockets
    const pockets = detectPockets(planarSurfaces, geometry.boundingBox);
    detectedFeatures.push(...pockets);
    setProgress(70);

    // Detect holes
    const holes = detectHoles(cylindricalFeatures);
    detectedFeatures.push(...holes);
    setProgress(80);

    // Detect slots
    const slots = detectSlots(planarSurfaces, geometry.boundingBox);
    detectedFeatures.push(...slots);
    setProgress(90);

    // Detect bosses
    const bosses = detectBosses(cylindricalFeatures, planarSurfaces);
    detectedFeatures.push(...bosses);

    // Calculate machining strategies for each feature
    detectedFeatures.forEach(feature => {
      feature.strategy = determineStrategy(feature);
      feature.tools = recommendTools(feature);
      feature.operations = generateOperations(feature);
    });

    setProgress(100);
    setFeatures(detectedFeatures);
    setAnalyzing(false);

    if (onFeaturesDetected) {
      onFeaturesDetected(detectedFeatures);
    }

    return detectedFeatures;
  };

  // Detect planar surfaces
  const detectPlanarSurfaces = (faces) => {
    const surfaces = [];
    const tolerance = 0.01;
    const processedFaces = new Set();

    faces.forEach((face, index) => {
      if (processedFaces.has(index)) return;

      const coplanarFaces = [face];
      processedFaces.add(index);

      // Find all coplanar faces
      faces.forEach((otherFace, otherIndex) => {
        if (otherIndex === index || processedFaces.has(otherIndex)) return;

        if (face.normal && otherFace.normal) {
          const dotProduct = face.normal.dot(otherFace.normal);
          if (Math.abs(1 - dotProduct) < tolerance) {
            // Check if faces are on same plane
            const vector = otherFace.v1.clone().sub(face.v1);
            const distance = Math.abs(vector.dot(face.normal));
            if (distance < tolerance) {
              coplanarFaces.push(otherFace);
              processedFaces.add(otherIndex);
            }
          }
        }
      });

      if (coplanarFaces.length > 3) {
        surfaces.push({
          type: 'planar',
          faces: coplanarFaces,
          normal: face.normal,
          area: calculateSurfaceArea(coplanarFaces)
        });
      }
    });

    return surfaces;
  };

  // Detect cylindrical features
  const detectCylindricalFeatures = (geometry) => {
    const features = [];
    geometry.computeBoundingBox();
    
    // Simplified cylinder detection using vertex clustering
    const vertices = geometry.attributes.position.array;
    const clusters = [];
    
    // Group vertices by height (Z)
    const heightMap = new Map();
    for (let i = 0; i < vertices.length; i += 3) {
      const z = Math.round(vertices[i + 2] * 100) / 100;
      if (!heightMap.has(z)) {
        heightMap.set(z, []);
      }
      heightMap.get(z).push({
        x: vertices[i],
        y: vertices[i + 1],
        z: vertices[i + 2]
      });
    }

    // Check each height level for circular patterns
    heightMap.forEach((points, z) => {
      if (points.length >= 8) { // Minimum points for circle detection
        const circle = fitCircle(points);
        if (circle && circle.confidence > 0.9) {
          features.push({
            type: 'cylinder',
            center: { x: circle.centerX, y: circle.centerY, z: z },
            radius: circle.radius,
            height: 0 // Will be calculated later
          });
        }
      }
    });

    // Merge cylinders at different heights into single features
    const mergedFeatures = mergeCylinders(features);
    return mergedFeatures;
  };

  // Detect pockets
  const detectPockets = (surfaces, boundingBox) => {
    const pockets = [];
    
    surfaces.forEach(surface => {
      if (surface.normal && Math.abs(surface.normal.z) > 0.9) { // Horizontal surface
        // Check if surface is below top of part
        const avgZ = surface.faces.reduce((sum, face) => 
          sum + (face.v1.z + face.v2.z + face.v3.z) / 3, 0) / surface.faces.length;
        
        if (avgZ < boundingBox.max.z - 1) { // Surface is recessed
          const boundary = calculateBoundary(surface.faces);
          
          pockets.push({
            id: `pocket_${pockets.length + 1}`,
            type: FEATURE_TYPES.POCKET,
            depth: boundingBox.max.z - avgZ,
            area: surface.area,
            boundary: boundary,
            center: calculateCenter(boundary),
            bottomZ: avgZ,
            islandFree: true, // Simplified - would need more analysis
            cornerRadius: detectCornerRadius(boundary)
          });
        }
      }
    });

    return pockets;
  };

  // Detect holes
  const detectHoles = (cylindricalFeatures) => {
    const holes = [];
    
    cylindricalFeatures.forEach((cylinder, index) => {
      // Holes typically go through material or are blind
      if (cylinder.radius < 50) { // Reasonable hole size limit
        holes.push({
          id: `hole_${index + 1}`,
          type: FEATURE_TYPES.HOLE,
          diameter: cylinder.radius * 2,
          depth: cylinder.height,
          center: cylinder.center,
          isThrough: cylinder.isThrough || false,
          isThreaded: detectThreads(cylinder),
          tolerance: 'H7', // Default tolerance
          surfaceFinish: 32 // Default Ra
        });
      }
    });

    return holes;
  };

  // Detect slots
  const detectSlots = (surfaces, boundingBox) => {
    const slots = [];
    
    surfaces.forEach(surface => {
      const boundary = calculateBoundary(surface.faces);
      const aspectRatio = calculateAspectRatio(boundary);
      
      // Slots are elongated pockets
      if (aspectRatio > 2 && surface.normal && Math.abs(surface.normal.z) > 0.9) {
        const avgZ = surface.faces.reduce((sum, face) => 
          sum + (face.v1.z + face.v2.z + face.v3.z) / 3, 0) / surface.faces.length;
        
        if (avgZ < boundingBox.max.z - 1) {
          slots.push({
            id: `slot_${slots.length + 1}`,
            type: FEATURE_TYPES.SLOT,
            length: calculateLength(boundary),
            width: calculateWidth(boundary),
            depth: boundingBox.max.z - avgZ,
            center: calculateCenter(boundary),
            orientation: calculateOrientation(boundary),
            endType: 'rounded' // or 'square'
          });
        }
      }
    });

    return slots;
  };

  // Detect bosses
  const detectBosses = (cylindricalFeatures, surfaces) => {
    const bosses = [];
    
    cylindricalFeatures.forEach((cylinder, index) => {
      // Bosses protrude from surfaces
      const isProtruding = surfaces.some(surface => {
        const avgZ = surface.faces.reduce((sum, face) => 
          sum + (face.v1.z + face.v2.z + face.v3.z) / 3, 0) / surface.faces.length;
        return cylinder.center.z > avgZ;
      });
      
      if (isProtruding && cylinder.radius > 5) {
        bosses.push({
          id: `boss_${index + 1}`,
          type: FEATURE_TYPES.BOSS,
          diameter: cylinder.radius * 2,
          height: cylinder.height,
          center: cylinder.center,
          hasCenterHole: false // Would need additional analysis
        });
      }
    });

    return bosses;
  };

  // Determine machining strategy for feature
  const determineStrategy = (feature) => {
    const strategies = {
      [FEATURE_TYPES.POCKET]: {
        roughing: 'adaptive_clearing',
        finishing: 'contour',
        stepover: 0.4,
        stepdown: 0.5,
        entryMethod: 'helix'
      },
      [FEATURE_TYPES.HOLE]: {
        operation: feature.diameter < 10 ? 'drilling' : 'helical_milling',
        cycle: feature.isThrough ? 'G81' : 'G83',
        peckDepth: feature.diameter * 0.5
      },
      [FEATURE_TYPES.SLOT]: {
        roughing: 'trochoidal',
        finishing: 'contour',
        stepover: 0.3,
        rampAngle: 3
      },
      [FEATURE_TYPES.BOSS]: {
        roughing: 'adaptive_clearing',
        finishing: 'contour',
        approach: 'outside',
        stockToLeave: 0.2
      },
      [FEATURE_TYPES.FACE]: {
        operation: 'face_milling',
        stepover: 0.75,
        pattern: 'zigzag'
      }
    };

    return strategies[feature.type] || strategies[FEATURE_TYPES.POCKET];
  };

  // Recommend tools for feature
  const recommendTools = (feature) => {
    const tools = [];

    switch (feature.type) {
      case FEATURE_TYPES.POCKET:
        tools.push({
          type: 'endmill',
          diameter: Math.min(feature.cornerRadius * 2 || 10, feature.area / 100),
          flutes: 4,
          material: 'carbide',
          coating: 'AlTiN'
        });
        break;
      
      case FEATURE_TYPES.HOLE:
        if (feature.diameter <= 13) {
          tools.push({
            type: 'drill',
            diameter: feature.diameter,
            pointAngle: 118,
            material: 'HSS-Co'
          });
        } else {
          tools.push({
            type: 'endmill',
            diameter: feature.diameter * 0.7,
            flutes: 3,
            material: 'carbide'
          });
        }
        if (feature.isThreaded) {
          tools.push({
            type: 'tap',
            size: `M${feature.diameter}`,
            pitch: 1.5
          });
        }
        break;
      
      case FEATURE_TYPES.SLOT:
        tools.push({
          type: 'endmill',
          diameter: feature.width * 0.9,
          flutes: 2,
          material: 'carbide',
          coating: 'TiAlN'
        });
        break;
      
      case FEATURE_TYPES.BOSS:
        tools.push({
          type: 'endmill',
          diameter: 10,
          flutes: 4,
          material: 'carbide'
        });
        break;
    }

    return tools;
  };

  // Generate operations for feature
  const generateOperations = (feature) => {
    const operations = [];

    switch (feature.type) {
      case FEATURE_TYPES.POCKET:
        operations.push({
          type: 'roughing',
          tool: 0,
          strategy: 'adaptive',
          stepdown: feature.depth * 0.3,
          stepover: 0.4,
          feedRate: 1000,
          spindleSpeed: 4000
        });
        operations.push({
          type: 'finishing',
          tool: 0,
          strategy: 'contour',
          stepdown: feature.depth,
          stepover: 0.1,
          feedRate: 800,
          spindleSpeed: 5000
        });
        break;
      
      case FEATURE_TYPES.HOLE:
        operations.push({
          type: 'drilling',
          tool: 0,
          cycle: 'G81',
          depth: feature.depth,
          feedRate: 200,
          spindleSpeed: 2000,
          dwell: 0.5
        });
        break;
      
      case FEATURE_TYPES.SLOT:
        operations.push({
          type: 'slotting',
          tool: 0,
          strategy: 'trochoidal',
          stepdown: feature.depth * 0.25,
          width: feature.width,
          feedRate: 600,
          spindleSpeed: 3500
        });
        break;
    }

    return operations;
  };

  // Helper functions
  const calculateSurfaceArea = (faces) => {
    return faces.reduce((total, face) => {
      const a = face.v2.clone().sub(face.v1);
      const b = face.v3.clone().sub(face.v1);
      return total + a.cross(b).length() / 2;
    }, 0);
  };

  const calculateBoundary = (faces) => {
    const points = [];
    faces.forEach(face => {
      points.push(face.v1, face.v2, face.v3);
    });
    // Simplified - would need convex hull algorithm
    return points;
  };

  const calculateCenter = (boundary) => {
    const center = new THREE.Vector3();
    boundary.forEach(point => center.add(point));
    center.divideScalar(boundary.length);
    return { x: center.x, y: center.y, z: center.z };
  };

  const calculateAspectRatio = (boundary) => {
    // Simplified - calculate bounding box aspect ratio
    const box = new THREE.Box3().setFromPoints(boundary);
    const size = box.getSize(new THREE.Vector3());
    return Math.max(size.x, size.y) / Math.min(size.x, size.y);
  };

  const calculateLength = (boundary) => {
    const box = new THREE.Box3().setFromPoints(boundary);
    const size = box.getSize(new THREE.Vector3());
    return Math.max(size.x, size.y);
  };

  const calculateWidth = (boundary) => {
    const box = new THREE.Box3().setFromPoints(boundary);
    const size = box.getSize(new THREE.Vector3());
    return Math.min(size.x, size.y);
  };

  const calculateOrientation = (boundary) => {
    const box = new THREE.Box3().setFromPoints(boundary);
    const size = box.getSize(new THREE.Vector3());
    return size.x > size.y ? 0 : 90; // degrees
  };

  const detectCornerRadius = (boundary) => {
    // Simplified - would need curve fitting
    return 2; // Default 2mm radius
  };

  const detectThreads = (cylinder) => {
    // Simplified - would need helix detection
    return false;
  };

  const fitCircle = (points) => {
    if (points.length < 3) return null;
    
    // Simplified least squares circle fitting
    let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
    
    points.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
      sumXY += p.x * p.y;
    });
    
    const n = points.length;
    const centerX = sumX / n;
    const centerY = sumY / n;
    
    // Calculate radius as average distance from center
    let sumR = 0;
    let variance = 0;
    
    points.forEach(p => {
      const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
      sumR += dist;
    });
    
    const radius = sumR / n;
    
    // Calculate confidence based on variance
    points.forEach(p => {
      const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
      variance += (dist - radius) ** 2;
    });
    
    const confidence = variance < radius * 0.1 ? 0.95 : 0.5;
    
    return { centerX, centerY, radius, confidence };
  };

  const mergeCylinders = (cylinders) => {
    // Group cylinders with same center X,Y but different Z
    const merged = [];
    const processed = new Set();
    
    cylinders.forEach((cyl, i) => {
      if (processed.has(i)) return;
      
      const group = [cyl];
      processed.add(i);
      
      cylinders.forEach((other, j) => {
        if (i === j || processed.has(j)) return;
        
        const dist = Math.sqrt(
          (cyl.center.x - other.center.x) ** 2 +
          (cyl.center.y - other.center.y) ** 2
        );
        
        if (dist < 1 && Math.abs(cyl.radius - other.radius) < 1) {
          group.push(other);
          processed.add(j);
        }
      });
      
      if (group.length > 1) {
        const minZ = Math.min(...group.map(g => g.center.z));
        const maxZ = Math.max(...group.map(g => g.center.z));
        merged.push({
          ...cyl,
          height: maxZ - minZ,
          isThrough: group.length > 10 // Simplified
        });
      } else {
        merged.push(cyl);
      }
    });
    
    return merged;
  };

  // Load and analyze model file
  useEffect(() => {
    if (modelFile) {
      const loader = modelFile.name.endsWith('.stl') ? new STLLoader() : new OBJLoader();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        const geometry = loader.parse(contents);
        
        if (geometry.geometry) {
          geometry.geometry.computeBoundingBox();
          geometry.geometry.computeVertexNormals();
          setModelGeometry(geometry.geometry);
          analyzeGeometry(geometry.geometry);
        } else if (geometry) {
          geometry.computeBoundingBox();
          geometry.computeVertexNormals();
          setModelGeometry(geometry);
          analyzeGeometry(geometry);
        }
      };
      
      reader.readAsArrayBuffer(modelFile);
    }
  }, [modelFile]);

  return (
    <div className="feature-recognition">
      <div className="feature-header">
        <h3>🎯 Feature Recognition</h3>
        <span className="feature-subtitle">AI-Powered Geometry Analysis</span>
      </div>

      {analyzing && (
        <div className="analysis-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">Analyzing geometry... {progress}%</span>
        </div>
      )}

      {features.length > 0 && (
        <div className="features-list">
          <div className="features-summary">
            <span>Found {features.length} machinable features</span>
          </div>

          {features.map((feature, index) => (
            <div key={feature.id} className="feature-item">
              <div className="feature-header-row">
                <span className="feature-icon">
                  {feature.type === FEATURE_TYPES.POCKET && '⬜'}
                  {feature.type === FEATURE_TYPES.HOLE && '⭕'}
                  {feature.type === FEATURE_TYPES.SLOT && '▭'}
                  {feature.type === FEATURE_TYPES.BOSS && '🔲'}
                </span>
                <span className="feature-name">{feature.id}</span>
                <span className="feature-type">{feature.type}</span>
              </div>

              <div className="feature-details">
                {feature.type === FEATURE_TYPES.POCKET && (
                  <>
                    <div className="detail-row">
                      <span>Depth:</span>
                      <span>{feature.depth.toFixed(2)}mm</span>
                    </div>
                    <div className="detail-row">
                      <span>Area:</span>
                      <span>{feature.area.toFixed(2)}mm²</span>
                    </div>
                    <div className="detail-row">
                      <span>Corner R:</span>
                      <span>{feature.cornerRadius}mm</span>
                    </div>
                  </>
                )}

                {feature.type === FEATURE_TYPES.HOLE && (
                  <>
                    <div className="detail-row">
                      <span>Diameter:</span>
                      <span>⌀{feature.diameter.toFixed(2)}mm</span>
                    </div>
                    <div className="detail-row">
                      <span>Depth:</span>
                      <span>{feature.depth.toFixed(2)}mm</span>
                    </div>
                    <div className="detail-row">
                      <span>Type:</span>
                      <span>{feature.isThrough ? 'Through' : 'Blind'}</span>
                    </div>
                  </>
                )}

                {feature.type === FEATURE_TYPES.SLOT && (
                  <>
                    <div className="detail-row">
                      <span>Length:</span>
                      <span>{feature.length.toFixed(2)}mm</span>
                    </div>
                    <div className="detail-row">
                      <span>Width:</span>
                      <span>{feature.width.toFixed(2)}mm</span>
                    </div>
                    <div className="detail-row">
                      <span>Depth:</span>
                      <span>{feature.depth.toFixed(2)}mm</span>
                    </div>
                  </>
                )}

                <div className="feature-strategy">
                  <span className="strategy-label">Strategy:</span>
                  <span className="strategy-value">
                    {feature.strategy.roughing || feature.strategy.operation}
                  </span>
                </div>

                <div className="feature-tools">
                  <span className="tools-label">Tool:</span>
                  {feature.tools.map((tool, i) => (
                    <span key={i} className="tool-chip">
                      {tool.type} ⌀{tool.diameter}mm
                    </span>
                  ))}
                </div>

                <div className="feature-operations">
                  {feature.operations.map((op, i) => (
                    <div key={i} className="operation-chip">
                      {op.type} - F{op.feedRate} S{op.spindleSpeed}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button 
            className="generate-toolpath-btn"
            onClick={() => onFeaturesDetected && onFeaturesDetected(features)}
          >
            Generate Toolpaths for All Features
          </button>
        </div>
      )}

      <style jsx>{`
        .feature-recognition {
          background: rgba(20, 20, 20, 0.95);
          border-radius: 8px;
          padding: 20px;
          color: #e0e0e0;
        }

        .feature-header {
          margin-bottom: 20px;
        }

        .feature-header h3 {
          margin: 0;
          color: #00ff88;
          font-size: 18px;
        }

        .feature-subtitle {
          color: #888;
          font-size: 12px;
        }

        .analysis-progress {
          margin: 20px 0;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00ffff);
          transition: width 0.3s;
        }

        .progress-text {
          display: block;
          margin-top: 10px;
          color: #888;
          font-size: 12px;
        }

        .features-summary {
          padding: 10px;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 4px;
          margin-bottom: 15px;
          color: #00ff88;
          font-weight: 500;
        }

        .feature-item {
          background: rgba(30, 30, 30, 0.8);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
          transition: all 0.2s;
        }

        .feature-item:hover {
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }

        .feature-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .feature-icon {
          font-size: 20px;
        }

        .feature-name {
          font-weight: 600;
          color: #fff;
        }

        .feature-type {
          margin-left: auto;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .feature-details {
          margin-top: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
        }

        .detail-row span:first-child {
          color: #888;
        }

        .detail-row span:last-child {
          color: #fff;
          font-weight: 500;
        }

        .feature-strategy {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #333;
        }

        .strategy-label, .tools-label {
          color: #888;
          font-size: 12px;
          margin-right: 10px;
        }

        .strategy-value {
          color: #00ffff;
          font-weight: 500;
        }

        .feature-tools {
          margin-top: 8px;
        }

        .tool-chip {
          display: inline-block;
          padding: 3px 8px;
          background: rgba(255, 136, 0, 0.2);
          border: 1px solid #ff8800;
          border-radius: 4px;
          font-size: 11px;
          margin-right: 5px;
        }

        .feature-operations {
          margin-top: 8px;
          display: flex;
          gap: 5px;
        }

        .operation-chip {
          padding: 3px 8px;
          background: rgba(136, 136, 255, 0.2);
          border: 1px solid #8888ff;
          border-radius: 4px;
          font-size: 11px;
        }

        .generate-toolpath-btn {
          width: 100%;
          margin-top: 20px;
          padding: 12px;
          background: linear-gradient(135deg, #00ff88, #00ffff);
          border: none;
          border-radius: 6px;
          color: #000;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .generate-toolpath-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }
      `}</style>
    </div>
  );
};

export default FeatureRecognition;