export const meta = {
  id: 'tools',
  name: 'Tools',
  area: 'right',
  order: 1,
  icon: '🛠️',
};

export default function ToolsModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Tool name" />
        <input type="number" placeholder="Ø (mm)" />
        <button>Add</button>
      </div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>Endmill Ø10, 4F</li>
        <li>Drill Ø6</li>
      </ul>
    </div>
  );
}

