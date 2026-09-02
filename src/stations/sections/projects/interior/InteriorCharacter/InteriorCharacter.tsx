import { Suspense, useRef } from 'react'
import { Vector3 } from 'three'
import type { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import {
  CharacterModel,
  faceMoveDirection,
  headingTo,
  takeFacePoint,
} from '../../../../../scene/CharacterModel'
import type { CharacterModelHandle } from '../../../../../scene/CharacterModel'
import { useCharacterStore } from '../../../../../state/useCharacterStore'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { interiorFloorHeight, pushOutOfInteriorBlockers } from '../Interior.collision'
import {
  INTERIOR_CHARACTER_RADIUS,
  INTERIOR_CHARACTER_SIZE,
  INTERIOR_MOVE_SPEED,
} from '../Interior.constants'
import type { InteriorCharacterProps } from './InteriorCharacter.types'

/** 목표점에 닿았다고 보는 거리. */
const ARRIVE_EPSILON = 1e-4

/**
 * 한 프레임에 인정하는 최대 시간(초).
 *
 * 탭을 비웠다 돌아오면 프레임 간격이 통째로 밀려 들어와, 한 걸음이 벽 두께를 넘어선다.
 * 밀어내기는 옮긴 자리만 보므로 그런 걸음은 벽을 지나쳐 버린다.
 */
const MAX_DELTA = 1 / 20

const _next = new Vector3()
const _moved = new Vector3()

/**
 * 실내의 캐릭터. 맵과 같이 매 프레임 목표점을 향해 고정 속도로 한 걸음씩 옮기고, 간 방향으로 몸을 돌린다.
 *
 * 다른 점은 **높이**다. 옮긴 자리에서 밟을 바닥을 찾아 y를 거기에 맞추므로,
 * 경사 콜라이더로 만들어 둔 계단을 미끄러지듯 오르내린다.
 * 밟을 것이 없으면 걸음을 물린다 — 밟을 바닥이 있는 곳까지가 곧 갈 수 있는 곳이라,
 * 맵처럼 따로 이동 경계를 두지 않는다.
 *
 * `southLimit`을 주면 그 선보다 남쪽으로 나가지 못한다. 로비처럼 한쪽 면이 벽 없이 열려 있어
 * 밟을 바닥이 계속 이어지는 방에서 쓴다.
 */
export function InteriorCharacter({ southLimit }: InteriorCharacterProps) {
  const ref = useRef<Group>(null)
  const model = useRef<CharacterModelHandle>(null)
  const heading = useRef(0)
  const position = useInteriorStore((s) => s.position)
  const target = useInteriorStore((s) => s.target)
  // 정면·도는 시간·동작 배속은 모델의 성질이라 맵과 같은 값을 보고, 크기·밝기만 방이 정한다.
  const { facing, turnSeconds, walkRate } = useCharacterStore((s) => s.placement)
  const { height, brightness } = useCharacterStore((s) => s.interior)

  useFrame((_, delta) => {
    const walk = useInteriorStore.getState()
    const covered = isSceneCovered(useSceneTransitionStore.getState().phase)
    const dt = Math.min(delta, MAX_DELTA)

    _next.copy(position)
    const dx = target.x - position.x
    const dz = target.z - position.z
    const dist = Math.hypot(dx, dz)

    // 덮여 있는 동안에는 세워 둔다. 보이지도 않는 화면에서 걸어가면 열렸을 때 엉뚱한 자리에 서 있다.
    // **연출 이동은 예외로 이어 간다** — 화면이 좁아지는 동안에도 걸음이 계속돼야
    // 들어가는 것과 덮이는 것이 한 동작으로 보인다.
    if (covered && !walk.walking) {
      target.copy(position)
    } else if (dist > ARRIVE_EPSILON) {
      // 연출 이동은 걸음 속도를 따로 줄 수 있다. 주지 않았으면 평소 속도다.
      const moveSpeed = walk.walkSpeed ?? INTERIOR_MOVE_SPEED
      const step = moveSpeed * dt
      const ratio = dist <= step ? 1 : step / dist
      _next.set(position.x + dx * ratio, position.y, position.z + dz * ratio)
      // 남쪽 한계에서 자른다. z만 되돌리므로 그 선을 따라 좌우로는 그대로 걸어진다.
      // 자르는 것이 **밀어내기보다 먼저**다. 밀려난 뒤에 자르면 두 규칙이 서로 되돌린다.
      if (southLimit !== undefined && _next.z > southLimit) _next.z = southLimit
      // 벽·난간 밖으로 밀어낸다. 걸음을 옮긴 뒤에 되돌리므로 벽을 따라 미끄러진다.
      pushOutOfInteriorBlockers(_next, INTERIOR_CHARACTER_RADIUS, INTERIOR_CHARACTER_SIZE[1])
    }

    // 몸이 도는 것은 평면에서만 본다. 계단을 오르며 y만 바뀐 프레임에 방향이 0으로 튀지 않게.
    _moved.set(_next.x - position.x, 0, _next.z - position.z)

    const ground = interiorFloorHeight(_next.x, _next.z, position.y)
    if (ground === null) {
      // 허공이라 디딜 곳이 없다. 걸음을 물리고 목표점도 거둔다 — 그러지 않으면 매 프레임 다시 민다.
      target.copy(position)
      _moved.set(0, 0, 0)
    } else {
      position.set(_next.x, ground, _next.z)
    }

    // 연출 이동은 **도착 판정을 여기서** 한다. 기다리는 쪽은 신호가 꺼지는 것만 보면 된다.
    // 더 갈 수 없어 목표점을 거둔 경우도 끝으로 친다 — 그러지 않으면 영영 기다린다.
    const left = Math.hypot(target.x - position.x, target.z - position.z)
    if (walk.walking && left <= ARRIVE_EPSILON) walk.endWalk()

    const group = ref.current
    if (group) {
      group.position.copy(position)
      faceMoveDirection(group, _moved, heading, facing, turnSeconds, dt)
      // 밖에서 넘긴 방향이 있으면 목표 각을 그것으로 덮는다. **간 방향보다 나중에** 놓아야 한다 —
      // 도착한 그 프레임은 아직 걸음이 남아 있어, 먼저 놓으면 진행 방향이 도로 덮어 신호가 사라진다.
      const face = takeFacePoint()
      if (face) heading.current = headingTo(position.x, position.z, face.x, face.z, facing)
    }
    // 이번 프레임 실제 걸음 속도(유닛/초). 걷기 동작이 이 값을 보고 재생·배속을 정한다.
    model.current?.applyMotion(dt > 0 ? _moved.length() / dt : 0)
  })

  return (
    <group ref={ref}>
      {/* 경계를 자기 안에 둔다. 밖에 두면 모델을 받는 동안 방이 함께 사라졌다 돌아온다. */}
      <Suspense fallback={null}>
        <CharacterModel
          ref={model}
          motion="run"
          baseSpeed={INTERIOR_MOVE_SPEED}
          height={height}
          walkRate={walkRate}
          brightness={brightness}
          // 실내는 노출로 방 밝기를 잡으므로 캐릭터도 같은 톤 매핑을 타야 방과 따로 놀지 않는다.
          toneMapped
        />
      </Suspense>
    </group>
  )
}
