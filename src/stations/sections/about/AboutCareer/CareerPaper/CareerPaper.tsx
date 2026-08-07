import { useCallback, useRef } from 'react'
import { type Group, MathUtils } from 'three'
import { PaperSticker } from '../../../../../lib/PaperSticker'
import { useCareerLogoStore } from '../../../../../state/useCareerLogoStore'
import { useCareerLogoPose } from '../AboutCareer.hooks'
import { CAREER_PAPER_PARAMS } from './CareerPaper.constants'
import type { CareerPaperProps } from './CareerPaper.types'

/**
 * Career 영역에 오려 붙인 종이 한 장(교육 과정·자격증).
 *
 * 좌표는 영역 중심 기준이라 영역을 옮기거나 크기를 바꿔도 함께 따라온다.
 * 서로 살짝 겹쳐 놓으므로 깊이 버퍼는 쓰지 않고(판의 투명한 여백이 밑엣것을 잘라내지 않게)
 * 앞뒤는 `order`로 못 박는다 — 거리순에 맡기면 아래쪽에 놓인 종이가 위로 올라온다.
 * 클릭·이동 판정은 밑에 깔린 영역 판이 맡으므로 레이캐스트에서 뺀다.
 *
 * 활성화되면 **비뚤어진 각도를 펴면서** 줄어들어 제 칸의 제목 자리로 물러나 로고가 된다.
 */
export function CareerPaper({ url, column, y, order, placement, logo }: CareerPaperProps) {
  const group = useRef<Group>(null)
  const setWidth = useCareerLogoStore((s) => s.setWidth)

  // 그림 가로는 구워야 알 수 있다. 로고 자리를 왼쪽 끝에 맞추고 제목을 오른쪽에 붙이는 쪽이 이 값을 본다.
  // 줄어든 뒤의 가로를 올린다 — 쓰는 쪽이 배율을 다시 알 필요가 없다.
  const measure = useCallback(
    (size: { width: number }) => setWidth(column, size.width * logo.scale),
    [setWidth, column, logo.scale],
  )

  /** 두 자세를 섞어 그룹에 적용한다. 0이면 평소 자리, 1이면 로고 자리. */
  const applyPose = useCallback(
    (progress: number) => {
      const target = group.current
      if (!target) return
      target.position.set(
        MathUtils.lerp(placement.x, logo.x, progress),
        y,
        MathUtils.lerp(placement.z, logo.z, progress),
      )
      // 눕힌 종이라 화면 안에서 도는 각도가 곧 y축 회전이다. 로고에서는 반듯하게 편다.
      target.rotation.set(0, MathUtils.degToRad(placement.rotation) * (1 - progress), 0)
      target.scale.setScalar(MathUtils.lerp(1, logo.scale, progress))
    },
    [placement, logo, y],
  )

  useCareerLogoPose(applyPose)

  return (
    <group ref={group}>
      <PaperSticker
        url={url}
        height={placement.height}
        params={{ ...CAREER_PAPER_PARAMS, border: placement.border }}
        // 눕히면 그림 위쪽이 맵 위쪽(-z)을 향한다.
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={order}
        depthWrite={false}
        onMeasure={measure}
        raycast={() => null}
      />
    </group>
  )
}
