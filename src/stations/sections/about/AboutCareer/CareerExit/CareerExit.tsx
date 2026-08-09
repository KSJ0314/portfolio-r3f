import { useCareerPageStore } from '../../../../../state/useCareerPageStore'
import { ExitSticker } from '../../../../ExitSticker'
import { CAREER_EXIT_Y } from './CareerExit.constants'

/**
 * 우상단 나가기 아이콘의 자리 — 아이콘 자체는 공용 스티커다.
 * 좌표는 영역 기준이라 영역을 옮기거나 크기를 바꿔도 따라온다.
 *
 * **영역 여백은 따르지 않는다.** 여백은 읽을 내용이 놓일 상자를 정하는 값이고,
 * 나가기는 내용이 아니라 구석에 붙는 UI라 영역 테두리에서 바로 잰다.
 */
export function CareerExit() {
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)
  const exit = useCareerPageStore((s) => s.exit)

  // 영역 우상단에서 여백만큼 안으로, 다시 반크기만큼 들여 아이콘 가운데를 잡는다.
  const right = area.width / 2 - exit.right - exit.size / 2
  const top = area.height / 2 - exit.top - exit.size / 2

  // 스티커가 눕는 판이라 영역의 세로는 월드 z가 되고, 위로 갈수록 z가 줄어든다.
  return (
    <ExitSticker
      position={[topCenter.x + right, CAREER_EXIT_Y, topCenter.z + area.height / 2 - top]}
      size={exit.size}
    />
  )
}
