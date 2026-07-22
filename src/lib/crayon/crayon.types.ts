/** 크레파스 획 한 줄을 그리는 값. */
export interface CrayonStrokeParams {
  /** 획 굵기(px). */
  width: number
  /** 크레파스 색. */
  color: string
  /** 가장 진하게 눌린 곳의 진하기(0~1). */
  opacity: number
  /** 가장자리가 흩어지는 정도(0~1). 클수록 테두리가 너덜너덜해진다. */
  roughness: number
  /** 왁스가 끊기는 정도(0~1). 클수록 중간중간 비는 곳이 많다. */
  patchiness: number
  /** 손으로 그은 듯 경로가 흔들리는 폭(px). */
  wobble: number
  /** 난수 씨앗. 같은 값이면 같은 그림이 나온다. */
  seed: number
}

/** 획 경로를 이루는 점(캔버스 픽셀 좌표). */
export type CrayonPoint = readonly [number, number]
