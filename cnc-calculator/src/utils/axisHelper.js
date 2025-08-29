import * as THREE from 'three';

/**
 * Creates a reusable coordinate axis visualization
 * @param {number} size - Size of the axes (default 30)
 * @param {number} thickness - Thickness of the axis cylinders (default 0.5)
 * @param {boolean} showLabels - Whether to show X, Y, Z labels (default false)
 * @returns {THREE.Group} Group containing the axis visualization
 */
export const createAxisHelper = (size = 30, thickness = 0.5, showLabels = false) => {
  const axisGroup = new THREE.Group();
  axisGroup.name = 'axisHelper';
  
  // Scale cone size proportionally
  const coneHeight = size * 0.15;
  const coneRadius = thickness * 3;
  
  // X axis - Red (pointing right)
  const xAxisGeometry = new THREE.CylinderGeometry(thickness, thickness, size, 8);
  const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
  xAxis.rotation.z = Math.PI / 2;
  xAxis.position.x = size / 2;
  axisGroup.add(xAxis);
  
  // X cone
  const xConeGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
  const xCone = new THREE.Mesh(xConeGeometry, xAxisMaterial);
  xCone.rotation.z = -Math.PI / 2;
  xCone.position.x = size + coneHeight / 2;
  axisGroup.add(xCone);
  
  // Y axis - Green (pointing forward in CNC convention)
  const yAxisGeometry = new THREE.CylinderGeometry(thickness, thickness, size, 8);
  const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
  yAxis.rotation.x = -Math.PI / 2;  // Corrected for CNC convention
  yAxis.position.y = size / 2;
  axisGroup.add(yAxis);
  
  // Y cone
  const yConeGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
  const yCone = new THREE.Mesh(yConeGeometry, yAxisMaterial);
  yCone.rotation.x = -Math.PI / 2;  // Corrected for CNC convention
  yCone.position.y = size + coneHeight / 2;
  axisGroup.add(yCone);
  
  // Z axis - Blue (pointing up)
  const zAxisGeometry = new THREE.CylinderGeometry(thickness, thickness, size, 8);
  const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0080ff });
  const zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
  zAxis.position.z = size / 2;
  axisGroup.add(zAxis);
  
  // Z cone
  const zConeGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
  const zCone = new THREE.Mesh(zConeGeometry, zAxisMaterial);
  zCone.position.z = size + coneHeight / 2;
  axisGroup.add(zCone);
  
  // Optional: Add labels
  if (showLabels) {
    // Create text sprites for labels
    const createLabel = (text, color, position) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      context.fillStyle = color;
      context.font = 'bold 48px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(size * 0.3, size * 0.3, 1);
      sprite.position.copy(position);
      
      return sprite;
    };
    
    // Add labels
    axisGroup.add(createLabel('X', '#ff0000', new THREE.Vector3(size + coneHeight + 5, 0, 0)));
    axisGroup.add(createLabel('Y', '#00ff00', new THREE.Vector3(0, size + coneHeight + 5, 0)));
    axisGroup.add(createLabel('Z', '#0080ff', new THREE.Vector3(0, 0, size + coneHeight + 5)));
  }
  
  return axisGroup;
};

/**
 * Creates a small coordinate system indicator (for tool tip)
 * @returns {THREE.Group} Small axis indicator
 */
export const createToolAxisIndicator = () => {
  return createAxisHelper(10, 0.2, false);
};

/**
 * Creates a medium coordinate system (for work offsets)
 * @returns {THREE.Group} Medium axis indicator
 */
export const createWorkOffsetAxis = () => {
  return createAxisHelper(30, 0.5, true);
};

/**
 * Creates the main machine coordinate system
 * @returns {THREE.Group} Large axis indicator
 */
export const createMachineAxis = () => {
  return createAxisHelper(200, 1, false);
};