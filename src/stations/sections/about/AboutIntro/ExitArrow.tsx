import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { CanvasTexture, Loader, SRGBColorSpace } from 'three'
import { DEFAULT_CRAYON_PARAMS, drawCrayonStroke, type CrayonPoint } from '../../../../lib/crayon'
import { useStationStore } from '../../../../state/useStationStore'
import type { ArrowTextureParams, ExitArrowProps } from './AboutIntro.types'

/** 화살표 텍스처 한 변의 픽셀 수. 화면에 뜨는 크기보다 넉넉히 잡아 알갱이가 뭉개지지 않게 한다. */
const ARROW_TEXTURE_PIXELS = 512

/** 텍스처가 덮는 정사각 영역은 화살표 길이보다 조금 넓다(획이 잘리지 않도록). */
const ARROW_TEXTURE_MARGIN = 1.35

/**
 * 크레파스로 그린 나가기 화살표를 캔버스에 굽는다.
 * 몸통 한 획 + 화살촉 두 획이고, 획마다 씨앗을 달리해 서로 다른 손놀림처럼 보이게 한다.
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  pixels: number,
  params: { color: string; strokePixels: number; roughness: number; opacity: number },
): void {
  const at = (u: number, v: number): CrayonPoint => [u * pixels, v * pixels]
  const base = {
    ...DEFAULT_CRAYON_PARAMS,
    color: params.color,
    width: params.strokePixels,
    roughness: params.roughness,
    opacity: params.opacity,
    wobble: params.strokePixels * 0.18,
  }

  // 몸통. 끝을 조금 지나쳐 그어야 손으로 그은 느낌이 난다.
  drawCrayonStroke(ctx, [at(0.1, 0.5), at(0.84, 0.5)], { ...base, seed: 11 })
  // 화살촉 두 획.
  drawCrayonStroke(ctx, [at(0.58, 0.24), at(0.88, 0.5)], { ...base, seed: 29 })
  drawCrayonStroke(ctx, [at(0.58, 0.76), at(0.88, 0.5)], { ...base, seed: 47 })
}

/**
 * 크레파스 화살표 텍스처를 캔버스에 구워 내주는 로더.
 *
 * 크레파스는 파일이 아니라 그때그때 굽는 것이지만, `useLoader`(Suspense)에 태우려고 로더로 감싼다.
 * 그래야 사진과 똑같이 **텍스처가 준비된 뒤 렌더 트리에 직접 주입**돼 깜빡이지 않는다.
 * 앞으로 다른 손그림 요소도 같은 틀(전용 로더 + useLoader)을 쓸 수 있다.
 * 입력(`key`)은 굽는 파라미터를 직렬화한 문자열이고, 이게 곧 useLoader의 캐시 키다.
 */
class CrayonArrowLoader extends Loader<CanvasTexture> {
  load(
    key: string,
    onLoad?: (data: CanvasTexture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    try {
      const params = JSON.parse(key) as ArrowTextureParams
      const canvas = document.createElement('canvas')
      canvas.width = ARROW_TEXTURE_PIXELS
      canvas.height = ARROW_TEXTURE_PIXELS
      const ctx = canvas.getContext('2d')
      if (ctx) drawArrow(ctx, ARROW_TEXTURE_PIXELS, params)
      const texture = new CanvasTexture(canvas)
      texture.colorSpace = SRGBColorSpace
      onLoad?.(texture)
    } catch (err) {
      onError?.(err)
    }
  }
}

/**
 * 활성 상태에서 페이지 우측 아래에 놓이는 나가기 화살표.
 *
 * 크레파스는 매끈한 선이 아니라 종이 결에 걸린 왁스 알갱이라, 벡터 선 대신 캔버스에 구운 텍스처를 쓴다.
 * 누르면 스테이션을 닫는다. 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 */
export function ExitArrow({ x, y, size, color, stroke, roughness, opacity }: ExitArrowProps) {
  const gl = useThree((s) => s.gl)
  const plane = size * ARROW_TEXTURE_MARGIN

  // 월드 단위 굵기를 텍스처 픽셀로 환산한 뒤, 굽는 파라미터를 캐시 키로 직렬화한다.
  const key = JSON.stringify({
    color,
    strokePixels: (stroke / plane) * ARROW_TEXTURE_PIXELS,
    roughness,
    opacity,
  } satisfies ArrowTextureParams)
  const texture = useLoader(CrayonArrowLoader, key)

  // 텍스처를 GPU에 미리 올린다(사진과 같은 처리).
  useEffect(() => {
    gl.initTexture(texture)
  }, [gl, texture])

  // 클릭하면 이 컴포넌트가 곧 사라지므로 커서를 되돌릴 기회가 없다. 언마운트될 때 되돌린다.
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  return (
    // 텍스처 판이 곧 클릭 판정 범위다.
    // 좌클릭만 종료로 받고, 우클릭(이동)은 막지 않아 뒤의 바닥으로 넘어간다.
    <mesh
      position={[x, y, 0]}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        useStationStore.getState().requestClose()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      <planeGeometry args={[plane, plane]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}
