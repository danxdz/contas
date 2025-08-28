import React, { useState } from 'react';

const ToolWebCrawler = ({ onToolDataExtracted, onUpdateTool }) => {
  const [url, setUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [error, setError] = useState('');

  // Tool data patterns for different manufacturers
  const extractionPatterns = {
    seco: {
      domain: 'secotools.com',
      patterns: {
        partNumber: [
          /Part\s*(?:Number|No\.?):?\s*([A-Z0-9\-\.]+)/i,
          /Item\s*(?:Number|No\.?):?\s*([A-Z0-9\-\.]+)/i,
          /Product\s*code:?\s*([A-Z0-9\-\.]+)/i
        ],
        diameter: [
          /(?:Cutting\s*)?Diameter:?\s*([\d.]+)\s*mm/i,
          /DC:?\s*([\d.]+)\s*mm/i,
          /⌀\s*([\d.]+)/,
          /D1:?\s*([\d.]+)/i
        ],
        length: [
          /(?:Overall\s*)?Length:?\s*([\d.]+)\s*mm/i,
          /OAL:?\s*([\d.]+)\s*mm/i,
          /L:?\s*([\d.]+)\s*mm/i
        ],
        cuttingLength: [
          /Cutting\s*(?:Edge\s*)?Length:?\s*([\d.]+)\s*mm/i,
          /LOC:?\s*([\d.]+)\s*mm/i,
          /AP:?\s*([\d.]+)\s*mm/i
        ],
        flutes: [
          /(?:Number\s*of\s*)?Flutes:?\s*(\d+)/i,
          /Z:?\s*(\d+)/,
          /(\d+)\s*Flute/i
        ],
        coating: [
          /Coating:?\s*([A-Z\-]+)/i,
          /Grade:?\s*([A-Z0-9\-]+)/i
        ],
        material: [
          /Substrate:?\s*(.+?)(?:\.|$)/i,
          /Material:?\s*(.+?)(?:\.|$)/i
        ]
      }
    },
    sandvik: {
      domain: 'sandvik.coromant.com',
      patterns: {
        partNumber: [/Order\s*code:?\s*([A-Z0-9\-]+)/i],
        diameter: [/Dc:?\s*([\d.]+)/i, /⌀\s*([\d.]+)/],
        length: [/L:?\s*([\d.]+)/i],
        cuttingLength: [/Lc:?\s*([\d.]+)/i],
        flutes: [/zn:?\s*(\d+)/i],
        coating: [/Grade:?\s*([A-Z0-9]+)/i]
      }
    },
    kennametal: {
      domain: 'kennametal.com',
      patterns: {
        partNumber: [/Catalog\s*Number:?\s*([A-Z0-9\-]+)/i],
        diameter: [/Diameter.*?([\d.]+)\s*(?:mm|")/i],
        length: [/Length.*?([\d.]+)\s*(?:mm|")/i],
        flutes: [/Flutes:?\s*(\d+)/i],
        coating: [/Coating:?\s*([A-Z]+)/i]
      }
    },
    walter: {
      domain: 'walter-tools.com',
      patterns: {
        partNumber: [/Article\s*No\.?:?\s*([A-Z0-9\-]+)/i],
        diameter: [/D1:?\s*([\d.]+)/i],
        length: [/L1:?\s*([\d.]+)/i],
        flutes: [/Z:?\s*(\d+)/i]
      }
    },
    iscar: {
      domain: 'iscar.com',
      patterns: {
        partNumber: [/Cat\.\s*No\.?:?\s*([A-Z0-9\-]+)/i],
        diameter: [/D:?\s*([\d.]+)/i],
        length: [/L:?\s*([\d.]+)/i],
        flutes: [/Z:?\s*(\d+)/i]
      }
    }
  };

  // Extract data from webpage content
  const extractFromContent = (content, patterns) => {
    const data = {};
    
    for (const [key, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        const match = content.match(pattern);
        if (match) {
          data[key] = match[1];
          break;
        }
      }
    }
    
    return data;
  };

  // Simulate web crawling (in real app, this would need a backend/proxy)
  const crawlWebsite = async () => {
    setCrawling(true);
    setError('');
    setExtractedData(null);
    
    try {
      // Detect manufacturer from URL
      let manufacturer = null;
      let patterns = null;
      
      for (const [mfg, config] of Object.entries(extractionPatterns)) {
        if (url.includes(config.domain)) {
          manufacturer = mfg;
          patterns = config.patterns;
          break;
        }
      }
      
      if (!manufacturer) {
        throw new Error('Unsupported manufacturer website');
      }

      // In a real implementation, we'd need a backend service or CORS proxy
      // For demo, we'll simulate with example data based on URL patterns
      let simulatedData = {};
      
      // Check if URL contains part number
      const urlParts = url.split('/');
      const possiblePartNumber = urlParts[urlParts.length - 1]
        .replace('.html', '')
        .replace('.aspx', '')
        .replace('.php', '');
      
      if (url.includes('553020SZ3.0-SIRON-A')) {
        simulatedData = {
          partNumber: '553020SZ3.0-SIRON-A',
          manufacturer: 'Seco Tools',
          type: 'Square End Mill',
          diameter: 3.0,
          cuttingLength: 8,
          length: 38,
          flutes: 2,
          coating: 'SIRON-A',
          material: 'Solid Carbide',
          shankDiameter: 3,
          helixAngle: 45,
          description: 'High-performance square end mill for aluminum',
          speeds: {
            aluminum: { sfm: 1200, chipLoad: 0.025 },
            steel: { sfm: 400, chipLoad: 0.015 }
          }
        };
      } else if (url.includes('2P341-0600')) {
        simulatedData = {
          partNumber: '2P341-0600-PA',
          manufacturer: 'Sandvik Coromant',
          type: 'Ball End Mill',
          diameter: 6.0,
          cuttingLength: 12,
          length: 50,
          flutes: 2,
          coating: 'PVD AlTiN',
          material: 'Solid Carbide',
          description: 'CoroMill Plura ball nose end mill'
        };
      } else {
        // Generic extraction based on patterns in URL
        simulatedData = {
          partNumber: possiblePartNumber || 'UNKNOWN',
          manufacturer: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
          type: 'End Mill',
          diameter: 10,
          cuttingLength: 20,
          length: 60,
          flutes: 4,
          coating: 'TiAlN',
          material: 'Carbide'
        };
      }
      
      // Add calculated fields
      simulatedData.cuttingEdgeCount = simulatedData.flutes;
      simulatedData.shankDiameter = simulatedData.shankDiameter || simulatedData.diameter;
      simulatedData.maxDepthOfCut = simulatedData.cuttingLength * 0.5;
      simulatedData.price = Math.round(50 + Math.random() * 200);
      simulatedData.stock = Math.random() > 0.3 ? 'In Stock' : 'On Order';
      simulatedData.url = url;
      
      setExtractedData(simulatedData);
      setEditedData({ ...simulatedData });
      setCrawling(false);
      
      // Auto-notify parent
      if (onToolDataExtracted) {
        onToolDataExtracted(simulatedData);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to extract tool data');
      setCrawling(false);
    }
  };

  // Handle manual editing
  const handleEdit = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited data
  const saveEditedData = () => {
    setExtractedData(editedData);
    setEditMode(false);
    if (onUpdateTool) {
      onUpdateTool(editedData);
    }
  };

  // Quick fill templates for common tools
  const templates = {
    endmill: {
      type: 'End Mill',
      flutes: 4,
      helixAngle: 45,
      coating: 'TiAlN'
    },
    ballmill: {
      type: 'Ball End Mill',
      flutes: 2,
      helixAngle: 30,
      coating: 'AlTiN'
    },
    drill: {
      type: 'Drill',
      flutes: 2,
      pointAngle: 118,
      coating: 'TiN'
    },
    chamfer: {
      type: 'Chamfer Mill',
      flutes: 4,
      angle: 90,
      coating: 'TiCN'
    }
  };

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
        🌐 Web Tool Data Extractor
      </h3>
      
      {/* URL Input */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '10px'
        }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste manufacturer tool page URL..."
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
            onClick={crawlWebsite}
            disabled={crawling || !url}
            style={{
              padding: '8px 16px',
              background: crawling ? '#666' : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: crawling || !url ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {crawling ? 'Extracting...' : 'Extract Data'}
          </button>
        </div>
        
        {/* Supported Sites */}
        <div style={{ 
          fontSize: '10px', 
          color: '#666',
          marginBottom: '8px'
        }}>
          Supported: secotools.com, sandvik.coromant.com, kennametal.com, walter-tools.com, iscar.com
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

      {/* Extracted Data Display */}
      {extractedData && (
        <div style={{
          padding: '15px',
          background: 'rgba(0, 212, 255, 0.05)',
          borderRadius: '4px',
          border: '1px solid #00d4ff'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h4 style={{ 
              margin: 0,
              color: '#00ff88',
              fontSize: '14px'
            }}>
              📊 Extracted Tool Data
            </h4>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: '4px 12px',
                background: editMode ? '#ff8800' : '#333',
                border: '1px solid ' + (editMode ? '#ff8800' : '#555'),
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {editMode ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '12px'
          }}>
            {Object.entries(editMode ? editedData : extractedData).map(([key, value]) => {
              // Skip complex objects for display
              if (typeof value === 'object') return null;
              
              return (
                <div key={key} style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <label style={{ 
                    color: '#888',
                    fontSize: '10px',
                    textTransform: 'capitalize'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {editMode ? (
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={editedData[key]}
                      onChange={(e) => handleEdit(key, 
                        typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                      )}
                      style={{
                        padding: '4px',
                        background: '#0a0e1a',
                        border: '1px solid #333',
                        borderRadius: '3px',
                        color: '#e0e0e0',
                        fontSize: '11px'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      color: '#00d4ff',
                      fontWeight: '500'
                    }}>
                      {value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {editMode && (
            <div style={{ 
              marginTop: '15px',
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={saveEditedData}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditedData({ ...extractedData });
                  setEditMode(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Templates */}
      {!extractedData && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            fontSize: '11px', 
            color: '#888',
            marginBottom: '8px'
          }}>
            Quick Templates:
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {Object.entries(templates).map(([type, template]) => (
              <button
                key={type}
                onClick={() => {
                  const data = {
                    ...template,
                    partNumber: `CUSTOM-${type.toUpperCase()}-001`,
                    manufacturer: 'Custom',
                    diameter: 10,
                    cuttingLength: 20,
                    length: 60,
                    material: 'Carbide'
                  };
                  setExtractedData(data);
                  setEditedData(data);
                  if (onToolDataExtracted) {
                    onToolDataExtracted(data);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  textTransform: 'capitalize'
                }}
              >
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload for STEP/STL */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px'
      }}>
        <div style={{ 
          fontSize: '11px', 
          color: '#888',
          marginBottom: '8px'
        }}>
          Or upload 3D file from PC:
        </div>
        <input
          type="file"
          accept=".step,.stp,.stl,.obj,.gltf,.glb"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // Extract basic info from filename
              const fileName = file.name.replace(/\.[^/.]+$/, '');
              const data = {
                partNumber: fileName,
                manufacturer: 'Imported',
                type: 'End Mill',
                diameter: 10,
                cuttingLength: 20,
                length: 60,
                flutes: 4,
                material: 'Carbide',
                coating: 'TiAlN',
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(2) + ' KB'
              };
              
              setExtractedData(data);
              setEditedData(data);
              setEditMode(true); // Auto-enter edit mode for manual adjustment
              
              // Handle 3D file separately if needed
              if (window.handle3DFile) {
                window.handle3DFile(file);
              }
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1a1f2e',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#888',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

export default ToolWebCrawler;