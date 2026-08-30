import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { PREVIEW_CAMERA_POSITION } from './Credits.constants'
import type { PreviewCameraProps } from './Credits.types'

/**
 * 고른 항목에 맞춰 카메라 시작 자리를 잡는다.
 *
 * **에셋을 돌려 세우지 않고 보는 자리를 옮긴다** — 모델·스티커의 축을 건드리면 그 자체가 기울어진다.
 * 기본 자리를 y축으로 `yaw`만큼 돌리므로 거리와 높이는 그대로다.
 */
export function PreviewCamera({ yaw }: PreviewCameraProps) {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const [x, y, z] = PREVIEW_CAMERA_POSITION
    const angle = MathUtils.degToRad(yaw)
    camera.position.set(
      x * Math.cos(angle) + z * Math.sin(angle),
      y,
      -x * Math.sin(angle) + z * Math.cos(angle),
    )
    camera.lookAt(0, 0, 0)
  }, [camera, yaw])

  return null
}
