export const meta = {
  id: 'stock',
  name: 'Stock',
  area: 'left',
  order: 4,
  icon: '🧱',
};

export default function StockModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Shape</span>
        <select>
          <option>Block</option>
          <option>Cylinder</option>
          <option>Plate</option>
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>X (mm)</span>
          <input type="number" defaultValue={120} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Y (mm)</span>
          <input type="number" defaultValue={80} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Z (mm)</span>
          <input type="number" defaultValue={30} />
        </label>
      </div>
    </div>
  );
}

