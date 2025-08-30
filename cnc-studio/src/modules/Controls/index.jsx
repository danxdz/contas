export const meta = {
  id: 'controls',
  name: 'Controls',
  area: 'bottom',
  order: 1,
  icon: '🎛️',
};

export default function ControlsModule() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button>Play</button>
      <button>Pause</button>
      <button>Stop</button>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span>Speed</span>
        <input type="range" min="0.1" max="5" step="0.1" defaultValue={1} />
      </label>
    </div>
  );
}

