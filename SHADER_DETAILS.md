# TON-618 Black Hole Shader Implementation

## 🎬 인터스텔라급 블랙홀 구현 상세 가이드

이 문서는 영화 <인터스텔라> 수준의 고퀄리티 블랙홀 쉐이더 구현에 대한 기술적 세부사항을 설명합니다.

## 🏗 아키텍처 개요

블랙홀은 3개의 주요 컴포넌트로 구성됩니다:

1. **Event Horizon (이벤트 호라이즌)** - 중심 검은 구체
2. **Accretion Disk (강착원반)** - 회전하는 가스 원반
3. **Glow Layer (발광 레이어)** - 추가 밝기 레이어

## 🌑 Event Horizon Shader

### 목적
블랙홀의 중심부를 표현하며, 빛이 휘어지는 효과를 시뮬레이션합니다.

### 주요 기술

#### Fresnel Effect
```glsl
float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
```
- 시점과 법선 벡터의 각도를 계산
- 가장자리에서 빛이 더 강하게 보이는 효과
- 블랙홀 주변에서 빛이 휘어지는 것을 시뮬레이션

#### Rim Light
```glsl
vec3 rimColor = vec3(1.0, 0.6, 0.2) * fresnel * (0.3 + pulse * 0.2);
```
- 주황색 림 라이트 (강착원반의 빛 반사)
- 펄스 효과로 생동감 부여
- 매우 얇고 미묘한 효과

#### Deep Black Core
```glsl
vec3 finalColor = vec3(0.01, 0.01, 0.02) + rimColor;
```
- 거의 완전한 검은색 (RGB: 0.01)
- 약간의 파란 톤으로 깊이감 표현

## 💫 Accretion Disk Shader

### 목적
블랙홀 주변을 도는 초고온 가스 원반을 사실적으로 표현합니다.

### 주요 기술

#### 1. Perlin Noise Implementation
```glsl
float snoise(vec2 v) {
  // Simplex noise algorithm
  // 부드럽고 자연스러운 노이즈 생성
}
```
- **용도**: 난류 가스 구름 시뮬레이션
- **특징**: 연속적이고 부드러운 패턴
- **성능**: GPU 최적화된 알고리즘

#### 2. Fractal Brownian Motion (FBM)
```glsl
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for(int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.1;
    amplitude *= 0.45;
  }
  
  return value;
}
```
- **6개 옥타브**: 디테일한 복잡성
- **주파수 증가**: 2.1배씩 증가 (세밀한 디테일)
- **진폭 감소**: 0.45배씩 감소 (자연스러운 감쇠)
- **결과**: 실제 난류와 유사한 복잡한 패턴

#### 3. Swirling Coordinates (회전 좌표계)
```glsl
float rotation = time * 0.5;
float flowSpeed = mix(2.0, 0.5, radialDist);

vec2 swirlUV = vec2(
  angle + rotation * flowSpeed,
  radialDist * 8.0
);
```
- **차등 회전**: 내부가 외부보다 빠르게 회전 (실제 물리 법칙)
- **시간 기반**: 실시간 애니메이션
- **극좌표 변환**: 원형 패턴에 최적화

#### 4. Multi-Layer Turbulence
```glsl
float turbulence1 = fbm(swirlUV * 2.0 + time * 0.3);
float turbulence2 = fbm(swirlUV * 4.0 - time * 0.2);
float turbulence3 = fbm(swirlUV * 8.0 + time * 0.15);

float noise = turbulence1 * 0.5 + turbulence2 * 0.3 + turbulence3 * 0.2;
```
- **3개 레이어**: 서로 다른 스케일과 속도
- **가중 합성**: 큰 구조부터 작은 디테일까지
- **반대 방향**: 일부 레이어는 역방향 회전 (복잡성 증가)

