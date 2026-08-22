import { Box3, type Mesh, MathUtils, Plane, Raycaster, Vector3 } from 'three'
import {
  INTERIOR_BLOCKER_FOOT_RATIO,
  INTERIOR_FLOOR_RAY_LENGTH,
  INTERIOR_STEP_UP,
} from './Interior.constants'
import type { InteriorFrontTaper } from './Interior.types'

/**
 * 실내의 걷는 바닥과 막는 것.
 *
 * 모델이 콜라이더를 따로 갖고 있으므로 판정은 그것에 맡긴다 — 무엇이 바닥이고 무엇이 벽인지는
 * **모델을 읽는 쪽**이 이름으로 갈라 여기에 올리고, 걷는 쪽은 목록만 본다.
 * 맵의 `useBlockersStore`와 달리 막는 것을 사각형이 아니라 **면 여럿을 가진 볼록체**로 둔다.
 * 블렌더에서 기울여 놓은 난간·벽을 축 정렬 상자로 재면 기울기가 사라져 계단을 침범한다.
 *
 * 매 프레임 판정에 쓰는 three 객체라 zustand가 아니라 모듈에 둔다.
 */

/** 막는 것 하나. */
export interface InteriorBlocker {
  /** 바깥을 향하는 면. 모든 면의 안쪽이면 그 안에 있는 것이다. */
  planes: Plane[]
  /** 면 검사에 들어가기 전에 걸러내는 경계 상자. */
  bounds: Box3
}

/** 같은 면으로 볼 오차. 법선 방향과 원점까지의 거리를 함께 본다. */
const PLANE_EPSILON = 1e-4

/** 수평으로 밀 수 없다고 보는 면. 법선의 수평 성분이 이보다 작으면 밀 방향으로 고르지 않는다. */
const MIN_HORIZONTAL = 1e-3

/** 앞(카메라 쪽)을 보는 면으로 치는 기준. 뾰족하게 깎을 때 이 면들을 걷어낸다. */
const FRONT_FACING = 0.5

let walkables: Mesh[] = []
let blockers: InteriorBlocker[] = []
let stepCenters: number[] = []

const _raycaster = new Raycaster()
const _origin = new Vector3()
const DOWN = new Vector3(0, -1, 0)

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()
const _inside = new Vector3()
const _normal = new Vector3()
const _corner = new Vector3()

/**
 * 콜라이더 메시를 볼록체로 읽는다. 삼각형마다 월드로 옮겨 면을 만들고 같은 면은 합치므로,
 * 블렌더에서 기울여 구운 상자면 기울어진 면 여섯 장이 나온다.
 *
 * 면을 **옮긴 정점의 외적**으로 만들기 때문에 모델에 건 배율이 그대로 반영된다 —
 * 비균등 배율에서 법선을 역전치로 따로 옮길 일이 없다.
 *
 * **감는 방향은 믿지 않는다.** 거울로 복제한 콜라이더는 면이 뒤집혀 있어 법선이 안쪽을 향하고,
 * 그러면 캐릭터가 어디에 있든 밖으로 읽혀 한 번도 막지 못한다. 안쪽인 점을 따로 구해 바로잡는다.
 *
 * **볼록한 것만 다룬다.** 오목한 콜라이더는 그 볼록 껍질처럼 굳는다.
 *
 * `extendDown`을 주면 그만큼 **아래로 늘린다.** 모델에 없는 면을 새 상자로 만들면 기울기가 사라지므로,
 * 기울어진 난간 아래를 메울 때처럼 있는 것을 그대로 내리는 편이 낫다.
 *
 * `taperFront`를 주면 **카메라 쪽(+z) 앞모서리를 깎아** 위에서 본 모양을 오각형으로 만든다.
 */
