import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'styled-components'
import { useCollection } from '../../lib/firebase'
import { BackButton } from '../../ui/BackButton'
import type { GalleryProject } from '../../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import { ListBaker } from './ListBaker'
import { ChevronIcon, DownloadIcon } from './ListView.icons'
import { buildShotsPdf, saveShotsPdf } from './ListView.pdf'
import {
  Bar,
  Count,
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
  Viewer,
} from './ListView.styled'
import type { ListShot } from './ListView.types'

/**
 * 목록 보기 — 주요 화면을 한 장씩 넘겨 보는 페이지.
 *
 * 들어오면 화면 밖 캔버스로 3D 화면을 한 장씩 구워(`ListBaker`) 이미지로 바꾼다.
 * 다 구우면 굽는 자리를 걷어 **페이지에는 이미지만 남는다.** 내려받기도 그 이미지를 그대로 준다.
 *
 * 그림은 화면을 꽉 채우지 않는다 — 남는 자리에 좌우 넘김·인디케이터·쪽 번호가 들어간다.
 * 구운 그림에는 누를 것이 없으므로 링크는 그 자리에 투명한 판을 덮어 살린다.
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
      <BackButton label="Go home" color={theme.colors.text} onClick={() => navigate('/')} />

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
          <>
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
                {shot.links.map((link) => (
                  <LinkArea
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.url}
                    style={{
                      left: `${link.left}%`,
                      top: `${link.top}%`,
                      width: `${link.width}%`,
                      height: `${link.height}%`,
                    }}
                  />
                ))}
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
          </>
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
