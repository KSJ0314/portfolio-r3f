import type { SkillPage } from './SkillsPages.types'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 제목·공구함과 같은 층이다. */
export const SKILLS_CONTENT_Y = 0.02

/**
 * 페이지 구성 — 쓸 내용이 많아 분류로 나눠 넘겨 본다.
 * Firestore의 `category` 값과 맞아야 하며, 어느 페이지에도 없는 분류는 표시되지 않는다.
 *
 * Frontend는 한 분류가 두 열로 나뉘고, 두 번째 페이지는 분류마다 한 열을 갖는다.
 */
export const SKILL_PAGES: SkillPage[] = [
  { columns: [['Frontend']] },
  { columns: [['Mobile'], ['Backend']] },
]

/** 목록 배치 기본값. 눈으로 맞추는 값이라 HUD로 조절한다. */
export const SKILLS_LIST_LAYOUT = {
  /** 영역 위 테두리에서 목록이 시작하는 곳까지의 거리(제목 아래). */
  top: 1.8,
  /** 좌우 여백. */
  paddingX: 0.5,
  /** 두 열 사이 간격. */
  columnGap: 0.8,
  /** 항목 사이 세로 간격. */
  itemGap: 0.5,
  /** 기술 이름 글자 크기(손글씨). */
  nameSize: 0.45,
  /** 이름과 설명 사이 간격. */
  nameGap: 0.25,
  /** 설명 글자 크기(본문체). */
  bodySize: 0.2,
  /** 설명 줄 간격(글자 크기 배수). */
  bodyLineHeight: 1.6,
}
