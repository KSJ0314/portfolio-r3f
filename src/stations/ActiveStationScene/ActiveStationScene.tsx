import { useStationStore } from '../../state/useStationStore'
import { useActiveStation } from '../useActiveStation'

/**
 * 활성 스테이션의 3D 상세를 마운트하는 자리(Canvas 안).
 * 공통층은 자리만 내주고 무엇이 그려지는지는 관여하지 않는다 — 등록된 구현이 없으면
 * 아무것도 렌더되지 않는다. 활성화되는 동안 카메라 제어권은 이 안의 컴포넌트에 있다.
 */
export function ActiveStationScene() {
  const phase = useStationStore((s) => s.phase)
  const active = useActiveStation()
  const Scene = active?.entry.Scene
  if (!Scene || !active) return null

  // 스테이션이 바뀌면 이전 구현이 확실히 언마운트되도록 key를 준다(트윈·리소스 정리 보장).
  return <Scene key={active.station.id} station={active.station} phase={phase} />
}
