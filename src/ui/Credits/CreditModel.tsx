import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import type { CreditModelProps } from './Credits.types'

/**
 * 미리보기에 띄우는 모델 한 개.
 *
 * 모델마다 원본 크기와 원점이 제각각이라 **가장 긴 변을 1로 맞추고 가운데를 원점에 둔다.**
 * 그래야 무엇을 띄우든 카메라를 그대로 두고 화면에 꽉 차게 들어온다.
 * (씬 안 트로피가 세로를 기준으로 잡는 것과 다르다 — 여기는 눕든 서든 한 화면에 담기는 것이 먼저다.)
 */
export function CreditModel({ url }: CreditModelProps) {
  const { scene } = useGLTF(url)

  const { model, scale, offset } = useMemo(() => {
    // 씬 안에서 같은 모델을 쓰고 있을 수 있어 원본을 그대로 넣지 않는다.
    const model = scene.clone(true)
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const longest = Math.max(size.x, size.y, size.z) || 1

    return {
      model,
      scale: 1 / longest,
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
    }
  }, [scene])

  return (
    <group scale={scale}>
      <primitive object={model} position={offset} />
    </group>
  )
}
