import type { DocBase } from '../../../lib/firebase'

/** `resume` 컬렉션의 문서. id가 곧 주소 뒷자리다. */
export interface CoverLetterDoc extends DocBase {
  /** 자기소개 본문. 줄바꿈이 그대로 화면에 반영되고 문단 사이는 빈 줄로 띄운다. */
  content: string
}

export interface ResumeCoverLetterProps {
  text: string
}
