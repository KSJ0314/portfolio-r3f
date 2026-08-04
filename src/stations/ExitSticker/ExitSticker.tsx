import { PaperSticker } from '../../lib/PaperSticker'
import { useStationStore } from '../../state/useStationStore'
import { usePointerCursor } from '../usePointerCursor'
import { EXIT_STICKER_PARAMS, EXIT_STICKER_URL } from './ExitSticker.constants'
import type { ExitStickerProps } from './ExitSticker.types'

/**
 * 스테이션을 닫는 나가기 아이콘 — 오려 붙인 종이 스티커.
 *
 * 닫는 방법 세 가지(근접 이탈 · 나가기 요소 · ESC) 중 스테이션이 제공하는 몫이며,
 * 어느 스테이션에서나 같은 아이콘을 쓰므로 여기 공용으로 둔다.
 * 놓을 자리는 스테이션이 정한다(눕힌 그룹 안에 두면 화면 좌표로 다룰 수 있다).
 * 굽는 동안 서스펜드되므로 스테이션 공통 Suspense 안에서 쓴다.
 */
export function ExitSticker({ x, y, size }: ExitStickerProps) {
  const cursor = usePointerCursor()

  return (
    <PaperSticker
      url={EXIT_STICKER_URL}
      height={size}
      params={EXIT_STICKER_PARAMS}
      position={[x, y, 0]}
      onClick={() => useStationStore.getState().requestClose()}
      {...cursor}
    />
  )
}
