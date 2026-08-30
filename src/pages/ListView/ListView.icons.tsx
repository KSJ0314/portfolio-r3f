/** 내려받기 — 아래를 가리키는 화살표와 받침. */
export function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v11m0 0 4-4m-4 4-4-4M4 19h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 목록 보기 — 줄 세 개. */
export function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 좌우 넘김 꺾쇠. `direction`이 -1이면 왼쪽이다. */
export function ChevronIcon({ direction }: { direction: 1 | -1 }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={direction === -1 ? 'scale(-1,1) translate(-24,0)' : undefined}
      />
    </svg>
  )
}
