import { useMemo } from 'react'
import { useCareerLogoStore } from '../../../../../state/useCareerLogoStore'
import { useCareerPageStore } from '../../../../../state/useCareerPageStore'
import { careerColumnLeft } from '../AboutCareer.constants'
import type { CareerLogoTarget } from '../AboutCareer.types'
import { CareerPaper } from '../CareerPaper'
import {
  EDUCATION_ORDER,
  EDUCATION_URL,
  EDUCATION_Y,
  SPEC_ORDER,
  SPEC_URL,
  SPEC_Y,
} from '../CareerPaper/CareerPaper.constants'
import { CareerTrophy } from '../CareerTrophy'

/**
 * Career 영역에 놓인 그림 셋 — 오려 붙인 종이 두 장(교육·자격증)과 트로피.
 *
 * 좌표는 **영역 중심 기준**이라 쓰는 쪽이 그 자리에 놓는다.
 * 활성화되면 셋이 각자 제 칸의 제목 자리로 물러나 로고가 된다(전환은 각 그림이 신호를 보고 한다).
 */
export function CareerFigures() {
  const area = useCareerPageStore((s) => s.area)
  const padding = useCareerPageStore((s) => s.padding)
  const education = useCareerPageStore((s) => s.education)
  const spec = useCareerPageStore((s) => s.spec)
  const trophy = useCareerPageStore((s) => s.trophy)
  const logo = useCareerPageStore((s) => s.logo)
  const widths = useCareerLogoStore((s) => s.widths)

  const { width, height } = area

  // 칸마다 로고가 앉을 자리. 영역 크기를 바꾸면 칸도 함께 나뉜다.
  // 배율은 평소 크기마다 달라진다 — 로고 높이를 맞춰야 셋이 같은 크기로 보인다.
  // 가로도 그림마다 다르므로, 왼쪽 끝을 칸에 맞추려면 올라온 가로의 절반만큼 안으로 들인다.
  const logoAt = useMemo<(index: number, ownHeight: number) => CareerLogoTarget>(() => {
    const z = -height / 2 + padding.y + logo.top
    return (index, ownHeight) => ({
      x: careerColumnLeft(index, width, padding.x) + logo.left + (widths[index] ?? 0) / 2,
      z,
      scale: ownHeight > 0 ? logo.height / ownHeight : 0,
    })
  }, [width, height, padding, logo, widths])

  return (
    <>
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
    </>
  )
}
