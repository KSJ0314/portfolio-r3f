import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  type Group,
  MathUtils,
  type Mesh,
  type MeshStandardMaterial,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import gsap from 'gsap'
import { useCameraStore } from '../../../state/useCameraStore'
import {
  type ProjectsCarPlacement,
  useMapDecorationsStore,
} from '../../../state/useMapDecorationsStore'
import { ClickMarker } from '../../ClickMarker'
import { usePointerCursor } from '../../usePointerCursor'
import { useAfterStation } from '../../useAfterStation'
import {
  PROJECTS_CAR_AFTER_STATION,
  PROJECTS_CAR_HEADING,
  PROJECTS_CAR_URL,
} from './ProjectsCar.constants'
import { useReturnOnClose } from './ProjectsCar.hooks'
import { disposeCar, splitCar } from './ProjectsCar.wheels'

/**
 * 연출의 단계.
 * `ready`에서 차를 누르면 캐릭터가 걸어오고(`walking`), 닿으면 태우고(`boarding`) 달린다(`driving`).
 * 내려주고 사라지면(`leaving`) 등장 자리에 다시 나타나 `ready`로 돌아간다.
 */
type Stage = 'ready' | 'walking' | 'boarding' | 'driving' | 'leaving'

const _raycaster = new Raycaster()
const _pointer = new Vector2()
const _stand = new Vector3()
const _side = new Vector3()
const UP = new Vector3(0, 1, 0)

/**
 * 프로젝트 구역으로 데려다주는 자동차 — Career를 열었다 닫으면 종이 위에 나타난다.
 *
 * 나타난 뒤에는 이동을 잠그지 않는다. **차를 눌러야** 출발하므로 그 전까지는 평소처럼 돌아다녀야 한다.
 * 누르면 캐릭터가 차 옆으로 걸어가고, 닿으면 감춰지며 차가 한 번 눌렸다 펴져 탑승을 알린다.
 * 문이 없는 모델이라 여는 연출은 만들지 않는다.
 */
export function ProjectsCar() {
  const appeared = useAfterStation(PROJECTS_CAR_AFTER_STATION)
  const placement = useMapDecorationsStore((s) => s.car)
  const redraw = useMapDecorationsStore((s) => s.carRedraw)

  // 걸어 나가 닫으면 캐릭터가 멀리 있다. 차가 화면 안에서 나타나도록 차 앞자리로 데려온다.
  useReturnOnClose(appeared)

  if (!appeared) return null
  // 다시 재생(HUD)은 새로 마운트해 연출을 처음부터 돌린다.
  return <CarRide key={redraw} placement={placement} />
}

