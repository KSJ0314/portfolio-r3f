import { useEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { useCollection } from '../../../../../lib/firebase/hooks'
import { LOBBY_PAGE_MARGIN, LOBBY_PAGE_MESHES } from './LobbyBook.constants'
import { LOBBY_BOOK_TITLE, LOBBY_BOOK_WELCOME } from './LobbyBook.content'
import { drawProjectsPage, drawWelcomePage, loadBookFonts } from './LobbyBook.draw'
import { createBookPage } from './LobbyBook.texture'
import type { LobbyProject } from './LobbyBook.types'

/**
 * 책 두 페이지에 얹을 텍스처.
 *
 * 판은 마운트할 때 한 번 만들고, **글꼴이 준비되거나 Firestore가 오면 다시 그린다.**
 * 텍스처 인스턴스는 그대로라 모델을 다시 자를 일이 없다.
 *
 * 메시 이름을 키로 돌려주므로 쓰는 쪽은 그대로 `applyPageText`에 넘기면 된다.
 */
export function useLobbyBookPages(): Record<string, Texture> {
  const { data: projects } = useCollection<LobbyProject>('projects')

  const pages = useMemo(
    () => ({ left: createBookPage(), right: createBookPage() }),
    [],
  )

  const ordered = useMemo(
    () => [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects],
  )

  useEffect(() => {
    let alive = true
    // 그릴 글자를 함께 넘겨야 그 유니코드 범위 조각을 받는다. 목록까지 합쳐 한 번에 받는다.
    const text =
      LOBBY_BOOK_TITLE +
      LOBBY_BOOK_WELCOME.join('') +
      ordered.map((p) => `${p.title}${p.summary ?? ''}`).join('')

    void loadBookFonts(text).then(() => {
      if (!alive) return
      drawWelcomePage(pages.left.canvas, LOBBY_PAGE_MARGIN[LOBBY_PAGE_MESHES.left])
      drawProjectsPage(pages.right.canvas, LOBBY_PAGE_MARGIN[LOBBY_PAGE_MESHES.right], ordered)
      pages.left.texture.needsUpdate = true
      pages.right.texture.needsUpdate = true
    })

    return () => {
      alive = false
    }
  }, [pages, ordered])

  return useMemo(
    () => ({
      [LOBBY_PAGE_MESHES.left]: pages.left.texture,
      [LOBBY_PAGE_MESHES.right]: pages.right.texture,
    }),
    [pages],
  )
}
