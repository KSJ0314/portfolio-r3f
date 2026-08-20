import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { type Group, Raycaster, Vector2 } from 'three'
import { ClickMarker } from '../../../../../scene/ClickMarker'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { useLobbyGeometryStore } from '../../../../../state/useLobbyGeometryStore'
import { useLobbyPageStore } from '../../../../../state/useLobbyPageStore'
import { useLobbyTriggerStore } from '../../../../../state/useLobbyTriggerStore'
import { LOBBY_MARKED_TRIGGERS } from '../ProjectsLobby.constants'
import {
  LOBBY_TRIGGER_MARKER_BOB_SECONDS,
  LOBBY_TRIGGER_MARKER_FADE_SECONDS,
  LOBBY_TRIGGER_MARKER_SPIN_SECONDS,
} from './LobbyTriggers.constants'

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/**
 * 누를 수 있는 트리거 — 누를 판과 표시.
 *
 * 판은 모델 메시가 아니라 **잰 값으로 직접 세운다**(`useLobbyGeometryStore`). 자기 그룹만
 * 레이캐스트하므로 바닥·벽과 섞이지 않는다. `scene/Stations`가 스테이션을 다루는 것과 같은 꼴이다.
 *
 * **얹기는 R3F 이벤트, 누르기는 캔버스 `mousedown`**으로 나뉜다. 우클릭 홀드 중에는
 * `pointerdown`이 발생하지 않아 R3F 클릭이 잡히지 않지만(LEARNING 2026-07-13),
 * 얹기는 `pointermove`에서 나오므로 버튼을 누른 채여도 정상이다.
 */
export function LobbyTriggers() {
  const { camera, gl } = useThree()
  const group = useRef<Group>(null)
  const triggers = useLobbyGeometryStore((s) => s.triggers)
  const seen = useLobbyTriggerStore((s) => s.seen)
  const activeId = useLobbyTriggerStore((s) => s.activeId)
  const tuning = useLobbyPageStore((s) => s.trigger)
  // 트리거를 보는 동안에는 손가락 커서를 걷는다. 이미 연 것을 다시 누르라고 할 이유가 없다.
  const cursor = usePointerCursor(activeId === null)

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 이미 보고 있는 동안에는 받지 않는다. 커서도 걷혀 있어 누를 수 있다고 보이지도 않는다.
      if (useLobbyTriggerStore.getState().activeId !== null) return
      const plates = group.current
      if (!plates) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      // 판 앞에 뜬 클릭 표시도 레이에 걸리므로 첫 히트만 보면 안 된다. 표시는 처음 열기
      // 전에만 있어, 정작 눌러야 할 때 그것이 판을 가린다.
      const hit = _raycaster
        .intersectObjects(plates.children, true)
        .find((it) => typeof it.object.userData.triggerId === 'string')
      if (hit) useLobbyTriggerStore.getState().activate(hit.object.userData.triggerId as string)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  return (
    <group ref={group}>
      {Object.entries(triggers).map(([name, trigger]) => (
        <group key={name} position={[trigger.x, trigger.y, trigger.z]}>
          {/* 누를 판. 그림이 아니라 판정용이라 투명하게 두고 깊이도 쓰지 않는다. */}
          <mesh userData={{ triggerId: name }} {...cursor}>
            <boxGeometry args={[trigger.width, trigger.height, trigger.depth]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* 한 번 열고 나면 걷는다 — 어디를 눌러야 하는지 알려 주는 것이 할 일의 전부다. */}
          <ClickMarker
            visible={LOBBY_MARKED_TRIGGERS.includes(name) && !seen[name]}
            y={trigger.height / 2 + tuning.markerGap}
            size={tuning.markerSize}
            bob={tuning.markerBob}
            bobSeconds={LOBBY_TRIGGER_MARKER_BOB_SECONDS}
            spinSeconds={LOBBY_TRIGGER_MARKER_SPIN_SECONDS}
            fadeSeconds={LOBBY_TRIGGER_MARKER_FADE_SECONDS}
          />
        </group>
      ))}
    </group>
  )
}
