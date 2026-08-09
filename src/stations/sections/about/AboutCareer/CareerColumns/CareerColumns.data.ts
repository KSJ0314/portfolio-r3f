import type { AwardDoc, CareerEntryData, EducationDoc, SpecDoc } from './CareerColumns.types'

/** 끝나지 않은 기간의 종료 자리에 대신 쓰는 말. */
const ONGOING = '현재'

/** Firestore에는 줄바꿈이 `\n` 두 글자로 들어 있다. 실제 개행으로 바꿔야 3D 텍스트가 줄을 나눈다. */
const withLineBreaks = (text: string) => text.replace(/\\n/g, '\n')

/** "YYYY-MM" → "YYYY.MM". */
function formatMonth(value: string): string {
  return value.replace('-', '.')
}

/** 시작과 종료를 물결로 잇는다. 종료가 없으면 진행 중이다. */
function formatPeriod(startDate: string, endDate: string | null): string {
  return `${formatMonth(startDate)} ~ ${endDate ? formatMonth(endDate) : ONGOING}`
}

/** 최신순 비교. 전부 "YYYY-MM" 같은 자리수라 사전 역순이 곧 시간 역순이다. */
function byLatest(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? 1 : -1
}

/** 교육 — 제목은 과정명, 아래 한 줄에 기간과 기관명. */
export function toEducationEntries(docs: EducationDoc[]): CareerEntryData[] {
  return [...docs]
    .sort((a, b) => byLatest(a.startDate, b.startDate))
    .map((doc) => ({
      id: `education:${doc.id}`,
      title: withLineBreaks(doc.program),
      meta: { left: formatPeriod(doc.startDate, doc.endDate), right: doc.institution },
    }))
}

/** 수상 — 제목 아래 설명 줄, 맨 아래 시기와 수여 기관. */
export function toAwardEntries(docs: AwardDoc[]): CareerEntryData[] {
  return [...docs]
    .sort((a, b) => byLatest(a.date, b.date))
    .map((doc) => ({
      id: `awards:${doc.id}`,
      title: withLineBreaks(doc.title),
      body: doc.description.map(withLineBreaks),
      meta: { left: formatMonth(doc.date), right: doc.organization },
    }))
}

/** 자격증 — 제목은 자격증명, 아래 한 줄에 취득일과 발행처. */
export function toSpecEntries(docs: SpecDoc[]): CareerEntryData[] {
  return [...docs]
    .sort((a, b) => byLatest(a.date, b.date))
    .map((doc) => ({
      id: `spec:${doc.id}`,
      title: withLineBreaks(doc.name),
      meta: { left: formatMonth(doc.date), right: doc.organization },
    }))
}
