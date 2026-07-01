import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'

export function Experience() {
  const mode = useThemeStore((s) => s.mode)
  const theme = themes[mode]
  const { scene } = theme

  return (
    <Canvas
      camera={{ position: [6, 6, 6], fov: 45 }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <color attach="background" args={[scene.background]} />
      <ambientLight color={scene.ambient} intensity={scene.ambientIntensity} />
      <directionalLight
        color={scene.directional}
        intensity={scene.directionalIntensity}
        position={[5, 8, 5]}
      />

      {/* 임시 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={scene.ground} />
      </mesh>

      {/* 임시 오브젝트 (Phase 1에서 캐릭터/스테이션으로 대체) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={theme.colors.accent} />
      </mesh>

      {/* 임시 카메라 컨트롤 (Phase 1 클릭 이동으로 대체 예정) */}
      <OrbitControls />
    </Canvas>
  )
}
