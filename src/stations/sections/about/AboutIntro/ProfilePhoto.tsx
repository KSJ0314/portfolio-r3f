import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'
import { PROFILE_PHOTO_URL } from './AboutIntro.constants'

/**
 * 사진 로드 실패 시 재시도 간격(ms). 초기 시도 1회 + 이 배열만큼 재시도한다.
 * 일시적 실패(네트워크 순단 등)는 이 안에서 대개 회복되고, 경로 오류처럼 영구적인 실패는 소진 후 멈춘다.
 */
const PHOTO_RETRY_DELAYS = [500, 1500, 3000]

/**
 * 실패 시 재시도하는 TextureLoader.
 *
 * `useLoader`(Suspense)는 텍스처를 렌더 트리에 직접 주입해, mesh가 처음 마운트될 때부터 텍스처가 붙어 있다.
 * 상태로 뒤늦게 주입하는 방식은 한 프레임 늦게 반영돼 깜빡이지만, 이 방식은 그렇지 않다.
 * 재시도만 얹으려고 로더의 `load`를 감싼다 — 최종 실패는 그대로 던져 Suspense 경계(ErrorBoundary)가 받는다.
 */
class RetryingTextureLoader extends TextureLoader {
  load(
    url: string,
    onLoad?: (data: Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): Texture<HTMLImageElement> {
    let texture!: Texture<HTMLImageElement>
    const attempt = (retries: number) => {
      texture = super.load(url, onLoad, onProgress, (err) => {
        if (retries < PHOTO_RETRY_DELAYS.length) {
          setTimeout(() => attempt(retries + 1), PHOTO_RETRY_DELAYS[retries])
        } else {
          onError?.(err)
        }
      })
    }
    attempt(0)
    return texture
  }
}

/**
 * 하단 프로필 사진. 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 * 가로는 불러온 이미지의 실제 크기에서 계산한다 — 사진을 갈아끼워도 비율이 알아서 맞는다.
 */
export function ProfilePhoto({ bottom, height }: { bottom: number; height: number }) {
  const gl = useThree((s) => s.gl)
  const texture = useLoader(RetryingTextureLoader, PROFILE_PHOTO_URL)

  // 텍스처를 GPU에 미리 올린다(drei useTexture와 같은 처리 — 첫 렌더의 업로드 지연 방지).
  useEffect(() => {
    gl.initTexture(texture)
  }, [gl, texture])

  const image = texture.image as { width: number; height: number }
  const width = height * (image.width / image.height)

  return (
    <mesh position={[0, bottom + height / 2, 0]} raycast={() => null}>
      <planeGeometry args={[width, height]} />
      {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
      <meshBasicMaterial map={texture} map-colorSpace={SRGBColorSpace} transparent toneMapped={false} />
    </mesh>
  )
}
