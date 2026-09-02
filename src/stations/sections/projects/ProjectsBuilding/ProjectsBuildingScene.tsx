import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Matrix4, type OrthographicCamera, Quaternion, Vector3 } from 'three'
import gsap from 'gsap'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useProjectsDoorStore } from '../../../../state/useProjectsDoorStore'
import { useProjectsPageStore } from '../../../../state/useProjectsPageStore'
import { useProjectsSequenceStore } from '../../../../state/useProjectsSequenceStore'
import { useSceneTransitionStore } from '../../../../state/useSceneTransitionStore'
import { useStationStore } from '../../../../state/useStationStore'
import { type StationDetailProps, faceStation, walkToStand } from '../../../registry'
import { enterLobby } from '../ProjectsLobby/ProjectsLobby.travel'
import {
  PROJECTS_ID,
  PROJECTS_TURN_EASE,
  PROJECTS_TURN_SECONDS,
} from './ProjectsBuilding.constants'
import { projectsBuildingStand } from './ProjectsBuilding.distance'

/** 항공뷰의 up. CameraRig가 팔로우할 때 쓰는 기본값과 같아야 복귀가 매끄럽다. */
const WORLD_UP = new Vector3(0, 1, 0)

const _matrix = new Matrix4()
const _look = new Vector3()
const _point = new Vector3()
const _screen = new Vector3()
const _frontPosition = new Vector3()
const _frontQuaternion = new Quaternion()

/**
 * `projects` 활성 구현 — 캐릭터 이동과 카메라 각도 전환.
 *
 * **캐릭터가 문 앞으로 걸어가는 것과 카메라가 도는 것이 함께 돈다.**
 *
 * 다른 스테이션은 바닥에 그려진 내용을 수직으로 내려다보지만, 여기서 볼 것은 **세워 둔 문**이라
 * 눈높이에서 정면으로 본다. 닫으면 항공뷰로 돌아간다. 배율은 건드리지 않는다.
 *
 * 다 걸어 들어가면 장면이 통째로 로비(`/projects`)로 갈린다.
 */
