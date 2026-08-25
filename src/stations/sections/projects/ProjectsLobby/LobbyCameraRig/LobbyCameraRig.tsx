import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type PerspectiveCamera, Vector3 } from 'three'
import gsap from 'gsap'
import { useLobbyGeometryStore } from '../../../../../state/useLobbyGeometryStore'
import { useLobbyPageStore } from '../../../../../state/useLobbyPageStore'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import { useLobbyTriggerStore } from '../../../../../state/useLobbyTriggerStore'
import {
  LOBBY_CAMERA_LIMIT,
  LOBBY_START,
  LOBBY_TRIGGER_FOCUS,
} from '../ProjectsLobby.constants'
import { LOBBY_BOOK_TRIGGER } from '../LobbyBook'

/** 화면 기준 오른쪽·위를 구할 때 쓰는 기준 축. */
const WORLD_UP = new Vector3(0, 1, 0)

/** 화면 축을 구할 수 없다고 보는 길이(수직으로 내려다보면 오른쪽 방향이 정해지지 않는다). */
const DEGENERATE = 1e-6

const _anchor = new Vector3()
const _offset = new Vector3()
const _forward = new Vector3()
const _right = new Vector3()
const _up = new Vector3()

/**
 * 자세는 그대로 두고 화면 평면 안에서만 카메라를 옮긴다. 옮길 수 없는 자세면 그냥 둔다.
 * `_offset`은 부르기 전에 채워져 있어야 한다.
 *
 * `strength`는 얼마나 걸지다. 비켜 놓기는 평소 구도를 위한 것이라, 트리거를 보러 도는 동안에는
 * 그만큼 줄여 건다.
 */
function applyShift(
  cam: PerspectiveCamera,
  shiftX: number,
  shiftY: number,
  strength: number,
): void {
  if (!cam.isPerspectiveCamera) return
  if (strength <= 0) return
  if (shiftX === 0 && shiftY === 0) return

  const distance = _offset.length()
  if (distance < DEGENERATE) return

  _forward.copy(_offset).negate().divideScalar(distance)
  _right.crossVectors(_forward, WORLD_UP)
  // 수직으로 내려다보면 오른쪽이 정해지지 않는다. 그때는 비켜 놓지 않는다.
  if (_right.lengthSq() < DEGENERATE) return
  _right.normalize()
  _up.crossVectors(_right, _forward).normalize()

  // 캐릭터가 있는 깊이에서 화면 절반이 덮는 넓이. 카메라를 반대쪽으로 밀면 캐릭터가 그쪽으로 온다.
  const halfHeight = Math.tan(MathUtils.degToRad(cam.fov) / 2) * distance
  const halfWidth = halfHeight * cam.aspect
  cam.position.addScaledVector(_right, -shiftX * halfWidth * strength)
  cam.position.addScaledVector(_up, -shiftY * halfHeight * strength)
}

/**
 * 실내 팔로우 카메라. 캐릭터와의 고정 오프셋을 지키며 따라간다.
 *
 * 다만 **캐릭터를 그대로 따라가지는 않는다.** 방이 좁아 그대로 따라가면 화면이 계속 흔들리므로,
 * 제한을 건 기준점(`LOBBY_CAMERA_LIMIT`)을 따라간다. 자세를 그 점으로 잡아 각도·구도는 그대로이고
 * 캐릭터만 화면 안에서 움직인다.
 *
 * 트리거를 열면 **그쪽을 본다.** 진행도 하나를 굴려 평소 자세와 포커스 자세를 섞으므로,
 * 자리와 바라보는 점이 함께 움직여 도는 도중에도 구도가 어긋나지 않는다.
 *
 * 맵(`CameraRig`)과 달리 **원근 카메라**다. 종이 위를 내려다보는 맵은 원근 왜곡이 없어야 하지만,
 * 실내는 깊이가 보여야 방으로 읽힌다. 그래서 거리가 크기를 바꾸고, 오프셋 길이가 곧 구도가 된다.
 *
 * 오프셋은 각도와 거리를 정하고, 비켜 놓기(`shift`)는 구도를 정한다 —
 * **캐릭터를 화면 한가운데에 못 박지 않는다.** 화면 평면 안에서 카메라를 옮기면 자세는 그대로 두고
 * 캐릭터가 원하는 자리로 온다. 옮길 거리는 **캐릭터가 있는 깊이에서의 화면 반크기**로 재는데,
 * 원근에서는 그 크기가 거리에 따라 달라지기 때문이다.
 *
 * **화각도 여기서 맞춘다.** Canvas의 `camera` prop은 만들 때 한 번만 먹으므로,
 * 그러지 않으면 개발용 HUD에서 화각만 조절이 안 된다.
 */
