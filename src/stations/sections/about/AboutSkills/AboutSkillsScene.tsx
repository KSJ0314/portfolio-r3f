import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'
import gsap from 'gsap'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useSkillsPageStore } from '../../../../state/useSkillsPageStore'
import { useStationStore } from '../../../../state/useStationStore'
import type { StationDetailProps } from '../../../registry'
import { SKILLS_LOGO_SECONDS, SKILLS_TURN_EASE, SKILLS_TURN_SECONDS } from './AboutSkills.constants'
import { SkillsExit } from './SkillsExit'
import { SkillsPages } from './SkillsPages'
import { SkillsTitle } from './SkillsTitle'

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

/** 다른 연출이 도는 동안 비워 두는 구간. 타임라인 길이만 늘린다. */
function wait(timeline: gsap.core.Timeline, seconds: number) {
  timeline.to({ t: 0 }, { t: 1, duration: seconds })
}

/**
 * `about-skills` 활성 구현 — 카메라 각도 전환.
 *
 * Intro와 같이 오브젝트를 건드리지 않고 카메라만 정면(수직)으로 돌린다. 배율은 바꾸지 않는다.
 * 다만 **공구상자 이동과 겹치지 않고 차례로** 돈다 — 들어갈 때는 카메라가 먼저 돌고 그 뒤에
 * 공구상자가 로고 자리로 물러나며, 나올 때는 공구상자가 제자리로 돌아온 뒤에 카메라가 돌아간다.
 * 공구상자는 상시 마운트된 비활성 구현(SkillsBox)이 같은 시간값을 보고 스스로 움직인다.
 */
export function AboutSkillsScene({ phase }: StationDetailProps) {
  const camera = useThree((s) => s.camera)
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
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

  // 정면뷰 자세는 영역 한가운데 위에서 수직으로 내려다보는 고정 자세다.
  // 중심은 배치 좌표가 아니라 영역(좌상단 + 반크기)에서 구한다 — HUD로 영역을 옮기면 초점도 따라온다.
  useLayoutEffect(() => {
    const x = topLeft.x + area.width / 2
    const z = topLeft.z + area.height / 2
    frontPosition.current.set(x, FOCUS_HEIGHT, z)
    _center.set(x, 0, z)
    // 수직으로 내려다보면 기본 up(+y)이 시선과 겹쳐 화면 방향이 정해지지 않으므로 직접 준다.
    _matrix.lookAt(frontPosition.current, _center, FRONT_UP)
    frontQuaternion.current.setFromRotationMatrix(_matrix)

    if (useStationStore.getState().phase === 'active') applyPose(1)
  }, [area, topLeft, applyPose])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return
    const entering = phase === 'entering'

    const state = { progress: entering ? 0 : 1 }
    const turn = {
      progress: entering ? 1 : 0,
      duration: SKILLS_TURN_SECONDS,
      ease: SKILLS_TURN_EASE,
      onUpdate: () => applyPose(state.progress),
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        const { enterComplete, exitComplete } = useStationStore.getState()
        if (entering) enterComplete()
        else exitComplete()
      },
    })
    if (entering) {
      timeline.to(state, turn)
      // 공구상자가 로고 자리로 물러나는 동안 카메라는 정면뷰에 머문다.
      wait(timeline, SKILLS_LOGO_SECONDS)
    } else {
      // 공구상자가 제자리로 돌아온 뒤에 카메라가 움직인다.
      wait(timeline, SKILLS_LOGO_SECONDS)
      timeline.to(state, turn)
    }

    return () => {
      timeline.kill()
    }
  }, [phase, applyPose])

  // 페이지 내용은 완전히 활성인 동안에만 둔다(진입·종료 애니메이션 중에는 안 보인다).
  if (phase !== 'active') return null

  // 제목은 고정이고, 그 아래 목록만 페이지 단위로 갈린다.
  return (
    <>
      <SkillsTitle />
      <SkillsPages />
      <SkillsExit />
    </>
  )
}
