import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { ParticleConfig } from '../types';

// Shader Material with Mouse Repulsion
const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uPixelRatio: 1,
    uSize: 3.0,
    uMouse: new THREE.Vector3(9999, 9999, 9999), // Initialize far away
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform vec3 uMouse;
    
    attribute vec3 originalPos;
    attribute vec3 color;
    attribute float random;     // 0..1
    attribute float edgeFactor; // 0 (center) -> 1 (edge)

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = color;
      vec3 pos = originalPos;
      
      float t = uTime * 0.3;
      
      // --- 1. EXISTING SNOW/MIST LOGIC ---
      float influence = pow(edgeFactor, 3.5); 
      
      float dx = sin(t + pos.y * 0.5 + random * 10.0);
      float dy = cos(t * 0.8 + pos.x * 0.5 + random * 12.0);
      float dz = sin(t * 0.5 + pos.x + pos.y);
      
      vec3 drift = vec3(dx, dy, dz);
      pos += drift * influence * 2.0; 
      pos += normalize(pos) * influence * 1.5;

      // --- 2. MOUSE INTERACTION (REPULSION) ---
      // Calculate distance between particle and mouse in 3D space
      // We mostly care about XY distance for the "push", but Z helps accuracy
      float distToMouse = distance(pos, uMouse);
      
      float interactionRadius = 4.0; // The size of the "push" bubble
      
      if (distToMouse < interactionRadius) {
        // Calculate direction from mouse to particle
        vec3 repulseDir = normalize(pos - uMouse);
        
        // Calculate force: Stronger when closer
        // (1 - distance/radius) gives 1.0 at center, 0.0 at edge
        float force = 1.0 - (distToMouse / interactionRadius);
        
        // Smooth the force (ease-out)
        force = pow(force, 2.0);
        
        // Apply push. We push slightly more in Z to give it a 3D feel
        vec3 pushVector = repulseDir * force * 3.0; // Strength multiplier
        
        pos += pushVector;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size Logic
      float sizeMult = 1.0 + influence * 2.0; 
      gl_PointSize = uSize * sizeMult * uPixelRatio * (50.0 / -mvPosition.z);
      
      // Alpha Logic
      vAlpha = 1.0 - (influence * 0.7);
    }
  `,
  // Fragment Shader
  `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float r = length(xy);
      
      if (r > 0.5) discard;
      
      float dotAlpha = 1.0 - smoothstep(0.3, 0.5, r);
      gl_FragColor = vec4(vColor, dotAlpha * vAlpha); 
    }
  `
);

extend({ ParticleMaterial });

interface ParticleImageProps {
  imageElement: HTMLImageElement;
  config: ParticleConfig;
}

export const ParticleImage: React.FC<ParticleImageProps> = ({ imageElement, config }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);

  // Generate particles from image
  const { positions, colors, randoms, edgeFactors, originalPos, width, height } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const TARGET_SIZE = 300; 
    
    const aspect = imageElement.width / imageElement.height;
    const w = Math.min(300, imageElement.width);
    const h = w / aspect;
    
    canvas.width = w;
    canvas.height = h;
    
    const worldScale = 12 / w; 
    
    if (ctx) {
      ctx.drawImage(imageElement, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      
      const posArray = [];
      const colArray = [];
      const rndArray = [];
      const edgeArray = [];
      const origPosArray = [];
      
      const offsetX = w / 2;
      const offsetY = h / 2;
      const maxDist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      const step = 1; 

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const a = data[i + 3] / 255;
          
          if (a > 0.1) { 
            const px = (x - offsetX) * worldScale;
            const py = -(y - offsetY) * worldScale; 
            const brightness = (r + g + b) / 3;
            const pz = brightness * 1.5; 
            
            posArray.push(px, py, pz);
            origPosArray.push(px, py, pz);
            colArray.push(r, g, b);
            rndArray.push(Math.random());
            
            const dist = Math.sqrt((x - offsetX) ** 2 + (y - offsetY) ** 2);
            const normDist = dist / maxDist; 
            edgeArray.push(normDist);
          }
        }
      }
      
      return {
        positions: new Float32Array(posArray),
        originalPos: new Float32Array(origPosArray),
        colors: new Float32Array(colArray),
        randoms: new Float32Array(rndArray),
        edgeFactors: new Float32Array(edgeArray),
        width: w * worldScale,
        height: h * worldScale
      };
    }
    
    return { 
        positions: new Float32Array(0), 
        originalPos: new Float32Array(0),
        colors: new Float32Array(0), 
        randoms: new Float32Array(0),
        edgeFactors: new Float32Array(0),
        width: 1, height: 1
    };
  }, [imageElement]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);
      materialRef.current.uSize = config.size;

      // -- MOUSE PROJECTION LOGIC --
      // Convert screen mouse coordinates (-1 to 1) to 3D world coordinates
      // We assume the image is roughly at z = 0.
      
      const { pointer, camera } = state;
      
      // Create a vector from mouse position
      const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
      
      // Unproject: Convert 2D screen point to 3D point in camera space
      vector.unproject(camera);
      
      // Calculate direction from camera to that 3D point
      const dir = vector.sub(camera.position).normalize();
      
      // Calculate distance to z=0 plane
      // ray origin = camera.position
      // ray dir = dir
      // plane z = 0
      const distance = -camera.position.z / dir.z;
      
      // Get the intersection point
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      // Update shader uniform
      materialRef.current.uMouse.copy(pos);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-originalPos" count={originalPos.length / 3} array={originalPos} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-random" count={randoms.length} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-edgeFactor" count={edgeFactors.length} array={edgeFactors} itemSize={1} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <particleMaterial 
        ref={materialRef} 
        transparent={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
