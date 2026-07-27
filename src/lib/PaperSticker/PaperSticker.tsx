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
} & Omit<ThreeElements['mesh'], 'children'>

/**
 * 그림을 종이에서 오려 붙인 스티커로 씬에 붙이는 평면.
 *
 * 그림 모양을 따라 도는 종이 테두리와 밑에 깔리는 그림자까지 텍스처 한 장에 구워 넣는다.
 * 판은 여백만큼 그림보다 커지지만, 그림 자체는 `height`로 준 크기 그대로 나온다.
 * 굽는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 */
export function PaperSticker({ url, height, params, ...mesh }: PaperStickerProps) {
  const { texture, plane } = usePaperStickerTexture(url, {
    ...DEFAULT_PAPER_STICKER_PARAMS,
    ...params,
  })

  return (
    <mesh {...mesh}>
      <planeGeometry args={[plane.width * height, plane.height * height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}
