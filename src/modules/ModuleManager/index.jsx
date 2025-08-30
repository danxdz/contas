export const meta = {
  id: 'modules',
  name: 'Modules',
  area: 'left',
  order: 0,
  icon: '📂',
};

export default function ModuleManager({ app }) {
  const { modules, panelState, setPanelState, moveModule, toggleVisibility } = app || {};
  const groups = ['left', 'center', 'right', 'bottom'];
  const grouped = groups.map(area => ({
    area,
    items: modules.filter(m => m.area === area).map(m => ({ id: m.id, name: m.name, icon: m.icon }))
  }));

  const toggle = (id) => setPanelState(s => ({ ...s, [id]: { ...s[id], visible: !s[id].visible } }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {grouped.map(group => (
        <details key={group.area} open>
          <summary style={{ cursor: 'pointer', opacity: .8 }}>{group.area.toUpperCase()}</summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => moveModule(item.id, 'up')} title="Up">▲</button>
                <button onClick={() => moveModule(item.id, 'down')} title="Down">▼</button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <input type="checkbox" checked={panelState[item.id]?.visible ?? true} onChange={() => toggle(item.id)} />
                  <span>{item.icon} {item.name}</span>
                </label>
                <button onClick={() => toggleVisibility(item.id)}>Toggle</button>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

