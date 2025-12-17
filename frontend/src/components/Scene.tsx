import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import Quasar from './Quasar'

export default function Scene() {
  return (
    // [최적의 배경 화질을 위한 CSS 방식 유지]
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundImage: 'url(/space.png)', // public 폴더의 고화질 이미지 사용
      backgroundSize: 'cover', // 화면에 꽉 차게, 비율 유지하며 잘림
      backgroundPosition: 'center', // 중앙 정렬
      backgroundColor: 'black'
    }}>
      <Canvas 
        dpr={[1.5, 2]} // 높은 해상도 유지
        // [중요] alpha: true로 설정하여 캔버스 뒤의 CSS 배경이 보이게 함
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 10, 80], fov: 35, far: 5000 }}
      >
        <Suspense fallback={null}>
          {/* 입체감을 위한 3D 별 (배경 이미지와 섞임) */}
          <Stars radius={400} depth={100} count={3000} factor={4} saturation={0} fade speed={1} />
          <Quasar />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={10} 
          maxDistance={1500}
          target={[0, 0, 0]} 
          makeDefault 
        />
      </Canvas>
    </div>
  )
}