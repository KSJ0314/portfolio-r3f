import { Text } from '@react-three/drei'
import { HAND_FONT } from '../../../../../content/fonts'
import { useSkillsPageStore } from '../../../../../state/useSkillsPageStore'
import { INK } from '../AboutSkills.constants'
import { SKILLS_TITLE_TEXT, SKILLS_TITLE_Y } from './SkillsTitle.constants'

/**
 * 활성 상태에서 로고 옆에 놓이는 손글씨 제목.
 *
 * 로고 자리(영역 좌상단 + 여백)를 기준으로 오른쪽에 붙으므로 영역이나 로고를 옮기면 함께 따라온다.
 * 클릭·이동 판정은 밑에 깔린 영역 판이 맡으므로 레이캐스트에서 뺀다.
 */
export function SkillsTitle() {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
  const logo = useSkillsPageStore((s) => s.logo)
  const title = useSkillsPageStore((s) => s.title)

  // 눕힌 그룹 안은 화면 좌표(x=가로, y=세로)다. 로컬 +y가 월드 -z라 세로는 부호가 뒤집힌다.
  const x = -area.width / 2 + logo.x + title.gap
  const y = area.height / 2 - logo.z + title.offsetY

  return (
    <group
      position={[topLeft.x + area.width / 2, SKILLS_TITLE_Y, topLeft.z + area.height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <Text
        font={HAND_FONT}
        position={[x, y, 0]}
        anchorX="left"
        anchorY="middle"
        fontSize={title.size}
        color={INK}
        raycast={() => null}
      >
        {SKILLS_TITLE_TEXT}
      </Text>
    </group>
  )
}
