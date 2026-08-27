import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { PAGE_ICON_LIFT } from './PageIcon.constants'
import type { PageIconProps } from './PageIcon.types'

/**
 * 페이지에 두는 그림 한 장.
 *
 * 판 크기는 **세로를 기준으로** 잡고 가로는 그림의 실제 비율에서 구한다. 그림을 갈아끼워도
 * 코드를 고칠 일이 없다. 핸들러가 없어 R3F 이벤트 대상이 아니므로 밑의 것을 가리지 않는다.
 */
export function PageIcon({ icon, x, y, size }: PageIconProps) {
  const texture = useLoader(TextureLoader, icon)
  const image = texture.image as { width: number; height: number }
  const width = (size * image.width) / image.height

  return (
    <mesh position={[x, y, PAGE_ICON_LIFT]}>
      <planeGeometry args={[width, size]} />
      {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
      <meshBasicMaterial
        map={texture}
        map-colorSpace={SRGBColorSpace}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
