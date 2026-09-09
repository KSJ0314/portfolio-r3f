import { useLayoutEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Experience } from '../../scene/Experience'
import { SceneGate } from '../../ui/SceneGate'
import { Minimap } from '../../ui/Minimap'
import { WorldMap } from '../../ui/WorldMap'
import { Credits } from '../../ui/Credits'
import { DevHUD } from '../../ui/DevHUD'
import { CrayonStudio } from '../../tools/CrayonStudio'
import { GithubButton } from '../../ui/GithubButton'
import { ListViewButton } from '../../ui/ListViewButton'
import { REDIRECT_MOBILE_TO_LIST, useCoarsePointer } from '../../ui/MobileNotice'
import { LIST_ROUTE } from '../../routes'
import { StationLifecycle } from '../../stations'
import { ensureOutsideBuilding } from '../../stations/sections/projects/ProjectsLobby'
import { useStationStore } from '../../state/useStationStore'

/** 메인 페이지(`/portfolio`) — 3D 포트폴리오. 테마·전역 스타일·라우트는 `App`이 감싼다. */
export function MainPage() {
  // 스테이션이 열려 있는 동안에는 미니맵·구석 버튼을 두지 않는다. 완전히 닫힌 뒤(idle)에만 다시 나타난다.
  const idle = useStationStore((s) => s.phase === 'idle')
  const [worldMapOpen, setWorldMapOpen] = useState(false)
  const mobile = useCoarsePointer()

  // 주소가 맵이면 건물 밖에 서 있어야 한다. 브라우저 뒤로가기는 주소만 되돌리고 앱 상태는
  // 건드리지 않아, 그대로 두면 문이 다시 열리며 진입 연출이 통째로 재생된다.
  // 첫 화면에서 그리기 전에 맞춰야 한 프레임도 어긋나 보이지 않는다.
  useLayoutEffect(() => {
    ensureOutsideBuilding()
  }, [])

  // 마우스가 없으면 우클릭 홀드 이동이 성립하지 않아 맵을 돌아다닐 수 없다.
  // 3D를 그리기 전에 목록 보기로 보내 모델·텍스처를 받지 않게 한다.
  // 되돌아올 화면이 아니므로 히스토리에 남기지 않는다.
  // 지금은 꺼 두었고 플래그 설명은 `MobileNotice.constants`에 있다.
  if (REDIRECT_MOBILE_TO_LIST && mobile) return <Navigate to={LIST_ROUTE} replace />

  return (
    <>
      <Experience />
      {/* 바닥·캐릭터·Intro가 다 준비될 때까지 첫 화면을 덮는다(로딩 연출은 폴리싱 단계에서). */}
      <SceneGate />
      {/* 활성 스테이션의 2D 상세 자리 + ESC 종료 + 미구현 스테이션 fallback */}
      <StationLifecycle />
      {/* 테마 토글은 밤 테마를 제대로 구현할 때 다시 단다(지금은 종이만 어두워진다). */}
      {idle && <Minimap onOpen={() => setWorldMapOpen(true)} />}
      {worldMapOpen && <WorldMap onClose={() => setWorldMapOpen(false)} />}
      {/* leva 튜닝 패널은 dev 전용이고, 좁은 화면에서는 값을 맞출 일이 없어 두지 않는다. */}
      {import.meta.env.DEV && !mobile && <DevHUD />}
      {idle && <CrayonStudio />}
      {/* 가져다 쓴 에셋의 출처. CC-BY는 방문자가 볼 수 있는 곳에 밝히도록 요구한다. */}
      {idle && <Credits />}
      {/* 이 포트폴리오의 코드를 바로 열어 볼 수 있게 둔다. */}
      {idle && <GithubButton />}
      {/* 3D를 돌아다니지 않고 주요 화면만 훑는 자리. */}
      <ListViewButton />
    </>
  )
}
