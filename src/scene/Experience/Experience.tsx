import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { configureDracoDecoder } from '../../lib/draco'
import { AERIAL_OFFSET, useCameraStore } from '../../state/useCameraStore'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { CameraRig } from '../CameraRig'
import { World } from '../World'
import { Character } from '../Character'
import { Stations } from '../Stations'
import { SceneErrorBoundary } from '../SceneErrorBoundary'
import { MapDecorations } from '../MapDecorations'
import { AssetPreload } from '../AssetPreload'
import { SceneArrival } from '../SceneArrival'
import { DevicePerfProbe } from '../DevicePerfProbe'
import { ActiveStationScene } from '../../stations'
import { fitAerialZoom } from './Experience.zoom'

// 문 앞에서 미리 받는 로비 모델이 Draco로 압축돼 있어, 이 씬에서도 디코더 자리를 잡아 둔다.
configureDracoDecoder()

export function Experience() {
  const mode = useThemeStore((s) => s.mode)
  const { scene } = themes[mode]

  // 카메라 위치가 시점의 단일 소스다(CameraRig가 여기서 오프셋·미니맵 각도를 유도한다).
  // 캐릭터를 비스듬히 내려다보는 항공뷰. 정확한 대각선(45°)을 피해 방위각을 살짝 틀었고,
  // 고도각(약 42°)은 오프셋의 y가 정한다.
  // **지금 캐릭터가 선 자리**에 오프셋을 더한다 — 상수로 박아 두면 로비에서 문 앞으로 돌아왔을 때
  // 캐릭터는 저쪽에 있는데 카메라만 시작점 근처에 놓여 오프셋이 틀어진다.
  // 마운트할 때 한 번만 잡는다. 이후 자리는 CameraRig가 매 프레임 맞춘다.
  const camera = useMemo(() => {
    const { position } = useCameraStore.getState()
    return {
      position: [
        position.x + AERIAL_OFFSET[0],
        AERIAL_OFFSET[1],
        position.z + AERIAL_OFFSET[2],
      ] as [number, number, number],
      zoom: fitAerialZoom(window.innerWidth, window.innerHeight),
      near: 0.1,
      far: 100,
    }
  }, [])

  return (
    <Canvas
      orthographic
      camera={camera}
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
        {/* 로비에서 돌아온 경우, 이 씬이 그려졌음을 알려야 전환 덮개가 열린다. */}
        <SceneArrival />
        {/* 무거운 연출을 켤지 정할 수 있게 기기 성능을 재 둔다(그리는 것은 없다). */}
        <DevicePerfProbe />
      </SceneErrorBoundary>
    </Canvas>
  )
}
