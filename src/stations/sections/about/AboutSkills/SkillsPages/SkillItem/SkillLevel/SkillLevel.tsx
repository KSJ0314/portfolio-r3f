import {
  DEFAULT_PAPER_STICKER_PARAMS,
  usePaperStickerTexture,
} from '../../../../../../../lib/PaperSticker'
import { SKILLS_LEVEL_ALPHA, SKILLS_LEVEL_URL } from './SkillLevel.constants'
import type { SkillLevelProps } from './SkillLevel.types'

/**
 * 기술 이름 오른쪽에 숙련도만큼 붙는 별 — 오려 붙인 종이 스티커.
 *
 * 별은 전부 같은 그림이라 텍스처를 한 번만 굽고 판만 여러 개 늘어놓는다(로더가 캐시한다).
 * 간격은 여백을 뺀 그림 폭을 기준으로 재야 별 사이가 고르게 보인다.
 * 굽는 동안 서스펜드되므로 스테이션 공통 Suspense 안에서 쓴다.
 */
export function SkillLevel({ count, x, y, level }: SkillLevelProps) {
  const { texture, plane, artwork } = usePaperStickerTexture(SKILLS_LEVEL_URL, {
    ...DEFAULT_PAPER_STICKER_PARAMS,
    ...SKILLS_LEVEL_ALPHA,
    border: level.border,
    shadowBlur: level.shadowBlur,
    shadowDistance: level.shadowDistance,
    shadowOpacity: level.shadowOpacity,
  })

  const starWidth = artwork.width * level.size
  const step = starWidth + level.starGap

  return (
    <group position={[x, y, 0]}>
      {Array.from({ length: count }, (_, index) => (
        <mesh
          key={index}
          // 판 중심을 그림 반폭만큼 밀어 첫 별의 왼쪽 끝이 x에 오게 한다.
          position={[index * step + starWidth / 2, 0, 0]}
          raycast={() => null}
        >
          <planeGeometry args={[plane.width * level.size, plane.height * level.size]} />
          {/* 판은 여백을 포함하는데 간격은 그림 폭 기준이라 이웃끼리 겹친다.
              깊이를 쓰면 투명한 여백이 옆 별을 잘라내므로 끈다. */}
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
