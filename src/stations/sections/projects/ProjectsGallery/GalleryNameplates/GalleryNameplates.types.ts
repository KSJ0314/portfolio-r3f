import type { CanvasTexture } from 'three'
import type { DocBase } from '../../../../../lib/firebase/firestore'

/**
 * 전시 공간이 보는 프로젝트. Firestore `projects`에서 필요한 것만 본다.
 *
 * `key`는 프로젝트를 가리키는 번호(0부터)로, 사진 폴더 이름이자 페이지 정의를 찾는 값이다.
 * 이름은 바뀔 수 있어 가리키는 값으로 쓰지 않는다. 아직 넣지 않은 문서가 있을 수 있어 선택 값이다.
 * 필드 이름이 `id`가 아닌 것은 읽기 훅이 실어 주는 문서 id와 부딪히기 때문이다.
 */
export interface GalleryProject extends DocBase {
  title: string
  order: number
  key?: number
}

/**
 * 잰 이름판 한 장 — 글씨 판을 세울 자리와 크기(월드).
 *
 * `z`는 이름판의 **앞면**이다. 글씨 판은 여기서 조금 앞으로 띄워 세운다.
 */
export interface GalleryNameplateSpot {
  x: number
  y: number
  z: number
  width: number
  height: number
}

/** 캔버스와 그것으로 만든 텍스처. 다시 그린 뒤 `texture.needsUpdate`를 켜면 화면에 반영된다. */
export interface GalleryNameplate {
  canvas: HTMLCanvasElement
  texture: CanvasTexture
}

/** 칸 순서대로의 프로젝트 이름. 칸보다 적으면 남은 칸은 비워 둔다. */
export interface GalleryNameplatesProps {
  titles: readonly string[]
}
