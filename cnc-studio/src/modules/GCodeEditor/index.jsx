import { useEffect, useMemo, useState } from 'react';

export const meta = {
  id: 'gcode',
  name: 'G-Code',
  area: 'left',
  order: 5,
  icon: '🧾',
  hidden: true,
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
  const [editMode, setEditMode] = useState(true);

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
    window.cncViewer?.onTick?.((ln) => setActive(Math.max(0, (ln || 1) - 1)));
  }, []);

  const onLineClick = (i) => {
    const ln = i + 1;
    setActive(i);
    window.cncViewer?.seekToLine?.(ln);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: .85 }}>
          <input type="checkbox" checked={editMode} onChange={(e) => setEditMode(e.target.checked)} /> Edit
        </label>
      </div>

      {editMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 4, alignItems: 'start', maxHeight: 300, overflow: 'auto', background: 'rgba(15,26,51,.4)', border: '1px solid rgba(23,48,77,.6)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            {lines.map((_, i) => (
              <div key={i} onClick={() => onLineClick(i)} style={{ textAlign: 'right', padding: '0 6px', opacity: .5, background: i === active ? 'rgba(0,212,255,.25)' : 'transparent', color: i === active ? '#e6f9ff' : undefined, lineHeight: '18px', cursor: 'pointer' }}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={18}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: '18px' }}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 4, alignItems: 'start', maxHeight: 300, overflow: 'auto', background: 'rgba(15,26,51,.4)', border: '1px solid rgba(23,48,77,.6)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            {lines.map((_, i) => (
              <div key={i} onClick={() => onLineClick(i)} style={{ textAlign: 'right', padding: '0 6px', opacity: .5, background: i === active ? 'rgba(0,212,255,.25)' : 'transparent', color: i === active ? '#e6f9ff' : undefined, lineHeight: '18px', cursor: 'pointer' }}>{i + 1}</div>
            ))}
          </div>
          <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', padding: '4px 6px', fontSize: 12, lineHeight: '18px' }}>
            {lines.map((line, i) => (
              <div key={i} onClick={() => onLineClick(i)} style={{ whiteSpace: 'pre', background: i === active ? 'rgba(0,212,255,.15)' : 'transparent', color: i === active ? '#e6f9ff' : undefined, lineHeight: '18px', cursor: 'pointer' }}>
                {colorize(line)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, opacity: .6 }}>Edit mode: type directly. View mode: syntax colored. Click any line to seek the tool.</div>
    </div>
  );
}