export function LobbyCameraRig() {
  const position = useInteriorStore((s) => s.position)
  const camera = useLobbyPageStore((s) => s.camera)
  const activeId = useLobbyTriggerStore((s) => s.activeId)
  const triggers = useLobbyGeometryStore((s) => s.triggers)
  const tuning = useLobbyPageStore((s) => s.trigger)

  /** 포커스로 넘어간 정도(0~1). 자리와 바라보는 점을 이 하나로 섞는다. */
  const blend = useRef({ value: 0 })
  const focusPoint = useRef(new Vector3())
  const focusOffset = useRef(new Vector3())
  /** 포커스 구도 — 대상을 화면 한가운데에서 비켜 놓는 정도. */
  const focusShift = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const trigger = activeId ? triggers[activeId] : undefined
    // 책은 HUD로 맞추므로 튜닝 값을 먼저 본다. 나머지 트리거는 상수 그대로다.
    const focus =
      activeId === LOBBY_BOOK_TRIGGER
        ? {
            offset: [tuning.bookX, tuning.bookY, tuning.bookZ] as const,
            shift: { x: tuning.bookShiftX, y: tuning.bookShiftY },
          }
        : activeId
          ? LOBBY_TRIGGER_FOCUS[activeId]
          : undefined

    // 볼 자리가 정해진 트리거만 카메라를 돌린다. 닫힐 때는 마지막 자리를 그대로 둬야 되돌아가는 길이 이어진다.
    if (trigger && focus) {
      focusPoint.current.set(trigger.x, trigger.y, trigger.z)
      focusOffset.current.set(focus.offset[0], focus.offset[1], focus.offset[2])
      focusShift.current = focus.shift
    }

    const tween = gsap.to(blend.current, {
      value: trigger && focus ? 1 : 0,
      duration: tuning.focusSeconds,
      ease: 'power2.inOut',
    })
    return () => {
      tween.kill()
    }
  }, [activeId, triggers, tuning])

  useFrame((state) => {
    const cam = state.camera as PerspectiveCamera

    // 화면 반크기가 화각에서 나오므로 비켜 놓기보다 먼저 맞춘다.
    if (cam.isPerspectiveCamera && cam.fov !== camera.fov) {
      cam.fov = camera.fov
      cam.updateProjectionMatrix()
    }

    // 따라갈 기준점. 캐릭터를 그대로 따라가지 않고 제한 안에서만 움직인다.
    // 깊이는 절반 지점을 **넘어선 만큼**에만 비율이 걸려, 그 앞에서는 시작 자리에 묶인다.
    _anchor.set(
      MathUtils.clamp(
        position.x,
        LOBBY_START[0] - LOBBY_CAMERA_LIMIT.x,
        LOBBY_START[0] + LOBBY_CAMERA_LIMIT.x,
      ),
      // 높이는 그대로 따라간다. 계단을 오르면 카메라도 함께 올라야 방이 화면에 남는다.
      position.y,
      LOBBY_START[1] +
        Math.min(0, position.z - LOBBY_CAMERA_LIMIT.followZ) * LOBBY_CAMERA_LIMIT.followRate,
    )

    _offset.set(camera.x, camera.y, camera.z)

    // 트리거를 보는 만큼 기준점과 오프셋을 그쪽으로 섞는다. 둘을 같은 진행도로 굴려야
    // 도는 도중에 바라보는 점만 앞서가거나 하지 않는다.
    const focus = blend.current.value
    if (focus > 0) {
      _anchor.lerp(focusPoint.current, focus)
      _offset.lerp(focusOffset.current, focus)
    }

    // 자세는 **기준점을 바라보는** 자리에서 잡는다. 비켜 놓기는 그 뒤에 얹어야
    // 각도는 건드리지 않고 구도만 바뀐다.
    cam.position.copy(_anchor).add(_offset)
    cam.lookAt(_anchor)

    // 구도는 둘을 진행도로 주고받는다 — 평소 것이 빠지는 만큼 포커스 것이 들어온다.
    // 대상을 바라보는 카메라라, 이것이 없으면 대상이 화면 정중앙에 박혀 옮길 수가 없다.
    applyShift(cam, camera.shiftX, camera.shiftY, 1 - focus)
    applyShift(cam, focusShift.current.x, focusShift.current.y, focus)

    // 비켜 놓기까지 끝난 **최종 자세**를 행렬에 반영한다. `lookAt`이 옮기기 전 자리로 이미 굳혀 둬서,
    // 이대로 두면 같은 프레임에 카메라를 읽는 쪽(조준 레이캐스트)이 옮기기 전 자리를 본다.
    cam.updateMatrixWorld()
  })

  return null
}
