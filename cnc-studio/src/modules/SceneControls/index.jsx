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

  const SliderRow = ({ label, min, max, step, value, onChange, format = (v) => v.toFixed(2) }) => {
    const [show, setShow] = useState(false);
    const percent = ((value - min) / (max - min)) * 100;
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          <span style={{ fontSize: 11, opacity: .7 }}>{format(value)}</span>
        </div>
        <div style={{ position: 'relative', padding: '8px 0' }}>
          {show && (
            <span style={{ position: 'absolute', left: `calc(${percent}% + 0px)`, top: -6, transform: 'translate(-50%, -100%)', background: 'rgba(15,26,51,.85)', color: '#cfeaff', border: '1px solid rgba(23,48,77,.7)', borderRadius: 6, padding: '2px 6px', fontSize: 11, pointerEvents: 'none', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
              {format(value)}
            </span>
          )}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            onMouseDown={() => setShow(true)}
            onMouseUp={() => setShow(false)}
            onMouseLeave={() => setShow(false)}
            onTouchStart={() => setShow(true)}
            onTouchEnd={() => setShow(false)}
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
        </div>
      </label>
    );
  };

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

