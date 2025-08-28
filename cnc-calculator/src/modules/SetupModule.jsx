import React, { useState } from 'react';

const SetupModule = ({ sharedState, updateState, messageBus }) => {
  const [setup, setSetup] = useState({
    stock: {
      x: 100,
      y: 100,
      z: 50,
      material: 'Aluminum 6061'
    },
    workOffset: {
      active: 'G54',
      G54: { x: 0, y: 0, z: 0 },
      G55: { x: 0, y: 0, z: 0 },
      G56: { x: 0, y: 0, z: 0 }
    },
    machine: {
      type: 'Mill',
      axes: 3,
      maxRPM: 12000,
      maxFeed: 5000
    }
  });

  const updateSetupField = (category, field, value) => {
    const newSetup = {
      ...setup,
      [category]: {
        ...setup[category],
        [field]: value
      }
    };
    setSetup(newSetup);
    updateState('project.setup', newSetup);
    messageBus.emit('setup:changed', { setup: newSetup });
  };

  const updateWorkOffset = (offset, axis, value) => {
    const newSetup = {
      ...setup,
      workOffset: {
        ...setup.workOffset,
        [offset]: {
          ...setup.workOffset[offset],
          [axis]: parseFloat(value) || 0
        }
      }
    };
    setSetup(newSetup);
    updateState('project.setup', newSetup);
    messageBus.emit('setup:changed', { setup: newSetup });
  };

  return (
    <div className="module setup-module">
      <div className="module-header">
        Setup Configuration
      </div>
      <div className="module-content">
        {/* Stock Setup */}
        <section style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#888' }}>
            Stock Dimensions
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                X (mm)
              </label>
              <input
                type="number"
                value={setup.stock.x}
                onChange={(e) => updateSetupField('stock', 'x', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                Y (mm)
              </label>
              <input
                type="number"
                value={setup.stock.y}
                onChange={(e) => updateSetupField('stock', 'y', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                Z (mm)
              </label>
              <input
                type="number"
                value={setup.stock.z}
                onChange={(e) => updateSetupField('stock', 'z', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
              Material
            </label>
            <select
              value={setup.stock.material}
              onChange={(e) => updateSetupField('stock', 'material', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Aluminum 6061">Aluminum 6061</option>
              <option value="Steel 1045">Steel 1045</option>
              <option value="Stainless 304">Stainless 304</option>
              <option value="Brass">Brass</option>
              <option value="Plastic">Plastic</option>
            </select>
          </div>
        </section>

        {/* Work Offsets */}
        <section style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#888' }}>
            Work Offsets
          </h4>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
              Active Offset
            </label>
            <select
              value={setup.workOffset.active}
              onChange={(e) => updateSetupField('workOffset', 'active', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="G54">G54</option>
              <option value="G55">G55</option>
              <option value="G56">G56</option>
            </select>
          </div>
          
          {['G54', 'G55', 'G56'].map(offset => (
            <div 
              key={offset}
              style={{ 
                marginBottom: '8px',
                padding: '8px',
                background: setup.workOffset.active === offset ? '#00d4ff11' : '#2a2f3e',
                border: `1px solid ${setup.workOffset.active === offset ? '#00d4ff44' : '#333'}`,
                borderRadius: '4px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                {offset}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {['x', 'y', 'z'].map(axis => (
                  <input
                    key={axis}
                    type="number"
                    placeholder={axis.toUpperCase()}
                    value={setup.workOffset[offset][axis]}
                    onChange={(e) => updateWorkOffset(offset, axis, e.target.value)}
                    style={{ width: '100%', fontSize: '11px' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Machine Settings */}
        <section>
          <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#888' }}>
            Machine Settings
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                Machine Type
              </label>
              <select
                value={setup.machine.type}
                onChange={(e) => updateSetupField('machine', 'type', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Mill">Mill</option>
                <option value="Lathe">Lathe</option>
                <option value="Router">Router</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                  Max RPM
                </label>
                <input
                  type="number"
                  value={setup.machine.maxRPM}
                  onChange={(e) => updateSetupField('machine', 'maxRPM', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                  Max Feed
                </label>
                <input
                  type="number"
                  value={setup.machine.maxFeed}
                  onChange={(e) => updateSetupField('machine', 'maxFeed', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SetupModule;