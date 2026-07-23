import { useCallback, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { useCameraStore } from '../../state/useCameraStore'
import { isMovementLocked, useStationStore } from '../../state/useStationStore'
import { PaperGround } from './PaperGround'

/**
 * 바닥 크기. 이동 범위(CAMERA_BOUNDS)보다 크게 두어 가장자리가 화면에 안 보이게 한다.
 * 최종엔 경계 투명벽을 함께 둔다.
 */
const GROUND_SIZE = 200

/** 클릭과 홀드를 구분하는 임계 시간(ms). 이보다 짧게 누르면 클릭(정확 도착), 길면 홀드(커서 추적). */
const HOLD_THRESHOLD = 180

const _raycaster = new Raycaster()
const _groundPlane = new Plane(new Vector3(0, 1, 0), 0)
const _hit = new Vector3()

export function World() {
  const { camera } = useThree()
  const setTarget = useCameraStore((s) => s.setTarget)
  const holding = useRef(false)
  const pointer = useRef(new Vector2())
  const pressTime = useRef(0)

  // 우클릭을 뗐을 때(캔버스 밖 포함) 이동 갱신 중단
  useEffect(() => {
    const stop = () => {
      holding.current = false
    }
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [])

  // 누르고 있는 동안 매 프레임 현재 커서 밑 바닥 지점을 목표로 갱신 → 계속 이동
  useFrame(() => {
    if (!holding.current) return
    // 이동이 잠긴 동안에는 목표점을 갱신하지 않는다(홀드 중 상태가 바뀌었을 수도 있으므로 매 프레임 확인).
    if (isMovementLocked(useStationStore.getState().phase)) return
    // 홀드 임계 시간 전에는 커서 재조준을 하지 않는다.
    // 짧은 클릭에서 캐릭터가 움직이며 커서 밑 월드 지점이 앞으로 밀려
    // 목표점이 클릭 지점을 넘어서는(오버슛) 것을 막는다.
    // 임계 이후에만 커서를 계속 따라가 홀드 이동으로 전환.
    if (performance.now() - pressTime.current < HOLD_THRESHOLD) return
    _raycaster.setFromCamera(pointer.current, camera)
    if (_raycaster.ray.intersectPlane(_groundPlane, _hit)) {
      setTarget(_hit)
    }
  })

  // 우클릭 누름/홀드로 이동. 좌클릭은 스테이션 상세 내부 요소 상호작용용이라 여기서 쓰지 않는다.
  // 스테이션이 활성이어도 이동은 그대로 받는다 — 걸어서 멀어지면 스토어가 알아서 종료를 건다.
  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.button !== 2) return

      // 진입 애니메이션 중에는 이동 입력을 받지 않는다.
      if (isMovementLocked(useStationStore.getState().phase)) return

      e.stopPropagation()
      pointer.current.copy(e.pointer)
      holding.current = true
      pressTime.current = performance.now()
      // 클릭 즉시 정확한 클릭 지점을 목표로 고정 → 짧은 클릭 정확도 보장
      setTarget(e.point)
    },
    [setTarget],
  )

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointer.current.copy(e.pointer)
  }, [])

  return (
    <group>
      <PaperGround
        size={GROUND_SIZE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />
    </group>
  )
}
