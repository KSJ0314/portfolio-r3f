import { Suspense } from 'react'
import { projectPages } from '../../contents'
import { useGalleryFocusStore } from '../../../../../state/useGalleryFocusStore'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { GalleryPager } from './GalleryPager'
import { GALLERY_PAGE_BACKGROUND, GALLERY_PAGE_LIFT } from './GalleryPages.constants'
import type { GalleryPagesProps } from './GalleryPages.types'

/**
 * 확대해 보는 칸의 페이지.
 *
 * 액자 앞에 **불투명한 판**을 액자 크기 그대로 세우고 그 안의 내용만 갈아 끼운다. 확대 연출은
 * 카메라가 이미 맡고 있으므로(`GalleryCameraRig`) 여기서는 판과 내용만 다룬다.
 * 판이 표지 사진(`GalleryArtworks`)을 덮으므로 첫 장부터 그 프로젝트의 내용이다.
 *
 * **안쪽은 가로 1 기준 정규화 좌표다.** 잰 액자 가로를 그룹 배율로 걸어, 페이지는 칸이 얼마나
 * 큰지 알 필요 없이 비율로만 그린다. 액자가 16:9라 그 비율이 그대로 페이지 비율이 된다.
 *
 * 페이지 목록은 프로젝트 번호로 찾는다(`contents/`). 등록 전이면 자리표시 페이지가 나온다.
 */
export function GalleryPages({ projects }: GalleryPagesProps) {
  const artworks = useGalleryGeometryStore((s) => s.artworks)
  const focusedBay = useGalleryFocusStore((s) => s.focusedBay)
  const page = useGalleryFocusStore((s) => s.page)
  const setPage = useGalleryFocusStore((s) => s.setPage)

  if (focusedBay === null) return null

  const project = projects[focusedBay]
  const spot = artworks[focusedBay]
  // 데이터를 못 읽어 세운 칸에는 보여 줄 프로젝트가 없다.
  if (!project || !spot) return null

  const pages = projectPages(project.key)
  // 페이지 수는 프로젝트마다 다르다. 남은 장수보다 큰 값이 들어와도 마지막 장을 보여준다.
  const index = Math.min(Math.max(page, 0), pages.length - 1)
  const Page = pages[index]
  const height = spot.height / spot.width

  return (
    <group
      position={[spot.x, spot.y, spot.z + GALLERY_PAGE_LIFT]}
      scale={[spot.width, spot.width, 1]}
    >
      <mesh>
        <planeGeometry args={[1, height]} />
        <meshBasicMaterial color={GALLERY_PAGE_BACKGROUND} toneMapped={false} />
      </mesh>

      {/* 페이지가 사진·텍스처를 받는 동안 서스펜드할 수 있어 자기 경계를 갖는다. */}
      <Suspense fallback={null}>
        <Page project={project} height={height} index={index} total={pages.length} />
      </Suspense>

      {/* 넘김 아이콘도 파일을 받는 동안 서스펜드한다. */}
      <Suspense fallback={null}>
        <GalleryPager page={index} count={pages.length} height={height} onPage={setPage} />
      </Suspense>
    </group>
  )
}
