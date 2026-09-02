import { MathUtils } from 'three'
import type { Group, Vector3 } from 'three'

/** 두 각의 차이를 짧은 쪽(−180°~180°)으로 접는다. 접지 않으면 ±180° 경계에서 한 바퀴 돈다. */
function shortestTurn(radians: number): number {
  return Math.atan2(Math.sin(radians), Math.cos(radians))
}

/** 그 지점을 바라보는 각. `heading`에 넣으면 도는 것은 매 프레임 하던 대로 이어진다. */
export function headingTo(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  facing: number,
): number {
  return Math.atan2(toX - fromX, toZ - fromZ) + MathUtils.degToRad(facing)
}

/**
 * 간 방향으로 몸을 돌린다. 제자리면 보던 쪽을 그대로 둔다.
 *
 * 남은 각의 일부씩 따라가므로 프레임 간격이 달라도 도는 데 걸리는 시간이 같다.
 * `heading`은 목표 각을 담아 두는 자리다 — 멈춰 선 프레임에도 돌던 쪽을 이어 봐야 한다.
 */
export function faceMoveDirection(
  group: Group,
  moved: Vector3,
  heading: { current: number },
  facing: number,
  turnSeconds: number,
  delta: number,
): void {
  if (moved.lengthSq() > 0) {
    heading.current = Math.atan2(moved.x, moved.z) + MathUtils.degToRad(facing)
  }
  const ratio = turnSeconds > 0 ? 1 - Math.exp(-delta / turnSeconds) : 1
  group.rotation.y += shortestTurn(heading.current - group.rotation.y) * ratio
}
