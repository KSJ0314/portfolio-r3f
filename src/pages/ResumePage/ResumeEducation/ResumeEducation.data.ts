import type { EducationDoc } from './ResumeEducation.types'

/** Firestore에는 줄바꿈이 `\n` 두 글자로 들어 있다. 실제 개행으로 바꿔야 줄이 나뉜다. */
export const withLineBreaks = (text: string) => text.replace(/\\n/g, '\n')

/**
 * 교육을 최신순으로 세운다. 전부 "YYYY-MM" 같은 자리수라 사전 역순이 곧 시간 역순이다.
 * `education`에는 `order`가 없어 순서를 여기서 정한다.
 */
export function sortEducation(docs: EducationDoc[]): EducationDoc[] {
  return [...docs].sort((a, b) => {
    if (a.startDate === b.startDate) return 0
    return a.startDate < b.startDate ? 1 : -1
  })
}
