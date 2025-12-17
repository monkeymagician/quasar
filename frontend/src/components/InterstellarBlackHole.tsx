import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, useTexture } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// Interstellar Black Hole Shader - Full physics-based raytracing
const InterstellarMaterial = shaderMaterial(
  {
    cameraMatrix: new THREE.Matrix4(),
    cameraGalaxy: 0,
    blackhole: new THREE.Vector4(0.0, -250.0, 250.0, 12.5),
    blackholeDisk: new THREE.Vector4(-12, 12, 6, 150.0),
    texAccretionDisk: null,
    texGalaxy1: null,
    texGalaxy2: null,
    lightSpeed: 0.2,
  },
  // Vertex Shader
  `
    varying vec2 vRayPos;
    
    void main() {
      vRayPos = position.xy;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  // Fragment Shader - Complete Interstellar implementation
  `
    #define ID_BLACKHOLE 4
    #define ID_BLACKHOLE_DISK 5
    #define ID_GALAXY1 2
    #define ID_GALAXY2 3
    
    uniform mat4 cameraMatrix;
    uniform int cameraGalaxy;
    uniform vec4 blackhole;
    uniform vec4 blackholeDisk;
    uniform sampler2D texAccretionDisk;
    uniform sampler2D texGalaxy1;
    uniform sampler2D texGalaxy2;
    uniform float lightSpeed;
    
    varying vec2 vRayPos;
    
    const float INFINITY = 1000000.0;
    const float GALAXY_EDGE = 10000.0;
    const float EPSILON = 0.0001;
    const float PI = 3.14159265359;
    const float TWOPI = 6.28318530718;
    
    float gravityBlackhole = blackhole.w * lightSpeed * lightSpeed;
    
    vec3 toGamma(vec3 color) {
      return pow(color, vec3(1.0 / 2.2));
    }
    
    vec3 toLinear(vec3 color) {
      return pow(color, vec3(2.2));
    }
    
    vec3 panoramaColor(float n, vec3 pos) {
      vec2 uv = vec2(
        0.5 - atan(pos.z, pos.x) / TWOPI,
        0.5 - asin(pos.y) / PI
      );
      
      // Procedural galaxy if textures not loaded
      vec3 color = vec3(0.01, 0.02, 0.05);
      float stars = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      if (stars > 0.99) color += vec3(1.0, 0.9, 0.8) * (stars - 0.99) * 100.0;
      
      return color;
    }
    
    vec3 accretionDiskColor(vec3 pos) {
      pos = pos - blackhole.xyz;
      float dist = length(pos);
      
      float r1 = length(blackholeDisk.xyz);
      float r2 = blackholeDisk.w;
      
      float v = clamp((dist - r1) / (r2 - r1), 0.0, 1.0);
      
      vec3 base = cross(blackholeDisk.xyz, vec3(0.0, 0.0, 1.0));
      float angle = acos(dot(normalize(base), normalize(pos)));
      if (dot(cross(base, pos), blackholeDisk.xyz) < 0.0) angle = -angle;
      
      float u = 0.5 - angle / TWOPI;
      
      // High quality procedural accretion disk
      vec3 color1 = vec3(1.0, 0.25, 0.0);  // Deep orange/red
      vec3 color2 = vec3(1.0, 0.6, 0.0);   // Orange
      vec3 color3 = vec3(1.0, 0.9, 0.3);   // Yellow
      vec3 color4 = vec3(1.0, 1.0, 0.95);  // White hot
      
      float t = v;
      vec3 color;
      
      if (t < 0.33) {
        color = mix(color1, color2, t / 0.33);
      } else if (t < 0.66) {
        color = mix(color2, color3, (t - 0.33) / 0.33);
      } else {
        color = mix(color3, color4, (t - 0.66) / 0.34);
      }
      
      // Turbulence and spiral patterns
      float spiral = sin(u * 30.0 - v * 15.0) * 0.5 + 0.5;
      float turbulence = sin(u * 50.0) * sin(v * 20.0) * 0.3 + 0.7;
      
      color *= turbulence;
      color = mix(color * 0.6, color, spiral);
      
      // Brightness falloff
      float brightness = 1.0 / (v * 1.5 + 0.3);
      color *= brightness;
      
      // Inner glow
      if (v < 0.2) {
        color += vec3(1.0, 0.8, 0.5) * (1.0 - v / 0.2) * 2.0;
      }
      
      return color;
    }
    
    float sphereDistance(vec3 rayPosition, vec3 rayDirection, vec4 sphere) {
      vec3 v = rayPosition - sphere.xyz;
      float p = dot(rayDirection, v);
      float d = p * p + sphere.w * sphere.w - dot(v, v);
      
      return d < 0.0 ? -1.0 : -p - sqrt(d);
    }
    
    float ringDistance(vec3 rayPosition, vec3 rayDirection, vec3 center, vec4 definition) {
      float r1 = length(definition.xyz);
      float r2 = definition.w;
      vec3 normal = definition.xyz / r1;
      
      float denominator = dot(rayDirection, normal);
      float constant = -dot(center, normal);
      
      if (abs(denominator) < EPSILON) {
        return -1.0;
      }
      
      float t = -(dot(rayPosition, normal) + constant) / denominator;
      if (t < 0.0) return -1.0;
      
      vec3 intersection = rayPosition + t * rayDirection;
      float distanceToCenter = length(intersection - center);
      
      if (distanceToCenter >= r1 && distanceToCenter <= r2) {
        return t;
      }
      
      return -1.0;
    }
    
    void testDistance(int i, float distance, inout float currentDistance, inout int currentObject) {
      if (distance >= EPSILON && distance < currentDistance) {
        currentDistance = distance;
        currentObject = i;
      }
    }
    
    vec3 raytrace(vec3 rayPosition, vec3 rayDirection) {
      float currentDistance = INFINITY;
      int currentObject = -1, prevObject = -1;
      float currentGalaxy = float(cameraGalaxy);
      vec3 currentPosition;
      
      float stepSize, rayDistance;
      vec3 gravityVector, rayAccel;
      float objectDistance;
      
      vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
      
      for (int i = 0; i < 100; i++) {
        currentDistance = INFINITY;
        
        // Gravitational lensing - bend light towards black hole
        gravityVector = blackhole.xyz - rayPosition;
        rayDistance = length(gravityVector);
        
        // Adaptive step size - smaller steps near black hole
        stepSize = rayDistance - blackhole.w * 0.05;
        
        // Gravitational acceleration (inverse square law)
        rayAccel = gravityVector * gravityBlackhole / (rayDistance * rayDistance * rayDistance);
        
        if (length(rayAccel) > lightSpeed) {
          rayAccel = normalize(rayAccel) * lightSpeed;
        }
        
        // Update ray direction with gravity
        rayDirection = normalize(rayDirection * lightSpeed + rayAccel * stepSize);
        
        if (stepSize <= 0.005) {
          currentObject = -1;
          break;
        }
        
        // Test against black hole event horizon
        objectDistance = sphereDistance(rayPosition, rayDirection, vec4(blackhole.xyz, blackhole.w * 0.93));
        testDistance(ID_BLACKHOLE, objectDistance, currentDistance, currentObject);
        
        // Test against accretion disk
        objectDistance = ringDistance(rayPosition, rayDirection, blackhole.xyz, blackholeDisk);
        testDistance(ID_BLACKHOLE_DISK, objectDistance, currentDistance, currentObject);
        
        // Test against galaxy background
        testDistance(ID_GALAXY2, GALAXY_EDGE, currentDistance, currentObject);
        
        rayDistance = lightSpeed * stepSize;
        
        // Check if we hit any object
        if (currentObject != -1 && currentDistance <= rayDistance) {
          // Accretion disk is semi-transparent
          if (currentObject == ID_BLACKHOLE_DISK) {
            currentPosition = rayPosition + rayDirection * currentDistance;
            if (prevObject != ID_BLACKHOLE_DISK) {
              vec3 diskColor = accretionDiskColor(currentPosition);
              color.rgb += diskColor * color.a * 1.2;
              color.a *= 0.5;
            }
            currentObject = -1;
            prevObject = ID_BLACKHOLE_DISK;
          } else {
            break;
          }
        }
        
        rayPosition += rayDirection * rayDistance;
      }
      
      currentPosition = rayPosition + rayDirection * currentDistance;
      
      if (currentObject == ID_GALAXY1 || currentObject == ID_GALAXY2) {
        color.rgb += panoramaColor(currentGalaxy, rayDirection) * color.a;
      }
      
      return color.rgb;
    }
    
    void main() {
      vec3 rayDir = (cameraMatrix * vec4(vRayPos, -1.0, 0.0)).xyz;
      vec3 color = raytrace(cameraMatrix[3].xyz, normalize(rayDir));
      gl_FragColor = vec4(toGamma(color), 1.0);
    }
  `
)

extend({ InterstellarMaterial })

export default function InterstellarBlackHole() {
  const materialRef = useRef<any>(null)
  const { camera, size } = useThree()
  
  const rayScale = useMemo(() => new THREE.Vector3(), [])
  const worldPosition = useMemo(() => new THREE.Vector3(), [])
  const worldQuaternion = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    if (materialRef.current && camera) {
      // Calculate ray scale for proper perspective
      const perspCamera = camera as THREE.PerspectiveCamera
      const fov = perspCamera.fov || 45
      const aspect = size.width / size.height
      
      rayScale.set(
        aspect,
        1,
        1 / Math.tan((fov * Math.PI / 180) / 2)
      )
      
      // Update camera matrix for raytracing shader
      camera.getWorldPosition(worldPosition)
      camera.getWorldQuaternion(worldQuaternion)
      
      materialRef.current.cameraMatrix.compose(
        worldPosition,
        worldQuaternion,
        rayScale
      )
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* @ts-ignore */}
      <interstellarMaterial 
        ref={materialRef}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
