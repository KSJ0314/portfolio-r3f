import { Suspense } from 'react'
import { SkillsGuideArrow } from '../../stations/sections/about/AboutSkills'

/**
 * 종이 위에 얹히는 맵 장식들의 자리 — 길안내 화살표·표지판처럼 스테이션에 속하지 않는 요소.
 *
 * 영역·근접 판정·라이프사이클이 없어 여기서는 마운트만 하고, 무엇을 언제 어떻게 그릴지는 요소가 각자 정한다.
 * 특정 스테이션으로 유도하는 요소는 그 스테이션 폴더에 두고 여기서 불러 쓴다.
 * Suspense는 요소마다 두지 않고 이 공통 자리에 하나만 둔다 — 하나라도 빠뜨리면 씬 전체로 번진다.
 */
export function MapDecorations() {
  return (
    <Suspense fallback={null}>
      <SkillsGuideArrow />
    </Suspense>
  )
}
