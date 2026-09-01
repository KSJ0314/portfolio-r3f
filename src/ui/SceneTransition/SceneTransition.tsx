import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ROUTE_BY_DESTINATION } from '../../routes'
import { useSceneTransitionStore } from '../../state/useSceneTransitionStore'
import {
  IRIS_EASE,
  IRIS_MAX_COVER_SECONDS,
  IRIS_MIN_COVER_SECONDS,
  IRIS_OPEN_SECONDS,
} from './SceneTransition.constants'
import { Curtain, Hole } from './SceneTransition.styled'

/**
 * 지금 초점에서 화면을 **꼭 덮는** 지름(px). 초점에서 가장 먼 모서리까지가 반지름이다.
 *
 * 이보다 크면 원이 화면 밖이라 줄어도 눈에 아무 변화가 없다. 화면 대각선의 두 배처럼 넉넉히
 * 잡아 두면 조여드는 시간의 앞쪽 절반이 통째로 빈 구간이 되어, 시작 신호와 보이는 시작이 어긋난다.
 *
 * 초점은 씬이 매 프레임 채우므로 매번 다시 잰다. 초점이 옮겨 가도 원이 화면을 놓치지 않는다.
 */
const coverDiameter = () => {
  const { focus } = useSceneTransitionStore.getState()
  const { innerWidth: width, innerHeight: height } = window
  const x = focus.x * width
  const y = focus.y * height
  return 2 * Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
}

/**
 * 장면 전환 덮개 — 초점으로 조여드는 원.
 *
 * 라우트를 옮기면 페이지가 통째로 갈리므로 **라우트보다 위**(`App`)에 둔다.
 * 다 덮인 뒤에 옮기고, 도착한 쪽이 준비를 알려야 연다(`useSceneTransitionStore`).
 * 그래서 모델을 받는 동안에도 화면이 끊기지 않는다.
 *
 * 트윈은 DOM 속성이 아니라 **평범한 객체를 굴려** 그 값을 style에 옮긴다.
 * 스테이션 연출들이 진행도를 굴리는 것과 같은 방식이고, 무엇이 실제로 바뀌는지가 코드에 드러난다.
 * 굴리는 것은 지름이 아니라 **덮인 정도**(0이면 활짝, 1이면 다 덮임)라, 화면 크기나 초점이
 * 바뀌어도 남은 시간과 보이는 진행이 어긋나지 않는다.
 */
export function SceneTransition() {
  const navigate = useNavigate()
  const phase = useSceneTransitionStore((s) => s.phase)
  const arrived = useSceneTransitionStore((s) => s.arrived)
  const hole = useRef<HTMLDivElement>(null)
  /** 덮인 정도(0~1). 트윈은 이 값만 굴리고 화면에 옮기는 것은 아래에서 한다. */
  const covered = useRef({ value: 0 })
  /** 덮인 시각. 최소·최대 유지 시간을 여기서부터 잰다. */
  const coveredAt = useRef(0)

  // 덮인 정도를 지금 초점 기준의 지름으로 옮긴다. **조여들 중심도 함께** 옮긴다 —
  // 중심은 씬이 매 프레임 채우므로(예: 통로 자리) 트윈이 도는 동안 계속 따라간다.
  const applyHole = useCallback(() => {
    const element = hole.current
    if (!element) return
    const size = `${coverDiameter() * (1 - covered.current.value)}px`
    element.style.width = size
    element.style.height = size
    const { focus } = useSceneTransitionStore.getState()
    element.style.left = `${focus.x * 100}%`
    element.style.top = `${focus.y * 100}%`
  }, [])

  // 구멍은 처음부터 활짝 열려 있다(덮개 자체가 감춰져 있어 보이지는 않는다).
  useLayoutEffect(() => {
    covered.current.value = 0
    applyHole()
  }, [applyHole])

  useEffect(() => {
    if (phase !== 'closing') return
    // 앞선 전환이 중간에 끊겼을 수 있으므로 닫기 시작할 때 활짝 열린 상태로 맞춘다.
    covered.current.value = 0
    applyHole()
    const tween = gsap.to(covered.current, {
      value: 1,
      duration: useSceneTransitionStore.getState().closeSeconds,
      ease: IRIS_EASE,
      onUpdate: applyHole,
      onComplete: () => {
        const { to, markCovered } = useSceneTransitionStore.getState()
        coveredAt.current = performance.now()
        markCovered()
        if (to) navigate(ROUTE_BY_DESTINATION[to])
      },
    })
    return () => {
      tween.kill()
    }
  }, [phase, navigate, applyHole])

  // 덮인 채로 기다린다. 도착했으면 최소 유지 시간만 채우고, 도착 신호가 오지 않으면
  // 최대 유지 시간까지만 기다렸다 그냥 연다 — 까만 화면에 갇히지 않게.
  useEffect(() => {
    if (phase !== 'covered') return
    const held = performance.now() - coveredAt.current
    const wait = (arrived ? IRIS_MIN_COVER_SECONDS : IRIS_MAX_COVER_SECONDS) * 1000 - held
    const timer = setTimeout(() => useSceneTransitionStore.getState().beginOpen(), Math.max(wait, 0))
    return () => clearTimeout(timer)
  }, [phase, arrived])

  useEffect(() => {
    if (phase !== 'opening') return
    const tween = gsap.to(covered.current, {
      value: 0,
      duration: IRIS_OPEN_SECONDS,
      ease: IRIS_EASE,
      onUpdate: applyHole,
      onComplete: () => useSceneTransitionStore.getState().markOpened(),
    })
    return () => {
      tween.kill()
    }
  }, [phase, applyHole])

  return (
    <Curtain $active={phase !== 'idle'}>
      <Hole ref={hole} />
    </Curtain>
  )
}
