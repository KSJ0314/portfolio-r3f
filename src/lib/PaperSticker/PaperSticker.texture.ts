import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { CanvasTexture, Loader, SRGBColorSpace } from 'three'
import { bakePaperSticker } from './PaperSticker.bake'
import type { PaperStickerParams } from './PaperSticker.types'

/** 스티커를 굽는 입력. 로더의 캐시 키로 직렬화한다. */
interface PaperStickerInput {
  url: string
  params: PaperStickerParams
}

/** 구운 스티커 — 텍스처와 크기들(그림 세로 = 1 기준). */
export interface PaperStickerTexture {
  texture: CanvasTexture
  /** 여백을 포함한 판 크기. */
  plane: { width: number; height: number }
  /** 여백을 뺀 그림 자체의 크기. */
  artwork: { width: number; height: number }
}

/**
 * 이미지를 불러와 종이 스티커로 굽는 로더.
 *
 * 파일을 그대로 쓰지 않고 캔버스에서 합성하지만, `useLoader`(Suspense)에 태우려고 로더로 감싼다.
 * 그래야 텍스처가 준비된 뒤 렌더 트리에 직접 주입돼 깜빡이지 않는다. (크레파스 텍스처와 같은 틀)
 */
class PaperStickerLoader extends Loader<PaperStickerTexture> {
  load(
    key: string,
    onLoad?: (data: PaperStickerTexture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    const { url, params } = JSON.parse(key) as PaperStickerInput
    const image = new Image()
    image.onload = () => {
      try {
        const { canvas, plane, artwork } = bakePaperSticker(image, params)
        const texture = new CanvasTexture(canvas)
        texture.colorSpace = SRGBColorSpace
        onLoad?.({ texture, plane, artwork })
      } catch (err) {
        onError?.(err)
      }
    }
    image.onerror = (err) => onError?.(err)
    image.src = url
  }
}

/**
 * 이미지를 종이 스티커 텍스처로 굽고 GPU에 올려 돌려주는 훅.
 * 굽는 동안 서스펜드되므로 Suspense/ErrorBoundary 안에서 쓴다.
 */
export function usePaperStickerTexture(
  url: string,
  params: PaperStickerParams,
): PaperStickerTexture {
  const gl = useThree((s) => s.gl)
  const key = JSON.stringify({ url, params } satisfies PaperStickerInput)
  const sticker = useLoader(PaperStickerLoader, key)

  // 텍스처를 GPU에 미리 올린다(drei useTexture와 같은 처리 — 첫 렌더의 업로드 지연 방지).
  useEffect(() => {
    gl.initTexture(sticker.texture)
  }, [gl, sticker])

  return sticker
}
