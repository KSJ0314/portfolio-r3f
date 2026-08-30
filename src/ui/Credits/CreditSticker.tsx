import { useCallback, useState } from 'react'
import { MathUtils } from 'three'
import { PaperSticker } from '../../lib/PaperSticker'
import { useCreditsPreviewStore } from '../../state/useCreditsPreviewStore'
import { FLAT_PREVIEW_SCALE } from './Credits.constants'
import type { CreditStickerProps } from './Credits.types'

/**
 * 미리보기에 띄우는 종이 스티커 한 장.
 *
 * 모델과 같이 **가장 긴 변을 1로 맞춘다.** 세로를 1로 굽고 가로가 그보다 넓으면 그만큼 줄인다.
 * 가로는 그림 비율에서 나오므로 굽기 전에는 알 수 없어, 구운 뒤 알려주는 값으로 배율을 잡는다.
 *
 * 세우는 자세는 눈으로 맞춰야 하는 값이라 개발용 HUD로 조절한다.
 */
export function CreditSticker({ url, params }: CreditStickerProps) {
  const [width, setWidth] = useState(1)
  const measure = useCallback(({ width }: { width: number }) => setWidth(width), [])
  const { tilt, spin } = useCreditsPreviewStore((s) => s.sticker)

  return (
    // **판 안 회전이 바깥이다.** 그림 원본이 기울어져 그려져 있어 판 축과 그림 축이 어긋나는데,
    // 눕히기를 먼저 걸면 그 어긋난 축을 도느라 대각선으로 기운다.
    // 먼저 그림을 판 축에 맞춰 세운 뒤에 눕혀야 눕힌 각이 위아래로만 먹는다.
    <group scale={(1 / Math.max(width, 1)) * FLAT_PREVIEW_SCALE}>
      <group rotation={[0, 0, MathUtils.degToRad(spin)]}>
        <group rotation={[-MathUtils.degToRad(tilt), 0, 0]}>
          <PaperSticker url={url} height={1} params={params} onMeasure={measure} />
        </group>
      </group>
    </group>
  )
}
