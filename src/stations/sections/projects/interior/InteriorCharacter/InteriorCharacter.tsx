import { useRef } from 'react'
import { type Mesh, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { useThemeStore } from '../../../../../state/useThemeStore'
import { themes } from '../../../../../theme/themes'
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

/**
 * 실내의 임시 캐릭터. 맵과 같이 매 프레임 목표점을 향해 고정 속도로 한 걸음씩 옮긴다.
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
  const ref = useRef<Mesh>(null)
  const mode = useThemeStore((s) => s.mode)
  const theme = themes[mode]
  const position = useInteriorStore((s) => s.position)
  const target = useInteriorStore((s) => s.target)

  useFrame((_, delta) => {
    // 덮여 있는 동안에는 세워 둔다. 보이지도 않는 화면에서 걸어가면 열렸을 때 엉뚱한 자리에 서 있다.
    const covered = isSceneCovered(useSceneTransitionStore.getState().phase)

    _next.copy(position)
    const dx = target.x - position.x
    const dz = target.z - position.z
    const dist = Math.hypot(dx, dz)

    if (covered) {
      target.copy(position)
    } else if (dist > ARRIVE_EPSILON) {
      const step = INTERIOR_MOVE_SPEED * Math.min(delta, MAX_DELTA)
      const ratio = dist <= step ? 1 : step / dist
      _next.set(position.x + dx * ratio, position.y, position.z + dz * ratio)
      // 남쪽 한계에서 자른다. z만 되돌리므로 그 선을 따라 좌우로는 그대로 걸어진다.
      // 자르는 것이 **밀어내기보다 먼저**다. 밀려난 뒤에 자르면 두 규칙이 서로 되돌린다.
      if (southLimit !== undefined && _next.z > southLimit) _next.z = southLimit
      // 벽·난간 밖으로 밀어낸다. 걸음을 옮긴 뒤에 되돌리므로 벽을 따라 미끄러진다.
      pushOutOfInteriorBlockers(_next, INTERIOR_CHARACTER_RADIUS, INTERIOR_CHARACTER_SIZE[1])
    }

    const ground = interiorFloorHeight(_next.x, _next.z, position.y)
    if (ground === null) {
      // 허공이라 디딜 곳이 없다. 걸음을 물리고 목표점도 거둔다 — 그러지 않으면 매 프레임 다시 민다.
      target.copy(position)
    } else {
      position.set(_next.x, ground, _next.z)
    }

    ref.current?.position.set(position.x, position.y + INTERIOR_CHARACTER_SIZE[1] / 2, position.z)
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[...INTERIOR_CHARACTER_SIZE]} />
      <meshStandardMaterial color={theme.colors.accent} />
    </mesh>
  )
}
