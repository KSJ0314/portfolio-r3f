import { useEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { LOBBY_PAGE_MARGIN, LOBBY_PAGE_MESHES } from './LobbyBook.constants'
import { LOBBY_BOOK_PROJECTS, LOBBY_BOOK_TITLE, LOBBY_BOOK_WELCOME } from './LobbyBook.content'
import { drawProjectsPage, drawWelcomePage, loadBookFonts } from './LobbyBook.draw'
import { createBookPage } from './LobbyBook.texture'
import { setBookSpots } from './LobbyBook.spots'

/**
 * 책 두 페이지에 얹을 텍스처.
 *
 * 판은 마운트할 때 한 번 만들고, **글꼴이 준비되면 다시 그린다.**
 * 텍스처 인스턴스는 그대로라 모델을 다시 자를 일이 없다.
 *
 * 메시 이름을 키로 돌려주므로 쓰는 쪽은 그대로 `applyPageText`에 넘기면 된다.
 */
export function useLobbyBookPages(): Record<string, Texture> {
  const pages = useMemo(
    () => ({ left: createBookPage(), right: createBookPage() }),
    [],
  )

  useEffect(() => {
    let alive = true
    // 그릴 글자를 함께 넘겨야 그 유니코드 범위 조각을 받는다. 목록까지 합쳐 한 번에 받는다.
    const text =
      LOBBY_BOOK_TITLE +
      LOBBY_BOOK_WELCOME.join('') +
      LOBBY_BOOK_PROJECTS.map((p) => `${p.title}${p.summary}`).join('')

    void loadBookFonts(text).then(() => {
      if (!alive) return
      drawWelcomePage(pages.left.canvas, LOBBY_PAGE_MARGIN[LOBBY_PAGE_MESHES.left])
      // 그린 자리를 그대로 누를 자리로 넘긴다. 글꼴이 오기 전 자리는 줄 수가 달라 쓸 수 없다.
      setBookSpots(
        drawProjectsPage(
          pages.right.canvas,
          LOBBY_PAGE_MARGIN[LOBBY_PAGE_MESHES.right],
          LOBBY_BOOK_PROJECTS,
        ),
      )
      pages.left.texture.needsUpdate = true
      pages.right.texture.needsUpdate = true
    })

    return () => {
      alive = false
      setBookSpots([])
    }
  }, [pages])

  return useMemo(
    () => ({
      [LOBBY_PAGE_MESHES.left]: pages.left.texture,
      [LOBBY_PAGE_MESHES.right]: pages.right.texture,
    }),
    [pages],
  )
}
