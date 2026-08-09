import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useCareerLogoStore } from '../../../../state/useCareerLogoStore'
import { useCareerPageStore } from '../../../../state/useCareerPageStore'
import type { StationInactiveProps } from '../../../registry'
import { CAREER_CENTER, INK, careerColumnLeft } from './AboutCareer.constants'
import type { CareerLogoTarget } from './AboutCareer.types'
import { CareerPaper } from './CareerPaper'
import {
  EDUCATION_ORDER,
  EDUCATION_URL,
  EDUCATION_Y,
  SPEC_ORDER,
  SPEC_URL,
  SPEC_Y,
} from './CareerPaper/CareerPaper.constants'
import { CareerTrophy } from './CareerTrophy'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 클릭 판정 면 < 테두리 순으로 얹는다. */
const AREA_Y = 0.005
const OUTLINE_Y = 0.01

/**
 * `about-career` 비활성 상태 — 종이 위 Career 영역.
 *
 * 이 영역이 곧 클릭 판정 범위다. 안쪽 어디를 눌러도 활성화된다.
 * 범위 테두리는 개발용 HUD에서 켤 때만 그린다.
 *
 * 종이 위에는 교육·자격증 그림이 오려 붙인 스티커로 놓이고 트로피가 세워져 있다.
 * 활성화하면 셋이 각자 **영역을 셋으로 나눈 칸의 제목 자리**로 물러나 로고가 된다.
 * 그 전환을 활성 구현이 아니라 여기서 갖는 이유는 같은 그림이 이어서 변형돼야 하기 때문이다.
 *
 * 마운트 자리는 배치 좌표(CAREER_CENTER)이지만, 영역 위치는 store의 상단 중앙 + 크기로 정해지므로
 * 그 차이만큼 그룹을 옮겨 실제 영역에 놓는다(HUD로 좌표를 바꾸면 영역·근접·클릭이 함께 따라온다).
 */
export function AboutCareerInactive({ station }: StationInactiveProps) {
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)
  const padding = useCareerPageStore((s) => s.padding)
  const showOutline = useCareerPageStore((s) => s.showOutline)
  const education = useCareerPageStore((s) => s.education)
  const spec = useCareerPageStore((s) => s.spec)
  const trophy = useCareerPageStore((s) => s.trophy)
  const logo = useCareerPageStore((s) => s.logo)
  const widths = useCareerLogoStore((s) => s.widths)

  const { width, height } = area
  const halfWidth = width / 2
  const halfHeight = height / 2

  // 영역 중심(월드) = 상단 중앙 + 세로 반크기. 마운트 자리(배치 좌표)와의 차이만큼 안에서 옮긴다.
  const offsetX = topCenter.x - CAREER_CENTER[0]
  const offsetZ = topCenter.z + halfHeight - CAREER_CENTER[1]

  // 칸마다 로고가 앉을 자리. 영역 크기를 바꾸면 칸도 함께 나뉜다.
  // 배율은 평소 크기마다 달라진다 — 로고 높이를 맞춰야 셋이 같은 크기로 보인다.
  // 가로도 그림마다 다르므로, 왼쪽 끝을 칸에 맞추려면 올라온 가로의 절반만큼 안으로 들인다.
  const logoAt = useMemo<(index: number, ownHeight: number) => CareerLogoTarget>(() => {
    const z = -halfHeight + padding.y + logo.top
    return (index, ownHeight) => ({
      x: careerColumnLeft(index, width, padding.x) + logo.left + (widths[index] ?? 0) / 2,
      z,
      scale: ownHeight > 0 ? logo.height / ownHeight : 0,
    })
  }, [width, halfHeight, padding, logo, widths])

  const outline = useMemo<[number, number, number][]>(() => {
    // 닫힌 사각형이라 첫 점으로 돌아온다.
    return [
      [-halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, -halfHeight],
    ]
  }, [halfWidth, halfHeight])

  return (
    <group position={[offsetX, 0, offsetZ]}>
      {/* 클릭 판정 면. 포인터 핸들러가 없어 우클릭 이동은 바닥으로 통과하고, 좌클릭 활성화만 Stations가 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 오려 붙인 종이 두 장 — 살짝 겹치므로 자격증을 깔고 교육을 위에 얹는다. */}
      <CareerPaper
        url={SPEC_URL}
        column={2}
        y={SPEC_Y}
        order={SPEC_ORDER}
        placement={spec}
        logo={logoAt(2, spec.height)}
      />
      <CareerPaper
        url={EDUCATION_URL}
        column={0}
        y={EDUCATION_Y}
        order={EDUCATION_ORDER}
        placement={education}
        logo={logoAt(0, education.height)}
      />

      {/* 종이 위에 세워 둔 트로피. */}
      <CareerTrophy column={1} logo={logoAt(1, trophy.height)} />

      {/* 영역 테두리 — 범위 확인용. 내용을 채우는 8-2에서 표시 방식을 다시 정한다. */}
      {showOutline && <Line points={outline} color={INK} lineWidth={2} raycast={() => null} />}
    </group>
  )
}