#### 5. Spiral Arms (나선형 구조)
```glsl
float spiralArms = sin(angle * 5.0 - radialDist * 10.0 + time * 2.0) * 0.5 + 0.5;
spiralArms = pow(spiralArms, 3.0);
```
- **5개 나선팔**: 실제 강착원반의 구조
- **회전 애니메이션**: 시간에 따라 회전
- **Power 함수**: 날카로운 나선 구조

#### 6. Temperature Gradient (온도 그라데이션)
```glsl
float temperature = 1.0 - radialDist;
temperature = pow(temperature, 1.5);

vec3 hotColor = vec3(1.0, 1.0, 0.8);    // 밝은 노란-흰색
vec3 warmColor = vec3(1.0, 0.6, 0.1);   // 주황색
vec3 coolColor = vec3(1.0, 0.2, 0.0);   // 깊은 빨강-주황

vec3 baseColor = mix(coolColor, warmColor, temperature);
baseColor = mix(baseColor, hotColor, temperature * temperature);
```
- **물리 기반**: 중심부가 더 뜨거움
- **3단계 그라데이션**: 빨강 → 주황 → 노랑 → 흰색
- **비선형 믹싱**: 자연스러운 색상 전환

#### 7. Extreme Brightness for Bloom
```glsl
float brightness = mix(3.0, 8.0, temperature * pattern);
vec3 finalColor = baseColor * brightness;

// Hot spots (극도로 밝은 가스 주머니)
float hotSpots = smoothstep(0.85, 1.0, pattern * temperature);
finalColor += hotSpots * vec3(10.0, 8.0, 5.0);
```
- **밝기 범위**: 3.0 ~ 8.0 (일반 범위의 3~8배)
- **Hot Spots**: 최대 10.0까지 (Bloom 효과 극대화)
- **toneMapped=false**: 이 극한 밝기가 Bloom으로 전달됨

#### 8. Pulsing Effect
```glsl
float pulse = sin(time * 3.0 + radialDist * 5.0) * 0.1 + 0.9;
finalColor *= pulse;
```
- **시간 기반**: 주기적인 밝기 변화
- **위치 기반**: 원반의 위치에 따라 다른 위상
- **미묘한 효과**: 0.9 ~ 1.0 범위 (과하지 않게)

#### 9. Edge Fading
```glsl
float innerFade = smoothstep(0.25, 0.35, dist);
float outerFade = smoothstep(1.0, 0.85, dist);
float alpha = innerFade * outerFade;
```
- **내부 페이드**: 블랙홀 근처에서 사라짐
- **외부 페이드**: 가장자리에서 부드럽게 사라짐
- **알파 블렌딩**: 자연스러운 경계

## 🎨 Material Settings

### Critical Settings for Bloom
```typescript
<shaderMaterial
  transparent
  side={THREE.DoubleSide}
  depthWrite={false}
  blending={THREE.AdditiveBlending}
  toneMapped={false}  // 🔥 가장 중요!
/>
```

#### toneMapped={false}
- **목적**: Bloom 효과를 위한 극한 밝기 출력
- **효과**: 쉐이더의 5.0~10.0 밝기 값이 그대로 Bloom으로 전달
- **결과**: 눈부신 빛 효과

#### AdditiveBlending
- **목적**: 빛의 합성
- **효과**: 여러 레이어의 빛이 더해짐
- **결과**: 더 밝고 강렬한 빛

#### depthWrite={false}
- **목적**: 투명도 문제 방지
- **효과**: 다른 투명 객체와 올바르게 렌더링
- **결과**: 깨끗한 합성

## 🌟 Post-Processing

### Enhanced Bloom Settings
```typescript
<Bloom
  intensity={2.5}           // 강도 증가
  luminanceThreshold={0.1}  // 낮은 임계값 (더 많은 빛)
  luminanceSmoothing={0.9}  // 부드러운 전환
  mipmapBlur                // 고품질 블러
  radius={0.8}              // 블러 반경
/>
```

