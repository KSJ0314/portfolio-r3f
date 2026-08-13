export interface ClickMarkerProps {
  /** 보일지. 꺼지면 페이드로 걷힌다(누르는 순간 사라지는 것이 아니라). */
  visible: boolean
  /** 원뿔 끝이 놓일 높이(월드 y). 흔들림은 이 높이를 기준으로 오르내린다. */
  y: number
  /** 원뿔 높이(월드 단위). 밑면 반지름은 여기서 비율로 나온다. */
  size: number
  /** 위아래로 흔들리는 폭(월드 단위). */
  bob: number
  /** 한 번 오르내리는 데 걸리는 시간(초). */
  bobSeconds: number
  /** 한 바퀴 도는 데 걸리는 시간(초). 0이면 돌지 않는다. */
  spinSeconds: number
  /** 나타나고 사라지는 데 걸리는 시간(초). */
  fadeSeconds: number
}
