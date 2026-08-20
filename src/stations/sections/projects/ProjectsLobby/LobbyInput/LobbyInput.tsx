import { useCallback, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { useLobbyStore } from '../../../../../state/useLobbyStore'
import { useLobbyTriggerStore } from '../../../../../state/useLobbyTriggerStore'
import {
  isSceneCovered,
  useSceneTransitionStore,
} from '../../../../../state/useSceneTransitionStore'
import { getLobbyWalkables, snapToLobbyStepZ } from '../ProjectsLobby.collision'
import { LOBBY_STAIR_NAMES } from '../ProjectsLobby.constants'

/** 클릭과 홀드를 구분하는 임계 시간(ms). 맵과 같은 값이라 조작감이 이어진다. */
const HOLD_THRESHOLD = 180

const _raycaster = new Raycaster()
const _pointer = new Vector2()
/** 조준이 바닥 콜라이더를 빗나갔을 때 쏘는 수평 평면. 높이는 캐릭터 발밑을 따라간다. */
const _plane = new Plane(new Vector3(0, 1, 0), 0)
const _hit = new Vector3()

/**
 * 지금 이동 입력을 받지 않는 상태인지.
 * 화면이 덮여 있거나, 트리거를 보고 있어 카메라가 캐릭터를 떠나 있을 때다.
 */
const isMovementBlocked = () =>
  isSceneCovered(useSceneTransitionStore.getState().phase) ||
  useLobbyTriggerStore.getState().activeId !== null

/**
 * 로비의 이동 입력 — 맵과 같이 **우클릭 홀드**다.
 *
 * 맵은 바닥 판 하나에 R3F 포인터 핸들러를 걸지만, 여기서는 밟는 바닥이 모델 안에 흩어진
 * 콜라이더 여럿이라 캔버스 이벤트를 직접 듣고 그 목록에 쏜다.
 * 빗나가면 **캐릭터가 선 높이의 수평 평면**으로 방향을 잡는다 — 실내는 화면 대부분이 벽·천장이라
 * 바닥만 조준 대상으로 두면 홀드 중 목표점이 얼어붙는다.
 * 갈 수 없는 곳은 걷는 쪽이 맡는다 — 허공이면 걸음을 물리고, 벽·난간은 밀려나며 따라 미끄러진다.
 *
 * 그리는 것은 없다.
 */
export function LobbyInput() {
  const { camera, gl } = useThree()
  const position = useLobbyStore((s) => s.position)
  const setTarget = useLobbyStore((s) => s.setTarget)
  const holding = useRef(false)
  const pressTime = useRef(0)

  /** 지금 커서가 가리키는 지점을 목표로 삼는다. 밟을 바닥이 먼저이고, 없으면 평면으로 방향만 잡는다. */
  const aim = useCallback(() => {
    _raycaster.setFromCamera(_pointer, camera)
    const walkable = _raycaster.intersectObjects(getLobbyWalkables(), false)[0]
    if (walkable) {
      _hit.copy(walkable.point)
      // 계단에서는 찍은 자리 그대로가 아니라 가장 가까운 단 가운데에 선다. 좌우는 찍은 그대로다.
      if (LOBBY_STAIR_NAMES.includes(walkable.object.name)) _hit.z = snapToLobbyStepZ(_hit.z)
      setTarget(_hit)
      return
    }
    // 평면식이 `법선·점 + constant = 0`이라, y = 발밑 높이인 평면의 상수는 그 높이의 음수다.
    _plane.constant = -position.y
    if (_raycaster.ray.intersectPlane(_plane, _hit)) setTarget(_hit)
  }, [camera, position, setTarget])

  useEffect(() => {
    const canvas = gl.domElement

    const track = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 2) return
      if (isMovementBlocked()) return
      track(e)
      holding.current = true
      pressTime.current = performance.now()
      // 누른 즉시 그 지점을 목표로 고정한다 — 짧게 누른 클릭이 정확히 그리로 간다.
      aim()
    }

    const stop = () => {
      holding.current = false
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', track)
    // 캔버스 밖에서 떼도 멈춘다.
    window.addEventListener('pointerup', stop)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', track)
      window.removeEventListener('pointerup', stop)
    }
  }, [aim, gl])

  // 누르고 있는 동안 커서 밑을 계속 따라간다.
  // 임계 시간 전에는 다시 조준하지 않는다 — 짧은 클릭에서 캐릭터가 움직이며 커서 밑 지점이 밀려
  // 목표점이 클릭 지점을 넘어서는 것을 막는다.
  useFrame(() => {
    if (!holding.current) return
    if (isMovementBlocked()) return
    if (performance.now() - pressTime.current < HOLD_THRESHOLD) return
    aim()
  })

  return null
}
