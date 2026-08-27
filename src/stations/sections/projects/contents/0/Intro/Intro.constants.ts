/** 첫 장에 싣는 글. Firestore가 아니라 여기에 직접 쓴다. */
export const INTRO_TEXT = {
  title: 'AIEMS',
  tagline: 'AI를 활용한 응급환자 이송 관제 시스템',
  summary: `AI EMS는 응급환자 이송 과정에서 병원 선정에 소요되는 시간을 단축하여 환자의 골든타임을 확보하는 차세대 응급 이송 관제 시스템입니다.

구급대원이 여러 병원에 개별적으로 전화하는 비효율적인 방식을 디지털 플랫폼 기반의 통합 관제 시스템으로 전환하여,\n구급차와 복수 병원 간 실시간 동시 커뮤니케이션을 가능하게 합니다.`,
  period: '2025.10 ~ 2025.12 · 6인 팀',
  /** 줄마다 하나씩 쌓는다. 첫 줄 앞에만 트로피가 붙는다. */
  achievements: [
    'SSAFY 13기 최종 프로젝트 전국 1등',
    'OnDevice STT 구현',
    'Kotlin 앱 개발 — Jetpack Compose, MaterialTheme를 적용한 UI 구현',
    'FSD+Atomic 디자인 패턴을 적용한 프론트엔드 아키텍쳐 설계',
    'React 프로젝트에 Storybook을 도입해 협업 환경 구성',
    '본선(라이브) / 결선(현장) 발표',
  ],
}

/** 첫 장에서 여는 링크. */
export const INTRO_LINKS = {
  github: 'https://github.com/SSAFY-13th-2nd-semester-final',
  notion: 'https://app.notion.com/p/AIEMS-2b7a5c7aa2bb8042bf5bea942778550e',
}

/** 링크·성과에 쓰는 아이콘. */
export const INTRO_ICONS = {
  github: '/images/github.svg',
  notion: '/images/notion.svg',
  trophy: '/images/trophy.svg',
}
