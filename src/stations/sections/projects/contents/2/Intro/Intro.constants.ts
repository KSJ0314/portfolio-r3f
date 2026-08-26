/** 첫 장에 싣는 글. Firestore가 아니라 여기에 직접 쓴다. */
export const INTRO_TEXT = {
  title: '캐릭캐릭스터디',
  /** 제목 오른쪽 한 줄. 기간과 팀 규모를 함께 적는다. */
  period: '2025.07 ~ 2025.08 · 6인 팀',
  tagline: '게이미피케이션을 접목한 스터디 애플리케이션',
  /** 문단을 나눌 때는 빈 줄을 넣는다. */
  summary: `AI 집중도 분석과 3D 캐릭터를 통해 객관적이고 재미있는 학습 경험을 제공하며
게이미피케이션 요소로 지속적인 학습 동기를 부여하는 서비스입니다.`,
  /** 줄마다 하나씩 점을 찍어 쌓는다. */
  achievements: [
    'React Native · Expo 기반 앱 프론트엔드 전담',
    'React Native 앱에 Unity를 얹어 3D 캐릭터 구동',
    'Atomic 디자인 패턴을 적용한 프론트엔드 컴포넌트 구조 설계',
    'Figma를 활용한 화면 설계·디자인 시스템 제작',
  ],
}

/** 첫 장에서 여는 링크. 주소가 없으면 그 아이콘은 두지 않는다. */
export const INTRO_LINKS = {
  github: 'https://github.com/SSAFY-S13P11C201',
  notion: 'https://app.notion.com/p/39fa5c7aa2bb80a8a767cd6c8dced2b7',
}

/** 링크·성과에 쓰는 아이콘. */
export const INTRO_ICONS = {
  github: '/images/github.svg',
  notion: '/images/notion.svg',
  trophy: '/images/trophy.svg',
}
