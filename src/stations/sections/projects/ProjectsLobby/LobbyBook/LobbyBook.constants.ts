import type { LobbyPageMargin } from './LobbyBook.types'

/** 연단 위 책 트리거. 이름을 여기 두어 쓰는 쪽이 문자열을 박지 않게 한다. */
export const LOBBY_BOOK_TRIGGER = 'Trigger_Book'

/**
 * 책 페이지 재질. 이 재질을 쓰는 메시의 **글 쓰는 면에만** 글씨 텍스처가 얹힌다.
 * 좌우 페이지가 이 재질 하나를 함께 쓴다.
 */
export const LOBBY_PAGE_MATERIAL = 'M_BookPage'

/**
 * 좌우 페이지 메시. 재질은 하나를 공유하므로 **메시 이름으로 갈라** 각자 다른 글을 얹는다.
 * 재질 복제는 메시마다 일어나므로 이름만 갈라 주면 서로 물들지 않는다.
 */
export const LOBBY_PAGE_MESHES = { left: 'Book_Page_L', right: 'Book_Page_R' }

/**
 * 페이지마다 글을 쓸 수 있는 영역.
 *
 * 페이지가 **책등 쪽과 바깥쪽에서 말려 들어가** 그 띠에는 면적이 거의 없는데 UV는 제 몫을
 * 그대로 갖는다. 그래서 그 자리에 그린 것은 좁은 띠에 눌려 늘어난다. 그만큼 비워 두고 쓴다.
 *
 * 값은 8칸 시험 텍스처로 읽은 것이다. 좌우가 같은 값이라 페이지를 나눠 둘 이유는 없지만,
 * 한쪽만 다시 재게 되는 날을 위해 페이지별로 둔다.
 */
export const LOBBY_PAGE_MARGIN: Record<string, LobbyPageMargin> = {
  [LOBBY_PAGE_MESHES.left]: { left: 0.25, right: 0.25, top: 0.15, bottom: 0.05 },
  [LOBBY_PAGE_MESHES.right]: { left: 0.25, right: 0.25, top: 0.15, bottom: 0.05 },
}

/**
 * 글 쓰는 면으로 볼 기준 — 삼각형 법선의 y(로컬 좌표).
 *
 * 페이지가 곡면이라 가장자리로 갈수록 법선이 눕는다. 기준을 높이 잡으면 그 가장자리가
 * 옆면으로 빠져 글씨가 잘린다. 옆면(종이 겹친 단면)은 옆을 보므로 y가 0에 가깝고,
 * 그 사이에 여유를 두고 낮춰 잡는다.
 */
export const LOBBY_PAGE_UP_THRESHOLD = 0.2

/**
 * 글씨 면에서 빼는 **책등 쪽 안쪽 띠** — 페이지 폭 대비 비율.
 *
 * 책등으로 접히는 안쪽 면은 아직 위를 보고 있어 법선으로는 갈리지 않는데, 면적이 거의 없어
 * 텍스처가 좁은 띠에 눌려 나온다. 자리로 갈라 그 띠를 종이 재질로 남긴다.
 * 폭 대비 비율이라 책 크기를 바꿔도 따라온다.
 */
export const LOBBY_PAGE_GUTTER_RATIO = 0.08

/**
 * 글을 그리는 캔버스 크기(픽셀).
 *
 * **페이지가 정사각이 아니라 이 비율이 곧 글씨의 가로세로 비다.** 정사각으로 두면 늘어나 보이므로
 * 시험 격자에서 칸이 정사각으로 보이는 값에 맞춘다. 크기 자체는 글씨가 또렷할 만큼만 두면 된다.
 */
export const LOBBY_PAGE_CANVAS = { width: 1024, height: 1024 }

/**
 * 글씨 판의 바탕. 재질의 종이색에 곱해지므로 **흰색이어야 종이색이 그대로 나온다.**
 * 비워 두면 그 자리가 뚫려 뒤가 비친다.
 */
export const LOBBY_BOOK_PAPER = '#ffffff'

/** 종이에 얹는 잉크. 검정은 인쇄물처럼 보이지 않아 짙은 회갈색으로 둔다. */
export const LOBBY_BOOK_INK = '#3a352e'

/** 곁들이는 글(요약)의 색. 본문보다 물러나 있다. */
export const LOBBY_BOOK_INK_SOFT = '#6d665d'

/**
 * 글자 크기와 간격 — 전부 **안전 영역 높이 대비 비율**이다.
 * 캔버스 해상도나 여백을 바꿔도 인상이 유지된다.
 */
export const LOBBY_BOOK_TYPE = {
  /** 손글씨 제목. */
  titleSize: 0.1,
  /** 제목 아래 구분선까지의 간격. */
  titleGap: 0.1,
  /** 본문. */
  bodySize: 0.038,
  /** 본문 줄 간격(글자 크기 배수). */
  bodyLine: 1.6,
  /** 빈 줄이 만드는 문단 사이 여백(글자 크기 배수). */
  paragraphGap: 0.7,
  /** 목록의 제목. */
  itemTitleSize: 0.05,
  /** 목록의 요약. */
  itemSummarySize: 0.034,
  /** 요약 줄 간격(글자 크기 배수). */
  itemSummaryLine: 1.5,
  /** 제목과 요약 사이 간격(안전 영역 높이 대비). */
  itemTitleGap: 0.016,
  /** 항목 사이 간격(안전 영역 높이 대비). */
  itemGap: 0.055,
}
