import { BufferAttribute, BufferGeometry } from 'three'

/**
 * 지오메트리를 **서로 닿지 않은 덩어리**로 가른다.
 *
 * 받아 온 모델은 부품이 한 메시로 합쳐져 있는 일이 잦다. 삼각형으로 이어진 정점끼리 묶으면
 * 원래 부품 경계가 그대로 나오므로, 바퀴만 굴리거나 문만 여는 식으로 따로 다룰 수 있다.
 * 원본은 건드리지 않고 새 지오메트리를 만들어 주므로 캐시에 든 모델이 그대로 유지된다.
 */

/** 같은 자리로 볼 좌표 차이. 이보다 가까운 정점은 한 점으로 묶는다. */
const WELD_PRECISION = 1e-4

/**
 * 덩어리마다 삼각형 시작 번호를 모아 돌려준다.
 * 좌표가 같은 정점을 먼저 묶는다 — 면마다 복제돼 있으면 덩어리가 낱낱이 쪼개져 보인다.
 */
export function findGeometryIslands(geometry: BufferGeometry): number[][] {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const cornerCount = index ? index.count : position.count
  const cornerAt = (corner: number) => (index ? index.getX(corner) : corner)

  const representative = new Int32Array(position.count)
  const welded = new Map<string, number>()
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

  const parent = new Int32Array(position.count)
  for (let v = 0; v < position.count; v++) parent[v] = representative[v]

  const find = (v: number): number => {
    let root = representative[v]
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

  for (let corner = 0; corner < cornerCount; corner += 3) {
    const a = cornerAt(corner)
    const b = cornerAt(corner + 1)
    const c = cornerAt(corner + 2)
    union(a, b)
    union(b, c)
  }

  const islands = new Map<number, number[]>()
  for (let corner = 0; corner < cornerCount; corner += 3) {
    const root = find(cornerAt(corner))
    const triangles = islands.get(root)
    if (triangles) triangles.push(corner)
    else islands.set(root, [corner])
  }
  return [...islands.values()]
}

/** 고른 덩어리들만으로 새 지오메트리를 만든다. 인덱스 없이 펼쳐 담는다. */
export function buildIslandGeometry(
  source: BufferGeometry,
  islands: number[][],
): BufferGeometry {
  const index = source.getIndex()
  const cornerAt = (corner: number) => (index ? index.getX(corner) : corner)
  const flat = islands.flat()
  const result = new BufferGeometry()

  for (const [name, attribute] of Object.entries(source.attributes)) {
    const itemSize = attribute.itemSize
    const values = new Float32Array(flat.length * 3 * itemSize)
    let cursor = 0
    for (const corner of flat) {
      for (let offset = 0; offset < 3; offset++) {
        const vertex = cornerAt(corner + offset)
        // 인덱스로 직접 읽지 않는다 — 여러 속성이 한 버퍼에 엮여 있으면 간격이 itemSize가 아니다.
        for (let item = 0; item < itemSize; item++) {
          values[cursor++] = attribute.getComponent(vertex, item)
        }
      }
    }
    result.setAttribute(name, new BufferAttribute(values, itemSize))
  }
  return result
}
