import type { Vector3 } from 'three'
import { useCareerPageStore } from '../../../../state/useCareerPageStore'

/**
 * 캐릭터에서 Career 영역 테두리까지의 최단거리. 영역 안이면 0.
 * 영역은 상단 중앙 꼭지점 + 크기로 정해지므로 중심을 계산해 그 기준으로 잰다.
 * (배치 좌표 station.position이 아니라 HUD로 조절되는 store 값을 따른다.)
 */
export function aboutCareerDistanceTo(point: Vector3): number {
  const { area, topCenter } = useCareerPageStore.getState()
  const centerZ = topCenter.z + area.height / 2
  const dx = Math.max(Math.abs(point.x - topCenter.x) - area.width / 2, 0)
  const dz = Math.max(Math.abs(point.z - centerZ) - area.height / 2, 0)
  return Math.hypot(dx, dz)
}
