import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshStandardMaterial } from 'three'
import gsap from 'gsap'
import {
  CLICK_MARKER_COLOR,
  CLICK_MARKER_RADIUS_RATIO,
  CLICK_MARKER_SEGMENTS,
} from './ClickMarker.constants'
import type { ClickMarkerProps } from './ClickMarker.types'

/**
 * 누를 수 있다는 표시 — 대상 위에 떠서 아래를 가리키는 원뿔.
 *
 * 위아래로 오르내리며 천천히 돈다. 각을 적게 남겨 도는 것이 눈에 들어오게 한다.
 * 투명도는 prop으로 주지 않는다 — 값이 바뀌어 다시 렌더될 때마다 prop 값으로 되돌아가 페이드가 끊긴다.
 */
export function ClickMarker({
  visible,
  y,
  size,
  bob,
  bobSeconds,
  spinSeconds,
  fadeSeconds,
}: ClickMarkerProps) {
  const group = useRef<Group>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const shown = useRef({ value: 0 })

  const applyFade = () => {
    if (material.current) material.current.opacity = shown.current.value
  }

  // 첫 프레임이 불투명하게 찍히지 않도록 그리기 전에 지금 값을 적용한다.
  useLayoutEffect(applyFade, [])

  useEffect(() => {
    const tween = gsap.to(shown.current, {
      value: visible ? 1 : 0,
      duration: fadeSeconds,
      ease: 'power1.out',
      onUpdate: applyFade,
    })
    return () => {
      tween.kill()
    }
  }, [visible, fadeSeconds])

  useFrame((state) => {
    const marker = group.current
    if (!marker) return
    const time = state.clock.elapsedTime
    marker.position.y = y + Math.sin((time / bobSeconds) * Math.PI * 2) * bob
    marker.rotation.y = spinSeconds > 0 ? (time / spinSeconds) * Math.PI * 2 : 0
  })

  return (
    <group ref={group}>
      {/* 기본 원뿔은 위가 뾰족하다. 뒤집어 끝이 아래(대상)를 가리키게 하고,
          그 끝이 그룹 원점에 오도록 반 높이만큼 올린다. */}
      <mesh rotation={[Math.PI, 0, 0]} position={[0, size / 2, 0]}>
        <coneGeometry
          args={[size * CLICK_MARKER_RADIUS_RATIO, size, CLICK_MARKER_SEGMENTS]}
        />
        <meshStandardMaterial
          ref={material}
          color={CLICK_MARKER_COLOR}
          flatShading
          transparent
        />
      </mesh>
    </group>
  )
}
