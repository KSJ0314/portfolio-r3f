import type { Mesh, MeshStandardMaterial, Texture } from 'three'
import { Vector3 } from 'three'
import {
  LOBBY_PAGE_GUTTER_RATIO,
  LOBBY_PAGE_MATERIAL,
  LOBBY_PAGE_UP_THRESHOLD,
} from './LobbyBook.constants'

/**
 * 책 페이지의 **글 쓰는 면에만** 텍스처를 얹는다.
 *
 * 페이지 메시 하나에 윗면과 옆면(종이 겹친 단면)이 함께 들어 있어, 재질에 텍스처를 물리면
 * 옆면에도 글씨가 나온다. 그래서 **위를 보는 삼각형만 골라 지오메트리 그룹으로 가르고**
 * 그 그룹에만 글씨 재질을 준다. 옆면은 원래 종이 재질 그대로다.
 *
 * 모델 파일은 손대지 않는다 (DECISIONS 032).
 * 메시를 복제하지 않고 한 지오메트리를 그룹으로 나누므로 겹쳐서 깜빡일 일도 없다.
 *
 * 면 방향은 **로컬 좌표**로 본다. 책이 비스듬히 놓여 있어 월드 기준으로 재면 기울기만큼 어긋난다.
 *
 * 좌우 페이지는 재질 하나를 공유하지만 **재질 복제는 메시마다** 일어나므로,
 * 메시 이름으로 텍스처를 골라 주면 좌우에 다른 글이 얹힌다.
 */

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()
const _ab = new Vector3()
const _ac = new Vector3()
const _normal = new Vector3()

/** 한 번 가른 지오메트리를 다시 가르지 않도록 표시해 둔다. 지오메트리는 캐시와 공유된다. */
const SPLIT_FLAG = 'lobbyPageSplit'

export function applyPageText(mesh: Mesh, textures: Record<string, Texture>): void {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  const paper = material as MeshStandardMaterial
  if (!paper?.isMeshStandardMaterial) return
  if (paper.name !== LOBBY_PAGE_MATERIAL) return

  // 좌우가 재질을 공유하므로 무엇을 얹을지는 메시 이름으로 고른다.
  const texture = textures[mesh.name]
  if (!texture) return

  const geometry = mesh.geometry
  const position = geometry.getAttribute('position')
  if (!position) return

  const text = paper.clone()
  text.name = `${paper.name}_Text`
  text.map = texture
  // 판의 바탕이 흰색이라 재질의 종이색이 그대로 나온다. 색은 건드리지 않는다.
  text.needsUpdate = true

  // 이미 가른 지오메트리면 재질만 다시 물린다 — 지오메트리는 캐시와 공유돼 두 번 가를 수 있다.
  if (!geometry.userData[SPLIT_FLAG]) {
    const index = geometry.getIndex()
    const source = index
      ? Array.from({ length: index.count }, (_, i) => index.getX(i))
      : Array.from({ length: position.count }, (_, i) => i)

    // 책등 쪽 안쪽 끝을 알아야 그 띠를 뺄 수 있다. 좌우 페이지의 안쪽 끝은 서로 반대편이지만
    // 둘 다 x가 0에 가까운 쪽이라, 폭을 재서 0에 가까운 끝을 안쪽으로 본다.
    geometry.computeBoundingBox()
    const bounds = geometry.boundingBox!
    const width = bounds.max.x - bounds.min.x
    const innerAtMax = Math.abs(bounds.max.x) < Math.abs(bounds.min.x)
    const gutter = width * LOBBY_PAGE_GUTTER_RATIO
    const limit = innerAtMax ? bounds.max.x - gutter : bounds.min.x + gutter
    const insideGutter = (x: number) => (innerAtMax ? x > limit : x < limit)

    const up: number[] = []
    const side: number[] = []
    for (let i = 0; i + 2 < source.length; i += 3) {
      const [ia, ib, ic] = [source[i], source[i + 1], source[i + 2]]
      _a.fromBufferAttribute(position, ia)
      _b.fromBufferAttribute(position, ib)
      _c.fromBufferAttribute(position, ic)
      _normal.crossVectors(_ab.subVectors(_b, _a), _ac.subVectors(_c, _a)).normalize()
      // 위를 보고 있으면서 책등 쪽 띠에 걸리지 않은 것만 글 쓰는 면이다.
      // 곡면이라 법선이 퍼지므로 방향 기준에는 여유를 둔다.
      const facingUp = _normal.y > LOBBY_PAGE_UP_THRESHOLD
      const atGutter = insideGutter((_a.x + _b.x + _c.x) / 3)
      ;(facingUp && !atGutter ? up : side).push(ia, ib, ic)
    }

    geometry.setIndex([...up, ...side])
    geometry.clearGroups()
    geometry.addGroup(0, up.length, 0)
    geometry.addGroup(up.length, side.length, 1)
    geometry.userData[SPLIT_FLAG] = true
  }

  mesh.material = [text, paper]
}
