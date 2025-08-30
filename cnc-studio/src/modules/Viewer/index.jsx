import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createAxes, createTable, createTool, createPathLine } from './machine';

export const meta = {
  id: 'viewer',
  name: 'Viewer',
  area: 'center',
  order: 0,
  icon: '👁️',
};

export default function ViewerModule() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1224');
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    // Z-up like a real machine
    camera.up.set(0, 0, 1);
    camera.position.set(3, 3, 2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.screenSpacePanning = true;
    controls.enablePan = true;
    controls.enableZoom = true;

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(6, 7, 8);
    scene.add(light);
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(amb);

    const grid = new THREE.GridHelper(10, 10, 0x123a5a, 0x123a5a);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    // Align grid to XY plane with Z up
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    scene.add(createAxes(1.0));
    // Default table and tool - will be replaced by Machine module if loaded
    let table = createTable(2, 1.2, 0.1);
    table.name = 'defaultTable';
    scene.add(table);
    const tool = createTool();
    tool.name = 'defaultTool';
    let spindleHome = 0.25; // 250mm default
    tool.position.set(0, 0, spindleHome);
    scene.add(tool);

    let path = createPathLine([
      { x: -0.6, y: -0.4, z: 0.2 },
      { x: -0.6, y: 0.4, z: 0.15 },
      { x: 0.6, y: 0.4, z: 0.15 },
      { x: 0.6, y: -0.4, z: 0.15 },
      { x: -0.6, y: -0.4, z: 0.15 },
    ]);
    scene.add(path);
    let parsedPts = [];
    let currentIndex = 0;
    let isPlaying = false;
    let speed = 1;
    // Runtime/meta state for status bar
    let units = 'mm'; // 'mm' | 'inch'
    let mode = 'G90'; // 'G90' | 'G91'
    let spindleOn = false;
    // Extended metrics (best-effort; parsed from G-code commands if present)
    let toolNumber = 0;
    let spindleRpm = 0;
    let feedRate = 0;
    let wcs = 'G54';
    let stateCb = null;
    const zAxis = new THREE.Vector3(0, 0, 1);

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let raf = 0;
    const emitState = () => {
      try {
        const total = Array.isArray(parsedPts) ? parsedPts.length : 0;
        const idx = Math.max(0, Math.min(total - 1, currentIndex));
        const p = parsedPts[idx] || {};
        const mm = p.mm || { x: 0, y: 0, z: spindleHome * 1000 };
        const lineNo = p.lineNo ?? (idx + 1);
        if (typeof stateCb === 'function') {
          stateCb({
            isPlaying,
            speed,
            line: { current: lineNo, total, text: p._line || '' },
            position: { x: mm.x, y: mm.y, z: mm.z },
            units,
            mode,
            spindleOn,
            tool: { number: toolNumber },
            spindle: { rpm: spindleRpm },
            feed: { rate: feedRate },
            wcs
          });
        }
      } catch (e) {}
    };
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (isPlaying && parsedPts.length > 0) {
        const target = parsedPts[currentIndex];
        tool.position.set(target.x, target.y, target.z + 1.0);
        // ensure tool axis is Z and spin around Z only
        tool.rotation.x = Math.PI / 2;
        tool.rotation.y = 0;
        currentIndex = (currentIndex + Math.max(1, Math.floor(speed))) % parsedPts.length;
        if (window.cncViewer && typeof window.cncViewer.tick === 'function') {
          const ln = parsedPts[currentIndex]?.lineNo ?? currentIndex + 1;
          window.cncViewer.tick(ln);
        }
        emitState();
      }
      tool.rotateOnWorldAxis(zAxis, 0.08);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Expose minimal control API
    const parseGcode = (src) => {
      const lines = src.split(/\r?\n/);
      let x = 0, y = 0, z = 0, unit = 1; // scale for inches->mm
      let mmX = 0, mmY = 0, mmZ = spindleHome * 1000;
      let localUnits = 'mm';
      let localMode = 'G90';
      let localSpindleOn = false;
      let localTool = toolNumber;
      let localRpm = spindleRpm;
      let localFeed = feedRate;
      let localWcs = wcs;
      const pts = [];
      let lineNo = 0;
      for (const raw of lines) {
        lineNo += 1;
        const line = raw.trim();
        if (!line || line.startsWith(';') || line.startsWith('(')) continue;
        if (/\bG20\b/.test(line)) { unit = 25.4; localUnits = 'inch'; }
        if (/\bG21\b/.test(line)) { unit = 1; localUnits = 'mm'; }
        if (/\bG90\b/.test(line)) { localMode = 'G90'; }
        if (/\bG91\b/.test(line)) { localMode = 'G91'; }
        if (/\bM3\b/.test(line)) { localSpindleOn = true; }
        if (/\bM5\b/.test(line)) { localSpindleOn = false; }
        const tMatch = line.match(/\bT(\d+)\b/i);
        if (tMatch) { localTool = parseInt(tMatch[1], 10) || 0; }
        const sMatch = line.match(/\bS(\d+(?:\.\d+)?)\b/i);
        if (sMatch) { localRpm = Math.round(parseFloat(sMatch[1])); }
        const fMatch = line.match(/\bF(\d+(?:\.\d+)?)\b/i);
        if (fMatch) { localFeed = Math.round(parseFloat(fMatch[1])); }
        const wcsMatch = line.match(/\bG5[4-9]\b/);
        if (wcsMatch) { localWcs = wcsMatch[0]; }
        const mx = line.match(/X(-?\d+(?:\.\d+)?)/i);
        const my = line.match(/Y(-?\d+(?:\.\d+)?)/i);
        const mz = line.match(/Z(-?\d+(?:\.\d+)?)/i);
        if (mx) { mmX = parseFloat(mx[1]) * unit; x = mmX * 0.01; }
        if (my) { mmY = parseFloat(my[1]) * unit; y = mmY * 0.01; }
        if (mz) { mmZ = parseFloat(mz[1]) * unit; z = mmZ * 0.01; }
        if (/^G0?1\b/.test(line) || /^G0\b/.test(line)) {
          pts.push({ x, y, z, _line: raw, lineNo, mm: { x: mmX, y: mmY, z: mmZ } });
        }
      }
      // Persist most recently seen modal states
      units = localUnits;
      mode = localMode;
      spindleOn = localSpindleOn;
      toolNumber = localTool;
      spindleRpm = localRpm;
      feedRate = localFeed;
      wcs = localWcs;
      return pts.length ? pts : [{ x: 0, y: 0, z: 0, _line: '', lineNo: 1, mm: { x: 0, y: 0, z: spindleHome * 1000 } }];
    };

    window.cncViewer = {
      scene: scene,  // Expose scene for Machine module
      camera: camera,  // Expose camera
      renderer: renderer,  // Expose renderer
      render: () => { renderer.render(scene, camera); },  // Manual render method
      setLights: ({ intensity, ambient }) => {
        light.intensity = intensity;
        amb.intensity = ambient;
      },
      setGridOpacity: (o) => {
        grid.material.opacity = o;
        grid.material.transparent = o < 1;
      },
      setGCode: (code) => {
        const pts = parseGcode(code);
        if (path) scene.remove(path);
        path = createPathLine(pts);
        scene.add(path);
        parsedPts = pts;
        currentIndex = 0;
        emitState();
      },
      seekToLine: (lineNo) => {
        if (!Array.isArray(parsedPts) || parsedPts.length === 0) return;
        const idx = parsedPts.findIndex(p => p.lineNo === lineNo);
        if (idx >= 0) {
          currentIndex = idx;
          const t = parsedPts[currentIndex];
          tool.position.set(t.x, t.y, t.z + 1.0);
          if (window.cncViewer && typeof window.cncViewer.tick === 'function') {
            window.cncViewer.tick(lineNo);
          }
          emitState();
        }
      },
      setBackground: (c) => { scene.background = new THREE.Color(c); },
      setTable: ({ x, y }) => {
        if (x || y) {
          scene.remove(table);
          table = createTable(x || 2, y || 1.2, 0.1);
          scene.add(table);
        }
      },
      setSpindleHome: (z) => {
        spindleHome = z;
        tool.position.setZ(spindleHome);
      },
      play: () => { isPlaying = true; emitState(); },
      pause: () => { isPlaying = false; emitState(); },
      stop: () => { isPlaying = false; currentIndex = 0; emitState(); },
      reset: () => {
        isPlaying = false;
        currentIndex = 0;
        const t = parsedPts[0];
        if (t) tool.position.set(t.x, t.y, t.z + 1.0);
        else tool.position.set(0, 0, spindleHome);
        emitState();
      },
      step: (d) => {
        if (parsedPts.length === 0) return;
        currentIndex = Math.max(0, Math.min(parsedPts.length - 1, currentIndex + d));
        const target = parsedPts[currentIndex];
        tool.position.set(target.x, target.y, target.z + 1.0);
        if (window.cncViewer && typeof window.cncViewer.tick === 'function') {
          const ln = parsedPts[currentIndex]?.lineNo ?? currentIndex + 1;
          window.cncViewer.tick(ln);
        }
        emitState();
      },
      onTick: (cb) => { window.cncViewer.tick = cb; },
      setSpeed: (s) => { speed = s; emitState(); },
      getState: () => {
        const total = Array.isArray(parsedPts) ? parsedPts.length : 0;
        const idx = Math.max(0, Math.min(total - 1, currentIndex));
        const p = parsedPts[idx] || {};
        const mm = p.mm || { x: 0, y: 0, z: spindleHome * 1000 };
        const lineNo = p.lineNo ?? (idx + 1);
        return {
          isPlaying,
          speed,
          line: { current: lineNo, total, text: p._line || '' },
          position: { x: mm.x, y: mm.y, z: mm.z },
          units,
          mode,
          spindleOn,
          tool: { number: toolNumber },
          spindle: { rpm: spindleRpm },
          feed: { rate: feedRate },
          wcs
        };
      },
      onState: (cb) => { stateCb = cb; },
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      if (window.cncViewer) delete window.cncViewer;
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
  );
}

