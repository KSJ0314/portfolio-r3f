import { useEffect } from 'react'
import { BackButton } from '../../ui/BackButton'
import { GalleryPageHUD } from '../../ui/DevHUD/GalleryPageHUD'
import { useCoarsePointer } from '../../ui/MobileNotice'
import { GalleryScene } from '../../stations/sections/projects/ProjectsGallery/GalleryScene'
import { goBackFromGallery } from '../../stations/sections/projects/ProjectsGallery/ProjectsGallery.travel'

/**
 * 전시 공간 페이지(`/projects/gallery`) — 로비 북쪽 통로 너머다.
 *
 * 방을 세우는 일은 씬(`GalleryScene`)이 하고, 여기는 그 씬과 화면 밖 요소만 얹는다.
 * 나가는 방법은 좌상단 버튼과 ESC 두 가지이고, 둘 다 같은 판단(`goBackFromGallery`)을 탄다.
 */
export function ProjectsGalleryPage() {
  const mobile = useCoarsePointer()

  // ESC는 좌상단 버튼과 같은 길을 탄다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBackFromGallery()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <GalleryScene />
      {/* 전시실은 밝은 대리석이라 검정. */}
      <BackButton label="Back" color="#000000" onClick={goBackFromGallery} />

      {/* leva 튜닝 패널은 dev 전용이고 좁은 화면에서는 두지 않는다. 라우트마다 하나씩 둔다. */}
      {import.meta.env.DEV && !mobile && <GalleryPageHUD />}
    </>
  )
}
