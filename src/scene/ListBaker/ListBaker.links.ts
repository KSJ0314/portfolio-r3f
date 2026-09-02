import { Box3, type Camera, type Object3D, Vector3 } from 'three'
import type { ListShotLink } from './ListBaker.types'

const _box = new Box3()
const _point = new Vector3()

/** 경계 상자의 여덟 꼭짓점. 눕힌 판이라도 화면에서 차지하는 사각형은 이걸로 나온다. */
function* corners(box: Box3): Generator<Vector3> {
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) yield _point.set(x, y, z)
}

/**
 * 지금 카메라에 담긴 링크 자리를 찾는다.
 *
 * 누를 자리를 그리는 쪽이 판에 주소(`userData.linkUrl`)나 복사할 값(`userData.copyText`)을 실어 두므로
 * 무엇이 링크인지 여기서 알 필요가 없다.
 * 화면 밖에 있는 것은 다른 장의 링크라 뺀다 — 장끼리 멀리 떼어 세워 두어 겹치지 않는다.
 *
 * 값은 그림 크기 대비 백분율이다. 이미지를 줄여 띄워도 링크가 따라온다.
 */
export function collectShotLinks(root: Object3D, camera: Camera): ListShotLink[] {
  const links: ListShotLink[] = []

  root.traverse((object) => {
    const url = object.userData?.linkUrl
    const copy = object.userData?.copyText
    if (typeof url !== 'string' && typeof copy !== 'string') return

    _box.setFromObject(object)
    if (_box.isEmpty()) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const corner of corners(_box)) {
      corner.project(camera)
      minX = Math.min(minX, corner.x)
      maxX = Math.max(maxX, corner.x)
      minY = Math.min(minY, corner.y)
      maxY = Math.max(maxY, corner.y)
    }

    // 화면(-1~1) 밖이면 이 장에 없는 링크다.
    if (maxX < -1 || minX > 1 || maxY < -1 || minY > 1) return

    links.push({
      url: typeof url === 'string' ? url : undefined,
      copy: typeof copy === 'string' ? copy : undefined,
      left: ((minX + 1) / 2) * 100,
      top: ((1 - maxY) / 2) * 100,
      width: ((maxX - minX) / 2) * 100,
      height: ((maxY - minY) / 2) * 100,
    })
  })

  return links
}
