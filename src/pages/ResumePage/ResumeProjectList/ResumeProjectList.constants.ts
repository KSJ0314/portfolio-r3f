/**
 * 목록에 찍을 프로젝트별 값 — 기간과 세부 내용.
 *
 * 세부 내용은 로비 책의 요약문을 그대로 옮긴 것이다. 같은 글이지만 쓰는 자리가 달라
 * 한쪽을 고칠 때 다른 쪽이 따라 바뀌지 않도록 각자 갖는다.
 * 키는 프로젝트 번호이고, 순서는 Firestore가 정한다.
 */
export const PROJECT_LIST_ENTRIES: Record<
  number,
  { start: string; end: string; team: string; summary: string }
> = {
  0: {
    start: '2025-10',
    end: '2025-12',
    team: '6인 팀',
    summary: `Kotlin 기반 Android 앱 & React 웹 구현
FSD와 Atomic을 결합한 아키텍처 설계, On-Device STT 구현`,
  },

  1: {
    start: '2025-08',
    end: '2025-10',
    team: '6인 팀',
    summary: `Kafka · Spark를 활용한 빅데이터 파이프라인 설계
Spring Security · JWT 인증/인가 구현
ApexCharts를 활용한 통계 대시보드 웹 구현`,
  },

  2: {
    start: '2025-07',
    end: '2025-08',
    team: '6인 팀',
    summary: `React Native 기반 앱 구현
Atomic 디자인패턴을 적용한 컴포넌트 구조 설계`,
  },

  3: {
    start: '2026-04',
    end: '2026-06',
    team: '개인 프로젝트',
    summary: `React 웹 & Electron 데스크탑 앱 구현
GitHub Pages & Firebase를 이용한 무료 배포 서비스`,
  },
}
