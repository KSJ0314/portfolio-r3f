import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { type Group, Raycaster, Vector2 } from 'three'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { useGalleryFocusStore } from '../../../../../state/useGalleryFocusStore'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { GALLERY_TO_LOBBY_TRIGGER } from '../ProjectsGallery.constants'
import { leaveGallery } from '../ProjectsGallery.travel'
import { isAfterTouchDrag, registerTouchTarget } from '../../../../../scene/touchMove'

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/**
 * 누를 수 있는 트리거 — 지금은 로비로 돌아가는 문 하나다.
 *
 * 판은 모델 메시가 아니라 **잰 값으로 직접 세운다**(`useGalleryGeometryStore`). 자기 그룹만
 * 레이캐스트하므로 바닥·벽과 섞이지 않는다.
 *
 * **얹기는 R3F 이벤트, 누르기는 캔버스 `mousedown`**으로 나뉜다. 우클릭 홀드 중에는
 * `pointerdown`이 발생하지 않아 R3F 클릭이 잡히지 않지만(LEARNING 2026-07-13),
 * 얹기는 `pointermove`에서 나오므로 버튼을 누른 채여도 정상이다.
 *
 * **누를 수 있다는 표시는 두지 않는다.** 문틀 그대로라 나가는 곳으로 읽힌다(DESIGN).
 *
 * 나가는 길은 누르는 것 말고 **걸어 들어가는 것**도 있다. 문틀 안에 들어서면 누른 것과 같은 길을
 * 타므로, 두 방법이 여기 한자리에 있다.
 */
export function GalleryTriggers() {
  const { camera, gl } = useThree()
  const group = useRef<Group>(null)
  const triggers = useGalleryGeometryStore((s) => s.triggers)
  const focusedBay = useGalleryFocusStore((s) => s.focusedBay)
  // 액자를 확대해 보는 동안에는 문도 누를 수 없다. 닫는 것은 좌상단 뒤로 가기와 ESC가 맡는다.
  const cursor = usePointerCursor(focusedBay === null)
  const doorway = useGalleryGeometryStore((s) => s.triggers[GALLERY_TO_LOBBY_TRIGGER])

  // 문틀 안에 들어섰는지 본다. 바닥이 평평한 한 층뿐이라 높이는 보지 않는다.
  // 문틀 바깥에는 밟을 바닥이 없어 걸음이 저절로 물리므로 더 나갈 곳도 없다.
  // 이미 넘어가는 중이면 `leaveGallery`가 그냥 돌아가, 매 프레임 불려도 가던 곳이 바뀌지 않는다.
  useFrame(() => {
    if (!doorway) return
    if (useGalleryFocusStore.getState().focusedBay !== null) return
    const { position } = useInteriorStore.getState()
    if (Math.abs(position.x - doorway.x) > doorway.width / 2) return
    if (Math.abs(position.z - doorway.z) > doorway.depth / 2) return
    leaveGallery()
  })

  // 탭으로 열 수 있는 것으로 등록한다. 이동 쪽이 이것을 보고 탭을 여는 쪽에 넘긴다.
  useEffect(() => {
    const object = group.current
    if (!object) return
    return registerTouchTarget(object)
  })

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 손가락으로 끌어 이동한 직후에는 받지 않는다. 뗀 자리에서 흉내 낸 마우스 이벤트가 뒤따라온다.
      if (isAfterTouchDrag()) return
      // 이미 넘어가는 중이면 받지 않는다. 연타해도 가던 곳이 바뀌지 않아야 한다.
      if (isSceneCovered(useSceneTransitionStore.getState().phase)) return
      if (useGalleryFocusStore.getState().focusedBay !== null) return
      const plates = group.current
      if (!plates) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      const hit = _raycaster
        .intersectObjects(plates.children, true)
        .find((it) => typeof it.object.userData.triggerId === 'string')
      if (hit) leaveGallery()
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  return (
    <group ref={group}>
      {Object.entries(triggers).map(([name, trigger]) => (
        <mesh
          key={name}
          position={[trigger.x, trigger.y, trigger.z]}
          userData={{ triggerId: name }}
          {...cursor}
        >
          {/* 누를 판. 그림이 아니라 판정용이라 투명하게 두고 깊이도 쓰지 않는다. */}
          <boxGeometry args={[trigger.width, trigger.height, trigger.depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
