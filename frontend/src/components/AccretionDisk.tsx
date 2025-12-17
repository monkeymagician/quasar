import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AccretionDiskProps {
  innerRadius?: number;
  outerRadius?: number;
  position?: [number, number, number];
}

// Vertex Shader for disk
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader with rotating light pattern
const fragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Create radial coordinates
    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;
    
    // Rotating spiral pattern
    float spiral = angle + radius * 3.0 - time * 2.0;
    float pattern = sin(spiral * 5.0) * 0.5 + 0.5;
    
    // Add noise for turbulence
    float n = noise(vec2(angle * 3.0, radius * 5.0) + time * 0.5);
    pattern = mix(pattern, n, 0.3);
    
    // Color based on radius and pattern
    vec3 color = mix(color1, color2, pattern);
    
    // Fade at edges
    float innerFade = smoothstep(0.3, 0.5, radius);
    float outerFade = smoothstep(1.0, 0.8, radius);
    float alpha = innerFade * outerFade;
    
    // Add brightness variation
    float brightness = 0.5 + pattern * 0.5;
    color *= brightness;
    
    // Pulsing effect
    float pulse = sin(time * 3.0) * 0.2 + 0.8;
    color *= pulse;
    
    gl_FragColor = vec4(color, alpha * 0.7);
  }
`;

function AccretionDisk({ 
  innerRadius = 3, 
  outerRadius = 6, 
  position = [0, 0, 0] 
}: AccretionDiskProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Uniforms for shader
  const uniforms = useRef({
    time: { value: 0 },
    color1: { value: new THREE.Color('#ff6600') }, // Orange
    color2: { value: new THREE.Color('#ffaa00') }, // Yellow-orange
  });
  
  // Update time uniform each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to be horizontal
    >
      <ringGeometry args={[innerRadius, outerRadius, 64, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default AccretionDisk;
