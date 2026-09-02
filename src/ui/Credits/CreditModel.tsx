import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Mesh, MeshStandardMaterial, PointLight, SpotLight, Vector3, type Object3D } from 'three'
import { useCreditsPreviewStore } from '../../state/useCreditsPreviewStore'
import { InteriorEnvironment } from '../../stations/sections/projects/interior'
import {
  LOBBY_ENV,
  LOBBY_LIGHT_COLOR,
  LOBBY_LIGHT_DECAY,
} from '../../stations/sections/projects/ProjectsLobby/ProjectsLobby.constants'
import { PREVIEW_HIDDEN_PREFIXES } from './Credits.constants'
import type { CreditModelProps } from './Credits.types'

/**
 * 미리보기에 띄우는 모델 한 개.
 *
 * 모델마다 원본 크기와 원점이 제각각이라 **가장 긴 변을 1로 맞추고 가운데를 원점에 둔다.**
 * 그래야 무엇을 띄우든 카메라를 그대로 두고 화면에 꽉 차게 들어온다.
 * (씬 안 트로피가 세로를 기준으로 잡는 것과 다르다 — 여기는 눕든 서든 한 화면에 담기는 것이 먼저다.)
 */
export function CreditModel({ url, tuneLights, ownInstance }: CreditModelProps) {
  // `useGLTF`는 주소를 캐시 키로 쓴다. 쿼리를 붙이면 별도 인스턴스가 되고,
  // 파일은 브라우저 캐시에서 읽어 네트워크는 한 번만 탄다.
  const { scene } = useGLTF(ownInstance ? `${url}?preview` : url)
  const { intensity, range } = useCreditsPreviewStore((s) => s.modelLight)

  const { model, scale, offset, lights, baseIntensity } = useMemo(() => {
    // 씬 안에서 같은 모델을 쓰고 있을 수 있어 원본을 그대로 넣지 않는다.
    // 따로 로드한 것은 씬과 나눠 쓰지 않으므로 복제할 것도 없다.
    const model = ownInstance ? scene : scene.clone(true)

    // 씬이 재질에 손본 것을 물려받지 못하므로 같은 처리를 여기서 한다.
    // 내보낸 emissive가 흰색으로 차 있어 그대로 두면 조명과 무관하게 하얗게 뜬다.
    if (ownInstance) {
      model.traverse((child) => {
        if (!(child instanceof Mesh)) return
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        for (const material of materials) {
          if (!(material instanceof MeshStandardMaterial)) continue
          material.emissiveIntensity = 0.3
          material.metalness = 0.3
          material.roughness = 1
          material.color.setScalar(1.7)
        }
      })
    }

    // 판정에만 쓰고 씬에서는 그리지 않는 것들. 미리보기에 남으면 방을 상자로 덮는다.
    // 경계 상자를 재기 전에 걷어야 크기 정규화도 실물 기준이 된다.
    const helpers: Object3D[] = []
    model.traverse((child) => {
      if (PREVIEW_HIDDEN_PREFIXES.some((prefix) => child.name.startsWith(prefix))) helpers.push(child)
    })
    for (const helper of helpers) helper.removeFromParent()

    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const longest = Math.max(size.x, size.y, size.z) || 1

    // glb에 담겨 온 광원(벽등)은 켜 두고 세기·닿는 거리만 조절한다. 원래 세기를 기억해 둬야
    // HUD로 배수를 바꿀 때마다 곱이 쌓이지 않는다.
    const lights: (PointLight | SpotLight)[] = []
    for (const light of model.getObjectsByProperty('isLight', true)) {
      if (light instanceof PointLight || light instanceof SpotLight) lights.push(light)
    }

    return {
      model,
      scale: 1 / longest,
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
      lights,
      baseIntensity: lights.map((light) => light.intensity),
      longest,
    }
  }, [scene, ownInstance])

  // 광원에 손대는 것은 그렇게 하라고 밝힌 모델뿐이다(로비). 색·감쇠는 그 씬이 쓰는 값을 그대로 쓴다.
  // 거리는 모델 크기 대비 비율이라 크기 정규화와 함께 어떤 모델에도 같게 먹는다.
  useEffect(() => {
    if (!tuneLights) return
    lights.forEach((light, index) => {
      light.intensity = baseIntensity[index] * intensity
      light.distance = (1 / scale) * range
      light.color.set(LOBBY_LIGHT_COLOR)
      light.decay = LOBBY_LIGHT_DECAY
    })
  }, [tuneLights, lights, baseIntensity, intensity, range, scale])

  return (
    <group scale={scale}>
      {/* 실내 모델에만 환경광을 건다. 금속은 확산광이 없어 비쳐 들 환경이 없으면 검게 남고
          대리석 광택도 반사에서 나온다(DECISIONS 035). 씬과 같은 값을 쓴다.
          다른 모델은 밖에 놓이는 것이라 여기 둔 조명만으로 충분하다. */}
      {tuneLights && <InteriorEnvironment blur={LOBBY_ENV.blur} intensity={LOBBY_ENV.intensity} />}
      {/* 자리는 감싸는 그룹이 갖는다. 캐시에 든 원본을 그대로 쓰는 경우(`ownInstance`)
          `primitive`에 직접 주면 그 값이 오브젝트에 남아, 다시 열 때 어긋난 자리에서 시작한다. */}
      <group position={offset}>
        <primitive object={model} />
      </group>
    </group>
  )
}
