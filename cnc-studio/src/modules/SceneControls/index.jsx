import * as THREE from 'three';

export const meta = {
  id: 'scene',
  name: 'Scene Controls v1.1',
  area: 'right',
  order: 3,
  icon: '🎬',
};

export default function SceneControls() {
  // Simple direct approach like the working Controls module
  const handleLightChange = (type, value) => {
    if (type === 'intensity') {
      window.cncViewer?.setLights?.({ intensity: value, ambient: window.cncViewer.ambientLevel || 0.35 });
    } else if (type === 'ambient') {
      window.cncViewer?.setLights?.({ intensity: window.cncViewer.lightLevel || 1.2, ambient: value });
      window.cncViewer.ambientLevel = value;
    }
    window.cncViewer.lightLevel = type === 'intensity' ? value : (window.cncViewer.lightLevel || 1.2);
  };

  const handleGridChange = (value) => {
    window.cncViewer?.setGridOpacity?.(value);
  };

  const handleBgChange = (color1, color2 = null) => {
    if (color2) {
      // Create gradient
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const texture = new THREE.CanvasTexture(canvas);
      if (window.cncViewer?.scene) {
        window.cncViewer.scene.background = texture;
      }
    } else {
      window.cncViewer?.setBackground?.(color1);
    }
  };

  const toggleVisibility = (objectName) => {
    if (!window.cncViewer?.scene) return;
    
    const scene = window.cncViewer.scene;
    let obj = scene.getObjectByName(objectName);
    
    if (!obj && objectName === 'axes') {
      obj = scene.children.find(child => child.type === 'AxesHelper');
    }
    
    if (obj) {
      obj.visible = !obj.visible;
      window.cncViewer.render?.();
    }
  };

  const toggleWireframe = () => {
    if (!window.cncViewer?.scene) return;
    
    let wireframeEnabled = false;
    window.cncViewer.scene.traverse((child) => {
      if (child.material && child.material.wireframe !== undefined) {
        wireframeEnabled = child.material.wireframe;
      }
    });
    
    window.cncViewer.scene.traverse((child) => {
      if (child.material && child.material.wireframe !== undefined) {
        child.material.wireframe = !wireframeEnabled;
      }
    });
    window.cncViewer.render?.();
  };

  const resetCamera = () => {
    if (!window.cncViewer?.camera) return;
    
    const camera = window.cncViewer.camera;
    camera.position.set(3, 3, 2);
    camera.lookAt(0, 0, 0);
    window.cncViewer.render?.();
  };

  const fitToView = () => {
    if (!window.cncViewer?.scene || !window.cncViewer?.camera) return;
    
    const scene = window.cncViewer.scene;
    const camera = window.cncViewer.camera;
    
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Lighting */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9cd2ff', textTransform: 'uppercase' }}>Lighting</div>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>Dir Light</span>
        <input type="range" min="0" max="3" step="0.05" defaultValue="1.2" 
               onChange={(e) => handleLightChange('intensity', parseFloat(e.target.value))} />
      </label>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>Ambient</span>
        <input type="range" min="0" max="1" step="0.05" defaultValue="0.35" 
               onChange={(e) => handleLightChange('ambient', parseFloat(e.target.value))} />
      </label>

      {/* Environment */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9cd2ff', textTransform: 'uppercase', marginTop: 12 }}>Environment</div>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>Grid</span>
        <input type="range" min="0" max="0.6" step="0.05" defaultValue="0.15" 
               onChange={(e) => handleGridChange(parseFloat(e.target.value))} />
      </label>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12 }}>Background:</span>
        <input type="color" defaultValue="#0b1224" 
               onChange={(e) => handleBgChange(e.target.value)} 
               style={{ width: 32, height: 24, border: 'none', borderRadius: 4 }} />
        <input type="color" defaultValue="#1a2332" 
               onChange={(e) => handleBgChange(document.querySelector('input[type="color"]').value, e.target.value)} 
               style={{ width: 32, height: 24, border: 'none', borderRadius: 4 }} />
      </div>

      {/* Visibility */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9cd2ff', textTransform: 'uppercase', marginTop: 12 }}>Visibility</div>
      
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => toggleVisibility('axes')}>Toggle Axes</button>
        <button onClick={() => toggleVisibility('tool')}>Toggle Tool</button>
        <button onClick={() => toggleVisibility('path')}>Toggle Path</button>
        <button onClick={toggleWireframe}>Toggle Wireframe</button>
      </div>

      {/* Camera */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9cd2ff', textTransform: 'uppercase', marginTop: 12 }}>Camera</div>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>FOV</span>
        <input type="range" min="20" max="120" step="5" defaultValue="50" 
               onChange={(e) => {
                 const fov = parseFloat(e.target.value);
                 if (window.cncViewer?.camera) {
                   window.cncViewer.camera.fov = fov;
                   window.cncViewer.camera.updateProjectionMatrix();
                   window.cncViewer.render?.();
                 }
               }} />
      </label>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={resetCamera}>Reset View</button>
        <button onClick={fitToView}>Fit to View</button>
      </div>
    </div>
  );
}

