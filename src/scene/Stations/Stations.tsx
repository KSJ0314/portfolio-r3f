import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector2 } from 'three'
import type { Group } from 'three'
import { STATIONS, getStation } from '../../content/stations'
import { fetchCollection } from '../../lib/firebase'
import { useCameraStore } from '../../state/useCameraStore'
import { useStationStore } from '../../state/useStationStore'
import { Station } from './Station'

/** 이 반경 안에 캐릭터가 들어오면 가장 가까운 스테이션을 근접으로 본다. */
const NEAR_RADIUS = 3

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/**
 * 스테이션 배치 + 근접 판정 + 좌클릭 활성화.
 * 매 프레임 캐릭터에서 가장 가까운 스테이션을 찾아 스토어(nearId)에 반영한다.
 */
export function Stations() {
  const { camera, gl } = useThree()
  const groupRef = useRef<Group>(null)
  const activeId = useStationStore((s) => s.activeId)

  useFrame(() => {
    // 캐릭터 위치는 좌표만 바뀌므로 구독 없이 getState로 읽는다.
    const pos = useCameraStore.getState().position
    let nearest: string | null = null
    let best = NEAR_RADIUS
    for (const station of STATIONS) {
      const dx = pos.x - station.position[0]
      const dz = pos.z - station.position[1]
      const dist = Math.hypot(dx, dz)
      if (dist < best) {
        best = dist
        nearest = station.id
      }
    }
    useStationStore.getState().setNear(nearest)
  })

  // 좌클릭 활성화는 R3F의 포인터 이벤트(onClick·onPointerDown)를 쓰지 않고 mousedown을 직접 듣는다.
  // pointerdown은 포인터가 비활성에서 활성으로 바뀔 때만 발생한다.
  // 그래서 우클릭 홀드로 이동하는 중에 좌클릭을 더 누르면 pointerdown이 아예 발생하지 않아
  // R3F 이벤트로는 클릭을 잡을 수 없다(buttons 값만 바뀐 pointermove로 온다).
  // mousedown은 버튼마다 매번 발생하므로 이걸 듣고, 커서 밑을 직접 쏴서 어느 스테이션인지 판정한다.
  useEffect(() => {
    const canvas = gl.domElement
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const group = groupRef.current
      if (!group) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      // 커서가 맞힌 스테이션(id는 각 Station이 userData에 실어둔다).
      // 근접·idle 여부는 스토어(activate)가 판정하므로 여기서 다시 보지 않는다.
      const hit = _raycaster.intersectObjects(group.children, true)[0]
      const stationId = hit?.object.userData.stationId
      if (typeof stationId === 'string') useStationStore.getState().activate(stationId)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl])

  // 스테이션이 활성화되면 그 스테이션에 매핑된 컬렉션을 읽어 콘솔에 찍는다(연결 확인용).
  // 읽어온 데이터로 무엇을 할지는 각 스테이션 상세 구현에서 정한다.
  useEffect(() => {
    if (!activeId) return
    const station = getStation(activeId)
    if (!station) return
    for (const col of station.collections) {
      fetchCollection(col)
        .then((data) => console.log('[read]', activeId, col, data))
        .catch((err) => console.error('[read:error]', activeId, col, err))
    }
  }, [activeId])

  return (
    <group ref={groupRef}>
      {STATIONS.map((station) => (
        <Station key={station.id} data={station} />
      ))}
    </group>
  )
}
