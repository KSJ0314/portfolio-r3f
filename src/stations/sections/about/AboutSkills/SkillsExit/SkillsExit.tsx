import { useSkillsPageStore } from '../../../../../state/useSkillsPageStore'
import { ExitSticker } from '../../../../ExitSticker'
import { SKILLS_EXIT_Y } from './SkillsExit.constants'

/**
 * 우상단 나가기 아이콘의 자리 — 아이콘 자체는 공용 스티커다.
 * 좌표는 영역 기준이라 영역을 옮기거나 크기를 바꿔도 따라온다.
 */
export function SkillsExit() {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
  const exit = useSkillsPageStore((s) => s.exit)

  return (
    <group
      position={[topLeft.x + area.width / 2, SKILLS_EXIT_Y, topLeft.z + area.height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* 여백은 아이콘 바깥 끝 기준이라 반크기만큼 안으로 들여 가운데를 잡는다. */}
      <ExitSticker
        x={area.width / 2 - exit.right - exit.size / 2}
        y={area.height / 2 - exit.top - exit.size / 2}
        size={exit.size}
      />
    </group>
  )
}
