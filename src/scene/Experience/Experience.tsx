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
      camera={{ position: [10, 10, 10], zoom: 120, near: 0.1, far: 100 }}
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

      <World />
      <Stations />
      <Character />
      <CameraRig />
      {/* 활성 스테이션의 3D 상세 자리 — 활성화 중 카메라 제어권은 이 안의 구현이 가진다. */}
      <ActiveStationScene />
    </Canvas>
  )
}
