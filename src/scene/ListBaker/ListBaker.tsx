import { Suspense, useCallback, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { configureDracoDecoder } from '../../lib/draco'
import { SceneErrorBoundary } from '../SceneErrorBoundary'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'
import { useThemeStore } from '../../state/useThemeStore'
import { useStationGateOpen } from '../../stations/useStationGate'
import { themes } from '../../theme/themes'
import { FOCUS_HEIGHT, LIST_BACKGROUND } from './ListBaker.constants'
import { useListScreens } from './ListBaker.screens'
import { ListBakerCapture } from './ListBaker.capture'
import { ListBakerContent } from './ListBaker.content'
import { Stage } from './ListBaker.styled'
import type { ListBakerProps } from './ListBaker.types'

// 굽는 화면도 맵과 같은 모델을 쓰므로 디코더 자리를 함께 잡아 둔다.
configureDracoDecoder()

/**
 * 화면들을 PNG로 굽는 자리.
 *
 * 캔버스는 화면 밖에 두고, 다 구우면 쓰는 쪽이 이 컴포넌트를 걷는다 — 목록 페이지에는 이미지만 남는다.
 * 조명·스텐실은 맵의 씬과 같게 둔다. 다르면 같은 컴포넌트를 써도 다른 그림이 나온다.
 * 바탕만 흰색이고 모눈종이는 깔지 않는다.
 *
 * 언제 찍어도 되는지는 셋을 함께 본다 — 서스펜드하는 것이 다 준비됐는지(`drawn`),
 * Firestore와 글자 배치가 끝났는지(`useStationGateOpen`), 소개 글을 읽어 왔는지(`intro-text`).
 */
export function ListBaker({ projects, onProgress, onDone }: ListBakerProps) {
  const mode = useThemeStore((s) => s.mode)
  const { scene } = themes[mode]
  const screens = useListScreens(projects)
  const [drawn, setDrawn] = useState(false)
  const gateOpen = useStationGateOpen()
  const introReady = useSceneReadyStore((s) => Boolean(s.ready['intro-text']))
  const handleReady = useCallback(() => setDrawn(true), [])
  // 렌더마다 새 객체를 주면 R3F가 카메라 값을 다시 적용해, 찍는 도중에 자세가 처음으로 돌아간다.
  const camera = useMemo(
    () => ({ position: [0, FOCUS_HEIGHT, 0] as [number, number, number], near: 0.1, far: 100 }),
    [],
  )

  return (
    <Stage aria-hidden>
      <Canvas
        orthographic
        dpr={1}
        camera={camera}
        // 그린 것을 읽어 가야 하므로 버퍼를 남긴다. 스텐실은 트로피 바닥 그림자가 쓴다.
        gl={{ stencil: true, preserveDrawingBuffer: true }}
      >
        {/* 바탕은 테마가 아니라 흰색이다. */}
        <color attach="background" args={[LIST_BACKGROUND]} />
        <ambientLight color={scene.ambient} intensity={scene.ambientIntensity} />
        <directionalLight
          color={scene.directional}
          intensity={scene.directionalIntensity}
          position={[5, 8, 5]}
        />

        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <ListBakerContent screens={screens} onReady={handleReady} />
          </Suspense>
          {/* 찍는 쪽은 경계 밖이다 — 안에 두면 무언가 서스펜드할 때 함께 사라진다. */}
          <ListBakerCapture
            screens={screens}
            ready={drawn && gateOpen && introReady}
            onProgress={onProgress}
            onDone={onDone}
          />
        </SceneErrorBoundary>
      </Canvas>
    </Stage>
  )
}
