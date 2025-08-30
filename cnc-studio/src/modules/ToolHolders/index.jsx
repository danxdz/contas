export const meta = {
  id: 'holders',
  name: 'Tool Holders',
  area: 'right',
  order: 11,
  icon: '🔗',
  hidden: true,
};

export default function ToolHoldersModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Holder Type</span>
        <select>
          <option>BT40</option>
          <option>HSK63A</option>
          <option>CAT40</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span>Stickout (mm)</span>
        <input type="number" defaultValue={30} />
      </label>
    </div>
  );
}

