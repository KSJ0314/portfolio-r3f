import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { type Group, Raycaster, Vector2 } from 'three'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { leaveGallery } from '../ProjectsGallery.travel'

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
 */
export function GalleryTriggers() {
  const { camera, gl } = useThree()
  const group = useRef<Group>(null)
  const triggers = useGalleryGeometryStore((s) => s.triggers)
  const cursor = usePointerCursor()

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 이미 넘어가는 중이면 받지 않는다. 연타해도 가던 곳이 바뀌지 않아야 한다.
      if (isSceneCovered(useSceneTransitionStore.getState().phase)) return
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
