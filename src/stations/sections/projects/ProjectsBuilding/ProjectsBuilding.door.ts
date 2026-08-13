import {
  Box3,
  BufferGeometry,
  type Material,
  type Mesh,
  type Object3D,
  Vector3,
} from 'three'
import { buildIslandGeometry, findGeometryIslands } from '../../../../lib/geometryIslands'

/**
 * 건물 모델에서 **여닫을 문 한 장만** 떼어낸다.
 *
 * `door` 머티리얼이 문만 쓰는 것이 아니라 지붕 판까지 함께 쓰고 있어, 그 메시를 통째로 떼면
 * 엉뚱한 것이 딸려 온다. 덩어리로 가른 뒤 **세로로 선 판**만 문으로 보고, 그중 앞쪽 하나를 뽑는다.
 * 뒷문은 화면에 보이지 않으므로 본체에 그대로 남긴다.
 *
 * 문짝에는 **창이 박혀 있고 그것은 다른 머티리얼**이다. 머티리얼로 고르면 창이 제자리에 남으므로,
 * 문짝 범위 안에 들어오는 덩어리는 어느 메시에 있든 함께 떼어 낸다.
 */

/** 문이 붙어 있는 머티리얼 이름. */
const DOOR_MATERIAL = 'door'

/** 세워 둔 판으로 볼 최소 높이 — 지붕·바닥처럼 납작한 덩어리를 걸러낸다. */
const UPRIGHT_MIN_HEIGHT = 1e-3

/** 문짝 범위 안에 들었다고 볼 여유. 같은 평면에 붙은 조각을 놓치지 않을 만큼만 둔다. */
const INSIDE_TOLERANCE = 1e-3

/** 경첩 그룹 안에 그릴 조각 하나. 재질은 원래 있던 메시의 것을 그대로 쓴다. */
export interface DoorPart {
  geometry: BufferGeometry
  material: Material | Material[]
}

export interface SplitDoor {
  /** 함께 열릴 조각들(문짝 + 그 안에 박힌 창 등). 경첩이 원점이도록 옮겨져 있다. */
  parts: DoorPart[]
  /** 모델 좌표에서 경첩이 선 자리. */
  hinge: Vector3
  /** 모델 좌표에서 문짝이 차지하는 범위. 문간을 채우는 것들이 크기·자리를 여기서 잡는다. */
  box: Box3
  /** 떼어낸 만큼을 뺀 나머지. 원래 메시의 지오메트리를 이것으로 갈아끼운다. */
  replaced: { mesh: Mesh; geometry: BufferGeometry }[]
}

/** 트리 안의 메시를 모은다. */
function collectMeshes(root: Object3D): Mesh[] {
  const meshes: Mesh[] = []
  root.traverse((object) => {
    const mesh = object as Mesh
    if (mesh.isMesh) meshes.push(mesh)
  })
  return meshes
}

/** 그 메시의 머티리얼 이름(여럿이면 첫 번째). */
function materialName(mesh: Mesh): string | undefined {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  return material?.name
}

/** 덩어리 하나의 경계 상자. */
function islandBox(source: BufferGeometry, corners: number[]): Box3 {
  const geometry = buildIslandGeometry(source, [corners])
  geometry.computeBoundingBox()
  const box = geometry.boundingBox?.clone() ?? new Box3()
  geometry.dispose()
  return box
}

/** 안쪽 상자가 바깥 상자에 (여유만큼 넉넉히) 들어가는지. */
function isInside(inner: Box3, outer: Box3): boolean {
  return (
    inner.min.x >= outer.min.x - INSIDE_TOLERANCE &&
    inner.min.y >= outer.min.y - INSIDE_TOLERANCE &&
    inner.min.z >= outer.min.z - INSIDE_TOLERANCE &&
    inner.max.x <= outer.max.x + INSIDE_TOLERANCE &&
    inner.max.y <= outer.max.y + INSIDE_TOLERANCE &&
    inner.max.z <= outer.max.z + INSIDE_TOLERANCE
  )
}

/**
 * 앞문 한 장을 떼어낸다. 경첩은 `hingeRight`가 참이면 오른쪽(+x) 모서리다.
 * 문을 찾지 못하면 null이다 — 모델을 갈아끼웠을 때 조용히 아무것도 안 하는 편이 낫다.
 */
export function splitBuildingDoor(root: Object3D, hingeRight: boolean): SplitDoor | null {
  const meshes = collectMeshes(root)
  const doorMesh = meshes.find((mesh) => materialName(mesh) === DOOR_MATERIAL)
  if (!doorMesh) return null

  // 문짝 범위부터 정한다 — 세워 둔 판 중 앞쪽(-z)이다.
  const doorIslands = findGeometryIslands(doorMesh.geometry)
  let leafBox: Box3 | null = null
  for (const corners of doorIslands) {
    const box = islandBox(doorMesh.geometry, corners)
    if (box.max.y - box.min.y <= UPRIGHT_MIN_HEIGHT) continue
    if (!leafBox || box.getCenter(new Vector3()).z < leafBox.getCenter(new Vector3()).z) {
      leafBox = box
    }
  }
  if (!leafBox) return null

  const hinge = new Vector3(
    hingeRight ? leafBox.max.x : leafBox.min.x,
    0,
    leafBox.getCenter(new Vector3()).z,
  )

  const parts: DoorPart[] = []
  const replaced: { mesh: Mesh; geometry: BufferGeometry }[] = []

  for (const mesh of meshes) {
    const source = mesh.geometry
    const islands = mesh === doorMesh ? doorIslands : findGeometryIslands(source)
    const inside: number[][] = []
    const outside: number[][] = []

    for (const corners of islands) {
      if (isInside(islandBox(source, corners), leafBox)) inside.push(corners)
      else outside.push(corners)
    }
    if (inside.length === 0) continue

    const geometry = buildIslandGeometry(source, inside)
    // 경첩을 원점으로 옮긴다. 옮긴 만큼은 놓을 때 되돌린다.
    geometry.translate(-hinge.x, 0, -hinge.z)
    parts.push({ geometry, material: mesh.material })
    replaced.push({ mesh, geometry: buildIslandGeometry(source, outside) })
  }

  if (parts.length === 0) return null
  return { parts, hinge, box: leafBox, replaced }
}

/** 만들어 둔 지오메트리를 놓아준다. 원본은 건드리지 않았으므로 이것만 정리하면 된다. */
export function disposeDoor(split: SplitDoor): void {
  for (const part of split.parts) part.geometry.dispose()
  for (const rest of split.replaced) rest.geometry.dispose()
}
