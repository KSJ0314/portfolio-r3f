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
