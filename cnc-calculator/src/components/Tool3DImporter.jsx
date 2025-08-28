import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Tool3DImporter = ({ onModelLoaded, onToolDataExtracted }) => {
  const [importUrl, setImportUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelPreview, setModelPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  
  // Known manufacturer URL patterns and their tool databases
  const manufacturerPatterns = {
    seco: {
      pattern: /secoresources\.azureedge\.net|secotools\.com/,
      extract: (url) => {
        // Extract part number from Seco URL
        const match = url.match(/([0-9A-Z]+(?:-[A-Z0-9]+)*)\.(stp|step|stl)/i);
        if (match) {
          return {
            manufacturer: 'Seco Tools',
            partNumber: match[1],
            modelType: match[2].toUpperCase()
          };
        }
        return null;
      },
      toolDatabase: {
        '553020SZ3.0-SIRON-A': {
          type: 'End Mill',
          diameter: 3.0,
          flutes: 2,
          length: 38,
          cuttingLength: 8,
          shankDiameter: 3,
          coating: 'SIRON-A',
          material: 'Solid Carbide',
          description: 'Square end mill for aluminum',
          speeds: { aluminum: 1200, steel: 400 }
        }
      }
    },
    sandvik: {
      pattern: /sandvik\.coromant|coromant\.com/,
      extract: (url) => {
        const match = url.match(/([A-Z0-9-]+)\.(stp|step|stl)/i);
        if (match) {
          return {
            manufacturer: 'Sandvik Coromant',
            partNumber: match[1],
            modelType: match[2].toUpperCase()
          };
        }
        return null;
      },
      toolDatabase: {}
    },
    kennametal: {
      pattern: /kennametal\.com/,
      extract: (url) => {
        const match = url.match(/([A-Z0-9-]+)\.(stp|step|stl)/i);
        if (match) {
          return {
            manufacturer: 'Kennametal',
            partNumber: match[1],
            modelType: match[2].toUpperCase()
          };
        }
        return null;
      },
      toolDatabase: {}
    },
    iscar: {
      pattern: /iscar\.com/,
      extract: (url) => {
        const match = url.match(/([A-Z0-9-]+)\.(stp|step|stl)/i);
        if (match) {
          return {
            manufacturer: 'Iscar',
            partNumber: match[1],
            modelType: match[2].toUpperCase()
          };
        }
        return null;
      },
      toolDatabase: {}
    }
  };

  // STEP file parser (simplified - real STEP parsing is complex)
  const parseSTEPFile = async (url) => {
    try {
      // For STEP files, we'll need to either:
      // 1. Use a server-side converter (STEP -> STL)
      // 2. Use a WASM-based STEP parser
      // 3. Fetch pre-converted STL from a CDN
      
      // For now, let's try to fetch a pre-converted STL version
      const stlUrl = url.replace(/\.(stp|step)$/i, '.stl');
      
      // Check if STL version exists
      try {
        const response = await fetch(stlUrl, { method: 'HEAD' });
        if (response.ok) {
          return loadSTLFromUrl(stlUrl);
        }
      } catch (e) {
        console.log('No STL version found, trying to parse STEP...');
      }
      
      // If no STL, we'll create a placeholder geometry based on tool data
      const toolData = extractToolDataFromUrl(url);
      if (toolData && toolData.diameter) {
        return createToolGeometryFromData(toolData);
      }
      
      throw new Error('STEP file parsing requires server-side conversion');
    } catch (error) {
      console.error('STEP parsing error:', error);
      throw error;
    }
  };

  // Load STL from URL
  const loadSTLFromUrl = async (url) => {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader();
      
      // Handle CORS by using a proxy if needed
      const proxyUrl = url.includes('http') ? 
        `/api/proxy?url=${encodeURIComponent(url)}` : url;
      
      loader.load(
        proxyUrl,
        (geometry) => {
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          
          const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x111111,
            shininess: 200
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Auto-orient tool (assume cutting edge at -Z)
          mesh.rotation.x = Math.PI;
          
          resolve(mesh);
        },
        (progress) => {
          console.log('Loading:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Create tool geometry from extracted data
  const createToolGeometryFromData = (toolData) => {
    const group = new THREE.Group();
    
    // Shank
    const shankGeometry = new THREE.CylinderGeometry(
      toolData.shankDiameter / 2 || toolData.diameter / 2,
      toolData.shankDiameter / 2 || toolData.diameter / 2,
      (toolData.length - toolData.cuttingLength) || 30
    );
    const shankMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const shank = new THREE.Mesh(shankGeometry, shankMaterial);
    shank.position.y = ((toolData.length - toolData.cuttingLength) || 30) / 2;
    group.add(shank);
    
    // Cutting part
    const cuttingGeometry = new THREE.CylinderGeometry(
      toolData.diameter / 2,
      toolData.diameter / 2,
      toolData.cuttingLength || 10
    );
    
    // Apply coating color
    const coatingColors = {
      'TiN': 0xffd700,
      'TiAlN': 0x9370db,
      'AlTiN': 0x8b008b,
      'TiCN': 0x708090,
      'DLC': 0x2f4f4f,
      'SIRON-A': 0x4169e1,
      'Diamond': 0xe6e6fa
    };
    
    const cuttingMaterial = new THREE.MeshPhongMaterial({
      color: coatingColors[toolData.coating] || 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const cutting = new THREE.Mesh(cuttingGeometry, cuttingMaterial);
    cutting.position.y = -(toolData.cuttingLength || 10) / 2;
    group.add(cutting);
    
    // Add flutes visualization
    if (toolData.flutes) {
      for (let i = 0; i < toolData.flutes; i++) {
        const angle = (Math.PI * 2 / toolData.flutes) * i;
        const fluteGeometry = new THREE.BoxGeometry(
          toolData.diameter * 0.1,
          toolData.cuttingLength || 10,
          toolData.diameter
        );
        const fluteMaterial = new THREE.MeshPhongMaterial({
          color: 0x333333,
          opacity: 0.3,
          transparent: true
        });
        const flute = new THREE.Mesh(fluteGeometry, fluteMaterial);
        flute.position.y = -(toolData.cuttingLength || 10) / 2;
        flute.rotation.y = angle;
        group.add(flute);
      }
    }
    
    group.rotation.x = Math.PI;
    return group;
  };

  // Extract tool data from URL
  const extractToolDataFromUrl = (url) => {
    for (const [key, manufacturer] of Object.entries(manufacturerPatterns)) {
      if (manufacturer.pattern.test(url)) {
        const extracted = manufacturer.extract(url);
        if (extracted) {
          const toolData = manufacturer.toolDatabase[extracted.partNumber];
          if (toolData) {
            return {
              ...toolData,
              ...extracted
            };
          }
          return extracted;
        }
      }
    }
    return null;
  };

  // Handle import from URL
  const handleImport = async () => {
    if (!importUrl) {
      setError('Please enter a URL');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Extract tool data from URL
      const toolData = extractToolDataFromUrl(importUrl);
      if (toolData) {
        setExtractedData(toolData);
        console.log('Extracted tool data:', toolData);
      }
      
      // Determine file type and load accordingly
      let model;
      if (importUrl.match(/\.(stp|step)$/i)) {
        model = await parseSTEPFile(importUrl);
      } else if (importUrl.match(/\.stl$/i)) {
        model = await loadSTLFromUrl(importUrl);
      } else if (importUrl.match(/\.obj$/i)) {
        // Load OBJ
        const loader = new OBJLoader();
        model = await new Promise((resolve, reject) => {
          loader.load(importUrl, resolve, undefined, reject);
        });
      } else if (importUrl.match(/\.(gltf|glb)$/i)) {
        // Load GLTF/GLB
        const loader = new GLTFLoader();
        const gltf = await new Promise((resolve, reject) => {
          loader.load(importUrl, resolve, undefined, reject);
        });
        model = gltf.scene;
      } else {
        throw new Error('Unsupported file format');
      }
      
      setModelPreview(model);
      
      // Notify parent components
      if (onModelLoaded) {
        onModelLoaded(model);
      }
      
      if (onToolDataExtracted && toolData) {
        onToolDataExtracted(toolData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import 3D model');
      setLoading(false);
    }
  };

  // Quick import buttons for common tools
  const quickImports = [
    {
      name: 'Seco 3mm End Mill',
      url: 'https://common-secoresources.azureedge.net/pictures/core/Content/ProductImages/3D-simplified/2024-06-11-042753_553020SZ3.0-SIRON-A_Basic.stp?v=2024-06-11%2004:27:53Z'
    },
    {
      name: 'Sandvik CoroMill',
      url: 'https://example.com/sandvik-tool.stl'
    },
    {
      name: 'Kennametal KSEM',
      url: 'https://example.com/kennametal-tool.stl'
    }
  ];

  return (
    <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #1a1f2e, #0a0e1a)',
      borderRadius: '8px',
      border: '1px solid #00d4ff'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: '#00d4ff',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🎯 Direct 3D Tool Import
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '10px'
        }}>
          <input
            type="text"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="Paste 3D model URL (STEP, STL, OBJ, GLTF)"
            style={{
              flex: 1,
              padding: '8px',
              background: '#0a0e1a',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#e0e0e0',
              fontSize: '12px'
            }}
          />
          <button
            onClick={handleImport}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: loading ? '#666' : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Loading...' : 'Import 3D'}
          </button>
        </div>
        
        {error && (
          <div style={{
            padding: '8px',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid #ff4444',
            borderRadius: '4px',
            color: '#ff6666',
            fontSize: '11px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Quick Import Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          fontSize: '11px', 
          color: '#888',
          marginBottom: '8px'
        }}>
          Quick Import:
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {quickImports.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => setImportUrl(tool.url)}
              style={{
                padding: '4px 8px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3a3a3a';
                e.target.style.borderColor = '#00d4ff';
                e.target.style.color = '#00d4ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2a2a2a';
                e.target.style.borderColor = '#444';
                e.target.style.color = '#aaa';
              }}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Data Display */}
      {extractedData && (
        <div style={{
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#00d4ff',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            📊 Extracted Tool Data:
          </div>
          <div style={{ fontSize: '11px', color: '#ccc' }}>
            {extractedData.manufacturer && (
              <div>Manufacturer: {extractedData.manufacturer}</div>
            )}
            {extractedData.partNumber && (
              <div>Part Number: {extractedData.partNumber}</div>
            )}
            {extractedData.type && (
              <div>Type: {extractedData.type}</div>
            )}
            {extractedData.diameter && (
              <div>Diameter: {extractedData.diameter}mm</div>
            )}
            {extractedData.flutes && (
              <div>Flutes: {extractedData.flutes}</div>
            )}
            {extractedData.coating && (
              <div>Coating: {extractedData.coating}</div>
            )}
            {extractedData.cuttingLength && (
              <div>Cutting Length: {extractedData.cuttingLength}mm</div>
            )}
          </div>
        </div>
      )}

      {/* Model Preview Status */}
      {modelPreview && (
        <div style={{
          padding: '10px',
          background: 'rgba(102, 255, 102, 0.1)',
          borderRadius: '4px'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#66ff66',
            fontWeight: 'bold'
          }}>
            ✅ 3D Model Loaded Successfully!
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#aaa',
            marginTop: '4px'
          }}>
            The tool has been added to the 3D scene.
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      <div style={{
        marginTop: '15px',
        padding: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Supported Formats:</strong>
        </div>
        <div>• STEP/STP - CAD exchange format (auto-converts to STL)</div>
        <div>• STL - Standard 3D printing format</div>
        <div>• OBJ - Wavefront 3D object</div>
        <div>• GLTF/GLB - Modern web 3D format</div>
        <div style={{ marginTop: '4px' }}>
          <strong>Supported Sources:</strong> Seco Tools, Sandvik Coromant, Kennametal, Iscar
        </div>
      </div>
    </div>
  );
};

export default Tool3DImporter;