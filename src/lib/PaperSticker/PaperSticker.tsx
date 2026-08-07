import { useEffect } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { DEFAULT_PAPER_STICKER_PARAMS } from './PaperSticker.constants'
import { usePaperStickerTexture } from './PaperSticker.texture'
import type { PaperStickerParams } from './PaperSticker.types'

type PaperStickerProps = {
  /** 그림 경로. 배경이 투명한 PNG여야 모양대로 오려진다. */
  url: string
  /** 그림 세로의 월드 크기(테두리·그림자 여백 제외). 가로는 그림의 실제 비율에서 나온다. */
  height: number
  /** 테두리·그림자 값. 주지 않은 항목은 기본값을 쓴다. */
  params?: Partial<PaperStickerParams>
  /** 같은 스티커를 가로로 늘어놓을 개수. 첫 장의 왼쪽 끝이 자리에 온다. */
  count?: number
  /** 여러 장일 때 그림 사이의 간격(월드 단위). 여백이 아니라 그림 끝에서 잰다. */
  gap?: number
  /** 스티커에 곱할 색. 검게 주면 그림자로 눌러 쓸 수 있다. */
  color?: string
  /** 불투명도(0~1). */
  opacity?: number
  /**
   * 깊이 버퍼에 쓸지. 판은 그림보다 크므로 스티커끼리 겹쳐 놓거나 바닥에 깔 때는 꺼야
   * 투명한 여백이 뒤엣것을 잘라내지 않는다.
   */
  depthWrite?: boolean
  /**
   * 구운 그림의 월드 크기(여백 제외)를 알려준다.
   * 가로는 그림 비율에서 나오므로 굽기 전에는 알 수 없다 — 폭에 맞춰 다른 것을 놓을 때 쓴다.
   */
  onMeasure?: (size: { width: number; height: number }) => void
  // `args`(생성자 인자)는 받지 않는다 — 여러 장일 때는 판이 아니라 그룹에 얹히므로 뜻이 달라진다.
} & Omit<ThreeElements['mesh'], 'children' | 'count' | 'args'>

/**
 * 그림을 종이에서 오려 붙인 스티커로 씬에 붙이는 평면.
 *
 * 그림 모양을 따라 도는 종이 테두리와 밑에 깔리는 그림자까지 텍스처 한 장에 구워 넣는다.
 * 판은 여백만큼 그림보다 커지지만, 그림 자체는 `height`로 준 크기 그대로 나온다.
 * 굽는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 *
 * 텍스처를 굽는 일은 여기서만 한다 — 밖에서 훅을 꺼내 판을 직접 만들면 같은 코드가 흩어진다.
 * 재질을 바꿔야 하는 쓰임(겹쳐 놓기·그림자)은 `color`·`opacity`·`depthWrite`로 받는다.
 */
export function PaperSticker({
  url,
  height,
  params,
  count = 1,
  gap = 0,
  color,
  opacity,
  depthWrite,
  onMeasure,
  // 여러 장일 때 판정에서 빼려면 그룹이 아니라 각 판에 걸어야 한다.
  raycast,
  ...mesh
}: PaperStickerProps) {
  const { texture, plane, artwork } = usePaperStickerTexture(url, {
    ...DEFAULT_PAPER_STICKER_PARAMS,
    ...params,
  })

  const planeW = plane.width * height
  const planeH = plane.height * height
  const artW = artwork.width * height

  useEffect(() => {
    onMeasure?.({ width: artW, height })
  }, [onMeasure, artW, height])

  const material = (
    <meshBasicMaterial
      map={texture}
      color={color}
      opacity={opacity}
      transparent
      toneMapped={false}
      depthWrite={depthWrite}
    />
  )

  if (count === 1) {
    return (
      <mesh {...mesh} raycast={raycast}>
        <planeGeometry args={[planeW, planeH]} />
        {material}
      </mesh>
    )
  }

  // 간격은 여백을 뺀 그림 폭으로 잰다. 판 폭으로 재면 여백만큼 벌어져 사이가 성기어 보인다.
  const step = artW + gap

  return (
    <group {...mesh}>
      {Array.from({ length: count }, (_, index) => (
        // 판 중심을 그림 반폭만큼 밀어 첫 장의 왼쪽 끝이 자리에 오게 한다.
        <mesh key={index} position={[index * step + artW / 2, 0, 0]} raycast={raycast}>
          <planeGeometry args={[planeW, planeH]} />
          {material}
        </mesh>
      ))}
    </group>
  )
}
