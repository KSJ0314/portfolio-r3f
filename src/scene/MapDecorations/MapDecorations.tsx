import { Suspense } from 'react'
import { Crosswalk } from './Crosswalk'
import { ProjectsCar } from './ProjectsCar'
import { RightClickHint } from './RightClickHint'
import { SkillsGuideArrow } from './SkillsGuideArrow'
import { TrafficLight } from './TrafficLight'

/**
 * 종이 위에 얹히는 맵 장식들의 자리 — 길안내 화살표·조작 안내처럼 스테이션에 속하지 않는 요소.
 *
 * 영역·근접 판정·라이프사이클이 없어 여기서는 마운트만 하고, 무엇을 언제 어떻게 그릴지는 요소가 각자 정한다.
 * Suspense는 요소마다 두지 않고 이 공통 자리에 하나만 둔다 — 하나라도 빠뜨리면 씬 전체로 번진다.
 */
export function MapDecorations() {
  return (
    <Suspense fallback={null}>
      <SkillsGuideArrow />
      <RightClickHint />
      <Crosswalk />
      <TrafficLight />
      <ProjectsCar />
    </Suspense>
  )
}
