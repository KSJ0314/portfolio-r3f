import { CAREER_COLUMN_COUNT } from '../AboutCareer.constants'

/** 바닥과 겹쳐 깜빡이지 않도록 띄운다. 칸 제목과 같은 층이다. */
export const CAREER_CONTENT_Y = 0.05

/** 구분선을 세울 자리 — 칸과 칸이 맞닿는 경계의 칸 인덱스이고, 칸 수보다 하나 적다. */
export const CAREER_COLUMN_BOUNDARIES = Array.from(
  { length: CAREER_COLUMN_COUNT - 1 },
  (_, index) => index + 1,
)

/** 칸을 가르는 세로선 기본값. 눈으로 맞추는 값이라 HUD로 조절한다. */
export const CAREER_DIVIDER = {
  /** 선의 폭. */
  width: 0.02,
  /** 영역 위 테두리에서 선이 시작하는 곳까지의 거리. */
  top: 1,
  /** 영역 아래 테두리에서 선이 끝나는 곳까지의 거리. */
  bottom: 2,
}

/** 목록 배치 기본값. 눈으로 맞추는 값이라 HUD로 조절한다. */
export const CAREER_LIST_LAYOUT = {
  /** 영역 위 테두리에서 목록이 시작하는 곳까지의 거리(로고 줄 아래). */
  top: 1.7,
  /**
   * 칸 좌우 여백. 양 끝 칸의 것은 영역 여백을 겸하고, 오른쪽 여백에 나가기 아이콘이 들어앉는다.
   * 아이콘 폭보다 좁으면 자격증 글이 아이콘 밑으로 들어간다.
   */
  paddingX: 0.5,
  /** 항목 사이 세로 간격. */
  itemGap: 0.5,
  /** 항목 제목 글자 크기. 글씨체는 본문과 같고 크기로만 구분한다. */
  titleSize: 0.3,
  /** 제목과 그 아래 첫 줄 사이 간격. */
  titleGap: 0.25,
  /** 본문과 그 아래 줄 사이 간격. */
  lineGap: 0.1,
  /** 본문 글자 크기. */
  bodySize: 0.18,
  /** 본문 줄 간격(글자 크기 배수). */
  bodyLineHeight: 1.6,
  /** 본문 왼쪽 인용 막대의 폭. */
  quoteBarWidth: 0.03,
  /** 인용 막대와 본문 사이 간격. */
  quoteBarGap: 0.12,
}
