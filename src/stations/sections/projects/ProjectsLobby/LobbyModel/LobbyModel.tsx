import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Box3,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three'
import { useLobbyGeometryStore } from '../../../../../state/useLobbyGeometryStore'
import { useLobbyPageStore } from '../../../../../state/useLobbyPageStore'
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
  setInteriorStepCenters,
  type InteriorBlocker,
  type InteriorColliderPart,
  type InteriorTrigger,
} from '../../interior'
import {
  LOBBY_ARTWORK,
  LOBBY_BLOCKER_EXTEND_DOWN,
  LOBBY_DRACO_PATH,
  LOBBY_FIXTURE_PART,
  LOBBY_KEEP_DEPTH_GROUPS,
  LOBBY_LIGHT_COLOR,
  LOBBY_LIGHT_DECAY,
  LOBBY_LIGHT_INTENSITY,
  LOBBY_LIGHT_RANGE,
  LOBBY_LIGHT_STANDOFF,
  LOBBY_MATERIAL,
  LOBBY_OWN_ENV,
  LOBBY_MODEL_DEPTH_SCALE,
  LOBBY_MODEL_URL,
  LOBBY_MODEL_WIDTH_SCALE,
  LOBBY_OVERHEAD_NAMES,
  LOBBY_SHADOW,
  LOBBY_STEP_MESH,
  LOBBY_WALKABLE_NAMES,
} from '../ProjectsLobby.constants'
import { applyPageText, useLobbyBookPages } from '../LobbyBook'

/**
 * 액자 재질 이름과 사진 경로. **모듈에 굳혀 둔다** — 렌더 안에서 만들면 매번 새 값이 되어
 * 텍스처 훅도 새 값을 돌려주고, 모델을 자르고 콜라이더를 만드는 일이 렌더마다 다시 돈다.
 */
const ARTWORK_NAMES = Object.keys(LOBBY_ARTWORK)
const ARTWORK_PATHS = Object.values(LOBBY_ARTWORK)

/**
 * 액자 뒷판에 사진을 물린다. 모델이 액자마다 전용 재질을 갖고 있어 그것으로 짚는다.
 *
 * 바탕색은 흰색으로 둔다 — 재질에 남아 있는 색이 사진에 곱해지면 사진이 물든다.
 */
function applyArtwork(mesh: Mesh, artworks: Record<string, Texture>): void {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  const standard = material as MeshStandardMaterial
  if (!standard?.isMeshStandardMaterial) return

  const texture = artworks[standard.name]
  if (!texture) return

  standard.map = texture
  standard.color.set('#ffffff')
  standard.needsUpdate = true
}

/**
 * 깊이 배율에서 빼낼 덩어리를 원래 크기로 되돌린다. **자리는 늘어난 그대로 둔다.**
 *
 * 덩어리를 감싸는 그룹을 하나 만들어 거기에 `1/D` 배율을 걸고 그 안으로 옮긴다.
 * **메시의 로컬 배율을 건드리면 안 된다** — 돌아 있는 조각(비스듬히 놓인 책·연단 상판)은
 * 로컬 z가 월드 z가 아니라, 부모 배율과 상쇄되지 않고 찌그러진다. 회전보다 위에 걸어야 상쇄된다.
 *
 * 그 상태에서 덩어리 중심 `C`가 늘어난 자리(`C·D`)에 오도록 그룹을 `C·(1 − 1/D)`만큼 옮긴다.
 * 그룹 하나를 옮기는 것이라 조각끼리의 간격은 손댈 일이 없다.
 *
 * **배율을 걸기 전에 부른다** — 그때 재는 값이 곧 모델 좌표다.
 */
function keepDepth(root: Object3D): void {
  const inverse = 1 / LOBBY_MODEL_DEPTH_SCALE
  const box = new Box3()
  const center = new Vector3()

  for (const prefixes of LOBBY_KEEP_DEPTH_GROUPS) {
    const group: Mesh[] = []
    root.traverse((object) => {
      const mesh = object as Mesh
      if (mesh.isMesh && prefixes.some((prefix) => mesh.name.startsWith(prefix))) group.push(mesh)
    })
    if (group.length === 0) continue

    box.makeEmpty()
    for (const mesh of group) box.expandByObject(mesh)
    box.getCenter(center)

    const holder = new Object3D()
    holder.name = `KeepDepth_${prefixes[0]}`
    holder.scale.z = inverse
    holder.position.z = center.z * (1 - inverse)
    root.add(holder)
    // `add`가 이전 부모에서 떼어 온다. 옮긴 뒤에도 이름으로 훑는 다음 단계에 그대로 걸린다.
    for (const mesh of group) holder.add(mesh)
  }
}

