import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  AlwaysStencilFunc,
  Box3,
  DoubleSide,
  EqualStencilFunc,
  type Group,
  MathUtils,
  Matrix4,
  type Mesh,
  MeshBasicMaterial,
  ReplaceStencilOp,
  Vector3,
} from 'three'
import { useCareerLogoStore } from '../../../../../state/useCareerLogoStore'
import { useCareerPageStore } from '../../../../../state/useCareerPageStore'
import { useCareerLogoPose } from '../AboutCareer.hooks'
import {
  TROPHY_SHADOW_FILL_MARGIN,
  TROPHY_SHADOW_ORDER,
  TROPHY_SHADOW_STENCIL_REF,
  TROPHY_SHADOW_Y,
  TROPHY_URL,
  TROPHY_Y,
} from './CareerTrophy.constants'
import type { CareerTrophyProps } from './CareerTrophy.types'

/**
 * Career 영역에 놓인 트로피 — 종이 위에 세워 둔 3D 모델.
 *
 * 모델마다 원본 크기가 제각각이라 경계 상자를 재 **세로 1**로 맞춰 두고, 실제 크기는 배율로 준다.
 * 그래야 HUD의 "세로크기"가 모델과 무관하게 월드 유닛을 뜻한다.
 * 좌표는 영역 중심 기준이라 영역을 옮기거나 크기를 바꿔도 함께 따라온다.
 * 클릭·이동 판정은 밑에 깔린 영역 판이 맡으므로 레이캐스트에서 뺀다.
 *
 * 활성화되면 돌아간 각도를 펴고 **뒤로 눕으면서** 줄어들어 제 칸의 제목 자리로 물러난다.
 * 눕히지 않으면 정면뷰에서 위통수만 보인다. 누운 그림에는 선 그림자가 뜻이 없으므로 함께 걷힌다.
 *
 * 세워 둔 동안 바닥에 붙어 보이도록 **그림자를 따로 깐다**(신호등과 같은 뜻).
 * 다만 그림은 판 한 장이 아니라 부품이 여럿인 모델이라, 반투명하게 겹쳐 그리면 겹친 곳만 진해진다.
 * 그래서 실루엣을 스텐실에 표시해 두고 **그 자리만 한 겹 칠한다** — 몇 겹이 겹치든 진하기가 같고,
 * 알파로 섞으니 밑의 모눈종이도 비친다.
 */
