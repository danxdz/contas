import { useEffect, useMemo, useState } from 'react';

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
  const [active, setActive] = useState(0);

  useEffect(() => {
    window.cncViewer?.setGCode?.(code);
  }, [code]);

  const lines = useMemo(() => code.split(/\r?\n/), [code]);
  const colorize = (line) => {
    const parts = [];
    const tokens = line.split(/\s+/);
    for (const t of tokens) {
      if (/^G\d+/.test(t)) parts.push(<span style={{ color: '#6cf' }} key={parts.length}>{t} </span>);
      else if (/^M\d+/.test(t)) parts.push(<span style={{ color: '#fc6' }} key={parts.length}>{t} </span>);
      else if (/^[XYZ]-?\d/.test(t)) parts.push(<span style={{ color: '#9f9' }} key={parts.length}>{t} </span>);
      else if (/^[FST]-?\d/.test(t)) parts.push(<span style={{ color: '#f99' }} key={parts.length}>{t} </span>);
      else parts.push(<span key={parts.length}>{t} </span>);
    }
    return parts;
  };
  useEffect(() => {
    window.cncViewer?.onTick?.((i) => setActive(i));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 4, alignItems: 'start', maxHeight: 260, overflow: 'auto', background: 'rgba(15,26,51,.4)', border: '1px solid rgba(23,48,77,.6)', borderRadius: 6 }}>
        <div>
          {lines.map((_, i) => (
            <div key={i} style={{ textAlign: 'right', padding: '0 6px', opacity: .5, fontSize: 12, background: i === active ? 'rgba(0,212,255,.25)' : 'transparent', color: i === active ? '#e6f9ff' : undefined }}>{i + 1}</div>
          ))}
        </div>
        <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', padding: '4px 6px' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre', background: i === active ? 'rgba(0,212,255,.15)' : 'transparent', color: i === active ? '#e6f9ff' : undefined }}>
              {colorize(line)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: .6 }}>Edits apply live; active line highlighted during playback.</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => window.cncViewer?.play?.()}>Play</button>
        <button onClick={() => window.cncViewer?.pause?.()}>Pause</button>
        <button onClick={() => window.cncViewer?.stop?.()}>Stop</button>
        <button onClick={() => window.cncViewer?.step?.(1)}>Step +</button>
        <button onClick={() => window.cncViewer?.step?.(-1)}>Step -</button>
      </div>
    </div>
  );
}

