import { Box3, Group, type Object3D, Vector3 } from 'three'
import { GALLERY_NAMEPLATE_MESH, type GalleryNameplateSpot } from '../GalleryNameplates'
import { GALLERY_MODEL_SCALE, GALLERY_PART } from '../ProjectsGallery.constants'

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
  // 재기 전에 자세를 확정한다 — 부품마다 부모 변환이 걸려 있다.
  scene.updateMatrixWorld(true)
  if (bay) box.setFromObject(bay)
  box.getSize(size)
  const bayWidth = size.x

  // 전시 칸. 첫 칸이 x = 0에서 시작하도록 모델 그대로 두고 나머지를 오른쪽으로 민다.
  // 칸마다 이름판을 하나씩 챙겨 둔다. 칸은 모두 같은 부품의 복제라 순서가 곧 칸 번호다.
  const plateMeshes: Object3D[] = []
  if (bay) {
    for (let index = 0; index < bays; index += 1) {
      const copy = bay.clone(true)
      copy.position.x += index * bayWidth
      root.add(copy)
      const plate = copy.getObjectByName(GALLERY_NAMEPLATE_MESH)
      if (plate) plateMeshes.push(plate)
    }
  }

  // 양 끝 마감. 오른쪽은 칸 하나짜리 방 기준으로 놓여 있어 늘어난 몫만큼만 민다.
  const capLeft = parts.get(GALLERY_PART.capLeft)
  if (capLeft) root.add(capLeft.clone(true))
  const capRight = parts.get(GALLERY_PART.capRight)
  if (capRight) {
    const copy = capRight.clone(true)
    copy.position.x += (bays - 1) * bayWidth
    root.add(copy)
  }

  // 벽등은 칸 경계에 둔다 — 칸 가운데는 액자가 차지하고 있다. 경계는 칸 수보다 하나 많다.
  const sconce = parts.get(GALLERY_PART.sconce)
  if (sconce) {
    for (let index = 0; index <= bays; index += 1) {
      const copy = sconce.clone(true)
      copy.position.x += index * bayWidth
      root.add(copy)
    }
  }

  // 늘리는 것은 **칸을 다 세운 뒤, 재기 전**이다. 그래야 여기서 얻는 좌우 끝도,
  // 이 뒤에 잴 콜라이더·트리거도 늘어난 자세로 잡힌다.
  root.scale.set(GALLERY_MODEL_SCALE.x, GALLERY_MODEL_SCALE.y, GALLERY_MODEL_SCALE.z)
  root.updateMatrixWorld(true)
  box.setFromObject(root)
  const minX = box.min.x
  const maxX = box.max.x

  // 이름판도 배율을 건 뒤에 잰다. z는 앞면이라 글씨 판을 그 앞으로 띄워 세울 수 있다.
  const center = new Vector3()
  const plates = plateMeshes.map((mesh) => {
    box.setFromObject(mesh)
    box.getSize(size)
    box.getCenter(center)
    return { x: center.x, y: center.y, z: box.max.z, width: size.x, height: size.y }
  })

  return { root, bayWidth, minX, maxX, plates }
}
