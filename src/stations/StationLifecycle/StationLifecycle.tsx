import { useEffect } from 'react'
import { useStationStore } from '../../state/useStationStore'
import { useActiveStation } from '../useActiveStation'

/**
 * 스테이션 활성화 라이프사이클의 공통층(Canvas 밖).
 *
 * 1. **2D 상세 마운트 자리** — 등록된 `Overlay`가 있으면 렌더한다.
 *    패널의 모양·레이아웃·닫기 버튼은 각 스테이션 구현의 몫이며 공통 셸을 두지 않는다(registry.ts 참고).
 * 2. **ESC 종료** — 언제든 ESC로 종료를 요청할 수 있다(active일 때만 받아들여진다).
 * 3. **미구현 스테이션 fallback** — 등록된 구현이 없으면 애니메이션이 끝났다고 알려줄 주체가 없어
 *    영영 잠긴다. 그래서 구현이 없을 때는 공통층이 즉시 완료로 처리한다.
 */
export function StationLifecycle() {
  const requestClose = useStationStore((s) => s.requestClose)
  const phase = useStationStore((s) => s.phase)
  const active = useActiveStation()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  // 등록된 구현이 없는 스테이션은 애니메이션도 없다 → 진입·종료를 즉시 끝난 것으로 처리한다.
  // 레지스트리에 항목만 있고 Scene·Overlay가 둘 다 없으면 알려줄 주체가 없는 것은 마찬가지이므로,
  // 항목 유무가 아니라 실제 컴포넌트 유무로 판정한다.
  const hasImplementation = Boolean(active?.entry.Scene || active?.entry.Overlay)
  useEffect(() => {
    if (hasImplementation) return
    const { enterComplete, exitComplete } = useStationStore.getState()
    if (phase === 'entering') enterComplete()
    else if (phase === 'exiting') exitComplete()
  }, [hasImplementation, phase])

  const Overlay = active?.entry.Overlay
  if (!Overlay || !active) return null

  return <Overlay key={active.station.id} station={active.station} phase={phase} />
}
