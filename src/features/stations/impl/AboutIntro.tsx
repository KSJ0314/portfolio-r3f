import { useEffect } from 'react'
import { useStationStore } from '../../../state/useStationStore'
import type { StationDetailProps } from '../registry'

/** 임시: 진입·종료 애니메이션 길이(ms) 대신 쓰는 지연. 실제 연출로 교체 예정. */
const TEMP_ANIMATION_MS = 1000

/**
 * `about-intro` 스테이션 전용 구현 — **임시 뼈대**.
 *
 * 아직 상세도 애니메이션도 없다.
 * 라이프사이클 계약(진입·종료 애니메이션을 재생하고 끝나면 공통층에 통지)이 실제로 도는지 확인하려고
 * 애니메이션이 있어야 할 자리에 지연만 넣어둔 것이다.
 * 실제 연출·상세·카메라 제어는 콘텐츠와 고유 오브젝트가 준비된 뒤 여기서 구현한다.
 */
export function AboutIntroScene({ phase }: StationDetailProps) {
  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return

    // TODO(임시): 지연 대신 실제 진입·종료 애니메이션을 재생하고, 끝났을 때 통지할 것.
    const timer = setTimeout(() => {
      const { enterComplete, exitComplete } = useStationStore.getState()
      if (phase === 'entering') enterComplete()
      else exitComplete()
    }, TEMP_ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [phase])

  return null
}
