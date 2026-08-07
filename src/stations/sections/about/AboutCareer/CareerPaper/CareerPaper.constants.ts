import type { PaperStickerParams } from '../../../../../lib/PaperSticker'

/** 교육 과정·자격증 그림. 배경이 투명한 PNG라 그 모양대로 오려진다. */
export const EDUCATION_URL = '/images/education.png'
export const SPEC_URL = '/images/spec.png'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. */
export const SPEC_Y = 0.02
export const EDUCATION_Y = 0.03

/**
 * 겹칠 때의 앞뒤 순서 — 큰 쪽이 위다.
 * 종이끼리는 깊이를 쓰지 않아 그냥 두면 **카메라에 가까운 것**(z가 아래인 쪽)이 나중에 그려져 위로 온다.
 * 놓는 자리와 무관하게 순서를 지키려면 이 값으로 못 박아야 한다.
 */
export const SPEC_ORDER = 0
export const EDUCATION_ORDER = 1

/** 두 종이 모두 판 안에 인쇄되는 그림자는 쓰지 않는다 — 그림자는 세워 둔 트로피만 갖는다. */
export const CAREER_PAPER_PARAMS: Partial<PaperStickerParams> = { shadowOpacity: 0 }

/** 교육 종이의 배치·모양 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const CAREER_EDUCATION = {
  /** 그림 세로의 월드 크기(여백 제외). 가로는 그림의 실제 비율에서 나온다. */
  height: 1.7,
  /** 영역 중심 기준 오프셋(월드 x, z). */
  x: -1.7,
  z: -1.7,
  /** 눕힌 종이의 회전(도). 양수가 반시계다. */
  rotation: 27,
  /** 종이 테두리 폭 — 그림 짧은 변 대비 비율. */
  border: 0.025,
}

/** 자격증 종이의 배치·모양 기본값. 교육 종이 밑으로 깔린다. */
export const CAREER_SPEC = {
  height: 2.1,
  x: 0,
  z: -0.5,
  rotation: -6,
  border: 0.025,
}
