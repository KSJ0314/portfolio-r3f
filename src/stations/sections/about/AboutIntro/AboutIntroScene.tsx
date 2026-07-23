import { Suspense, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'
import gsap from 'gsap'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useIntroPageStore } from '../../../../state/useIntroPageStore'
import { useStationStore } from '../../../../state/useStationStore'
import type { StationDetailProps } from '../../../registry'
import { CONTENT_Y } from './AboutIntro.constants'
import { ExitArrow } from './ExitArrow'

/** 정면뷰 카메라 높이. Orthographic이라 배율과는 무관하고 near/far 안에만 있으면 된다. */
const FOCUS_HEIGHT = 20

/** 항공뷰 ↔ 정면뷰 전환 시간(초). */
const TURN_SECONDS = 1.5

/**
 * 정면뷰에서 화면 위로 갈 방향.
 * 영역이 x·z 축에 맞춰 놓여 있으므로 -z를 위로 둬야 가로=화면 가로, 세로=화면 세로로 반듯하게 보인다.
 * 바닥에 눕힌 글씨(rotation `[-π/2, 0, 0]`)가 바로 읽히는 방향이기도 하다.
 */
const FRONT_UP = new Vector3(0, 0, -1)

/** 항공뷰의 up. CameraRig가 팔로우할 때 쓰는 기본값과 같아야 복귀가 매끄럽다. */
const WORLD_UP = new Vector3(0, 1, 0)

const _matrix = new Matrix4()
const _center = new Vector3()

/**
 * `about-intro` 활성 구현 — 카메라 각도 전환.
 *
 * Intro는 내용이 바닥에 그려져 있으므로 활성화해도 오브젝트는 그대로 두고 **카메라만 돌린다**.
 * 정면(수직)에서 내려다보면 종이에 적힌 내용이 웹페이지처럼 2D로 읽히고,
 * 닫으면 항공뷰로 돌아가 다시 3D 맵으로 보인다.
 *
 * 배율(zoom)은 건드리지 않는다. 정면에서 보이는 크기가 실제 크기와 같아야 영역 크기를 판단할 수 있다.
 */
export function AboutIntroScene({ station, phase }: StationDetailProps) {
  const camera = useThree((s) => s.camera)
  const { width, height } = useIntroPageStore((s) => s.area)
  const {
    exitArrowSize,
    exitArrowRight,
    exitArrowBottom,
    exitArrowColor,
    exitArrowStroke,
    exitArrowRoughness,
    exitArrowOpacity,
  } = useIntroPageStore((s) => s.layout)
  const aerialPosition = useRef(new Vector3())
  const aerialQuaternion = useRef(new Quaternion())
  const frontPosition = useRef(new Vector3())
  const frontQuaternion = useRef(new Quaternion())

  /** 두 자세를 섞어 카메라에 적용한다. 0이면 항공뷰, 1이면 정면뷰. */
  const applyPose = useCallback(
    (progress: number) => {
      // 돌아갈 항공뷰 자세는 팔로우 규칙(캐릭터 + 오프셋, 캐릭터를 바라봄)으로 매번 다시 계산한다.
      // 걸어서 나가는 동안에도 종료 애니메이션이 도니, 한 번 잡아두면 캐릭터가 이동한 만큼 마지막에 튄다.
      const { position, followOffset } = useCameraStore.getState()
      aerialPosition.current.copy(position).add(followOffset)
      _matrix.lookAt(aerialPosition.current, position, WORLD_UP)
      aerialQuaternion.current.setFromRotationMatrix(_matrix)

      camera.position.lerpVectors(aerialPosition.current, frontPosition.current, progress)
      camera.quaternion.slerpQuaternions(
        aerialQuaternion.current,
        frontQuaternion.current,
        progress,
      )
    },
    [camera],
  )

  // 정면뷰 자세는 페이지 한가운데 위에서 수직으로 내려다보는 고정 자세다.
  useLayoutEffect(() => {
    const [x, z] = station.position
    frontPosition.current.set(x, FOCUS_HEIGHT, z)
    _center.set(x, 0, z)
    // 수직으로 내려다보면 기본 up(+y)이 시선과 겹쳐 화면 방향이 정해지지 않으므로 직접 준다.
    _matrix.lookAt(frontPosition.current, _center, FRONT_UP)
    frontQuaternion.current.setFromRotationMatrix(_matrix)

    // 사이트 첫 화면은 active로 시작한다 — 전환할 이전 자세가 없으므로 바로 정면뷰에 놓는다.
    if (useStationStore.getState().phase === 'active') applyPose(1)
  }, [station, applyPose])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return
    const entering = phase === 'entering'

    const state = { progress: entering ? 0 : 1 }
    const tween = gsap.to(state, {
      progress: entering ? 1 : 0,
      duration: TURN_SECONDS,
      ease: 'power2.inOut',
      onUpdate: () => applyPose(state.progress),
      onComplete: () => {
        const { enterComplete, exitComplete } = useStationStore.getState()
        if (entering) enterComplete()
        else exitComplete()
      },
    })
    return () => {
      tween.kill()
    }
  }, [phase, applyPose])

  // 나가기 화살표는 완전히 활성인 동안에만 둔다(진입·종료 애니메이션 중에는 안 보인다).
  if (phase !== 'active') return null

  const [x, z] = station.position
  return (
    <group position={[x, CONTENT_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <Suspense fallback={null}>
        <ExitArrow
          x={width / 2 - exitArrowRight - exitArrowSize / 2}
          y={-height / 2 + exitArrowBottom}
          size={exitArrowSize}
          color={exitArrowColor}
          stroke={exitArrowStroke}
          roughness={exitArrowRoughness}
          opacity={exitArrowOpacity}
        />
      </Suspense>
    </group>
  )
}