/**
 * 로비 모델.
 *
 * 블렌더에서 콜라이더와 트리거를 함께 넣어 두었으므로 **이름으로 갈라** 쓴다 —
 * `Collider_`는 밟는 바닥과 막는 것으로, `Trigger_`는 나중에 누를 자리로.
 * 모델 파일은 손대지 않는다(DECISIONS 032).
 *
 * 콜라이더·트리거는 개발용 표시색이 칠해져 있어 화면에서는 감춘다.
 * three의 레이캐스트는 `visible`을 보지 않으므로 감춰도 판정에는 그대로 쓰인다.
 *
 * 방을 **좌우(x)·앞뒤(z)로 늘려** 쓴다. 모델 파일은 그대로 두고 불러온 것을 늘리며,
 * 늘린 자세를 반영한 **뒤에** 콜라이더·트리거를 잰다 — 재고 나서 늘리면 판정이 그림과 어긋난다.
 */
export function LobbyModel() {
  const { scene } = useGLTF(LOBBY_MODEL_URL, LOBBY_DRACO_PATH)
  const loaded = useTexture(ARTWORK_PATHS)
  const sceneRoot = useThree((s) => s.scene)
  const setTriggers = useLobbyGeometryStore((s) => s.setTriggers)
  const clearTriggers = useLobbyGeometryStore((s) => s.clearTriggers)
  const showColliders = useLobbyPageStore((s) => s.showColliders)

  // 훅이 돌려준 것은 캐시에 든 것이라 직접 고치지 않고 복제해서 설정을 건다.
  // glTF의 UV 원점은 위쪽이라 `flipY`를 꺼야 사진이 뒤집히지 않는다.
  const artworks = useMemo(() => {
    const prepared: Record<string, Texture> = {}
    ARTWORK_NAMES.forEach((name, index) => {
      const copy = loaded[index].clone()
      copy.colorSpace = SRGBColorSpace
      copy.flipY = false
      copy.needsUpdate = true
      prepared[name] = copy
    })
    return prepared
  }, [loaded])

  // 책 두 페이지에 얹을 글. 판은 그대로 두고 글꼴·데이터가 오면 다시 그려지므로,
  // 여기서는 텍스처만 받아 물려 두면 된다.
  const pageTextures = useLobbyBookPages()

  const { model, walkables, blockers, triggers, parts, stepCenters } = useMemo(() => {
    const model = scene.clone(true)
    // 늘어나면 안 되는 것을 먼저 골라 둔다. 배율을 걸기 전이라 여기서 잰 값이 곧 모델 좌표다.
    model.updateMatrixWorld(true)
    keepDepth(model)

    model.scale.set(LOBBY_MODEL_WIDTH_SCALE, 1, LOBBY_MODEL_DEPTH_SCALE)
    model.updateMatrixWorld(true)

    const walkables: Mesh[] = []
    const blockers: InteriorBlocker[] = []
    const triggers: Record<string, InteriorTrigger> = {}
    // 계단 단 중앙 z. 좌우 계단이 같은 깊이라 값이 겹치지만 가장 가까운 것을 고르는 데는 무관하다.
    const stepCenters: number[] = []
    // 눈으로 볼 때 쓸 목록. 무엇이 어느 역할로 갈렸는지 여기서만 알 수 있다.
    const parts: InteriorColliderPart[] = []
    const box = new Box3()
    const size = new Vector3()
    const center = new Vector3()

    model.traverse((object) => {
      // glb는 광원을 담아 와도 **닿는 거리는 담기지 않아** 무한대로 들어온다. 여기서 잘라 준다.
      // 그림자는 켜지 않는다 — 포인트라이트 그림자는 큐브맵 여섯 장씩이라 여섯개면 감당이 안 된다.
      const light = object as PointLight
      if (light.isPointLight) {
        light.color.set(LOBBY_LIGHT_COLOR)
        light.intensity = LOBBY_LIGHT_INTENSITY
        light.distance = LOBBY_LIGHT_RANGE
        light.decay = LOBBY_LIGHT_DECAY
        // 지정한 등만 그림자를 드리운다 — 켜는 개수가 곧 픽셀마다 훑는 횟수라 비용을 정한다.
        light.castShadow = LOBBY_SHADOW.enabled && LOBBY_SHADOW.casters.includes(light.name)
        if (light.castShadow) {
          light.shadow.mapSize.set(LOBBY_SHADOW.mapSize, LOBBY_SHADOW.mapSize)
          light.shadow.camera.near = LOBBY_SHADOW.cameraNear
          light.shadow.camera.far = LOBBY_SHADOW.cameraFar
          light.shadow.camera.updateProjectionMatrix()
          light.shadow.normalBias = LOBBY_SHADOW.normalBias
          light.shadow.bias = LOBBY_SHADOW.bias
          light.shadow.radius = LOBBY_SHADOW.radius
        }
        // 벽에 파묻힌 광원을 방 안쪽으로 떼어 놓는다. 붙어 있으면 웅덩이가 얇은 띠가 된다.
        light.position.x -= Math.sign(light.position.x) * LOBBY_LIGHT_STANDOFF
        return
      }

      const mesh = object as Mesh
      if (!mesh.isMesh) return

      ensureInteriorTangents(mesh)
      applyInteriorMaterial(mesh, LOBBY_MATERIAL)
      applyArtwork(mesh, artworks)
      // 글 쓰는 면에만 얹는다 — 옆면(종이 겹친 단면)까지 나오면 안 된다.
      applyPageText(mesh, pageTextures)

      const isCollider = mesh.name.startsWith(INTERIOR_COLLIDER_PREFIX)
      const isTrigger = mesh.name.startsWith(INTERIOR_TRIGGER_PREFIX)
      if (!isCollider && !isTrigger) {
        mesh.receiveShadow = true
        // 조명 기구는 제 그림자를 드리우지 않는다 — 등이 스스로를 가려 벽에 검은 얼룩이 생긴다.
        mesh.castShadow = !LOBBY_FIXTURE_PART.test(mesh.name)
        // 판정용 계단은 경사 슬래브라 단이 없다. 단마다 따로 있는 그림에서 단 중앙 z를 얻는다.
        if (LOBBY_STEP_MESH.test(mesh.name)) {
          box.setFromObject(mesh)
          stepCenters.push((box.min.z + box.max.z) / 2)
        }
        return
      }

      mesh.visible = false
      // 판정에만 쓰는 것이라 그림자에도 끼지 않는다.
      mesh.castShadow = false
      mesh.receiveShadow = false

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
        // 누를 자리이면서 막는 것이기도 하다 — 연단·통로 입구를 뚫고 지나가지 않게 한다.
        const trigger = makeInteriorBlocker(mesh)
        if (trigger) blockers.push(trigger)
        parts.push({ mesh, kind: 'trigger' })
        return
      }

      if (LOBBY_WALKABLE_NAMES.includes(mesh.name)) {
        walkables.push(mesh)
        parts.push({ mesh, kind: 'walkable' })
        return
      }
      // 천장처럼 머리 위에 있는 것은 이동에 관여하지 않는다.
      if (LOBBY_OVERHEAD_NAMES.includes(mesh.name)) {
        parts.push({ mesh, kind: 'overhead' })
        return
      }

      // 경계 상자로 뭉개지 않고 면으로 읽는다 — 기울여 놓은 난간·벽이 그대로 살아난다.
      // 아래가 뚫린 콜라이더는 그대로 내려 메운다.
      const extendDown = LOBBY_BLOCKER_EXTEND_DOWN[mesh.name] ?? 0
      const blocker = makeInteriorBlocker(mesh, extendDown)
      if (blocker) blockers.push(blocker)
      parts.push({ mesh, kind: blocker ? 'blocker' : 'none', extendDown })
    })

    stepCenters.sort((a, b) => a - b)

    return { model, walkables, blockers, triggers, parts, stepCenters }
  }, [scene, artworks, pageTextures])

  // 그림자를 **한 번만 굽고 얼린다.** 방은 정지해 있어 다시 그릴 이유가 없고,
  // 그러지 않으면 포인트라이트 여섯 개가 매 프레임 큐브맵 여섯 장씩을 다시 그려 성능을 다 먹는다.
  // (움직이는 캐릭터는 그림자를 드리우지 않는다 — 드리우게 하려면 얼림을 풀어야 한다.)
  const frozen = useRef(false)
  useFrame((state) => {
    if (frozen.current) return
    frozen.current = true
    state.gl.shadowMap.autoUpdate = false
    state.gl.shadowMap.needsUpdate = true
  })

  // 지정한 재질에 **자기 환경맵**을 물린다. 그러면 씬 환경광 세기(`LOBBY_ENV`)를 타지 않으면서
  // 반사 계산은 살아 있어 광택이 유지된다. 환경맵은 `InteriorEnvironment`가 씬에 걸어 둔 것을 쓰므로,
  // 그것이 준비된 뒤(첫 프레임)에 한 번만 건다.
  const ownEnvDone = useRef(false)
  useFrame(() => {
    if (ownEnvDone.current) return
    const env = sceneRoot.environment
    if (!env) return
    ownEnvDone.current = true
    applyInteriorOwnEnv(model, env, LOBBY_OWN_ENV.materials, LOBBY_OWN_ENV.intensity)
  })

  // 판정에 쓸 것을 올린다. 떠날 때 비우지 않으면 다음에 들어올 때 낡은 메시를 붙든다.
  useEffect(() => {
    setInteriorCollision(walkables, blockers)
    setInteriorStepCenters(stepCenters)
    return () => clearInteriorCollision()
  }, [walkables, blockers, stepCenters])

  useEffect(() => {
    setTriggers(triggers)
    return () => clearTriggers()
  }, [triggers, setTriggers, clearTriggers])

  return (
    <>
      <primitive object={model} />
      {/* 콜라이더를 눈으로 보는 표시. dev 게이트를 마운트 자리에 둬 프로덕션 번들에서 빠진다. */}
      {import.meta.env.DEV && <InteriorColliderView parts={parts} show={showColliders} />}
    </>
  )
}
