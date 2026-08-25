import type { GalleryArtworkSpot } from '../GalleryArtworks'
import type { GalleryNameplateSpot } from '../GalleryNameplates'
import type { GalleryFrameRect } from './GalleryFrames.types'

/**
 * 액자와 그 아래 이름판을 **함께 감싸는** 사각형.
 *
 * 둘을 따로 누르게 두면 사이의 빈 벽이 눌리지 않아, 보이는 것 하나가 판정 둘로 갈린다.
 * 새로 재지 않고 이미 잰 둘에서 구하므로 방 배율이나 모델이 바뀌어도 따라온다.
 */
export function frameRect(
  artwork: GalleryArtworkSpot,
  plate: GalleryNameplateSpot | undefined,
): GalleryFrameRect {
  let left = artwork.x - artwork.width / 2
  let right = artwork.x + artwork.width / 2
  let bottom = artwork.y - artwork.height / 2
  let top = artwork.y + artwork.height / 2
  let front = artwork.z

  if (plate) {
    left = Math.min(left, plate.x - plate.width / 2)
    right = Math.max(right, plate.x + plate.width / 2)
    bottom = Math.min(bottom, plate.y - plate.height / 2)
    top = Math.max(top, plate.y + plate.height / 2)
    front = Math.max(front, plate.z)
  }

  return {
    x: (left + right) / 2,
    y: (bottom + top) / 2,
    z: front,
    width: right - left,
    height: top - bottom,
  }
}
