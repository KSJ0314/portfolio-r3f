import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useCameraStore } from '../../state/useCameraStore'

/**
 * 카메라는 캐릭터(position)와의 상대 오프셋(아이소메트릭 각도·거리)을 고정한 채
 * 매 프레임 캐릭터를 따라가며 화면 중앙에 둔다. 캐릭터 이동은 Character가 처리.
 */
export function CameraRig() {
  const { camera } = useThree()
  const offset = useRef(new Vector3())
  const ready = useRef(false)
  const position = useCameraStore((s) => s.position)

  // 오프셋을 카메라 초기 위치에서 유도한다(카메라 설정이 단일 소스).
  // useLayoutEffect는 커밋 직후 동기 실행되어, 아래 useFrame이 등록되기 전·
  // 첫 rAF 프레임보다 먼저 오프셋을 잡는다.
  useLayoutEffect(() => {
    offset.current.copy(camera.position).sub(position)
    ready.current = true
  }, [camera, position])

  useFrame(() => {
    // 가드: 오프셋 초기화 전에는 카메라를 건드리지 않는다.
    // 현재 훅 선언 순서(위 useLayoutEffect가 먼저)에서는 초기화가 항상 앞서 실행돼
    // 없어도 동작하지만, 누군가 훅 순서를 바꾸거나 초기화가 지연되면 초기화 전 프레임이
    // offset(0,0,0)으로 카메라를 원점에 박아(새로고침 시 맵이 안 뜨는 레이스) 회귀한다.
    // 그 회귀를 구조적으로 막기 위한 안전장치다.
    if (!ready.current) return
    camera.position.copy(position).add(offset.current)
    camera.lookAt(position)
  })

  return null
}
