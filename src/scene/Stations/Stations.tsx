import { useFrame } from '@react-three/fiber'
import { STATIONS } from '../../content/stations'
import { useCameraStore } from '../../state/useCameraStore'
import { useStationStore } from '../../state/useStationStore'
import { Station } from './Station'

/** 이 반경 안에 캐릭터가 들어오면 가장 가까운 스테이션을 근접으로 본다. */
const NEAR_RADIUS = 3

/**
 * 스테이션 배치 + 근접 판정.
 * 매 프레임 캐릭터에서 가장 가까운 스테이션을 찾아 스토어(nearId)에 반영한다.
 * (선택은 각 Station의 좌클릭이 담당.)
 */
export function Stations() {
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

  return (
    <group>
      {STATIONS.map((station) => (
        <Station key={station.id} data={station} />
      ))}
    </group>
  )
}
