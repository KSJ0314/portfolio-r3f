import { useCallback, useState } from 'react'
import { Text } from '@react-three/drei'
import type { Object3D } from 'three'
import { BODY_FONT, HAND_FONT } from '../../../../../../content/fonts'
import { useGalleryPageStore } from '../../../../../../state/useGalleryPageStore'
import type { TroikaTextMesh } from '../../../../../types'
import { PageIcon } from '../PageIcon'
import { PageLink } from '../PageLink'
import { INTRO_PAGE_ICONS, INTRO_PAGE_INK, INTRO_PAGE_SUB_INK } from './IntroPage.constants'
import type { IntroPageProps } from './IntroPage.types'

/** 잰 글 덩어리의 경계(그 글이 놓인 자리 기준). */
interface TextBounds {
  top: number
  bottom: number
  right: number
}

/**
 * 프로젝트 첫 장의 공용 배치 — 제목과 기간, 한 줄 소개, 요약, 성과 목록, 링크 아이콘.
 *
 * **프로젝트마다 다른 것은 글과 링크뿐이라 배치를 여기 한 벌만 둔다.** 프로젝트 폴더는 글을 넘기는
 * 껍데기이고, 간격을 고치면 세 칸에 함께 적용된다.
 *
 * **자리를 값으로 박지 않고 잰 글에서 잡는다.** 글이 몇 줄로 접힐지 미리 알 수 없고, 글자 크기를
 * 바꾸면 뒤따르는 것이 전부 어긋난다. 위아래로는 앞 글의 아래 끝에서 간격만큼 띄우고, 기간은
 * 제목의 잰 오른쪽 끝에서 띄운다(Skills 목록·Career 항목과 같은 방식).
 *
 * 제목과 기간은 크기가 달라 위를 맞추면 밑선이 어긋나므로 **베이스라인을 기준점으로 둔다.**
 * 그 기준에서는 글자가 자리 위로 올라가므로 제목을 글자 크기만큼 내려 위 여백 안에 들인다.
 *
 * 높이가 다 모이기 전에는 겹쳐 보이지만, 페이지는 확대가 도는 동안 감춰진 채 마운트되므로
 * 그 사이가 화면에 보이지 않는다.
 */
