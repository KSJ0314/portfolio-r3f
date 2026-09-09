import { EXTRA_SKILLS } from '../../../content/extraSkills'
import type { SkillDoc, SkillRow } from './ResumeSkill.types'

/**
 * 이름만 담은 묶음을 다른 줄로 보내는 대응표.
 *
 * 포트폴리오는 묶음을 성격별로 잘게 나눠 보여주지만, 이력서는 한 장짜리 문서라 줄을 그만큼 둘 수 없다.
 * 여기 없는 묶음은 자기 이름 그대로 한 줄이 되고, 이름이 이미 있는 줄과 같으면 그 줄에 합쳐진다.
 */
const GROUP_MERGE: Record<string, string> = {
  Auth: 'Backend',
  Realtime: 'Backend',
}

/**
 * 문서들을 분류 한 줄씩으로 모은다.
 *
 * 기술 하나가 문서 하나인 것과 이름만 묶어 담은 문서가 섞여 있어, 그리기 전에 한 형태로 맞춘다.
 * 줄 순서와 줄 안 이름 순서는 `order`가 정한다 — 분류 목록을 따로 두면 분류가 늘 때마다 코드를 고쳐야 한다.
 *
 * Firestore를 다 담은 뒤 `EXTRA_SKILLS`를 뒤에 붙인다. 이력서에만 싣는 것이라 그쪽이 나중이다.
 */
export function toSkillRows(docs: SkillDoc[]): SkillRow[] {
  const rows: SkillRow[] = []
  const byLabel = new Map<string, SkillRow>()

  /** 그 이름의 줄에 기술을 더한다. 줄이 없으면 새로 만들어 순서 끝에 붙인다. */
  const push = (label: string, names: string[]) => {
    const row = byLabel.get(label)
    if (row) {
      row.names.push(...names)
      return
    }
    const created: SkillRow = { label, names: [...names] }
    byLabel.set(label, created)
    rows.push(created)
  }

  const visible = docs.filter((doc) => doc.active !== false).sort((a, b) => a.order - b.order)

  for (const doc of visible) {
    // 이름만 담은 문서는 묶음마다 한 줄이 되고, 대응표에 있으면 그쪽 줄로 간다.
    if (doc.groups) {
      for (const group of doc.groups) push(GROUP_MERGE[group.label] ?? group.label, group.names)
      continue
    }
    push(doc.category, [doc.name])
  }

  for (const [label, names] of Object.entries(EXTRA_SKILLS)) push(label, names)

  return rows
}
