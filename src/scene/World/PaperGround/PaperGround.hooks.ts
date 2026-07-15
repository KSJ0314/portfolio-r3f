import { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { renderGridPaper } from '../../../lib/gridPaper'
import type { GridPaperParams, GridPaperRenderOptions } from '../../../lib/gridPaper'
import { useGridPaperStore } from '../../../state/useGridPaperStore'
import { PAPER_TILE_SIZE } from './PaperGround.constants'

/**
 * 슬라이더를 움직이는 동안 쓰는 해상도. 매 변경마다 다시 구우므로 가볍게 간다.
 * 값이 멈추면 아래 해상도로 다시 구워 실제 텍스처에 가까운 모습을 보여준다.
 */
const DRAFT: GridPaperRenderOptions = { size: 256, supersample: 1 }
const PREVIEW: GridPaperRenderOptions = { size: 512, supersample: 2 }

/** 값이 멈춘 뒤 고해상도로 다시 굽기까지 기다리는 시간(ms). */
const SETTLE_DELAY = 250

function createTexture(
  params: GridPaperParams,
  options: GridPaperRenderOptions,
  repeat: number,
  anisotropy: number,
) {
  const pixels = renderGridPaper(params, options)
  const canvas = document.createElement('canvas')
  canvas.width = options.size
  canvas.height = options.size

  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D 컨텍스트를 만들 수 없습니다.')

  const image = context.createImageData(options.size, options.size)
  for (let i = 0; i < options.size * options.size; i++) {
    image.data[i * 4] = pixels[i * 3]
    image.data[i * 4 + 1] = pixels[i * 3 + 1]
    image.data[i * 4 + 2] = pixels[i * 3 + 2]
    image.data[i * 4 + 3] = 255
  }
  context.putImageData(image, 0, 0)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.anisotropy = anisotropy
  return texture
}

/**
 * 개발용 HUD로 값을 조절하는 동안 쓰는 미리보기 텍스처.
 * HUD를 건드리기 전(`tuned`가 false)에는 null을 반환하고, 바닥은 구워둔 PNG를 그대로 쓴다.
 *
 * 값이 바뀌면 저해상도로 즉시 구워 반응을 주고, 조작이 멈추면 고해상도로 다시 굽는다.
 * 텍스처를 브라우저에서 굽는 일이 무겁기 때문.
 */
export function useGridPaperPreview(size: number, anisotropy: number) {
  const params = useGridPaperStore((s) => s.params)
  const tuned = useGridPaperStore((s) => s.tuned)

  const [texture, setTexture] = useState<CanvasTexture | null>(null)
  // 지금 화면에 물린 텍스처를 붙들어, 새 것으로 갈아끼울 때 옛 것을 해제한다.
  const live = useRef<CanvasTexture | null>(null)

  // 텍스처 생성은 부수효과라 렌더(useMemo)가 아니라 아래 effect의 비동기 콜백에서만 한다.
  // 렌더 중 대입을 피해 StrictMode 이중 실행에도 텍스처가 새지 않는다.
  const swap = useCallback((next: CanvasTexture | null) => {
    if (live.current && live.current !== next) live.current.dispose()
    live.current = next
    setTexture(next)
  }, [])

  useEffect(() => {
    if (!tuned) {
      // 튜닝을 끄면 물려 있던 텍스처를 해제한다.
      const raf = requestAnimationFrame(() => swap(null))
      return () => cancelAnimationFrame(raf)
    }

    let cancelled = false
    const repeat = size / PAPER_TILE_SIZE
    // 값이 바뀌면 저해상도로 즉시 반응을 주고, 조작이 멈추면 고해상도로 다시 굽는다.
    const raf = requestAnimationFrame(() => {
      if (!cancelled) swap(createTexture(params, DRAFT, repeat, anisotropy))
    })
    const timer = window.setTimeout(() => {
      if (!cancelled) swap(createTexture(params, PREVIEW, repeat, anisotropy))
    }, SETTLE_DELAY)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [params, tuned, size, anisotropy, swap])

  // 언마운트 시 남은 텍스처 정리.
  useEffect(() => () => live.current?.dispose(), [])

  return tuned ? texture : null
}
