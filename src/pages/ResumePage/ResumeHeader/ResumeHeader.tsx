import { CONTACT_ICON, PHOTO_URL } from './ResumeHeader.constants'
import {
  ContactItem,
  ContactList,
  Header,
  HeaderIntro,
  HeaderText,
  Intro,
  Photo,
  Tagline,
} from './ResumeHeader.styled'
import type { ResumeHeaderProps } from './ResumeHeader.types'

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

/** 이력서 머리 — 사진과 한 줄 소개·소개글·연락처. 첫 장 맨 위에 온다. */
export function ResumeHeader({ profile }: ResumeHeaderProps) {
  return (
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
  )
}
