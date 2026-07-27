/**
 * 종이 스티커의 테두리·그림자 값.
 *
 * 길이는 전부 **그림 짧은 변 대비 비율**이다. 크기를 바꿔도 테두리 폭·그림자가 함께 따라와
 * 같은 스티커를 확대·축소한 것처럼 보인다.
 */
export interface PaperStickerParams {
  /** 그림 둘레에 남기는 종이 여백(= 오려낸 자국)의 폭. */
  border: number
  /** 종이 색. 바닥 모눈종이와 같은 톤으로 둔다. */
  paperColor: string
  /**
   * 실루엣을 잘라내는 알파 기준(0~1).
   * 연필·크레파스 그림은 가장자리가 흐려서, 이 값보다 옅은 픽셀을 버려야 테두리가 매끈하게 돈다.
   */
  alphaThreshold: number
  /** 그림자 흐림 폭. */
  shadowBlur: number
  /** 그림자가 오른쪽·아래로 밀리는 거리. */
  shadowDistance: number
  /** 그림자 진하기(0~1). */
  shadowOpacity: number
  /** 그림자 색(`#rrggbb`). */
  shadowColor: string
}

/** 구운 결과 — 텍스처가 될 캔버스와 판 크기. */
export interface PaperStickerBake {
  canvas: HTMLCanvasElement
  /** 판 크기(그림 세로 = 1 기준). 테두리·그림자 여백이 포함된 값이다. */
  plane: { width: number; height: number }
}
