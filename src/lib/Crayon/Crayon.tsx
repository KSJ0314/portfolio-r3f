import type { ThreeElements } from '@react-three/fiber'
import type { CanvasTexture } from 'three'
import { type CrayonBakeOptions, type CrayonBakeResult, resolveCrayonBake } from './Crayon.bake'
import { useCrayonRevealTexture } from './Crayon.reveal'
import { useCrayonTexture } from './Crayon.texture'

type CrayonMeshProps = Omit<ThreeElements['mesh'], 'children'>

type CrayonProps = CrayonBakeOptions & {
  /**
   * 그려지는 연출을 켠다 — 획 순서대로 등속으로 그어지는 시간(초).
   * 없으면 처음부터 완성된 그림이 붙는다.
   */
  reveal?: number
} & CrayonMeshProps

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
}: CrayonBakeResult & CrayonMeshProps) {
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
}: CrayonBakeResult & CrayonMeshProps & { seconds: number }) {
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
 *
 * 연출 없이 붙이는 쪽은 붙는 순간 굽기 시작하면 그동안 서스펜드돼 그림이 늦게 나타난다.
 * 미리 구워 두려면 같은 값으로 `preloadCrayon`을 부른다.
 */
export function Crayon({
  drawing,
  size,
  height,
  strokeWidth,
  color,
  roughness,
  opacity,
  patchiness,
  wobbleRatio,
  edge,
  margin,
  pixels,
  reveal,
  ...mesh
}: CrayonProps) {
  const bake = resolveCrayonBake({
    drawing,
    size,
    height,
    strokeWidth,
    color,
    roughness,
    opacity,
    patchiness,
    wobbleRatio,
    edge,
    margin,
    pixels,
  })

  // 두 갈래는 텍스처를 얻는 방식이 달라(useLoader ↔ 자체 캔버스) 훅이 갈리므로 컴포넌트를 나눈다.
  return reveal === undefined ? (
    <BakedCrayon {...bake} {...mesh} />
  ) : (
    <RevealingCrayon {...bake} seconds={reveal} {...mesh} />
  )
}
