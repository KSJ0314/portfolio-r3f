import { Suspense, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector2 } from 'three'
import type { Group } from 'three'
import { STATIONS } from '../../content/stations'
import { getStationEntry } from '../../stations'
import { useCameraStore } from '../../state/useCameraStore'
import { useStationStore } from '../../state/useStationStore'
import { Station } from './Station'
import { isAfterTouchDrag, registerTouchTarget } from '../touchMove'

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/**
 * 스테이션 배치 + 근접 판정 + 좌클릭 활성화.
 *
 * **근접을 따지는 것은 반경을 등록한 스테이션뿐이다**(건물 문처럼 들어가는 곳이 정해진 경우).
 * 나머지는 종이 위에 그려진 페이지라 어디에 서 있든 눌러서 열고, 걸어서 멀어져도 닫히지 않는다.
 * 반경을 등록한 스테이션은 그 구역을 벗어나는 것이 곧 닫기이므로 그 판단도 여기서 한다.
 */
export function Stations() {
  const { camera, gl } = useThree()
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    // 캐릭터 위치는 좌표만 바뀌므로 구독 없이 getState로 읽는다.
    const pos = useCameraStore.getState().position
    let nearest: string | null = null
    let best = Infinity
    for (const station of STATIONS) {
      // 자리가 정해지지 않은 스테이션은 종이 위에 없으므로 근접도 없다.
      const at = station.position
      if (!at) continue
      const entry = getStationEntry(station.id)
      // 반경을 등록하지 않았으면 거리를 보지 않는 스테이션이라 근접 대상이 아니다.
      if (entry?.nearRadius === undefined) continue
      // 거리 재는 법은 스테이션이 등록한 것을 쓴다(영역이 있으면 그 테두리 기준).
      // 등록하지 않았으면 배치 좌표까지의 거리로 잰다.
      const dist = entry.distanceTo
        ? entry.distanceTo(pos, station)
        : Math.hypot(pos.x - at[0], pos.z - at[1])
      if (dist <= entry.nearRadius && dist < best) {
        best = dist
        nearest = station.id
      }
    }

    const store = useStationStore.getState()
    store.setNear(nearest)
    // 구역을 벗어나는 것이 곧 닫기다. 거리를 보지 않는 스테이션은 그렇게 닫히지 않는다.
    const { activeId, phase } = store
    if (
      phase === 'active' &&
      activeId !== null &&
      activeId !== nearest &&
      getStationEntry(activeId)?.nearRadius !== undefined
    ) {
      store.requestClose()
    }
  })

  // 좌클릭 활성화는 R3F의 포인터 이벤트(onClick·onPointerDown)를 쓰지 않고 mousedown을 직접 듣는다.
  // pointerdown은 포인터가 비활성에서 활성으로 바뀔 때만 발생한다.
  // 그래서 우클릭 홀드로 이동하는 중에 좌클릭을 더 누르면 pointerdown이 아예 발생하지 않아
  // R3F 이벤트로는 클릭을 잡을 수 없다(buttons 값만 바뀐 pointermove로 온다).
  // mousedown은 버튼마다 매번 발생하므로 이걸 듣고, 커서 밑을 직접 쏴서 어느 스테이션인지 판정한다.
  // 탭으로 열 수 있는 것으로 등록한다. 이동 쪽이 이것을 보고 탭을 여는 쪽에 넘긴다.
  useEffect(() => {
    const object = groupRef.current
    if (!object) return
    return registerTouchTarget(object)
  })

  useEffect(() => {
    const canvas = gl.domElement
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 손가락으로 끌어 이동한 직후에는 받지 않는다. 뗀 자리에서 흉내 낸 마우스 이벤트가 뒤따라온다.
      if (isAfterTouchDrag()) return
      const group = groupRef.current
      if (!group) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      // 커서가 맞힌 스테이션(id는 각 Station이 userData에 실어둔다).
      const hit = _raycaster.intersectObjects(group.children, true)[0]
      const stationId = hit?.object.userData.stationId
      if (typeof stationId !== 'string') return
      // 근접해야 열리는 스테이션은 그 구역 안에서만 받는다. idle 여부는 스토어가 본다.
      const near = getStationEntry(stationId)?.nearRadius === undefined
      if (!near && useStationStore.getState().nearId !== stationId) return
      useStationStore.getState().activate(stationId)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  return (
    <group ref={groupRef}>
      {/* 경계는 스테이션마다 따로 둔다. 하나로 묶으면 가장 느린 텍스처가 준비될 때까지
          다른 스테이션까지 통째로 안 그려져, 다 같이 늦게 한꺼번에 나타난다. */}
      {STATIONS.map((station) => (
        <Suspense key={station.id} fallback={null}>
          <Station data={station} />
        </Suspense>
      ))}
    </group>
  )
}