### Tone Mapping
```typescript
gl={{
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.2,
}}
```
- **ACES Filmic**: 영화 수준의 색상 그레이딩
- **Exposure 1.2**: 약간 밝게 조정

## 🎯 성능 최적화

### Geometry Optimization
```typescript
<sphereGeometry args={[1.5, 64, 64]} />  // Event Horizon
<ringGeometry args={[2.5, 6, 128, 1]} />  // Accretion Disk
```
- **높은 세그먼트 수**: 부드러운 쉐이더 그라데이션
- **적절한 균형**: 품질과 성능의 조화

### Shader Optimization
- **루프 최소화**: FBM은 6 옥타브로 제한
- **조건문 회피**: smoothstep 등 수학 함수 사용
- **벡터 연산**: GPU 병렬 처리 최적화

### Multiple Layers
```typescript
// Main disk
<mesh rotation={[Math.PI / 2, 0, 0]}>
  <ringGeometry args={[2.5, 6, 128, 1]} />
  <shaderMaterial ... />
</mesh>

// Glow layer (30% opacity)
<mesh rotation={[Math.PI / 2, 0, 0]}>
  <ringGeometry args={[2.3, 6.2, 64, 1]} />
  <shaderMaterial ... opacity={0.3} />
</mesh>
```
- **2개 레이어**: 메인 + 글로우
- **약간 다른 크기**: 더 풍부한 빛
- **낮은 투명도**: 미묘한 추가 효과

## 📊 비교: 이전 vs 현재

### 이전 구현
- ❌ 단순한 구체 geometry
- ❌ 기본 MeshStandardMaterial
- ❌ 단순한 노이즈 패턴
- ❌ 제한적인 밝기 (1.0~2.0)
- ❌ 정적인 색상

### 현재 구현 (인터스텔라급)
- ✅ 블랙홀 + 강착원반 분리
- ✅ 커스텀 GLSL 쉐이더
- ✅ Perlin Noise + FBM (6 옥타브)
- ✅ 극한 밝기 (5.0~10.0)
- ✅ 동적 온도 그라데이션
- ✅ Fresnel 림 라이트
- ✅ 나선형 구조
- ✅ 다층 난류
- ✅ toneMapped=false
- ✅ Additive Blending

## 🎬 결과

이 구현은 다음을 달성합니다:

1. **영화 수준의 비주얼**: 인터스텔라와 유사한 품질
2. **물리 기반**: 실제 강착원반의 특성 반영
3. **극한 Bloom**: 눈부신 빛 효과
4. **복잡한 디테일**: 6 옥타브 FBM으로 풍부한 텍스처
5. **동적 애니메이션**: 시간 기반 회전과 흐름
6. **최적화된 성능**: 30+ FPS 유지

## 🔧 커스터마이징 가이드

### 색상 변경
```typescript
diskUniforms.current = {
  colorInner: { value: new THREE.Color('#FF4500') }, // 내부 색상
  colorOuter: { value: new THREE.Color('#FFFF00') }, // 외부 색상
};
```

### 회전 속도 조정
```glsl
float rotation = time * 0.5;  // 0.5를 변경 (더 크면 빠름)
```

### 밝기 조정
```glsl
float brightness = mix(3.0, 8.0, temperature * pattern);
// 3.0과 8.0을 조정 (더 크면 밝음)
```

### 나선팔 개수
```glsl
float spiralArms = sin(angle * 5.0 - ...);
// 5.0을 변경 (더 크면 더 많은 나선팔)
```

## 📚 참고 자료

- [Interstellar Black Hole VFX](https://www.wired.com/2014/10/astrophysics-interstellar-black-hole/)
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise)
- [Fractal Brownian Motion](https://thebookofshaders.com/13/)
- [Fresnel Effect](https://en.wikipedia.org/wiki/Fresnel_equations)
- [Three.js Shader Material](https://threejs.org/docs/#api/en/materials/ShaderMaterial)

---

**Created with ❤️ for TON-618 Quasar 3D**
