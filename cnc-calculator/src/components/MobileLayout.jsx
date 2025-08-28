import React, { useState } from 'react';
import GCodeEditor from './GCodeEditor';
import ToolManager from './ToolManager';
import ProfessionalToolSystem from './ProfessionalToolSystem';
import ToolOffsetTable from './ToolOffsetTable';

const MobileLayout = ({ 
  project, 
  setProject,
  simulation,
  setSimulation,
  toolDatabase,
  setToolDatabase,
  toolAssemblies,
  setToolAssemblies,
  toolOffsetTable,
  setToolOffsetTable,
  setupConfig,
  setSetupConfig
}) => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [expandedPanel, setExpandedPanel] = useState(null);

  const tabs = [
    { id: 'viewer', label: '3D', icon: '🎯' },
    { id: 'gcode', label: 'Code', icon: '📝' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'setup', label: 'Setup', icon: '⚙️' },
    { id: 'more', label: 'More', icon: '☰' }
  ];

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0e1a'
    }}>
      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {activeTab === 'viewer' && (
          <div style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}>
            {/* 3D viewer will be rendered here by parent */}
            <div className="viewport-3d" style={{ width: '100%', height: '100%' }} />
            
            {/* Floating controls */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <button
                onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(0, 212, 255, 0.9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {simulation.isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              
              <div style={{
                padding: '10px 15px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#00ff88',
                borderRadius: '20px',
                fontSize: '12px'
              }}>
                Line: {simulation.currentLine + 1}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gcode' && (
          <div style={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0a1520'
          }}>
            <GCodeEditor 
              gcode={project.gcode}
              onChange={(gcode) => setProject(prev => ({ ...prev, gcode }))}
              currentLine={simulation.currentLine}
            />
          </div>
        )}

        {activeTab === 'tools' && (
          <div style={{ 
            height: '100%',
            overflow: 'auto'
          }}>
            {expandedPanel === 'professional' ? (
              <ProfessionalToolSystem 
                onToolAssemblyChange={(assembly) => {
                  setToolAssemblies(prev => [...prev, assembly]);
                  setSimulation(prev => ({
                    ...prev,
                    toolAssembly: assembly,
                    currentToolLength: assembly.totalLength
                  }));
                  if (window.updateTool3D) {
                    window.updateTool3D(assembly);
                  }
                }}
              />
            ) : expandedPanel === 'offsets' ? (
              <ToolOffsetTable 
                offsetTable={toolOffsetTable}
                setOffsetTable={setToolOffsetTable}
                activeHCode={simulation.activeHCode}
                activeDCode={simulation.activeDCode}
              />
            ) : (
              <div style={{ padding: '15px' }}>
                <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Tool Management</h3>
                
                <div 
                  onClick={() => setExpandedPanel('professional')}
                  style={{
                    padding: '20px',
                    marginBottom: '15px',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,153,204,0.1))',
                    borderRadius: '10px',
                    border: '1px solid #00d4ff',
                    cursor: 'pointer'
                  }}
                >
                  <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>
                    🛠️ Professional Tool System
                  </h4>
                  <p style={{ color: '#888', fontSize: '12px' }}>
                    Import real tools from manufacturers, build assemblies with ISO/DIN holders
                  </p>
                </div>

                <div 
                  onClick={() => setExpandedPanel('offsets')}
                  style={{
                    padding: '20px',
                    marginBottom: '15px',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,153,204,0.1))',
                    borderRadius: '10px',
                    border: '1px solid #00d4ff',
                    cursor: 'pointer'
                  }}
                >
                  <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>
                    📊 Tool Offset Table
                  </h4>
                  <p style={{ color: '#888', fontSize: '12px' }}>
                    Manage H/D codes, length and diameter compensations
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  background: '#1a1f2e',
                  borderRadius: '10px',
                  border: '1px solid #333'
                }}>
                  <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '14px' }}>
                    Quick Tools
                  </h4>
                  <ToolManager 
                    tools={toolDatabase}
                    onChange={setToolDatabase}
                    assemblies={toolAssemblies}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'setup' && (
          <div style={{ 
            height: '100%',
            overflow: 'auto',
            padding: '15px'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>Setup Configuration</h3>
            
            {/* Work Offsets */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#1a1f2e',
              borderRadius: '10px'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '15px', fontSize: '14px' }}>
                Work Offsets (G54-G59)
              </h4>
              <select
                value={setupConfig.workOffsets.activeOffset}
                onChange={(e) => setSetupConfig(prev => ({
                  ...prev,
                  workOffsets: { ...prev.workOffsets, activeOffset: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '15px',
                  background: '#0a1520',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '5px'
                }}
              >
                {['G54', 'G55', 'G56', 'G57', 'G58', 'G59'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis}>
                    <label style={{ fontSize: '11px', color: '#888' }}>{axis.toUpperCase()}</label>
                    <input
                      type="number"
                      value={setupConfig.workOffsets[setupConfig.workOffsets.activeOffset][axis]}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setSetupConfig(prev => ({
                          ...prev,
                          workOffsets: {
                            ...prev.workOffsets,
                            [prev.workOffsets.activeOffset]: {
                              ...prev.workOffsets[prev.workOffsets.activeOffset],
                              [axis]: value
                            }
                          }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#0a1520',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Setup */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#1a1f2e',
              borderRadius: '10px'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '15px', fontSize: '14px' }}>
                Stock Dimensions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888' }}>Length (X)</label>
                  <input
                    type="number"
                    defaultValue="150"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#0a1520',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888' }}>Width (Y)</label>
                  <input
                    type="number"
                    defaultValue="100"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#0a1520',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888' }}>Height (Z)</label>
                  <input
                    type="number"
                    defaultValue="50"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#0a1520',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div style={{ 
            height: '100%',
            overflow: 'auto',
            padding: '15px'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>More Tools</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {[
                { label: 'Feeds & Speeds', icon: '⚡' },
                { label: 'Tool Life Calculator', icon: '⏱️' },
                { label: 'Power & Torque', icon: '💪' },
                { label: 'Circular Interpolation', icon: '⭕' },
                { label: 'Pocket Wizard', icon: '🔲' },
                { label: 'Machine Config', icon: '🏭' }
              ].map(item => (
                <button
                  key={item.label}
                  style={{
                    padding: '15px',
                    background: '#1a1f2e',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    textAlign: 'left',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        display: 'flex',
        background: '#1a1f2e',
        borderTop: '1px solid #333',
        height: '60px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setExpandedPanel(null);
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: activeTab === tab.id ? '#00d4ff' : 'transparent',
              color: activeTab === tab.id ? '#000' : '#888',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Back button for expanded panels */}
      {expandedPanel && (
        <button
          onClick={() => setExpandedPanel(null)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            padding: '10px 15px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '20px',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default MobileLayout;