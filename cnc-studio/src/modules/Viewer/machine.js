import * as THREE from 'three';
import { mmToWorld } from '../shared/units';

export function createAxes(size = 0.5) {
  return new THREE.AxesHelper(size);
}

export function createTable(widthMm = 2000, depthMm = 1200, heightMm = 100) {
  // Convert mm dimensions to world units
  const width = mmToWorld(widthMm);
  const depth = mmToWorld(depthMm);
  const height = mmToWorld(heightMm);
  
  const geo = new THREE.BoxGeometry(width, depth, height);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b2a3f, metalness: 0.1, roughness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, -height / 2);
  mesh.receiveShadow = true;
  return mesh;
}

export function createTool(color = 0xffcc00) {
  // Tool dimensions in mm
  const shaftDiaMm = 6;     // 6mm diameter shaft
  const shaftLenMm = 40;    // 40mm length
  const tipDiaMm = 10;      // 10mm diameter at base
  const tipLenMm = 10;      // 10mm length
  const holderDiaMm = 24;   // 24mm diameter holder
  const holderLenMm = 20;   // 20mm length
  
  // Convert to world units
  const shaft = new THREE.CylinderGeometry(
    mmToWorld(shaftDiaMm/2), mmToWorld(shaftDiaMm/2), mmToWorld(shaftLenMm), 24
  );
  const tip = new THREE.ConeGeometry(
    mmToWorld(tipDiaMm/2), mmToWorld(tipLenMm), 32
  );
  const holder = new THREE.CylinderGeometry(
    mmToWorld(holderDiaMm/2), mmToWorld(holderDiaMm/2), mmToWorld(holderLenMm), 24
  );
  
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c0, metalness: 0.6, roughness: 0.3 });
  const tipMat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
  const holderMat = new THREE.MeshStandardMaterial({ color: 0x555b66, metalness: 0.5, roughness: 0.4 });
  const shaftMesh = new THREE.Mesh(shaft, shaftMat);
  const tipMesh = new THREE.Mesh(tip, tipMat);
  const holderMesh = new THREE.Mesh(holder, holderMat);
  
  // Build tool along local -Y, then rotate group to Z-up
  // Position in world units
  shaftMesh.position.y = mmToWorld(-25);  // Center at -25mm
  tipMesh.position.y = mmToWorld(-55);    // Tip at -55mm
  tipMesh.rotation.x = Math.PI; // point cone to -Y
  holderMesh.position.y = mmToWorld(10);  // Holder at 10mm
  const group = new THREE.Group();
  group.add(shaftMesh);
  group.add(tipMesh);
  group.add(holderMesh);
  group.castShadow = true;
  // Rotate the whole tool so that -Y maps to -Z (spindle/tool along Z)
  group.rotation.x = Math.PI / 2;
  return group;
}

export function createPathLine(points) {
  // Points are expected to be in mm, convert to world units
  const curvePts = points.map(p => new THREE.Vector3(
    mmToWorld(p.x), 
    mmToWorld(p.y), 
    mmToWorld(p.z)
  ));
  const geo = new THREE.BufferGeometry().setFromPoints(curvePts);
  const mat = new THREE.LineBasicMaterial({ color: 0x2aa8ff, transparent: true, opacity: 0.8 });
  return new THREE.Line(geo, mat);
}

