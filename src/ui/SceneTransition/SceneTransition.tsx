import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useSceneTransitionStore } from '../../state/useSceneTransitionStore'
import {
  IRIS_CLOSE_SECONDS,
  IRIS_EASE,
  IRIS_MAX_COVER_SECONDS,
  IRIS_MIN_COVER_SECONDS,
  IRIS_OPEN_SECONDS,
} from './SceneTransition.constants'
import { Curtain, Hole } from './SceneTransition.styled'

/**
 * 구멍이 화면을 다 비우는 지름.
 * 중심이 화면 구석으로 치우쳐도 반대쪽 모서리까지 드러나도록 대각선의 두 배로 둔다.
 */
const openDiameter = () => 2 * Math.hypot(window.innerWidth, window.innerHeight)

/**
 * 장면 전환 덮개 — 가운데로 조여드는 원.
 *
 * 라우트를 옮기면 페이지가 통째로 갈리므로 **라우트보다 위**(`Root`)에 둔다.
 * 다 덮인 뒤에 옮기고, 도착한 쪽이 준비를 알려야 연다(`useSceneTransitionStore`).
 * 그래서 모델을 받는 동안에도 화면이 끊기지 않는다.
 *
 * 트윈은 DOM 속성이 아니라 **평범한 객체를 굴려** 그 값을 style에 옮긴다.
 * 스테이션 연출들이 진행도를 굴리는 것과 같은 방식이고, 무엇이 실제로 바뀌는지가 코드에 드러난다.
 */
export function SceneTransition() {
  const navigate = useNavigate()
  const phase = useSceneTransitionStore((s) => s.phase)
  const arrived = useSceneTransitionStore((s) => s.arrived)
  const hole = useRef<HTMLDivElement>(null)
  /** 지금 구멍 지름(px). 트윈은 이 값만 굴리고 화면에 옮기는 것은 아래에서 한다. */
  const diameter = useRef({ value: 0 })
  /** 덮인 시각. 최소·최대 유지 시간을 여기서부터 잰다. */
  const coveredAt = useRef(0)

  // 지름과 함께 **조여들 중심**도 옮긴다. 중심은 씬이 매 프레임 채우므로(예: 문 자리)
  // 트윈이 도는 동안 계속 따라간다.
  const applyHole = useCallback(() => {
    const element = hole.current
    if (!element) return
    const size = `${diameter.current.value}px`
    element.style.width = size
    element.style.height = size
    const { focus } = useSceneTransitionStore.getState()
    element.style.left = `${focus.x * 100}%`
    element.style.top = `${focus.y * 100}%`
  }, [])

  // 구멍은 처음부터 화면 밖까지 열려 있다(덮개 자체가 감춰져 있어 보이지는 않는다).
  useLayoutEffect(() => {
    diameter.current.value = openDiameter()
    applyHole()
  }, [applyHole])

  useEffect(() => {
    if (phase !== 'closing') return
    // 창 크기가 바뀌었을 수 있으므로 닫기 시작할 때 다시 연 상태로 맞춘다.
    diameter.current.value = openDiameter()
    applyHole()
    const tween = gsap.to(diameter.current, {
      value: 0,
      duration: IRIS_CLOSE_SECONDS,
      ease: IRIS_EASE,
      onUpdate: applyHole,
      onComplete: () => {
        const { to, markCovered } = useSceneTransitionStore.getState()
        coveredAt.current = performance.now()
        markCovered()
        if (to) navigate(to)
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
    const tween = gsap.to(diameter.current, {
      value: openDiameter(),
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
