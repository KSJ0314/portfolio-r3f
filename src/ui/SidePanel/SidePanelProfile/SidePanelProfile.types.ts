import type { DocBase } from '../../../lib/firebase'

export interface SidePanelProfileProps {
  /** 카드를 누르면 Intro 화면으로 데려간다. 어디에 있는지는 패널이 알므로 판단은 그쪽이 한다. */
  onOpen: () => void
}

/** 사이드바가 쓰는 profile 필드. 화면마다 쓰는 것이 달라 타입을 나눠 둔다. */
export interface SidePanelProfileDoc extends DocBase {
  tagline?: string
  phone?: string
  email?: string
  links?: { label: string; url: string }[]
}

/** 연락처 한 줄. `copy`가 있으면 복사하고 `open`이 있으면 새 탭으로 연다. */
export interface ContactLine {
  key: string
  icon: 'phone' | 'mail' | 'github'
  text: string
  copy?: string
  open?: string
}
