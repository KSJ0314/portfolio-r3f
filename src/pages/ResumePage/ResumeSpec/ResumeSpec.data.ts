import type { SpecDoc } from './ResumeSpec.types'

/**
 * 자격증을 최신순으로 세운다. 전부 "YYYY-MM" 같은 자리수라 사전 역순이 곧 시간 역순이다.
 * `spec`에는 `order`가 없어 순서를 여기서 정한다.
 */
export function sortSpecs(docs: SpecDoc[]): SpecDoc[] {
  return [...docs].sort((a, b) => {
    if (a.date === b.date) return 0
    return a.date < b.date ? 1 : -1
  })
}
