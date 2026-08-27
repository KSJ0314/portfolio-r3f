import { Text } from '@react-three/drei'
import { BODY_FONT } from '../../content/fonts'
import { PaperSticker } from '../../lib/PaperSticker'
import { usePointerCursor } from '../../scene/usePointerCursor'
import {
  LOAD_FAILED_COLOR,
  LOAD_FAILED_ICON_GAP_RATIO,
  LOAD_FAILED_ICON_PARAMS,
  LOAD_FAILED_ICON_SIZE_RATIO,
  LOAD_FAILED_ICON_URL,
  LOAD_FAILED_TEXT,
} from './LoadFailed.constants'
import type { LoadFailedProps } from './LoadFailed.types'

/**
 * Firestore 읽기가 실패했을 때 그 내용 자리에 대신 두는 안내.
 *
 * 실패하면 로딩이 끝난 것으로 처리돼 목록만 빈 페이지가 열린다. 방문자는 비어 있는 것인지
 * 못 불러온 것인지 알 수 없으므로, 어느 스테이션에서나 같은 문구로 알린다.
 * 훅이 이미 몇 번 자동으로 다시 시도한 뒤이므로, 아래 아이콘은 그래도 안 될 때 직접 부르는 길이다.
 *
 * **눕힌 그룹 안에서 쓴다** — 좌표는 화면 기준(x=가로, y=세로)이고, 아이콘도 그 그룹을 따라 눕는다.
 */
export function LoadFailed({ size, x = 0, y = 0, onRetry }: LoadFailedProps) {
  const cursor = usePointerCursor()

  return (
    <>
      <Text
        font={BODY_FONT}
        position={[x, y, 0]}
        anchorX="center"
        anchorY="middle"
        fontSize={size}
        color={LOAD_FAILED_COLOR}
        raycast={() => null}
      >
        {LOAD_FAILED_TEXT}
      </Text>

      <PaperSticker
        url={LOAD_FAILED_ICON_URL}
        height={size * LOAD_FAILED_ICON_SIZE_RATIO}
        params={LOAD_FAILED_ICON_PARAMS}
        position={[x, y - size * LOAD_FAILED_ICON_GAP_RATIO, 0]}
        onClick={onRetry}
        {...cursor}
      />
    </>
  )
}
