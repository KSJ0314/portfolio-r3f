/**
 * 배치(가로 1 기준 정규화). 전부 비율이라 칸 크기나 방 배율이 바뀌어도 구도가 유지된다.
 *
 * **자리는 값으로 두지 않는다.** 위에서부터 앞 요소를 재서 그 아래 간격만큼 띄워 다음을 놓으므로,
 * 글자 크기를 바꿔도 뒤따르는 것이 함께 밀린다. 여기 있는 것은 크기와 **간격**뿐이다.
 */
export const INTRO_PAGE_LAYOUT = {
  /** 판 테두리에서 내용까지 들이는 여백. */
  padX: 0.06,
  padY: 0.055,
  /** 제목. */
  titleSize: 0.05,
  /** 제목과 한 줄 소개 사이. */
  titleGap: 0.04,
  /** 한 줄 소개. */
  taglineSize: 0.019,
  /** 한 줄 소개와 요약 사이. */
  taglineGap: 0.02,
  /** 요약. */
  summarySize: 0.015,
  summaryLineHeight: 1.4,
  /** 요약 왼쪽 인용 막대의 폭과 막대에서 글까지의 거리. */
  quoteWidth: 0.004,
  quoteGap: 0.022,
  /** 요약과 성과 사이. */
  summaryGap: 0.04,
  /** 줄 앞 점의 반지름과 점에서 글까지의 거리. */
  bulletRadius: 0.0025,
  bulletGap: 0.014,
  /** 첫 줄 앞 트로피와 글까지의 거리. */
  trophySize: 0.015,
  trophyGap: 0.01,
  /** 성과 목록. */
  achievementSize: 0.014,
  /** 성과 목록의 줄 사이. */
  achievementGap: 0.009,
  /** 기간·팀. 제목 오른쪽에 둔다. */
  periodSize: 0.014,
  /** 제목 오른쪽 끝에서 기간까지. */
  periodGap: 0.02,
  /** 링크 아이콘 크기와 아이콘 사이 간격. */
  iconSize: 0.034,
  iconGap: 0.048,
}

/** 본문 잉크. 페이지 바탕이 밝아 진회색으로 둔다. */
export const INTRO_PAGE_INK = '#3a3a3a'

/** 기간처럼 곁들이는 값. 본문보다 물러나 있다. */
export const INTRO_PAGE_SUB_INK = '#8a8a8a'
