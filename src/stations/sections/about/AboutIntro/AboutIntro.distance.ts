import type { Vector3 } from 'three'
import type { Station } from '../../../../content/stations'
import { useIntroPageStore } from '../../../../state/useIntroPageStore'

/**
 * 캐릭터에서 Intro 영역 테두리까지의 최단거리. 영역 안이면 0.
 * 근접 판정이 중심점이 아니라 영역 기준으로 잡히도록 레지스트리에 등록한다.
 */
export function aboutIntroDistanceTo(point: Vector3, station: Station): number {
  const { width, height } = useIntroPageStore.getState().area
  const dx = Math.max(Math.abs(point.x - station.position[0]) - width / 2, 0)
  const dz = Math.max(Math.abs(point.z - station.position[1]) - height / 2, 0)
  return Math.hypot(dx, dz)
}
