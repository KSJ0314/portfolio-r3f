import { Fragment, useMemo, useRef, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { getCoverLetter } from '../../content/coverLetters'
import { useDoc } from '../../lib/firebase/hooks'
import { CONTACT_ICON, PHOTO_URL } from './ResumePage.constants'
import { usePagination } from './ResumePage.hooks'
import {
  Block,
  ContactItem,
  ContactList,
  CoverLetter,
  Entry,
  Header,
  HeaderIntro,
  HeaderText,
  Intro,
  MeasureSheet,
  Page,
  Photo,
  Section,
  SectionBody,
  SectionTitle,
  Sheet,
  SkillRow,
  Tagline,
  TextSlot,
} from './ResumePage.styled'
import type { ResumeProfileDoc } from './ResumePage.types'

/**
 * 페이지를 나누는 단위. 머리와 영역 하나가 각각 블록 하나다.
 * `tight`는 앞 블록과 같은 영역에서 이어지는 항목이라 좁게 붙는다는 뜻이다.
 */
interface ResumeBlock {
  key: string
  tight?: boolean
  node: ReactNode
}

/** 한 줄 소개 안의 이름만 굵게 낸다. 이름이 없으면 문장을 그대로 둔다. */
function highlightName(tagline: string, name: string | undefined) {
  if (!name) return tagline
  const at = tagline.indexOf(name)
  if (at < 0) return tagline
  return (
    <>
      {tagline.slice(0, at)}
      <strong>{name}</strong>
      {tagline.slice(at + name.length)}
    </>
  )
}

/**
 * 이력서 페이지(`/resume`) — 3D 없이 읽는 순수 문서 화면.
 *
 * 포트폴리오(`/portfolio`)와 주소를 나눠 제출하므로 서로의 코드를 참조하지 않는다.
 * 내용은 항목 단위 블록으로 두고, 한 장에 들어가는 만큼씩 담아 A4 비율의 장을 쌓는다.
 * 장을 넘길 항목은 쪼개지 않고 다음 장에서 시작한다.
 *
 * 주소 뒷자리(`/resume/<키>`)가 자기소개를 고른다. 등록된 글이 없으면 그 영역을 두지 않는다.
 */
export function ResumePage() {
  const { data: profile } = useDoc<ResumeProfileDoc>('profile', 'main')
  const { company } = useParams()
  const coverLetter = getCoverLetter(company)

  const blocks = useMemo<ResumeBlock[]>(() => {
    const list: ResumeBlock[] = [
      {
        key: 'header',
        node: (
          <Header>
            <Photo src={PHOTO_URL} alt="" />
            <HeaderText>
              <HeaderIntro>
                <Tagline>{highlightName(profile?.tagline ?? '', profile?.name)}</Tagline>
                {/* 줄바꿈이 `\n` 두 글자로 담겨 있어 실제 개행으로 바꾼다. */}
                <Intro>{profile?.intro?.replace(/\\n/g, '\n')}</Intro>
              </HeaderIntro>
              <ContactList>
                {profile?.phone && (
                  <ContactItem>
                    <img src={CONTACT_ICON.phone} alt="" />
                    <span>{profile.phone}</span>
                  </ContactItem>
                )}
                {profile?.email && (
                  <ContactItem>
                    <img src={CONTACT_ICON.email} alt="" />
                    <span>{profile.email}</span>
                  </ContactItem>
                )}
                {/* 링크는 개수가 정해져 있지 않아 문서에 담긴 만큼 늘어놓는다. */}
                {profile?.links?.map(({ url }) => (
                  <ContactItem key={url}>
                    <img src={CONTACT_ICON.link} alt="" />
                    <span>{url}</span>
                  </ContactItem>
                ))}
              </ContactList>
            </HeaderText>
          </Header>
        ),
      },
    ]

    /** 영역 하나가 블록 하나다. 한 장을 넘기면 영역을 쪼개지 않고 통째로 다음 장에서 그린다. */
    const pushSection = (title: string, items: ReactNode[]) => {
      list.push({
        key: title,
        node: (
          <Section>
            <SectionTitle>{title}</SectionTitle>
            <SectionBody>
              {items.map((item, index) => (
                <Fragment key={index}>{item}</Fragment>
              ))}
            </SectionBody>
          </Section>
        ),
      })
    }

    /**
     * 항목마다 블록을 두는 영역. 한 항목이 커서 영역 전체가 한 장을 넘기는 곳에 쓴다.
     * 제목은 첫 항목과 한 블록에 담아 제목만 장 끝에 남지 않게 한다.
     */
    const pushSplitSection = (title: string, items: ReactNode[]) => {
      const [first, ...rest] = items
      list.push({
        key: `${title}:0`,
        node: (
          <Section>
            <SectionTitle>{title}</SectionTitle>
            <SectionBody>{first}</SectionBody>
          </Section>
        ),
      })
      rest.forEach((item, index) => {
        list.push({ key: `${title}:${index + 1}`, tight: true, node: <SectionBody>{item}</SectionBody> })
      })
    }

    // 지원하는 곳에 맞춰 쓴 글이라, 그 글이 없으면 제목까지 두지 않는다.
    if (coverLetter) pushSection('자기소개', [<CoverLetter>{coverLetter}</CoverLetter>])

    pushSection('경력', [<Entry />])
    pushSection('기술', [
      <SkillRow>
        <TextSlot $w={80} $h={14} />
        <Entry />
      </SkillRow>,
      <SkillRow>
        <TextSlot $w={80} $h={14} />
        <Entry />
      </SkillRow>,
      <SkillRow>
        <TextSlot $w={80} $h={14} />
        <Entry />
      </SkillRow>,
      <SkillRow>
        <TextSlot $w={80} $h={14} />
        <Entry />
      </SkillRow>,
    ])
    pushSection('교육', [<Entry />, <Entry />])
    pushSection('수상', [<Entry />, <Entry />, <Entry />])
    pushSection('자격증', [<Entry />, <Entry />, <Entry />, <Entry />])
    // 프로젝트는 항목마다 담을 내용이 많아 영역 전체가 한 장을 넘긴다.
    pushSplitSection('프로젝트', [<Entry />, <Entry />, <Entry />, <Entry />])

    return list
  }, [profile, coverLetter])

  const measureRef = useRef<HTMLDivElement>(null)
  const pages = usePagination(measureRef)

  return (
    <Page>
      {/* 높이를 재는 자리. 실제 장과 같은 폭·여백이라 여기서 잰 높이가 그대로 쓰인다. */}
      <MeasureSheet ref={measureRef} aria-hidden>
        {blocks.map(({ key, tight, node }) => (
          <Block key={key} $tight={tight} data-block>
            {node}
          </Block>
        ))}
      </MeasureSheet>

      {pages.map((indexes, page) => (
        <Sheet key={page}>
          {indexes.map((index) => {
            const { key, tight, node } = blocks[index]
            return (
              <Block key={key} $tight={tight}>
                {node}
              </Block>
            )
          })}
        </Sheet>
      ))}
    </Page>
  )
}
