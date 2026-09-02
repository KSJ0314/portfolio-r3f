import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Line, Text } from '@react-three/drei'
import { BODY_FONT, HAND_FONT } from '../../../../content/fonts'
import { useDoc } from '../../../../lib/firebase'
import { usePointerCursor } from '../../../../scene/usePointerCursor'
import { useIntroPageStore } from '../../../../state/useIntroPageStore'
import { useSceneReadyStore } from '../../../../state/useSceneReadyStore'
import { useStationStore } from '../../../../state/useStationStore'
import { LoadFailed } from '../../../LoadFailed'
import type { StationInactiveProps } from '../../../registry'
import type { TroikaTextMesh } from '../../../types'
import { AREA_Y, CONTENT_Y, INK, OUTLINE_Y } from './AboutIntro.constants'
import type { ProfileDoc } from './AboutIntro.types'
import { IntroContact, type ContactLine } from './IntroContact'
import { CONTACT_ICONS, GITHUB_HOST } from './IntroContact/IntroContact.constants'
import { ProfilePhoto } from './ProfilePhoto'

/** Firestore에는 줄바꿈이 `\n` 두 글자로 들어 있다. 실제 개행으로 바꿔야 3D 텍스트가 줄을 나눈다. */
const withLineBreaks = (text: string) => text.replace(/\\n/g, '\n')

/**
 * `about-intro` 비활성 상태 — 종이 위에 놓인 Intro 페이지.
 *
 * 이 영역이 곧 클릭 판정 범위다. 안쪽 어디를 눌러도 활성화된다.
 * 테두리는 범위를 눈으로 확인하는 개발용이라 HUD에서 켤 때만 그린다.
 *
 * 페이지 내용은 활성 여부와 무관하게 늘 그려져 있다 — 활성화는 카메라만 돌린다.
 */
