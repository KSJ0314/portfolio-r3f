import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'
import gsap from 'gsap'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useCareerPageStore } from '../../../../state/useCareerPageStore'
import { useCareerSequenceStore } from '../../../../state/useCareerSequenceStore'
import { useStationStore } from '../../../../state/useStationStore'
import { type StationDetailProps, walkToStand } from '../../../registry'
import { CAREER_TURN_EASE, CAREER_TURN_SECONDS } from './AboutCareer.constants'
import { aboutCareerDistanceTo } from './AboutCareer.distance'
import { CareerTitles } from './CareerTitles'

const CAREER_ID = 'about-career'

/** 정면뷰 카메라 높이. Orthographic이라 배율과는 무관하고 near/far 안에만 있으면 된다. */
const FOCUS_HEIGHT = 20

/**
 * 정면뷰에서 화면 위로 갈 방향.
 * 영역이 x·z 축에 맞춰 놓여 있으므로 -z를 위로 둬야 가로=화면 가로, 세로=화면 세로로 반듯하게 보인다.
 */
const FRONT_UP = new Vector3(0, 0, -1)

/** 항공뷰의 up. CameraRig가 팔로우할 때 쓰는 기본값과 같아야 복귀가 매끄럽다. */
const WORLD_UP = new Vector3(0, 1, 0)

const _matrix = new Matrix4()
const _center = new Vector3()

/**
 * `about-career` 활성 구현 — 캐릭터 이동과 카메라 각도 전환.
 *
 * **캐릭터가 먼저 걷고, 그다음 카메라 회전과 로고 전환이 함께 돈다.**
 * 걷는 시간은 거리에 따라 달라 지연 상수로 차례를 맞출 수 없어 도착 신호를 보고 넘어간다.
 * 서는 자리는 지금 선 자리에서 가장 가까운 영역 테두리이고, **영역 안에서 눌렀으면 걷지 않는다** —
 * 이미 페이지 위에 서 있는데 테두리로 도로 나가는 것은 어색하다.
 *
 * 카메라는 정면(수직)으로 돌아 종이에 놓인 것들이 페이지처럼 읽히게 하고, 닫으면 항공뷰로 돌아간다.
 * 배율은 건드리지 않는다.
 */
export function AboutCareerScene({ phase }: StationDetailProps) {
  const camera = useThree((s) => s.camera)
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)
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
      camera.quaternion.slerpQuaternions(aerialQuaternion.current, frontQuaternion.current, progress)
    },
    [camera],
  )

  // 정면뷰 자세는 영역 한가운데 위에서 수직으로 내려다보는 고정 자세다.
  // 중심은 배치 좌표가 아니라 영역(상단 중앙 + 세로 반크기)에서 구한다 — HUD로 영역을 옮기면 초점도 따라온다.
  useLayoutEffect(() => {
    const x = topCenter.x
    const z = topCenter.z + area.height / 2
    frontPosition.current.set(x, FOCUS_HEIGHT, z)
    _center.set(x, 0, z)
    // 수직으로 내려다보면 기본 up(+y)이 시선과 겹쳐 화면 방향이 정해지지 않으므로 직접 준다.
    _matrix.lookAt(frontPosition.current, _center, FRONT_UP)
    frontQuaternion.current.setFromRotationMatrix(_matrix)

    // 활성 중에 다시 붙었으면(HMR·재마운트) 전환할 이전 자세가 없으므로 바로 정면뷰에 놓는다.
    if (useStationStore.getState().phase === 'active') {
      applyPose(1)
      useCareerSequenceStore.getState().setLogoTurn(true)
    }
  }, [area, topCenter, applyPose])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return
    const entering = phase === 'entering'
    const { setLogoTurn } = useCareerSequenceStore.getState()

    const state = { progress: entering ? 0 : 1 }
    let tween: gsap.core.Tween | null = null
    let unsubscribe: (() => void) | undefined

    /** 카메라와 로고를 함께 시작한다. 둘은 같은 시간·이징이라 한 동작으로 보인다. */
    const turn = () => {
      setLogoTurn(entering)
      tween = gsap.to(state, {
        progress: entering ? 1 : 0,
        duration: CAREER_TURN_SECONDS,
        ease: CAREER_TURN_EASE,
        onUpdate: () => applyPose(state.progress),
        onComplete: () => {
          const { enterComplete, exitComplete } = useStationStore.getState()
          if (entering) enterComplete()
          else exitComplete()
        },
      })
    }

    if (entering) {
      // 영역 안이면 걸을 곳이 없다(거리가 0이다).
      const inside = aboutCareerDistanceTo(useCameraStore.getState().position) === 0
      if (inside) {
        turn()
      } else {
        // 도착해야 다음 차례로 넘어간다. 자리를 구하지 못하면 기다리지 않고 바로 돈다.
        unsubscribe = useCameraStore.subscribe((next, prev) => {
          if (!prev.walking || next.walking) return
          unsubscribe?.()
          unsubscribe = undefined
          turn()
        })
        if (!walkToStand(CAREER_ID)) {
          unsubscribe()
          unsubscribe = undefined
          turn()
        }
      }
    } else {
      turn()
    }

    return () => {
      unsubscribe?.()
      tween?.kill()
      // 걷는 도중에 사라지면 잠금 예외가 남아 캐릭터가 계속 걸어간다.
      useCameraStore.getState().endWalk()
    }
  }, [phase, applyPose])

  // 제목은 완전히 활성인 동안에만 둔다(진입·종료 애니메이션 중에는 안 보인다).
  if (phase !== 'active') return null

  return <CareerTitles />
}
