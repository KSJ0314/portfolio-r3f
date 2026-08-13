/** 안내 색 — 길안내 화살표·나가기 화살표와 같은 하늘색 크레파스 색이다. */
export const CLICK_MARKER_COLOR = '#55bcf0'

/** 밑면 반지름 대 높이 비. 너무 뾰족하면 위에서 내려다볼 때 점처럼 보인다. */
export const CLICK_MARKER_RADIUS_RATIO = 0.45

/** 옆면 분할 수. 적게 둬 각이 남아야 도는 것이 눈에 들어온다. */
export const CLICK_MARKER_SEGMENTS = 8

/**
 * 자리와 움직임의 기본값. 누를 수 있다는 표시는 어디에 붙어도 같은 인상이어야 한다.
 * 대상이 유난히 높으면 쓰는 쪽이 `y`만 따로 준다.
 */
export const CLICK_MARKER_MOTION = {
  /** 원뿔 끝이 놓일 높이(월드 y). 바닥에 눕은 그림 위에 뜨는 높이다. */
  y: 1.2,
  /** 원뿔 높이(월드 단위). */
  size: 0.5,
  /** 위아래로 흔들리는 폭. */
  bob: 0.15,
  /** 한 번 오르내리는 데 걸리는 시간(초). */
  bobSeconds: 1.6,
  /** 한 바퀴 도는 데 걸리는 시간(초). */
  spinSeconds: 3,
  /** 나타나고 사라지는 데 걸리는 시간(초). */
  fadeSeconds: 0.4,
}
