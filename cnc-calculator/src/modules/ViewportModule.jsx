import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ViewportModule = ({ sharedState, updateState, messageBus }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1f2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(150, 150, 150);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x333333, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Stock
    const stockGeometry = new THREE.BoxGeometry(100, 100, 50);
    const stockMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x888888,
      transparent: true,
      opacity: 0.8
    });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.z = 25;
    scene.add(stock);

    // Tool
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 50, 16);
    const toolMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotation.x = Math.PI / 2;
    tool.position.set(0, 0, 75);
    scene.add(tool);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Listen for G-code changes
    const handleGCodeParsed = (e) => {
      console.log('G-code parsed:', e.detail);
      // Update toolpath visualization here
    };
    messageBus.on('gcode:parsed', handleGCodeParsed);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [messageBus]);

  return (
    <div className="module viewport-module">
      <div className="module-header">
        3D Viewport
        <div style={{ float: 'right', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => messageBus.emit('view:reset', {})}
            style={{
              padding: '2px 8px',
              background: '#2a2f3e',
              border: '1px solid #333',
              color: '#888',
              fontSize: '11px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Reset View
          </button>
        </div>
      </div>
      <div 
        ref={mountRef}
        className="module-content"
        style={{ padding: 0 }}
      />
    </div>
  );
};

export default ViewportModule;