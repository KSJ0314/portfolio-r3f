import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { type Group, Raycaster, Vector2 } from 'three'
import { ClickMarker } from '../../../../../scene/ClickMarker'
import { isAfterTouchDrag, registerTouchTarget } from '../../../../../scene/touchMove'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { useLobbyGeometryStore } from '../../../../../state/useLobbyGeometryStore'
import { useLobbyPageStore } from '../../../../../state/useLobbyPageStore'
import { useLobbyTriggerStore } from '../../../../../state/useLobbyTriggerStore'
import { LOBBY_MARKED_TRIGGERS, LOBBY_TRAVEL_TRIGGERS } from '../ProjectsLobby.constants'
import { canWalkToPassage, walkIntoPassage } from '../ProjectsLobby.travel'
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
 *
 * **가는 트리거는 그 자리에서 보는 트리거와 갈린다**(`LOBBY_TRAVEL_TRIGGERS`).
 * 카메라를 돌리는 대신 캐릭터를 그 앞으로 걸려 보내고, 넘어가는 것은 도착을 지켜보는
 * `LobbyPassage`가 맡는다. 갈 수 없는 자리에서는 손가락 커서도 두지 않는다 —
 * 누를 수 있어 보이는데 아무 일도 없는 편이 더 나쁘다.
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
  // 가는 트리거는 설 수 있는 자리에서만 누를 수 있다고 보인다. 조건은 지금 위치를 봐야 알므로
  // 얹히는 순간에 확인한다. 되돌리는 일과 정리는 공용 훅이 그대로 맡는다.
  const travelCursor = {
    ...cursor,
    onPointerOver: () => {
      if (canWalkToPassage()) cursor.onPointerOver?.()
    },
  }

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
      if (!hit) return

      const id = hit.object.userData.triggerId as string
      if (LOBBY_TRAVEL_TRIGGERS[id]) {
        if (canWalkToPassage()) walkIntoPassage()
        return
      }
      useLobbyTriggerStore.getState().activate(id)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  return (
    <group ref={group}>
      {Object.entries(triggers).map(([name, trigger]) => (
        <group key={name} position={[trigger.x, trigger.y, trigger.z]}>
          {/* 누를 판. 그림이 아니라 판정용이라 투명하게 두고 깊이도 쓰지 않는다. */}
          <mesh
            userData={{ triggerId: name }}
            {...(LOBBY_TRAVEL_TRIGGERS[name] ? travelCursor : cursor)}
          >
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
