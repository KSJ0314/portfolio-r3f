import type { Vector3 } from 'three'
import { useProjectsDoorStore } from '../../../../state/useProjectsDoorStore'
import { useProjectsPageStore } from '../../../../state/useProjectsPageStore'

/**
 * 문 앞 구역의 중심(월드 x, z).
 *
 * 문 자리는 모델에서 잰 값이고, 거기서 **문이 향하는 쪽으로** 뻗어 나간다.
 * 앞으로 나가는 거리는 모델 좌표라 건물 배율이 곱해진다.
 */
function nearCenter(): { x: number; z: number; halfWidth: number; halfDepth: number } {
  const { building, near } = useProjectsPageStore.getState()
  const door = useProjectsDoorStore.getState().door
  const forward = near.forward * door.scale
  return {
    x: building.x + door.x + door.facingX * forward,
    z: building.z + door.z + door.facingZ * forward,
    halfWidth: (near.width * door.scale) / 2,
    halfDepth: (near.depth * door.scale) / 2,
  }
}

/**
 * 캐릭터에서 프로젝트 구역까지의 거리 — **건물 전체가 아니라 문 앞 구역**까지다.
 *
 * 건물은 덩치가 커서 그 전체를 판정 범위로 두면 뒤편이나 옆에서도 문이 눌린다.
 * 들어가는 곳은 문 하나이므로 그 앞에 선 사람만 근접으로 본다.
 * 구역 안이면 0이고, 밖이면 테두리까지의 최단거리다. (DECISIONS 014)
 */
export function projectsBuildingDistanceTo(point: Vector3): number {
  const { x, z, halfWidth, halfDepth } = nearCenter()
  // 사각형 밖으로 얼마나 벗어났는지만 축마다 잰다(안이면 0).
  const dx = Math.max(Math.abs(point.x - x) - halfWidth, 0)
  const dz = Math.max(Math.abs(point.z - z) - halfDepth, 0)
  return Math.hypot(dx, dz)
}

/**
 * 활성화할 때 캐릭터가 서는 자리(월드 x, z) — 문 앞이다.
 *
 * 상수가 아니라 함수인 이유는 문 자리를 **모델에서 재기 때문**이다. 모듈이 로드되는 시점에는
 * 아직 모델을 읽지 않았으므로 값으로 둘 수 없다. 재기 전이면 null이라 진입 이동을 건너뛴다.
 */
export function projectsBuildingStand(): readonly [number, number] | null {
  const door = useProjectsDoorStore.getState().door
  if (door.width === 0) return null
  const { building } = useProjectsPageStore.getState()
  const forward = useProjectsPageStore.getState().near.forward * door.scale
  return [
    building.x + door.x + door.facingX * forward,
    building.z + door.z + door.facingZ * forward,
  ]
}
