import type { DocBase } from '../../../../../lib/firebase'

/** 이름만 나열하는 페이지의 묶음. 제목 아래에 이름을 늘어놓는다. */
export interface SkillGroup {
  label: string
  names: string[]
}

/** Firestore `skills` 문서. `level`은 화면에 쓰지 않지만 스키마에는 있다. */
export interface SkillDoc extends DocBase {
  name: string
  category: string
  order: number
  level: number
  description: string[]
  /** 이름만 나열하는 문서가 담는 묶음. 이 값이 있으면 `name` 대신 이것을 펼친다. */
  groups?: SkillGroup[]
  /** 화면에 낼지. 없으면 낸다 — 문서를 추가하며 빠뜨려도 조용히 사라지지 않게. */
  active?: boolean
}

/**
 * 한 페이지의 열 구성 — 열마다 담을 분류를 적는다.
 * 열을 하나만 주면 그 분류의 기술을 개수로 반 나눠 두 열에 늘어놓는다.
 */
export interface SkillPage {
  columns: readonly (readonly string[])[]
  /** 이름만 나열하는 페이지인지. 설명과 숙련도를 그리지 않고 `groups`를 펼친다. */
  plain?: boolean
}

/** 목록이 받는 것. 둘 다 주지 않으면 스스로 페이지를 넘기는 평소 모습이다. */
export interface SkillsPagesProps {
  /** 그릴 쪽(0부터). 주면 그 쪽에 고정된다. */
  page?: number
  /** 페이지 넘김을 둘지. 조작 요소라 읽기만 하는 화면에서는 끈다. */
  showPager?: boolean
}
