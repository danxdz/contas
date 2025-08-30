export const meta = {
  id: 'controls',
  name: 'Controls',
  area: 'left',
  order: 1,
  icon: '🎛️',
};

export default function ControlsModule() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button onClick={() => window.cncViewer?.play?.()}>Play</button>
      <button onClick={() => window.cncViewer?.pause?.()}>Pause</button>
      <button onClick={() => window.cncViewer?.stop?.()}>Stop</button>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span>Speed</span>
        <input type="range" min="0.1" max="5" step="0.1" defaultValue={1} onChange={(e) => window.cncViewer?.setSpeed?.(parseFloat(e.target.value))} />
      </label>
      <button onClick={() => window.cncViewer?.step?.(1)}>Step +</button>
      <button onClick={() => window.cncViewer?.step?.(-1)}>Step -</button>
    </div>
  );
}

