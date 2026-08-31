import { useCallback, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { isMovementBlocked, useCameraStore } from '../../state/useCameraStore'
import {
  beginTouchPress,
  endTouchDrag,
  isOverTouchTarget,
  isTouchDragging,
} from '../touchMove'
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
  const { camera, gl } = useThree()
  const setTarget = useCameraStore((s) => s.setTarget)
  const markMoved = useCameraStore((s) => s.markMoved)
  const holding = useRef(false)
  const pointer = useRef(new Vector2())
  const pressTime = useRef(0)
  /** 손가락이 닿았지만 아직 탭인지 끌기인지 정해지지 않은 상태. */
  const pendingTouch = useRef(false)
  /** 손가락의 화면 좌표(px). 탭의 범위를 넘었는지 재는 데 쓴다. */
  const touchAt = useRef({ x: 0, y: 0 })
  /** 탭으로 끝나 그 자리까지 한 번 걸어가야 하는지. 다음 프레임에 목표점을 잡는다. */
  const tapWalk = useRef(false)

  // 뗐을 때(캔버스 밖 포함) 이동 갱신 중단. 손가락이면 끈 것인지 탭인지도 여기서 가른다.
  useEffect(() => {
    const stop = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        // 걷고 있었으면 뒤따라올 마우스 이벤트를 걸러 낸다.
        if (holding.current) endTouchDrag()
        // 걷기 전에 뗐으면 탭이다. 열 수 있는 것 위였으면 여는 쪽에 넘기고, 빈 바닥이면 그리로 간다.
        else if (pendingTouch.current && !isMovementBlocked()) {
          const canvas = gl.domElement
          if (!isOverTouchTarget(camera, canvas, e.clientX, e.clientY)) {
            tapWalk.current = true
            markMoved()
          }
        }
      }
      holding.current = false
      pendingTouch.current = false
    }
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [camera, gl, markMoved])

  // 누르고 있는 동안 매 프레임 현재 커서 밑 바닥 지점을 목표로 갱신 → 계속 이동
  useFrame(() => {
    // 탭으로 끝났으면 그 자리를 목표로 한 번 잡는다. 뒤따라가지 않으므로 딱 거기까지만 걷는다.
    if (tapWalk.current) {
      tapWalk.current = false
      _raycaster.setFromCamera(pointer.current, camera)
      if (_raycaster.ray.intersectPlane(_groundPlane, _hit)) setTarget(_hit)
    }

    // 손가락은 닿는 순간 걷지 않는다. 오래 누르거나 끌기 시작하면 그때부터 이동으로 넘어간다.
    if (pendingTouch.current) {
      if (isMovementBlocked()) return
      if (!isTouchDragging(touchAt.current.x, touchAt.current.y)) return
      pendingTouch.current = false
      holding.current = true
      // 넘어온 순간부터 손가락을 따라간다.
      // 이미 탭의 범위를 넘었으므로 다시 기다리지 않는다.
      pressTime.current = 0
      markMoved()
    }
    if (!holding.current) return
    // 이동이 잠긴 동안에는 목표점을 갱신하지 않는다(홀드 중 상태가 바뀌었을 수도 있으므로 매 프레임 확인).
    if (isMovementBlocked()) return
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
  // 마우스가 없는 기기에서는 터치 홀드가 그 자리를 대신하며 규칙은 같다.
  // 스테이션이 활성이어도 이동은 그대로 받는다 — 걸어서 멀어지면 스토어가 알아서 종료를 건다.
  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const touch = e.pointerType === 'touch'
      if (!touch && e.button !== 2) return

      // 진입 애니메이션이나 맵 연출 중에는 이동 입력을 받지 않는다.
      if (isMovementBlocked()) return

      e.stopPropagation()
      pointer.current.copy(e.pointer)

      // 손가락은 버튼이 하나뿐이라 누르기와 이동이 겹친다. **열 수 있는 것 위에서만** 기다렸다가
      // 탭인지 끌기인지 가르고, 빈 바닥이면 겹칠 것이 없으므로 곧바로 걷는다.
      if (touch) {
        const native = e.nativeEvent
        touchAt.current = { x: native.clientX, y: native.clientY }
        beginTouchPress(native.clientX, native.clientY)
        if (isOverTouchTarget(camera, gl.domElement, native.clientX, native.clientY)) {
          pendingTouch.current = true
          return
        }
      }

      holding.current = true
      pressTime.current = performance.now()
      // 클릭 즉시 정확한 클릭 지점을 목표로 고정 → 짧은 클릭 정확도 보장
      setTarget(e.point)
      // 잠금을 지나 실제로 받아들인 입력만 센다 — 조작을 익혔다는 신호로 안내가 걷힌다.
      markMoved()
    },
    [camera, gl, setTarget, markMoved],
  )

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointer.current.copy(e.pointer)
    if (e.pointerType === 'touch') {
      touchAt.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    }
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
