import type { LobbyProject } from './LobbyBook.types'

/**
 * 책 양쪽 페이지에 적는 글.
 *
 * 코드가 아니라 내용이라 따로 둔다. 문구를 고칠 때 그리는 코드를 건드릴 일이 없다.
 */

/** 손글씨로 크게 얹는 제목. */
export const LOBBY_BOOK_TITLE = '프로젝트 전시관'

/** 제목 아래 본문. 한 줄이 한 문단이고, 빈 줄이 문단 사이 여백이 된다. */
export const LOBBY_BOOK_WELCOME = [
  '프로젝트 전시관에 오신 것을 환영합니다.',
  '',
  '이곳은 전시관의 로비이며',
  '안쪽 문을 지나면 전시관으로 이어집니다.',
  '',
  '우측 페이지를 통해 프로젝트 목록을 확인하거나',
  '클릭하여 이동할 수 있습니다.',
  '',
  '전시관의 각종 에셋들은 블렌더에',
  '클로드 MCP를 연결하여 제작되었습니다.',
]

/** 오른쪽 페이지에 적는 프로젝트 목록. 적은 순서대로 그린다. */
export const LOBBY_BOOK_PROJECTS: readonly LobbyProject[] = [
  {
    key: 0,
    title: 'AIEMS',
    summary:
    `Kotlin 기반 Android 앱 & React 웹 구현
    FSD와 Atomic을 결합한 아키텍처 설계,
    On-Device STT 구현`
  },
  {
    key: 3,
    title: 'SSAFY COFFEE',
    summary:
    `React 웹 & Electron 데스크탑 앱 구현
    GitHub Pages & Firebase를 이용한 무료 배포 서비스`
  },
  {
    key: 1,
    title: 'NEWSPeaking',
    summary:
    `Kafka · Spark를 활용한 빅데이터 파이프라인 설계
    Spring Security · JWT 인증/인가 구현
    ApexCharts를 활용한 통계 대시보드 웹 구현`
  },
  {
    key: 2,
    title: '캐릭캐릭스터디',
    summary:
    `React Native 기반 앱 구현
    Atomic 디자인패턴을 적용한 컴포넌트 구조 설계`
  }
]