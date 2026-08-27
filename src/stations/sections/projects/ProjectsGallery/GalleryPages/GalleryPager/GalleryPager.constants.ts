/**
 * 넘김 UI 배치(가로 1 기준 정규화). 눈으로 맞추는 값이라 개발용 HUD로 조절한다.
 *
 * 점은 하단 가운데, 꺾쇠는 좌우 끝·세로 가운데다.
 */
export const GALLERY_PAGER = {
  /** 점 반지름. */
  dotRadius: 0.006,
  /** 점 사이 간격(중심에서 중심). */
  dotGap: 0.026,
  /** 점을 아래 끝에서 올리는 거리. */
  dotBottom: 0.022,
  /** 꺾쇠 전체 세로(위 선 끝에서 아래 선 끝까지). */
  arrowSize: 0.03,
  /** 꺾쇠를 좌우 끝에서 들이는 거리. */
  arrowInset: 0.018,
}

/** 지금 보고 있는 장을 가리키는 점과 꺾쇠. */
export const GALLERY_PAGER_INK = '#3a3a3a'

/** 나머지 점. 곁들이는 표시라 물러나 있다. */
export const GALLERY_PAGER_DIM = '#c4c0b8'

/**
 * 누르는 판을 그림보다 넉넉히 잡는 배수.
 * 점도 꺾쇠도 작아 그림 그대로를 누르게 두면 잘 눌리지 않는다.
 */
export const GALLERY_PAGER_HIT_SCALE = 2.2

/**
 * 꺾쇠 아이콘. 오른쪽을 가리키는 그림이라 왼쪽 꺾쇠는 반 바퀴 돌려 쓴다.
 * 끝과 꼭짓점이 둥근 것도, 선 굵기와 색도 이 파일이 갖는다.
 */
export const GALLERY_PAGER_ICON = '/images/chevron.svg'
