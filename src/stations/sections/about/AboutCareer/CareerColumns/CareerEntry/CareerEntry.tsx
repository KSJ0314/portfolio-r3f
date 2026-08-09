import { useCallback } from 'react'
import { Text } from '@react-three/drei'
import { BODY_FONT } from '../../../../../../content/fonts'
import type { TroikaTextMesh } from '../../../../../types'
import { INK, INK_MUTED } from '../../AboutCareer.constants'
import type { CareerEntryProps } from './CareerEntry.types'

/**
 * 항목 하나 — 제목은 크기로만 구분하고 글씨체는 전부 본문체다.
 * 손글씨는 칸 이름(로고 옆 제목)까지만 쓴다.
 *
 * 오른쪽 값(기관명·취득일)은 칸 오른쪽 끝에 건다. 왼쪽 글이 길어져도 오른쪽 줄은 가지런히 맞는다.
 * 본문은 몇 줄로 접힐지 미리 알 수 없어, troika가 배치를 끝낸 뒤 주는 경계값으로 재 부모에게 알린다.
 */
export function CareerEntry({
  entry,
  x,
  y,
  width,
  layout,
  bodyHeight,
  onBodyHeight,
}: CareerEntryProps) {
  const { titleSize, titleGap, lineGap, bodySize, bodyLineHeight } = layout
  const { quoteBarWidth, quoteBarGap } = layout
  const { id, title, body, meta } = entry
  const hasBody = body !== undefined && body.length > 0

  const handleBodySync = useCallback(
    (mesh: unknown) => {
      const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
      if (!bounds || bounds.length < 4) return
      onBodyHeight(id, bounds[3] - bounds[1])
    },
    [id, onBodyHeight],
  )

  // 제목은 상단이 아니라 **첫 줄 베이스라인**을 기준점으로 잡는다.
  // 글자 크기나 글씨체를 바꿔도 밑선이 그 자리에 남아 아래 줄과의 간격이 흔들리지 않는다.
  // 베이스라인을 글자 크기만큼 내려두면 글자가 항목 위 경계 안쪽에 들어온다(글꼴 ascent < 글자 크기).
  const titleBaselineY = -titleSize

  // 아래로 쌓이는 좌표라 위에서부터 뺀다. 본문이 없으면 그 자리를 건너뛴다.
  // 제목 높이는 부모가 자리를 잡을 때와 같은 셈(글자 크기 × 줄 수)이라야 어긋나지 않는다.
  const bodyY = -(titleSize * title.split('\n').length + titleGap)
  // 본문은 인용 막대 오른쪽으로 물러나므로 접히는 폭도 그만큼 줄어든다.
  const bodyX = quoteBarWidth + quoteBarGap
  const metaY = hasBody ? bodyY - bodyHeight - lineGap : bodyY

  return (
    <group position={[x, y, 0]}>
      <Text
        font={BODY_FONT}
        position={[0, titleBaselineY, 0]}
        anchorX="left"
        anchorY="top-baseline"
        fontSize={titleSize}
        color={INK}
        raycast={() => null}
      >
        {title}
      </Text>

      {/* 마크다운 인용구처럼 본문 왼쪽에 세로 막대를 세운다. 높이는 접힌 본문 높이를 따라간다. */}
      {hasBody && bodyHeight > 0 && (
        <mesh position={[quoteBarWidth / 2, bodyY - bodyHeight / 2, 0]} raycast={() => null}>
          <planeGeometry args={[quoteBarWidth, bodyHeight]} />
          <meshBasicMaterial color={INK} toneMapped={false} />
        </mesh>
      )}

      {/* 설명이 여러 줄이면 한 인용 블록 안에서 줄만 나뉜다 — 줄마다 새 항목처럼 보이지 않게. */}
      {hasBody && (
        <Text
          onSync={handleBodySync}
          font={BODY_FONT}
          position={[bodyX, bodyY, 0]}
          anchorX="left"
          anchorY="top"
          fontSize={bodySize}
          lineHeight={bodyLineHeight}
          maxWidth={width - bodyX}
          textAlign="left"
          color={INK}
          raycast={() => null}
        >
          {body.join('\n')}
        </Text>
      )}

      {meta && (
        <>
          <Text
            font={BODY_FONT}
            position={[0, metaY, 0]}
            anchorX="left"
            anchorY="top"
            fontSize={bodySize}
            color={INK_MUTED}
            raycast={() => null}
          >
            {meta.left}
          </Text>

          {meta.right && (
            <Text
              font={BODY_FONT}
              position={[width, metaY, 0]}
              anchorX="right"
              anchorY="top"
              fontSize={bodySize}
              color={INK_MUTED}
              raycast={() => null}
            >
              {meta.right}
            </Text>
          )}
        </>
      )}
    </group>
  )
}
