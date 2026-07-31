import type { PaperStickerParams } from '../../../../../../../lib/PaperSticker'

/** 레벨 별 그림. 크레파스로 그려 배경이 투명한 PNG로 뽑은 것이다. */
export const SKILLS_LEVEL_URL = '/images/skills_level.png'

/**
 * 실루엣을 잘라내는 알파 기준값.
 * 크레파스는 반투명 알갱이라 기준값이 높으면 실루엣이 조각나므로 공구함보다 낮게 둔다.
 */
export const SKILLS_LEVEL_ALPHA: Partial<PaperStickerParams> = {
  alphaThreshold: 0.15,
}

/** 배치·모양 기본값. 눈으로 맞추는 값이라 HUD로 조절한다. */
export const SKILLS_LEVEL = {
  /** 별 하나의 세로 크기. */
  size: 0.3,
  /** 이름과 첫 별 사이 간격. */
  gap: 0.15,
  /** 별 사이 간격. */
  starGap: 0.02,
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: -0.08,
  /** 종이 테두리 폭 — 그림 짧은 변 대비 비율. */
  border: 0.05,
  /** 그림자 흐림 폭(같은 비율 기준). */
  shadowBlur: 0.03,
  /** 그림자가 오른쪽·아래로 밀리는 거리(같은 비율 기준). */
  shadowDistance: 0,
  /** 그림자 진하기. */
  shadowOpacity: 0.5,
}