export function IntroPage({ height, content }: IntroPageProps) {
  const { title, period, tagline, summary, achievements } = content

  // 수상이 있으면 성과 첫 줄 앞에 트로피를 붙인다. 내용은 사실만 갖고 아이콘은 여기서 정한다.
  const firstIcon = content.awarded ? INTRO_PAGE_ICONS.trophy : undefined

  // 주소가 없는 링크는 두지 않는다. 오른쪽 끝에서부터 늘어놓으므로 순서가 곧 자리다.
  const links = [
    { icon: INTRO_PAGE_ICONS.github, url: content.links.github },
    { icon: INTRO_PAGE_ICONS.notion, url: content.links.notion },
  ].filter((link): link is { icon: string; url: string } => Boolean(link.url))

  const [bounds, setBounds] = useState<Record<string, TextBounds>>({})

  const measure = useCallback(
    (id: string) => (mesh: Object3D) => {
      const blockBounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
      if (!blockBounds) return
      const next = { top: blockBounds[3], bottom: blockBounds[1], right: blockBounds[2] }
      setBounds((prev) => {
        const old = prev[id]
        if (
          old &&
          Math.abs(old.top - next.top) < 1e-4 &&
          Math.abs(old.bottom - next.bottom) < 1e-4 &&
          Math.abs(old.right - next.right) < 1e-4
        )
          return prev
        return { ...prev, [id]: next }
      })
    },
    [],
  )

  // 크기·간격은 개발용 HUD로 맞춘다. 프로덕션에는 패널이 없어 늘 상수 기본값이다.
  const L = useGalleryPageStore((s) => s.introPage)
  const left = -0.5 + L.padX
  const right = 0.5 - L.padX
  const top = height / 2 - L.padY

  /** 그 글의 아래 끝. 재기 전에는 글자 크기로 어림잡는다. */
  const bottomOf = (id: string, size: number) => bounds[id]?.bottom ?? -size

  const titleY = top - L.titleSize
  const taglineY = titleY + bottomOf('title', L.titleSize) - L.titleGap
  const summaryY = taglineY + bottomOf('tagline', L.taglineSize) - L.taglineGap
  const achievementTop = summaryY + bottomOf('summary', L.summarySize) - L.summaryGap

  const summaryLeft = left + L.quoteWidth + L.quoteGap
  const summaryBounds = bounds.summary

  // 줄 앞에 점을 두고 글은 그만큼 오른쪽에서 시작한다. 첫 줄은 아이콘이 있으면 그만큼 더 밀린다.
  const bulletX = left + L.bulletRadius
  const textLeft = left + L.bulletRadius * 2 + L.bulletGap
  const firstLeft = firstIcon ? textLeft + L.trophySize + L.trophyGap : textLeft
  const firstBounds = bounds['achievement-0']
  const firstIconY =
    achievementTop +
    (firstBounds ? (firstBounds.top + firstBounds.bottom) / 2 : -L.achievementSize / 2)

  // 성과 목록. 줄마다 잰 높이로 다음 자리를 잡는다.
  const placed = achievements.reduce<{ text: string; y: number; id: string }[]>(
    (rows, text, index) => {
      const previous = rows[index - 1]
      const y = previous
        ? previous.y + bottomOf(previous.id, L.achievementSize) - L.achievementGap
        : achievementTop
      rows.push({ text, y, id: `achievement-${index}` })
      return rows
    },
    [],
  )

  return (
    <>
      <Text
        font={HAND_FONT}
        position={[left, titleY, 0.001]}
        fontSize={L.titleSize}
        anchorX="left"
        anchorY="top-baseline"
        onSync={measure('title')}
      >
        {title}
        <meshBasicMaterial color={INTRO_PAGE_INK} toneMapped={false} />
      </Text>

      {/* 기간은 제목의 잰 오른쪽 끝에서 띄운다. 제목 크기를 바꿔도 따라온다. */}
      <Text
        font={BODY_FONT}
        position={[left + (bounds.title?.right ?? L.titleSize * 2) + L.periodGap, titleY, 0.001]}
        fontSize={L.periodSize}
        anchorX="left"
        anchorY="top-baseline"
      >
        {period}
        <meshBasicMaterial color={INTRO_PAGE_SUB_INK} toneMapped={false} />
      </Text>

      <Text
        font={BODY_FONT}
        position={[left, taglineY, 0.001]}
        fontSize={L.taglineSize}
        anchorX="left"
        anchorY="top"
        onSync={measure('tagline')}
      >
        {tagline}
        <meshBasicMaterial color={INTRO_PAGE_INK} toneMapped={false} />
      </Text>

      {/*
        인용 막대. 높이만 쓰면 글 위 여백만큼 위로 떠 앞줄까지 올라간다.
        troika가 준 위·아래를 그대로 써서 글 덩어리에 맞춘다.
      */}
      {summaryBounds && (
        <mesh
          position={[
            left + L.quoteWidth / 2,
            summaryY + (summaryBounds.top + summaryBounds.bottom) / 2,
            0.001,
          ]}
        >
          <planeGeometry args={[L.quoteWidth, summaryBounds.top - summaryBounds.bottom]} />
          <meshBasicMaterial color={INTRO_PAGE_SUB_INK} toneMapped={false} />
        </mesh>
      )}

      <Text
        font={BODY_FONT}
        position={[summaryLeft, summaryY, 0.001]}
        fontSize={L.summarySize}
        lineHeight={L.summaryLineHeight}
        maxWidth={right - summaryLeft}
        anchorX="left"
        anchorY="top"
        onSync={measure('summary')}
      >
        {summary}
        <meshBasicMaterial color={INTRO_PAGE_INK} toneMapped={false} />
      </Text>

      {/* 첫 줄 앞 아이콘. 이모지가 서브셋 글꼴에 없어 글자가 아니라 그림으로 붙인다. */}
      {firstIcon && (
        <PageIcon
          icon={firstIcon}
          x={textLeft + L.trophySize / 2}
          y={firstIconY}
          size={L.trophySize}
        />
      )}

      {placed.map(({ text, y, id }, index) => {
        const itemLeft = index === 0 ? firstLeft : textLeft
        const itemBounds = bounds[id]
        const bulletY =
          y + (itemBounds ? (itemBounds.top + itemBounds.bottom) / 2 : -L.achievementSize / 2)

        return (
          <group key={id}>
            {/* 점은 글자가 아니라 원이다. 서브셋 글꼴에 없을 수 있고, 줄이 접히면 둘째 줄이 점 아래로 들어간다. */}
            <mesh position={[bulletX, bulletY, 0.001]}>
              <circleGeometry args={[L.bulletRadius, 16]} />
              <meshBasicMaterial color={INTRO_PAGE_INK} toneMapped={false} />
            </mesh>
            <Text
              font={BODY_FONT}
              position={[itemLeft, y, 0.001]}
              fontSize={L.achievementSize}
              maxWidth={right - itemLeft}
              anchorX="left"
              anchorY="top"
              onSync={measure(id)}
            >
              {text}
              <meshBasicMaterial color={INTRO_PAGE_INK} toneMapped={false} />
            </Text>
          </group>
        )
      })}

      {/* 링크는 오른쪽 끝에서부터 왼쪽으로 늘어놓는다. 개수가 달라도 오른쪽 끝이 맞는다. */}
      {links.map(({ icon, url }, index) => (
        <PageLink
          key={url}
          icon={icon}
          url={url}
          x={right - L.iconSize / 2 - (links.length - 1 - index) * L.iconGap}
          y={top - L.iconSize / 2}
          size={L.iconSize}
        />
      ))}
    </>
  )
}
