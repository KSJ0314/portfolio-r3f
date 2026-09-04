import { Fragment, useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { getCoverLetter } from '../../content/coverLetters'
import { useCollection, useDoc } from '../../lib/firebase/hooks'
import { ResumeAward, sortAwards, type AwardDoc } from './ResumeAward'
import { ResumeCoverLetter } from './ResumeCoverLetter'
import { ResumeDivider } from './ResumeDivider'
import { ResumeEducation, sortEducation, type EducationDoc } from './ResumeEducation'
import { ResumeExperience, sortExperiences, type ExperienceDoc } from './ResumeExperience'
import { ResumeHeader, type ResumeProfileDoc } from './ResumeHeader'
import { ResumeEntryPlaceholder } from './ResumePlaceholder'
import { ResumeSection } from './ResumeSection'
import { ResumeSkill, toSkillRows, type SkillDoc } from './ResumeSkill'
import { ResumeSpec, sortSpecs, type SpecDoc } from './ResumeSpec'
import { ResumeSheets, type ResumeBlock } from './ResumeSheets'
import { Page } from './ResumePage.styled'

/**
 * 이력서 페이지(`/resume`) — 3D 없이 읽는 순수 문서 화면.
 *
 * 포트폴리오(`/portfolio`)와 주소를 나눠 제출하므로 서로의 코드를 참조하지 않는다.
 * 이 컴포넌트는 데이터를 읽어 블록 목록을 조립하는 데까지만 맡고,
 * 장을 나눠 쌓는 일은 `ResumeSheets`가, 각 영역을 그리는 일은 전용 컴포넌트가 한다.
 *
 * 주소 뒷자리(`/resume/<키>`)가 자기소개를 고른다. 등록된 글이 없으면 그 영역을 두지 않는다.
 */
export function ResumePage() {
  const { data: profile } = useDoc<ResumeProfileDoc>('profile', 'main')
  const { data: experienceDocs } = useCollection<ExperienceDoc>('experiences')
  const experiences = useMemo(() => sortExperiences(experienceDocs), [experienceDocs])
  const { data: educationDocs } = useCollection<EducationDoc>('education')
  const education = useMemo(() => sortEducation(educationDocs), [educationDocs])
  const { data: awardDocs } = useCollection<AwardDoc>('awards')
  const awards = useMemo(() => sortAwards(awardDocs), [awardDocs])
  const { data: skillDocs } = useCollection<SkillDoc>('skills')
  const skills = useMemo(() => toSkillRows(skillDocs), [skillDocs])
  const { data: specDocs } = useCollection<SpecDoc>('spec')
  const specs = useMemo(() => sortSpecs(specDocs), [specDocs])
  const { company } = useParams()
  const coverLetter = getCoverLetter(company)

  const blocks = useMemo<ResumeBlock[]>(() => {
    const list: ResumeBlock[] = [{ key: 'header', node: <ResumeHeader profile={profile} /> }]

    /** 영역 하나가 블록 하나다. 한 장을 넘기면 영역을 쪼개지 않고 통째로 다음 장에서 그린다. */
    const pushSection = (title: string, items: ReactNode[]) => {
      list.push({
        key: title,
        node: (
          <ResumeSection title={title}>
            {items.map((item, index) => (
              // 항목이 여럿이면 사이에 선을 그어 경계를 보인다.
              <Fragment key={index}>
                {index > 0 && <ResumeDivider />}
                {item}
              </Fragment>
            ))}
          </ResumeSection>
        ),
      })
    }

    /**
     * 항목마다 블록을 두는 영역. 한 항목이 커서 영역 전체가 한 장을 넘기는 곳에 쓴다.
     * 제목은 첫 항목과 한 블록에 담아 제목만 장 끝에 남지 않게 한다.
     */
    const pushSplitSection = (title: string, items: ReactNode[]) => {
      const [first, ...rest] = items
      list.push({ key: `${title}:0`, node: <ResumeSection title={title}>{first}</ResumeSection> })
      rest.forEach((item, index) => {
        list.push({
          key: `${title}:${index + 1}`,
          tight: true,
          node: <ResumeSection>{item}</ResumeSection>,
        })
      })
    }

    // 지원하는 곳에 맞춰 쓴 글이라, 그 글이 없으면 제목까지 두지 않는다.
    if (coverLetter) pushSection('자기소개', [<ResumeCoverLetter text={coverLetter} />])

    // 읽어 온 문서가 없으면 제목만 남지 않도록 영역을 두지 않는다(자기소개와 같은 규칙).
    if (experiences.length > 0) {
      pushSection(
        '경력',
        experiences.map((doc) => <ResumeExperience doc={doc} />),
      )
    }

    if (education.length > 0) {
      pushSection(
        '교육',
        education.map((doc) => <ResumeEducation doc={doc} />),
      )
    }

    if (awards.length > 0) {
      pushSection(
        '수상',
        awards.map((doc) => <ResumeAward doc={doc} />),
      )
    }

    if (skills.length > 0) {
      pushSection(
        '기술',
        skills.map((row) => <ResumeSkill row={row} />),
      )
    }

    if (specs.length > 0) {
      pushSection(
        '자격증',
        specs.map((doc) => <ResumeSpec doc={doc} />),
      )
    }

    // 프로젝트는 항목마다 담을 내용이 많아 영역 전체가 한 장을 넘긴다.
    pushSplitSection('프로젝트', [
      <ResumeEntryPlaceholder />,
      <ResumeEntryPlaceholder />,
      <ResumeEntryPlaceholder />,
      <ResumeEntryPlaceholder />,
    ])

    return list
  }, [profile, coverLetter, experiences, education, awards, skills, specs])

  return (
    <Page>
      <ResumeSheets blocks={blocks} />
    </Page>
  )
}
