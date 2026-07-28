import { useEffect } from 'react'
import { useStationStore } from '../../state/useStationStore'
import { useActiveStation } from '../useActiveStation'
import { clearStationGate, useStationGateOpen } from '../useStationGate'

/**
 * 활성 스테이션의 3D 상세를 마운트하는 자리(Canvas 안).
 * 공통층은 자리만 내주고 무엇이 그려지는지는 관여하지 않는다 — 등록된 구현이 없으면
 * 아무것도 렌더되지 않는다. 활성화되는 동안 카메라 제어권은 이 안의 컴포넌트에 있다.
 *
 * 상세는 **다 준비된 뒤 한 번에** 보여준다. 준비되지 않은 동안에도 마운트는 해 두고 그리지만
 * 않으므로, 그동안 텍스처를 굽고 글자 크기를 재는 일이 끝난다. 무엇을 기다릴지는 스테이션이
 * `useStationGate`로 알린다(기다릴 것이 없으면 곧바로 보인다).
 */
export function ActiveStationScene() {
  const phase = useStationStore((s) => s.phase)
  const active = useActiveStation()
  const open = useStationGateOpen()
  const stationId = active?.station.id

  // 스테이션이 바뀌거나 닫히면 남은 열쇠를 비운다 — 이전 스테이션의 것이 다음을 막지 않게.
  useEffect(() => {
    return () => clearStationGate()
  }, [stationId])

  const Scene = active?.entry.Scene
  if (!Scene || !active) return null

  // 스테이션이 바뀌면 이전 구현이 확실히 언마운트되도록 key를 준다(트윈·리소스 정리 보장).
  return (
    <group visible={open}>
      <Scene key={active.station.id} station={active.station} phase={phase} />
    </group>
  )
}
