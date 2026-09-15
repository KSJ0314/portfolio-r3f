/** 손잡이에 그리는 꺾쇠. 접혀 있으면 오른쪽(펼침), 펼쳐져 있으면 왼쪽(접힘)을 가리킨다. */
export function HandleIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={open ? 'scale(-1,1) translate(-24,0)' : undefined}
      />
    </svg>
  )
}
