import { Canvas } from '@react-three/fiber'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { CameraRig } from '../CameraRig'
import { World } from '../World'
import { Character } from '../Character'

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
      <Character />
      <CameraRig />
    </Canvas>
  )
}
