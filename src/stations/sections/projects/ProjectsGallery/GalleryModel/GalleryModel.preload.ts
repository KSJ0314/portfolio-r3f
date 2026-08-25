import { useGLTF } from '@react-three/drei'
import { GALLERY_DRACO_PATH, GALLERY_MODEL_URL } from '../ProjectsGallery.constants'

/**
 * 전시 공간 모델을 미리 받아 둔다(그리는 것 없음).
 *
 * 로비를 미리 받는 것과 같은 이유다 — 전환을 시작한 뒤에 받기 시작하면 덮인 채로 오래 기다린다.
 * 로비에서 통로에 다가섰을 때 부른다.
 */
export function preloadGalleryModel(): void {
  useGLTF.preload(GALLERY_MODEL_URL, GALLERY_DRACO_PATH)
}