export function ProjectsBuildingScene({ phase }: StationDetailProps) {
  const camera = useThree((s) => s.camera)
  const building = useProjectsPageStore((s) => s.building)
  const view = useProjectsPageStore((s) => s.view)
  const door = useProjectsDoorStore((s) => s.door)

  const aerialPosition = useRef(new Vector3())
  const aerialQuaternion = useRef(new Quaternion())
  const frontPosition = useRef(new Vector3())
  const frontQuaternion = useRef(new Quaternion())
  /** 문을 화면 중앙에 두고 크게 잡는 자세. 확대가 진행되는 만큼 정면뷰에서 이쪽으로 옮겨 간다. */
  const closeUpPosition = useRef(new Vector3())
  const closeUpQuaternion = useRef(new Quaternion())
  /** 지금 섞여 있는 정도. 트윈은 이 값만 굴리고 카메라에 옮기는 것은 매 프레임 한다. */
  const progress = useRef({ value: 0 })
  /**
   * 문에 다가간 정도(0~1). 자세와 배율이 이 하나에서 함께 나와 서로 어긋나지 않는다.
   * 자세와 같은 이유로 트윈은 값만 굴린다.
   */
  const closeUp = useRef({ value: 0 })
  /** 평소 배율. 처음 한 프레임에서 잡아 두고 그것에 배수를 곱한다. */
  const baseZoom = useRef(0)
  /** 문 한가운데(월드). 전환 덮개가 여기로 모이도록 매 프레임 화면 좌표로 바꿔 알린다. */
  const doorCenter = useRef(new Vector3())

  /** 두 자세를 섞어 카메라에 적용한다. 0이면 항공뷰, 1이면 문 정면뷰. */
  const applyPose = useCallback(
    (progress: number) => {
      // 돌아갈 항공뷰 자세는 팔로우 규칙(캐릭터 + 오프셋, 캐릭터를 바라봄)으로 매번 다시 계산한다.
      // 걸어서 나가는 동안에도 종료 애니메이션이 도니, 한 번 잡아두면 캐릭터가 이동한 만큼 마지막에 튄다.
      const { position, followOffset } = useCameraStore.getState()
      aerialPosition.current.copy(position).add(followOffset)
      _matrix.lookAt(aerialPosition.current, position, WORLD_UP)
      aerialQuaternion.current.setFromRotationMatrix(_matrix)

      // 정면뷰는 문에 다가간 정도만큼 클로즈업 자세 쪽으로 미리 섞어 둔다.
      _frontPosition.lerpVectors(frontPosition.current, closeUpPosition.current, closeUp.current.value)
      _frontQuaternion.slerpQuaternions(
        frontQuaternion.current,
        closeUpQuaternion.current,
        closeUp.current.value,
      )

      camera.position.lerpVectors(aerialPosition.current, _frontPosition, progress)
      camera.quaternion.slerpQuaternions(aerialQuaternion.current, _frontQuaternion, progress)
    },
    [camera],
  )

  // 정면뷰는 문 앞에서 문을 바라보는 고정 자세다.
  // 자리와 보는 쪽은 **잰 문**에서 나오고(건물을 키우거나 돌리면 함께 따라온다),
  // 거리·높이는 화면 구도라 월드 값 그대로 둔다.
  useLayoutEffect(() => {
    const doorX = building.x + door.x
    const doorZ = building.z + door.z
    doorCenter.current.set(doorX, door.centerY, doorZ)

    frontPosition.current.set(
      doorX + door.facingX * view.distance,
      view.height,
      doorZ + door.facingZ * view.distance,
    )
    _look.set(doorX, view.lookY, doorZ)
    _matrix.lookAt(frontPosition.current, _look, WORLD_UP)
    frontQuaternion.current.setFromRotationMatrix(_matrix)

    // 클로즈업은 **문 중심**을 화면 한가운데 둔다. 정면뷰는 건물 가운데를 보고 있어
    // 배율만 올리면 문이 아니라 건물로 당겨진다.
    // 카메라 높이도 같은 차이만큼 내려 내려다보는 각도는 그대로 유지한다.
    closeUpPosition.current.set(
      doorX + door.facingX * view.distance,
      door.centerY + (view.height - view.lookY),
      doorZ + door.facingZ * view.distance,
    )
    _look.set(doorX, door.centerY, doorZ)
    _matrix.lookAt(closeUpPosition.current, _look, WORLD_UP)
    closeUpQuaternion.current.setFromRotationMatrix(_matrix)

    // 활성 중에 다시 붙었으면(HMR·재마운트) 전환할 이전 자세가 없으므로 바로 정면뷰에 놓는다.
    if (useStationStore.getState().phase === 'active') {
      progress.current.value = 1
      applyPose(1)
    }
  }, [building, door, view, applyPose])

  // 카메라에 옮기는 것은 여기서 한다. 걷는 동안에는 공통층(`CameraRig`)이 아직 팔로우를 돌리므로,
  // 트윈이 직접 카메라를 만지면 둘이 매 프레임 부딪힌다. 이 자리는 CameraRig보다 뒤에 돌아 마지막 값이 남는다.
  // 배율은 훅이 돌려준 카메라에 직접 대입할 수 없어 프레임이 넘겨주는 것을 쓴다.
  useFrame((state) => {
    applyPose(progress.current.value)
    const cam = state.camera as OrthographicCamera
    if (!cam.isOrthographicCamera) return
    if (baseZoom.current === 0) baseZoom.current = cam.zoom
    // 배율도 자세와 같은 진행도에서 나온다. 따로 굴리면 둘이 어긋난다.
    const next = baseZoom.current * (1 + (view.zoom - 1) * closeUp.current.value)
    if (cam.zoom !== next) {
      cam.zoom = next
      cam.updateProjectionMatrix()
    }

    // 장면 전환 덮개는 Canvas 밖에 있어 카메라를 모른다. 문이 화면 어디에 있는지 알려
    // 한가운데가 아니라 **캐릭터가 들어가는 문 쪽으로** 조여들게 한다.
    //
    // 투영은 **방금 쓴 자세를 행렬에 반영한 뒤에** 해야 한다. `project`가 보는 것은 렌더러가
    // 관리하는 행렬이라 위에서 옮긴 카메라가 아직 반영돼 있지 않고, 그대로 쓰면 초기 자세 기준으로
    // 재서 화면 밖 엉뚱한 자리를 가리킨다.
    cam.updateMatrixWorld()
    _screen.copy(doorCenter.current).project(cam)
    const focus = useSceneTransitionStore.getState().focus
    focus.x = _screen.x * 0.5 + 0.5
    focus.y = -_screen.y * 0.5 + 0.5
  })

  // 문이 다 열리면 캐릭터가 건물 안으로 걸어 들어가고, 그와 함께 카메라가 확대된다.
  // 걸음이 느린 구간이라 속도를 따로 준다.
  useEffect(() => {
    if (phase !== 'active') return
    let tween: gsap.core.Tween | null = null
    let unsubscribe: (() => void) | undefined

    const goInside = () => {
      const { building, enter, view } = useProjectsPageStore.getState()
      const scale = useProjectsDoorStore.getState().door.scale
      const camera = useCameraStore.getState()
      // 곧장 앞으로만 들어간다. x는 선 자리를 그대로 두고 z만 바꾼다.
      camera.walkTo(
        _point.set(camera.position.x, 0, building.z + enter.z * scale),
        enter.speed,
      )
      tween = gsap.to(closeUp.current, {
        value: 1,
        duration: view.zoomSeconds,
        ease: PROJECTS_TURN_EASE,
      })

      // 장면 전환도 여기서 함께 시작한다 — 들어가는 것과 어두워지는 것이 한 동작으로 보여야 한다.
      // 도착을 기다렸다 시작하면 걷기가 끝난 뒤에 덮개가 따로 도는 두 동작이 된다.
      // 걷기와 확대는 덮개 밑에서 계속 돌고, 다 덮이면 그 위에서 라우트가 갈린다.
      enterLobby()
    }

    if (useProjectsSequenceStore.getState().doorOpened) {
      goInside()
    } else {
      unsubscribe = useProjectsSequenceStore.subscribe((state) => {
        if (!state.doorOpened) return
        unsubscribe?.()
        unsubscribe = undefined
        goInside()
      })
    }

    return () => {
      unsubscribe?.()
      tween?.kill()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return
    const entering = phase === 'entering'

    const tweens: gsap.core.Tween[] = []
    let unsubscribe: (() => void) | undefined

    const turn = () => {
      tweens.push(
        gsap.to(progress.current, {
          value: entering ? 1 : 0,
          duration: PROJECTS_TURN_SECONDS,
          ease: PROJECTS_TURN_EASE,
          onComplete: () => {
            const { enterComplete, exitComplete } = useStationStore.getState()
            if (entering) enterComplete()
            else exitComplete()
          },
        }),
      )
      // 다가간 것도 자세와 함께 되돌린다. 놓아두면 공통층이 배율을 한 프레임에 되돌려 튄다.
      if (!entering) {
        tweens.push(
          gsap.to(closeUp.current, {
            value: 0,
            duration: PROJECTS_TURN_SECONDS,
            ease: PROJECTS_TURN_EASE,
          }),
        )
      }
    }

    if (!entering) {
      // 건물 안에 둔 채로 두면 막는 사각형에 갇힌다. 문 앞자리로 옮겨 둔다.
      const stand = projectsBuildingStand()
      if (stand) useCameraStore.getState().teleportTo(_point.set(stand[0], 0, stand[1]))
    }

    if (entering) {
      // 걷는 것과 도는 것을 같이 시작한다. 자리를 등록하지 않았으면 카메라만 돈다.
      walkToStand(PROJECTS_ID)
      // 카메라가 도는 것과 함께 캐릭터도 건물 쪽으로 몸을 돌린다.
      faceStation(PROJECTS_ID)
      turn()
    } else if (useProjectsSequenceStore.getState().doorClosed) {
      // 열린 적이 없으면 기다릴 것이 없다.
      turn()
    } else {
      // 나갈 때는 **문이 다 닫혔다는 신호**를 보고 돈다. 함께 돌면 문 닫히는 것이 화면 밖으로 밀린다.
      unsubscribe = useProjectsSequenceStore.subscribe((state) => {
        if (!state.doorClosed) return
        unsubscribe?.()
        unsubscribe = undefined
        turn()
      })
    }

    return () => {
      unsubscribe?.()
      for (const tween of tweens) tween.kill()
      // 걷는 도중에 사라지면 잠금 예외가 남아 캐릭터가 계속 걸어간다.
      useCameraStore.getState().endWalk()
    }
  }, [phase])

  return null
}
