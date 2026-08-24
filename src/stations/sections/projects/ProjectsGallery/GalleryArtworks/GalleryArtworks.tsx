import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace } from 'three'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { GALLERY_ARTWORK_LIFT } from './GalleryArtworks.constants'
import { OptionalTextureLoader, artworkUrl, hasArtwork } from './GalleryArtworks.texture'
import type { GalleryArtworkSpot, GalleryArtworksProps } from './GalleryArtworks.types'

/** 사진을 걸 액자 하나 — 잰 자리와 그 자리에 걸 파일. */
interface GalleryArtworkFrame {
  spot: GalleryArtworkSpot
  url: string
}

/**
 * 전시 칸 액자에 프로젝트 사진을 건다.
 *
 * 액자 재질에 사진을 물리지 않고 **그 앞에 사진만 있는 판을 한 장 세운다.** 칸을 복제하면
 * 재질까지 공유돼 모든 칸이 같은 사진이 되기 때문이다. 이름판과 같은 방식이다.
 *
 * 자리는 모델에서 잰 것이라(`useGalleryGeometryStore`) 방 배율을 바꿔도 액자를 따라간다.
 * 사진이 없는 칸에는 판을 두지 않아 원래 회색 판이 그대로 남는다.
 */
export function GalleryArtworks({ titles }: GalleryArtworksProps) {
  const spots = useGalleryGeometryStore((s) => s.artworks)

  // 사진은 프로젝트 이름으로 된 폴더에서 찾는다. 이름이 없는 칸은 찾을 곳이 없어 뺀다.
  const frames = useMemo(
    () =>
      spots.flatMap<GalleryArtworkFrame>((spot, index) =>
        titles[index] ? [{ spot, url: artworkUrl(titles[index]) }] : [],
      ),
    [spots, titles],
  )

  // 걸 것이 없으면 불러오는 쪽을 마운트하지 않는다 — 빈 목록으로 로더를 부르지 않기 위해서다.
  if (frames.length === 0) return null
  return <GalleryArtworkPlanes frames={frames} />
}

/**
 * 사진 판을 세운다. 파일을 받는 동안 서스펜드하므로 호출부에서 Suspense로 감싼다.
 *
 * 크기는 불러온 사진의 실제 픽셀 크기에서 구해 **액자 안에 다 들어가게** 맞춘다. 비율이 다르면
 * 사방에 원래 판의 회색이 여백으로 남는다. 사진을 갈아끼워도 코드를 고칠 일이 없다.
 */
function GalleryArtworkPlanes({ frames }: { frames: readonly GalleryArtworkFrame[] }) {
  const textures = useLoader(
    OptionalTextureLoader,
    frames.map((frame) => frame.url),
  )

  return (
    <>
      {frames.map(({ spot }, index) => {
        const texture = textures[index]
        if (!hasArtwork(texture)) return null

        const image = texture.image as { width: number; height: number }
        const fit = Math.min(spot.width / image.width, spot.height / image.height)

        return (
          <mesh key={index} position={[spot.x, spot.y, spot.z + GALLERY_ARTWORK_LIFT]}>
            <planeGeometry args={[image.width * fit, image.height * fit]} />
            {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
            <meshStandardMaterial
              map={texture}
              map-colorSpace={SRGBColorSpace}
              roughness={1}
              metalness={0}
            />
          </mesh>
        )
      })}
    </>
  )
}
