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

  const renderPanel = (m) => {
    const state = panelState[m.id];
    if (!state?.visible) return null;
    const classNames = [
      'panel',
      state.minimized ? 'is-min' : '',
      state.maximized ? 'is-max' : '',
    ].join(' ');
    return (
      <div key={m.id} data-panel-id={m.id} className={classNames} style={{ position: 'relative', zIndex: panelZ[m.id] || 1 }} onMouseDown={() => bringToFront(m.id)} draggable onDragStart={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: m.id, dx: e.clientX - rect.left, dy: e.clientY - rect.top }));
      }}>
        <div className="panel-titlebar">
          <span className="panel-title">{m.icon} {m.name}</span>
          <div className="panel-actions">
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
      {/* Background Viewer Layer */}
      <div className="background-viewer">
        {viewerModules.map(m => (
          <m.Component key={m.id} />
        ))}
      </div>

      <div className="workspace" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
        const data = e.dataTransfer.getData('text/plain');
        try {
          const { id, dx, dy } = JSON.parse(data);
          const host = e.currentTarget;
          const x = e.clientX - host.getBoundingClientRect().left - dx;
          const y = e.clientY - host.getBoundingClientRect().top - dy;
          const el = host.querySelector(`[data-panel-id="${id}"]`);
          if (el) {
            el.style.position = 'absolute';
            el.style.left = `${Math.max(0, x)}px`;
            el.style.top = `${Math.max(0, y)}px`;
          }
        } catch {}
      }}>
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

