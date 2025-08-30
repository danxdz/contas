import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(4, 5, 6);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const grid = new THREE.GridHelper(10, 10, 0x123a5a, 0x123a5a);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);

    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2aa8ff, roughness: 0.4, metalness: 0.2 });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

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
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(23,48,77,.35)' }} />
  );
}

