import { CLICK_MARKER_MOTION } from '../../ClickMarker/ClickMarker.constants'

/** 자동차 모델 파일. 출처 표기(`content/credits.ts`)가 이 값을 가져다 쓴다. */
export const PROJECTS_CAR_URL = '/assets/car.glb'

/** 이 장식이 등장 조건으로 보는 스테이션 — 여기를 열었다 닫은 뒤에 나타난다. */
export const PROJECTS_CAR_AFTER_STATION = 'about-career'

/**
 * 차가 향하는 방향(도). 모델 앞머리가 +z라 y로 -90° 돌리면 월드 -x를 본다.
 * 정면뷰는 화면 위가 월드 -z이므로 -x가 곧 화면 왼쪽이다.
 */
export const PROJECTS_CAR_HEADING = -90

/** 차 앞에 서서 차 쪽으로 도는 시간(초). 곧바로 감추면 도는 것이 보이지 않는다. */
export const PROJECTS_CAR_BOARD_TURN = 0.35

/**
 * 배치·연출 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다.
 * 등장·도착 자리는 확정된 값이고 나머지는 시작 추정값이다.
 */
export const PROJECTS_CAR_PLACEMENT = {
  /** 차 길이(앞뒤)의 월드 크기. 가로·높이는 모델 비율에서 나온다. */
  length: 3.5,
  /** 등장 자리(월드 x, z). */
  startX: 11.5,
  startZ: 23,
  /** 도착 자리(월드 x, z). */
  endX: -16.5,
  endZ: 23,
  /** 차 중심에서 캐릭터가 타려고 서는 자리까지(월드 x, z). */
  boardX: 0,
  boardZ: 1.2,
  /** 주행 속도(유닛/초). 캐릭터 걸음(4)보다 빨라야 차답다. */
  speed: 12,
  /** 등장·퇴장 페이드 시간(초). */
  fadeSeconds: 0.6,
  /** 탑승할 때 눌리는 깊이(월드 단위)와 눌렸다 펴지는 데 걸리는 시간(초). */
  bounce: 0.2,
  bounceSeconds: 0.5,
  /** 다 펴진 뒤 출발까지 쉬는 시간(초). 곧장 떠나면 올라오는 것이 눈에 안 들어온다. */
  boardPause: 0.1,
  /** 누르라는 표시(원뿔)의 끝이 놓일 높이(월드 y). 차는 지붕이 높아 기본값보다 위로 올린다. */
  markerY: 2,
  /** 원뿔 높이. */
  markerSize: CLICK_MARKER_MOTION.size,
  /** 표시가 위아래로 흔들리는 폭과 한 번 오르내리는 시간(초). */
  markerBob: CLICK_MARKER_MOTION.bob,
  markerBobSeconds: CLICK_MARKER_MOTION.bobSeconds,
  /** 표시가 한 바퀴 도는 데 걸리는 시간(초). 0이면 돌지 않는다. */
  markerSpinSeconds: CLICK_MARKER_MOTION.spinSeconds,
  /**
   * 바퀴 굴림 배수. 1이면 굴러간 거리 그대로다(음수면 반대 방향).
   *
   * 그대로 두면 오히려 뒤로 도는 것처럼 보인다 — 바퀴가 **30° 간격 12각형**이라
   * 한 프레임에 그만큼 가까이 돌면 제자리이거나 조금 뒤로 간 모습과 구분되지 않는다.
   * 프레임당 회전이 그 주기의 절반 아래로 오게 낮춰 둔다.
   */
  wheelSpin: 0.3,
}
