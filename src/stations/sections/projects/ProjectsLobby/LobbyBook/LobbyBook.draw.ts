import { LOBBY_BOOK_TITLE, LOBBY_BOOK_WELCOME } from './LobbyBook.content'
import {
  LOBBY_BOOK_INK,
  LOBBY_BOOK_INK_SOFT,
  LOBBY_BOOK_PAPER,
  LOBBY_BOOK_TYPE,
} from './LobbyBook.constants'
import type { LobbyPageMargin, LobbyProject } from './LobbyBook.types'

/**
 * 책 페이지에 글을 그린다.
 *
 * **바탕은 흰색으로 채운다.** `map`은 재질 색에 곱해지므로 흰 바탕이 곧 원래 종이색이고,
 * 옆면(종이 겹친 단면)과도 정확히 이어진다. 비워 두면 그 자리가 뚫려 뒤가 비친다.
 *
 * 자리와 크기는 전부 **안전 영역 기준 비율**이다 — 여백(`LOBBY_PAGE_MARGIN`)을 바꿔도 따라온다.
 */

/** 글꼴 이름. 테마 토큰과 같은 것을 쓰되, 캔버스는 스택 문자열을 그대로 받는다. */
const HAND = "'Gamja Flower', Pretendard, sans-serif"
const BODY = "Pretendard, system-ui, sans-serif"

/** 안전 영역을 픽셀로 편 것. 그리는 동안 이 상자 안만 쓴다. */
interface Area {
  x: number
  y: number
  width: number
  height: number
}

function toArea(canvas: HTMLCanvasElement, margin: LobbyPageMargin): Area {
  return {
    x: margin.left * canvas.width,
    y: margin.top * canvas.height,
    width: canvas.width - (margin.left + margin.right) * canvas.width,
    height: canvas.height - (margin.top + margin.bottom) * canvas.height,
  }
}

/**
 * 한 줄이 폭을 넘으면 나눈다.
 *
 * 한글은 띄어쓰기 없이도 이어지므로 **글자 단위**로 재며 넘긴다. 단어 단위로만 나누면
 * 긴 낱말 하나가 폭을 넘어설 때 그대로 삐져나간다.
 */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of text) {
    const next = line + char
    if (line && ctx.measureText(next).width > width) {
      lines.push(line)
      // 줄 첫머리에 오는 공백은 버린다.
      line = char === ' ' ? '' : char
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 그리기 전에 판을 바탕색으로 덮는다. 다시 그릴 때 이전 글씨도 이걸로 지워진다. */
function clear(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.fillStyle = LOBBY_BOOK_PAPER
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
}

/** 왼쪽 페이지 — 손글씨 제목과 환영글. */
export function drawWelcomePage(canvas: HTMLCanvasElement, margin: LobbyPageMargin): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  clear(ctx, canvas)

  const area = toArea(canvas, margin)
  const type = LOBBY_BOOK_TYPE
  const titleSize = area.height * type.titleSize
  let y = area.y

  ctx.fillStyle = LOBBY_BOOK_INK
  ctx.textAlign = 'center'
  ctx.font = `${titleSize}px ${HAND}`
  ctx.fillText(LOBBY_BOOK_TITLE, area.x + area.width / 2, y)
  y += titleSize + area.height * type.titleGap

  // 제목과 본문을 가르는 가는 선. 손글씨와 본문체가 붙어 있으면 둘 다 어수선해 보인다.
  ctx.strokeStyle = LOBBY_BOOK_INK_SOFT
  ctx.lineWidth = Math.max(1, area.height * 0.002)
  ctx.beginPath()
  ctx.moveTo(area.x, y)
  ctx.lineTo(area.x + area.width, y)
  ctx.stroke()
  y += area.height * type.titleGap

  const bodySize = area.height * type.bodySize
  const lineHeight = bodySize * type.bodyLine
  ctx.textAlign = 'left'
  ctx.font = `${bodySize}px ${BODY}`
  for (const paragraph of LOBBY_BOOK_WELCOME) {
    // 빈 줄은 문단 사이 여백이다.
    if (!paragraph) {
      y += lineHeight * type.paragraphGap
      continue
    }
    for (const line of wrap(ctx, paragraph, area.width)) {
      ctx.fillText(line, area.x, y)
      y += lineHeight
    }
  }
}

/** 오른쪽 페이지 — 전시 중인 프로젝트 목록. */
export function drawProjectsPage(
  canvas: HTMLCanvasElement,
  margin: LobbyPageMargin,
  projects: LobbyProject[],
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  clear(ctx, canvas)

  const area = toArea(canvas, margin)
  const type = LOBBY_BOOK_TYPE
  const titleSize = area.height * type.itemTitleSize
  const summarySize = area.height * type.itemSummarySize
  const summaryLine = summarySize * type.itemSummaryLine
  let y = area.y

  for (const project of projects) {
    // 안전 영역을 넘기면 거기서 멈춘다. 잘려 나온 글은 없느니만 못하다.
    if (y + titleSize + summaryLine > area.y + area.height) break

    ctx.fillStyle = LOBBY_BOOK_INK
    ctx.font = `${titleSize}px ${BODY}`
    ctx.fillText(project.title, area.x, y)
    y += titleSize + area.height * type.itemTitleGap

    ctx.fillStyle = LOBBY_BOOK_INK_SOFT
    ctx.font = `${summarySize}px ${BODY}`
    for (const line of wrap(ctx, project.summary ?? '', area.width)) {
      if (y + summaryLine > area.y + area.height) break
      ctx.fillText(line, area.x, y)
      y += summaryLine
    }
    y += area.height * type.itemGap
  }
}

/** 폰트를 미리 받아 둔다. 준비 전에 그리면 조용히 기본 글꼴로 나온다. */
export async function loadBookFonts(text: string): Promise<void> {
  // 두 글꼴 모두 유니코드 범위별로 쪼개 서빙되므로 **그릴 글자를 함께 넘겨야** 필요한 조각을 받는다.
  await Promise.all([
    document.fonts.load(`100px ${HAND}`, text),
    document.fonts.load(`100px ${BODY}`, text),
  ])
}
