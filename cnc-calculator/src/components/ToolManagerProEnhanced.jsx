import React, { useState, useEffect, useRef } from 'react';
import ModularToolSystemV2 from './ModularToolSystemV2';
import AssemblyCard from './AssemblyCard';

const ToolManagerProEnhanced = ({ 
  onToolSelect, 
  onAssemblyCreate,
  activeAssemblies = [],
  onAssemblySelect,
  onAssemblyDelete
}) => {
  const [viewMode, setViewMode] = useState('assemblies');
  const [assemblies, setAssemblies] = useState(activeAssemblies);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAssembly, setEditingAssembly] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('calculator');
  const [isCompactView, setIsCompactView] = useState(false);

  // Cutting parameters state
  const [cuttingParams, setCuttingParams] = useState({
    material: 'steel',
    hardness: 'HRC30',
    operation: 'roughing',
    doc: 5, // Depth of cut
    woc: 10, // Width of cut
    coolant: 'flood'
  });

  // Load saved assemblies
  useEffect(() => {
    const saved = localStorage.getItem('toolAssemblies');
    if (saved) {
      setAssemblies(JSON.parse(saved));
    }
  }, []);
  
  // Listen for stickout updates from 3D interaction
  useEffect(() => {
    const handleStickoutUpdate = (event) => {
      const { id, stickout } = event.detail;
      updateStickout(id, stickout);
    };
    
    window.addEventListener('updateStickout', handleStickoutUpdate);
    return () => {
      window.removeEventListener('updateStickout', handleStickoutUpdate);
    };
  }, []);

  // Save assemblies
  useEffect(() => {
    if (assemblies.length > 0) {
      localStorage.setItem('toolAssemblies', JSON.stringify(assemblies));
    }
  }, [assemblies]);

  // Handle assembly creation
  const handleAssemblyCreate = (assembly) => {
    const newAssembly = {
      ...assembly,
      id: Date.now(),
      tNumber: `T${assemblies.length + 1}`,
      inUse: false,
      lastUsed: null,
      usageCount: 0,
      notes: '',
      wearLevel: 0,
      totalCuttingTime: 0,
      created: new Date().toISOString()
    };
    
    const updatedAssemblies = [...assemblies, newAssembly];
    setAssemblies(updatedAssemblies);
    
    if (onAssemblyCreate) {
      onAssemblyCreate(newAssembly);
    }
    
    setViewMode('assemblies');
    setSelectedAssembly(newAssembly);
  };

  // Edit assembly
  const editAssembly = (assembly) => {
    setEditingAssembly(assembly);
    setViewMode('builder');
  };

  // Duplicate assembly
  const duplicateAssembly = (assembly) => {
    const duplicate = {
      ...assembly,
      id: Date.now(),
      tNumber: `T${assemblies.length + 1}`,
      name: `${assembly.name || 'Assembly'} (Copy)`,
      inUse: false,
      usageCount: 0,
      wearLevel: 0,
      totalCuttingTime: 0,
      created: new Date().toISOString()
    };
    
    const updatedAssemblies = [...assemblies, duplicate];
    setAssemblies(updatedAssemblies);
    setSelectedAssembly(duplicate);
  };

  // Select assembly
  const selectAssembly = (assembly) => {
    setSelectedAssembly(assembly);
    
    const updated = assemblies.map(a => ({
      ...a,
      inUse: a.id === assembly.id,
      lastUsed: a.id === assembly.id ? new Date().toISOString() : a.lastUsed,
      usageCount: a.id === assembly.id ? a.usageCount + 1 : a.usageCount
    }));
    setAssemblies(updated);
    
    if (onAssemblySelect) {
      onAssemblySelect(assembly);
    }
  };

  // Delete assembly
  const deleteAssembly = (id) => {
    if (confirm('Delete this tool assembly?')) {
      setAssemblies(assemblies.filter(a => a.id !== id));
      if (selectedAssembly?.id === id) {
        setSelectedAssembly(null);
      }
      if (onAssemblyDelete) {
        onAssemblyDelete(id);
      }
    }
  };

  // Update wear level
  const updateWearLevel = (id, wearLevel) => {
    setAssemblies(assemblies.map(a => 
      a.id === id ? { ...a, wearLevel } : a
    ));
  };

  // Update stickout
  const updateStickout = (id, stickout) => {
    const updatedAssemblies = assemblies.map(a => {
      if (a.id === id) {
        return {
          ...a,
          stickout,
          components: {
            ...a.components,
            tool: {
              ...a.components.tool,
              stickout
            }
          }
        };
      }
      return a;
    });
    
    setAssemblies(updatedAssemblies);
    
    // If this is the selected assembly, trigger offset table update
    if (selectedAssembly?.id === id) {
      const updatedAssembly = updatedAssemblies.find(a => a.id === id);
      if (updatedAssembly && onAssemblySelect) {
        // Trigger the offset table update by calling onAssemblySelect
        onAssemblySelect(updatedAssembly);
        setSelectedAssembly(updatedAssembly);
      }
    }
  };

  // Calculate cutting parameters
  const calculateCuttingParams = () => {
    if (!selectedAssembly?.components?.tool) return null;
    
    const tool = selectedAssembly.components.tool;
    const diameter = tool.diameter || 10;
    const flutes = tool.flutes || 2;
    
    // Material factors
    const materialFactors = {
      aluminum: { vc: 300, fz: 0.15, power: 0.7 },
      steel: { vc: 80, fz: 0.08, power: 1.2 },
      stainless: { vc: 60, fz: 0.06, power: 1.4 },
      titanium: { vc: 40, fz: 0.05, power: 1.6 },
      plastic: { vc: 400, fz: 0.2, power: 0.5 }
    };
    
    const factor = materialFactors[cuttingParams.material] || materialFactors.steel;
    
    // Calculate RPM
    const rpm = Math.round((factor.vc * 1000) / (Math.PI * diameter));
    
    // Calculate feed
    const feedPerTooth = cuttingParams.operation === 'finishing' ? factor.fz * 0.6 : factor.fz;
    const feedRate = Math.round(rpm * feedPerTooth * flutes);
    
    // Calculate power
    const mrr = (cuttingParams.doc * cuttingParams.woc * feedRate) / 1000; // Material removal rate
    const power = Math.round(mrr * factor.power * 10) / 10;
    
    // Calculate tool life
    const toolLife = Math.round(100 / (factor.power * (cuttingParams.doc / 5)));
    
    return {
      rpm: Math.min(rpm, selectedAssembly.maxRPM || 20000),
      feedRate,
      feedPerTooth,
      power,
      mrr: Math.round(mrr * 10) / 10,
      toolLife,
      chipLoad: Math.round(feedPerTooth * 1000) / 1000
    };
  };

  const cuttingResults = calculateCuttingParams();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      background: '#0a0e1a',
      color: '#e0e0e0',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Tool Management */}
      <div style={{
        flex: '1 1 65%',
        minWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '2px solid #1a1f2e',
        overflow: 'hidden'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #00d4ff',
          background: '#1a1f2e',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex' }}>
          <button
            onClick={() => setViewMode('assemblies')}
            style={{
              padding: '12px 20px',
              background: viewMode === 'assemblies' ? '#00d4ff' : 'transparent',
              color: viewMode === 'assemblies' ? '#000' : '#888',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewMode === 'assemblies' ? 'bold' : 'normal'
            }}
          >
            📦 My Assemblies
          </button>
          <button
            onClick={() => setViewMode('builder')}
            style={{
              padding: '12px 20px',
              background: viewMode === 'builder' ? '#00d4ff' : 'transparent',
              color: viewMode === 'builder' ? '#000' : '#888',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewMode === 'builder' ? 'bold' : 'normal'
            }}
          >
            🔨 Build New
          </button>
          <button
            onClick={() => setViewMode('library')}
            style={{
              padding: '12px 20px',
              background: viewMode === 'library' ? '#00d4ff' : 'transparent',
              color: viewMode === 'library' ? '#000' : '#888',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewMode === 'library' ? 'bold' : 'normal'
            }}
          >
            📚 Component Library
          </button>
          </div>
          
          {/* View Toggle */}
          <button
            onClick={() => setIsCompactView(!isCompactView)}
            style={{
              padding: '8px 15px',
              background: 'transparent',
              color: '#888',
              border: '1px solid #333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '10px'
            }}
            title={isCompactView ? "Expand View" : "Compact View"}
          >
            {isCompactView ? '⬜ Expand' : '▣ Compact'}
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '15px',
          maxHeight: 'calc(100% - 50px)'
        }}>
          {/* Assemblies View */}
          {viewMode === 'assemblies' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Search */}
              <input
                type="text"
                placeholder="Search assemblies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1a1f2e',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  marginBottom: '15px'
                }}
              />

              {/* Assembly List */}
              <div style={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'auto',
                paddingRight: '10px'
              }}>
                {assemblies
                  .filter(a => !searchTerm || 
                    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.tNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(assembly => (
                    <AssemblyCard
                      key={assembly.id}
                      assembly={assembly}
                      isSelected={selectedAssembly?.id === assembly.id}
                      onSelect={selectAssembly}
                      onEdit={editAssembly}
                      onDuplicate={duplicateAssembly}
                      onDelete={deleteAssembly}
                      onUpdateWear={updateWearLevel}
                      onUpdateStickout={updateStickout}
                    />
                  ))}
              </div>

              {assemblies.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  No tool assemblies yet.
                  <br />
                  <button
                    onClick={() => setViewMode('builder')}
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Create First Assembly
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Builder View */}
          {viewMode === 'builder' && (
            <ModularToolSystemV2 
              onAssemblyCreate={handleAssemblyCreate}
              editingAssembly={editingAssembly}
            />
          )}

          {/* Library View */}
          {viewMode === 'library' && (
            <div style={{ padding: '15px' }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Component Library
              </h3>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Browse available tools, holders, and accessories
              </p>
              {/* Component library content would go here */}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Utilities */}
      {!isCompactView && (
      <div style={{
        flex: '1 1 35%',
        minWidth: '400px',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f1420',
        overflow: 'hidden'
      }}>
        {/* Right Panel Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #333',
          background: '#1a1f2e'
        }}>
          <button
            onClick={() => setRightPanelTab('calculator')}
            style={{
              padding: '10px 15px',
              background: rightPanelTab === 'calculator' ? '#2a3f5f' : 'transparent',
              color: rightPanelTab === 'calculator' ? '#00d4ff' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🧮 Calculator
          </button>
          <button
            onClick={() => setRightPanelTab('wear')}
            style={{
              padding: '10px 15px',
              background: rightPanelTab === 'wear' ? '#2a3f5f' : 'transparent',
              color: rightPanelTab === 'wear' ? '#00d4ff' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊 Wear Track
          </button>
          <button
            onClick={() => setRightPanelTab('notes')}
            style={{
              padding: '10px 15px',
              background: rightPanelTab === 'notes' ? '#2a3f5f' : 'transparent',
              color: rightPanelTab === 'notes' ? '#00d4ff' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📝 Notes
          </button>
          <button
            onClick={() => setRightPanelTab('compare')}
            style={{
              padding: '10px 15px',
              background: rightPanelTab === 'compare' ? '#2a3f5f' : 'transparent',
              color: rightPanelTab === 'compare' ? '#00d4ff' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ⚖️ Compare
          </button>
        </div>

        {/* Right Panel Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
          {/* Cutting Parameters Calculator */}
          {rightPanelTab === 'calculator' && (
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Cutting Parameters Calculator
              </h3>
              
              {selectedAssembly ? (
                <>
                  {/* Input Parameters */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>Material</span>
                      <select
                        value={cuttingParams.material}
                        onChange={(e) => setCuttingParams({...cuttingParams, material: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: '#1a1f2e',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          marginTop: '5px'
                        }}
                      >
                        <option value="aluminum">Aluminum</option>
                        <option value="steel">Steel</option>
                        <option value="stainless">Stainless Steel</option>
                        <option value="titanium">Titanium</option>
                        <option value="plastic">Plastic</option>
                      </select>
                    </label>

                    <label style={{ display: 'block', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>Operation</span>
                      <select
                        value={cuttingParams.operation}
                        onChange={(e) => setCuttingParams({...cuttingParams, operation: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: '#1a1f2e',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          marginTop: '5px'
                        }}
                      >
                        <option value="roughing">Roughing</option>
                        <option value="finishing">Finishing</option>
                        <option value="slotting">Slotting</option>
                      </select>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label>
                        <span style={{ fontSize: '12px', color: '#888' }}>DOC (mm)</span>
                        <input
                          type="number"
                          value={cuttingParams.doc}
                          onChange={(e) => setCuttingParams({...cuttingParams, doc: parseFloat(e.target.value)})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#1a1f2e',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            marginTop: '5px'
                          }}
                        />
                      </label>
                      <label>
                        <span style={{ fontSize: '12px', color: '#888' }}>WOC (mm)</span>
                        <input
                          type="number"
                          value={cuttingParams.woc}
                          onChange={(e) => setCuttingParams({...cuttingParams, woc: parseFloat(e.target.value)})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#1a1f2e',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            marginTop: '5px'
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Results */}
                  {cuttingResults && (
                    <div style={{
                      padding: '15px',
                      background: 'linear-gradient(135deg, #1a3f3e, #1a1f2e)',
                      borderRadius: '8px',
                      border: '1px solid #00ff88'
                    }}>
                      <h4 style={{ color: '#00ff88', marginBottom: '15px' }}>
                        Recommended Parameters
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Spindle Speed</div>
                          <div style={{ fontSize: '20px', color: '#00d4ff', fontWeight: 'bold' }}>
                            {cuttingResults.rpm} RPM
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Feed Rate</div>
                          <div style={{ fontSize: '20px', color: '#00d4ff', fontWeight: 'bold' }}>
                            {cuttingResults.feedRate} mm/min
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Chip Load</div>
                          <div style={{ fontSize: '20px', color: '#ffaa00', fontWeight: 'bold' }}>
                            {cuttingResults.chipLoad} mm/tooth
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>MRR</div>
                          <div style={{ fontSize: '20px', color: '#ffaa00', fontWeight: 'bold' }}>
                            {cuttingResults.mrr} cm³/min
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Power Required</div>
                          <div style={{ fontSize: '20px', color: '#ff88ff', fontWeight: 'bold' }}>
                            {cuttingResults.power} kW
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Tool Life</div>
                          <div style={{ fontSize: '20px', color: '#00ff88', fontWeight: 'bold' }}>
                            ~{cuttingResults.toolLife} min
                          </div>
                        </div>
                      </div>

                      {/* G-code snippet */}
                      <div style={{ marginTop: '15px' }}>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>
                          G-Code Template
                        </div>
                        <div style={{
                          padding: '10px',
                          background: '#0a0e1a',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#00ff88'
                        }}>
                          {selectedAssembly.tNumber} M6<br/>
                          S{cuttingResults.rpm} M3<br/>
                          G43 H{selectedAssembly.tNumber.replace('T', '')}<br/>
                          F{cuttingResults.feedRate}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#666'
                }}>
                  Select a tool assembly to calculate cutting parameters
                </div>
              )}
            </div>
          )}

          {/* Wear Tracking */}
          {rightPanelTab === 'wear' && selectedAssembly && (
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Tool Wear Tracking
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>
                  Current Wear Level: {selectedAssembly.wearLevel || 0}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedAssembly.wearLevel || 0}
                  onChange={(e) => updateWearLevel(selectedAssembly.id, parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '10px' }}
                />
              </div>

              <div style={{
                padding: '15px',
                background: '#1a1f2e',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                  Wear Indicators
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '13px' }}>Excessive vibration</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '13px' }}>Poor surface finish</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '13px' }}>Increased cutting forces</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '13px' }}>Visible tool damage</span>
                  </label>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedAssembly.wearLevel > 80 ? '#ff4444' : '#2a3f5f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {selectedAssembly.wearLevel > 80 ? 'Replace Tool' : 'Log Inspection'}
              </button>
            </div>
          )}

          {/* Notes */}
          {rightPanelTab === 'notes' && selectedAssembly && (
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Assembly Notes
              </h3>
              <textarea
                value={selectedAssembly.notes || ''}
                onChange={(e) => {
                  const updated = assemblies.map(a => 
                    a.id === selectedAssembly.id ? 
                    { ...a, notes: e.target.value } : a
                  );
                  setAssemblies(updated);
                  setSelectedAssembly({ ...selectedAssembly, notes: e.target.value });
                }}
                placeholder="Add notes about this tool assembly..."
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '10px',
                  background: '#1a1f2e',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Compare Tools */}
          {rightPanelTab === 'compare' && (
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>
                Compare Assemblies
              </h3>
              <p style={{ color: '#666', fontSize: '12px' }}>
                Select 2+ assemblies to compare specifications
              </p>
              {/* Comparison table would go here */}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ToolManagerProEnhanced;