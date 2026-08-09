import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { CameraRig } from '../CameraRig'
import { World } from '../World'
import { Character } from '../Character'
import { Stations } from '../Stations'
import { SceneErrorBoundary } from '../SceneErrorBoundary'
import { MapDecorations } from '../MapDecorations'
import { AssetPreload } from '../AssetPreload'
import { ActiveStationScene } from '../../stations'

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
      // 스텐실 버퍼는 기본으로 꺼져 있다. 그림자 실루엣을 표시해 한 겹만 칠하는 데 쓴다(CareerTrophy).
      gl={{ stencil: true }}
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

      {/* 씬 콘텐츠는 안전망으로 감싼다 — 한 곳의 렌더 에러가 앱 전체를 언마운트하지 않게. */}
      <SceneErrorBoundary>
        {/* 바닥은 모눈 텍스처를 불러오는 동안 잠시 비어 있다(로딩 연출은 폴리싱 단계에서). */}
        <Suspense fallback={null}>
          <World />
        </Suspense>
        <Character />
        <CameraRig />
        {/* 스테이션 콘텐츠는 텍스처를 useLoader로 불러오다 suspend하므로 Suspense로 감싼다.
            비활성 모습과 활성 상세는 경계를 따로 둔다 — 한 경계로 묶으면 비활성 텍스처가 준비될
            때까지 활성 구현이 커밋되지 못해, 첫 화면의 카메라 자세를 잡는 일이 그만큼 늦어진다
            (그동안 CameraRig의 항공뷰가 보이다가 튄다). */}
        <Suspense fallback={null}>
          <Stations />
        </Suspense>
        <Suspense fallback={null}>
          <ActiveStationScene />
        </Suspense>
        <MapDecorations />
        {/* 스테이션을 열 때 굽기 시작하지 않도록 에셋을 미리 굽는다(그리는 것은 없다). */}
        <AssetPreload />
      </SceneErrorBoundary>
    </Canvas>
  )
}
