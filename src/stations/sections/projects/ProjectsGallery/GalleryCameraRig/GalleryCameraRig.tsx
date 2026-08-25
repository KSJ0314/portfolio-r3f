import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type PerspectiveCamera, Vector3 } from 'three'
import gsap from 'gsap'
import { useGalleryFocusStore } from '../../../../../state/useGalleryFocusStore'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { useGalleryPageStore } from '../../../../../state/useGalleryPageStore'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import {
  GALLERY_FOCUS_MARGIN,
  GALLERY_FOCUS_SECONDS,
  GALLERY_MODEL_SCALE,
} from '../ProjectsGallery.constants'

/** 화면 기준 오른쪽·위를 구할 때 쓰는 기준 축. */
const WORLD_UP = new Vector3(0, 1, 0)

/** 화면 축을 구할 수 없다고 보는 길이. */
const DEGENERATE = 1e-6

const _anchor = new Vector3()
const _offset = new Vector3()
const _focusPoint = new Vector3()
const _focusOffset = new Vector3()
const _forward = new Vector3()
const _right = new Vector3()
const _up = new Vector3()

/**
 * 전시 공간 카메라. **좌우로만 따라가고 앞뒤·높이는 고정**이다.
 *
 * 로비(제한된 기준점을 따라가되 계단을 오르면 함께 오른다)와 정반대다 — 여기는 벽 하나에
 * 작품이 늘어선 복도라, 깊이가 얕고 바닥이 평평해 따라갈 것이 좌우뿐이다. 볼 것이 벽에 걸린
 * 작품이므로 바라보는 높이도 액자 쪽에 못 박는다. 구도 규칙이 방마다 다르다는 것이
 * DECISIONS 037의 요지라, 리그도 방마다 따로 둔다.
 *
 * **화면에 담기는 폭만큼 양 끝에서 물러선다.** 방 너비는 칸 수를 따라 달라지므로 한계를
 * 상수로 둘 수 없다 — 지금 화각·거리에서 화면이 덮는 폭을 재 그만큼 안쪽까지만 따라간다.
 * 방이 화면보다 좁으면 가운데에 세워 둔다.
 *
 * **액자를 누르면 그 액자를 확대해 본다.** 다 돌면 페이지를 볼 수 있다고 알린다(`setZoomed`).
 * 진행도 하나를 굴려 평소 자세와 확대 자세를 섞으므로,
 * 자리와 바라보는 점이 함께 움직여 도는 도중에도 구도가 어긋나지 않는다(로비가 책을 볼 때와
 * 같은 방식이다). 확대 거리는 상수가 아니라 **액자가 화면에 담기는 거리**를 그때그때 구한다.
 *
 * **화각도 여기서 맞춘다.** Canvas의 `camera` prop은 만들 때 한 번만 먹으므로,
 * 그러지 않으면 개발용 HUD에서 화각만 조절이 안 된다.
 *
 * **바라보는 점의 높이·깊이는 모델 좌표로 받아 여기서 방 배율을 곱한다.** 튜닝 값과 방 배율은
 * 따로 둬야 HUD에 뜨는 값과 상수에 적는 값이 같다.
 */
