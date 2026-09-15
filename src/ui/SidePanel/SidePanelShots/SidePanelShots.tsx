import { useCallback, useEffect, useMemo, useState } from 'react'
import { useListShotsStore } from '../../../state/useListShotsStore'
import { DownloadIcon } from '../../DownloadIcon'
import { COPIED_MS, HIDDEN_SHOT_IDS } from './SidePanelShots.constants'
import { ChevronIcon } from './SidePanelShots.icons'
import {
  Bar,
  CopiedBadge,
  CopyArea,
  Count,
  DownloadButton,
  Frame,
  Head,
  LinkArea,
  NavButton,
  Section,
  Shot,
  Title,
  Waiting,
} from './SidePanelShots.styled'
import type { SidePanelShotsProps } from './SidePanelShots.types'

/**
 * 구운 화면을 한 장씩 넘겨 보는 자리.
 *
 * 구운 그림에는 누를 것이 없으므로 링크 자리에 투명한 판을 덮어 살린다.
 * 자리 값이 그림 크기 대비 백분율이라 사이드바 폭에 맞춰 줄여도 그대로 따라온다.
 * 주소는 새 탭으로 열고, 연락처처럼 복사하는 자리는 클립보드에 담고 그 자리에 알린다.
 */
export function SidePanelShots({ onJump }: SidePanelShotsProps) {
  const allShots = useListShotsStore((s) => s.shots)
  const baked = useListShotsStore((s) => s.baked)
  const pdf = useListShotsStore((s) => s.pdf)
  const pdfRatio = useListShotsStore((s) => s.pdfRatio)
  const [page, setPage] = useState(0)
  // 보여줄 화면만 남긴다. 걸러 낸 것은 PDF에 그대로 들어간다.
  const shots = useMemo(
    () => allShots?.filter((shot) => !HIDDEN_SHOT_IDS.includes(shot.id)) ?? null,
    [allShots],
  )
  // 복사했다고 알리는 자리. 한 번에 하나만 띄운다.
  const [copied, setCopied] = useState<{ left: number; top: number } | null>(null)

  // 표시를 걷는 일은 상태에 묶어 둔다. 다시 누르면 새 상태라 시간도 다시 시작한다.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = useCallback((value: string, at: { left: number; top: number }) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(at))
      .catch(() => {
        // 클립보드가 막힌 환경이다. 복사되지 않았으므로 알리지 않는다.
      })
  }, [])

  /**
   * 만들어 둔 PDF를 그대로 준다. 다시 묶지 않으므로 화면과 받는 것이 같다.
   * 묶을 때 이미 받아 둔 모듈이라 여기서 다시 부르면 곧바로 돌아온다.
   */
  const download = useCallback(() => {
    if (!pdf) return
    void import('../../../scene/ListBaker/ListBaker.pdf').then(({ saveShotsPdf }) =>
      saveShotsPdf(pdf),
    )
  }, [pdf])

  const shot = shots?.[page]

  return (
    <Section>
      <Head>
        <Title>주요 화면</Title>
        <DownloadButton
          type="button"
          $ratio={pdfRatio}
          onClick={download}
          disabled={!pdf}
          title={pdf ? 'PDF로 내려받기' : 'PDF를 만드는 중'}
          aria-label={pdf ? 'PDF로 내려받기' : 'PDF를 만드는 중'}
        >
          <DownloadIcon />
        </DownloadButton>
      </Head>

      {!shots || !shot ? (
        <Waiting>{baked > 0 ? `화면을 준비하는 중 — ${baked}장째` : '화면을 준비하는 중'}</Waiting>
      ) : (
        <>
          <Frame type="button" onClick={() => onJump(shot.target)} aria-label="이 화면으로 가기">
            <Shot src={shot.url} alt={`${page + 1}번째 화면`} />
            {shot.links.map((link) => {
              const place = {
                left: `${link.left}%`,
                top: `${link.top}%`,
                width: `${link.width}%`,
                height: `${link.height}%`,
              }
              if (link.kind === 'open') {
                return (
                  <LinkArea
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.url}
                    style={place}
                    // 그림 전체가 그 화면으로 가는 버튼이라, 막지 않으면 링크를 열면서 이동까지 한다.
                    onClick={(e) => e.stopPropagation()}
                  />
                )
              }
              return (
                <CopyArea
                  key={link.value}
                  type="button"
                  onClick={(e) => {
                    // 복사만 하고 그 화면으로 가지는 않는다. 누른 자리가 하는 일이 둘이 되지 않게.
                    e.stopPropagation()
                    copy(link.value, { left: link.left + link.width / 2, top: link.top })
                  }}
                  aria-label={`${link.value} 복사`}
                  style={place}
                />
              )
            })}
            {copied && (
              <CopiedBadge style={{ left: `${copied.left}%`, top: `${copied.top}%` }} role="status">
                복사했습니다
              </CopiedBadge>
            )}
          </Frame>

          <Bar>
            <NavButton
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page === 0}
              aria-label="이전 장"
            >
              <ChevronIcon direction={-1} />
            </NavButton>

            <Count>
              {page + 1} / {shots.length}
            </Count>

            <NavButton
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page === shots.length - 1}
              aria-label="다음 장"
            >
              <ChevronIcon direction={1} />
            </NavButton>
          </Bar>
        </>
      )}
    </Section>
  )
}
