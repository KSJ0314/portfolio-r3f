/**
 * A4 실치수(mm). 화면에서는 이 비율로만 쓰고, 인쇄할 때는 이 값이 곧 한 장의 크기다.
 */
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

/**
 * 한 장 안쪽 여백. 종이 폭에 대한 비율이라 화면과 인쇄에서 같은 인상으로 나온다.
 * 인쇄 여백을 겸하므로 프린터가 잘라내는 가장자리보다 넉넉하게 둔다.
 */
export const SHEET_PADDING_RATIO = 0.08

/** 화면에서 한 장이 갖는 폭(px). 창 크기와 무관하게 고정이라 여백·글자 비율이 늘 같다. */
export const SHEET_WIDTH = 800

/** 화면에서 한 장 안쪽에 두는 여백(px). 폭이 고정이라 이 값도 고정이다. */
export const SHEET_PADDING = Math.round(SHEET_WIDTH * SHEET_PADDING_RATIO)

/** 인쇄에서 한 장 안쪽에 두는 여백(mm). 화면과 같은 비율이다. */
export const SHEET_PADDING_MM = Math.round(A4_WIDTH_MM * SHEET_PADDING_RATIO * 10) / 10

/**
 * 블록 위에 두는 여백(px). 페이지를 나눌 때 이 값이 높이에 포함되도록 `padding`으로 준다.
 * 새 영역이 시작될 때는 `BLOCK_GAP`, 같은 영역의 항목이 이어질 때는 `ITEM_GAP`이다.
 */
export const BLOCK_GAP = 26
export const ITEM_GAP = 10

/** 사진. 세로만 정하고 가로는 원본 비율을 따라간다. */
export const PHOTO_HEIGHT = 200
export const PHOTO_URL = '/images/profile2.jpg'

/** 연락처 줄 앞에 붙는 아이콘. 포트폴리오 Intro가 쓰는 것과 같은 파일이다. */
export const CONTACT_ICON = {
  email: '/images/mail.svg',
  phone: '/images/phone.svg',
  link: '/images/github.svg',
} as const
