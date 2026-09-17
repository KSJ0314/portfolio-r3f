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
export const SHEET_WIDTH = 1000

/** 화면에서 한 장 안쪽에 두는 여백(px). 폭이 고정이라 이 값도 고정이다. */
export const SHEET_PADDING = Math.round(SHEET_WIDTH * SHEET_PADDING_RATIO)

/**
 * 화면 너비 구간별 페이지 배율. 레이아웃은 `SHEET_WIDTH` 기준으로 유지하고 표시 크기만 조정한다.
 * 줄바꿈과 페이지 분할 결과는 화면 너비와 무관하게 동일하며, 인쇄에는 적용하지 않는다.
 * 각 구간의 최소 너비에서 좌우 여백 32px과 스크롤바(약 17px)를 제외해도 가로 스크롤이 생기지 않는다.
 *
 * | 화면 너비      | 대표 기기            | 배율 | 보이는 너비    |
 * |----------------|----------------------|------|----------------|
 * | 2560px 이상    | QHD·4K 모니터        | 1.6  | 1600px         |
 * | 1920 ~ 2559px  | FHD 모니터           | 1.3  | 1300px         |
 * | 1440 ~ 1919px  | 큰 노트북            | 1.1  | 1100px         |
 * | 1280 ~ 1439px  | 일반 노트북          | 1    | 1000px         |
 * | 1080 ~ 1279px  | 작은 노트북·창 줄임  | 0.9  | 900px          |
 * | 880 ~ 1079px   | 태블릿 가로          | 0.8  | 800px          |
 * | 680 ~ 879px    | 태블릿 세로          | 0.6  | 600px          |
 * | 480 ~ 679px    | 큰 휴대폰 가로       | 0.42 | 420px          |
 * | 480px 미만     | 휴대폰 세로          | 0.32 | 320px          |
 */
export const SHEET_SCREEN_SCALES = [
  { minWidth: 0, scale: 0.32 },
  { minWidth: 480, scale: 0.42 },
  { minWidth: 680, scale: 0.6 },
  { minWidth: 880, scale: 0.8 },
  { minWidth: 1080, scale: 0.9 },
  { minWidth: 1280, scale: 1 },
  { minWidth: 1440, scale: 1.1 },
  { minWidth: 1920, scale: 1.3 },
  { minWidth: 2560, scale: 1.6 },
] as const

/**
 * 블록 위에 두는 여백(px). 페이지를 나눌 때 이 값이 높이에 포함되도록 `padding`으로 준다.
 * 새 영역이 시작될 때는 `BLOCK_GAP`, 같은 영역의 항목이 이어질 때는 `ITEM_GAP`이다.
 */
export const BLOCK_GAP = 34
export const ITEM_GAP = 16
