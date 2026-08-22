import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Box3, type Mesh, type PointLight, Vector3 } from 'three'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { useGalleryPageStore } from '../../../../../state/useGalleryPageStore'
import {
  INTERIOR_COLLIDER_PREFIX,
  INTERIOR_TRIGGER_PREFIX,
  InteriorColliderView,
  applyInteriorMaterial,
  applyInteriorOwnEnv,
  clearInteriorCollision,
  ensureInteriorTangents,
  makeInteriorBlocker,
  setInteriorCollision,
  type InteriorBlocker,
  type InteriorColliderPart,
  type InteriorTrigger,
} from '../../interior'
import {
  GALLERY_DRACO_PATH,
  GALLERY_LIGHT_COLOR,
  GALLERY_LIGHT_DECAY,
  GALLERY_LIGHT_INTENSITY,
  GALLERY_LIGHT_RANGE,
  GALLERY_LIGHT_STANDOFF,
  GALLERY_MATERIAL,
  GALLERY_MODEL_URL,
  GALLERY_OVERHEAD_NAMES,
  GALLERY_OWN_ENV,
  GALLERY_WALKABLE_NAMES,
} from '../ProjectsGallery.constants'
import { assembleGallery } from './GalleryModel.assemble'
import type { GalleryModelProps } from './GalleryModel.types'

/**
 * 전시 공간 모델.
 *
 * 받아 온 것은 완성된 방이 아니라 부품이라, **먼저 조립하고**(`assembleGallery`) 그 결과를
 * 이름으로 갈라 쓴다 — `Collider_`는 밟는 바닥과 막는 것으로, `Trigger_`는 누를 자리로.
 * 로비와 같은 규약이라 판정·이동은 실내 공통 부품이 그대로 맡는다.
 *
 * 콜라이더·트리거는 개발용 표시색이 칠해져 있어 화면에서는 감춘다.
 * three의 레이캐스트는 `visible`을 보지 않으므로 감춰도 판정에는 그대로 쓰인다.
 */
export function GalleryModel({ bays }: GalleryModelProps) {
  const { scene } = useGLTF(GALLERY_MODEL_URL, GALLERY_DRACO_PATH)
  const sceneRoot = useThree((s) => s.scene)
  const setGeometry = useGalleryGeometryStore((s) => s.setGeometry)
  const clearGeometry = useGalleryGeometryStore((s) => s.clear)
  const showColliders = useGalleryPageStore((s) => s.showColliders)

  const { model, walkables, blockers, triggers, parts, bounds } = useMemo(() => {
    const { root, minX, maxX } = assembleGallery(scene.clone(true), bays)

    const walkables: Mesh[] = []
    const blockers: InteriorBlocker[] = []
    const triggers: Record<string, InteriorTrigger> = {}
    // 눈으로 볼 때 쓸 목록. 무엇이 어느 역할로 갈렸는지 여기서만 알 수 있다.
    const parts: InteriorColliderPart[] = []
    const box = new Box3()
    const size = new Vector3()
    const center = new Vector3()

    root.traverse((object) => {
      // glb는 광원을 담아 와도 **닿는 거리는 담기지 않아** 무한대로 들어온다. 여기서 잘라 준다.
      // 그림자는 켜지 않는다 — 벽등이 칸 수만큼 늘어나는데 포인트라이트 그림자는 하나가
      // 큐브맵 여섯 장이고, 벽에 붙은 액자라 접촉 그림자가 필요하지도 않다.
      const light = object as PointLight
      if (light.isPointLight) {
        light.color.set(GALLERY_LIGHT_COLOR)
        light.intensity = GALLERY_LIGHT_INTENSITY
        light.distance = GALLERY_LIGHT_RANGE
        light.decay = GALLERY_LIGHT_DECAY
        light.castShadow = false
        // 벽에 파묻힌 광원을 방 안쪽으로 떼어 놓는다. 붙어 있으면 웅덩이가 얇은 띠가 된다.
        // 벽등이 모두 북쪽 벽에 붙어 남쪽을 향하므로 z로만 민다.
        light.position.z += GALLERY_LIGHT_STANDOFF
        return
      }

      const mesh = object as Mesh
      if (!mesh.isMesh) return

      ensureInteriorTangents(mesh)
      applyInteriorMaterial(mesh, GALLERY_MATERIAL)

      const isCollider = mesh.name.startsWith(INTERIOR_COLLIDER_PREFIX)
      const isTrigger = mesh.name.startsWith(INTERIOR_TRIGGER_PREFIX)
      if (!isCollider && !isTrigger) return

      mesh.visible = false

      if (isTrigger) {
        // 트리거는 자리와 크기를 알리는 용도라 경계 상자면 충분하다.
        box.setFromObject(mesh)
        box.getSize(size)
        box.getCenter(center)
        triggers[mesh.name] = {
          x: center.x,
          y: center.y,
          z: center.z,
          width: size.x,
          height: size.y,
          depth: size.z,
        }
        parts.push({ mesh, kind: 'trigger' })
        return
      }

      if (GALLERY_WALKABLE_NAMES.includes(mesh.name)) {
        walkables.push(mesh)
        parts.push({ mesh, kind: 'walkable' })
        return
      }
      // 천장처럼 머리 위에 있는 것은 이동에 관여하지 않는다.
      if (GALLERY_OVERHEAD_NAMES.includes(mesh.name)) {
        parts.push({ mesh, kind: 'overhead' })
        return
      }

      // 경계 상자로 뭉개지 않고 면으로 읽는다 (DECISIONS 036).
      const blocker = makeInteriorBlocker(mesh)
      if (blocker) blockers.push(blocker)
      parts.push({ mesh, kind: blocker ? 'blocker' : 'none' })
    })

    return { model: root, walkables, blockers, triggers, parts, bounds: { minX, maxX } }
  }, [scene, bays])

  // 지정한 재질에 **자기 환경맵**을 물린다. 그러면 씬 환경광 세기를 타지 않으면서 반사 계산은
  // 살아 있어 광택이 유지된다. 환경맵은 `InteriorEnvironment`가 걸어 둔 것이라 그 뒤에 건다.
  const ownEnvDone = useRef(false)
  useFrame(() => {
    if (ownEnvDone.current) return
    const env = sceneRoot.environment
    if (!env) return
    ownEnvDone.current = true
    applyInteriorOwnEnv(model, env, GALLERY_OWN_ENV.materials, GALLERY_OWN_ENV.intensity)
  })

  // 판정에 쓸 것을 올린다. 떠날 때 비우지 않으면 다음에 들어올 때 낡은 메시를 붙든다.
  // 계단이 없어 단 중앙(`setInteriorStepCenters`)은 올리지 않는다.
  useEffect(() => {
    setInteriorCollision(walkables, blockers)
    return () => clearInteriorCollision()
  }, [walkables, blockers])

  useEffect(() => {
    setGeometry(triggers, bounds)
    return () => clearGeometry()
  }, [triggers, bounds, setGeometry, clearGeometry])

  return (
    <>
      <primitive object={model} />
      {/* 콜라이더를 눈으로 보는 표시. dev 게이트를 마운트 자리에 둬 프로덕션 번들에서 빠진다. */}
      {import.meta.env.DEV && <InteriorColliderView parts={parts} show={showColliders} />}
    </>
  )
}
