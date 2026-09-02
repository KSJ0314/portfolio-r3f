import { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import type { Group } from 'three'
import { CHARACTER_URL, WALK_EPSILON } from './CharacterModel.constants'
import type { CharacterModelProps } from './CharacterModel.types'

const _box = new Box3()

/**
 * 캐릭터 모델과 걷기 동작. 맵과 실내가 함께 쓴다.
 *
 * 옮기고 돌리는 일은 쓰는 쪽(`Character`·`InteriorCharacter`)이 하고, 여기서는 **그리는 것**만 맡는다.
 * 이번 프레임 걸음 속도도 옮기는 쪽이 `applyMotion`으로 알린다 — 여기서 매 프레임 읽으면
 * 자식이 먼저 구독돼 부모가 방금 쓴 값을 한 프레임 늦게 본다.
 * 크기는 상수로 박지 않고 **모델을 재서** 넘겨받은 세로에 맞춘다. 모델을 갈아 끼워도 값을 다시 잡지 않는다.
 * 서 있는 동작이 따로 없어, 멈추면 걷기 동작을 아예 멈춰 모델의 기본 자세로 세운다.
 *
 * 밝기·톤 매핑을 방마다 받는 이유는 **재질이 한 벌**이기 때문이다. 맵과 실내는 라우트가 갈려
 * 동시에 뜨지 않으므로, 뜨는 쪽이 자기 값을 얹으면 그 방에 맞는 색이 된다.
 */
export function CharacterModel({
  ref,
  baseSpeed,
  height,
  walkRate,
  brightness,
  toneMapped,
}: CharacterModelProps) {
  const fit = useRef<Group>(null)
  const { scene, animations } = useGLTF(CHARACTER_URL)
  const { actions } = useAnimations(animations, fit)
  const clip = animations[0]?.name

  /**
   * 내보낸 재질을 이 씬에 맞게 고친다. 모델 파일은 손대지 않는다(DECISIONS 032).
   *
   * emissive가 흰색으로 꽉 차 있어 그대로 두면 조명과 무관하게 하얗게 뜬다. 그것을 끄고,
   * 대신 텍스처 색에 밝기를 곱해 되올린다 — 씬 조명이 종이에 맞춰 약해 그냥 두면 잿빛이 된다.
   */
  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const material of materials) {
        if (!(material instanceof MeshStandardMaterial)) continue
        material.emissiveIntensity = 0
        material.metalness = 0
        material.roughness = 1
        material.toneMapped = toneMapped
        // 곱이 쌓이지 않도록 곱셈이 아니라 값을 그대로 넣는다. 내보낸 색이 흰색이라 이것이 곧 배수다.
        material.color.setScalar(brightness)
        // 내보낸 값이 규격 상한(1)을 넘는 2라 하이라이트가 번져 색이 씻긴다.
        if (material instanceof MeshPhysicalMaterial) material.specularIntensity = 0
      }
    })
  }, [scene, brightness, toneMapped])

  // 재는 것과 배율을 거는 것을 한자리에 둔다. 모델이 갈리면 크기도 함께 다시 잡혀야 한다.
  useLayoutEffect(() => {
    const group = fit.current
    if (!group) return
    // 배율이 걸린 채로 재면 잰 값으로 배율을 다시 정하는 되먹임이 된다.
    // 되돌린 배율은 다음 렌더에야 행렬에 들어가는데 경계 상자는 그 행렬을 그대로 믿으므로,
    // 여기서 직접 갱신해야 이미 한 번 그린 뒤에 다시 재도 같은 값이 나온다.
    group.scale.setScalar(1)
    group.updateWorldMatrix(true, true)
    _box.setFromObject(scene)
    group.scale.setScalar(height / (_box.max.y - _box.min.y || 1))
  }, [scene, height])

  // 언마운트될 때 재생이 남지 않게 한다. 처음에는 서 있으므로 여기서 재생을 걸지 않는다.
  useEffect(() => {
    const action = clip ? actions[clip] : null
    if (!action) return
    return () => {
      action.stop()
    }
  }, [actions, clip])

  /**
   * 걸을 때만 동작을 재생한다.
   *
   * 멈추면 배속을 0으로 두는 것이 아니라 **아예 멈춘다**. 배속만 0으로 두면 걷던 자세 그대로
   * 굳어 다리를 벌린 채 서 있다. 멈추면 mixer가 뼈대를 애니메이션 이전 값으로 되돌리므로
   * 모델이 저작된 기본 자세로 선다.
   *
   * 훅이 돌려준 값이라 프로퍼티에 대입하지 못해 메서드로만 다룬다(LEARNING 2026-07-13).
   */
  useImperativeHandle(
    ref,
    () => ({
      applyMotion(speed: number) {
        const action = clip ? actions[clip] : null
        if (!action) return
        if (speed > WALK_EPSILON) {
          if (!action.isRunning()) action.reset().play()
          // 걸음이 빠를수록 동작도 빨라져 발이 제자리에서 미끄러지지 않는다.
          action.setEffectiveTimeScale((speed / baseSpeed) * walkRate)
        } else if (action.isRunning()) {
          action.stop()
        }
      },
    }),
    [actions, clip, baseSpeed, walkRate],
  )

  return (
    <group ref={fit}>
      <primitive object={scene} />
    </group>
  )
}
