import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Scene3D = ({ 
  simulation, 
  gcode, 
  setupConfig, 
  toolOffsetTable,
  onSceneReady 
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const toolRef = useRef(null);
  const workpieceRef = useRef(null);
  const toolpathRef = useRef(null);
  const originMarkerRef = useRef(null);
  const frameId = useRef(null);

  // Parse G-code positions
  const parseGCodePositions = (gcode) => {
    if (!gcode) return [];
    
    const lines = gcode.split('\n');
    const positions = [];
    let currentX = 0, currentY = 0, currentZ = 0;
    let currentF = 100, currentS = 0;
    let g43Active = false, g41Active = false, g42Active = false;
    let hCode = 0, dCode = 0;
    
    lines.forEach(line => {
      const cleanLine = line.replace(/\(.*?\)/g, '').trim();
      if (!cleanLine || cleanLine.startsWith(';')) return;
      
      // Parse position
      const xMatch = cleanLine.match(/X(-?\d+\.?\d*)/);
      const yMatch = cleanLine.match(/Y(-?\d+\.?\d*)/);
      const zMatch = cleanLine.match(/Z(-?\d+\.?\d*)/);
      const fMatch = cleanLine.match(/F(\d+\.?\d*)/);
      const sMatch = cleanLine.match(/S(\d+)/);
      
      if (xMatch) currentX = parseFloat(xMatch[1]);
      if (yMatch) currentY = parseFloat(yMatch[1]);
      if (zMatch) currentZ = parseFloat(zMatch[1]);
      if (fMatch) currentF = parseFloat(fMatch[1]);
      if (sMatch) currentS = parseInt(sMatch[1]);
      
      // Check for tool compensation
      if (/G43/.test(cleanLine)) g43Active = true;
      if (/G49/.test(cleanLine)) g43Active = false;
      if (/G41/.test(cleanLine)) { g41Active = true; g42Active = false; }
      if (/G42/.test(cleanLine)) { g42Active = true; g41Active = false; }
      if (/G40/.test(cleanLine)) { g41Active = false; g42Active = false; }
      
      const hMatch = cleanLine.match(/H(\d+)/);
      const dMatch = cleanLine.match(/D(\d+)/);
      if (hMatch) hCode = parseInt(hMatch[1]);
      if (dMatch) dCode = parseInt(dMatch[1]);
      
      // Check move type
      const isRapid = /G0+\b/i.test(cleanLine);
      const isFeed = /G0?[123]\b/i.test(cleanLine);
      
      positions.push({
        x: currentX,
        y: currentY,
        z: currentZ,
        f: currentF,
        s: currentS,
        rapid: isRapid,
        feed: isFeed,
        g43: g43Active,
        g41: g41Active,
        g42: g42Active,
        h: hCode,
        d: dCode
      });
    });
    
    return positions;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 500, 2000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      5000
    );
    camera.position.set(300, 300, 500);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 200);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.5);
    pointLight.position.set(-100, -100, 100);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(500, 50, 0x00d4ff, 0x003366);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Machine bed
    const bedGeometry = new THREE.BoxGeometry(600, 400, 20);
    const bedMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2
    });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.z = -10;
    bed.receiveShadow = true;
    scene.add(bed);

    // Workpiece (top at Z=0)
    const workpieceGroup = new THREE.Group();
    
    const stockGeometry = new THREE.BoxGeometry(150, 100, 50);
    const stockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      metalness: 0.7,
      roughness: 0.3
    });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.z = -25; // Top at 0, bottom at -50
    stock.castShadow = true;
    stock.receiveShadow = true;
    workpieceGroup.add(stock);

    scene.add(workpieceGroup);
    workpieceRef.current = workpieceGroup;

    // Tool
    const toolGroup = new THREE.Group();
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 50, 32);
    const toolMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.rotation.x = Math.PI / 2;
    toolGroup.add(tool);
    
    toolGroup.position.set(0, 0, 50); // Start above workpiece
    scene.add(toolGroup);
    toolRef.current = toolGroup;

    // Origin marker
    const originGroup = new THREE.Group();
    
    // X axis - Red
    const xAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = 15;
    originGroup.add(xAxis);
    
    // Y axis - Green
    const yAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
    yAxis.rotation.x = Math.PI / 2;
    yAxis.position.y = 15;
    originGroup.add(yAxis);
    
    // Z axis - Blue
    const zAxisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0080ff });
    const zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
    zAxis.position.z = 15;
    originGroup.add(zAxis);
    
    scene.add(originGroup);
    originMarkerRef.current = originGroup;

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
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

    // Notify parent
    if (onSceneReady) {
      onSceneReady({
        scene: sceneRef.current,
        camera: cameraRef.current,
        renderer: rendererRef.current,
        controls: controlsRef.current,
        toolRef: toolRef.current,
        workpieceRef: workpieceRef.current,
        originMarkerRef: originMarkerRef.current,
        updateTool3D: (assembly) => {
          // Update tool visualization based on assembly
          if (window.updateTool3D) {
            window.updateTool3D(assembly);
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update tool position
  useEffect(() => {
    if (!toolRef.current) return;

    const positions = parseGCodePositions(gcode);
    if (positions.length === 0) return;

    const safeCurrentLine = Math.min(
      Math.max(0, simulation.currentLine), 
      positions.length - 1
    );
    const currentPos = positions[safeCurrentLine];

    if (currentPos) {
      // Get active work offset
      const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      
      // Get tool length compensation
      let toolLengthComp = 0;
      if (currentPos.g43 && currentPos.h > 0 && currentPos.h < toolOffsetTable.H.length) {
        const hOffset = toolOffsetTable.H[currentPos.h];
        toolLengthComp = hOffset.lengthGeometry + hOffset.lengthWear;
      }

      // Apply position with offsets
      const toolControlZ = currentPos.g43 ?
        currentPos.z + activeOffset.z - toolLengthComp :
        currentPos.z + activeOffset.z + 30;

      toolRef.current.position.set(
        currentPos.x + activeOffset.x,
        currentPos.y + activeOffset.y,
        toolControlZ
      );
    }
  }, [simulation.currentLine, gcode, setupConfig, toolOffsetTable]);

  // Update origin marker
  useEffect(() => {
    if (originMarkerRef.current && setupConfig.workOffsets) {
      const activeOffset = setupConfig.workOffsets[setupConfig.workOffsets.activeOffset];
      originMarkerRef.current.position.set(activeOffset.x, activeOffset.y, activeOffset.z);
    }
  }, [setupConfig]);

  return <div ref={mountRef} className="viewport-3d" style={{ width: '100%', height: '100%' }} />;
};

export default Scene3D;