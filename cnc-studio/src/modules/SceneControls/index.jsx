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
      window.cncViewer?.setLights?.({ intensity: value, ambient: window.cncViewer.ambientLevel || 0.6 });
    } else if (type === 'ambient') {
      window.cncViewer?.setLights?.({ intensity: window.cncViewer.lightLevel || 2.0, ambient: value });
      window.cncViewer.ambientLevel = value;
    }
    window.cncViewer.lightLevel = type === 'intensity' ? value : (window.cncViewer.lightLevel || 2.0);
  };

  const handleGridChange = (value) => {
    window.cncViewer?.setGridOpacity?.(value);
  };

  const handleBgChange = (color1, color2 = null, direction = 'vertical', size = 'M') => {
    if (color2) {
      // Create gradient with configurable direction and size
      const canvas = document.createElement('canvas');
      canvas.width = 2048;  // Much larger canvas
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      
      // Size multipliers for gradient spread
      const sizeMultipliers = { S: 0.3, M: 1.0, L: 2.5 };
      const mult = sizeMultipliers[size] || 1.0;
      
      let gradient;
      switch (direction) {
        case 'horizontal':
          gradient = ctx.createLinearGradient(0, 0, canvas.width * mult, 0);
          break;
        case 'diagonal':
          gradient = ctx.createLinearGradient(0, 0, canvas.width * mult, canvas.height * mult);
          break;
        case 'radial':
          const radius = (canvas.width / 2) * mult;
          gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, radius);
          break;
        case 'vertical':
        default:
          gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * mult);
          break;
      }
      
      // Create much more faded/subtle gradients
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.3, color1);  // Hold first color longer
      gradient.addColorStop(0.7, color2);  // Start second color later
      gradient.addColorStop(1, color2);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
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
        <input type="range" min="0" max="3" step="0.05" defaultValue="2.0" 
               onChange={(e) => handleLightChange('intensity', parseFloat(e.target.value))} />
      </label>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>Ambient</span>
        <input type="range" min="0" max="1" step="0.05" defaultValue="0.6" 
               onChange={(e) => handleLightChange('ambient', parseFloat(e.target.value))} />
      </label>

      {/* Environment */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9cd2ff', textTransform: 'uppercase', marginTop: 12 }}>Environment</div>
      
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ minWidth: 70, fontSize: 12 }}>Grid</span>
        <input type="range" min="0" max="0.6" step="0.05" defaultValue="0.15" 
               onChange={(e) => handleGridChange(parseFloat(e.target.value))} />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12 }}>Background:</span>
          <input type="color" defaultValue="#1a2a42" 
                 onChange={(e) => handleBgChange(e.target.value)} 
                 style={{ width: 32, height: 24, border: 'none', borderRadius: 4 }} />
          <input type="color" defaultValue="#2a3a52" 
                 onChange={(e) => {
                   const color1 = document.querySelectorAll('input[type="color"]')[0].value;
                   const direction = document.querySelector('select').value;
                   handleBgChange(color1, e.target.value, direction);
                 }} 
                 style={{ width: 32, height: 24, border: 'none', borderRadius: 4 }} />
        </div>
        
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12 }}>Direction:</span>
            <select onChange={(e) => {
              const color1 = document.querySelectorAll('input[type="color"]')[0].value;
              const color2 = document.querySelectorAll('input[type="color"]')[1].value;
              const size = document.querySelectorAll('select')[1]?.value || 'M';
              handleBgChange(color1, color2, e.target.value, size);
            }} style={{ fontSize: 11, padding: '2px 4px' }}>
              <option value="vertical">↕ Vertical</option>
              <option value="horizontal">↔ Horizontal</option>
              <option value="diagonal">↗ Diagonal</option>
              <option value="radial">⊙ Radial</option>
            </select>
          </label>
          
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12 }}>Size:</span>
            <select onChange={(e) => {
              const color1 = document.querySelectorAll('input[type="color"]')[0].value;
              const color2 = document.querySelectorAll('input[type="color"]')[1].value;
              const direction = document.querySelectorAll('select')[0]?.value || 'vertical';
              handleBgChange(color1, color2, direction, e.target.value);
            }} style={{ fontSize: 11, padding: '2px 4px' }}>
              <option value="S">S</option>
              <option value="M" selected>M</option>
              <option value="L">L</option>
            </select>
          </label>
        </div>
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

