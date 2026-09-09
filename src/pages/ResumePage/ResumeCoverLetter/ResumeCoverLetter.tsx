import { CoverLetter } from './ResumeCoverLetter.styled'
import type { ResumeCoverLetterProps } from './ResumeCoverLetter.types'

/**
 * 지원하는 곳에 맞춰 쓴 자기소개.
 *
 * 다른 영역과 달리 칸을 나누지 않은 통글이라 기간/내용 틀을 쓰지 않는다.
 * 글은 Firestore `resume` 컬렉션에 있고 주소 뒷자리가 그 문서 id다.
 */
export function ResumeCoverLetter({ text }: ResumeCoverLetterProps) {
  // 콘솔에서 넣은 줄바꿈이 `\n` 두 글자로 담겨 있어 실제 개행으로 바꿔야 줄이 나뉜다.
  return <CoverLetter>{text.replace(/\\n/g, '\n')}</CoverLetter>
}
