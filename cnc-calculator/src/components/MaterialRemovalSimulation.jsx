import * as THREE from 'three';

class MaterialRemovalSimulation {
  constructor(scene, stockDimensions) {
    this.scene = scene;
    this.stockDimensions = stockDimensions;
    this.voxelSize = 2; // 2mm voxels for balance between performance and accuracy
    this.voxelGrid = null;
    this.stockMesh = null;
    this.removedMaterial = [];
    this.collisions = [];
    
    this.initializeStock();
  }

  initializeStock() {
    // Calculate voxel grid dimensions
    this.gridSize = {
      x: Math.ceil(this.stockDimensions.x / this.voxelSize),
      y: Math.ceil(this.stockDimensions.y / this.voxelSize),
      z: Math.ceil(this.stockDimensions.z / this.voxelSize)
    };

    // Initialize 3D voxel grid (true = material present)
    this.voxelGrid = new Array(this.gridSize.x);
    for (let x = 0; x < this.gridSize.x; x++) {
      this.voxelGrid[x] = new Array(this.gridSize.y);
      for (let y = 0; y < this.gridSize.y; y++) {
        this.voxelGrid[x][y] = new Array(this.gridSize.z).fill(true);
      }
    }

    // Create initial stock mesh
    this.updateStockMesh();
  }

  updateStockMesh() {
    // Remove old mesh
    if (this.stockMesh) {
      this.scene.remove(this.stockMesh);
      this.stockMesh.geometry.dispose();
      this.stockMesh.material.dispose();
    }

    // Create geometry from voxel grid using marching cubes or simple boxes
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];
    const colors = [];

