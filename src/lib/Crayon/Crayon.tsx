import type { ThreeElements } from '@react-three/fiber'
import { CRAYON_TEXTURE_MARGIN, CRAYON_TEXTURE_PIXELS } from './Crayon.constants'
import { useCrayonTexture } from './Crayon.texture'
import type { CrayonDrawing } from './Crayon.types'

/** 획 굵기 대비 손떨림 폭의 기본 비율. 굵을수록 더 흔들리게. */
const WOBBLE_RATIO = 0.18

type CrayonProps = {
  /** 그릴 크레파스 그림(0~1 정규화 획들). */
  drawing: CrayonDrawing
  /** plane 한 변의 월드 크기(margin 적용 전). */
  size: number
  /** 획 굵기(월드 단위). 내부에서 텍스처 픽셀로 환산된다. */
  strokeWidth: number
  color: string
  roughness?: number
  opacity?: number
  patchiness?: number
  /** 획 굵기 대비 손떨림 폭의 비율. 크기를 바꿔도 손맛이 유지되도록 비율로 받는다. */
  wobbleRatio?: number
  /** plane이 그림보다 넓은 배율(획 잘림 방지). */
  margin?: number
  /** 텍스처 해상도(px). */
  pixels?: number
} & Omit<ThreeElements['mesh'], 'children'>

/**
 * 크레파스 그림을 씬에 붙이는 평면 스프라이트.
 *
 * 크레파스 렌더의 모든 것(월드→텍스처 환산·굽기·GPU 업로드·로더·plane)을 여기서 처리한다.
 * 쓰는 쪽은 획 좌표와 크기·색만 주고, 위치·회전·포인터 핸들러는 mesh props로 그대로 넘긴다.
 * 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 */
export function Crayon({
  drawing,
  size,
  strokeWidth,
  color,
  roughness,
  opacity,
  patchiness,
  wobbleRatio = WOBBLE_RATIO,
  margin = CRAYON_TEXTURE_MARGIN,
  pixels = CRAYON_TEXTURE_PIXELS,
  ...mesh
}: CrayonProps) {
  const plane = size * margin
  // 월드 굵기를 텍스처 픽셀로 환산한다(plane 전체가 pixels에 대응).
  const strokePixels = (strokeWidth / plane) * pixels
  const texture = useCrayonTexture(
    drawing,
    {
      color,
      width: strokePixels,
      wobble: strokePixels * wobbleRatio,
      roughness,
      opacity,
      patchiness,
    },
    pixels,
  )

  return (
    <mesh {...mesh}>
      <planeGeometry args={[plane, plane]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}
