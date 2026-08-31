import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { OrthographicCamera } from 'three'
import { createLogger } from '../../lib/logger'
import {
  FOCUS_HEIGHT,
  SETTLE_MS,
  SHOT_GAP_MS,
  SHOT_IMAGE_QUALITY,
  SHOT_IMAGE_TYPE,
} from './ListBaker.constants'
import { collectShotLinks } from './ListBaker.links'
import type { ListBakerCaptureProps, ListScreen, ListShot } from './ListBaker.types'

const log = createLogger('list:bake')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 캔버스에 지금 그려진 것을 받는다. */
function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * 화면을 한 장씩 찍는다.
 *
 * 수직으로 내려다보면 기본 up(+y)이 시선과 겹쳐 화면 방향이 정해지지 않으므로 월드 -z를 위로 준다.
 * 종이 위 화면이 그 방향으로 그려져 있고, 눕혀 둔 프로젝트 페이지도 같다.
 *
 * **이 컴포넌트는 내용의 Suspense 경계 밖에 둔다** — 안에 두면 무언가 서스펜드할 때 함께 사라져
 * 찍던 차례를 잃는다.
 */
export function ListBakerCapture({ screens, ready, onProgress, onDone }: ListBakerCaptureProps) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera) as OrthographicCamera

  useEffect(() => {
    if (!ready || screens.length === 0) return
    let cancelled = false

    const shoot = (screen: ListScreen) => {
      camera.up.set(0, 0, -1)
      camera.position.set(screen.x, FOCUS_HEIGHT, screen.z)
      camera.lookAt(screen.x, 0, screen.z)
      camera.zoom = screen.zoom
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld(true)
      gl.render(scene, camera)
      // 링크 자리는 그린 뒤에 찾는다 — 그때라야 월드 행렬이 이 자세로 맞춰져 있다.
      return Promise.all([
        toBlob(gl.domElement, SHOT_IMAGE_TYPE, SHOT_IMAGE_QUALITY),
        collectShotLinks(scene, camera),
      ] as const)
    }

    const run = async () => {
      // 그림이 로고 자리로 물러나고 글자 크기가 다 잡힐 때까지 기다린다.
      await wait(SETTLE_MS)
      const shots: ListShot[] = []
      for (const screen of screens) {
        if (cancelled) return
        const [blob, links] = await shoot(screen)
        if (cancelled) return
        if (blob) {
          shots.push({ id: screen.id, url: URL.createObjectURL(blob), links })
        }
        onProgress(shots.length)
        await wait(SHOT_GAP_MS)
      }
      if (cancelled) return
      log('%d장 구움', shots.length)
      onDone(shots)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [ready, screens, camera, gl, scene, onProgress, onDone])

  return null
}
