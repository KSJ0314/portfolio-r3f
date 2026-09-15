/**
 * 연락처 줄 앞에 붙는 아이콘.
 *
 * `public/images/phone.svg`·`mail.svg`와 같은 그림이지만 색을 `currentColor`로 둔다.
 * 그 파일들은 씬 안에서 텍스처로 쓰려고 색을 잉크색으로 고정해 두어 테마를 따르지 못한다.
 */
export function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M10.5 5.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="18.5" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m3.5 7 8.5 6.5L20.5 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