export function GalleryCameraRig() {
  const position = useInteriorStore((s) => s.position)
  const camera = useGalleryPageStore((s) => s.camera)
  const bounds = useGalleryGeometryStore((s) => s.bounds)
  const artworks = useGalleryGeometryStore((s) => s.artworks)
  const focusedBay = useGalleryFocusStore((s) => s.focusedBay)

  /** 확대로 넘어간 정도(0~1). 자리와 바라보는 점을 이 하나로 섞는다. */
  const blend = useRef({ value: 0 })
  /** 보고 있는 액자. 닫히는 동안에도 남아 있어야 되돌아가는 길이 이어진다. */
  const focused = useRef(artworks[0])

  useEffect(() => {
    const artwork = focusedBay === null ? undefined : artworks[focusedBay]
    if (artwork) focused.current = artwork

    const tween = gsap.to(blend.current, {
      value: artwork ? 1 : 0,
      duration: GALLERY_FOCUS_SECONDS,
      ease: 'power2.inOut',
      // 다 확대돼야 페이지 내용이 뜬다. 도는 도중에 바뀌면 멀리서 그림만 갈리는 것으로 보인다.
      // 끄는 것은 닫는 쪽이 곧바로 하므로 여기서는 켜기만 한다.
      onComplete: () => {
        if (artwork) useGalleryFocusStore.getState().setZoomed(true)
      },
    })
    return () => {
      tween.kill()
    }
  }, [focusedBay, artworks])

  useFrame((state) => {
    const cam = state.camera as PerspectiveCamera
    if (!cam.isPerspectiveCamera) return

    // 화면 반크기가 화각에서 나오므로 따라갈 범위보다 먼저 맞춘다.
    if (cam.fov !== camera.fov) {
      cam.fov = camera.fov
      cam.updateProjectionMatrix()
    }

    _offset.set(camera.x, camera.y, camera.z)
    const distance = _offset.length()
    const halfHeight = Math.tan(MathUtils.degToRad(cam.fov) / 2) * distance
    const halfWidth = halfHeight * cam.aspect

    // 화면이 방보다 넓으면 가운데에 세운다. 그때는 어디를 걸어도 방 전체가 이미 보인다.
    const roomCenter = (bounds.minX + bounds.maxX) / 2
    const limit = (bounds.maxX - bounds.minX) / 2 - halfWidth
    const anchorX =
      limit > 0
        ? MathUtils.clamp(position.x, roomCenter - limit, roomCenter + limit)
        : roomCenter

    // 높이·깊이는 **모델 좌표**로 튜닝하므로 여기서 방 배율을 곱한다.
    // 좌우는 이미 잰 방 끝(월드)에서 나온 값이라 곱하지 않는다.
    _anchor.set(
      anchorX,
      camera.anchorY * GALLERY_MODEL_SCALE.y,
      camera.anchorZ * GALLERY_MODEL_SCALE.z,
    )

    // 확대한 만큼 기준점과 오프셋을 액자 쪽으로 섞는다. 둘을 같은 진행도로 굴려야
    // 도는 도중에 바라보는 점만 앞서가거나 하지 않는다.
    const focus = blend.current.value
    const artwork = focused.current
    if (focus > 0 && artwork) {
      _focusPoint.set(artwork.x, artwork.y, artwork.z)
      _anchor.lerp(_focusPoint, focus)
      // 액자를 정면에서 본다. 여백만큼 넓힌 액자가 화면에 담기는 거리까지 물러난다 —
      // 세로로도 가로로도 넘치지 않아야 하므로 둘 중 먼 쪽을 쓴다.
      const margin = 1 + GALLERY_FOCUS_MARGIN
      const tangent = Math.tan(MathUtils.degToRad(cam.fov) / 2)
      const byHeight = (artwork.height * margin) / 2 / tangent
      const byWidth = (artwork.width * margin) / 2 / (tangent * cam.aspect)
      _focusOffset.set(0, 0, Math.max(byHeight, byWidth))
      _offset.lerp(_focusOffset, focus)
    }

    // 자세는 **바라보는 점을 향한** 자리에서 잡는다. 비켜 놓기는 그 뒤에 얹어야
    // 각도는 건드리지 않고 구도만 바뀐다.
    cam.position.copy(_anchor).add(_offset)
    cam.lookAt(_anchor)

    // 비켜 놓기는 평소 구도를 위한 것이라, 확대한 만큼 걷는다 — 액자는 화면 한가운데에 둔다.
    const shift = 1 - focus
    const offsetLength = _offset.length()
    if (
      shift > 0 &&
      offsetLength >= DEGENERATE &&
      (camera.shiftX !== 0 || camera.shiftY !== 0)
    ) {
      _forward.copy(_offset).negate().divideScalar(offsetLength)
      _right.crossVectors(_forward, WORLD_UP)
      if (_right.lengthSq() >= DEGENERATE) {
        _right.normalize()
        _up.crossVectors(_right, _forward).normalize()
        // 옮길 거리는 **지금 거리에서의** 화면 반크기다. 확대하면 거리가 달라진다.
        const half = Math.tan(MathUtils.degToRad(cam.fov) / 2) * offsetLength
        cam.position.addScaledVector(_right, -camera.shiftX * half * cam.aspect * shift)
        cam.position.addScaledVector(_up, -camera.shiftY * half * shift)
      }
    }

    // 비켜 놓기까지 끝난 **최종 자세**를 행렬에 반영한다. `lookAt`이 옮기기 전 자리로 이미 굳혀 둬서,
    // 이대로 두면 같은 프레임에 카메라를 읽는 쪽(조준 레이캐스트)이 옮기기 전 자리를 본다.
    cam.updateMatrixWorld()
  })

  return null
}
