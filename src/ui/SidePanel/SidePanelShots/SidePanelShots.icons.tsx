/** 좌우 넘김 꺾쇠. `direction`이 -1이면 왼쪽이다. */
export function ChevronIcon({ direction }: { direction: 1 | -1 }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
