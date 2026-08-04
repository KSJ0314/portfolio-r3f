/** 2D 점 [x, y]. drawCrayonStroke에는 픽셀 좌표로, CrayonStroke에는 0~1 정규화 좌표로 쓴다. */
export type CrayonPoint = readonly [number, number]

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

/**
 * 그림 바깥 윤곽을 마무리하는 값.
 *
 * 획을 겹쳐 면을 채우면 획들이 끝나는 자리에서 윤곽이 딱 떨어진다.
 * 바깥으로 갈수록 알갱이를 덜 찍어 테두리를 너덜하게 남긴다.
 */
export interface CrayonEdgeParams {
  /** 알갱이가 성기어지는 띠의 폭 — 텍스처 짧은 변 대비 비율. */
  feather: number
  /** 거는 강도(0~1). 1이면 윤곽 바깥에서 알갱이가 완전히 사라진다. */
  strength: number
  /** 모서리가 둥글어지는 정도(0~1). 0이면 직각 그대로고, 곧은 변은 값과 무관하게 그대로다. */
  roundness: number
}

/** 한 그림의 획들이 함께 쓰는 값. 씨앗만 획마다 다르다. */
export type CrayonSharedParams = Partial<Omit<CrayonStrokeParams, 'seed'>> & {
  /** 바깥 윤곽 마무리. 주지 않으면 걸지 않는다 — 면을 채운 그림에만 쓴다. */
  edge?: Partial<CrayonEdgeParams>
}

/** 크레파스 획 하나 = 0~1 정규화 경로 + 그 획만의 씨앗(획마다 달라야 서로 다른 손놀림처럼 보인다). */
export interface CrayonStroke {
  points: readonly CrayonPoint[]
  seed: number
  /** 이 획만의 색. 없으면 그림이 공유하는 색을 쓴다 — 단색 그림은 적지 않아도 된다. */
  color?: string
}

/** 크레파스 그림 = 여러 획. 에셋 한 단위다(크기·해상도와 무관한 정규화 좌표). */
export type CrayonDrawing = readonly CrayonStroke[]
