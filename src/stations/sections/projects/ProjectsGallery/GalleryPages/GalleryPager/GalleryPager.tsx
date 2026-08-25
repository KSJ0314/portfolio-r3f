import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'
import { usePointerCursor } from '../../../../../../scene/usePointerCursor'
import { useGalleryPageStore } from '../../../../../../state/useGalleryPageStore'
import {
  GALLERY_PAGER_DIM,
  GALLERY_PAGER_HIT_SCALE,
  GALLERY_PAGER_ICON,
  GALLERY_PAGER_INK,
} from './GalleryPager.constants'
import type { GalleryPagerProps } from './GalleryPager.types'

/**
 * 페이지 넘김 — 하단 점 인디케이터 + 좌우 끝 꺾쇠.
 *
 * 점은 지금 보는 장만 채워 몇 장 중 어디인지 보이고, 눌러 그 장으로 바로 간다.
 * 꺾쇠는 **첫 장에서 왼쪽, 마지막 장에서 오른쪽을 두지 않는다** — 눌러도 갈 곳이 없다.
 * 페이지가 한 장뿐이면 둘 다 두지 않는다.
 *
 * 꺾쇠는 그려 둔 SVG 아이콘(`GALLERY_PAGER_ICON`)을 판에 얹는다. 끝과 꼭짓점이 둥근 것도,
 * 굵기와 색도 그 파일이 갖는다. 씬 안 3D 글씨는 서브셋 ttf를 직접 읽어 `‹`·`▶` 같은 글리프가
 * 없을 수 있어 글씨로는 두지 않는다.
 *
 * 클릭은 R3F 이벤트면 된다 — 확대해 보는 동안에는 이동 입력이 막혀 있어 우클릭 홀드와 겹치지 않는다.
 */
export function GalleryPager({ page, count, height, onPage }: GalleryPagerProps) {
  const pager = useGalleryPageStore((s) => s.pager)
  // 아이콘은 페이지를 넘겨도 같은 한 장이라 호출부 Suspense가 한 번만 기다린다.
  const icon = useLoader(TextureLoader, GALLERY_PAGER_ICON)

  if (count < 2) return null

  const dotY = -height / 2 + pager.dotBottom
  const arrowX = 0.5 - pager.arrowInset
  // 누르는 판이 이웃을 침범하면 옆 판에서 벗어날 때 커서가 지워진다. 얹힌 판 모두가 이벤트를
  // 받는데, 아직 얹혀 있는 쪽은 이미 얹힌 상태라 커서를 다시 세우지 않기 때문이다.
  const dotHitRadius = Math.min(pager.dotRadius * GALLERY_PAGER_HIT_SCALE, pager.dotGap / 2)

  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <PagerDot
          key={index}
          x={(index - (count - 1) / 2) * pager.dotGap}
          y={dotY}
          radius={pager.dotRadius}
          hitRadius={dotHitRadius}
          current={index === page}
          onSelect={() => onPage(index)}
        />
      ))}

      {page > 0 && (
        <PagerArrow
          icon={icon}
          x={-arrowX}
          size={pager.arrowSize}
          flip
          onSelect={() => onPage(page - 1)}
        />
      )}
      {page < count - 1 && (
        <PagerArrow
          icon={icon}
          x={arrowX}
          size={pager.arrowSize}
          onSelect={() => onPage(page + 1)}
        />
      )}
    </group>
  )
}

/** 점 하나. 그림보다 넓은 판이 클릭을 받는다. */
function PagerDot({
  x,
  y,
  radius,
  hitRadius,
  current,
  onSelect,
}: {
  x: number
  y: number
  radius: number
  hitRadius: number
  current: boolean
  onSelect: () => void
}) {
  const cursor = usePointerCursor()

  return (
    <group position={[x, y, 0.001]}>
      <mesh>
        <circleGeometry args={[radius, 24]} />
        <meshBasicMaterial
          color={current ? GALLERY_PAGER_INK : GALLERY_PAGER_DIM}
          toneMapped={false}
        />
      </mesh>
      {/* 누르는 판. 핸들러가 없는 그림은 R3F 이벤트 대상이 아니라 이쪽이 다 받는다. */}
      <mesh onClick={onSelect} {...cursor}>
        <circleGeometry args={[hitRadius, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * 꺾쇠 하나. 세로 가운데에 선다.
 *
 * 판 크기는 **세로를 기준으로** 잡고 가로는 아이콘의 실제 비율에서 구한다.
 * 그림을 갈아끼워도 코드를 고칠 일이 없다.
 */
function PagerArrow({
  icon,
  x,
  size,
  flip = false,
  onSelect,
}: {
  icon: Texture
  x: number
  size: number
  flip?: boolean
  onSelect: () => void
}) {
  const cursor = usePointerCursor()
  const image = icon.image as { width: number; height: number }
  const width = (size * image.width) / image.height

  return (
    <group position={[x, 0, 0.001]}>
      <mesh rotation={[0, 0, flip ? Math.PI : 0]}>
        <planeGeometry args={[width, size]} />
        {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
        <meshBasicMaterial
          map={icon}
          map-colorSpace={SRGBColorSpace}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh onClick={onSelect} {...cursor}>
        <planeGeometry args={[size * GALLERY_PAGER_HIT_SCALE, size * GALLERY_PAGER_HIT_SCALE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
