import { CanvasTexture, SRGBColorSpace } from 'three'
import {
  GALLERY_NAMEPLATE_CANVAS_WIDTH,
  GALLERY_NAMEPLATE_FALLBACK_ASPECT,
} from './GalleryNameplates.constants'
import type { GalleryNameplate } from './GalleryNameplates.types'

/**
 * 이름판에 얹을 빈 판을 만든다.
 *
 * **한 번 굽고 끝내지 않는다.** 글꼴과 Firestore가 늦게 오므로 캔버스를 들고 있다가 다시 그리고
 * `texture.needsUpdate`로 갱신한다(ARCHITECTURE의 캐시·Suspense 예외 항목).
 *
 * **바탕은 비워 둔다.** 글씨만 있는 판을 금색 이름판 앞에 세우는 것이라, 칠하면 금색을 덮는다.
 *
 * `flipY`는 기본값 그대로다 — 글씨를 얹을 판을 직접 세우므로 glTF의 UV 원점을 따를 일이 없다.
 */
export function createNameplate(aspect: number): GalleryNameplate {
  const shape = Number.isFinite(aspect) && aspect > 0 ? aspect : GALLERY_NAMEPLATE_FALLBACK_ASPECT

  const canvas = document.createElement('canvas')
  canvas.width = GALLERY_NAMEPLATE_CANVAS_WIDTH
  canvas.height = Math.max(1, Math.round(GALLERY_NAMEPLATE_CANVAS_WIDTH / shape))

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return { canvas, texture }
}
