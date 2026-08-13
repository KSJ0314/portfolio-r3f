import {
  Box3,
  BufferGeometry,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
  Vector3,
} from 'three'
import { buildIslandGeometry, findGeometryIslands } from '../../../lib/geometryIslands'

/**
 * 자동차 모델을 **덩어리 단위로 갈라** 바퀴를 따로 뽑는다.
 *
 * 받아 온 glb는 노드도 메시도 하나라 바퀴가 따로 없지만, 지오메트리를 뜯어 보면
 * 차체·바퀴·헤드라이트가 서로 닿지 않은 별개의 덩어리다. 모델 파일은 손대지 않으므로
 * 가져온 원본이 그대로 유지된다.
 */

/** 바닥에 닿았다고 볼 높이 — 모델 전체 높이 대비 비율이라 크기가 달라도 뜻이 유지된다. */
const GROUND_TOLERANCE = 0.03

/** 원기둥의 단면으로 볼 두 축의 크기 차이(둘 중 큰 쪽 대비). */
const ROUND_TOLERANCE = 0.15

/** 회전축 방향이 단면보다 이만큼은 얇아야 바퀴로 본다. */
const THIN_RATIO = 0.7

export interface CarWheel {
  /** 중심을 원점으로 옮긴 바퀴. 그 자리에서 돌면 축이 어긋나지 않는다. */
  geometry: BufferGeometry
  /** 모델 좌표에서 이 바퀴가 놓인 자리. */
  center: Vector3
}

export interface SplitCar {
  /** 바퀴를 뺀 나머지 전부(차체·헤드라이트 등)를 하나로 합친 것. */
  body: BufferGeometry
  wheels: CarWheel[]
  /**
   * 원본이 쓰는 색 텍스처(팔레트 한 장). 재질은 쓰는 쪽이 이 값으로 새로 만든다 —
   * 캐시에 든 원본을 복제해 고치면 페이드를 걸 때마다 그 원본까지 건드리게 된다.
   */
  map: Texture | null
  /** 바퀴 반지름(모델 좌표). 굴림각을 구하는 데 쓴다. */
  radius: number
  /** 모델 전체 길이(앞뒤). 월드 크기를 배율로 환산할 때 쓴다. */
  length: number
  /** 바퀴가 도는 축 — 0=x · 1=y · 2=z. */
  axis: number
}

/** 트리에서 첫 메시를 찾는다. 이 모델은 메시가 하나뿐이다. */
function findMesh(root: Object3D): Mesh | null {
  let found: Mesh | null = null
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!found && mesh.isMesh) found = mesh
  })
  return found
}

/**
 * 모델을 바퀴와 나머지로 가른다.
 *
 * 바퀴는 **바닥에 닿아 있고 한 축으로 얇은 원기둥**인 덩어리다.
 * 정점 개수로 고르지 않는다 — 모델을 갈아끼우면 곧 틀린 기준이 된다.
 */
export function splitCar(root: Object3D): SplitCar | null {
  const mesh = findMesh(root)
  if (!mesh) return null

  const source = mesh.geometry
  source.computeBoundingBox()
  const wholeBox = source.boundingBox ?? new Box3()
  const wholeSize = wholeBox.getSize(new Vector3())
  const groundLimit = wholeBox.min.y + wholeSize.y * GROUND_TOLERANCE

  const wheelIslands: { corners: number[]; box: Box3; radius: number; axis: number }[] = []
  const bodyIslands: number[][] = []

  for (const corners of findGeometryIslands(source)) {
    const geometry = buildIslandGeometry(source, [corners])
    geometry.computeBoundingBox()
    const box = geometry.boundingBox ?? new Box3()
    const size = box.getSize(new Vector3())
    geometry.dispose()

    // 가장 얇은 축을 회전축 후보로 본다. 나머지 두 축이 원(같은 크기)이면 바퀴다.
    const sizes = [size.x, size.y, size.z]
    const axis = sizes.indexOf(Math.min(...sizes))
    const cross = sizes.filter((_, i) => i !== axis)
    const round = Math.abs(cross[0] - cross[1]) <= Math.max(...cross) * ROUND_TOLERANCE
    const thin = sizes[axis] <= Math.max(...cross) * THIN_RATIO

    if (box.min.y <= groundLimit && round && thin) {
      // 반지름은 단면(회전축이 아닌 축)의 절반이다.
      wheelIslands.push({ corners, box, radius: Math.max(...cross) / 2, axis })
    } else {
      bodyIslands.push(corners)
    }
  }

  const body = buildIslandGeometry(source, bodyIslands)
  const wheels = wheelIslands.map(({ corners, box }) => {
    const center = box.getCenter(new Vector3())
    const geometry = buildIslandGeometry(source, [corners])
    // 제자리에서 돌도록 중심을 원점으로 옮긴다. 옮긴 만큼은 놓을 때 되돌린다.
    geometry.translate(-center.x, -center.y, -center.z)
    return { geometry, center }
  })

  // 네 바퀴가 같은 크기라 첫 것으로 대표한다. 바퀴가 없으면 굴릴 것도 없다.
  const first = wheelIslands[0]
  const sourceMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material

  return {
    body,
    wheels,
    map: (sourceMaterial as MeshStandardMaterial).map ?? null,
    radius: first?.radius ?? 0,
    length: wholeSize.z,
    axis: first?.axis ?? 0,
  }
}

/** 만들어 둔 지오메트리를 놓아준다. 원본은 건드리지 않았으므로 이것만 정리하면 된다. */
export function disposeCar(car: SplitCar): void {
  car.body.dispose()
  for (const wheel of car.wheels) wheel.geometry.dispose()
}