export function makeInteriorBlocker(
  mesh: Mesh,
  extendDown = 0,
  taperFront?: InteriorFrontTaper,
): InteriorBlocker | null {
  const position = mesh.geometry.getAttribute('position')
  if (!position || position.count === 0) return null

  const bounds = new Box3()
  // 정점 평균은 볼록체라면 반드시 안쪽에 떨어진다. 경계 상자 중심과 달리 좌우 대칭이 아닌
  // 쐐기 모양에서도 어긋나지 않아, 면의 안팎을 가리는 기준으로 쓴다.
  _inside.set(0, 0, 0)
  for (let i = 0; i < position.count; i += 1) {
    _a.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld)
    bounds.expandByPoint(_a)
    _inside.add(_a)
  }
  _inside.divideScalar(position.count)

  const index = mesh.geometry.getIndex()
  const count = index ? index.count : position.count
  const planes: Plane[] = []

  for (let i = 0; i + 2 < count; i += 3) {
    _a.fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(mesh.matrixWorld)
    _b.fromBufferAttribute(position, index ? index.getX(i + 1) : i + 1).applyMatrix4(mesh.matrixWorld)
    _c.fromBufferAttribute(position, index ? index.getX(i + 2) : i + 2).applyMatrix4(mesh.matrixWorld)

    const plane = new Plane().setFromCoplanarPoints(_a, _b, _c)
    // 넓이가 0인 삼각형은 법선이 서지 않는다.
    if (plane.normal.lengthSq() < 0.5) continue
    // 안쪽인 점이 바깥에 있으면 뒤집힌 면이다. 합치기 전에 바로잡아야 한 장으로 모인다.
    if (plane.distanceToPoint(_inside) > 0) plane.negate()

    const same = planes.some(
      (kept) =>
        kept.normal.dot(plane.normal) > 1 - PLANE_EPSILON &&
        Math.abs(kept.constant - plane.constant) < PLANE_EPSILON,
    )
    if (!same) planes.push(plane)
  }

  // 면이 넷보다 적으면 닫힌 덩어리가 아니라 판이나 조각이다. 안팎을 가릴 수 없어 막는 것으로 쓰지 않는다.
  if (planes.length < 4) return null

  if (taperFront) addFrontTaper(planes, bounds, taperFront)

  if (extendDown > 0) {
    // 아래로 늘리는 것은 **아래를 보는 면만** 그만큼 바깥으로 미는 일이다(캐릭터 기둥만큼 부풀리는 것과 같은 계산).
    // 안쪽이 음수인 평면식이라 바깥으로 미는 것은 상수를 빼는 것이다.
    for (const plane of planes) plane.constant -= Math.max(0, -plane.normal.y * extendDown)
    // 경계도 함께 내려야 빠른 제외에서 걸러지지 않는다.
    bounds.min.y -= extendDown
  }

  return { planes, bounds }
}

/**
 * 앞(+z)이 뾰족해지도록 **앞면을 걷어내고 경사면 두 장으로 갈아 끼운다.**
 *
 * 앞을 정면으로 만나면 사각형은 좌우 어느 쪽으로도 확실히 밀어내지 못해 길을 막지만,
 * 뾰족하면 닿는 순간 옆으로 미끄러진다.
 *
 * **앞면을 남겨 두면 소용이 없다.** 모양은 경사면이 이미 깎아 오각형이 되지만, 밀어내기는
 * 빠져나가는 데 가장 덜 움직이는 면을 고르고 **정면에서는 늘 축에 나란한 앞면이 가장 얕다.**
 * 그러면 걸음과 정반대로 되밀려 그 자리에 멎는다.
 *
 * 좌표는 잰 경계 상자에서 비율로 끌어낸다. 모델을 다시 내보내도 따라온다.
 * 경계는 그대로 둔다 — 빠른 제외에 쓰는 값이라 넓은 쪽이 안전하다.
 * 경사면을 경계 상자로 세우므로 **축에 나란한 상자**를 전제한다.
 */
function addFrontTaper(planes: Plane[], bounds: Box3, taper: InteriorFrontTaper): void {
  const centerX = (bounds.min.x + bounds.max.x) / 2
  const halfWidth = (bounds.max.x - bounds.min.x) / 2
  // 좁아지기 시작하는 깊이. 비율이 1이면 뒷면에서부터, 0.5면 옆면 중앙에서부터 모인다.
  const taperDepth = (bounds.max.z - bounds.min.z) * Math.min(taper.depth, 1)
  if (halfWidth <= 0 || taperDepth <= 0) return

  // 앞을 보는 면을 걷어낸다. 남겨 두면 밀어내기가 늘 그것을 골라 정면으로 되민다.
  for (let i = planes.length - 1; i >= 0; i -= 1) {
    if (planes[i].normal.z > FRONT_FACING) planes.splice(i, 1)
  }

  const startZ = bounds.max.z - taperDepth
  const midZ = (bounds.min.z + bounds.max.z) / 2
  // 꼭짓점은 가운데에서 비켜 둔다. 대칭이면 정면으로 마주 선 캐릭터가 어느 쪽으로도 밀리지 못한다.
  const tipX = MathUtils.clamp(centerX + halfWidth * taper.tip, bounds.min.x, bounds.max.x)

  // 두 변은 기울기가 서로 다르다(꼭짓점이 비켜 있다). 감는 방향 대신 **안쪽인 점**으로 바깥을 가린다.
  for (const startX of [bounds.min.x, bounds.max.x]) {
    _normal.set(-taperDepth, 0, tipX - startX).normalize()
    if (_normal.x * (centerX - startX) + _normal.z * (midZ - startZ) > 0) _normal.negate()
    _corner.set(startX, bounds.min.y, startZ)
    planes.push(new Plane().setFromNormalAndCoplanarPoint(_normal, _corner))
  }
}

/** 모델을 읽은 쪽이 갈라낸 것을 올린다. */
export function setInteriorCollision(nextWalkables: Mesh[], nextBlockers: InteriorBlocker[]): void {
  walkables = nextWalkables
  blockers = nextBlockers
}

/**
 * 눈에 보이는 계단에서 잰 단 중앙 z를 올린다. 계단이 없는 방은 부르지 않는다.
 *
 * 판정용 계단은 단이 아니라 경사 슬래브 하나라 코드에 단 개념이 없다.
 * 단마다 따로 있는 그림 쪽을 재서 자리를 얻는다.
 * 좌우 계단은 같은 깊이에 놓이므로 한 목록으로 합쳐 둔다.
 */
