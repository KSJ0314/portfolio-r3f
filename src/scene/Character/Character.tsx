import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Mesh } from 'three'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { useCameraStore } from '../../state/useCameraStore'
import { isMovementLocked, useStationStore } from '../../state/useStationStore'

/** 이동 속도(유닛/초). 거리와 무관하게 항상 일정. */
const MOVE_SPEED = 8

const _dir = new Vector3()
const _prev = new Vector3()

/**
 * 임시 캐릭터 플레이스홀더. 매 프레임 목표점(target)을 향해 고정 속도로 한 걸음씩 이동한다.
 * 우클릭을 누르고 있으면 목표점이 커서를 따라 갱신되어 계속 이동한다.
 * Phase 7에서 실제 캐릭터·걷기 애니메이션으로 교체.
 */
export function Character() {
  const ref = useRef<Mesh>(null)
  const mode = useThemeStore((s) => s.mode)
  const theme = themes[mode]
  const position = useCameraStore((s) => s.position)
  const target = useCameraStore((s) => s.target)

  useFrame((_, delta) => {
    _prev.copy(position)
    // 스테이션 진입·종료 애니메이션 중에는 이동이 잠긴다.
    // 이동 중 활성화했을 수 있으므로 남은 목표점을 현재 위치로 스냅해 즉시 멈춘다(관성 없이).
    // 종료 애니메이션이 끝나면 스토어가 우클릭했던 지점을 목표로 다시 설정한다.
    if (isMovementLocked(useStationStore.getState().phase)) target.copy(position)
    const dist = position.distanceTo(target)
    if (dist > 1e-4) {
      const step = MOVE_SPEED * delta
      if (dist <= step) {
        position.copy(target)
      } else {
        position.add(_dir.subVectors(target, position).normalize().multiplyScalar(step))
      }
    }
    ref.current?.position.set(position.x, 0.4, position.z)
    // 이번 프레임 실제 이동 속도(유닛/초) 기록 — 디버그/튜닝용(구독 알림 없이 in-place).
    useCameraStore.getState().motion.speed = delta > 0 ? position.distanceTo(_prev) / delta : 0
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.6, 0.8, 0.6]} />
      <meshStandardMaterial color={theme.colors.accent} />
    </mesh>
  )
}
