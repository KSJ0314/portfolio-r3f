import { type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useDoc } from '../../../lib/firebase'
import { GithubIcon } from '../../GithubButton/GithubButton.icons'
import {
  COPIED_MS,
  COPIED_TEXT,
  GITHUB_HOST,
  PROFILE_PHOTO_URL,
} from './SidePanelProfile.constants'
import { MailIcon, PhoneIcon } from './SidePanelProfile.icons'
import {
  Contact,
  ContactIcon,
  ContactLabel,
  Contacts,
  Head,
  Photo,
  Row,
  Tagline,
} from './SidePanelProfile.styled'
import type {
  ContactLine,
  SidePanelProfileDoc,
  SidePanelProfileProps,
} from './SidePanelProfile.types'

const ICONS = {
  phone: PhoneIcon,
  mail: MailIcon,
  github: GithubIcon,
}

/**
 * 사이드바 머리 — 둥근 프로필 사진과 연락처.
 *
 * 3D를 거치지 않고도 연락처를 찾을 수 있게 어느 화면에서나 같은 자리에 둔다.
 * 줄을 고르는 규칙은 Intro 연락처와 같다 — 전화·메일은 복사하고, `links`에서 깃허브 주소 하나를 골라 연다.
 *
 * **카드 자체가 Intro 화면으로 가는 버튼이다.** 안의 연락처 줄은 제 동작만 하고 이동하지 않는다.
 */
export function SidePanelProfile({ onOpen }: SidePanelProfileProps) {
  const { data: profile } = useDoc<SidePanelProfileDoc>('profile', 'main')
  const [copied, setCopied] = useState<string | null>(null)

  // 알림은 상태에 묶어 둔다. 다시 누르면 새 상태라 시간도 다시 시작한다.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const lines = useMemo<ContactLine[]>(() => {
    const list: ContactLine[] = []
    if (profile?.phone) {
      list.push({ key: 'phone', icon: 'phone', text: profile.phone, copy: profile.phone })
    }
    if (profile?.email) {
      list.push({ key: 'mail', icon: 'mail', text: profile.email, copy: profile.email })
    }
    const github = profile?.links?.find((link) => link.url.includes(GITHUB_HOST))
    if (github) {
      list.push({
        key: 'github',
        icon: 'github',
        // 표시는 스킴을 떼고, 열 때는 원래 주소를 쓴다.
        text: github.url.replace(/^https?:\/\//, ''),
        open: github.url,
      })
    }
    return list
  }, [profile])

  const press = useCallback((line: ContactLine, e: MouseEvent<HTMLButtonElement>) => {
    // 카드 전체가 Intro로 가는 버튼이라, 막지 않으면 복사하면서 화면까지 옮겨 간다.
    e.stopPropagation()
    if (line.open) {
      window.open(line.open, '_blank', 'noopener,noreferrer')
      return
    }
    if (!line.copy) return
    navigator.clipboard
      ?.writeText(line.copy)
      .then(() => setCopied(line.key))
      .catch(() => {
        // 클립보드가 막힌 환경이다. 복사되지 않았으므로 알리지 않는다.
      })
  }, [])

  return (
    <Head type="button" onClick={onOpen} aria-label="소개 화면으로 가기">
      {profile?.tagline && <Tagline>{profile.tagline}</Tagline>}

      <Row>
        <Contacts>
          {lines.map((line) => {
            const Icon = ICONS[line.icon]
            return (
              <li key={line.key}>
                <Contact
                  type="button"
                  onClick={(e) => press(line, e)}
                  aria-label={line.open ? `${line.text} 열기` : `${line.text} 복사`}
                >
                  <ContactIcon>
                    <Icon />
                  </ContactIcon>
                  <ContactLabel>{copied === line.key ? COPIED_TEXT : line.text}</ContactLabel>
                </Contact>
              </li>
            )
          })}
        </Contacts>

        <Photo src={PROFILE_PHOTO_URL} alt="" />
      </Row>
    </Head>
  )
}