function CarRide({ placement }: { placement: ProjectsCarPlacement }) {
  const { camera, gl } = useThree()
  const { scene } = useGLTF(PROJECTS_CAR_URL)
  const markArrived = useMapDecorationsStore((s) => s.markCarArrived)
  const arrived = useMapDecorationsStore((s) => s.carArrived)

  const [stage, setStage] = useState<Stage>('ready')
  // 누를 수 있는 동안에만 손가락 커서를 붙인다. 훅이 되돌리는 일까지 맡는다.
  const cursor = usePointerCursor(stage === 'ready')
  const stageRef = useRef<Stage>('ready')
  const advance = useCallback((next: Stage) => {
    stageRef.current = next
    setStage(next)
  }, [])

  // 캐시에 든 원본을 건드리지 않도록 지오메트리는 새로 만든다. 재질은 아래에서 선언적으로 만든다.
  const car = useMemo(() => splitCar(scene), [scene])
  useEffect(() => () => (car ? disposeCar(car) : undefined), [car])

  const place = useRef<Group>(null)
  const bounce = useRef<Group>(null)
  const wheels = useRef<(Mesh | null)[]>([])
  const materials = useRef<(MeshStandardMaterial | null)[]>([])
  const at = useRef({ x: placement.startX, z: placement.startZ })
  const roll = useRef(0)
  const fade = useRef({ value: 0 })

  const locked = useRef(false)
  const tweens = useRef<gsap.core.Tween[]>([])
  const unsubscribe = useRef<() => void>(() => {})

  // 잠금은 거는 것과 푸는 것을 짝지어 둔다. 풀 기회를 놓치면 이동이 영영 막힌다.
  const acquireLock = useCallback(() => {
    if (locked.current) return
    locked.current = true
    useCameraStore.getState().lockMovement()
  }, [])

  const releaseLock = useCallback(() => {
    if (!locked.current) return
    locked.current = false
    useCameraStore.getState().unlockMovement()
  }, [])

  /**
   * 지금 투명도를 재질들에 옮긴다.
   *
   * 반투명(`transparent`)이 아니라 `alphaHash`로 옅게 만든다. 반투명하게 두면 옅어지는 동안
   * 차체 너머의 바퀴가 그대로 비쳐 속이 뚫려 보인다. 알파 해시는 깊이를 쓰는 불투명 통과라
   * 앞뒤 가림이 그대로 유지되고, 옅어지는 것은 픽셀을 흩어 덜어내는 것으로 표현된다.
   *
   * 투명도는 prop으로 주지 않는다 — 단계가 바뀌어 다시 렌더될 때마다 prop 값으로 되돌아가 연출이 끊긴다.
   */
  const applyFade = useCallback(() => {
    for (const material of materials.current) {
      if (material) material.opacity = fade.current.value
    }
  }, [])

  const fadeTo = useCallback(
    (value: number, onComplete?: () => void) => {
      const tween = gsap.to(fade.current, {
        value,
        duration: placement.fadeSeconds,
        ease: 'power1.out',
        onUpdate: applyFade,
        onComplete,
      })
      tweens.current.push(tween)
    },
    [applyFade, placement.fadeSeconds],
  )

  // 그 자리에 페이드로 나타난다. 첫 프레임이 불투명하게 찍히지 않도록 그리기 전에 0을 적용한다.
  useLayoutEffect(() => {
    applyFade()
    fadeTo(1)
    // 나타나는 것은 마운트될 때 한 번이라, 페이드 시간이 바뀌어도 다시 재생하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 언마운트될 때 잠금·감춤·구독이 남지 않게 한다.
  useEffect(
    () => () => {
      for (const tween of tweens.current) tween.kill()
      tweens.current = []
      unsubscribe.current()
      useCameraStore.getState().setHidden(false)
      useCameraStore.getState().endWalk()
      releaseLock()
    },
    [releaseLock],
  )

  /** 차가 한 번 눌렸다 펴지고, 잠시 섰다가 출발한다. */
  const depart = useCallback(() => {
    const group = bounce.current
    if (!group) {
      advance('driving')
      return
    }
    const tween = gsap.to(group.position, {
      y: -placement.bounce,
      duration: placement.bounceSeconds / 2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      // 다 펴지자마자 떠나면 올라오는 것이 눈에 들어오지 않아 잠시 세워 둔다.
      onComplete: () => {
        tweens.current.push(gsap.delayedCall(placement.boardPause, () => advance('driving')))
      },
    })
    tweens.current.push(tween)
  }, [advance, placement.bounce, placement.bounceSeconds, placement.boardPause])

  /** 캐릭터가 닿으면 감추고, 카메라를 차로 옮긴 뒤 출발 연출로 넘어간다. */
  const board = useCallback(() => {
    advance('boarding')
    const { setHidden, walkTo } = useCameraStore.getState()
    setHidden(true)

    // 자리를 차로 곧장 옮기면 카메라가 그만큼 건너뛴다. 감춘 캐릭터를 차까지 걸리면
    // 카메라가 평소 팔로우 그대로 미끄러져 따라온다. 걷는 시간은 거리마다 다르므로 도착 신호를 본다.
    walkTo(_stand.set(at.current.x, 0, at.current.z))
    unsubscribe.current = useCameraStore.subscribe((state) => {
      if (state.walking) return
      unsubscribe.current()
      unsubscribe.current = () => {}
      depart()
    })
  }, [advance, depart])

  /** 차를 누르면 캐릭터가 옆자리로 걸어온다. 걷는 시간은 거리마다 달라 도착 신호를 보고 넘어간다. */
  const ride = useCallback(() => {
    if (stageRef.current !== 'ready') return
    advance('walking')
    acquireLock()

    const { walkTo } = useCameraStore.getState()
    walkTo(_stand.set(placement.startX + placement.boardX, 0, placement.startZ + placement.boardZ))

    unsubscribe.current = useCameraStore.subscribe((state) => {
      // 자리에 닿으면 Character가 walking을 끈다. 이펙트 몸통이 아니라 구독 콜백이라 여기서 상태를 바꾼다.
      if (state.walking) return
      unsubscribe.current()
      unsubscribe.current = () => {}
      board()
    })
  }, [advance, acquireLock, board, placement])

  // 좌클릭은 R3F 포인터 이벤트가 아니라 캔버스 mousedown을 직접 듣는다.
  // 우클릭 홀드로 이동하는 중에 좌클릭을 더 누르면 pointerdown이 아예 발생하지 않기 때문이다.
  // 차에 포인터 핸들러를 달지 않으므로 우클릭 이동은 차를 통과해 바닥으로 간다.
  useEffect(() => {
    if (stage !== 'ready') return
    const canvas = gl.domElement
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const group = place.current
      if (!group) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)
      if (_raycaster.intersectObjects(group.children, true).length > 0) ride()
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [stage, camera, gl, ride])

  /**
   * 도착하면 차는 사라지고 캐릭터가 그 자리에 내린다.
   *
   * 사라진 뒤에는 **등장 자리에 다시 나타나** 또 탈 수 있게 한다. 자리를 따로 옮기지 않아도
   * `useFrame`이 주행 중이 아닐 때 등장 자리로 되돌리므로, 옅은 동안 옮겨져 순간이동이 보이지 않는다.
   */
  const arrive = useCallback(() => {
    advance('leaving')
    fadeTo(0, () => {
      useCameraStore.getState().setHidden(false)
      releaseLock()
      markArrived()
      advance('ready')
      fadeTo(1)
    })
  }, [advance, fadeTo, releaseLock, markArrived])

  /**
   * 카메라를 등진 쪽 바퀴는 차체에 가려 보이지 않으므로 두지 않는다.
   * 어느 쪽이 등진 쪽인지는 화면 각도(`followOffset`)에서 구한다 — 신호등이 판을 돌리는 것과 같은 방식이다.
   */
  const visibleWheels = useMemo(() => {
    if (!car) return []
    // 모델 +x(차의 옆구리)가 월드에서 어디를 향하는지 구해 카메라 쪽과 견준다.
    _side.set(1, 0, 0).applyAxisAngle(UP, MathUtils.degToRad(PROJECTS_CAR_HEADING))
    const { followOffset } = useCameraStore.getState()
    const facing = _side.x * followOffset.x + _side.z * followOffset.z
    // 아직 팔로우가 돌지 않아 방향을 모르면 넷 다 둔다.
    if (facing === 0) return car.wheels
    return car.wheels.filter((wheel) => Math.sign(wheel.center.x) === Math.sign(facing))
  }, [car])

  const scale = car ? placement.length / car.length : 1
  // 바퀴 반지름도 같은 배율로 커지므로, 굴림각은 모델 좌표로 재도 월드로 재도 같다.
  const wheelRadius = car ? car.radius * scale : 0
  const axis = car?.axis === 1 ? 'y' : car?.axis === 2 ? 'z' : 'x'

  useFrame((_, delta) => {
    const group = place.current
    if (!group) return

    if (stageRef.current === 'driving') {
      const dx = placement.endX - at.current.x
      const dz = placement.endZ - at.current.z
      const remaining = Math.hypot(dx, dz)
      const step = placement.speed * delta
      if (remaining <= step) {
        at.current.x = placement.endX
        at.current.z = placement.endZ
      } else {
        at.current.x += (dx / remaining) * step
        at.current.z += (dz / remaining) * step
      }
      // 간 거리만큼 구른다. 앞으로 갈 때 바퀴 위쪽이 앞으로 넘어가는 방향이 +다.
      // 배수를 곱하는 이유는 상수에 적어 뒀다 — 그대로 굴리면 각진 면 주기에 걸려 거꾸로 보인다.
      if (wheelRadius > 0) {
        roll.current += (Math.min(step, remaining) / wheelRadius) * placement.wheelSpin
      }

      // 캐릭터를 차에 붙여 옮긴다 — 카메라 팔로우·미니맵·경계가 평소 그대로 돈다.
      const { position, target } = useCameraStore.getState()
      position.set(at.current.x, 0, at.current.z)
      target.copy(position)

      if (remaining <= step) arrive()
    } else if (stageRef.current !== 'leaving') {
      // 아직 출발 전이라 등장 자리에 둔다. HUD로 자리를 옮기면 그대로 따라온다.
      at.current.x = placement.startX
      at.current.z = placement.startZ
    }

    group.position.set(at.current.x, 0, at.current.z)
    for (const wheel of wheels.current) {
      if (wheel) wheel.rotation[axis] = roll.current
    }
    // 캐릭터를 옮기는 일은 카메라 팔로우보다 **먼저** 끝나야 한다. 뒤에 돌면 카메라가 한 프레임씩
    // 뒤처져 달리는 내내 차가 화면 중앙에서 밀린다. 음수 우선순위는 자동 렌더를 뺏지 않는다.
  }, -1)

  if (!car) return null

  return (
    <group ref={place}>
      {/* 누르라는 표시. 차 위에 떠 있고 눌러 출발하면 걷힌다.
          레이캐스트를 막지 않아 표시를 눌러도 차를 누른 것으로 친다.
          한 번 타 본 뒤에는 누를 수 있다는 것을 이미 아니까 다시 내지 않는다. */}
      <ClickMarker
        visible={stage === 'ready' && !arrived}
        y={placement.markerY}
        size={placement.markerSize}
        bob={placement.markerBob}
        bobSeconds={placement.markerBobSeconds}
        spinSeconds={placement.markerSpinSeconds}
        fadeSeconds={placement.fadeSeconds}
      />
      <group ref={bounce}>
        <group rotation={[0, MathUtils.degToRad(PROJECTS_CAR_HEADING), 0]} scale={scale}>
          {/* 포인터 핸들러가 없으면 R3F 이벤트 대상이 아니라 우클릭 이동이 그대로 바닥으로 통과한다. */}
          <mesh geometry={car.body} {...cursor}>
            <meshStandardMaterial
              ref={(material) => {
                materials.current[0] = material
              }}
              map={car.map}
              metalness={0}
              roughness={1}
              alphaHash
            />
          </mesh>
          {visibleWheels.map((wheel, index) => (
            <mesh
              key={index}
              ref={(mesh) => {
                wheels.current[index] = mesh
              }}
              geometry={wheel.geometry}
              position={wheel.center}
            >
              <meshStandardMaterial
                ref={(material) => {
                  materials.current[index + 1] = material
                }}
                map={car.map}
                metalness={0}
                roughness={1}
                alphaHash
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// 필요해진 순간에 받기 시작하면 그때 서스펜드가 걸려 이미 떠 있던 장식들이 사라졌다 돌아온다.
useGLTF.preload(PROJECTS_CAR_URL)
