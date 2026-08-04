import type { ThreeElements } from '@react-three/fiber'
import type { CanvasTexture } from 'three'
import { CRAYON_TEXTURE_MARGIN, CRAYON_TEXTURE_PIXELS } from './Crayon.constants'
import { useCrayonRevealTexture } from './Crayon.reveal'
import { useCrayonTexture } from './Crayon.texture'
import type { CrayonDrawing, CrayonEdgeParams, CrayonSharedParams } from './Crayon.types'

/** 획 굵기 대비 손떨림 폭의 기본 비율. 굵을수록 더 흔들리게. */
const WOBBLE_RATIO = 0.18

type CrayonMeshProps = Omit<ThreeElements['mesh'], 'children'>

type CrayonProps = {
  /** 그릴 크레파스 그림(0~1 정규화 획들). */
  drawing: CrayonDrawing
  /** plane 가로의 월드 크기(margin 적용 전). */
  size: number
  /** plane 세로의 월드 크기(margin 적용 전). 없으면 정사각(= size). */
  height?: number
  /** 획 굵기(월드 단위). 내부에서 텍스처 픽셀로 환산된다. */
  strokeWidth: number
  color: string
  roughness?: number
  opacity?: number
  patchiness?: number
  /** 획 굵기 대비 손떨림 폭의 비율. 크기를 바꿔도 손맛이 유지되도록 비율로 받는다. */
  wobbleRatio?: number
  /**
   * 바깥 윤곽 마무리 — 그림 가장자리로 갈수록 알갱이를 덜 찍어 테두리가 자연스럽게 끝난다.
   * 획을 겹쳐 면을 채운 그림에 준다. 주지 않으면 걸지 않는다.
   */
  edge?: Partial<CrayonEdgeParams>
  /** plane이 그림보다 넓은 배율(획 잘림 방지). */
  margin?: number
  /** 텍스처 해상도(px). */
  pixels?: number
  /**
   * 그려지는 연출을 켠다 — 획 순서대로 등속으로 그어지는 시간(초).
   * 없으면 처음부터 완성된 그림이 붙는다.
   */
  reveal?: number
} & CrayonMeshProps

/** 텍스처를 굽는 데 필요한 값. 두 갈래(한 번에 굽기·그려 나가기)가 함께 받는다. */
interface CrayonBakeProps {
  drawing: CrayonDrawing
  params: CrayonSharedParams
  texWidth: number
  texHeight: number
}

/** 그림이 붙는 판. */
interface CrayonPlaneProps {
  planeW: number
  planeH: number
}

function CrayonPlane({
  texture,
  planeW,
  planeH,
  ...mesh
}: { texture: CanvasTexture } & CrayonPlaneProps & CrayonMeshProps) {
  return (
    <mesh {...mesh}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

/** 완성된 그림을 한 번에 구워 붙인다. 텍스처를 굽는 동안 서스펜드된다. */
function BakedCrayon({
  drawing,
  params,
  texWidth,
  texHeight,
  ...plane
}: CrayonBakeProps & CrayonPlaneProps & CrayonMeshProps) {
  const texture = useCrayonTexture(drawing, params, texWidth, texHeight)
  return <CrayonPlane texture={texture} {...plane} />
}

/** 획을 순서대로 그어 나간다. 캔버스를 직접 들고 매 프레임 갱신하므로 서스펜드하지 않는다. */
function RevealingCrayon({
  drawing,
  params,
  texWidth,
  texHeight,
  seconds,
  ...plane
}: CrayonBakeProps & CrayonPlaneProps & CrayonMeshProps & { seconds: number }) {
  const texture = useCrayonRevealTexture(drawing, params, texWidth, texHeight, seconds)
  return <CrayonPlane texture={texture} {...plane} />
}

/**
 * 크레파스 그림을 씬에 붙이는 평면 스프라이트.
 *
 * 크레파스 렌더의 모든 것(월드→텍스처 환산·굽기·GPU 업로드·로더·plane)을 여기서 처리한다.
 * 쓰는 쪽은 획 좌표와 크기·색만 주고, 위치·회전·포인터 핸들러는 mesh props로 그대로 넘긴다.
 * 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 *
 * `reveal`을 주면 그림이 처음부터 그어지는 연출로 바뀐다(그 경우 서스펜드하지 않는다).
 * 연출을 다시 재생하려면 `key`를 바꿔 새로 마운트한다.
 */
export function Crayon({
  drawing,
  size,
  height = size,
  strokeWidth,
  color,
  roughness,
  opacity,
  patchiness,
  wobbleRatio = WOBBLE_RATIO,
  edge,
  margin = CRAYON_TEXTURE_MARGIN,
  pixels = CRAYON_TEXTURE_PIXELS,
  reveal,
  ...mesh
}: CrayonProps) {
  const planeW = size * margin
  const planeH = height * margin
  // 텍스처는 plane 비율에 맞춘 직사각으로 굽는다. 짧은 변을 기준 해상도(pixels)로 둔다.
  const shorter = Math.min(planeW, planeH)
  const texWidth = Math.round((planeW / shorter) * pixels)
  const texHeight = Math.round((planeH / shorter) * pixels)
  // 월드 굵기를 텍스처 픽셀로 환산한다. 짧은 변 기준이라 가로·세로 어느 획이든 둥글게 유지된다.
  const strokePixels = (strokeWidth / shorter) * pixels

  const bake: CrayonBakeProps = {
    drawing,
    params: {
      color,
      width: strokePixels,
      wobble: strokePixels * wobbleRatio,
      roughness,
      opacity,
      patchiness,
      edge,
    },
    texWidth,
    texHeight,
  }

  // 두 갈래는 텍스처를 얻는 방식이 달라(useLoader ↔ 자체 캔버스) 훅이 갈리므로 컴포넌트를 나눈다.
  return reveal === undefined ? (
    <BakedCrayon {...bake} planeW={planeW} planeH={planeH} {...mesh} />
  ) : (
    <RevealingCrayon {...bake} seconds={reveal} planeW={planeW} planeH={planeH} {...mesh} />
  )
}
