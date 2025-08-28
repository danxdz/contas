import React, { useState, useEffect } from 'react';
import ModularToolSystemV2 from './ModularToolSystemV2';

const ToolManagerPro = ({ 
  onToolSelect, 
  onAssemblyCreate,
  activeAssemblies = [],
  onAssemblySelect,
  onAssemblyDelete
}) => {
  const [viewMode, setViewMode] = useState('assemblies'); // 'assemblies', 'builder', 'library'
  const [assemblies, setAssemblies] = useState(activeAssemblies);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load saved assemblies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolAssemblies');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAssemblies(parsed);
    }
  }, []);

  // Save assemblies to localStorage
  useEffect(() => {
    if (assemblies.length > 0) {
      localStorage.setItem('toolAssemblies', JSON.stringify(assemblies));
    }
  }, [assemblies]);

  // Handle new assembly creation from ModularToolSystem
  const handleAssemblyCreate = (assembly) => {
    const newAssembly = {
      ...assembly,
      tNumber: `T${assemblies.length + 1}`,
      inUse: false,
      lastUsed: null,
      usageCount: 0,
      notes: ''
    };
    
    const updatedAssemblies = [...assemblies, newAssembly];
    setAssemblies(updatedAssemblies);
    
    if (onAssemblyCreate) {
      onAssemblyCreate(newAssembly);
    }
    
    // Auto-switch to assemblies view
    setViewMode('assemblies');
    setSelectedAssembly(newAssembly);
  };

  // Select assembly for use
  const selectAssembly = (assembly) => {
    setSelectedAssembly(assembly);
    
    // Update usage stats
    const updated = assemblies.map(a => {
      if (a.id === assembly.id) {
        return {
          ...a,
          lastUsed: new Date().toISOString(),
          usageCount: a.usageCount + 1,
          inUse: true
        };
      }
      return { ...a, inUse: false };
    });
    setAssemblies(updated);
    
    if (onAssemblySelect) {
      onAssemblySelect(assembly);
    }
  };

  // Delete assembly
  const deleteAssembly = (id) => {
    const updated = assemblies.filter(a => a.id !== id);
    setAssemblies(updated);
    
    if (selectedAssembly?.id === id) {
      setSelectedAssembly(null);
    }
    
    if (onAssemblyDelete) {
      onAssemblyDelete(id);
    }
  };

  // Calculate assembly specs
  const getAssemblySpecs = (assembly) => {
    if (!assembly?.components) return {};
    
    const { tool, holder, collet, extension } = assembly.components;
    
    return {
      cuttingDiameter: tool?.diameter || 0,
      cuttingLength: tool?.cuttingLength || 0,
      flutes: tool?.flutes || 0,
      maxRPM: assembly.maxRPM || 0,
      totalLength: assembly.totalLength || 0,
      holderType: holder || 'None',
      colletType: collet || 'None',
      extensionLength: extension?.length || 0,
      coating: tool?.coating || 'None',
      substrate: tool?.substrate || 'Carbide'
    };
  };

  // Filter assemblies
  const filteredAssemblies = assemblies.filter(assembly => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      assembly.name?.toLowerCase().includes(searchLower) ||
      assembly.tNumber?.toLowerCase().includes(searchLower) ||
      assembly.components?.tool?.partNumber?.toLowerCase().includes(searchLower) ||
      assembly.components?.holder?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0e1a',
      color: '#e0e0e0'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        background: 'linear-gradient(135deg, #1a1f2e, #0a0e1a)',
        borderBottom: '2px solid #00d4ff'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#00d4ff',
          fontSize: '18px',
          marginBottom: '10px'
        }}>
          🔧 Professional Tool Manager
        </h3>
        
        {/* View Mode Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '5px'
        }}>
          <button
            onClick={() => setViewMode('assemblies')}
            style={{
              flex: 1,
              padding: '8px',
              background: viewMode === 'assemblies' ? '#00d4ff' : '#333',
              color: viewMode === 'assemblies' ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px 0 0 4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: viewMode === 'assemblies' ? 'bold' : 'normal'
            }}
          >
            📦 My Assemblies ({assemblies.length})
          </button>
          <button
            onClick={() => setViewMode('builder')}
            style={{
              flex: 1,
              padding: '8px',
              background: viewMode === 'builder' ? '#00d4ff' : '#333',
              color: viewMode === 'builder' ? '#000' : '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: viewMode === 'builder' ? 'bold' : 'normal'
            }}
          >
            🔨 Build New Assembly
          </button>
          <button
            onClick={() => setViewMode('library')}
            style={{
              flex: 1,
              padding: '8px',
              background: viewMode === 'library' ? '#00d4ff' : '#333',
              color: viewMode === 'library' ? '#000' : '#fff',
              border: 'none',
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: viewMode === 'library' ? 'bold' : 'normal'
            }}
          >
            📚 Component Library
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Assemblies View */}
        {viewMode === 'assemblies' && (
          <div style={{ padding: '15px' }}>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search assemblies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '15px',
                background: '#1a1f2e',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#e0e0e0',
                fontSize: '12px'
              }}
            />

            {/* Assembly List */}
            {filteredAssemblies.length > 0 ? (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '10px'
              }}>
                {filteredAssemblies.map(assembly => {
                  const specs = getAssemblySpecs(assembly);
                  const isSelected = selectedAssembly?.id === assembly.id;
                  
                  return (
                    <div
                      key={assembly.id}
                      style={{
                        padding: '15px',
                        background: isSelected ? '#1a3a4a' : '#1a1f2e',
                        border: isSelected ? '2px solid #00d4ff' : '1px solid #333',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedAssembly(assembly)}
                    >
                      {/* Assembly Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <span style={{ 
                            color: '#00d4ff', 
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {assembly.tNumber}
                          </span>
                          {assembly.inUse && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              background: '#00ff88',
                              color: '#000',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              IN USE
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAssembly(assembly.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Tool Info */}
                      {assembly.components?.tool && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ 
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {assembly.components.tool.partNumber}
                          </div>
                          <div style={{ 
                            color: '#888',
                            fontSize: '11px'
                          }}>
                            {assembly.components.tool.series} - {assembly.components.tool.type}
                          </div>
                        </div>
                      )}

                      {/* Specs Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '5px',
                        fontSize: '11px',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <span style={{ color: '#666' }}>Diameter: </span>
                          <span style={{ color: '#ffaa00' }}>
                            Ø{specs.cuttingDiameter}mm
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Flutes: </span>
                          <span style={{ color: '#ffaa00' }}>
                            {specs.flutes}FL
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Length: </span>
                          <span style={{ color: '#ffaa00' }}>
                            {specs.totalLength}mm
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Max RPM: </span>
                          <span style={{ color: '#ffaa00' }}>
                            {specs.maxRPM}
                          </span>
                        </div>
                      </div>

                      {/* Components */}
                      <div style={{
                        padding: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#666'
                      }}>
                        <div>Holder: {specs.holderType}</div>
                        {specs.colletType !== 'None' && (
                          <div>Collet: {specs.colletType}</div>
                        )}
                        {specs.extensionLength > 0 && (
                          <div>Extension: {specs.extensionLength}mm</div>
                        )}
                        <div>Coating: {specs.coating}</div>
                      </div>

                      {/* Usage Stats */}
                      {assembly.usageCount > 0 && (
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid #333',
                          fontSize: '10px',
                          color: '#555'
                        }}>
                          Used {assembly.usageCount} times
                          {assembly.lastUsed && (
                            <span> • Last: {new Date(assembly.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAssembly(assembly);
                          }}
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '8px',
                            background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          Use This Assembly
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                {searchTerm ? 
                  'No assemblies found matching your search' : 
                  'No tool assemblies created yet. Click "Build New Assembly" to get started.'
                }
              </div>
            )}
          </div>
        )}

        {/* Builder View */}
        {viewMode === 'builder' && (
          <ModularToolSystemV2 onAssemblyCreate={handleAssemblyCreate} />
        )}

        {/* Library View */}
        {viewMode === 'library' && (
          <div style={{ padding: '15px' }}>
            <div style={{
              padding: '20px',
              background: '#1a1f2e',
              borderRadius: '8px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Component Library Quick Stats
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  padding: '15px',
                  background: 'rgba(0,212,255,0.1)',
                  borderRadius: '6px',
                  border: '1px solid #00d4ff'
                }}>
                  <div style={{ fontSize: '24px', color: '#00d4ff', fontWeight: 'bold' }}>
                    45+
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Cutting Tools
                  </div>
                </div>
                <div style={{
                  padding: '15px',
                  background: 'rgba(255,170,0,0.1)',
                  borderRadius: '6px',
                  border: '1px solid #ffaa00'
                }}>
                  <div style={{ fontSize: '24px', color: '#ffaa00', fontWeight: 'bold' }}>
                    12
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Holder Types
                  </div>
                </div>
                <div style={{
                  padding: '15px',
                  background: 'rgba(0,255,136,0.1)',
                  borderRadius: '6px',
                  border: '1px solid #00ff88'
                }}>
                  <div style={{ fontSize: '24px', color: '#00ff88', fontWeight: 'bold' }}>
                    6
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Collet Systems
                  </div>
                </div>
                <div style={{
                  padding: '15px',
                  background: 'rgba(136,136,255,0.1)',
                  borderRadius: '6px',
                  border: '1px solid #8888ff'
                }}>
                  <div style={{ fontSize: '24px', color: '#8888ff', fontWeight: 'bold' }}>
                    7
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Extension Lengths
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '30px', color: '#666', fontSize: '12px' }}>
                Components from: Sandvik Coromant, Seco Tools, Kennametal, Walter, Iscar
              </div>
              
              <button
                onClick={() => setViewMode('builder')}
                style={{
                  marginTop: '20px',
                  padding: '10px 30px',
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Go to Assembly Builder →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '10px 15px',
        background: '#0a0e1a',
        borderTop: '1px solid #333',
        fontSize: '11px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          Total Assemblies: {assemblies.length} | 
          In Use: {assemblies.filter(a => a.inUse).length}
        </div>
        {selectedAssembly && (
          <div style={{ color: '#00d4ff' }}>
            Selected: {selectedAssembly.tNumber} - {selectedAssembly.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolManagerPro;