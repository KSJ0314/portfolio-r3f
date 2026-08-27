import { usePointerCursor } from '../../../../../../scene/usePointerCursor'
import { PageIcon } from '../PageIcon'
import { PAGE_LINK_HIT_SCALE, PAGE_LINK_LIFT } from './PageLink.constants'
import type { PageLinkProps } from './PageLink.types'

/**
 * 페이지에 두는 링크 아이콘. 누르면 새 탭으로 연다.
 *
 * 그림은 `PageIcon`이 그리고 여기서는 **누르는 판**만 얹는다. 판은 그림보다 넓은 정사각형이라
 * 아이콘 비율을 알 필요가 없다.
 *
 * 클릭은 R3F 이벤트면 된다 — 확대해 보는 동안에는 이동 입력이 막혀 있어 우클릭 홀드와 겹치지 않는다.
 */
export function PageLink({ icon, url, x, y, size }: PageLinkProps) {
  const cursor = usePointerCursor()

  return (
    <>
      <PageIcon icon={icon} x={x} y={y} size={size} />
      <mesh
        position={[x, y, PAGE_LINK_LIFT]}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        {...cursor}
      >
        <planeGeometry args={[size * PAGE_LINK_HIT_SCALE, size * PAGE_LINK_HIT_SCALE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}
