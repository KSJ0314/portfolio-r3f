import { useEffect, useMemo, useState } from 'react'
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

  // 값이 바뀌면 렌더 중에 곧바로 저해상도로 굽는다(파생값이므로 상태가 아니라 useMemo다).
  const draft = useMemo(
    () => (tuned ? createTexture(params, DRAFT, size / PAPER_TILE_SIZE, anisotropy) : null),
    [params, tuned, size, anisotropy],
  )

  // 고해상도는 조작이 멈춘 뒤에 굽는다. 어떤 값으로 구웠는지 함께 들고 있어야
  // 값이 바뀐 직후에 옛 텍스처를 그대로 쓰는 일이 없다.
  const [settled, setSettled] = useState<{ params: GridPaperParams; texture: CanvasTexture } | null>(
    null,
  )

  useEffect(() => {
    if (!tuned) return
    const timer = window.setTimeout(() => {
      const texture = createTexture(params, PREVIEW, size / PAPER_TILE_SIZE, anisotropy)
      setSettled({ params, texture })
    }, SETTLE_DELAY)
    return () => window.clearTimeout(timer)
  }, [params, tuned, size, anisotropy])

  // 텍스처는 GPU 자원이라 쓰임이 끝나면 직접 정리한다.
  useEffect(() => () => draft?.dispose(), [draft])
  useEffect(() => () => settled?.texture.dispose(), [settled])

  if (!tuned) return null
  // 고해상도가 지금 값으로 구워졌을 때만 그것을 쓰고, 아니면 저해상도 초안을 쓴다.
  return settled?.params === params ? settled.texture : draft
}
