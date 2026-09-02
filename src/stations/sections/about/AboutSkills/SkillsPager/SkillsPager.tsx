import { useCallback, useState } from 'react'
import { Text } from '@react-three/drei'
import { HAND_FONT } from '../../../../../content/fonts'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import type { TroikaTextMesh } from '../../../../types'
import { INK } from '../AboutSkills.constants'
import { PAGER_GAP_RATIO, PAGER_NEXT_TEXT, PAGER_PREV_TEXT } from './SkillsPager.constants'
import type { SkillsPagerProps } from './SkillsPager.types'

/**
 * 우측 하단 페이지 넘김.
 *
 * 첫 페이지에는 다음만, 마지막 페이지에는 이전만 두고, 그 사이 페이지에는 **이전을 다음 왼쪽에**
 * 나란히 둔다. 페이지 번호는 쓰지 않는다.
 * 좌클릭으로 넘기므로 이 글씨만 레이캐스트를 열어 둔다(페이지의 다른 글씨는 전부 빠져 있다).
 *
 * 손그림 모양(크레파스 화살표 등)은 나가기 요소와 함께 다듬는다.
 */
export function SkillsPager({ page, count, onPage, x, y, size }: SkillsPagerProps) {
  const cursor = usePointerCursor()
  // 이전을 다음 왼쪽에 붙이려면 다음 글씨가 얼마나 넓은지 알아야 한다.
  const [nextWidth, setNextWidth] = useState(0)
  const handleNextSync = useCallback((mesh: unknown) => {
    const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
    if (!bounds || bounds.length < 4) return
    const next = bounds[2] - bounds[0]
    setNextWidth((prev) => (Math.abs(prev - next) < 1e-4 ? prev : next))
  }, [])

  if (count < 2) return null
  const hasNext = page < count - 1
  // 다음이 오른쪽 끝을 차지하고 이전은 그 왼쪽에 선다. 다음이 없으면 이전이 그 자리를 쓴다.
  // 다음 폭을 재기 전에는 이전을 두지 않는다. 폭이 0이면 두 글씨가 같은 자리에 겹친다.
  const hasPrev = page > 0 && (!hasNext || nextWidth > 0)
  const prevX = hasNext ? x - nextWidth - size * PAGER_GAP_RATIO : x

  return (
    <>
      {hasPrev && (
        <Text
          font={HAND_FONT}
          position={[prevX, y, 0]}
          anchorX="right"
          anchorY="bottom"
          fontSize={size}
          color={INK}
          onClick={() => onPage(page - 1)}
          {...cursor}
        >
          {PAGER_PREV_TEXT}
        </Text>
      )}

      {hasNext && (
        <Text
          onSync={handleNextSync}
          font={HAND_FONT}
          position={[x, y, 0]}
          anchorX="right"
          anchorY="bottom"
          fontSize={size}
          color={INK}
          onClick={() => onPage(page + 1)}
          {...cursor}
        >
          {PAGER_NEXT_TEXT}
        </Text>
      )}
    </>
  )
}
