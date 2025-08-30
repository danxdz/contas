import { useEffect, useState } from 'react';

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
  const [bg, setBg] = useState('#0b1224');

  // Apply live on change and when component mounts
  useEffect(() => {
    window.cncViewer?.setLights?.({ intensity, ambient });
  }, [intensity, ambient]);
  useEffect(() => {
    window.cncViewer?.setGridOpacity?.(grid);
  }, [grid]);
  useEffect(() => {
    window.cncViewer?.setBackground?.(bg);
  }, [bg]);

  const SliderRow = ({ label, min, max, step, value, onChange, format = (v) => v.toFixed(2) }) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ minWidth: 80 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span style={{ width: 42, textAlign: 'right', fontSize: 12, opacity: .8 }}>{format(value)}</span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SliderRow label="Dir Light" min={0} max={2} step={0.05} value={intensity} onChange={setIntensity} />
      <SliderRow label="Ambient" min={0} max={1} step={0.05} value={ambient} onChange={setAmbient} />
      <SliderRow label="Grid" min={0} max={0.6} step={0.05} value={grid} onChange={setGrid} />
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Background</span>
        <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
      </label>
      
    </div>
  );
}

