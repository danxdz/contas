export const meta = {
  id: 'toolManager',
  name: 'Tool Manager',
  area: 'right',
  order: 1,
  icon: '🧰',
};

export default function ToolManagerModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Tool name" />
        <input type="number" placeholder="Ø (mm)" />
        <select defaultValue="Endmill">
          <option>Endmill</option>
          <option>Ballnose</option>
          <option>Drill</option>
          <option>Tap</option>
        </select>
        <select defaultValue="BT40">
          <option>BT30</option>
          <option>BT40</option>
          <option>HSK63A</option>
          <option>CAT40</option>
        </select>
        <input type="number" placeholder="Stickout (mm)" />
        <button>Add</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, alignItems: 'center' }}>
        <div style={{ fontWeight: 600, opacity: .8 }}>Tool / Holder</div>
        <div style={{ fontWeight: 600, opacity: .8 }}>Ø</div>
        <div style={{ fontWeight: 600, opacity: .8 }}>Holder</div>
        <div style={{ fontWeight: 600, opacity: .8 }}>Stickout</div>
        <div>Endmill Ø10 - 4F</div>
        <div>10</div>
        <div>BT40</div>
        <div>32</div>
      </div>
    </div>
  );
}

