import { useEffect } from 'react'
import { useGalleryFocusStore } from '../../../../../state/useGalleryFocusStore'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import { takePendingProjectJump, usePendingJump } from '../../../../jump'
import type { GalleryJumpProps } from './GalleryJump.types'

/**
 * 사이드바에서 누른 전시 칸을 열어 준다(그리는 것 없음).
 *
 * **액자를 다 측정한 뒤에** 연다 — 칸 앞에 세울 자리도, 확대할 대상도 그 값에서 나온다.
 * 방은 Firestore 개수만큼 조립하므로 마운트 시점에는 아직 잰 것이 없다.
 *
 * 칸은 **문서 id**로 찾는다. 굽는 쪽과 여기가 정렬 기준이 달라 칸 번호로 주고받으면 어긋날 수 있다.
 * 로비 책은 Firestore를 읽지 않아 문서 id를 모르므로 프로젝트 번호(`key`)로 찾는다.
 */
export function GalleryJump({ projects }: GalleryJumpProps) {
  const artworks = useGalleryGeometryStore((s) => s.artworks)
  // 남겨진 것이 바뀌면 다시 본다. 이미 이 방에 있을 때 다른 칸을 눌러도 라우트는 갈리지 않는다.
  const pending = usePendingJump()

  useEffect(() => {
    if (pending?.kind !== 'project' || artworks.length === 0) return

    // 칸과 액자를 먼저 찾는다. 읽기가 실패해 대체 칸이 선 상태에서 목적지를 먼저 꺼내면,
    // 그 자리에서 열지도 못하고 재시도가 성공했을 때 꺼낼 것도 남지 않는다.
    const bay =
      'projectId' in pending
        ? projects.findIndex((project) => project.id === pending.projectId)
        : projects.findIndex((project) => project.key === pending.projectKey)
    const artwork = artworks[bay]
    if (!artwork) return

    const target = takePendingProjectJump()
    if (target?.kind !== 'project') return

    // 칸 앞에 세운다. 닫으면 카메라가 캐릭터 자리로 돌아오므로 그 자리가 그 칸이어야 한다.
    const { position } = useInteriorStore.getState()
    useInteriorStore.getState().reset([artwork.x, position.z])

    const focus = useGalleryFocusStore.getState()
    focus.focus(bay)
    focus.setPage(target.page)
  }, [pending, artworks, projects])

  return null
}
