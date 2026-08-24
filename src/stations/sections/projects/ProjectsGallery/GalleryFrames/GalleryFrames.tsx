import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { type Group, Raycaster, Vector2 } from 'three'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { useGalleryFocusStore } from '../../../../../state/useGalleryFocusStore'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { frameRect } from './GalleryFrames.bounds'
import { GALLERY_FRAME_HIT_LIFT } from './GalleryFrames.constants'

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/**
 * 전시 칸을 눌러 확대해 보는 자리.
 *
 * 누를 것은 액자와 그 아래 이름판을 **함께 감싼 사각형** 하나다. 판은 모델 메시가 아니라
 * 잰 값으로 직접 세우고(`useGalleryGeometryStore`) 자기 그룹만 레이캐스트하므로 벽·바닥과
 * 섞이지 않는다. 문 트리거(`GalleryTriggers`)와 같은 방식이다.
 *
 * **얹기는 R3F 이벤트, 누르기는 캔버스 `mousedown`**으로 나뉜다. 우클릭 홀드 중에는
 * `pointerdown`이 발생하지 않아 R3F 클릭이 잡히지 않지만(LEARNING 2026-07-13),
 * 얹기는 `pointermove`에서 나오므로 버튼을 누른 채여도 정상이다.
 *
 * 이미 확대해 보고 있는 동안에는 누를 수 없고 손가락 커서도 걷는다 — 닫는 것은 좌상단
 * 뒤로 가기와 ESC가 맡는다.
 */
export function GalleryFrames() {
  const { camera, gl } = useThree()
  const group = useRef<Group>(null)
  const artworks = useGalleryGeometryStore((s) => s.artworks)
  const plates = useGalleryGeometryStore((s) => s.plates)
  const focusedBay = useGalleryFocusStore((s) => s.focusedBay)
  const cursor = usePointerCursor(focusedBay === null)

  const rects = useMemo(
    () => artworks.map((artwork, index) => frameRect(artwork, plates[index])),
    [artworks, plates],
  )

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 넘어가는 중이거나 이미 보고 있는 동안에는 받지 않는다.
      if (isSceneCovered(useSceneTransitionStore.getState().phase)) return
      if (useGalleryFocusStore.getState().focusedBay !== null) return
      const hits = group.current
      if (!hits) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      const hit = _raycaster
        .intersectObjects(hits.children, true)
        .find((it) => typeof it.object.userData.bay === 'number')
      if (hit) useGalleryFocusStore.getState().focus(hit.object.userData.bay as number)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  return (
    <group ref={group}>
      {rects.map((rect, index) => (
        <mesh
          key={index}
          position={[rect.x, rect.y, rect.z + GALLERY_FRAME_HIT_LIFT]}
          userData={{ bay: index }}
          {...cursor}
        >
          {/* 누를 판. 그림이 아니라 판정용이라 투명하게 두고 깊이도 쓰지 않는다. */}
          <planeGeometry args={[rect.width, rect.height]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
