import { Texture, TextureLoader } from 'three'
import { GALLERY_ARTWORK_DIR, GALLERY_ARTWORK_FILE } from './GalleryArtworks.constants'

/** 프로젝트 이름으로 사진 경로를 만든다. 한글 폴더가 있으므로 이름을 인코딩한다. */
export function artworkUrl(title: string): string {
  return `${GALLERY_ARTWORK_DIR}/${encodeURIComponent(title)}/${GALLERY_ARTWORK_FILE}`
}

/** 사진이 실제로 붙었는지. 빈 텍스처는 이미지가 없다. */
export function hasArtwork(texture: Texture): boolean {
  return Boolean(texture.image)
}

/**
 * 실패해도 던지지 않는 TextureLoader.
 *
 * 사진이 없는 프로젝트가 있을 수 있는데, 여기서 던지면 `SceneErrorBoundary`가 받아 방 전체가
 * 사라진다. 못 받으면 **빈 텍스처**를 넘겨 쓰는 쪽이 그 칸만 건너뛰게 한다.
 *
 * 상태로 뒤늦게 주입하지 않고 `useLoader`(Suspense)에 태우는 것은 그대로다.
 */
export class OptionalTextureLoader extends TextureLoader {
  load(
    url: string,
    onLoad?: (data: Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
  ): Texture<HTMLImageElement> {
    return super.load(url, onLoad, onProgress, () => {
      onLoad?.(new Texture() as Texture<HTMLImageElement>)
    })
  }
}
