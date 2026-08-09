/**
 * 스테이션 공통 타입.
 * 여러 스테이션·HUD가 함께 쓰는 타입만 여기 둔다(특정 스테이션 전용 타입은 그 폴더 안에).
 */

/** 스테이션 영역(가로 × 세로). 바닥에 눕은 사각형이고, 이게 곧 클릭·근접 판정 범위다. */
export interface StationArea {
  width: number
  height: number
}

/**
 * 영역 테두리에서 내용까지 들이는 여백. 읽을 내용이 놓일 안쪽 상자를 정한다.
 * 영역은 클릭·근접 판정 범위라 내용보다 넓게 잡히므로, 그 안에서 어디까지 쓸지를 이 값이 정한다.
 * 새로 만드는 스테이션 영역은 크기·좌표와 함께 이 여백을 기본으로 갖는다.
 *
 * **나가기·페이지 넘김 같은 UI 요소는 이 여백을 따르지 않는다** — 구석에 붙는 조작 요소라
 * 영역 테두리에서 바로 잰다. 여백을 넓혀도 그 자리에 남아야 한다.
 */
export interface StationAreaPadding {
  /** 좌우 여백. */
  x: number
  /** 상하 여백. */
  y: number
}

/** troika가 글자 배치를 끝내고 넘겨주는 정보 중 쓰는 것 — 글 덩어리의 경계 `[minX, minY, maxX, maxY]`. */
export interface TroikaTextMesh {
  textRenderInfo?: { blockBounds?: ArrayLike<number> }
}
