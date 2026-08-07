import { MathUtils, type Vector3 } from 'three'
import { useCareerPageStore } from '../../../../state/useCareerPageStore'
import { CAREER_STAND_MARGIN } from './AboutCareer.constants'

/**
 * 캐릭터가 설 자리 — **지금 선 자리에서 가장 가까운 영역 테두리**.
 *
 * 위쪽에서 누르면 위 테두리로 내려오고 왼쪽에서 누르면 왼쪽 테두리로 붙는다.
 * 자리를 한 점으로 박아 두면 어디서 오든 그리로 돌아가야 해서 멀리 돌아가는 일이 생긴다.
 * 영역은 상수가 아니라 HUD 값을 보므로 영역을 옮기거나 크기를 바꿔도 따라온다.
 *
 * 영역 안이면 그 자리 그대로다(움직일 필요가 없다).
 */
export function careerStandFor(point: Vector3): readonly [number, number] {
  const { area, topCenter } = useCareerPageStore.getState()
  const halfWidth = area.width / 2
  const halfHeight = area.height / 2
  const centerZ = topCenter.z + halfHeight

  // 사각형 안으로 가둔 지점이 곧 테두리 위의 가장 가까운 점이다(안이면 가둬지지 않아 제자리다).
  const dx = MathUtils.clamp(point.x - topCenter.x, -halfWidth, halfWidth)
  const dz = MathUtils.clamp(point.z - centerZ, -halfHeight, halfHeight)

  // 가둬진 축(= 테두리에 닿은 쪽)만 바깥으로 조금 더 밀어 준다.
  const edgeX = Math.abs(dx) >= halfWidth ? Math.sign(dx) * (halfWidth + CAREER_STAND_MARGIN) : dx
  const edgeZ = Math.abs(dz) >= halfHeight ? Math.sign(dz) * (halfHeight + CAREER_STAND_MARGIN) : dz

  return [topCenter.x + edgeX, centerZ + edgeZ]
}
