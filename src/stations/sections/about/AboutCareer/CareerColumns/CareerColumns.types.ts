import type { DocBase } from '../../../../../lib/firebase'

/** Firestore `education` 문서 — 교육 과정. */
export interface EducationDoc extends DocBase {
  institution: string
  program: string
  startDate: string
  endDate: string | null
}

/** Firestore `awards` 문서 — 수상 내역. */
export interface AwardDoc extends DocBase {
  title: string
  organization: string
  description: string[]
  date: string
}

/** Firestore `spec` 문서 — 자격증. */
export interface SpecDoc extends DocBase {
  name: string
  organization: string
  date: string
}

/** 항목 맨 아래 좌/우 한 줄. 오른쪽 값은 칸 오른쪽 끝에 붙는다. */
export interface CareerEntryMeta {
  left: string
  right?: string
}

/**
 * 칸에 늘어놓는 항목 하나.
 * 컬렉션마다 필드가 다르므로 그리기 전에 이 한 형태로 맞춘다.
 */
export interface CareerEntryData {
  /** 컬렉션 접두를 붙인 키. 세 컬렉션을 한 맵에 모아 다루므로 문서 id만으로는 부족하다. */
  id: string
  /** 항목 제목. */
  title: string
  /** 제목 아래 본문 줄. 폭에 따라 접히므로 높이를 재야 한다. */
  body?: string[]
  /** 맨 아래 좌/우 한 줄. */
  meta?: CareerEntryMeta
}
