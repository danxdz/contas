import * as THREE from 'three';

export function createAxes(size = 0.5) {
  return new THREE.AxesHelper(size);
}

export function createTable(width = 2, depth = 1, height = 0.1) {
  const geo = new THREE.BoxGeometry(width, depth, height);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b2a3f, metalness: 0.1, roughness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, -height / 2);
  mesh.receiveShadow = true;
  return mesh;
}

export function createTool(color = 0xffcc00) {
  const shaft = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 24);
  const tip = new THREE.ConeGeometry(0.05, 0.1, 32);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c0, metalness: 0.6, roughness: 0.3 });
  const tipMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
  const shaftMesh = new THREE.Mesh(shaft, shaftMat);
  const tipMesh = new THREE.Mesh(tip, tipMat);
  // Build tool along local -Y, then rotate group to Z-up
  shaftMesh.position.y = -0.25;
  tipMesh.position.y = -0.55;
  tipMesh.rotation.x = Math.PI; // point cone to -Y
  const group = new THREE.Group();
  group.add(shaftMesh);
  group.add(tipMesh);
  group.castShadow = true;
  // Rotate the whole tool so that -Y maps to -Z (spindle/tool along Z)
  group.rotation.x = Math.PI / 2;
  return group;
}

export function createPathLine(points) {
  const curvePts = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const geo = new THREE.BufferGeometry().setFromPoints(curvePts);
  const mat = new THREE.LineBasicMaterial({ color: 0x2aa8ff, transparent: true, opacity: 0.8 });
  return new THREE.Line(geo, mat);
}

