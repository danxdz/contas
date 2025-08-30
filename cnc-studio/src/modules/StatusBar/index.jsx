import { useEffect, useMemo, useState } from 'react';

export const meta = {
  id: 'status',
  name: 'Status',
  area: 'bottom',
  order: 0,
  icon: '📟',
  chrome: 'bare',
};

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
      <span style={{ opacity: .6, fontSize: 11 }}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

export default function StatusBar() {
  const [state, setState] = useState(() => ({
    isPlaying: false,
    speed: 1,
    line: { current: 0, total: 0, text: '' },
    position: { x: 0, y: 0, z: 0 },
    units: 'mm',
    mode: 'G90',
    spindleOn: false,
    // Optional extended metrics with safe defaults
    tool: { number: 0 },
    spindle: { rpm: 0 },
    feed: { rate: 0 },
    wcs: 'G54',
  }));

  // Subscribe to viewer state
  useEffect(() => {
    const s = window.cncViewer?.getState?.();
    if (s) setState(prev => ({ ...prev, ...s }));
    const off = window.cncViewer?.onState?.((ns) => setState(prev => ({ ...prev, ...ns })));
    return () => { if (typeof off === 'function') off(); };
  }, []);

  const pct = useMemo(() => {
    const t = state.line?.total || 0;
    const c = state.line?.current || 0;
    return t > 0 ? Math.round((c / t) * 100) : 0;
  }, [state.line]);

  const posFmt = (v) => {
    const n = typeof v === 'number' ? v : 0;
    return state.units === 'inch' ? (n / 25.4).toFixed(3) : n.toFixed(2);
  };

  const onStartPause = () => {
    if (state.isPlaying) window.cncViewer?.pause?.();
    else window.cncViewer?.play?.();
  };
  const onStop = () => { window.cncViewer?.stop?.(); };
  const onReset = () => { window.cncViewer?.reset?.(); };
  const onCycleSpeed = () => {
    const steps = [0.5, 1, 1.5, 2, 3, 5];
    const i = steps.indexOf(state.speed);
    const next = steps[(i + 1) % steps.length];
    window.cncViewer?.setSpeed?.(next);
  };

  // Centered container with max width
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 12,
        height: 36,
        width: '100%',
        maxWidth: 1280,
      }}>
        {/* Left cluster: machine state and controls (text preferred) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Field label="STATE" value={state.isPlaying ? 'RUN' : 'IDLE'} />
          <button onClick={onStartPause} title="Start/Pause">{state.isPlaying ? '||' : '▶'}</button>
          <button onClick={onStop} title="Stop">■</button>
          <button onClick={onReset} title="Reset">⟲</button>
        </div>

        {/* Middle: program progress and current line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Field label="LINE" value={`${state.line.current}/${state.line.total}`} />
            <Field label="PROG" value={`${pct}%`} />
            <Field label="SPEED" value={`${state.speed}x`} />
            <button onClick={onCycleSpeed} title="Cycle speed">⤾</button>
          </div>
          <div style={{ flex: 1, height: 6, background: 'rgba(23,48,77,.5)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(0,212,255,.6)', transition: 'width .15s ease' }} />
          </div>
          <div style={{ flex: 1, minWidth: 180, opacity: .75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
            {state.line.text || ''}
          </div>
        </div>

        {/* Right: DROs and modal states */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Field label="TOOL" value={state.tool?.number || 0} />
          <Field label="RPM" value={state.spindle?.rpm || 0} />
          <Field label="FEED" value={state.feed?.rate || 0} />
          <Field label="WCS" value={state.wcs || 'G54'} />
          <Field label="X" value={posFmt(state.position.x)} />
          <Field label="Y" value={posFmt(state.position.y)} />
          <Field label="Z" value={posFmt(state.position.z)} />
          <Field label="UNITS" value={state.units === 'inch' ? 'G20' : 'G21'} />
          <Field label="MODE" value={state.mode} />
          <Field label="SPINDLE" value={state.spindleOn ? 'ON' : 'OFF'} />
        </div>
      </div>
    </div>
  );
}

