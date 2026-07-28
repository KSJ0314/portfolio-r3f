/**
 * 스테이션 공통 타입.
 * 여러 스테이션·HUD가 함께 쓰는 타입만 여기 둔다(특정 스테이션 전용 타입은 그 폴더 안에).
 */

/** 스테이션 영역(가로 × 세로). 바닥에 눕은 사각형이고, 이게 곧 클릭·근접 판정 범위다. */
export interface StationArea {
  width: number
  height: number
}

/** troika가 글자 배치를 끝내고 넘겨주는 정보 중 쓰는 것 — 글 덩어리의 경계 `[minX, minY, maxX, maxY]`. */
export interface TroikaTextMesh {
  textRenderInfo?: { blockBounds?: ArrayLike<number> }
}
