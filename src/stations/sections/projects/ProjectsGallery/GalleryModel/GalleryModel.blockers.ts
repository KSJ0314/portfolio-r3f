import { type BufferGeometry, Mesh } from 'three'
import { buildIslandGeometry } from '../../../../../lib/geometryIslands'
import { makeInteriorBlocker, type InteriorBlocker } from '../../interior'

/** 같은 자리로 볼 좌표 차이. 맞닿은 상자의 꼭짓점을 한 점으로 보는 기준이다. */
const WELD_PRECISION = 1e-4

/** 안팎이 갈리는 모서리에 붙는 삼각형 수. 이보다 많으면 두 덩어리가 맞닿은 자리다. */
const MANIFOLD_TRIANGLES = 2

/**
 * 지오메트리를 **속이 이어진 덩어리**로 가른다. 덩어리마다 삼각형 시작 번호를 모아 돌려준다.
 *
 * `lib/geometryIslands`와 달리 정점이 아니라 **모서리**로 잇는다. 부품을 가르는 그쪽은 닿기만
 * 해도 한 덩어리로 보는 편이 맞지만, 여기서 가르는 것은 볼록체라 맞닿은 상자를 갈라야 한다.
 * 상자 둘이 면을 맞대면 겹친 꼭짓점을 타고 이어져 정점 기준으로는 하나로 묶인다.
 *
 * 삼각형 **둘만 쓰는 모서리**로만 잇는다. 상자 하나 안의 모서리는 늘 둘이지만, 맞닿은 자리의
 * 모서리는 양쪽 상자가 두 장씩 대어 넷이 된다. 상자 하나짜리 콜라이더는 그대로 하나로 남는다.
 *
 * 좌표가 같은 정점을 먼저 묶는 것은 그쪽과 같다 — 면마다 복제돼 있으면 상자 하나가 면 여섯 장으로
 * 흩어진다.
 */
function findSolidIslands(geometry: BufferGeometry): number[][] {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const cornerCount = index ? index.count : position.count
  const cornerAt = (corner: number) => (index ? index.getX(corner) : corner)

  const welded = new Map<string, number>()
  const representative = new Int32Array(position.count)
  for (let v = 0; v < position.count; v++) {
    const key =
      `${Math.round(position.getX(v) / WELD_PRECISION)}|` +
      `${Math.round(position.getY(v) / WELD_PRECISION)}|` +
      `${Math.round(position.getZ(v) / WELD_PRECISION)}`
    const first = welded.get(key)
    if (first === undefined) {
      welded.set(key, v)
      representative[v] = v
    } else {
      representative[v] = first
    }
  }

  const triangleCount = Math.floor(cornerCount / 3)
  const parent = new Int32Array(triangleCount)
  for (let t = 0; t < triangleCount; t++) parent[t] = t
  const find = (t: number): number => {
    let root = t
    while (parent[root] !== root) {
      parent[root] = parent[parent[root]]
      root = parent[root]
    }
    return root
  }
  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootA] = rootB
  }

  // 모서리마다 그것을 쓰는 삼각형을 모은다. 방향은 보지 않으므로 두 끝을 정렬해 키로 삼는다.
  const edges = new Map<string, number[]>()
  for (let t = 0; t < triangleCount; t++) {
    const corner = t * 3
    const v = [
      representative[cornerAt(corner)],
      representative[cornerAt(corner + 1)],
      representative[cornerAt(corner + 2)],
    ]
    for (let e = 0; e < 3; e++) {
      const a = v[e]
      const b = v[(e + 1) % 3]
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      const shared = edges.get(key)
      if (shared) shared.push(t)
      else edges.set(key, [t])
    }
  }

  for (const shared of edges.values()) {
    if (shared.length !== MANIFOLD_TRIANGLES) continue
    union(shared[0], shared[1])
  }

  const islands = new Map<number, number[]>()
  for (let t = 0; t < triangleCount; t++) {
    const root = find(t)
    const triangles = islands.get(root)
    if (triangles) triangles.push(t * 3)
    else islands.set(root, [t * 3])
  }
  return [...islands.values()]
}

/**
 * 콜라이더 메시 하나를 **덩어리마다 볼록체 하나씩**으로 만든다.
 *
 * 실내 판정은 콜라이더 하나가 볼록체 하나라고 보고 정점 평균을 안쪽 점으로 쓴다(DECISIONS 036).
 * 문이 뚫린 끝벽은 기둥 둘과 상인방이 한 메시에 들어 있어 그 평균이 **문 구멍**에 떨어지고,
 * 그 점을 안쪽으로 삼아 면을 뒤집으면 남는 볼록체가 벽이 아니라 문 구멍이 된다.
 * 그래서 벽은 통과되고 문만 막힌다. 덩어리로 갈라 따로 만들면 벽이 막히고 문 구멍이 열린다.
 *
 * 덩어리가 하나면 원래 메시를 그대로 넘겨 지금까지와 같은 결과를 낸다.
 */
export function makeGalleryBlockers(mesh: Mesh): InteriorBlocker[] {
  const islands = findSolidIslands(mesh.geometry)
  if (islands.length <= 1) {
    const blocker = makeInteriorBlocker(mesh)
    return blocker ? [blocker] : []
  }

  const blockers: InteriorBlocker[] = []
  for (const island of islands) {
    const geometry = buildIslandGeometry(mesh.geometry, [island])
    const piece = new Mesh(geometry)
    // 정점을 월드로 옮기는 데 쓰는 것이 이 행렬뿐이라, 자세를 물려주는 것으로 충분하다.
    piece.matrixWorld.copy(mesh.matrixWorld)
    const blocker = makeInteriorBlocker(piece)
    if (blocker) blockers.push(blocker)
    // 면만 뽑아 두면 지오메트리는 쓸 일이 없다. 화면에 올린 적도 없어 그대로 버린다.
    geometry.dispose()
  }
  return blockers
}
