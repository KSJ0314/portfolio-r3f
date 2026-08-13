import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Mesh } from 'three'
import { pushOutOfBlockers } from '../../state/useBlockersStore'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { useCameraStore } from '../../state/useCameraStore'
import { isMovementLocked, useStationStore } from '../../state/useStationStore'

/** 이동 속도(유닛/초). 거리와 무관하게 항상 일정. */
const MOVE_SPEED = 4

/** 목표점에 닿았다고 보는 거리. */
const ARRIVE_EPSILON = 1e-4

/** 막는 것과 얼마나 떨어져 서는지. 캐릭터 박스의 반폭이라 몸이 벽에 파묻히지 않는다. */
const CHARACTER_RADIUS = 0.3

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
  // 탈것에 탄 동안에는 감춘다. 위치는 그대로 도므로 카메라는 평소처럼 따라간다.
  const hidden = useCameraStore((s) => s.hidden)

  // 지금은 불러오는 것이 없어 즉시 준비된다. 나중에 텍스처·모델이 붙으면 그때부터 실제로 기다린다.
  const markReady = useSceneReadyStore((s) => s.markReady)
  useEffect(() => {
    markReady('character')
  }, [markReady])

  useFrame((_, delta) => {
    _prev.copy(position)
    const { walking, walkSpeed, endWalk } = useCameraStore.getState()
    // 스테이션 진입 애니메이션 중에는 남은 목표점을 현재 위치로 스냅해 즉시 멈춘다(관성 없이).
    // 연출이 지정한 이동은 예외다 — 잠긴 동안 스테이션이 캐릭터를 자기 자리로 데려간다.
    // 맵 연출이 건 잠금(`locks`)은 여기서 스냅하지 않는다. 그쪽은 **입력만** 막고 지정한 자리로는
    // 계속 걸어가야 하기 때문이다(World가 목표점 갱신을 막는다).
    if (!walking && isMovementLocked(useStationStore.getState().phase)) target.copy(position)
    const dist = position.distanceTo(target)
    if (dist > ARRIVE_EPSILON) {
      // 연출이 속도를 지정했으면 그 걸음으로 간다(건물로 들어갈 때처럼 느리게 걸어야 하는 구간).
      const step = (walking && walkSpeed > 0 ? walkSpeed : MOVE_SPEED) * delta
      if (dist <= step) {
        position.copy(target)
      } else {
        position.add(_dir.subVectors(target, position).normalize().multiplyScalar(step))
      }
    }
    // 건물 같은 것을 통과하지 못하게 밀어낸다. 걸음을 옮긴 뒤에 되돌리므로 벽을 따라 미끄러진다.
    // 연출이 지정한 이동은 예외다 — 건물 안으로 들여보내는 것도 그 연출이다.
    if (!walking) pushOutOfBlockers(position, CHARACTER_RADIUS)
    // 자리에 닿으면 연출 이동을 끝낸다. 기다리던 쪽이 이 신호를 받아 다음 차례로 넘어간다.
    // 벽에 막혀 더 갈 수 없을 때도 끝낸다 — 닿기를 기다리는 쪽이 영영 기다리면 이동이 잠긴 채로 남는다.
    if (walking) {
      const arrived = position.distanceTo(target) <= ARRIVE_EPSILON
      const stuck = delta > 0 && position.distanceTo(_prev) <= ARRIVE_EPSILON
      if (arrived || stuck) endWalk()
    }
    ref.current?.position.set(position.x, 0.4, position.z)
    // 이번 프레임 실제 이동 속도(유닛/초) 기록 — 디버그/튜닝용(구독 알림 없이 in-place).
    useCameraStore.getState().motion.speed = delta > 0 ? position.distanceTo(_prev) / delta : 0
  })

  return (
    <mesh ref={ref} visible={!hidden}>
      <boxGeometry args={[0.6, 0.8, 0.6]} />
      <meshStandardMaterial color={theme.colors.accent} />
    </mesh>
  )
}
