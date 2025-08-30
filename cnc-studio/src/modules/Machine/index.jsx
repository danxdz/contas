export const meta = {
  id: 'machine',
  name: 'Machine',
  area: 'left',
  order: 1,
  icon: '🏭',
};

export default function MachineModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Machine Model</span>
        <select>
          <option>3-axis Mill</option>
          <option>4-axis Mill</option>
          <option>5-axis Mill</option>
          <option>2-axis Lathe</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Controller</span>
        <select>
          <option>Fanuc</option>
          <option>Siemens</option>
          <option>Heidenhain</option>
          <option>Haas</option>
        </select>
      </label>
    </div>
  );
}

