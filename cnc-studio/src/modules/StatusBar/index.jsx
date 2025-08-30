import { useEffect, useMemo, useState, useCallback } from 'react';
import { useUnits } from '../shared/UnitsContext';

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
  const { units, setUnits, worldScale, converters } = useUnits();
  const { fromMm } = converters;
  
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
  
  // Field visibility preferences
  const [fieldPrefs, setFieldPrefs] = useState(() => {
    const stored = localStorage.getItem('cnc-studio-field-prefs');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return {
      tool: true,
      rpm: true,
      feed: true,
      wcs: true,
      position: true,
      mode: true,
      spindle: true
    };
  });
  
  const [showPrefsMenu, setShowPrefsMenu] = useState(false);

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
    // Convert from mm to display units
    const converted = fromMm(n, units);
    return units === 'inch' ? converted.toFixed(3) : converted.toFixed(2);
  };
  
  // Toggle units between mm and inch
  const toggleUnits = useCallback(() => {
    setUnits(units === 'mm' ? 'inch' : 'mm');
  }, [units, setUnits]);
  
  // Toggle field preference
  const toggleFieldPref = useCallback((field) => {
    const newPrefs = { ...fieldPrefs, [field]: !fieldPrefs[field] };
    setFieldPrefs(newPrefs);
    localStorage.setItem('cnc-studio-field-prefs', JSON.stringify(newPrefs));
  }, [fieldPrefs]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          {fieldPrefs.tool && <Field label="TOOL" value={state.tool?.number || 0} />}
          {fieldPrefs.rpm && <Field label="RPM" value={state.spindle?.rpm || 0} />}
          {fieldPrefs.feed && <Field label="FEED" value={state.feed?.rate || 0} />}
          {fieldPrefs.wcs && <Field label="WCS" value={state.wcs || 'G54'} />}
          {fieldPrefs.position && (
            <>
              <Field label="X" value={posFmt(state.position.x)} />
              <Field label="Y" value={posFmt(state.position.y)} />
              <Field label="Z" value={posFmt(state.position.z)} />
            </>
          )}
          <button 
            onClick={toggleUnits} 
            title="Toggle units"
            style={{ 
              padding: '2px 6px', 
              fontSize: 11, 
              cursor: 'pointer',
              background: 'rgba(42, 168, 255, 0.1)',
              border: '1px solid rgba(42, 168, 255, 0.3)',
              borderRadius: 3,
              color: '#2aa8ff'
            }}
          >
            {units.toUpperCase()}
          </button>
          <Field label="SCALE" value={worldScale.toFixed(3)} />
          {fieldPrefs.mode && <Field label="MODE" value={state.mode} />}
          {fieldPrefs.spindle && <Field label="SPINDLE" value={state.spindleOn ? 'ON' : 'OFF'} />}
          
          {/* Preferences menu button */}
          <button
            onClick={() => setShowPrefsMenu(!showPrefsMenu)}
            title="Field preferences"
            style={{
              padding: '2px 4px',
              fontSize: 11,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              color: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            ⚙
          </button>
          
          {/* Preferences dropdown */}
          {showPrefsMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: '#0b1224',
              border: '1px solid rgba(42, 168, 255, 0.3)',
              borderRadius: 4,
              padding: 8,
              zIndex: 1000,
              minWidth: 150,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: 11, marginBottom: 8, fontWeight: 'bold', color: '#2aa8ff' }}>Field Visibility</div>
              {Object.entries({
                tool: 'Tool Number',
                rpm: 'Spindle RPM',
                feed: 'Feed Rate',
                wcs: 'Work Coordinate',
                position: 'Position (XYZ)',
                mode: 'Mode (G90/G91)',
                spindle: 'Spindle State'
              }).map(([key, label]) => (
                <label key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  marginBottom: 4,
                  cursor: 'pointer',
                  fontSize: 11
                }}>
                  <input
                    type="checkbox"
                    checked={fieldPrefs[key]}
                    onChange={() => toggleFieldPref(key)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

