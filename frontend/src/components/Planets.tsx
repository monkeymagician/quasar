import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData } from '../types';

interface PlanetsProps {
  planetCount?: number;
}

interface PlanetProps {
  data: PlanetData;
  onClick: (data: PlanetData, position: THREE.Vector3) => void;
}

// Individual Planet component
function Planet({ data, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeOffset = useRef(Math.random() * Math.PI * 2); // Random starting position
  
  // Update planet position based on orbital mechanics
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + timeOffset.current;
      const x = Math.cos(time * data.orbitSpeed) * data.orbitRadius;
      const z = Math.sin(time * data.orbitSpeed) * data.orbitRadius;
      meshRef.current.position.set(x, 0, z);
    }
  });
  
  const handleClick = () => {
    if (meshRef.current) {
      onClick(data, meshRef.current.position.clone());
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <sphereGeometry args={[data.size, 32, 32]} />
      <meshStandardMaterial
        color={data.color}
        emissive={data.color}
        emissiveIntensity={0.3}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  );
}

// Planets container component
function Planets({ planetCount = 5 }: PlanetsProps) {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const originalPosition = useRef<THREE.Vector3>(camera.position.clone());
  const animationProgress = useRef(0);
  
  // Generate unique planet configurations
  const planets: PlanetData[] = [
    {
      id: 'planet-1',
      color: '#4a90e2', // Blue
      size: 0.4,
      orbitRadius: 8,
      orbitSpeed: 0.3,
    },
    {
      id: 'planet-2',
      color: '#e24a4a', // Red
      size: 0.6,
      orbitRadius: 11,
      orbitSpeed: 0.2,
    },
    {
      id: 'planet-3',
      color: '#50c878', // Green
      size: 0.35,
      orbitRadius: 14,
      orbitSpeed: 0.15,
    },
    {
      id: 'planet-4',
      color: '#9b59b6', // Purple
      size: 0.5,
      orbitRadius: 17,
      orbitSpeed: 0.12,
    },
    {
      id: 'planet-5',
      color: '#f39c12', // Orange
      size: 0.45,
      orbitRadius: 20,
      orbitSpeed: 0.1,
    },
  ];
  
  // Animate camera zoom
  useFrame((state, delta) => {
    if (isAnimating && targetPosition.current) {
      animationProgress.current += delta * 0.8; // Animation speed
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1;
        setIsAnimating(false);
      }
      
      // Smooth interpolation (ease-out)
      const t = 1 - Math.pow(1 - animationProgress.current, 3);
      
      camera.position.lerpVectors(
        originalPosition.current,
        targetPosition.current,
        t
      );
      
      camera.lookAt(0, 0, 0);
    }
  });
  
  const handlePlanetClick = (data: PlanetData, position: THREE.Vector3) => {
    console.log('🪐 Planet clicked:', {
      id: data.id,
      color: data.color,
      size: data.size,
      orbitRadius: data.orbitRadius,
      orbitSpeed: data.orbitSpeed,
      position: { x: position.x, y: position.y, z: position.z }
    });
    
    // Calculate camera target position (closer to planet)
    const direction = position.clone().normalize();
    const distance = 3; // Distance from planet
    const cameraTarget = position.clone().add(direction.multiplyScalar(distance));
    cameraTarget.y += 2; // Slightly above
    
    // Start animation
    originalPosition.current = camera.position.clone();
    targetPosition.current = cameraTarget;
    animationProgress.current = 0;
    setIsAnimating(true);
  };
  
  const handleResetCamera = () => {
    console.log('🔄 Resetting camera view');
    originalPosition.current = camera.position.clone();
    targetPosition.current = new THREE.Vector3(0, 5, 15);
    animationProgress.current = 0;
    setIsAnimating(true);
  };
  
  // Listen for 'r' key to reset camera
  useFrame(() => {
    if (!isAnimating) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') {
          handleResetCamera();
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  });
  
  return (
    <group>
      {planets.slice(0, planetCount).map((planet) => (
        <Planet key={planet.id} data={planet} onClick={handlePlanetClick} />
      ))}
    </group>
  );
}

export default Planets;
