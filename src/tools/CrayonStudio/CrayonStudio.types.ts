/**
 * 크레파스 스튜디오가 다루는 값.
 *
 * 굵기와 손떨림은 픽셀이 아니라 **비율**로 갖는다. 툴의 캔버스 크기와 실제로 쓰이는 월드 크기가
 * 다르므로, 픽셀로 잡아 두면 옮겨 쓸 때 어긋난다. 비율이면 `<Crayon>`의 어떤 크기에도 그대로 맞는다.
 */
export interface CrayonStudioParams {
  /** 크레파스 색. */
  color: string
  /** 획 굵기 — 캔버스 한 변의 몇 배인지. */
  widthRatio: number
  /** 손떨림 폭 — 획 굵기의 몇 배인지. */
  wobbleRatio: number
  /** 가장 진하게 눌린 곳의 진하기(0~1). */
  opacity: number
  /** 가장자리가 흩어지는 정도(0~1). */
  roughness: number
  /** 왁스가 끊기는 정도(0~1). */
  patchiness: number
}

/**
 * 내보내기 프레임 — 판 안의 사각 영역(판 0~1 기준).
 *
 * 여기가 곧 좌표 0~1의 기준이자 PNG 크롭 범위다. 그림과 분리돼 있어 옮기거나 키워도 그린 획은 그대로다.
 * 프레임을 그림보다 크게 잡으면 그만큼 좌표·사진에 여백이 생긴다. 가로·세로를 따로 늘일 수 있다.
 */
export interface CrayonFrame {
  /** 왼쪽 — 판 가로의 0~1. */
  x: number
  /** 위 — 판 세로의 0~1. */
  y: number
  /** 가로 — 판 가로의 0~1. */
  w: number
  /** 세로 — 판 세로의 0~1. */
  h: number
}
