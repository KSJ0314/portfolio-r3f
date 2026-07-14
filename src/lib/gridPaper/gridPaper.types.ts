/**
 * 모눈종이 텍스처의 생성 파라미터.
 *
 * 형태 값(굵기·떨림·주기)은 전부 **칸 크기에 대한 비율**이다. 픽셀 값을 직접 담지 않는다.
 * 그래야 칸 수(`cells`)만 바꿔도 선 굵기·떨림이 칸과 함께 커지고 줄어 모양이 유지된다.
 */
export interface GridPaperParams {
  /** 타일 하나에 들어가는 칸 수. 바닥에서 타일이 덮는 크기가 정해져 있으므로 이 값이 칸 크기를 정한다. */
  cells: number

  /** 종이 바탕색. */
  paperColor: string
  /** 모눈 선 색. */
  lineColor: string

  /** 선 굵기 — 칸의 몇 배인지. */
  lineWidthRatio: number
  /** 선 가장자리가 번지는 정도(0~1+). 0이면 인쇄된 듯 또렷하고, 키우면 연필처럼 뭉뚱그려진다. */
  lineSoftness: number

  /** 선이 좌우로 흔들리는 폭 — 칸의 몇 배인지. 손으로 그은 선의 떨림. */
  wobbleRatio: number
  /** 떨림이 칸 하나를 지나는 동안 몇 번 굽이치는지. 완만한 굽이부터 잔떨림까지 겹쳐 쌓는다. */
  wobbleCyclesPerCell: number[]

  /** 가장 진하게 그어진 구간의 진하기(0~1). 1이면 선 색이 그대로 나온다. */
  lineOpacityMax: number
  /** 선의 진하기가 구간마다 변하는 정도(0~1). 손이 뜨거나 눌린 자국. */
  opacityVariance: number
  /** 선 굵기가 구간마다 변하는 정도(0~1). 필압. 굵기는 곧 진하기로 읽힌다. */
  pressureVariance: number

  /** 종이 결의 세기(0~1). 종이 자체의 성질이라 칸 크기와 무관하다. */
  grainStrength: number
}

/** 텍스처를 몇 픽셀로, 얼마나 크게 그렸다가 줄일지. */
export interface GridPaperRenderOptions {
  /** 결과 텍스처 해상도(정사각). */
  size: number
  /** 렌더 배율. 크게 그린 뒤 줄여 선 가장자리의 계단을 없앤다(수퍼샘플링). */
  supersample: number
}
