import { useState } from 'react'
import { CornerButton } from '../CornerButton'
import { CreditsModal } from './CreditsModal'

/**
 * 크리에이티브 커먼즈 로고 — 원 안에 c 두 개.
 * 유니코드 문자(U+1F16D)는 폰트 지원이 나빠 두부 글자로 뜨는 곳이 많아 직접 그린다.
 */
function CreativeCommonsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10.27 10.01A2.6 2.6 0 1 0 10.27 13.99"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.07 10.01A2.6 2.6 0 1 0 17.07 13.99"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 에셋의 출처를 밝히는 자리.
 *
 * CC-BY는 **방문자가 볼 수 있는 곳에** 출처를 적도록 요구하므로 화면에 둔다.
 * 버튼은 크레파스 버튼 왼쪽에 나란히 서고, 스테이션이 열려 있는 동안에는 App이 걷는다.
 */
export function Credits() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <CornerButton
        type="button"
        $slot={1}
        onClick={() => setOpen(true)}
        title="에셋 출처"
        aria-label="에셋 출처 열기"
      >
        <CreativeCommonsIcon />
      </CornerButton>
      {open && <CreditsModal onClose={() => setOpen(false)} />}
    </>
  )
}
