import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { type Group, MathUtils } from 'three'
import gsap from 'gsap'
import { PaperSticker } from '../../../../../lib/PaperSticker'
import { useSkillsPageStore } from '../../../../../state/useSkillsPageStore'
import { type StationPhase, useStationStore } from '../../../../../state/useStationStore'
import {
  SKILLS_LOGO_SECONDS,
  SKILLS_TURN_EASE,
  SKILLS_TURN_SECONDS,
} from '../AboutSkills.constants'
import { SKILLS_BOX_URL, SKILLS_BOX_Y } from './SkillsBox.constants'
import type { SkillsBoxProps } from './SkillsBox.types'

/** 로고 자리에 가 있어야 하는 상태인지 — 1이면 로고, 0이면 평소 자리. */
function logoTarget(activeId: string | null, phase: StationPhase, stationId: string): number {
  return activeId === stationId && phase !== 'exiting' ? 1 : 0
}

/**
 * Skills 영역에 놓인 공구함 그림 — 종이에서 오려낸 스티커를 스케치북에 붙인 모습.
 *
 * 활성화되면 절반 크기로 줄어 영역 좌상단으로 물러나 로고가 되고, 닫히면 제자리로 돌아온다.
 * **평소 모습과 활성 모습이 같은 오브젝트**여야 이어서 변형되므로, 활성 구현(Scene)에서 따로 그리지 않고
 * 상시 마운트된 이 컴포넌트가 스스로 라이프사이클을 구독해 움직인다.
 * 매 프레임 리렌더하지 않도록 스토어를 구독해 gsap가 그룹만 직접 건드린다.
 *
 * 좌표는 영역 중심 기준이라 영역을 옮기거나 크기를 바꿔도 함께 따라온다.
 * 클릭·이동 판정은 밑에 깔린 영역 판이 맡으므로 레이캐스트에서 뺀다.
 */
export function SkillsBox({ stationId }: SkillsBoxProps) {
  const box = useSkillsPageStore((s) => s.box)
  const logo = useSkillsPageStore((s) => s.logo)
  const area = useSkillsPageStore((s) => s.area)
  const group = useRef<Group>(null)
  // 마운트 시점의 단계에 맞춰 시작한다(활성 중에 다시 붙어도 로고 자리에 있게).
  const current = useStationStore.getState()
  const pose = useRef({ progress: logoTarget(current.activeId, current.phase, stationId) })

  /** 두 자세를 섞어 그룹에 적용한다. 0이면 평소 자리, 1이면 로고 자리. */
  const applyPose = useCallback(
    (progress: number) => {
      const target = group.current
      if (!target) return
      // 로고 자리는 영역 좌상단에서 여백만큼 안쪽이다. 영역을 옮기면 같이 따라온다.
      const logoX = -area.width / 2 + logo.x
      const logoZ = -area.height / 2 + logo.z
      target.position.set(
        MathUtils.lerp(box.x, logoX, progress),
        SKILLS_BOX_Y,
        MathUtils.lerp(box.z, logoZ, progress),
      )
      target.scale.setScalar(MathUtils.lerp(1, logo.scale, progress))
      target.rotation.set(0, MathUtils.lerp(0, MathUtils.degToRad(logo.rotation), progress), 0)
    },
    [area, box, logo],
  )

  // 첫 프레임부터 제자리에 놓는다. HUD로 값을 바꿀 때도 지금 자세 그대로 다시 적용된다.
  useLayoutEffect(() => {
    applyPose(pose.current.progress)
  }, [applyPose])

  useEffect(() => {
    let tween: gsap.core.Tween | null = null
    let target = pose.current.progress

    const unsubscribe = useStationStore.subscribe((state) => {
      const next = logoTarget(state.activeId, state.phase, stationId)
      if (next === target) return
      target = next
      tween?.kill()
      // 카메라 전환과 겹치지 않게 순서를 지킨다 — 물러날 땐 카메라가 다 돈 뒤에,
      // 돌아올 땐 먼저 움직이고 카메라가 그 뒤를 잇는다.
      tween = gsap.to(pose.current, {
        progress: next,
        duration: SKILLS_LOGO_SECONDS,
        delay: next === 1 ? SKILLS_TURN_SECONDS : 0,
        ease: SKILLS_TURN_EASE,
        onUpdate: () => applyPose(pose.current.progress),
      })
    })

    // 트윈도 함께 정리한다. 남겨두면 낡은 applyPose를 계속 부르며 새 트윈과 같은 값을 두고 다툰다.
    return () => {
      tween?.kill()
      unsubscribe()
    }
  }, [applyPose, stationId])

  return (
    <group ref={group}>
      <PaperSticker
        url={SKILLS_BOX_URL}
        height={box.height}
        params={{
          border: box.border,
          shadowBlur: box.shadowBlur,
          shadowDistance: box.shadowDistance,
          shadowOpacity: box.shadowOpacity,
        }}
        // 눕히면 그림 위쪽이 맵 위쪽(-z)을 향한다.
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      />
    </group>
  )
}
