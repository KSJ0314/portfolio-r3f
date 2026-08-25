import { Box3, Group, type Object3D, Vector3 } from 'three'
import { GALLERY_ARTWORK_MESH, type GalleryArtworkSpot } from '../GalleryArtworks'
import { GALLERY_NAMEPLATE_MESH, type GalleryNameplateSpot } from '../GalleryNameplates'
import {
  GALLERY_DOOR_CASING_MESH,
  GALLERY_DOOR_SCONCE_GAP,
  GALLERY_MODEL_SCALE,
  GALLERY_PART,
} from '../ProjectsGallery.constants'

/** 조립한 방. 방을 이루는 뿌리와, 배치가 결정한 값들. */
export interface GalleryAssembly {
  root: Object3D
  /** 전시 칸 하나의 가로(모델 좌표). 칸을 늘어놓는 간격이자 벽등 사이 간격이다. */
  bayWidth: number
  /** 방의 좌우 끝(월드 x). 카메라가 방 밖을 비추지 않도록 여기까지만 따라간다. */
  minX: number
  maxX: number
  /** 칸 순서대로의 이름판 자리(월드). 그 앞에 이름을 적은 판을 세운다. */
  plates: GalleryNameplateSpot[]
  /** 칸 순서대로의 액자 자리(월드). 그 앞에 사진 판을 세운다. */
  artworks: GalleryArtworkSpot[]
}

/**
 * 벽등을 방 배율에서 빼내는 로컬 배율.
 *
 * 방은 축마다 다르게 늘어나는데(`GALLERY_MODEL_SCALE`) 벽등까지 따라 늘어나면 좌우는 눌리고
 * 앞뒤만 길어져, 만든 것보다 훨씬 길게 튀어나온 등이 된다. 세 축이 모두 방의 좌우 배율(`x`)만큼만
 * 늘어나게 되돌려 만든 그대로의 비율로 세운다. 로비에서 책·연단을 깊이 배율에서 빼낸 것과
 * 같은 방법이다 (DECISIONS 032).
 *
 * `turned`는 문 위 등처럼 **돌려 세운** 것인지다. 돌리면 등이 튀어나오는 로컬 z가 월드 x가 되고
 * 좌우인 로컬 x가 월드 z가 되므로, 되돌릴 축도 맞바뀐다.
 */
function keepSconceShape(lamp: Object3D, turned: boolean): void {
  const { x, y, z } = GALLERY_MODEL_SCALE
  if (turned) lamp.scale.set(x / z, x / y, 1)
  else lamp.scale.set(1, x / y, x / z)
}

/**
 * 문 위에 세우는 벽등.
 *
 * 벽등 부품은 북쪽 벽에 붙어 남쪽을 보게 만들어져 있는데, 문은 **끝벽**에 있어 방 안쪽을 본다.
 * 4분의 1바퀴 돌려 세우고 자리는 문틀을 재서 그 위에 얹는다 (DECISIONS 033).
 */
function makeDoorSconce(
  sconce: Object3D,
  capLeft: Object3D | undefined,
  box: Box3,
  center: Vector3,
): Object3D | null {
  const casing = capLeft?.getObjectByName(GALLERY_DOOR_CASING_MESH)
  if (!casing) return null

  // 등 몸통은 부품 원점이 아니라 벽에 걸리는 높이에 있다. 그만큼 빼야 노린 높이에 앉는다.
  box.setFromObject(sconce)
  box.getCenter(center)
  const bodyY = center.y

  box.setFromObject(casing)
  const lamp = sconce.clone(true)
  keepSconceShape(lamp, true)
  lamp.rotation.y = Math.PI / 2
  // 몸통 높이도 되돌린 배율을 탄다.
  lamp.position.set(
    box.max.x,
    box.max.y + GALLERY_DOOR_SCONCE_GAP - bodyY * lamp.scale.y,
    (box.min.z + box.max.z) / 2,
  )
  return lamp
}

/**
 * 부품을 이름으로 갈라 방을 조립한다.
 *
 * 모델은 완성된 방이 아니라 **전시 칸 한 개 · 양 끝 마감 · 벽등 한 벌**이다(DECISIONS 032와
 * 같은 갈래 — 파일을 고치지 않고 읽는 쪽에서 다룬다). 칸 수가 Firestore를 따르므로 방의
 * 생김새를 상수로 둘 수가 없다.
 *
 * **칸 가로는 재서 얻는다**(DECISIONS 033). 상수로 박으면 모델을 다시 내보낼 때 칸 사이가
 * 벌어지거나 겹친다. 오른쪽 마감은 칸 하나짜리 방에 맞춰 놓여 있으므로 늘어난 칸 수만큼만 민다.
 *
 * **복제본의 이름은 바꾸지 않는다.** 콜라이더는 이름이 아니라 메시로 다루고, 밟는 바닥인지는
 * 이름 목록으로 가리므로 같은 이름이 여럿이어도 각자 제 역할을 맡는다. 트리거는 왼쪽 마감에
 * 하나뿐이라 겹치지 않는다.
 */
