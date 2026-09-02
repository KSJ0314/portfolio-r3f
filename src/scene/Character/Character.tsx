import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Group } from 'three'
import { pushOutOfBlockers } from '../../state/useBlockersStore'
import { useCameraStore } from '../../state/useCameraStore'
import { useCharacterStore } from '../../state/useCharacterStore'
import { isMovementLocked, useStationStore } from '../../state/useStationStore'
import { CharacterModel, faceMoveDirection, headingTo, takeFacePoint } from '../CharacterModel'
import type { CharacterModelHandle } from '../CharacterModel'
import { ARRIVE_EPSILON, CHARACTER_RADIUS, MOVE_SPEED } from './Character.constants'

const _step = new Vector3()
const _moved = new Vector3()
const _prev = new Vector3()

/**
 * 맵의 캐릭터. 매 프레임 목표점(target)을 향해 고정 속도로 한 걸음씩 옮기고, 간 방향으로 몸을 돌린다.
 * 우클릭을 누르고 있으면 목표점이 커서를 따라 갱신되어 계속 이동한다.
 *
 * 모델은 자기 Suspense 경계 안에서 불러온다 — 이동·회전은 모델을 기다리지 않고 그대로 돈다.
 */
export function Character() {
  const ref = useRef<Group>(null)
  const model = useRef<CharacterModelHandle>(null)
  const heading = useRef(0)
  const position = useCameraStore((s) => s.position)
  const target = useCameraStore((s) => s.target)
  // 탈것에 탄 동안에는 감춘다. 위치는 그대로 도므로 카메라는 평소처럼 따라간다.
  const hidden = useCameraStore((s) => s.hidden)
  const { facing, turnSeconds, height, walkRate, brightness } = useCharacterStore(
    (s) => s.placement,
  )

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
        position.add(_step.subVectors(target, position).normalize().multiplyScalar(step))
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

    _moved.subVectors(position, _prev)
    const group = ref.current
    if (group) {
      group.position.set(position.x, 0, position.z)
      faceMoveDirection(group, _moved, heading, facing, turnSeconds, delta)
      // 밖에서 넘긴 방향이 있으면 목표 각을 그것으로 덮는다. **간 방향보다 나중에** 놓아야 한다 —
      // 도착한 그 프레임은 아직 걸음이 남아 있어, 먼저 놓으면 진행 방향이 도로 덮어 신호가 사라진다.
      const face = takeFacePoint()
      if (face) heading.current = headingTo(position.x, position.z, face.x, face.z, facing)
    }
    // 이번 프레임 실제 이동 속도(유닛/초). 걷기 동작과 디버그 표시가 함께 본다.
    const speed = delta > 0 ? _moved.length() / delta : 0
    model.current?.applyMotion(speed)
    useCameraStore.getState().motion.speed = speed
  })

  return (
    <group ref={ref} visible={!hidden}>
      {/* 경계를 자기 안에 둔다. 밖에 두면 모델을 받는 동안 곁의 것들이 함께 사라졌다 돌아온다. */}
      <Suspense fallback={null}>
        <CharacterModel
          ref={model}
          motion="run"
          baseSpeed={MOVE_SPEED}
          height={height}
          walkRate={walkRate}
          brightness={brightness}
          // 종이와 같이 그린 색이 그대로 나와야 한다(DECISIONS 010).
          toneMapped={false}
        />
      </Suspense>
    </group>
  )
}
