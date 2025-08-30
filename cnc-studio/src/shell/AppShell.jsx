import React, { useMemo, useState, useCallback } from 'react';
import './shell.css';

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

export default function AppShell() {
  const modules = useMemo(() => normalizeModules(discoveredModules), []);

  // Group modules by area
  const grouped = useMemo(() => {
    const g = JSON.parse(JSON.stringify(defaultLayout));
    for (const m of modules) {
      g[m.area].push(m);
    }
    return g;
  }, [modules]);

  // Panel UI state
  const [panelState, setPanelState] = useState(() => {
    const state = {};
    for (const m of modules) {
      state[m.id] = { minimized: false, maximized: false, visible: true };
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

  const renderPanel = (m) => {
    const state = panelState[m.id];
    if (!state?.visible) return null;
    const classNames = [
      'panel',
      state.minimized ? 'is-min' : '',
      state.maximized ? 'is-max' : '',
    ].join(' ');
    return (
      <div key={m.id} className={classNames}>
        <div className="panel-titlebar">
          <span className="panel-title">{m.icon} {m.name}</span>
          <div className="panel-actions">
            <button onClick={() => toggleMinimize(m.id)} title="Minimize">_</button>
            <button onClick={() => toggleMaximize(m.id)} title="Maximize">[ ]</button>
            <button onClick={() => toggleVisibility(m.id)} title="Close">×</button>
          </div>
        </div>
        {!state.minimized && (
          <div className="panel-body">
            <m.Component />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">CNC Studio</div>
        <nav className="module-switcher">
          {modules.map(m => (
            <button key={m.id} onClick={() => toggleVisibility(m.id)} className="nav-item">
              {m.icon} {m.name}
            </button>
          ))}
        </nav>
      </header>

      <div className="workspace">
        <aside className="column left">
          {grouped.left.map(renderPanel)}
        </aside>
        <main className="column center">
          {grouped.center.map(renderPanel)}
        </main>
        <aside className="column right">
          {grouped.right.map(renderPanel)}
        </aside>
      </div>
      <footer className="dock bottom">
        {grouped.bottom.map(renderPanel)}
      </footer>
    </div>
  );
}

