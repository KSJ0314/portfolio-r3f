/**
 * 항공뷰 배율의 기준값과 그것을 정한 화면 크기.
 *
 * 직교 카메라는 배율이 곧 "1유닛이 몇 픽셀인가"다.
 * 값을 고정하면 화면이 좁을수록 담기는 범위가 줄어 확대한 것처럼 보인다.
 */
export const AERIAL_BASE_ZOOM = 85
const BASE_WIDTH = 1280
const BASE_HEIGHT = 720

/**
 * 화면 크기에 맞춘 항공뷰 배율.
 *
 * 기준보다 좁은 만큼만 줄이고 넓어도 키우지 않는다.
 * 가로·세로 중 더 모자란 쪽을 따르므로 어느 축도 잘리지 않는다.
 *
 * 세로 방향이면 긴 변을 가로로 놓고 잰다.
 * 세로에서는 가로 회전 안내가 씬을 덮고 있어 그 배율이 화면에 쓰이지 않는다.
 * 돌아간 뒤의 크기로 미리 잡아 두므로 회전하는 시점에 다시 맞출 것이 없다.
 */
export function fitAerialZoom(width: number, height: number): number {
  const long = Math.max(width, height)
  const short = Math.min(width, height)
  const ratio = Math.min(long / BASE_WIDTH, short / BASE_HEIGHT, 1)
  return AERIAL_BASE_ZOOM * ratio
}
