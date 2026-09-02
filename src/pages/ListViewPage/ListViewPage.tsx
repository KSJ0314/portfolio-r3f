import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MAIN_ROUTE } from '../../routes'
import { useTheme } from 'styled-components'
import { useCollection } from '../../lib/firebase'
import { BackButton } from '../../ui/BackButton'
import type { GalleryProject } from '../../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import { ListBaker, buildShotsPdf, saveShotsPdf } from '../../scene/ListBaker'
import { ChevronIcon, DownloadIcon } from './ListViewPage.icons'
import {
  BackSlot,
  Bar,
  Count,
  CopiedBadge,
  CopyArea,
  Cover,
  CoverProgress,
  Dot,
  Dots,
  DownloadButton,
  Frame,
  LinkArea,
  NavButton,
  Row,
  Shot,
  Stage,
  Viewer,
} from './ListViewPage.styled'
import type { ListShot } from '../../scene/ListBaker'

/** 복사했다고 알리는 표시를 띄워 두는 시간(ms). */
const COPIED_MS = 800

/**
 * 목록 보기 — 주요 화면을 한 장씩 넘겨 보는 페이지.
 *
 * 들어오면 화면 밖 캔버스로 3D 화면을 한 장씩 구워(`ListBaker`) 이미지로 바꾼다.
 * 다 구우면 굽는 자리를 걷어 **페이지에는 이미지만 남는다.** 내려받기도 그 이미지를 그대로 준다.
 *
 * 그림은 화면을 꽉 채우지 않는다 — 남는 자리에 좌우 넘김·인디케이터·쪽 번호가 들어간다.
 * 구운 그림에는 누를 것이 없으므로 누를 자리에 투명한 판을 덮어 살린다.
 * 주소는 새 탭으로 열고, 연락처처럼 복사하는 자리는 클립보드에 담고 그 자리에 알린다.
 */
export function ListViewPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: projects, loading } = useCollection<GalleryProject>('projects')
  const [shots, setShots] = useState<ListShot[] | null>(null)
  const [baked, setBaked] = useState(0)
  const [page, setPage] = useState(0)
  const [pdf, setPdf] = useState<Blob | null>(null)
  const [pdfRatio, setPdfRatio] = useState(0)
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

  // blob 주소는 스스로 사라지지 않는다. 페이지를 떠날 때 되돌린다.
  useEffect(() => {
    if (!shots) return
    return () => {
      for (const shot of shots) URL.revokeObjectURL(shot.url)
    }
  }, [shots])

  // 누른 뒤에 만들면 그만큼 기다린다. 다 굽는 대로 곧바로 묶어 두고 버튼은 주기만 한다.
  useEffect(() => {
    if (!shots) return
    let cancelled = false
    void buildShotsPdf(shots, {
      onProgress: (ratio) => setPdfRatio(ratio),
      cancelled: () => cancelled,
    }).then((blob) => {
      if (blob) setPdf(blob)
    })
    return () => {
      cancelled = true
    }
  }, [shots])

  /** 만들어 둔 PDF를 그대로 준다. 다시 묶지 않으므로 화면과 받는 것이 같다. */
  const download = useCallback(() => {
    if (pdf) saveShotsPdf(pdf)
  }, [pdf])

  const shot = shots?.[page]

  return (
    <>
      <BackSlot>
        <BackButton label="Go home" color={theme.colors.text} onClick={() => navigate(MAIN_ROUTE)} />
      </BackSlot>

      {!shots && (
        <Cover>
          화면을 준비하는 중
          <CoverProgress>{baked > 0 ? `${baked}장째` : '잠시만 기다려 주세요'}</CoverProgress>
        </Cover>
      )}

      {!loading && !shots && (
        <ListBaker projects={projects} onProgress={setBaked} onDone={setShots} />
      )}

      <Viewer>
        {shots && shot && (
          <Stage>
            <Row>
              <NavButton
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 0}
                aria-label="이전 장"
              >
                <ChevronIcon direction={-1} />
              </NavButton>

              <Frame>
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
                      />
                    )
                  }
                  return (
                    <CopyArea
                      key={link.value}
                      type="button"
                      onClick={() =>
                        copy(link.value, {
                          left: link.left + link.width / 2,
                          top: link.top,
                        })
                      }
                      aria-label={`${link.value} 복사`}
                      style={place}
                    />
                  )
                })}
                {copied && (
                  <CopiedBadge
                    style={{ left: `${copied.left}%`, top: `${copied.top}%` }}
                    role="status"
                  >
                    복사했습니다
                  </CopiedBadge>
                )}
              </Frame>

              <NavButton
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page === shots.length - 1}
                aria-label="다음 장"
              >
                <ChevronIcon direction={1} />
              </NavButton>
            </Row>

            <Bar>
              <Dots>
                {shots.map((each, index) => (
                  <Dot
                    key={each.id}
                    type="button"
                    $active={index === page}
                    onClick={() => setPage(index)}
                    aria-label={`${index + 1}번째 장`}
                  />
                ))}
              </Dots>
              <Count>
                {page + 1} / {shots.length}
              </Count>
            </Bar>
          </Stage>
        )}
      </Viewer>

      {shots && (
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
      )}
    </>
  )
}
