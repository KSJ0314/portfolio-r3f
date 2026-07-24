import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { CanvasTexture, Loader, SRGBColorSpace } from 'three'
import { CRAYON_TEXTURE_PIXELS } from './Crayon.constants'
import { drawCrayonDrawing } from './Crayon.draw'
import type { CrayonDrawing, CrayonStrokeParams } from './Crayon.types'

/** 크레파스 텍스처를 굽는 입력. 로더의 캐시 키로 직렬화한다. */
interface CrayonBakeInput {
  drawing: CrayonDrawing
  params: Partial<Omit<CrayonStrokeParams, 'seed'>>
  pixels: number
}

/**
 * 크레파스 그림을 캔버스에 구워 `CanvasTexture`로 내주는 로더.
 *
 * 크레파스는 파일이 아니라 그때그때 굽는 것이지만, `useLoader`(Suspense)에 태우려고 로더로 감싼다.
 * 그래야 텍스처가 준비된 뒤 렌더 트리에 직접 주입돼 깜빡이지 않는다.
 * 입력(`key`)은 그림·파라미터를 직렬화한 문자열이고, 이게 곧 useLoader의 캐시 키다.
 */
class CrayonTextureLoader extends Loader<CanvasTexture> {
  load(
    key: string,
    onLoad?: (data: CanvasTexture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    try {
      const { drawing, params, pixels } = JSON.parse(key) as CrayonBakeInput
      const canvas = document.createElement('canvas')
      canvas.width = pixels
      canvas.height = pixels
      const ctx = canvas.getContext('2d')
      if (ctx) drawCrayonDrawing(ctx, pixels, drawing, params)
      const texture = new CanvasTexture(canvas)
      texture.colorSpace = SRGBColorSpace
      onLoad?.(texture)
    } catch (err) {
      onError?.(err)
    }
  }
}

/**
 * 크레파스 그림을 텍스처로 굽고 GPU에 올려 돌려주는 훅.
 * 텍스처를 불러오는 동안 서스펜드되므로 Suspense/ErrorBoundary 안에서 쓴다.
 */
export function useCrayonTexture(
  drawing: CrayonDrawing,
  params: Partial<Omit<CrayonStrokeParams, 'seed'>>,
  pixels: number = CRAYON_TEXTURE_PIXELS,
): CanvasTexture {
  const gl = useThree((s) => s.gl)
  const key = JSON.stringify({ drawing, params, pixels } satisfies CrayonBakeInput)
  const texture = useLoader(CrayonTextureLoader, key)

  // 텍스처를 GPU에 미리 올린다(drei useTexture와 같은 처리 — 첫 렌더의 업로드 지연 방지).
  useEffect(() => {
    gl.initTexture(texture)
  }, [gl, texture])

  return texture
}
