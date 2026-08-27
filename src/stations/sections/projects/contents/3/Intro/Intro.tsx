import type { ProjectPageProps } from '../../contents.types'
import { IntroPage } from '../../shared/IntroPage'
import { INTRO_ICONS, INTRO_LINKS, INTRO_TEXT } from './Intro.constants'

/** 첫 장. 배치는 공용 부품이 맡고 여기서는 글과 링크만 넘긴다. */
export function Intro({ height }: ProjectPageProps) {
  return (
    <IntroPage
      height={height}
      title={INTRO_TEXT.title}
      period={INTRO_TEXT.period}
      tagline={INTRO_TEXT.tagline}
      summary={INTRO_TEXT.summary}
      achievements={INTRO_TEXT.achievements}
      links={[
        { icon: INTRO_ICONS.github, url: INTRO_LINKS.github },
        { icon: INTRO_ICONS.notion, url: INTRO_LINKS.notion },
      ].filter((link) => link.url !== '')}
    />
  )
}
