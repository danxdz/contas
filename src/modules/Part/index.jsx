export const meta = {
  id: 'part',
  name: 'Part',
  area: 'left',
  order: 3,
  icon: '📦',
};

export default function PartModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Material</span>
        <select>
          <option>Aluminium 6061</option>
          <option>Aluminium 7075</option>
          <option>Steel 1018</option>
          <option>Stainless 304</option>
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>X (mm)</span>
          <input type="number" defaultValue={100} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Y (mm)</span>
          <input type="number" defaultValue={60} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Z (mm)</span>
          <input type="number" defaultValue={25} />
        </label>
      </div>
    </div>
  );
}

