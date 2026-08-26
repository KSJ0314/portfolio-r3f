/** 첫 장에 싣는 글과 링크. 프로젝트마다 이것만 다르고 배치는 같다. */
export interface IntroPageProps {
  /** 페이지 세로(가로 1 기준). 판에서 받은 값을 그대로 넘긴다. */
  height: number
  /** 프로젝트 이름. 제목 자리에 손글씨로 적는다. */
  title: string
  /** 제목 오른쪽에 붙는 한 줄. 기간과 팀 규모를 함께 적는다. */
  period: string
  /** 제목 아래 한 줄 소개. */
  tagline: string
  /** 요약. 문단을 나눌 때는 빈 줄을 넣는다. */
  summary: string
  /** 성과. 줄마다 하나씩 점을 찍어 쌓는다. */
  achievements: readonly string[]
  /**
   * 성과 첫 줄 앞에 붙일 아이콘. 주지 않으면 첫 줄도 점만 찍힌다 —
   * 수상이 없는 프로젝트가 있다.
   */
  firstIcon?: string
  /** 우상단 링크. 주지 않은 것은 두지 않는다. */
  links?: readonly { icon: string; url: string }[]
}
