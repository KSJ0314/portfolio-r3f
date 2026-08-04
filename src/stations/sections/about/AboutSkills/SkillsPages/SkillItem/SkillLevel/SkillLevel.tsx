import { PaperSticker } from '../../../../../../../lib/PaperSticker'
import { SKILLS_LEVEL_ALPHA, SKILLS_LEVEL_URL } from './SkillLevel.constants'
import type { SkillLevelProps } from './SkillLevel.types'

/**
 * 기술 이름 오른쪽에 숙련도만큼 붙는 별 — 오려 붙인 종이 스티커.
 *
 * 별은 전부 같은 그림이라 텍스처를 한 번만 굽고 판만 여러 개 늘어놓는다(로더가 캐시한다).
 * 간격은 여백을 뺀 그림 폭을 기준으로 재야 별 사이가 고르게 보인다.
 * 판은 여백을 포함해 이웃끼리 겹치므로 깊이를 끈다 — 쓰면 투명한 여백이 옆 별을 잘라낸다.
 * 굽는 동안 서스펜드되므로 스테이션 공통 Suspense 안에서 쓴다.
 */
export function SkillLevel({ count, x, y, level }: SkillLevelProps) {
  return (
    <PaperSticker
      url={SKILLS_LEVEL_URL}
      height={level.size}
      params={{
        ...SKILLS_LEVEL_ALPHA,
        border: level.border,
        shadowBlur: level.shadowBlur,
        shadowDistance: level.shadowDistance,
        shadowOpacity: level.shadowOpacity,
      }}
      count={count}
      gap={level.starGap}
      depthWrite={false}
      position={[x, y, 0]}
      raycast={() => null}
    />
  )
}
