export const meta = {
  id: 'fixture',
  name: 'Fixtures',
  area: 'left',
  order: 2,
  icon: '🧱',
};

export default function FixtureModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Fixture Type</span>
        <select>
          <option>Vise</option>
          <option>4th Axis Chuck</option>
          <option>5th Axis Trunnion</option>
          <option>Custom Plate</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Jaw Width (mm)</span>
        <input type="number" defaultValue={125} />
      </label>
    </div>
  );
}

