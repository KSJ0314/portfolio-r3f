import { PrintUrl } from './ResumePrintUrl.styled'

/**
 * 인쇄물 첫 장에 싣는 이 이력서의 주소.
 *
 * PDF에서 눌러 열 수 있도록 이미지가 아니라 링크로 둔다.
 * 주소는 지금 보고 있는 화면에서 읽는다 — 회사마다 뒷자리가 다르고, 상수로 고정하면 프리뷰에서 어긋난다.
 */
export function ResumePrintUrl() {
  const href = window.location.href

  return (
    <PrintUrl href={href} aria-hidden>
      {/* 종이로 출력하는 경우도 있어 주소를 그대로 보인다. 프로토콜은 읽는 데 필요하지 않아 뗀다. */}
      {href.replace(/^https?:\/\//, '')}
    </PrintUrl>
  )
}
