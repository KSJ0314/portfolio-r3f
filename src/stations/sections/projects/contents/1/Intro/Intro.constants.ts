/** 첫 장에 싣는 글. Firestore가 아니라 여기에 직접 쓴다. */
export const INTRO_TEXT = {
  title: 'NEWSPeaking',
  /** 제목 오른쪽 한 줄. 기간과 팀 규모를 함께 적는다. */
  period: '2025.08 ~ 2025.10 · 6인 팀',
  tagline: '최신 뉴스 빅데이터를 활용한 영어 프리토킹 플랫폼',
  /** 문단을 나눌 때는 빈 줄을 넣는다. */
  summary: `대부분의 영어 회화 연습 플랫폼은 사용자의 발화에서 구체적으로 어떤 부분의 발음이 잘못되었는지 명확한 피드백을 제공하지 못합니다.

본 프로젝트는 사용자의 발음을 음소 단위로 분석하여,\n잘못된 발음을 정확히 짚어주고 교정 방향을 제시하는 세밀한 피드백을 제공합니다.`,
  /** 줄마다 하나씩 점을 찍어 쌓는다. */
  achievements: [
    'SSAFY 13기 특화 프로젝트 우수상',
    'Kafka + Apache Spark 기반 빅데이터 파이프라인 설계 및 구현',
    'Spring Security · JWT · Redis를 적용한 인증/인가 구현',
    'ApexCharts를 활용한 학습 통계 대시보드 구현',
    '자막을 눌러 해당 구간을 반복 재생하는 쉐도잉 페이지 구현',
  ],
}

/** 첫 장에서 여는 링크. 주소가 없으면 그 아이콘은 두지 않는다. */
export const INTRO_LINKS = {
  github: 'https://github.com/SSAFY-13th-2nd-semester-specialization',
  notion: 'https://app.notion.com/p/NEWSPeaking-2c2a5c7aa2bb807abfe8fbf683923513',
}

/** 링크·성과에 쓰는 아이콘. */
export const INTRO_ICONS = {
  github: '/images/github.svg',
  notion: '/images/notion.svg',
  trophy: '/images/trophy.svg',
}
