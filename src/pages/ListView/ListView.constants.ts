/** 목록 보기 주소. */
export const LIST_ROUTE = '/list'

/**
 * 굽는 크기(px). 16:9이고, 인쇄에 쓸 만한 해상도로 둔다.
 * 키우면 글씨가 또렷해지는 대신 굽는 시간과 메모리가 함께 는다.
 */
export const BAKE_WIDTH = 2560
export const BAKE_HEIGHT = 1440

/** 한 장의 바탕색. 모눈종이도 종이색도 아닌 흰색이다. */
export const LIST_BACKGROUND = '#ffffff'

/**
 * 영역이 화면에 최대로 들어가는 직교 배율.
 * 영역 비율이 16:9와 다른 만큼은 여백으로 남고, 카메라가 영역 중심을 보므로 가운데 정렬된다.
 */
export function fitZoom(width: number, height: number): number {
  return Math.min(BAKE_WIDTH / width, BAKE_HEIGHT / height)
}

/** 프로젝트 페이지의 세로(가로 1 기준). 액자가 16:9라 여백 없이 꽉 찬다. */
export const PAGE_HEIGHT = 9 / 16

/** 카메라가 서는 높이. 직교라 배율과 무관하고 near/far 안에만 있으면 된다. */
export const FOCUS_HEIGHT = 20

/**
 * 화면끼리 떼어 놓는 거리(월드 x). 한 씬에 다 세워 두고 카메라만 옮기므로,
 * 담기는 범위보다 넉넉히 떨어져야 옆 화면이 끼어들지 않는다.
 */
export const SCREEN_GAP_X = 200

/** 그림이 로고 자리로 물러나기를 기다리는 시간(ms). 그 전에 찍으면 평소 자리로 나온다. */
export const SETTLE_MS = 2000

/** 한 장을 찍고 다음 장으로 넘어가기 전에 쉬는 시간(ms). 굽는 동안 화면이 멎지 않게 한다. */
export const SHOT_GAP_MS = 30

/**
 * 굽는 형식과 품질. 화면에 띄우는 것과 PDF에 넣는 것이 같은 그림이다.
 * PNG로 두면 PDF에 넣을 때 장마다 다시 압축하느라 그동안 화면이 통째로 멎는다.
 */
export const SHOT_IMAGE_TYPE = 'image/jpeg'
export const SHOT_IMAGE_QUALITY = 0.9

/** 내려받는 PDF 이름(확장자 제외). */
export const PDF_FILE_NAME = 'KimSoJung_portfolio'
