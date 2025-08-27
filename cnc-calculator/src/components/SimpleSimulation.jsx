import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Simple, reliable G-code parser
export const parseGCode = (gcode) => {
  const lines = gcode.split('\n');
  const positions = [];
  let currentPos = { x: 0, y: 0, z: 5, f: 500 };
  let spindleSpeed = 0;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines but keep position
    if (trimmedLine === '') {
      positions.push({ ...currentPos, comment: true, line: line });
      return;
    }
    
    // Skip comments but keep position
    if (trimmedLine.startsWith(';') || trimmedLine.startsWith('(')) {
      positions.push({ ...currentPos, comment: true, line: line });
      return;
    }
    
    // Parse coordinates
    const xMatch = line.match(/X([-\d.]+)/i);
    const yMatch = line.match(/Y([-\d.]+)/i);
    const zMatch = line.match(/Z([-\d.]+)/i);
    const fMatch = line.match(/F([\d.]+)/i);
    const sMatch = line.match(/S([\d]+)/i);
    
    if (xMatch) currentPos.x = parseFloat(xMatch[1]);
    if (yMatch) currentPos.y = parseFloat(yMatch[1]);
    if (zMatch) currentPos.z = parseFloat(zMatch[1]);
    if (fMatch) currentPos.f = parseFloat(fMatch[1]);
    if (sMatch) spindleSpeed = parseInt(sMatch[1]);
    
    positions.push({ 
      ...currentPos, 
      spindleSpeed,
      comment: false,
      line: line,
      hasMovement: !!(xMatch || yMatch || zMatch)
    });
  });
  
  return positions;
};

// Simple animation controller
export const useSimulation = (gcode, toolRef, isPlaying, currentLine, speed = 1.0) => {
  const positionsRef = useRef([]);
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  
  // Parse G-code when it changes
  useEffect(() => {
    positionsRef.current = parseGCode(gcode);
  }, [gcode]);
  
  // Animation loop
  useEffect(() => {
    if (!toolRef.current) return;
    
    let lastTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      const positions = positionsRef.current;
      if (positions.length === 0) return;
      
      // Ensure current line is valid
      const safeCurrentLine = Math.min(Math.max(0, currentLine), positions.length - 1);
      const currentPos = positions[safeCurrentLine];
      
      if (!currentPos) return;
      
      if (isPlaying && safeCurrentLine < positions.length - 1) {
        // Find next non-comment line
        let nextLine = safeCurrentLine + 1;
        while (nextLine < positions.length && positions[nextLine].comment) {
          nextLine++;
        }
        
        if (nextLine < positions.length) {
          const nextPos = positions[nextLine];
          
          // Calculate move time based on distance and feedrate
          const distance = Math.sqrt(
            Math.pow(nextPos.x - currentPos.x, 2) +
            Math.pow(nextPos.y - currentPos.y, 2) +
            Math.pow(nextPos.z - currentPos.z, 2)
          );
          
          const feedrate = currentPos.f || 500;
          const moveTime = distance > 0 ? (distance / (feedrate / 60)) : 0.1;
          
          // Update progress
          progressRef.current += (deltaTime * speed) / moveTime;
          
          if (progressRef.current >= 1) {
            progressRef.current = 0;
            // Move to next line - parent component should handle this
            return nextLine;
          }
          
          // Interpolate position
          const t = progressRef.current;
          const x = currentPos.x + (nextPos.x - currentPos.x) * t;
          const y = currentPos.y + (nextPos.y - currentPos.y) * t;
          const z = currentPos.z + (nextPos.z - currentPos.z) * t;
          
          toolRef.current.position.set(x, y, z + 50);
        }
      } else {
        // Not playing or at end - just set position
        progressRef.current = 0;
        toolRef.current.position.set(currentPos.x, currentPos.y, currentPos.z + 50);
      }
      
      // Rotate spindle
      if (currentPos.spindleSpeed > 0) {
        toolRef.current.rotation.z += (currentPos.spindleSpeed / 1000) * deltaTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [toolRef, isPlaying, currentLine, speed, gcode]);
  
  return positionsRef.current;
};

export default { parseGCode, useSimulation };