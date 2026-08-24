import { useEffect, useMemo } from 'react'
import type { CanvasTexture } from 'three'
import { drawNameplate, loadNameplateFont } from './GalleryNameplates.draw'
import { createNameplate } from './GalleryNameplates.texture'
import type { GalleryNameplateSpot } from './GalleryNameplates.types'

/**
 * 칸마다 이름판에 얹을 텍스처.
 *
 * 판은 이름판을 잰 뒤 한 번 만들고, **글꼴이 준비되거나 이름이 바뀌면 다시 그린다.**
 * 텍스처 인스턴스는 그대로라 모델을 다시 조립할 일이 없다.
 *
 * 캔버스 비율은 잰 이름판에서 얻는다. 판 비율과 어긋나면 글자가 눌리거나 늘어난다.
 */
export function useGalleryNameplates(
  spots: readonly GalleryNameplateSpot[],
  titles: readonly string[],
): CanvasTexture[] {
  const plates = useMemo(
    () => spots.map((spot) => createNameplate(spot.width / spot.height)),
    [spots],
  )

  useEffect(() => {
    let alive = true
    void loadNameplateFont(titles.join('')).then(() => {
      if (!alive) return
      plates.forEach((plate, index) => {
        drawNameplate(plate.canvas, titles[index] ?? '')
        plate.texture.needsUpdate = true
      })
    })
    return () => {
      alive = false
    }
  }, [plates, titles])

  // 방을 나가면 버린다. 칸 수만큼 만들어지므로 두고 나가면 드나들 때마다 쌓인다.
  useEffect(() => () => plates.forEach((plate) => plate.texture.dispose()), [plates])

  return useMemo(() => plates.map((plate) => plate.texture), [plates])
}
