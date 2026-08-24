import { Vector3, type Mesh, type MeshStandardMaterial } from 'three'
import {
  GALLERY_NAMEPLATE_FRONT_FINISH,
  GALLERY_NAMEPLATE_FRONT_MATERIAL,
  GALLERY_NAMEPLATE_FRONT_THRESHOLD,
  GALLERY_NAMEPLATE_PLATE_MATERIAL,
} from './GalleryNameplates.constants'

/**
 * 이름판에서 **앞면만 갈라** 따로 밝힐 수 있게 한다.
 *
 * 앞면은 관객 쪽을 향해 세워진 넓은 면이라, 정면에서 보면 비추는 쪽이 벽 없는 남쪽이어서 어둡다.
 * 반대로 옆면·모서리는 시선에 스치는 각이라 밝은 금색으로 남는다. 밝기를 통째로 올리면 이미
 * 밝은 옆면까지 함께 오르므로, **앞을 보는 삼각형만 그룹으로 갈라** 그 그룹에만 다른 재질을 준다.
 *
 * 로비 책이 글 쓰는 면과 옆면을 가른 것과 같은 방식이다 (DECISIONS 038).
 * 모델 파일은 손대지 않고 메시도 복제하지 않아 겹쳐 깜빡이지 않는다 (DECISIONS 032).
 *
 * **메시가 아니라 재질로 짚는다** — 이름판 앞면에는 판 말고 누를 판이 같은 평면에 겹쳐 있어,
 * 판만 갈라 두면 겹친 자리에서 어두운 쪽이 그대로 나온다.
 *
 * 면 방향은 **로컬 좌표**로 본다. 칸은 옮겨 놓기만 하므로 로컬 앞이 곧 방의 앞이다.
 */

const _a = new Vector3()
const _b = new Vector3()
const _c = new Vector3()
const _ab = new Vector3()
const _ac = new Vector3()
const _normal = new Vector3()

/** 한 번 가른 지오메트리를 다시 가르지 않도록 표시해 둔다. 칸끼리 지오메트리를 공유한다. */
const SPLIT_FLAG = 'galleryNameplateFrontSplit'

export function splitNameplateFront(mesh: Mesh): void {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  const gold = material as MeshStandardMaterial
  if (!gold?.isMeshStandardMaterial) return
  if (gold.name !== GALLERY_NAMEPLATE_PLATE_MATERIAL) return

  const geometry = mesh.geometry
  const position = geometry.getAttribute('position')
  if (!position) return

  // 앞면용 재질. 이름을 달리 줘야 자기 환경맵을 걸 때 앞면만 골라 세기를 달리할 수 있다.
  const front = gold.clone()
  front.name = GALLERY_NAMEPLATE_FRONT_MATERIAL
  front.roughness = GALLERY_NAMEPLATE_FRONT_FINISH.roughness
  if (GALLERY_NAMEPLATE_FRONT_FINISH.dropRoughnessMap) front.roughnessMap = null
  if (GALLERY_NAMEPLATE_FRONT_FINISH.metalness !== undefined) {
    front.metalness = GALLERY_NAMEPLATE_FRONT_FINISH.metalness
  }
  front.needsUpdate = true

  if (!geometry.userData[SPLIT_FLAG]) {
    const index = geometry.getIndex()
    const source = index
      ? Array.from({ length: index.count }, (_, i) => index.getX(i))
      : Array.from({ length: position.count }, (_, i) => i)

    const facing: number[] = []
    const rest: number[] = []
    for (let i = 0; i + 2 < source.length; i += 3) {
      const [ia, ib, ic] = [source[i], source[i + 1], source[i + 2]]
      _a.fromBufferAttribute(position, ia)
      _b.fromBufferAttribute(position, ib)
      _c.fromBufferAttribute(position, ic)
      _normal.crossVectors(_ab.subVectors(_b, _a), _ac.subVectors(_c, _a)).normalize()
      ;(_normal.z > GALLERY_NAMEPLATE_FRONT_THRESHOLD ? facing : rest).push(ia, ib, ic)
    }

    geometry.setIndex([...facing, ...rest])
    geometry.clearGroups()
    geometry.addGroup(0, facing.length, 0)
    geometry.addGroup(facing.length, rest.length, 1)
    geometry.userData[SPLIT_FLAG] = true
  }

  mesh.material = [front, gold]
}
