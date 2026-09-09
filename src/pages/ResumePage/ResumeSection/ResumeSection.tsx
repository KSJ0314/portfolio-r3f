import { Section, SectionBody, SectionTitle } from './ResumeSection.styled'
import type { ResumeSectionProps } from './ResumeSection.types'

/**
 * 이력서의 한 영역 — 제목과 그 아래 항목들.
 *
 * 제목을 주지 않으면 본문만 그린다. 항목마다 장을 넘길 수 있는 영역에서
 * 둘째 항목부터가 앞 블록에서 이어지는 몫이라 제목이 없다.
 */
export function ResumeSection({ title, children }: ResumeSectionProps) {
  if (!title) return <SectionBody>{children}</SectionBody>

  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <SectionBody>{children}</SectionBody>
    </Section>
  )
}
