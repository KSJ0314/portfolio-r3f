import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { OrthographicCamera } from 'three'
import { useCameraStore } from '../../state/useCameraStore'
import { useStationStore } from '../../state/useStationStore'

/**
 * 카메라는 캐릭터(position)와의 상대 오프셋(아이소메트릭 각도·거리)을 고정한 채 매 프레임 캐릭터를 따라가며 화면 중앙에 둔다.
 * 캐릭터 이동은 Character가 처리한다.
 *
 * **카메라 제어권**: 스테이션이 활성화되면(`activeId`) 팔로우를 멈추고 카메라를 놓는다.
 * 그때부터 카메라를 어떻게 움직일지는 전적으로 해당 스테이션 구현의 몫이며(포커스 트윈 등) 공통층은 그 방식을 알지 못한다.
 * 대신 **복귀는 공통층이 보장한다.**
 * 스테이션이 카메라를 어디로 끌고 갔든 닫히는 순간 팔로우가 재개되어 원래 오프셋·zoom으로 돌아온다. (DECISIONS 007)
 */
export function CameraRig() {
  const { camera } = useThree()
  const offset = useRef(new Vector3())
  const baseZoom = useRef(camera.zoom)
  const ready = useRef(false)
  const position = useCameraStore((s) => s.position)
  // 활성 스테이션이 있으면 카메라 제어권을 넘긴다(팔로우 중단).
  const follow = useStationStore((s) => s.activeId === null)

  // 오프셋을 카메라 초기 위치에서 유도한다(카메라 설정이 단일 소스).
  // useLayoutEffect는 커밋 직후 동기 실행된다.
  // 그래서 아래 useFrame이 등록되기 전, 첫 rAF 프레임보다 먼저 오프셋을 잡는다.
  useLayoutEffect(() => {
    offset.current.copy(camera.position).sub(position)
    ready.current = true

    // 미니맵 회전각을 카메라에서 유도한다. 카메라가 캐릭터를 바라보는 방향을 지면에 투영한
    // (fx, fz)가 화면상 "위(멀어지는 방향)"에 해당 → 그 방향이 미니맵의 위(-y)로 가도록 하는
    // 회전각. 오프셋(=camera-캐릭터)의 반대가 바라보는 방향이므로 부호를 뒤집는다.
    const fx = -offset.current.x
    const fz = -offset.current.z
    useCameraStore.getState().setViewAngle(-Math.PI / 2 - Math.atan2(fz, fx))
  }, [camera, position])

  // 카메라는 useFrame이 넘겨주는 state에서 받아 쓴다(훅 반환값을 직접 변형하지 않기 위함).
  useFrame((state) => {
    // 카메라 제어권이 스테이션에 있으면 손대지 않는다.
    if (!follow) return
    // 가드: 오프셋 초기화 전에는 카메라를 건드리지 않는다.
    // 현재 훅 선언 순서(위 useLayoutEffect가 먼저)에서는 초기화가 항상 앞서 실행돼 없어도 동작한다.
    // 하지만 누군가 훅 순서를 바꾸거나 초기화가 지연되면
    // 초기화 전 프레임이 offset(0,0,0)으로 카메라를 원점에 박아(새로고침 시 맵이 안 뜨는 레이스) 회귀한다.
    // 그 회귀를 구조적으로 막기 위한 안전장치다.
    if (!ready.current) return
    const cam = state.camera as OrthographicCamera
    cam.position.copy(position).add(offset.current)
    cam.lookAt(position)

    // 복귀 보장: 스테이션이 zoom을 바꿔놨을 수 있으므로 팔로우 중에는 초기 zoom을 유지한다.
    // (위치·시선은 위에서 매 프레임 오프셋으로 되돌아온다.)
    // 스테이션이 부드러운 복귀를 원하면 닫히기 전에 스스로 트윈하고 자기 트윈을 정리해야 한다.
    if (cam.isOrthographicCamera && cam.zoom !== baseZoom.current) {
      cam.zoom = baseZoom.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
