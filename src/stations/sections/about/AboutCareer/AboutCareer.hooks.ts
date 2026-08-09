import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useCareerSequenceStore } from '../../../../state/useCareerSequenceStore'
import { useStationStore } from '../../../../state/useStationStore'
import { CAREER_TURN_EASE, CAREER_TURN_SECONDS } from './AboutCareer.constants'

const CAREER_ID = 'about-career'

/** 마운트 시점의 자세 — 1이면 로고 자리, 0이면 평소 자리. */
function initialProgress(): number {
  const { activeId, phase } = useStationStore.getState()
  return activeId === CAREER_ID && phase === 'active' ? 1 : 0
}

/**
 * 평소 자리 ↔ 로고 자리를 오가는 진행도.
 *
 * 카메라 회전과 **같은 시간·이징으로 동시에** 돌아, 화면이 도는 사이 그림들이 제 칸으로 물러난다.
 * 다만 차례를 라이프사이클에서 직접 보지 않고 신호로 받는다 — 캐릭터가 먼저 걸어가는 구간이 있고
 * 걷는 시간은 거리마다 달라, 전체 순서를 아는 활성 구현이 때를 알려야 한다.
 * 전환을 활성 구현이 아니라 상시 마운트된 비활성 구현이 갖는 이유는, 같은 그림이 이어서
 * 변형돼야 하기 때문이다(따로 그리면 그림이 두 개가 되고 전환이 끊긴다).
 * 스토어를 구독해 gsap가 그룹만 건드리므로 매 프레임 리렌더는 없다.
 */
export function useCareerLogoPose(applyPose: (progress: number) => void) {
  const pose = useRef({ progress: initialProgress() })
  // 자세 적용은 늘 최신 것을 부르되, 그 갱신이 구독·트윈을 다시 만들지는 않게 ref로 들고 있는다.
  const apply = useRef(applyPose)

  // 첫 프레임부터 제자리에 놓는다. HUD로 값을 바꿀 때도 지금 자세 그대로 다시 적용된다.
  useLayoutEffect(() => {
    apply.current = applyPose
    applyPose(pose.current.progress)
  }, [applyPose])

  // 구독·트윈은 마운트 때 한 번만 건다. 리렌더마다 다시 걸면 그 사이 돌던 트윈이 죽어
  // 카메라만 돌고 그림은 다음 상태 변화(카메라가 다 돈 뒤)에야 뒤늦게 움직인다.
  useEffect(() => {
    let tween: gsap.core.Tween | null = null
    let target = pose.current.progress

    const unsubscribe = useCareerSequenceStore.subscribe((state) => {
      const next = state.logoTurn ? 1 : 0
      if (next === target) return
      target = next
      tween?.kill()
      tween = gsap.to(pose.current, {
        progress: next,
        duration: CAREER_TURN_SECONDS,
        ease: CAREER_TURN_EASE,
        onUpdate: () => apply.current(pose.current.progress),
      })
    })

    return () => {
      tween?.kill()
      unsubscribe()
    }
  }, [])
}
