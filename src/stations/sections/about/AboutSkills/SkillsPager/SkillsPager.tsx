import { Text } from '@react-three/drei'
import { HAND_FONT } from '../../../../../content/fonts'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { INK } from '../AboutSkills.constants'
import { PAGER_NEXT_TEXT, PAGER_PREV_TEXT } from './SkillsPager.constants'
import type { SkillsPagerProps } from './SkillsPager.types'

/**
 * 우측 하단 페이지 넘김.
 *
 * 한 번에 하나만 둔다 — 첫 페이지에는 다음, 마지막 페이지에는 이전. 페이지 번호는 쓰지 않는다.
 * 좌클릭으로 넘기므로 이 글씨만 레이캐스트를 열어 둔다(페이지의 다른 글씨는 전부 빠져 있다).
 *
 * 손그림 모양(크레파스 화살표 등)은 나가기 요소와 함께 다듬는다.
 */
export function SkillsPager({ page, count, onPage, x, y, size }: SkillsPagerProps) {
  const cursor = usePointerCursor()
  const isFirst = page === 0
  if (count < 2) return null

  return (
    <Text
      font={HAND_FONT}
      position={[x, y, 0]}
      anchorX="right"
      anchorY="bottom"
      fontSize={size}
      color={INK}
      onClick={() => onPage(isFirst ? page + 1 : page - 1)}
      {...cursor}
    >
      {isFirst ? PAGER_NEXT_TEXT : PAGER_PREV_TEXT}
    </Text>
  )
}
