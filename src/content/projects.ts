/**
 * 프로젝트마다 싣는 글과 링크.
 *
 * Firestore가 아니라 여기에 직접 쓴다 — 줄바꿈·문단까지 화면에 맞춰야 해서 컬렉션 필드로 두면 비용이 크다.
 * 키는 Firestore `projects`의 `key`이고, 전시 칸 첫 장과 이력서가 같은 값을 읽는다.
 */
export interface ProjectContent {
  /** 프로젝트 이름. */
  title: string
  /** 기간과 팀 규모를 함께 적는 한 줄. */
  period: string
  /** 한 줄 소개. */
  tagline: string
  /** 요약. 문단을 나눌 때는 빈 줄을 넣는다. */
  summary: string
  /** 성과. 줄마다 하나씩 쌓는다. */
  achievements: readonly string[]
  /** 여는 링크. 주소가 없으면 그 링크는 두지 않는다. */
  links: { github?: string; notion?: string }
  /**
   * 성과 첫 줄이 수상인지.
   * 아이콘 경로가 아니라 사실만 두어, 그것을 어떻게 표시할지는 화면이 정한다.
   */
  awarded?: boolean
}

export const PROJECT_CONTENTS: Record<number, ProjectContent> = {
  0: {
    title: 'AIEMS',
    period: '2025.10 ~ 2025.12 · 6인 팀',
    tagline: 'AI를 활용한 응급환자 이송 관제 시스템',
    summary: `AI EMS는 응급환자 이송 과정에서 병원 선정에 소요되는 시간을 단축하여 환자의 골든타임을 확보하는 차세대 응급 이송 관제 시스템입니다.

구급대원이 여러 병원에 개별적으로 전화하는 비효율적인 방식을 디지털 플랫폼 기반의 통합 관제 시스템으로 전환하여,\n구급차와 복수 병원 간 실시간 동시 커뮤니케이션을 가능하게 합니다.`,
    achievements: [
      'SSAFY 13기 최종 프로젝트 전국 1등',
      'OnDevice STT 구현',
      'Kotlin 앱 개발 — Jetpack Compose, MaterialTheme를 적용한 UI 구현',
      'FSD+Atomic 디자인 패턴을 적용한 프론트엔드 아키텍쳐 설계',
      'React 프로젝트에 Storybook을 도입해 협업 환경 구성',
      '본선(라이브) / 결선(현장) 발표',
    ],
    links: {
      github: 'https://github.com/SSAFY-13th-2nd-semester-final',
      notion: 'https://app.notion.com/p/AIEMS-2b7a5c7aa2bb8042bf5bea942778550e',
    },
    awarded: true,
  },

  1: {
    title: 'NEWSPeaking',
    period: '2025.08 ~ 2025.10 · 6인 팀',
    tagline: '최신 뉴스 빅데이터를 활용한 영어 프리토킹 플랫폼',
    summary: `대부분의 영어 회화 연습 플랫폼은 사용자의 발화에서 구체적으로 어떤 부분의 발음이 잘못되었는지 명확한 피드백을 제공하지 못합니다.

본 프로젝트는 사용자의 발음을 음소 단위로 분석하여,\n잘못된 발음을 정확히 짚어주고 교정 방향을 제시하는 세밀한 피드백을 제공합니다.`,
    achievements: [
      'SSAFY 13기 특화 프로젝트 우수상',
      'Kafka + Apache Spark 기반 빅데이터 파이프라인 설계 및 구현',
      'Spring Security · JWT · Redis를 적용한 인증/인가 구현',
      'ApexCharts를 활용한 학습 통계 대시보드 구현',
      '자막을 눌러 해당 구간을 반복 재생하는 쉐도잉 페이지 구현',
    ],
    links: {
      github: 'https://github.com/SSAFY-13th-2nd-semester-specialization',
      notion: 'https://app.notion.com/p/NEWSPeaking-2c2a5c7aa2bb807abfe8fbf683923513',
    },
    awarded: true,
  },

  2: {
    title: '캐릭캐릭스터디',
    period: '2025.07 ~ 2025.08 · 6인 팀',
    tagline: '게이미피케이션을 접목한 스터디 애플리케이션',
    summary: `AI 집중도 분석과 3D 캐릭터를 통해 객관적이고 재미있는 학습 경험을 제공하며
게이미피케이션 요소로 지속적인 학습 동기를 부여하는 서비스입니다.`,
    achievements: [
      'React Native · Expo 기반 앱 프론트엔드 전담',
      'Atomic 디자인 패턴을 적용한 프론트엔드 컴포넌트 구조 설계',
      'React Navigation 기반 화면 라우팅과 Zustand 상태 관리 설계',
      'Figma를 활용한 화면 설계·디자인 시스템 제작',
    ],
    links: {
      github: 'https://github.com/SSAFY-S13P11C201',
      notion: 'https://app.notion.com/p/39fa5c7aa2bb80a8a767cd6c8dced2b7',
    },
  },

  3: {
    title: 'SSAFY COFFEE',
    period: '2026.04 ~ 2026.06 · 개인 프로젝트',
    tagline: 'SSAFY 광주캠퍼스 메가커피 단체 주문 관리 서비스',
    summary: `SSAFY 코치로 근무하며, 교육생들이 구글폼으로 커피를 주문하던 방식이 불편해 보여 만든 서비스입니다.
기존에는 한 잔마다 폼을 제출해야 했고, 픽업 담당은 제출 명단을 엑셀에 옮겨 직접 돌려 뽑는 불편함이 있었습니다.

여러 잔을 장바구니에 담아 한 번에 주문하고, 마감과 픽업 추첨은 정해진 시각에 자동으로 돌아갑니다.`,
    achievements: [
      '구글폼 기반 주문을 대체 — 여러 잔 주문과 픽업 추첨을 한 곳에서 처리',
      'SSAFY 광주캠퍼스 교육생 대상 실서비스 운영 — 하루 평균 18잔 주문, 두 달 간 누적 방문 4.5천 회',
      'Electron 트레이 앱으로 웹과 데스크탑 동시 제공',
      '다음 기수가 포크해 쓸 수 있도록 오픈소스화 — 설정 분리, 위키 7문서, 비상업 라이선스 적용',
    ],
    links: {
      github: 'https://github.com/KSJ0314/SSAFY_COFFY',
      notion: 'https://app.notion.com/p/SSAFY-COFFEE-3c8a5c7aa2bb8008acf6f205d923ba05',
    },
  },
}