export function AboutIntroInactive({ station }: StationInactiveProps) {
  const { width, height } = useIntroPageStore((s) => s.area)
  const layout = useIntroPageStore((s) => s.layout)
  const showOutline = useIntroPageStore((s) => s.showOutline)
  const phase = useStationStore((s) => s.phase)
  // 누를 수 있는 동안에만 손가락 커서를 붙인다. 열려 있는 동안에는 페이지를 읽는 화면이다.
  const cursor = usePointerCursor(phase === 'idle')
  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useDoc<ProfileDoc>('profile', 'main')

  // 글씨는 텍스처가 아니라 Firestore를 기다리므로 서스펜드하지 않는다.
  // 마운트만으로 준비됐다고 하면 가림막이 데이터보다 먼저 걷혀 사진만 뜬 페이지가 보인다.
  // 읽기가 끝나면(실패·문서 없음 포함) 그릴 수 있는 상태이므로 그때 알린다.
  const markReady = useSceneReadyStore((s) => s.markReady)
  useEffect(() => {
    if (!profileLoading) markReady('intro-text')
  }, [profileLoading, markReady])

  // 인용 막대를 본문 높이에 맞추려면 줄이 몇 줄로 접혔는지 알아야 한다.
  // 글자 크기·폭·줄바꿈에 따라 달라지므로 troika가 배치를 끝낸 뒤 알려주는 값을 받는다.
  const [introHeight, setIntroHeight] = useState(0)
  const handleIntroSync = useCallback((mesh: unknown) => {
    const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
    if (!bounds || bounds.length < 4) return
    const next = bounds[3] - bounds[1]
    setIntroHeight((prev) => (Math.abs(prev - next) < 1e-4 ? prev : next))
  }, [])

  const halfWidth = width / 2
  const halfHeight = height / 2

  const outline = useMemo<[number, number, number][]>(() => {
    // 닫힌 사각형이라 첫 점으로 돌아온다.
    return [
      [-halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, -halfHeight],
    ]
  }, [halfWidth, halfHeight])

  const {
    paddingX,
    paddingY,
    taglineTop,
    taglineSize,
    introTop,
    introLeft,
    introSize,
    introLineHeight,
    quoteBarWidth,
    quoteBarGap,
    photoBottom,
    photoHeight,
    contactTop,
    contactSize,
    contactGap,
    contactLineHeight,
  } = layout
  // 여백 안쪽이 내용이 놓이는 상자다. 요소별 여백은 여기서 각자 더 들어간다.
  const innerWidth = width - paddingX * 2
  const taglineY = halfHeight - paddingY - taglineTop
  const introX = -halfWidth + paddingX + introLeft
  const introY = taglineY - taglineSize - introTop
  const photoY = -halfHeight + paddingY + photoBottom
  // 인용 막대와 같은 세로선에서 시작해 본문 아래로 이어진다.
  const contactX = introX - quoteBarGap - quoteBarWidth
  // 본문이 몇 줄로 접히는지에 따라 끝나는 높이가 달라지므로 측정한 높이 아래에 둔다.
  const contactY = introY - introHeight - contactTop

  // 값이 있는 줄만 그린다. 전화번호와 이메일은 눌러 복사하고 GitHub은 새 탭으로 연다.
  const contactLines = useMemo<ContactLine[]>(() => {
    const lines: ContactLine[] = []
    if (profile?.phone) {
      lines.push({ icon: CONTACT_ICONS.phone, text: profile.phone, copy: profile.phone })
    }
    if (profile?.email) {
      lines.push({ icon: CONTACT_ICONS.mail, text: profile.email, copy: profile.email })
    }
    // 주소는 그대로 적으면 길어 스킴을 떼고 보여주되, 여는 것은 원래 주소다.
    const github = profile?.links?.find((link) => link.url.includes(GITHUB_HOST))
    if (github) {
      lines.push({
        icon: CONTACT_ICONS.github,
        text: github.url.replace(/^https?:\/\//, ''),
        open: github.url,
      })
    }
    return lines
  }, [profile])

  return (
    <>
      {/* 클릭 판정 면. 포인터 핸들러는 커서뿐이라 우클릭 이동은 바닥으로 통과하고,
          좌클릭 활성화만 Stations가 직접 쏘는 레이캐스트로 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
        {...cursor}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 영역 테두리 — 범위 확인용이라 개발용 HUD에서 켤 때만 그린다.
          우클릭 이동을 가로막지 않도록 레이캐스트에서 뺀다. */}
      {showOutline && <Line points={outline} color={INK} lineWidth={2} raycast={() => null} />}

      {/* 페이지 내용. 그룹을 눕혀두면 안쪽은 화면 좌표(x=가로, y=세로)로 쓸 수 있다.
          내용은 전부 레이캐스트에서 빼야 그 밑의 클릭 판정 면이 잡힌다. */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, CONTENT_Y, 0]}>
        {/* 읽기가 실패하면 글씨 자리가 통째로 빈다. 사진은 Firestore와 무관하므로 그대로 둔다. */}
        {profileError && <LoadFailed size={introSize} y={introY} onRetry={refetchProfile} />}

        {profile?.tagline && (
          <Text
            font={HAND_FONT}
            position={[0, taglineY, 0]}
            anchorX="center"
            anchorY="top"
            fontSize={taglineSize}
            maxWidth={innerWidth}
            textAlign="center"
            color={INK}
            raycast={() => null}
          >
            {profile.tagline}
          </Text>
        )}

        {/* 마크다운 인용구처럼 본문 왼쪽에 세로 막대를 세운다. 높이는 접힌 본문 높이를 따라간다. */}
        {profile?.intro && introHeight > 0 && (
          <mesh
            position={[introX - quoteBarGap - quoteBarWidth / 2, introY - introHeight / 2, 0]}
            raycast={() => null}
          >
            <planeGeometry args={[quoteBarWidth, introHeight]} />
            <meshBasicMaterial color={INK} toneMapped={false} />
          </mesh>
        )}

        {profile?.intro && (
          <Text
            onSync={handleIntroSync}
            font={BODY_FONT}
            position={[introX, introY, 0]}
            anchorX="left"
            anchorY="top"
            fontSize={introSize}
            lineHeight={introLineHeight}
            maxWidth={innerWidth - introLeft}
            textAlign="left"
            color={INK}
            raycast={() => null}
          >
            {withLineBreaks(profile.intro)}
          </Text>
        )}

        {/* 연락처는 아이콘 텍스처를 기다리므로 자기 경계 안에 둔다.
            누르는 판은 페이지가 열려 있는 동안에만 둬 항공뷰에서 스테이션 활성화를 가로막지 않는다. */}
        {contactLines.length > 0 && (
          <Suspense fallback={null}>
            <IntroContact
              lines={contactLines}
              x={contactX}
              y={contactY}
              size={contactSize}
              gap={contactGap}
              lineHeight={contactLineHeight}
              interactive={phase === 'active'}
            />
          </Suspense>
        )}

        {/* 사진은 자기 경계를 갖는다. 글씨는 Firestore 데이터를 기다리고 사진은 텍스처를 기다려
            준비되는 시점이 다른데, 한 경계에 묶으면 사진이 뜰 때까지 페이지 전체가 버려졌다
            다시 그려진다(LEARNING 2026-07-23). 이 경계를 없애지 말 것. */}
        <Suspense fallback={null}>
          <ProfilePhoto bottom={photoY} height={photoHeight} />
        </Suspense>
      </group>
    </>
  )
}
