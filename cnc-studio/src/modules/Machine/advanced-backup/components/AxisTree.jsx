import React, { useState } from 'react';

export default function AxisTree({ machine, onAxisUpdate }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [editingAxis, setEditingAxis] = useState(null);

  const toggleNode = (axisId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(axisId)) {
      newExpanded.delete(axisId);
    } else {
      newExpanded.add(axisId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddAxis = (parentId = null) => {
    const newAxis = {
      id: `axis_${Date.now()}`,
      name: 'New Axis',
      type: 'linear',
      parent: parentId,
      limits: { min: -100, max: 100 },
      homePosition: 0,
      currentPosition: 0,
      enabled: true
    };

    const updatedAxes = [...(machine.axes || []), newAxis];
    onAxisUpdate(updatedAxes);
    setEditingAxis(newAxis.id);
  };

  const handleUpdateAxis = (axisId, updates) => {
    const updatedAxes = machine.axes.map(axis => 
      axis.id === axisId ? { ...axis, ...updates } : axis
    );
    onAxisUpdate(updatedAxes);
  };

  const handleDeleteAxis = (axisId) => {
    const updatedAxes = machine.axes.filter(axis => 
      axis.id !== axisId && axis.parent !== axisId
    );
    onAxisUpdate(updatedAxes);
  };

  const renderAxisNode = (axis, level = 0) => {
    const childAxes = machine.axes.filter(a => a.parent === axis.id);
    const isExpanded = expandedNodes.has(axis.id);
    const isEditing = editingAxis === axis.id;

    return (
      <div key={axis.id} className="axis-node" style={{ marginLeft: level * 20 }}>
        <div className="axis-header">
          {childAxes.length > 0 && (
            <button 
              className="expand-btn"
              onClick={() => toggleNode(axis.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          <span className={`axis-type-icon ${axis.type}`}>
            {axis.type === 'linear' ? '↔' : '↻'}
          </span>

          {isEditing ? (
            <input
              type="text"
              value={axis.name}
              onChange={(e) => handleUpdateAxis(axis.id, { name: e.target.value })}
              onBlur={() => setEditingAxis(null)}
              onKeyPress={(e) => e.key === 'Enter' && setEditingAxis(null)}
              autoFocus
            />
          ) : (
            <span 
              className="axis-name"
              onClick={() => setEditingAxis(axis.id)}
            >
              {axis.name}
            </span>
          )}

          <div className="axis-controls">
            <button 
              className="btn-small"
              onClick={() => handleAddAxis(axis.id)}
              title="Add child axis"
            >
              +
            </button>
            <button 
              className="btn-small delete"
              onClick={() => handleDeleteAxis(axis.id)}
              title="Delete axis"
            >
              ×
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="axis-details">
            <div className="axis-config">
              <label>
                Type:
                <select 
                  value={axis.type}
                  onChange={(e) => handleUpdateAxis(axis.id, { type: e.target.value })}
                >
                  <option value="linear">Linear</option>
                  <option value="rotary">Rotary</option>
                </select>
              </label>

              <label>
                Min Limit:
                <input
                  type="number"
                  value={axis.limits?.min || 0}
                  onChange={(e) => handleUpdateAxis(axis.id, { 
                    limits: { ...axis.limits, min: parseFloat(e.target.value) }
                  })}
                />
              </label>

              <label>
                Max Limit:
                <input
                  type="number"
                  value={axis.limits?.max || 0}
                  onChange={(e) => handleUpdateAxis(axis.id, { 
                    limits: { ...axis.limits, max: parseFloat(e.target.value) }
                  })}
                />
              </label>

              <label>
                Home Position:
                <input
                  type="number"
                  value={axis.homePosition || 0}
                  onChange={(e) => handleUpdateAxis(axis.id, { 
                    homePosition: parseFloat(e.target.value)
                  })}
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={axis.enabled}
                  onChange={(e) => handleUpdateAxis(axis.id, { enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>

            {childAxes.map(child => renderAxisNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootAxes = machine?.axes?.filter(a => !a.parent) || [];

  return (
    <div className="axis-tree">
      <div className="axis-tree-header">
        <h3>Machine Axes Configuration</h3>
        <button 
          className="btn-add-root"
          onClick={() => handleAddAxis(null)}
        >
          + Add Root Axis
        </button>
      </div>

      <div className="axis-tree-content">
        {rootAxes.length === 0 ? (
          <div className="no-axes">
            No axes configured. Click "Add Root Axis" to start.
          </div>
        ) : (
          rootAxes.map(axis => renderAxisNode(axis))
        )}
      </div>

      <style jsx>{`
        .axis-tree {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          background: #f9f9f9;
        }

        .axis-tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .axis-tree-header h3 {
          margin: 0;
        }

        .btn-add-root {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .axis-node {
          margin: 8px 0;
        }

        .axis-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 20px;
          font-size: 12px;
        }

        .axis-type-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .axis-type-icon.rotary {
          color: #FF9800;
        }

        .axis-type-icon.linear {
          color: #2196F3;
        }

        .axis-name {
          flex: 1;
          cursor: pointer;
          padding: 4px;
        }

        .axis-name:hover {
          background: #f0f0f0;
          border-radius: 2px;
        }

        .axis-controls {
          display: flex;
          gap: 4px;
        }

        .btn-small {
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 2px 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-small.delete {
          color: #f44336;
        }

        .axis-details {
          margin-top: 8px;
          padding-left: 28px;
        }

        .axis-config {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .axis-config label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
        }

        .axis-config input[type="number"],
        .axis-config select {
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        .axis-config input[type="checkbox"] {
          margin-right: 4px;
        }

        .no-axes {
          text-align: center;
          padding: 32px;
          color: #666;
        }
      `}</style>
    </div>
  );
}