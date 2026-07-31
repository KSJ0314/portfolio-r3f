import { MathUtils } from 'three'
import { PaperSticker } from '../../../lib/PaperSticker'
import { useCameraStore } from '../../../state/useCameraStore'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'
import { useAfterIntro } from '../MapDecorations.hooks'
import {
  RIGHT_CLICK_HINT_PARAMS,
  RIGHT_CLICK_HINT_URL,
  RIGHT_CLICK_HINT_Y,
} from './RightClickHint.constants'

/**
 * 안내 화살표 곁에 놓이는 우클릭 안내 아이콘 — 오른쪽 버튼을 칠한 마우스 그림이다.
 *
 * 우클릭으로 이동한다는 것을 처음 온 사람은 알기 어려우므로, 안내 화살표가 다 그어진 뒤에 나타나
 * **한 번이라도 우클릭으로 이동하면 사라진다.** 세션 한정이라 새로고침하면 다시 나온다.
 */
export function RightClickHint() {
  const { height, x, z, rotation } = useMapDecorationsStore((s) => s.hint)
  const arrowSeconds = useMapDecorationsStore((s) => s.guide.seconds)
  // 화살표를 다 그은 뒤에 얹는다 — 둘이 함께 나오면 눈이 어디를 볼지 정하지 못한다.
  const revealed = useAfterIntro(arrowSeconds)
  const hasMoved = useCameraStore((s) => s.hasMoved)

  if (!revealed || hasMoved) return null

  return (
    <PaperSticker
      url={RIGHT_CLICK_HINT_URL}
      height={height}
      params={RIGHT_CLICK_HINT_PARAMS}
      position={[x, RIGHT_CLICK_HINT_Y, z]}
      // 눕히면 그림 위쪽이 맵 위쪽(-z)을 향한다.
      rotation={[-Math.PI / 2, 0, MathUtils.degToRad(rotation)]}
      // 안내일 뿐이라 클릭·이동 판정에서 뺀다.
      raycast={() => null}
    />
  )
}
