/** 트로피 모델 파일. */
export const TROPHY_URL = '/assets/trophy.glb'

/** 밑동이 자격증 종이보다 위로 오도록 띄운다. */
export const TROPHY_Y = 0.04

/** 바닥 그림자가 종이와 겹쳐 깜빡이지 않도록 살짝 띄운다. */
export const TROPHY_SHADOW_Y = 0.035

/** 그림자를 칠하는 차례 — 밑에 깔린 종이(`EDUCATION_ORDER`)보다 뒤여야 그 위에도 드리운다. */
export const TROPHY_SHADOW_ORDER = 2

/** 그림자 실루엣을 표시해 두는 스텐실 값. 그 자리에만 한 겹 칠한다. */
export const TROPHY_SHADOW_STENCIL_REF = 1

/** 칠할 판의 크기 여유 — 실루엣이 뻗을 수 있는 범위에 곱한다. */
export const TROPHY_SHADOW_FILL_MARGIN = 2

/** 배치·그림자 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const CAREER_TROPHY = {
  /** 모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: 1.5,
  /** 영역 중심 기준 오프셋(월드 x, z). */
  x: 1.7,
  z: -1,
  /** y축 회전(도). 양수가 반시계다. */
  rotation: 60,
  /**
   * 로고가 될 때의 y축 회전(도). 눕히기 전에 먼저 돌아간다.
   * 모델이 축에 맞게 저작돼 있지 않아 0이 곧 정면이 아니므로, 이 값으로 정면을 맞춘다.
   */
  logoTurn: -70,
  /** 로고가 될 때 눕히는 각도(도, x축). 세워 두면 정면뷰에서 위통수만 보인다. */
  logoTilt: -75,
  /** 눕힌 뒤 화면 안에서 도는 각도(도). 음수가 시계방향이다. */
  logoRoll: 2,
  /**
   * 로고로 가는 동안 추가로 도는 **반 바퀴 수**. 음수면 반대로 돈다.
   * 앞뒤가 같은 모델이라 반 바퀴만 돌아도 도착 자세가 같아, 그 단위로 둬야 반 바퀴를 고를 수 있다.
   */
  logoTurns: -1,
  /** 바닥 그림자가 뻗는 방향(도). 0이면 맵 위쪽(-z)으로 눕는다. */
  shadowAngle: 15,
  /** 바닥 그림자의 길이 배수. 1이면 세운 높이 그대로 눕힌 길이다. */
  shadowLength: 1.15,
  /** 바닥 그림자의 진하기(0~1). 신호등 바닥 그림자와 같은 값이다. */
  shadowOpacity: 0.12,
}
