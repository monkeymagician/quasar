import { useRef, useMemo } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const GargantuaMaterial = shaderMaterial(
  { uTime: 0.0, uResolution: new THREE.Vector2(), uCameraMatrix: new THREE.Matrix4() },
  `
    varying vec2 vUv;
    void main() {
      vUv = position.xy;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform mat4 uCameraMatrix;
    varying vec2 vUv;

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
        float n = p.x + p.y*57.0 + 113.0*p.z;
        return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                   mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
               mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                   mix(hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    }

    float ringNoise(vec3 p) {
      float d = length(p);
      float a = atan(p.z, p.x);
      float n = sin(d * 30.0 - uTime * 2.0 + noise(p * 0.6) * 10.0);
      n += sin(d * 15.0 + a * 12.0) * 0.5; 
      return smoothstep(-0.5, 0.5, n) * 0.5 + 0.5;
    }

    vec3 getDiskColor(vec3 pos) {
      float d = length(pos);
      if (d < 2.6 || d > 85.0) return vec3(0.0);
      
      float rotationSpeed = uTime * 1.5 + 50.0 / d; 
      float angle = atan(pos.z, pos.x) - rotationSpeed;
      
      float rings = ringNoise(pos);
      float gas = noise(vec3(d * 0.1, angle * 2.0, pos.y * 5.0 + uTime * 0.2));
      float combinedTex = rings * gas;

      vec3 colorEdge = vec3(0.5, 0.01, 0.0);  
      vec3 colorMid = vec3(1.2, 0.3, 0.05);   
      vec3 colorCore = vec3(1.0, 0.8, 0.5);   

      vec3 finalCol = mix(colorEdge, colorMid, smoothstep(0.0, 0.6, combinedTex));
      finalCol = mix(finalCol, colorCore, smoothstep(0.5, 1.0, combinedTex));
      
      float intensity = smoothstep(2.6, 5.0, d) * smoothstep(85.0, 30.0, d);
      return finalCol * (combinedTex * 0.7 + 0.3) * intensity * 8.0;
    }

    void main() {
      vec3 rayDir = normalize((uCameraMatrix * vec4(vUv, -1.0, 0.0)).xyz);
      vec3 rayPos = uCameraMatrix[3].xyz;
      vec3 finalCol = vec3(0.0);
      float alpha = 0.0;
      float ehRadius = 2.6; // 사건의 지평선 (검은 구멍 크기)

      for(int i = 0; i < 500; i++) { 
        float d = length(rayPos);
        
        // 중력 렌즈 효과 유지
        vec3 gravity = normalize(-rayPos) * (90.0 / (d * d + 0.5));
        rayDir = normalize(rayDir + gravity * 0.09);
        
        float stepSize = max(0.02, d * 0.035);
        if(d < 6.5) stepSize = max(0.003, d * 0.01); 

        rayPos += rayDir * stepSize;

        // 안티앨리어싱 (매끄러운 검은 구체)
        float borderThickness = 0.03;
        float edgeFactor = smoothstep(ehRadius + borderThickness, ehRadius, d);
        if (edgeFactor > 0.0) {
            finalCol = mix(finalCol, vec3(0.0), edgeFactor);
            alpha = max(alpha, edgeFactor);
        }
        if(d < ehRadius + 0.005 && alpha >= 0.98) { alpha = 1.0; break; }

        // ==========================================================
        // [🔥 추가된 기능: NASA 스타일 광자 고리 (Photon Ring) 🔥]
        // ==========================================================
        // 1. 위치: 사건의 지평선(2.6) 바로 바깥쪽 2.7 ~ 2.9 지점에 빛을 심음
        // 2. 모양: 아주 얇은 껍질(Shell) 형태
        if (d > ehRadius && d < 3.2) {
             // 2.8 지점에서 피크를 찍는 종 모양 곡선(Gaussian)을 만듦
             float ringIntensity = exp(-pow((d - 2.8) * 10.0, 2.0));
             
             // 너무 넓게 퍼지지 않도록 날카롭게 깎음
             ringIntensity = smoothstep(0.1, 1.0, ringIntensity);

             // [광자 링 색상] 아주 뜨거운 백색 + 약간의 푸른빛/금빛 틴트
             vec3 photonColor = vec3(1.2, 1.0, 0.8) * 4.0; 
             
             // 기존 색상 위에 빛을 더함 (Additive Blending)
             // 원반이 가리고 있어도 빛이 강해서 뚫고 나오는 효과
             finalCol += photonColor * ringIntensity * 0.15 * (1.0 - alpha);
             
             // 광자 링은 얇지만 매우 밝으므로 불투명도도 살짝 증가
             alpha += ringIntensity * 0.05;
        }
        // ==========================================================

        // 원반 렌더링 (기존 로직 유지)
        float t = clamp((d - 3.0) / 80.0, 0.0, 1.0);
        float curve = sin(t * 3.14159);
        float thickness = 0.15 + pow(curve, 1.2) * 2.5;
        thickness *= smoothstep(85.0, 70.0, d);

        if(abs(rayPos.y) < thickness && d > ehRadius + 0.05 && d < 85.0) {
           float density = smoothstep(thickness, 0.0, abs(rayPos.y));
           finalCol += getDiskColor(rayPos) * 0.15 * density; 
           alpha += density * 0.1;
        }
        
        if(length(rayPos) > 1500.0 || alpha >= 1.0) break;
      }
      
      finalCol = finalCol / (1.0 + finalCol * 0.2); 
      finalCol = pow(finalCol, vec3(1.2)); 
      
      gl_FragColor = vec4(finalCol, clamp(alpha * 1.5, 0.0, 1.0));
    }
  `
)

extend({ GargantuaMaterial })

export default function Quasar() {
  const materialRef = useRef<any>(null)
  const { camera, size } = useThree()
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
      materialRef.current.uResolution.set(size.width, size.height)
      const aspect = size.width / size.height
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
      const rayScale = new THREE.Vector3(aspect, 1, 1 / Math.tan(fov / 2))
      materialRef.current.uCameraMatrix.compose(camera.position, camera.quaternion, rayScale)
    }
  })
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* @ts-ignore */}
      <gargantuaMaterial ref={materialRef} transparent={true} depthWrite={false} />
    </mesh>
  )
}