/**
 * 잰 액자 한 장 — 사진 판을 세울 자리와 크기(월드).
 *
 * `z`는 액자의 **앞면**이다. 사진 판은 여기서 조금 앞으로 띄워 세운다.
 */
export interface GalleryArtworkSpot {
  x: number
  y: number
  z: number
  width: number
  height: number
}

/** 칸 순서대로의 프로젝트 이름. 사진을 찾는 폴더 이름이기도 하다. */
export interface GalleryArtworksProps {
  titles: readonly string[]
}