export function setInteriorStepCenters(centers: number[]): void {
  stepCenters = centers
}

/** 가장 가까운 단 중앙 z. 잰 것이 없으면 그대로 돌려준다. */
export function snapToInteriorStepZ(z: number): number {
  let best = z
  let bestGap = Infinity
  for (const center of stepCenters) {
    const gap = Math.abs(center - z)
    if (gap < bestGap) {
      bestGap = gap
      best = center
    }
  }
  return best
}

/** 방을 떠날 때 비운다 — 남겨 두면 다음에 들어올 때 낡은 메시를 붙든다. */
export function clearInteriorCollision(): void {
  walkables = []
  blockers = []
  stepCenters = []
}

/** 목표점을 정할 때 쏘는 대상. 걷는 바닥만 맞아야 벽·난간을 눌러도 그리로 가지 않는다. */
export function getInteriorWalkables(): Mesh[] {
  return walkables
}

/**
 * 그 자리에서 밟게 되는 바닥 높이. 밟을 것이 없으면 null이다(허공).
 *
 * **지금 발밑에서 오름 한계만큼 위에서** 아래로 쏜다. 하늘에서 쏘면 2층 밑을 걸을 때
 * 위층 바닥을 잡고, 발밑에서 쏘면 경사면을 한 걸음도 오르지 못한다.
 */
export function interiorFloorHeight(x: number, z: number, fromY: number): number | null {
  if (walkables.length === 0) return null
  _origin.set(x, fromY + INTERIOR_STEP_UP, z)
  _raycaster.set(_origin, DOWN)
  _raycaster.far = INTERIOR_FLOOR_RAY_LENGTH
  // 거리순으로 정렬돼 오므로 첫 번째가 그 자리에서 가장 높은 바닥면이다.
  const hit = _raycaster.intersectObjects(walkables, false)[0]
  return hit ? hit.point.y : null
}

/**
 * 막는 것 밖으로 밀어낸다(**수평으로 빠져나가는 데 가장 덜 움직이는 면** 쪽으로).
 * 그 면만 되돌리므로 벽을 따라 미끄러진다.
 *
 * 캐릭터는 반지름 `radius`의 수평 원판에 발밑부터 머리까지의 세로 구간을 곱한 기둥이다.
 * 그 기둥만큼 볼록체를 부풀리면 면마다 바깥으로 나가는 거리가 정해지고(민코프스키 합의 지지함수),
 * 발밑 점이 부푼 면 전부의 안쪽이면 파고든 것이다.
 *
 * **발밑 몫은 빼고 잰다** — 밟고 선 면과 윗면이 같은 상자가 발에 걸리면 빈 바닥에서 옆으로 밀린다.
 * 미는 방향은 **수평 성분만** 쓴다. 높이는 밟는 바닥이 따로 정하므로 여기서 건드리면 서로 싸운다.
 */
export function pushOutOfInteriorBlockers(point: Vector3, radius: number, height: number): void {
  const low = height * INTERIOR_BLOCKER_FOOT_RATIO
  const high = height

  for (const blocker of blockers) {
    const { min, max } = blocker.bounds
    if (point.x <= min.x - radius || point.x >= max.x + radius) continue
    if (point.z <= min.z - radius || point.z >= max.z + radius) continue
    if (point.y + high <= min.y || point.y + low >= max.y) continue

    let outside = false
    let bestMove = Infinity
    let best: Plane | null = null

    for (const plane of blocker.planes) {
      const normal = plane.normal
      const horizontal = Math.hypot(normal.x, normal.z)
      // 기둥만큼 부푼 만큼 면이 바깥으로 나간다. 세로 몫은 법선이 위를 보면 발밑, 아래를 보면 머리다.
      const grown = radius * horizontal + (normal.y > 0 ? -normal.y * low : -normal.y * high)
      const depth = grown - plane.distanceToPoint(point)
      // 한 면이라도 바깥이면 이 덩어리 안이 아니다.
      if (depth <= 0) {
        outside = true
        break
      }
      // 윗면·아랫면은 수평으로 밀 수 없다.
      if (horizontal < MIN_HORIZONTAL) continue
      // 비스듬한 면은 수평으로만 밀면 그만큼 덜 빠지므로 수평 성분으로 나눈다.
      // **깊이가 아니라 이 거리로 고른다** — 깊이로 고르면 기울어진 난간의 윗·아랫면이 뽑혀
      // 난간 밖이 아니라 계단 방향으로 밀고, 그 밀기로는 빠져나가지지 않아 그대로 통과한다.
      const move = depth / horizontal
      if (move < bestMove) {
        bestMove = move
        best = plane
      }
    }

    if (outside || !best) continue

    const normal = best.normal
    const horizontal = Math.hypot(normal.x, normal.z)
    point.x += (normal.x / horizontal) * bestMove
    point.z += (normal.z / horizontal) * bestMove
  }
}
