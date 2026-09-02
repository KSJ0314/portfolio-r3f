/** 연락처 줄에 붙는 아이콘. 색은 본문 잉크색에 맞춰 두었다. */
export const CONTACT_ICONS = {
  phone: '/images/phone.svg',
  mail: '/images/mail.svg',
  github: '/images/github.svg',
}

/** 아이콘과 글씨를 종이에서 띄우는 높이. 겹쳐 깜빡이지 않을 만큼만 올린다. */
export const CONTACT_ICON_LIFT = 0.001
export const CONTACT_HIT_LIFT = 0.002

/** 누르는 판의 세로 크기(줄 높이 대비 배수). 글씨보다 넉넉해야 정확히 겨냥하지 않아도 눌린다. */
export const CONTACT_HIT_HEIGHT = 1.4

/** 복사한 뒤 안내 문구를 띄워 두는 시간(ms). */
export const CONTACT_COPIED_MS = 800

/** 복사했을 때 그 줄에 대신 띄우는 문구. */
export const CONTACT_COPIED_TEXT = '복사했습니다'

/** GitHub 링크를 찾는 기준. `links`에서 이 주소를 가진 항목을 연락처 줄에 쓴다. */
export const GITHUB_HOST = 'github.com'
