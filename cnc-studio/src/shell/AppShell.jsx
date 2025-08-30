import React, { useMemo, useState, useCallback, useEffect } from 'react';
import './shell.css';
import { ToolProvider } from '../modules/shared/ToolContext';

// Auto-discover modules: each module folder exports default React component and optional meta
// Expected structure: src/modules/<ModuleName>/index.jsx with export default and optional export const meta
const discoveredModules = import.meta.glob('../modules/**/index.jsx', { eager: true });

function normalizeModules(rawModules) {
  return Object.entries(rawModules).map(([path, mod]) => {
    const nameFromPath = path.split('/').slice(-2, -1)[0];
    const meta = mod.meta || {};
    return {
      id: meta.id || nameFromPath.toLowerCase(),
      name: meta.name || nameFromPath,
      area: meta.area || 'left', // left | right | bottom | center
      order: meta.order ?? 0,
      icon: meta.icon || '🧩',
      hidden: !!meta.hidden,
      Component: mod.default,
    };
  }).filter(m => !m.hidden).sort((a, b) => a.area.localeCompare(b.area) || a.order - b.order);
}

const defaultLayout = {
  left: [],
  right: [],
  bottom: [],
  center: [],
};

const VERSION = 'v0.0.3';

export default function AppShell() {
  const modules = useMemo(() => normalizeModules(discoveredModules), []);

  // Overridable per-module order (by id)
  const [panelOrder, setPanelOrder] = useState(() => {
    const map = {};
    for (const m of modules) map[m.id] = m.order ?? 0;
    return map;
  });

  // Group modules by area (excluding background viewer) with order overrides
  const { grouped, viewerModules } = useMemo(() => {
    const g = JSON.parse(JSON.stringify(defaultLayout));
    const viewers = [];
    for (const m of modules) {
      if (m.id === 'viewer') {
        viewers.push(m);
        continue;
      }
      g[m.area].push(m);
    }
    for (const key of Object.keys(g)) {
      g[key].sort((a, b) => (panelOrder[a.id] ?? a.order) - (panelOrder[b.id] ?? b.order));
    }
    return { grouped: g, viewerModules: viewers };
  }, [modules, panelOrder]);

  // Panel UI state
  const [panelState, setPanelState] = useState(() => {
    const state = {};
    for (const m of modules) {
      const defaultVisible = (m.id === 'gcode' || m.id === 'controls' || m.id === 'toolManager' || m.id === 'machine');
      state[m.id] = { minimized: false, maximized: false, visible: !!defaultVisible, floating: false, pos: { x: 60, y: 60 } };
    }
    return state;
  });

  const toggleMinimize = useCallback((id) => {
    setPanelState(s => ({ ...s, [id]: { ...s[id], minimized: !s[id].minimized, maximized: false } }));
  }, []);
  const toggleMaximize = useCallback((id) => {
    setPanelState(s => ({ ...s, [id]: { ...s[id], maximized: !s[id].maximized, minimized: false } }));
  }, []);
  const toggleVisibility = useCallback((id) => {
    setPanelState(s => ({ ...s, [id]: { ...s[id], visible: !s[id].visible } }));
  }, []);

  // Move module up/down within its area
  const moveModule = useCallback((id, dir) => {
    setPanelOrder(prev => {
      const next = { ...prev };
      // Simple: adjust numeric order
      next[id] = (next[id] ?? 0) + (dir === 'up' ? -1 : 1);
      return next;
    });
  }, []);

  // Active panel z-index management
  const [panelZ, setPanelZ] = useState({});
  const [zCounter, setZCounter] = useState(10);
  const bringToFront = useCallback((id) => {
    setZCounter(n => n + 1);
    setPanelZ(z => ({ ...z, [id]: zCounter + 1 }));
  }, [zCounter]);

  const toggleFloating = useCallback((id) => {
    setPanelState(s => ({ ...s, [id]: { ...s[id], floating: !s[id].floating } }));
    bringToFront(id);
  }, [bringToFront]);

  // Dragging for floating panels
  const [drag, setDrag] = useState(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!drag) return;
      setPanelState(s => ({
        ...s,
        [drag.id]: { ...s[drag.id], pos: { x: Math.max(0, e.clientX - drag.dx), y: Math.max(0, e.clientY - drag.dy) } }
      }));
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag]);

  const renderPanel = (m) => {
    const state = panelState[m.id];
    if (!state?.visible) return null;
    const classNames = [
      'panel',
      state.minimized ? 'is-min' : '',
      state.maximized ? 'is-max' : '',
    ].join(' ');
    const floatingStyle = state.floating ? { position: 'absolute', left: state.pos.x, top: state.pos.y, zIndex: panelZ[m.id] || 1 } : { position: 'relative', zIndex: panelZ[m.id] || 1 };
    return (
      <div key={m.id} data-panel-id={m.id} className={classNames} style={floatingStyle} onMouseDown={() => bringToFront(m.id)}>
        <div className="panel-titlebar" onMouseDown={(e) => {
          if (state.floating) {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            setDrag({ id: m.id, dx: e.clientX - rect.left, dy: e.clientY - rect.top });
          }
        }}>
          <span className="panel-title">{m.icon} {m.name}</span>
          <div className="panel-actions">
            <button onClick={() => toggleFloating(m.id)} title={state.floating ? 'Unpin' : 'Pin'}>{state.floating ? '📌' : '📍'}</button>
            <button onClick={() => toggleMinimize(m.id)} title="Minimize">_</button>
            <button onClick={() => toggleMaximize(m.id)} title="Maximize">▣</button>
            <button onClick={() => toggleVisibility(m.id)} title="Close">×</button>
          </div>
        </div>
        {!state.minimized && (
          <div className="panel-body">
            <m.Component app={{ modules, panelState, setPanelState, panelOrder, setPanelOrder, moveModule, toggleVisibility }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolProvider>
      <div className="shell">
        <header className="topbar">
          <div className="brand">CNC Studio {VERSION}</div>
          <nav className="module-switcher">
            {modules.filter(m => m.id !== 'viewer').map(m => (
              <button key={m.id} onClick={() => toggleVisibility(m.id)} className="nav-item">
                {m.icon} {m.name}
              </button>
            ))}
          </nav>
        </header>
        {/* Background Viewer Layer */}
        <div className="background-viewer">
          {viewerModules.map(m => (
            <m.Component key={m.id} />
          ))}
        </div>

        <div className="workspace">
          <aside className="column left">
            {grouped.left.filter(m => !panelState[m.id]?.floating).map(renderPanel)}
          </aside>
          <main className="column center">
            {grouped.center.filter(m => !panelState[m.id]?.floating).map(renderPanel)}
          </main>
          <aside className="column right">
            {grouped.right.filter(m => !panelState[m.id]?.floating).map(renderPanel)}
          </aside>
        </div>
        <footer className="dock bottom">
          {grouped.bottom.filter(m => !panelState[m.id]?.floating).map(renderPanel)}
        </footer>

        {/* Floating layer renders pinned panels */}
        <div className="floating-layer">
          {modules.filter(m => panelState[m.id]?.floating).map(renderPanel)}
        </div>
      </div>
    </ToolProvider>
  );
}

