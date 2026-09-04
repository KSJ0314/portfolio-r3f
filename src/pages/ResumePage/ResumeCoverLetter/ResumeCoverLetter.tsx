import { CoverLetter } from './ResumeCoverLetter.styled'
import type { ResumeCoverLetterProps } from './ResumeCoverLetter.types'

/**
 * 지원하는 곳에 맞춰 쓴 자기소개.
 *
 * 다른 영역과 달리 칸을 나누지 않은 통글이라 기간/내용 틀을 쓰지 않는다.
 * 글은 Firestore가 아니라 `content/coverLetters`에 있다.
 */
export function ResumeCoverLetter({ text }: ResumeCoverLetterProps) {
  return <CoverLetter>{text}</CoverLetter>
}
