import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(6, 7, 8);
    scene.add(light);
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(amb);

    const grid = new THREE.GridHelper(10, 10, 0x123a5a, 0x123a5a);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);

    scene.add(createAxes(1.0));
    const table = createTable(2, 2, 0.1);
    scene.add(table);
    const tool = createTool();
    tool.position.set(0, 0, 1.2);
    scene.add(tool);

    const path = createPathLine([
      { x: -0.6, y: -0.4, z: 0.2 },
      { x: -0.6, y: 0.4, z: 0.15 },
      { x: 0.6, y: 0.4, z: 0.15 },
      { x: 0.6, y: -0.4, z: 0.15 },
      { x: -0.6, y: -0.4, z: 0.15 },
    ]);
    scene.add(path);

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
    const animate = () => {
      raf = requestAnimationFrame(animate);
      tool.rotation.z += 0.08;
      renderer.render(scene, camera);
    };
    animate();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Expose minimal control API
    window.cncViewer = {
      setLights: ({ intensity, ambient }) => {
        light.intensity = intensity;
        amb.intensity = ambient;
      },
      setGridOpacity: (o) => {
        grid.material.opacity = o;
        grid.material.transparent = o < 1;
      }
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

