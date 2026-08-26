/** 첫 장에 싣는 글. Firestore가 아니라 여기에 직접 쓴다. */
export const INTRO_TEXT = {
  title: 'SSAFY COFFEE',
  /** 제목 오른쪽 한 줄. 기간과 팀 규모를 함께 적는다. */
  period: '2026.04 ~ 2026.06 · 개인 프로젝트',
  tagline: 'SSAFY 광주캠퍼스 메가커피 단체 주문 관리 서비스',
  /** 문단을 나눌 때는 빈 줄을 넣는다. */
  summary: `SSAFY 코치로 근무하며, 교육생들이 구글폼으로 커피를 주문하던 방식이 불편해 보여 만든 서비스입니다.
기존에는 한 잔마다 폼을 제출해야 했고, 픽업 담당은 제출 명단을 엑셀에 옮겨 직접 돌려 뽑는 불편함이 있었습니다.

여러 잔을 장바구니에 담아 한 번에 주문하고, 마감과 픽업 추첨은 정해진 시각에 자동으로 돌아갑니다.`,
  /** 줄마다 하나씩 점을 찍어 쌓는다. */
  achievements: [
    '구글폼 기반 주문을 대체 — 여러 잔 주문과 픽업 추첨을 한 곳에서 처리',
    'SSAFY 광주캠퍼스 교육생 대상 실서비스 운영 — 하루 평균 18잔 주문, 두 달 간 누적 방문 4.5천 회',
    'Electron 트레이 앱으로 웹과 데스크탑 동시 제공',
    '다음 기수가 포크해 쓸 수 있도록 오픈소스화 — 설정 분리, 위키 7문서, 비상업 라이선스 적용',
  ],
}

/** 첫 장에서 여는 링크. 주소가 없으면 그 아이콘은 두지 않는다. */
export const INTRO_LINKS = {
  github: 'https://github.com/KSJ0314/SSAFY_COFFY',
  notion: 'https://app.notion.com/p/SSAFY-COFFEE-3c8a5c7aa2bb8008acf6f205d923ba05',
}

/** 링크·성과에 쓰는 아이콘. */
export const INTRO_ICONS = {
  github: '/images/github.svg',
  notion: '/images/notion.svg',
  trophy: '/images/trophy.svg',
}
