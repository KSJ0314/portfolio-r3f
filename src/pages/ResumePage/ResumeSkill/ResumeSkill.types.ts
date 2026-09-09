import type { DocBase } from '../../../lib/firebase'

/** 이름만 나열하는 문서가 담는 묶음. */
export interface SkillGroup {
  label: string
  names: string[]
}

/** Firestore `skills` 문서. 이력서는 이름만 실어 `level`·`description`은 쓰지 않는다. */
export interface SkillDoc extends DocBase {
  name: string
  category: string
  order: number
  /** 이름만 나열하는 문서가 담는 묶음. 이 값이 있으면 `name` 대신 이것을 펼친다. */
  groups?: SkillGroup[]
  /** 화면에 낼지. 없으면 낸다 — 문서를 추가하며 빠뜨려도 조용히 사라지지 않게. */
  active?: boolean
}

/** 화면에 그리는 한 줄 — 왼쪽 분류 이름과 오른쪽 기술 이름들. */
export interface SkillRow {
  label: string
  names: string[]
}

export interface ResumeSkillProps {
  row: SkillRow
}
