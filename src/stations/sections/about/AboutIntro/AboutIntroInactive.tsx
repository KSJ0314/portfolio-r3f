import { Suspense, useCallback, useMemo, useState } from 'react'
import { Line, Text } from '@react-three/drei'
import { BODY_FONT, HAND_FONT } from '../../../../content/fonts'
import { useDoc } from '../../../../lib/firebase'
import { useIntroPageStore } from '../../../../state/useIntroPageStore'
import type { StationInactiveProps } from '../../../registry'
import { AREA_Y, CONTENT_Y, INK, OUTLINE_Y } from './AboutIntro.constants'
import type { ProfileDoc, TroikaTextMesh } from './AboutIntro.types'
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
  const { data: profile } = useDoc<ProfileDoc>('profile', 'main')

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
  } = layout
  // 여백 안쪽이 내용이 놓이는 상자다. 요소별 여백은 여기서 각자 더 들어간다.
  const innerWidth = width - paddingX * 2
  const taglineY = halfHeight - paddingY - taglineTop
  const introX = -halfWidth + paddingX + introLeft
  const introY = taglineY - taglineSize - introTop
  const photoY = -halfHeight + paddingY + photoBottom

  return (
    <>
      {/* 클릭 판정 면. 포인터 핸들러가 없어 R3F 이벤트에서는 무시되므로 우클릭 이동은 바닥으로 통과한다.
          좌클릭 활성화는 Stations가 직접 쏘는 레이캐스트가 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
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

        <Suspense fallback={null}>
          <ProfilePhoto bottom={photoY} height={photoHeight} />
        </Suspense>
      </group>
    </>
  )
}
