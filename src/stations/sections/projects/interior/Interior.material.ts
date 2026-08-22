import type { Mesh, MeshStandardMaterial, Texture } from 'three'
import type { InteriorMaterialOverrides } from './Interior.types'

/** 금속으로 보는 기준. 이 위는 환경 반사가 있어야 보이므로 덮어쓰지 않는다. */
const METAL_THRESHOLD = 0.5

/**
 * 재질이 원래 갖고 있던 값. 재질은 캐시와 공유되므로 한 번 덮어쓰면 원본이 사라진다.
 * 기억해 두지 않으면 값을 되돌려도 새로고침 전에는 돌아오지 않는다.
 */
const originalRoughness = new WeakMap<MeshStandardMaterial, { value: number; map: Texture | null }>()

/** 메시가 쓰는 표준 재질. 배열이면 첫 번째만 본다(실내 모델은 메시마다 재질 하나다). */
function standardMaterialOf(mesh: Mesh): MeshStandardMaterial | null {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  const standard = material as MeshStandardMaterial
  return standard?.isMeshStandardMaterial ? standard : null
}

/**
 * 불러온 재질을 방이 정한 값으로 덮어쓴다.
 *
 * 대리석·바닥의 광택은 **환경 반사**에서 나온다 — 반사할 환경(`InteriorEnvironment`)이 있고
 * 표면이 매끈해야(`roughness`가 낮아야) 생긴다. 둘 중 하나만 빠져도 무광이 된다.
 *
 * **금속은 건드리지 않는다** — 확산광이 없어 환경 반사가 빠지면 검게 죽는다.
 * 재질은 원본 캐시와 공유되므로 같은 값을 여러 번 넣어도 결과가 같다.
 */
export function applyInteriorMaterial(mesh: Mesh, overrides: InteriorMaterialOverrides): void {
  const standard = standardMaterialOf(mesh)
  if (!standard) return
  if (standard.metalness >= METAL_THRESHOLD) return

  if (!originalRoughness.has(standard)) {
    originalRoughness.set(standard, { value: standard.roughness, map: standard.roughnessMap })
  }
  const original = originalRoughness.get(standard)!
  standard.roughnessMap = overrides.dropRoughnessMap ? null : original.map
  standard.roughness = overrides.roughness ?? original.value
  standard.envMapIntensity = overrides.envMapIntensity
  standard.normalScale.set(overrides.normalScale, overrides.normalScale)
  standard.needsUpdate = true
}

/**
 * 노멀맵을 쓰는 메시에 접선(TANGENT)을 채워 준다.
 *
 * 실내 모델에는 접선이 들어 있지 않다. 그러면 three는 노멀맵을 읽을 기준 축을 **화면 공간
 * 미분으로 추정**하는데, 그 추정은 카메라에 딸려 있어 멀거나 스치는 각도에서 무너진다.
 *
 * 노멀맵이 없는 메시는 접선을 쓰지 않으니 그냥 둔다.
 */
export function ensureInteriorTangents(mesh: Mesh): void {
  const standard = standardMaterialOf(mesh)
  if (!standard?.normalMap) return

  const geometry = mesh.geometry
  if (geometry.getAttribute('tangent')) return
  // index·position·normal·uv가 다 있어야 계산된다. 없으면 three가 콘솔로 알린다.
  if (!geometry.index || !geometry.getAttribute('uv')) return
  geometry.computeTangents()
}

/**
 * 지정한 재질에 **자기 환경맵**을 물린다. 그러면 씬 환경광 세기를 타지 않으면서
 * 반사 계산은 살아 있어 광택이 유지된다.
 *
 * 환경맵은 `InteriorEnvironment`가 씬에 걸어 둔 것을 쓰므로 그것이 준비된 뒤에 부른다.
 */
export function applyInteriorOwnEnv(
  root: import('three').Object3D,
  env: Texture,
  materials: readonly string[],
  intensity: number,
): void {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const standard = standardMaterialOf(mesh)
    if (!standard) return
    if (!materials.includes(standard.name)) return
    standard.envMap = env
    standard.envMapIntensity = intensity
    standard.needsUpdate = true
  })
}
