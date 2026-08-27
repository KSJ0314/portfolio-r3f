import { useCallback, useMemo, useState } from 'react'
import { useCollection } from '../../../../../lib/firebase'
import { useSkillsPageStore } from '../../../../../state/useSkillsPageStore'
import { LoadFailed } from '../../../../LoadFailed'
import { useStationGate } from '../../../../useStationGate'
import { SkillsPager } from '../SkillsPager'
import { SkillItem } from './SkillItem'
import { SKILL_PAGES, SKILLS_CONTENT_Y } from './SkillsPages.constants'
import type { SkillDoc } from './SkillsPages.types'

/**
 * 활성 상태에서 제목 아래를 채우는 기술 목록. 페이지를 넘기면 이 영역만 갈린다(제목·로고는 그대로).
 *
 * 쓸 내용이 많아 분류로 페이지를 나누고, 한 페이지는 두 열로 늘어놓는다.
 * 항목 높이는 설명이 몇 줄로 접히는지에 달려 있어 미리 알 수 없으므로, 각 항목이 배치를 끝내고
 * 알려주는 높이로 다음 항목 자리를 잡는다. 높이가 다 모이기 전에는 겹쳐 보이므로 그동안 감춘다.
 */
export function SkillsPages() {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
  const list = useSkillsPageStore((s) => s.list)
  const level = useSkillsPageStore((s) => s.level)
  const pager = useSkillsPageStore((s) => s.pager)
  const { data: skills, loading, error, refetch } = useCollection<SkillDoc>('skills')
  // 목록은 Firestore를 기다린다. 그동안 나가기·페이지 넘김만 먼저 뜨지 않도록 상세 전체를 잡아둔다.
  useStationGate('skills:data', loading)
  const [page, setPage] = useState(0)
  const [heights, setHeights] = useState<Record<string, number>>({})

  const reportHeight = useCallback((id: string, height: number) => {
    setHeights((prev) =>
      Math.abs((prev[id] ?? -1) - height) < 1e-4 ? prev : { ...prev, [id]: height },
    )
  }, [])

  // 열마다 담을 기술. 열이 하나뿐이면 그 안을 개수로 반 나눠 두 열로 늘어놓는다.
  const columns = useMemo(() => {
    const pick = (categories: readonly string[]) =>
      skills
        .filter((skill) => skill.active !== false && categories.includes(skill.category))
        .sort((a, b) => a.order - b.order)

    const groups = (SKILL_PAGES[page]?.columns ?? []).map(pick)
    if (groups.length !== 1) return groups
    const only = groups[0]
    const half = Math.ceil(only.length / 2)
    return [only.slice(0, half), only.slice(half)]
  }, [skills, page])

  const items = useMemo(() => columns.flat(), [columns])
  const columnWidth = (area.width - list.paddingX * 2 - list.columnGap) / 2

  // 열마다 위에서부터 높이를 쌓아 자리를 잡는다.
  const placed = useMemo(() => {
    return columns.flatMap((column, index) => {
      const x = -area.width / 2 + list.paddingX + index * (columnWidth + list.columnGap)
      let y = area.height / 2 - list.top
      return column.map((skill) => {
        const at = { skill, x, y }
        y -= (heights[skill.id] ?? 0) + list.itemGap
        return at
      })
    })
  }, [columns, heights, area, list, columnWidth])

  // 항목 높이가 다 모여야 자리가 잡힌다. 그전에는 겹쳐 보이므로 상세 전체를 마저 잡아둔다.
  // 빈 페이지(전부 비활성 등)는 잴 것이 없으므로 측정이 끝난 것으로 본다 — 아니면 영영 감춰진다.
  const measured = items.every((skill) => heights[skill.id] !== undefined)
  useStationGate('skills:layout', !measured)

  return (
    <group
      position={[topLeft.x + area.width / 2, SKILLS_CONTENT_Y, topLeft.z + area.height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* 읽기가 실패하면 목록도 페이지 넘김도 뜻이 없으므로 그 자리에 한 줄만 둔다. */}
      {error ? (
        <LoadFailed size={list.nameSize} onRetry={refetch} />
      ) : (
        <>
          <group>
            {placed.map(({ skill, x, y }) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                x={x}
                y={y}
                width={columnWidth}
                nameSize={list.nameSize}
                nameGap={list.nameGap}
                bodySize={list.bodySize}
                bodyLineHeight={list.bodyLineHeight}
                level={level}
                onHeight={reportHeight}
              />
            ))}
          </group>

          <SkillsPager
            page={page}
            count={SKILL_PAGES.length}
            onPage={setPage}
            x={area.width / 2 - pager.right}
            y={-area.height / 2 + pager.bottom}
            size={pager.size}
          />
        </>
      )}
    </group>
  )
}
