import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { CameraRig } from '../CameraRig'
import { World } from '../World'
import { Character } from '../Character'
import { Stations } from '../Stations'
import { ActiveStationScene } from '../../features/stations'

export function Experience() {
  const mode = useThemeStore((s) => s.mode)
  const { scene } = themes[mode]

  return (
    <Canvas
      orthographic
      // 카메라 위치가 시점의 단일 소스다(CameraRig가 여기서 오프셋·미니맵 각도를 유도한다).
      // 캐릭터를 비스듬히 내려다보는 항공뷰. 정확한 대각선(45°)을 피해 방위각을 살짝 틀었다.
      // y는 내려다보는 고도각을 정한다(약 42°). 높일수록 위에서 내려다보는 시점이 된다.
      // xz는 캐릭터 시작 위치(CHARACTER_START)에 오프셋 (-7, +12)를 더한 값이다.
      // 캐릭터 시작점을 옮기면 여기도 같이 옮겨야 시점이 유지된다.
      camera={{ position: [-7, 12.5, 17], zoom: 85, near: 0.1, far: 100 }}
      style={{ position: 'fixed', inset: 0 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <color attach="background" args={[scene.background]} />
      <ambientLight color={scene.ambient} intensity={scene.ambientIntensity} />
      <directionalLight
        color={scene.directional}
        intensity={scene.directionalIntensity}
        position={[5, 8, 5]}
      />

      {/* 바닥은 모눈 텍스처를 불러오는 동안 잠시 비어 있다(로딩 연출은 폴리싱 단계에서). */}
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <Stations />
      <Character />
      <CameraRig />
      {/* 활성 스테이션의 3D 상세 자리 — 활성화 중 카메라 제어권은 이 안의 구현이 가진다. */}
      <ActiveStationScene />
    </Canvas>
  )
}