export function assembleGallery(scene: Object3D, bays: number): GalleryAssembly {
  const parts = new Map<string, Object3D>()
  for (const name of Object.values(GALLERY_PART)) {
    const part = scene.getObjectByName(name)
    if (part) parts.set(name, part)
  }

  const root = new Group()
  root.name = 'Gallery'

  const bay = parts.get(GALLERY_PART.bay)
  const box = new Box3()
  const size = new Vector3()
  const center = new Vector3()
  // 재기 전에 자세를 확정한다 — 부품마다 부모 변환이 걸려 있다.
  scene.updateMatrixWorld(true)
  if (bay) box.setFromObject(bay)
  box.getSize(size)
  const bayWidth = size.x

  // 전시 칸. 첫 칸이 x = 0에서 시작하도록 모델 그대로 두고 나머지를 오른쪽으로 민다.
  // 칸마다 이름판과 액자를 하나씩 챙겨 둔다. 칸은 모두 같은 부품의 복제라 순서가 곧 칸 번호다.
  const plateMeshes: Object3D[] = []
  const artworkMeshes: Object3D[] = []
  if (bay) {
    for (let index = 0; index < bays; index += 1) {
      const copy = bay.clone(true)
      copy.position.x += index * bayWidth
      root.add(copy)
      const plate = copy.getObjectByName(GALLERY_NAMEPLATE_MESH)
      if (plate) plateMeshes.push(plate)
      const artwork = copy.getObjectByName(GALLERY_ARTWORK_MESH)
      if (artwork) artworkMeshes.push(artwork)
    }
  }

  // 양 끝 마감. 오른쪽은 칸 하나짜리 방 기준으로 놓여 있어 늘어난 몫만큼만 민다.
  const capLeft = parts.get(GALLERY_PART.capLeft)
  const capLeftCopy = capLeft?.clone(true)
  if (capLeftCopy) root.add(capLeftCopy)
  const capRight = parts.get(GALLERY_PART.capRight)
  if (capRight) {
    const copy = capRight.clone(true)
    copy.position.x += (bays - 1) * bayWidth
    root.add(copy)
  }

  // 벽등은 **액자 사이 경계**에 둔다 — 칸 가운데는 액자가 차지하고 있고, 양 끝 경계는 마감 벽이라
  // 액자를 비추지 않는다. 칸이 하나면 사이가 없어 여기서는 하나도 서지 않는다.
  const sconce = parts.get(GALLERY_PART.sconce)
  if (sconce) {
    for (let index = 1; index < bays; index += 1) {
      const copy = sconce.clone(true)
      copy.position.x += index * bayWidth
      keepSconceShape(copy, false)
      root.add(copy)
    }
    // 문 위에도 하나 둔다. 왼쪽 마감에 붙어 있어 칸 수와 무관하게 늘 한 개다.
    const doorSconce = makeDoorSconce(sconce, capLeftCopy, box, center)
    if (doorSconce) root.add(doorSconce)
  }

  // 늘리는 것은 **칸을 다 세운 뒤, 재기 전**이다. 그래야 여기서 얻는 좌우 끝도,
  // 이 뒤에 잴 콜라이더·트리거도 늘어난 자세로 잡힌다.
  root.scale.set(GALLERY_MODEL_SCALE.x, GALLERY_MODEL_SCALE.y, GALLERY_MODEL_SCALE.z)
  root.updateMatrixWorld(true)
  box.setFromObject(root)
  const minX = box.min.x
  const maxX = box.max.x

  // 이름판·액자도 배율을 건 뒤에 잰다. z는 앞면이라 판을 그 앞으로 띄워 세울 수 있다.
  const measureFront = (mesh: Object3D) => {
    box.setFromObject(mesh)
    box.getSize(size)
    box.getCenter(center)
    return { x: center.x, y: center.y, z: box.max.z, width: size.x, height: size.y }
  }
  const plates = plateMeshes.map(measureFront)
  const artworks = artworkMeshes.map(measureFront)

  return { root, bayWidth, minX, maxX, plates, artworks }
}
