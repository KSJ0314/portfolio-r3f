import { CanvasTexture, SRGBColorSpace } from 'three'
import { LOBBY_BOOK_PAPER, LOBBY_PAGE_CANVAS } from './LobbyBook.constants'
import type { LobbyBookPage } from './LobbyBook.types'

/**
 * 페이지에 얹을 빈 판을 만든다.
 *
 * **한 번 굽고 끝내지 않는다.** 글꼴과 Firestore가 늦게 오므로, 캔버스를 들고 있다가 다시 그리고
 * `texture.needsUpdate`로 갱신한다(ARCHITECTURE의 캐시·Suspense 예외 항목).
 *
 * **`flipY`를 끈다** — glTF의 UV 원점은 위쪽이다. 켜 두면 글씨가 뒤집혀 얹힌다.
 */
export function createBookPage(): LobbyBookPage {
  const canvas = document.createElement('canvas')
  canvas.width = LOBBY_PAGE_CANVAS.width
  canvas.height = LOBBY_PAGE_CANVAS.height

  // 글꼴을 기다리는 동안 빈 판이 뚫려 보이지 않게 미리 덮어 둔다.
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = LOBBY_BOOK_PAPER
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.flipY = false
  return { canvas, texture }
}
