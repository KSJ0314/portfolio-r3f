import { useCallback, useMemo, useState } from 'react'
import { useCollection } from '../../../../../lib/firebase'
import { useCareerPageStore } from '../../../../../state/useCareerPageStore'
import { useStationGate } from '../../../../useStationGate'
import { INK_LINE, careerColumnLeft, careerColumnWidth } from '../AboutCareer.constants'
import { CAREER_COLUMN_BOUNDARIES, CAREER_CONTENT_Y } from './CareerColumns.constants'
import { toAwardEntries, toEducationEntries, toSpecEntries } from './CareerColumns.data'
import type { AwardDoc, CareerEntryData, EducationDoc, SpecDoc } from './CareerColumns.types'
import { CareerEntry } from './CareerEntry'

/**
 * 활성 상태에서 로고 줄 아래를 채우는 세 칸 — 교육 · 수상내역 · 자격증.
 *
 * 칸 순서는 로고·제목과 같고(`CAREER_COLUMN_TITLES`), 칸마다 위에서부터 항목을 쌓는다.
 * 수상 설명은 몇 줄로 접힐지 미리 알 수 없어 각 항목이 재서 알려주는 높이로 다음 자리를 잡고,
 * 그 높이가 다 모이기 전에는 겹쳐 보이므로 상세 전체를 잡아 둔다.
 */
export function CareerColumns() {
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)
  const padding = useCareerPageStore((s) => s.padding)
  const list = useCareerPageStore((s) => s.list)
  const divider = useCareerPageStore((s) => s.divider)
  const education = useCollection<EducationDoc>('education')
  const awards = useCollection<AwardDoc>('awards')
  const spec = useCollection<SpecDoc>('spec')
  const [heights, setHeights] = useState<Record<string, number>>({})

  // 목록은 Firestore를 기다린다. 그동안 나가기만 먼저 뜨지 않도록 상세 전체를 잡아둔다.
  useStationGate('career:data', education.loading || awards.loading || spec.loading)

  const reportHeight = useCallback((id: string, height: number) => {
    setHeights((prev) =>
      Math.abs((prev[id] ?? -1) - height) < 1e-4 ? prev : { ...prev, [id]: height },
    )
  }, [])

  // 칸마다 담을 항목. 컬렉션별로 다른 필드를 여기서 한 형태로 맞춘다.
  const columns = useMemo<CareerEntryData[][]>(
    () => [
      toEducationEntries(education.data),
      toAwardEntries(awards.data),
      toSpecEntries(spec.data),
    ],
    [education.data, awards.data, spec.data],
  )

  const entryWidth = careerColumnWidth(area.width, padding.x) - list.paddingX * 2

  // 구분선은 여백 안쪽에서도 세로 전체를 긋지 않고 위아래를 더 들인다.
  const dividerHeight = area.height - padding.y * 2 - divider.top - divider.bottom
  const dividerY = area.height / 2 - padding.y - divider.top - dividerHeight / 2

  // 칸마다 위에서부터 높이를 쌓아 자리를 잡는다.
  const placed = useMemo(() => {
    return columns.flatMap((entries, index) => {
      const x = careerColumnLeft(index, area.width, padding.x) + list.paddingX
      let y = area.height / 2 - padding.y - list.top
      return entries.map((entry) => {
        const at = { entry, x, y }
        // 제목은 글자 크기 × 줄 수로 잡는다. 개행이 든 제목은 드물어 근사로 충분하다.
        const title = list.titleSize * entry.title.split('\n').length
        // 본문은 잰 높이를, 메타는 한 줄 높이를 차지한다. 없는 것은 그 자리를 건너뛴다.
        const hasBody = Boolean(entry.body?.length)
        const body = hasBody ? list.titleGap + (heights[entry.id] ?? 0) : 0
        // 메타 위 간격은 무엇을 뒤따르는지에 달렸다 — 본문 다음이면 줄 간격, 제목 바로 아래면 제목 간격.
        const meta = entry.meta ? (hasBody ? list.lineGap : list.titleGap) + list.bodySize : 0
        y -= title + body + meta + list.itemGap
        return at
      })
    })
  }, [columns, heights, area, padding, list])

  // 본문이 있는 항목만 재야 한다. 나머지는 글자 크기로 바로 계산돼 기다릴 것이 없다.
  const measured = placed.every(
    ({ entry }) => !entry.body?.length || heights[entry.id] !== undefined,
  )
  useStationGate('career:layout', !measured)

  return (
    <group
      position={[topCenter.x, CAREER_CONTENT_Y, topCenter.z + area.height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* 칸이 맞닿는 경계마다 세로선. 칸 왼쪽 테두리가 곧 경계라 그 자리에 세운다. */}
      {dividerHeight > 0 &&
        CAREER_COLUMN_BOUNDARIES.map((index) => (
          <mesh
            key={index}
            position={[careerColumnLeft(index, area.width, padding.x), dividerY, 0]}
            raycast={() => null}
          >
            <planeGeometry args={[divider.width, dividerHeight]} />
            <meshBasicMaterial color={INK_LINE} toneMapped={false} />
          </mesh>
        ))}

      {placed.map(({ entry, x, y }) => (
        <CareerEntry
          key={entry.id}
          entry={entry}
          x={x}
          y={y}
          width={entryWidth}
          layout={list}
          bodyHeight={heights[entry.id] ?? 0}
          onBodyHeight={reportHeight}
        />
      ))}
    </group>
  )
}
