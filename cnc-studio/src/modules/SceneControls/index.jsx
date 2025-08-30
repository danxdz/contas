import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

export const meta = {
  id: 'scene',
  name: 'Scene Controls',
  area: 'right',
  order: 3,
  icon: '🎬',
};

export default function SceneControls() {
  // Lighting controls
  const [intensity, setIntensity] = useState(1.2);
  const [ambient, setAmbient] = useState(0.35);
  
  // Scene visibility controls
  const [grid, setGrid] = useState(0.15);
  const [showAxes, setShowAxes] = useState(true);
  const [showTool, setShowTool] = useState(true);
  const [showPath, setShowPath] = useState(true);
  
  // Visual settings
  const [bg, setBg] = useState('#0b1224');
  const [wireframe, setWireframe] = useState(false);
  
  // Camera controls
  const [fov, setFov] = useState(50);
  const [cameraSpeed, setCameraSpeed] = useState(1);

  // Apply lighting changes
  useEffect(() => {
    window.cncViewer?.setLights?.({ intensity, ambient });
  }, [intensity, ambient]);

  // Apply grid changes
  useEffect(() => {
    window.cncViewer?.setGridOpacity?.(grid);
  }, [grid]);

  // Apply background changes
  useEffect(() => {
    window.cncViewer?.setBackground?.(bg);
  }, [bg]);

<<<<<<< HEAD
  const SliderRow = ({ label, min, max, step, value, onChange, format = (v) => v.toFixed(2) }) => {
    const [show, setShow] = useState(false);
    const percent = ((value - min) / (max - min)) * 100;
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          <span style={{ fontSize: 11, opacity: .7 }}>{format(value)}</span>
        </div>
        <div style={{ position: 'relative', padding: '8px 0' }}>
          {show && (
            <span style={{ position: 'absolute', left: `calc(${percent}% + 0px)`, top: -6, transform: 'translate(-50%, -100%)', background: 'rgba(15,26,51,.85)', color: '#cfeaff', border: '1px solid rgba(23,48,77,.7)', borderRadius: 6, padding: '2px 6px', fontSize: 11, pointerEvents: 'none', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
              {format(value)}
            </span>
          )}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            onMouseDown={() => setShow(true)}
            onMouseUp={() => setShow(false)}
            onMouseLeave={() => setShow(false)}
            onTouchStart={() => setShow(true)}
            onTouchEnd={() => setShow(false)}
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
        </div>
      </label>
    );
  };
=======
  // Apply camera FOV changes
  useEffect(() => {
    if (window.cncViewer?.camera) {
      window.cncViewer.camera.fov = fov;
      window.cncViewer.camera.updateProjectionMatrix();
      window.cncViewer.render?.();
    }
  }, [fov]);

  // Scene object visibility controls
  const toggleSceneObject = useCallback((objectName, visible) => {
    if (!window.cncViewer?.scene) return;
    
    const scene = window.cncViewer.scene;
    const obj = scene.getObjectByName(objectName) || scene.children.find(child => 
      child.type === 'AxesHelper' && objectName === 'axes'
    );
    
    if (obj) {
      obj.visible = visible;
      window.cncViewer.render?.();
    }
  }, []);

  // Wireframe toggle
  useEffect(() => {
    if (!window.cncViewer?.scene) return;
    
    window.cncViewer.scene.traverse((child) => {
      if (child.material && child.material.wireframe !== undefined) {
        child.material.wireframe = wireframe;
      }
    });
    window.cncViewer.render?.();
  }, [wireframe]);

  // Camera control functions
  const resetCamera = useCallback(() => {
    if (!window.cncViewer?.camera) return;
    
    const camera = window.cncViewer.camera;
    camera.position.set(3, 3, 2);
    camera.lookAt(0, 0, 0);
    window.cncViewer.render?.();
  }, []);

  const fitToView = useCallback(() => {
    if (!window.cncViewer?.scene || !window.cncViewer?.camera) return;
    
    const scene = window.cncViewer.scene;
    const camera = window.cncViewer.camera;
    
    // Calculate bounding box of all visible objects
    const box = new THREE.Box3();
    scene.traverse((child) => {
      if (child.visible && child.geometry) {
        box.expandByObject(child);
      }
    });
    
    if (!box.isEmpty()) {
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
      
      camera.position.copy(center);
      camera.position.z += distance * 1.5;
      camera.lookAt(center);
      window.cncViewer.render?.();
    }
  }, []);

  // UI Components
  const SliderRow = ({ label, min, max, step, value, onChange, format = (v) => v.toFixed(2) }) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
      <span style={{ minWidth: 80, fontSize: 12 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ width: 42, textAlign: 'right', fontSize: 11, opacity: 0.8 }}>{format(value)}</span>
    </label>
  );
>>>>>>> 718bb79 (Enhanced SceneControls module with better scene control features)

  const CheckboxRow = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ margin: 0 }}
      />
      <span style={{ fontSize: 12 }}>{label}</span>
    </label>
  );

  const ButtonRow = ({ children }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
      {children}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div style={{ 
      fontSize: 11, 
      fontWeight: 600, 
      color: '#9cd2ff', 
      marginTop: 12, 
      marginBottom: 6, 
      textTransform: 'uppercase', 
      letterSpacing: '0.5px',
      borderBottom: '1px solid rgba(23, 48, 77, 0.35)',
      paddingBottom: 2
    }}>
      {title}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SectionHeader title="Lighting" />
      <SliderRow label="Dir Light" min={0} max={3} step={0.05} value={intensity} onChange={setIntensity} />
      <SliderRow label="Ambient" min={0} max={1} step={0.05} value={ambient} onChange={setAmbient} />
      
      <SectionHeader title="Environment" />
      <SliderRow label="Grid" min={0} max={0.6} step={0.05} value={grid} onChange={setGrid} />
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12 }}>Background</span>
        <input 
          type="color" 
          value={bg} 
          onChange={(e) => setBg(e.target.value)}
          style={{ width: 32, height: 24, border: 'none', borderRadius: 4 }}
        />
      </label>
      
      <SectionHeader title="Visibility" />
      <CheckboxRow 
        label="Show Axes" 
        checked={showAxes} 
        onChange={(checked) => {
          setShowAxes(checked);
          toggleSceneObject('axes', checked);
        }} 
      />
      <CheckboxRow 
        label="Show Tool" 
        checked={showTool} 
        onChange={(checked) => {
          setShowTool(checked);
          toggleSceneObject('tool', checked);
        }} 
      />
      <CheckboxRow 
        label="Show Path" 
        checked={showPath} 
        onChange={(checked) => {
          setShowPath(checked);
          toggleSceneObject('path', checked);
        }} 
      />
      <CheckboxRow 
        label="Wireframe" 
        checked={wireframe} 
        onChange={setWireframe} 
      />
      
      <SectionHeader title="Camera" />
      <SliderRow 
        label="FOV" 
        min={20} 
        max={120} 
        step={5} 
        value={fov} 
        onChange={setFov}
        format={(v) => `${v}°`}
      />
      
      <ButtonRow>
        <button onClick={resetCamera} style={{ fontSize: 11, padding: '4px 8px' }}>
          Reset View
        </button>
        <button onClick={fitToView} style={{ fontSize: 11, padding: '4px 8px' }}>
          Fit to View
        </button>
      </ButtonRow>
    </div>
  );
}

