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
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Table X (mm)</span>
          <input type="number" defaultValue={400} onChange={(e) => window.cncViewer?.setTable?.({ x: parseFloat(e.target.value) / 1000 })} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Table Y (mm)</span>
          <input type="number" defaultValue={300} onChange={(e) => window.cncViewer?.setTable?.({ y: parseFloat(e.target.value) / 1000 })} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Spindle Z Home (mm)</span>
          <input type="number" defaultValue={250} onChange={(e) => window.cncViewer?.setSpindleHome?.(parseFloat(e.target.value) / 1000)} />
        </label>
      </div>
    </div>
  );
}

