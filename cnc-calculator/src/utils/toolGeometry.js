import * as THREE from 'three';

export const rebuildToolGeometry = (toolGroup, assembly) => {
  // Store current assembly in tool userData
  toolGroup.userData.currentAssembly = assembly;
  
  // Clear existing tool meshes (keep coordinate system and ruler)
  const coordSystem = toolGroup.getObjectByName('toolCoordSystem');
  const ruler = toolGroup.getObjectByName('stickoutRuler');
  toolGroup.clear();
  if (coordSystem) toolGroup.add(coordSystem);
  if (ruler) {
    // Update ruler indicator position based on assembly stickout
    const stickout = assembly?.components?.tool?.stickout || 30;
    const indicator = ruler.getObjectByName('stickoutIndicator');
    if (indicator) {
      indicator.position.z = -stickout;
    }
    toolGroup.add(ruler);
  }
  
  // Check for new assembly structure from ToolManagerPro
  const hasComponents = assembly?.components;
  const tool = hasComponents ? assembly.components.tool : assembly?.tool;
  const holder = hasComponents ? assembly.components.holder : assembly?.holder;
  
  if (!assembly || !tool) {
    // Default tool visualization
    const holderGeometry = new THREE.CylinderGeometry(12, 12, 40, 32);
    const holderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.1
    });
    const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);
    holderMesh.rotation.x = Math.PI / 2;
    holderMesh.position.z = 20;
    toolGroup.add(holderMesh);
    
    const toolGeometry = new THREE.CylinderGeometry(5, 5, 30, 32);
    const toolMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3
    });
    const toolMesh = new THREE.Mesh(toolGeometry, toolMaterial);
    toolMesh.rotation.x = Math.PI / 2;
    toolMesh.position.z = -5;
    toolGroup.add(toolMesh);
    return;
  }
  
  // Build tool based on assembly data
  const holderType = holder || 'ISO40';
  const toolData = tool;
  
  // Holder visualization
  let holderColor = 0x333333;
  let holderSize = 40;
  if (holderType.includes('SK40')) {
    holderColor = 0x2a2a2a;
    holderSize = 45;
  } else if (holderType.includes('CAT40')) {
    holderColor = 0x3a3a3a;
    holderSize = 48;
  } else if (holderType.includes('HSK')) {
    holderColor = 0x4a4a4a;
    holderSize = 42;
  }
  
  // Create holder with taper
  const holderTopRadius = 15;
  const holderBottomRadius = 10;
  const holderGeometry = new THREE.CylinderGeometry(
    holderBottomRadius, 
    holderTopRadius, 
    holderSize, 
    32
  );
  const holderMaterial = new THREE.MeshStandardMaterial({ 
    color: holderColor,
    metalness: 0.95,
    roughness: 0.05
  });
  const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);
  holderMesh.rotation.x = Math.PI / 2;
  holderMesh.position.z = holderSize / 2;
  toolGroup.add(holderMesh);
  
  // Collet/Chuck
  const colletRadius = (toolData.diameter / 2) + 2;
  const colletGeometry = new THREE.CylinderGeometry(
    colletRadius, 
    colletRadius + 2, 
    15, 
    16
  );
  const colletMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    metalness: 0.9,
    roughness: 0.1
  });
  const collet = new THREE.Mesh(colletGeometry, colletMaterial);
  collet.rotation.x = Math.PI / 2;
  collet.position.z = -5;
  toolGroup.add(collet);
  
  // Tool visualization based on type
  const toolRadius = toolData.diameter / 2;
  const cuttingLength = toolData.cuttingLength || 30;
  const flutes = toolData.flutes || 2;
  
  // Tool shank
  const shankGeometry = new THREE.CylinderGeometry(
    toolRadius, 
    toolRadius, 
    20, 
    16
  );
  const shankMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    metalness: 0.98,
    roughness: 0.02
  });
  const shank = new THREE.Mesh(shankGeometry, shankMaterial);
  shank.rotation.x = Math.PI / 2;
  shank.position.z = -15;
  toolGroup.add(shank);
  
  // Cutting part with coating color
  let toolColor = 0xcccccc;
  let emissiveColor = 0x00ff00;
  if (toolData.coating === 'TiAlN') {
    toolColor = 0x9966ff;
    emissiveColor = 0x6633ff;
  } else if (toolData.coating === 'AlTiN') {
    toolColor = 0x6666ff;
    emissiveColor = 0x3333ff;
  } else if (toolData.coating === 'TiN') {
    toolColor = 0xffcc00;
    emissiveColor = 0xff9900;
  } else if (toolData.coating === 'DLC') {
    toolColor = 0x111111;
    emissiveColor = 0x333333;
  }
  
  if (toolData.type === 'End Mill') {
    // End mill with flutes
    const cuttingGeometry = new THREE.CylinderGeometry(
      toolRadius * 0.95, 
      toolRadius, 
      cuttingLength, 
      flutes * 6
    );
    const cuttingMaterial = new THREE.MeshPhongMaterial({ 
      color: toolColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.2,
      metalness: 0.99,
      roughness: 0.01
    });
    const cutting = new THREE.Mesh(cuttingGeometry, cuttingMaterial);
    cutting.rotation.x = Math.PI / 2;
    cutting.position.z = -25 - cuttingLength / 2;
    cutting.userData.isCuttingPart = true;
    cutting.userData.originalZ = -25 - cuttingLength / 2;
    toolGroup.add(cutting);
    
    // Add flute spirals
    for (let i = 0; i < flutes; i++) {
      const angle = (i * Math.PI * 2) / flutes;
      const fluteGeometry = new THREE.BoxGeometry(0.5, 0.5, cuttingLength);
      const fluteMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x001100,
        emissive: 0x00ff00,
        emissiveIntensity: 0.1
      });
      const flute = new THREE.Mesh(fluteGeometry, fluteMaterial);
      flute.position.x = Math.cos(angle) * toolRadius * 0.8;
      flute.position.y = Math.sin(angle) * toolRadius * 0.8;
      flute.position.z = -25 - cuttingLength / 2;
      toolGroup.add(flute);
    }
  } else if (toolData.type === 'Ball Mill') {
    // Ball nose end mill
    const ballGeometry = new THREE.SphereGeometry(toolRadius, 16, 16);
    const ballMaterial = new THREE.MeshPhongMaterial({ 
      color: toolColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.2
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.z = -25 - cuttingLength;
    ball.userData.isCuttingPart = true;
    ball.userData.originalZ = -25 - cuttingLength;
    toolGroup.add(ball);
    
    const neckGeometry = new THREE.CylinderGeometry(
      toolRadius * 0.9, 
      toolRadius, 
      cuttingLength - toolRadius, 
      16
    );
    const neck = new THREE.Mesh(neckGeometry, ballMaterial);
    neck.rotation.x = Math.PI / 2;
    neck.position.z = -25 - (cuttingLength - toolRadius) / 2;
    toolGroup.add(neck);
  } else if (toolData.type === 'Face Mill') {
    // Face mill with inserts
    const faceGeometry = new THREE.CylinderGeometry(
      toolRadius, 
      toolRadius * 1.1, 
      10, 
      8
    );
    const faceMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      metalness: 0.9,
      roughness: 0.1
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.rotation.x = Math.PI / 2;
    face.position.z = -30;
    toolGroup.add(face);
    
    // Add carbide inserts
    const insertCount = toolData.inserts || 5;
    for (let i = 0; i < insertCount; i++) {
      const angle = (i * Math.PI * 2) / insertCount;
      const insertGeometry = new THREE.BoxGeometry(3, 3, 1.5);
      const insertMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffcc00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
      });
      const insert = new THREE.Mesh(insertGeometry, insertMaterial);
      insert.position.x = Math.cos(angle) * toolRadius * 0.85;
      insert.position.y = Math.sin(angle) * toolRadius * 0.85;
      insert.position.z = -30;
      insert.rotation.z = angle;
      toolGroup.add(insert);
    }
  } else if (toolData.type === 'Drill') {
    // Drill with point
    const drillBodyGeometry = new THREE.CylinderGeometry(
      toolRadius, 
      toolRadius, 
      cuttingLength - toolRadius * 2, 
      16
    );
    const drillMaterial = new THREE.MeshPhongMaterial({ 
      color: toolColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.2
    });
    const drillBody = new THREE.Mesh(drillBodyGeometry, drillMaterial);
    drillBody.rotation.x = Math.PI / 2;
    drillBody.position.z = -25 - (cuttingLength - toolRadius * 2) / 2;
    toolGroup.add(drillBody);
    
    // Drill point
    const pointGeometry = new THREE.ConeGeometry(toolRadius, toolRadius * 2, 16);
    const point = new THREE.Mesh(pointGeometry, drillMaterial);
    point.rotation.x = Math.PI;
    point.position.z = -25 - cuttingLength + toolRadius;
    toolGroup.add(point);
  } else {
    // Default tool
    const defaultGeometry = new THREE.CylinderGeometry(
      toolRadius, 
      toolRadius, 
      cuttingLength, 
      16
    );
    const defaultMaterial = new THREE.MeshPhongMaterial({ 
      color: toolColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.3
    });
    const defaultTool = new THREE.Mesh(defaultGeometry, defaultMaterial);
    defaultTool.rotation.x = Math.PI / 2;
    defaultTool.position.z = -25 - cuttingLength / 2;
    defaultTool.userData.isCuttingPart = true;
    defaultTool.userData.originalZ = -25 - cuttingLength / 2;
    toolGroup.add(defaultTool);
  }
  
  // Update tool length in userData
  const actualLength = cuttingLength + 25; // Total from holder base
  toolGroup.userData.toolLength = actualLength;
};