export function CareerTrophy({ column, logo }: CareerTrophyProps) {
  const trophy = useCareerPageStore((s) => s.trophy)
  const setWidth = useCareerLogoStore((s) => s.setWidth)
  const { scene } = useGLTF(TROPHY_URL)

  const { model, footprint, widthRatio, unitScale, base } = useMemo(() => {
    const model = scene.clone(true)
    model.traverse((object) => {
      object.raycast = () => null
    })

    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // 밑면을 바닥에 대고 가로·깊이 중심을 원점에 맞춘다(모델 원점이 어디에 있든 무관해진다).
    return {
      model,
      footprint: Math.max(size.x, size.z) / (size.y || 1),
      widthRatio: size.x / (size.y || 1),
      unitScale: 1 / (size.y || 1),
      base: [-center.x, -box.min.y, -center.z] as [number, number, number],
    }
  }, [scene])

  // 로고 자리를 왼쪽 끝에 맞추고 제목을 오른쪽에 붙이는 쪽이 이 가로를 본다.
  // 줄어든 뒤의 가로를 올린다 — 쓰는 쪽이 배율을 다시 알 필요가 없다.
  useEffect(() => {
    setWidth(column, widthRatio * trophy.height * logo.scale)
  }, [setWidth, column, widthRatio, trophy.height, logo.scale])

  // 실루엣을 표시만 하는 몫. 색도 깊이도 쓰지 않고 스텐실에 자국만 남긴다.
  const mask = useMemo(() => {
    const material = new MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false,
      stencilWrite: true,
      stencilFunc: AlwaysStencilFunc,
      stencilRef: TROPHY_SHADOW_STENCIL_REF,
      stencilZPass: ReplaceStencilOp,
      // 납작하게 눌린 면은 앞뒤가 뜻이 없어진다. 한쪽만 그리면 실루엣에 구멍이 뚫린다.
      side: DoubleSide,
    })
    const model = scene.clone(true)
    model.traverse((object) => {
      object.raycast = () => null
      const mesh = object as Mesh
      if (mesh.isMesh) mesh.material = material
    })
    return { model, material }
  }, [scene])

  useEffect(() => () => mask.material.dispose(), [mask])

  /**
   * 위에서 내려다본 모습을 바닥으로 눌러 눕히는 변환.
   * 높이가 곧 눕는 거리라 위로 솟은 곳일수록 멀리 밀리고, 손잡이처럼 옆으로 뻗은 것도 그대로 남는다.
   * (모델을 통째로 옆으로 눕히면 몸체 뒤에 가려 사라진다.)
   */
  const shadowMatrix = useMemo(() => {
    const angle = MathUtils.degToRad(trophy.shadowAngle)
    const reachX = trophy.shadowLength * Math.sin(angle)
    const reachZ = -trophy.shadowLength * Math.cos(angle)
    // 2행이 전부 0이라 높이가 사라지고, 그 자리에 바닥에서 띄우는 값만 남는다.
    return new Matrix4().set(
      1, reachX, 0, 0,
      0, 0, 0, TROPHY_SHADOW_Y,
      0, reachZ, 1, 0,
      0, 0, 0, 1,
    )
  }, [trophy.shadowAngle, trophy.shadowLength])

  const place = useRef<Group>(null)
  const roll = useRef<Group>(null)
  const body = useRef<Group>(null)
  const silhouette = useRef<Group>(null)
  const shear = useRef<Group>(null)
  const fill = useRef<MeshBasicMaterial>(null)

  useLayoutEffect(() => {
    const group = shear.current
    if (!group) return
    // 밀기·돌리기·키우기로는 못 만드는 변환이라 행렬을 직접 넣는다.
    group.matrixAutoUpdate = false
    group.matrix.copy(shadowMatrix)
    group.matrixWorldNeedsUpdate = true
  }, [shadowMatrix])

  /** 두 자세를 섞어 적용한다. 0이면 평소 자리, 1이면 로고 자리. */
  const applyPose = useCallback(
    (progress: number) => {
      if (!place.current || !roll.current || !body.current || !silhouette.current) return
      place.current.position.set(
        MathUtils.lerp(trophy.x, logo.x, progress),
        0,
        MathUtils.lerp(trophy.z, logo.z, progress),
      )
      // 로고에서는 정면을 맞추는 각도로 돌아간 뒤 눕는다(y로 먼저 돌고 x로 눕는 순서).
      // 목표 각도에 반 바퀴씩 얹어 가는 동안만 더 돈다. 앞뒤가 같은 모델이라 도착 자세는 그대로다.
      const spin = trophy.logoTurn + trophy.logoTurns * 180
      const turn = MathUtils.degToRad(MathUtils.lerp(trophy.rotation, spin, progress))
      const tilt = MathUtils.degToRad(trophy.logoTilt) * progress
      const scale = trophy.height * unitScale * MathUtils.lerp(1, logo.scale, progress)
      body.current.rotation.set(tilt, turn, 0)
      body.current.scale.setScalar(scale)
      // 회전축이 밑동이라 눕히면 위로만 뻗어 다른 로고보다 떠 보인다. 누운 만큼 절반 높이를 내려 중심을 맞춘다.
      // 화면 안에서 도는 것은 눕힌 뒤에 걸려야 하므로 바깥 그룹이 맡고, 그 자리가 곧 로고 중심이라 제자리에서 돈다.
      const laid = trophy.height * MathUtils.lerp(1, logo.scale, progress)
      roll.current.position.set(0, TROPHY_Y, (laid / 2) * Math.abs(Math.sin(tilt)))
      roll.current.rotation.set(0, MathUtils.degToRad(trophy.logoRoll) * progress, 0)
      // 그림자는 세워 둔 동안의 것이라 눕는 만큼 걷힌다. 실루엣은 서 있는 자세 그대로 둔다.
      silhouette.current.rotation.set(0, turn, 0)
      silhouette.current.scale.setScalar(scale)
      if (fill.current) fill.current.opacity = trophy.shadowOpacity * (1 - progress)
    },
    [trophy, logo, unitScale],
  )

  useCareerLogoPose(applyPose)

  // 실루엣이 뻗어 나갈 수 있는 범위 — 밑면 크기에 눕는 거리를 더한다.
  const fillSize =
    (footprint + Math.abs(trophy.shadowLength)) * trophy.height * TROPHY_SHADOW_FILL_MARGIN

  return (
    <group ref={place}>
      <group ref={roll}>
        <group ref={body}>
          <primitive object={model} position={base} />
        </group>
      </group>

      {/* 그림자 실루엣 표시. 눕히는 방향은 맵 기준이라 트로피를 돌려도 따라 돌지 않는다. */}
      <group ref={shear}>
        <group ref={silhouette}>
          <primitive object={mask.model} position={base} />
        </group>
      </group>

      {/* 표시된 자리에만 한 겹 칠한다. 판이 넉넉해도 스텐실이 실루엣 밖을 걸러낸다. */}
      <mesh
        position={[0, TROPHY_SHADOW_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={TROPHY_SHADOW_ORDER}
        raycast={() => null}
      >
        <planeGeometry args={[fillSize, fillSize]} />
        <meshBasicMaterial
          ref={fill}
          color="#000000"
          transparent
          opacity={trophy.shadowOpacity}
          depthWrite={false}
          toneMapped={false}
          stencilWrite
          stencilFunc={EqualStencilFunc}
          stencilRef={TROPHY_SHADOW_STENCIL_REF}
        />
      </mesh>
    </group>
  )
}

// 필요해진 순간에 받기 시작하면 그때 서스펜드가 걸려 이미 떠 있던 것들이 사라졌다 돌아온다.
useGLTF.preload(TROPHY_URL)
