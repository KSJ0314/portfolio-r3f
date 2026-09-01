import { useCallback, useSyncExternalStore } from 'react'

/** 미디어 질의 결과를 구독한다. 기기를 돌리거나 조작 수단이 바뀌면 그 자리에서 반영된다. */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/**
 * 주 입력 수단이 손가락인지.
 *
 * 화면 크기가 아니라 **조작 수단**으로 가른다. 이 사이트가 모바일에서 막히는 원인은 좁은 화면이
 * 아니라 우클릭 홀드가 없다는 것이라, 창을 좁힌 PC는 여기 들지 않는다.
 *
 * `any-hover`는 함께 보지 않는다. `any-*` 계열은 붙일 수 있는 입력 수단까지 세어, 실제 폰에서도
 * `hover`로 답하는 경우가 있다. 스타일 쪽 미디어쿼리와도 이 질의 하나로 기준이 같아진다.
 */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)')
}

/** 세로로 들고 있는지. */
export function usePortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}
