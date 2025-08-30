export const meta = {
  id: 'ui',
  name: 'UI Settings',
  area: 'right',
  order: 2,
  icon: '🎨',
};

export default function UISettings() {
  const setCompact = (on) => {
    document.documentElement.style.setProperty('--panel-gap', on ? '4px' : '8px');
    document.documentElement.style.setProperty('--panel-padding', on ? '4px' : '6px');
  };
  const setTheme = (t) => {
    const body = document.body;
    body.dataset.theme = t;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Compact spacing</span>
        <input type="checkbox" onChange={(e) => setCompact(e.target.checked)} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span>Theme</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setTheme('dark')}>Dark</button>
          <button onClick={() => setTheme('light')}>Light</button>
        </div>
      </label>
    </div>
  );
}

