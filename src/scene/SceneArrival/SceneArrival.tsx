import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSceneTransitionStore } from '../../state/useSceneTransitionStore'

/** 그려졌다고 보는 프레임 수. 첫 프레임은 아직 화면에 나가기 전이다. */
const READY_FRAMES = 2

/**
 * 이 씬이 그려졌음을 전환 덮개에 알린다(그리는 것 없음).
 *
 * 덮개는 **도착 신호를 받아야** 열리므로, 라우트로 갈리는 페이지는 저마다 이것을 Canvas 안에
 * 하나 둔다. 마운트만으로는 아직 한 장도 그리지 않았으므로 몇 프레임을 세고 알린다.
 *
 * 기다려야 하는 것(모델 등)이 있으면 그 `Suspense` **안에** 두어, 준비된 뒤에야 세기 시작하게 한다.
 * 전환 없이 들어온 화면에서는 알려도 아무 일이 없다.
 */
export function SceneArrival() {
  const frames = useRef(0)

  useFrame(() => {
    if (frames.current >= READY_FRAMES) return
    frames.current += 1
    if (frames.current === READY_FRAMES) useSceneTransitionStore.getState().markArrived()
  })

  return null
}
