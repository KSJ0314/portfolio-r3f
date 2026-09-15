import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCollection } from '../../lib/firebase'
import type { ListShot, ListShotTarget } from '../../scene/ListBaker/ListBaker.types'
import { useListShotsStore } from '../../state/useListShotsStore'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'
import { useSidePanelStore } from '../../state/useSidePanelStore'
import { openStationAt, setPendingJump } from '../../stations/jump'
import type { GalleryProject } from '../../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import { useSceneTransitionStore } from '../../state/useSceneTransitionStore'
import { GALLERY_ROUTE, MAIN_ROUTE } from '../../routes'
import { REQUIRED_KEYS } from '../SceneGate/SceneGate.constants'
import { INTRO_STATION_ID } from './SidePanel.constants'
import { HandleIcon } from './SidePanel.icons'
import { Backdrop, Body, Divider, Handle, Panel, Slider } from './SidePanel.styled'
import { SidePanelProfile } from './SidePanelProfile'
import { SidePanelShots } from './SidePanelShots'

/**
 * 굽는 씬과 PDF 묶기는 **나눠 받는다.**
 *
 * 사이드바는 라우트보다 위에 있어 앱이 뜰 때 함께 내려온다. 굽는 씬은 three·drei와 스테이션 구현을,
 * PDF 묶기는 jspdf를 통째로 물고 있어, 그대로 가져오면 이력서만 열어도 그것이 다 따라온다
 * (DECISIONS 057). 굽기 시작할 때·PDF를 묶을 때 받으면 첫 화면이 뜬 뒤라 기다림이 드러나지 않는다.
 */
const ListBaker = lazy(() =>
  import('../../scene/ListBaker').then((m) => ({ default: m.ListBaker })),
)

/**
 * 화면 왼쪽에 떠 있는 사이드바.
 *
 * 평소에는 접혀 손잡이만 가장자리에 남고, 눌러서 펼친다. 3D 위에 얹히므로 탐험을 멈추지 않는다.
 * 머리에는 프로필과 연락처, 그 아래에는 주요 화면을 구운 그림이 있다.
 *
 * **굽기는 첫 화면이 뜬 뒤에 시작한다.** 그 전에는 텍스처를 굽고 모델을 받느라 바빠, 굽는 캔버스까지
 * 세우면 첫 화면이 그만큼 늦어진다(`scene/DevicePerfProbe`가 성능을 재는 시점과 같은 이유다).
 * 맵을 거치지 않고 로비 주소로 바로 들어오면 그 신호가 올라오지 않으므로, 그때는 처음 펼칠 때 굽는다.
 * 구운 그림은 스토어에 남아 라우트가 갈려도 다시 굽지 않는다.
 */
export function SidePanel() {
  const open = useSidePanelStore((s) => s.open)
  const setOpen = useSidePanelStore((s) => s.setOpen)
  const toggle = useSidePanelStore((s) => s.toggle)
  // 한 번이라도 펼쳤는지. 맵을 거치지 않은 방문자에게 굽기를 시작하는 신호다.
  const [asked, setAsked] = useState(false)
  const { data: projects, loading, error } = useCollection<GalleryProject>('projects')
  const shots = useListShotsStore((s) => s.shots)
  const pdf = useListShotsStore((s) => s.pdf)
  const firstScreenReady = useSceneReadyStore((s) => REQUIRED_KEYS.every((key) => s.ready[key]))
  const path = useLocation().pathname

  const press = useCallback(() => {
    toggle()
    setAsked(true)
  }, [toggle])

  /**
   * 누른 화면으로 데려간다.
   *
   * **지금 있는 화면에서 열 수 있으면 곧바로 연다** — 스테이션은 연출 없이 바로 펼쳐진다.
   * 다른 장면에 있으면 목적지를 남기고 덮개를 부른다. 도착한 쪽이 그것을 꺼내 연다.
   * 어디에 있는지는 주소로 알 수 있고, 그 판단은 라우팅을 아는 이쪽 몫이다 — 씬은 주소를 모른다.
   */
  const jump = useCallback(
    (target: ListShotTarget) => {
      setOpen(false)

      const station = target.kind === 'station'
      // 그 화면이 이미 떠 있으면 옮길 것이 없다. 스테이션은 곧바로 펼치고,
      // 전시 칸은 남겨 두면 그 방이 곧바로 받아 연다.
      if (path === (station ? MAIN_ROUTE : GALLERY_ROUTE)) {
        if (station) openStationAt(target)
        else setPendingJump(target)
        return
      }

      setPendingJump(target)
      useSceneTransitionStore.getState().close(station ? 'map' : 'gallery')
    },
    [path, setOpen],
  )

  // 펼친 동안의 ESC는 사이드바를 닫는다. 스테이션·실내 화면도 ESC를 듣고 있으므로 여기서 가로챈다.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, setOpen])

  const handleDone = useCallback((baked: ListShot[]) => {
    useListShotsStore.getState().setShots(baked)
  }, [])

  const handleProgress = useCallback((done: number) => {
    useListShotsStore.getState().setBaked(done)
  }, [])

  // 누른 뒤에 만들면 그만큼 기다린다. 다 굽는 대로 곧바로 묶어 두고 버튼은 주기만 한다.
  useEffect(() => {
    if (!shots || pdf) return
    let cancelled = false
    void import('../../scene/ListBaker/ListBaker.pdf').then(({ buildShotsPdf }) =>
      buildShotsPdf(shots, {
        onProgress: (ratio) => useListShotsStore.getState().setPdfRatio(ratio),
        cancelled: () => cancelled,
      }).then((blob) => {
        if (blob && !cancelled) useListShotsStore.getState().setPdf(blob)
      }),
    )
    return () => {
      cancelled = true
    }
  }, [shots, pdf])

  // 프로젝트 문서 개수가 만들 장수를 정하므로 그것이 오기 전에는 세우지 않는다.
  // 읽기에 실패해도 `loading`은 내려가고 빈 목록이 오므로 `error`를 함께 본다 —
  // 그대로 만들면 프로젝트가 빠진 결과가 스토어에 남고, 재시도가 성공해도 다시 만들지 않는다.
  const baking = !shots && !loading && !error && (firstScreenReady || asked)

  return (
    <>
      {open && <Backdrop onClick={() => setOpen(false)} />}

      {baking && (
        <Suspense fallback={null}>
          <ListBaker projects={projects} onProgress={handleProgress} onDone={handleDone} />
        </Suspense>
      )}

      <Slider $open={open}>
        {/* 접힌 동안에는 `inert`로 통째로 꺼 둔다. 화면 밖으로 밀어 둔 것뿐이라 그냥 두면 탭으로 들어간다. */}
        <Panel inert={!open}>
          <Body>
            <SidePanelProfile onOpen={() => jump({ kind: 'station', id: INTRO_STATION_ID })} />
            <Divider />
            <SidePanelShots onJump={jump} />
          </Body>
        </Panel>

        <Handle
          type="button"
          onClick={press}
          title={open ? '접기' : '펼치기'}
          aria-label={open ? '사이드바 접기' : '사이드바 펼치기'}
          aria-expanded={open}
        >
          <HandleIcon open={open} />
        </Handle>
      </Slider>
    </>
  )
}
