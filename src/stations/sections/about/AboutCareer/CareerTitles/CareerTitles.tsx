import { Text } from '@react-three/drei'
import { HAND_FONT } from '../../../../../content/fonts'
import { useCareerLogoStore } from '../../../../../state/useCareerLogoStore'
import { useCareerPageStore } from '../../../../../state/useCareerPageStore'
import { CAREER_COLUMN_TITLES, INK, careerColumnLeft } from '../AboutCareer.constants'
import { CAREER_TITLES_Y } from './CareerTitles.constants'

/**
 * 활성 상태에서 칸마다 붙는 손글씨 제목 — 교육 · 자격증 · 수상내역.
 *
 * 자리는 그 칸 로고의 **오른쪽 끝**에서 잰 거리라, 로고마다 가로가 달라도 간격이 같다.
 * 영역을 옮기거나 로고 자리를 바꾸면 함께 따라온다.
 * 클릭·이동 판정은 밑에 깔린 영역 판이 맡으므로 레이캐스트에서 뺀다.
 */
export function CareerTitles() {
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)
  const logo = useCareerPageStore((s) => s.logo)
  const title = useCareerPageStore((s) => s.title)
  const widths = useCareerLogoStore((s) => s.widths)

  // 눕힌 그룹 안은 화면 좌표(x=가로, y=세로)다. 로컬 +y가 월드 -z라 세로는 부호가 뒤집힌다.
  const y = area.height / 2 - logo.top + title.offsetY

  return (
    <group
      position={[topCenter.x, CAREER_TITLES_Y, topCenter.z + area.height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {CAREER_COLUMN_TITLES.map((text, index) => {
        // 올라온 가로는 이미 줄어든 뒤의 값이라 그대로 더한다.
        const x = careerColumnLeft(index, area.width) + logo.left + (widths[index] ?? 0) + title.gap

        return (
          <Text
            key={text}
            font={HAND_FONT}
            position={[x, y, 0]}
            anchorX="left"
            anchorY="middle"
            fontSize={title.size}
            color={INK}
            raycast={() => null}
          >
            {text}
          </Text>
        )
      })}
    </group>
  )
}
