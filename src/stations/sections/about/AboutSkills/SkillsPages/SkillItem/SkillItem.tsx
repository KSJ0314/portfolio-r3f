import { useCallback, useState } from 'react'
import { Text } from '@react-three/drei'
import { BODY_FONT, HAND_FONT } from '../../../../../../content/fonts'
import type { TroikaTextMesh } from '../../../../../types'
import { INK } from '../../AboutSkills.constants'
import type { SkillItemProps } from './SkillItem.types'
import { SkillLevel } from './SkillLevel'

/**
 * 기술 하나 — 이름은 손글씨, 설명은 본문체.
 *
 * 설명이 몇 줄로 접힐지는 미리 알 수 없으므로, troika가 배치를 끝낸 뒤 주는 경계값으로 높이를 재
 * 부모에게 알린다. 부모는 그 높이만큼 다음 항목을 내려 놓는다.
 */
export function SkillItem({
  skill,
  x,
  y,
  width,
  nameSize,
  nameGap,
  bodySize,
  bodyLineHeight,
  level,
  onHeight,
}: SkillItemProps) {
  // 별을 이름 오른쪽에 붙이려면 이름이 실제로 얼마나 넓은지 알아야 한다(기술마다 길이가 다르다).
  const [nameWidth, setNameWidth] = useState(0)
  const handleNameSync = useCallback((mesh: unknown) => {
    const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
    if (!bounds || bounds.length < 4) return
    const next = bounds[2] - bounds[0]
    setNameWidth((prev) => (Math.abs(prev - next) < 1e-4 ? prev : next))
  }, [])

  const handleSync = useCallback(
    (mesh: unknown) => {
      const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
      if (!bounds || bounds.length < 4) return
      onHeight(skill.id, nameSize + nameGap + (bounds[3] - bounds[1]))
    },
    [skill.id, nameSize, nameGap, onHeight],
  )

  return (
    <group position={[x, y, 0]}>
      <Text
        onSync={handleNameSync}
        font={HAND_FONT}
        anchorX="left"
        anchorY="top"
        fontSize={nameSize}
        color={INK}
        raycast={() => null}
      >
        {skill.name}
      </Text>

      {nameWidth > 0 && skill.level > 0 && (
        <SkillLevel
          count={skill.level}
          x={nameWidth + level.gap}
          y={-nameSize / 2 + level.offsetY}
          level={level}
        />
      )}

      <Text
        onSync={handleSync}
        font={BODY_FONT}
        position={[0, -nameSize - nameGap, 0]}
        anchorX="left"
        anchorY="top"
        fontSize={bodySize}
        lineHeight={bodyLineHeight}
        maxWidth={width}
        textAlign="left"
        color={INK}
        raycast={() => null}
      >
        {skill.description.map((line) => `-  ${line}`).join('\n')}
      </Text>
    </group>
  )
}
