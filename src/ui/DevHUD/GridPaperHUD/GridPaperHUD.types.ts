/** leva는 평평한 값만 다루므로, 떨림 주기 배열을 슬라이더 네 개로 펼쳐서 주고받는다. */
export interface FlatParams {
  cells: number
  paperColor: string
  lineColor: string
  lineWidthRatio: number
  lineSoftness: number
  lineOpacityMax: number
  wobbleRatio: number
  wobble0: number
  wobble1: number
  wobble2: number
  wobble3: number
  opacityVariance: number
  pressureVariance: number
  grainStrength: number
}
