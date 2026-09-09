import { useCallback, useEffect, useRef } from 'react'
import { DownloadIcon } from '../../../ui/DownloadIcon'
import { RESUME_FILE_NAME } from './ResumeDownload.constants'
import { useScrollbarWidth } from './ResumeDownload.hooks'
import { DownloadButton } from './ResumeDownload.styled'
import type { ResumeDownloadProps } from './ResumeDownload.types'

/**
 * 이력서를 PDF로 받는 우측 하단 버튼.
 *
 * 그림으로 굽지 않고 **브라우저 인쇄를 부른다** — 장이 이미 A4 실치수로 짜여 있고,
 * 글이 글로 남아야 읽는 쪽에서 검색·복사할 수 있으며 링크도 눌린다.
 * 방문자는 인쇄 대화상자에서 대상을 "PDF로 저장"으로 고른다.
 */
export function ResumeDownload({ scrollHost }: ResumeDownloadProps) {
  // 되돌릴 제목. 인쇄가 끝나거나 화면을 떠날 때 이 값으로 돌아간다.
  const previousTitle = useRef<string | null>(null)
  // 우측 여백이 하단과 같아 보이도록, 끼어 있는 스크롤바 폭만큼 안쪽으로 민다.
  const scrollbarWidth = useScrollbarWidth(scrollHost)

  const restoreTitle = useCallback(() => {
    if (previousTitle.current === null) return
    document.title = previousTitle.current
    previousTitle.current = null
  }, [])

  useEffect(() => {
    window.addEventListener('afterprint', restoreTitle)
    // 인쇄 대화상자를 열어 둔 채 화면을 떠나면 되돌릴 기회가 없어, 언마운트에서도 되돌린다.
    return () => {
      window.removeEventListener('afterprint', restoreTitle)
      restoreTitle()
    }
  }, [restoreTitle])

  const print = () => {
    // 브라우저가 제안하는 파일명이 문서 제목이라, 부르기 직전에만 바꾼다. 탭 제목은 평소 그대로 둔다.
    previousTitle.current = document.title
    document.title = RESUME_FILE_NAME
    window.print()
  }

  return (
    <DownloadButton
      type="button"
      $slot={0}
      $inset={scrollbarWidth}
      onClick={print}
      title="PDF로 저장"
      aria-label="이력서를 PDF로 저장"
    >
      <DownloadIcon />
    </DownloadButton>
  )
}