    // Simple box representation for each voxel
    for (let x = 0; x < this.gridSize.x; x++) {
      for (let y = 0; y < this.gridSize.y; y++) {
        for (let z = 0; z < this.gridSize.z; z++) {
          if (this.voxelGrid[x][y][z]) {
            // Add voxel box vertices
            const vx = x * this.voxelSize - this.stockDimensions.x / 2;
            const vy = y * this.voxelSize - this.stockDimensions.y / 2;
            const vz = z * this.voxelSize;

            // Only add visible faces (optimization)
            this.addVisibleFaces(vertices, normals, colors, x, y, z, vx, vy, vz);
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingBox();

    // Create material with vertex colors
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 100,
      specular: 0x222222
    });

    this.stockMesh = new THREE.Mesh(geometry, material);
    this.stockMesh.castShadow = true;
    this.stockMesh.receiveShadow = true;
    this.scene.add(this.stockMesh);
  }

  addVisibleFaces(vertices, normals, colors, x, y, z, vx, vy, vz) {
    const s = this.voxelSize;
    const isEdge = (x === 0 || x === this.gridSize.x - 1 ||
                    y === 0 || y === this.gridSize.y - 1 ||
                    z === 0 || z === this.gridSize.z - 1);
    
    // Check each face for visibility
    const faces = [
      { // Front
        check: () => y === 0 || !this.voxelGrid[x][y-1][z],
        verts: [[0,0,s], [s,0,s], [s,0,0], [0,0,0]],
        normal: [0,-1,0]
      },
      { // Back
        check: () => y === this.gridSize.y-1 || !this.voxelGrid[x][y+1][z],
        verts: [[0,s,0], [s,s,0], [s,s,s], [0,s,s]],
        normal: [0,1,0]
      },
      { // Left
        check: () => x === 0 || !this.voxelGrid[x-1][y][z],
        verts: [[0,0,0], [0,s,0], [0,s,s], [0,0,s]],
        normal: [-1,0,0]
      },
      { // Right
        check: () => x === this.gridSize.x-1 || !this.voxelGrid[x+1][y][z],
        verts: [[s,0,s], [s,s,s], [s,s,0], [s,0,0]],
        normal: [1,0,0]
      },
      { // Top
        check: () => z === this.gridSize.z-1 || !this.voxelGrid[x][y][z+1],
        verts: [[0,0,s], [0,s,s], [s,s,s], [s,0,s]],
        normal: [0,0,1]
      },
      { // Bottom
        check: () => z === 0 || !this.voxelGrid[x][y][z-1],
        verts: [[0,s,0], [0,0,0], [s,0,0], [s,s,0]],
        normal: [0,0,-1]
      }
    ];

    faces.forEach(face => {
      if (face.check()) {
        // Add two triangles for the face
        for (let i = 0; i < 2; i++) {
          const indices = i === 0 ? [0,1,2] : [0,2,3];
          indices.forEach(idx => {
            vertices.push(vx + face.verts[idx][0], vy + face.verts[idx][1], vz + face.verts[idx][2]);
            normals.push(...face.normal);
            
            // Color based on depth (machined surface detection)
            const depth = z / this.gridSize.z;
            if (isEdge) {
              colors.push(0.7, 0.7, 0.8); // Original stock color
            } else {
              colors.push(0.9 - depth * 0.2, 0.9 - depth * 0.1, 1.0); // Machined surface
            }
          });
        }
      }
    });
  }

  removeMaterial(toolPosition, toolDiameter, toolLength, feedRate) {
    const toolRadius = toolDiameter / 2;
    const removalData = {
      position: { ...toolPosition },
      volume: 0,
      collision: false
    };

    // Convert world position to voxel coordinates
    const voxelX = Math.floor((toolPosition.x + this.stockDimensions.x / 2) / this.voxelSize);
    const voxelY = Math.floor((toolPosition.y + this.stockDimensions.y / 2) / this.voxelSize);
    const voxelZ = Math.floor(toolPosition.z / this.voxelSize);

    // Calculate affected voxel range
    const radiusInVoxels = Math.ceil(toolRadius / this.voxelSize);
    
    // Check and remove voxels within tool cylinder
    for (let dx = -radiusInVoxels; dx <= radiusInVoxels; dx++) {
      for (let dy = -radiusInVoxels; dy <= radiusInVoxels; dy++) {
        for (let dz = 0; dz <= Math.ceil(toolLength / this.voxelSize); dz++) {
          const x = voxelX + dx;
          const y = voxelY + dy;
          const z = voxelZ - dz;

          // Check bounds
          if (x >= 0 && x < this.gridSize.x &&
              y >= 0 && y < this.gridSize.y &&
              z >= 0 && z < this.gridSize.z) {
            
            // Check if voxel is within tool cylinder
            const distance = Math.sqrt(dx * dx + dy * dy) * this.voxelSize;
            if (distance <= toolRadius && this.voxelGrid[x][y][z]) {
              this.voxelGrid[x][y][z] = false;
              removalData.volume += this.voxelSize * this.voxelSize * this.voxelSize;
              
              // Check for rapid move collision (high feed rate in material)
              if (feedRate > 1000 && dz > 0) {
                removalData.collision = true;
              }
            }
          }
        }
      }
    }

    this.removedMaterial.push(removalData);
    return removalData;
  }

  checkCollision(toolPosition, toolDiameter, isRapid) {
    const toolRadius = toolDiameter / 2;
    
    // Convert to voxel coordinates
    const voxelX = Math.floor((toolPosition.x + this.stockDimensions.x / 2) / this.voxelSize);
    const voxelY = Math.floor((toolPosition.y + this.stockDimensions.y / 2) / this.voxelSize);
    const voxelZ = Math.floor(toolPosition.z / this.voxelSize);

    // For rapid moves, check if tool passes through material
    if (isRapid && voxelZ >= 0 && voxelZ < this.gridSize.z) {
      const radiusInVoxels = Math.ceil(toolRadius / this.voxelSize);
      
      for (let dx = -radiusInVoxels; dx <= radiusInVoxels; dx++) {
        for (let dy = -radiusInVoxels; dy <= radiusInVoxels; dy++) {
          const x = voxelX + dx;
          const y = voxelY + dy;
          
          if (x >= 0 && x < this.gridSize.x &&
              y >= 0 && y < this.gridSize.y) {
            
            const distance = Math.sqrt(dx * dx + dy * dy) * this.voxelSize;
            if (distance <= toolRadius && this.voxelGrid[x][y][voxelZ]) {
              return {
                collision: true,
                position: toolPosition,
                type: 'rapid_through_material'
              };
            }
          }
        }
      }
    }

    return { collision: false };
  }

  getMaterialRemovalStats() {
    let totalVolume = 0;
    let remainingVolume = 0;

    for (let x = 0; x < this.gridSize.x; x++) {
      for (let y = 0; y < this.gridSize.y; y++) {
        for (let z = 0; z < this.gridSize.z; z++) {
          totalVolume += this.voxelSize * this.voxelSize * this.voxelSize;
          if (this.voxelGrid[x][y][z]) {
            remainingVolume += this.voxelSize * this.voxelSize * this.voxelSize;
          }
        }
      }
    }

    const removedVolume = totalVolume - remainingVolume;
    const removalPercentage = (removedVolume / totalVolume) * 100;

    return {
      totalVolume,
      removedVolume,
      remainingVolume,
      removalPercentage,
      collisions: this.collisions.length,
      voxelCount: this.gridSize.x * this.gridSize.y * this.gridSize.z
    };
  }

  reset() {
    this.removedMaterial = [];
    this.collisions = [];
    this.initializeStock();
  }

  dispose() {
    if (this.stockMesh) {
      this.scene.remove(this.stockMesh);
      this.stockMesh.geometry.dispose();
      this.stockMesh.material.dispose();
    }
  }
}

export default MaterialRemovalSimulation;