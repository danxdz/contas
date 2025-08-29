import React from 'react';

export const MobileToolbar = () => (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(to top, #0a0e1a, rgba(10,14,26,0.95))',
    borderTop: '1px solid #00d4ff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    padding: '0 10px'
  }}>
    <button 
      onClick={() => setActiveMobilePanel(activeMobilePanel === 'gcode' ? null : 'gcode')}
      style={{
        background: activeMobilePanel === 'gcode' ? '#00d4ff' : 'transparent',
        color: activeMobilePanel === 'gcode' ? '#000' : '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '20px'
      }}
    >
      📝
    </button>
    
    <button 
      onClick={() => setActiveMobilePanel(activeMobilePanel === 'tools' ? null : 'tools')}
      style={{
        background: activeMobilePanel === 'tools' ? '#00d4ff' : 'transparent',
        color: activeMobilePanel === 'tools' ? '#000' : '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '20px'
      }}
    >
      🔧
    </button>
    
    <button 
      onClick={() => setMobileBottomSheet(!mobileBottomSheet)}
      style={{
        background: mobileBottomSheet ? '#00d4ff' : 'transparent',
        color: mobileBottomSheet ? '#000' : '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '20px'
      }}
    >
      ⚡
    </button>
  </div>
);

export const MobileMenu = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  menuStructure, 
  handleMenuAction 
}) => (
  <>
    {mobileMenuOpen && (
      <div 
        onClick={() => setMobileMenuOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 2000
        }}
      />
    )}
    
    <div style={{
      position: 'fixed',
      left: mobileMenuOpen ? 0 : '-80%',
      top: 0,
      bottom: 0,
      width: '80%',
      background: '#0a0e1a',
      borderRight: '1px solid #00d4ff',
      transition: 'left 0.3s ease',
      zIndex: 2001,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#00d4ff', margin: 0 }}>Menu</h2>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      {Object.entries(menuStructure).map(([key, menu]) => (
        <div key={key} style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            color: '#00d4ff', 
            fontSize: '14px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            {menu.label}
          </h3>
          {menu.items.map((item, idx) => (
            item.divider ? (
              <div key={idx} style={{
                height: '1px',
                background: '#333',
                margin: '10px 0'
              }} />
            ) : (
              <button
                key={item.id}
                onClick={() => {
                  handleMenuAction(item);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '5px'
                }}
              >
                {item.label}
              </button>
            )
          ))}
        </div>
      ))}
    </div>
  </>
);

export const MobilePanel = ({ activeMobilePanel, children }) => {
  if (!activeMobilePanel) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      left: 0,
      right: 0,
      top: '50px',
      background: '#0a0e1a',
      borderTop: '1px solid #00d4ff',
      overflowY: 'auto',
      zIndex: 999
    }}>
      {children}
    </div>
  );
};

export const MobileQuickAccess = ({ 
  mobileBottomSheet, 
  setMobileBottomSheet,
  simulation,
  setSimulation,
  stopSimulation,
  stepForward,
  stepBackward
}) => (
  <div style={{
    position: 'fixed',
    bottom: mobileBottomSheet ? '60px' : '-200px',
    left: 0,
    right: 0,
    height: '200px',
    background: '#1a1f2e',
    borderTop: '2px solid #00d4ff',
    transition: 'bottom 0.3s ease',
    zIndex: 998,
    padding: '20px'
  }}>
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '4px',
      background: '#666',
      borderRadius: '2px'
    }} />
    
    <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>Quick Controls</h3>
    
    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
      <button 
        onClick={() => setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
        style={{
          flex: 1,
          padding: '12px',
          background: simulation.isPlaying ? '#ff4444' : '#00d4ff',
          color: simulation.isPlaying ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        {simulation.isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      
      <button 
        onClick={stopSimulation}
        style={{
          flex: 1,
          padding: '12px',
          background: '#333',
          color: '#fff',
          border: '1px solid #666',
          borderRadius: '4px'
        }}
      >
        ⏹ Stop
      </button>
    </div>
    
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        onClick={stepBackward}
        style={{
          flex: 1,
          padding: '12px',
          background: '#2a2f3e',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px'
        }}
      >
        ⏮ Step Back
      </button>
      
      <button 
        onClick={stepForward}
        style={{
          flex: 1,
          padding: '12px',
          background: '#2a2f3e',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px'
        }}
      >
        Step Forward ⏭
      </button>
    </div>
  </div>
);