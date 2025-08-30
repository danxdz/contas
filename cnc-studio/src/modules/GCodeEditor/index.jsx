import { useEffect, useState } from 'react';

export const meta = {
  id: 'gcode',
  name: 'G-Code',
  area: 'left',
  order: 5,
  icon: '🧾',
};

const sample = `; Simple rectangle path
G21 G90
G0 X-60 Y-40 Z200
G0 Z10
G1 Z2 F300
G1 X-60 Y40 F800
G1 X60 Y40
G1 X60 Y-40
G1 X-60 Y-40
G0 Z200
`;

export default function GCodeEditor() {
  const [code, setCode] = useState(sample);

  useEffect(() => {
    window.cncViewer?.setGCode?.(code);
  }, [code]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={12} style={{ width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
      <div style={{ fontSize: 12, opacity: .6 }}>Edits apply live to the viewer.</div>
    </div>
  );
}

