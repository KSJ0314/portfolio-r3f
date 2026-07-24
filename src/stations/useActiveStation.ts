import { getStation, type Station } from '../content/stations'
import { useStationStore } from '../state/useStationStore'
import { getStationEntry, type StationEntry } from './registry'

/**
 * 활성 스테이션의 배치 데이터와 등록된 전용 구현을 함께 돌려준다.
 * 활성 스테이션이 없거나 등록된 구현이 없으면 null.
 */
export function useActiveStation(): { station: Station; entry: StationEntry } | null {
  const activeId = useStationStore((s) => s.activeId)
  if (activeId === null) return null

  const station = getStation(activeId)
  const entry = getStationEntry(activeId)
  if (!station || !entry) return null

  return { station, entry }
}