export const createRuler = (maxLength = 100) => {
  const rulerGroup = new THREE.Group();
  rulerGroup.name = 'stickoutRuler';
  
  // Main ruler line
  const rulerGeometry = new THREE.BufferGeometry();
  const points = [
    new THREE.Vector3(15, 0, 0),
    new THREE.Vector3(15, 0, -maxLength)
  ];
  rulerGeometry.setFromPoints(points);
  const rulerMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffff00,
    opacity: 0.7,
    transparent: true
  });
  const rulerLine = new THREE.Line(rulerGeometry, rulerMaterial);
  rulerGroup.add(rulerLine);
  
  // Tick marks every 10mm
  for (let i = 0; i <= maxLength; i += 10) {
    const tickGeometry = new THREE.BufferGeometry();
    const tickPoints = [
      new THREE.Vector3(13, 0, -i),
      new THREE.Vector3(17, 0, -i)
    ];
    tickGeometry.setFromPoints(tickPoints);
    const tick = new THREE.Line(tickGeometry, rulerMaterial);
    rulerGroup.add(tick);
  }
  
  // Current stickout indicator
  const indicatorGeometry = new THREE.ConeGeometry(2, 4, 4);
  const indicatorMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    emissive: 0x00ff00
  });
  const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.name = 'stickoutIndicator';
  indicator.rotation.z = -Math.PI / 2;
  indicator.position.set(19, 0, -30); // Default position
  rulerGroup.add(indicator);
  
  return rulerGroup;
};