import { useState } from 'react';

export const meta = {
  id: 'scene',
  name: 'Scene',
  area: 'right',
  order: 3,
  icon: '💡',
};

export default function SceneControls() {
  const [intensity, setIntensity] = useState(1.2);
  const [ambient, setAmbient] = useState(0.35);
  const [grid, setGrid] = useState(0.15);

  // Expose simple global hooks for the viewer (accessed via window.cncViewer)
  const apply = () => {
    window.cncViewer?.setLights?.({ intensity, ambient });
    window.cncViewer?.setGridOpacity?.(grid);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Dir Light</span>
        <input type="range" min="0" max="2" step="0.05" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} />
      </label>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Ambient</span>
        <input type="range" min="0" max="1" step="0.05" value={ambient} onChange={(e) => setAmbient(parseFloat(e.target.value))} />
      </label>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Grid</span>
        <input type="range" min="0" max="0.6" step="0.05" value={grid} onChange={(e) => setGrid(parseFloat(e.target.value))} />
      </label>
      <button onClick={apply}>Apply</button>
    </div>
  );
}

