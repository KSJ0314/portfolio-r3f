import { useLayoutEffect, useState } from 'react'
import { Experience } from '../../scene/Experience'
import { SceneGate } from '../../ui/SceneGate'
import { Minimap } from '../../ui/Minimap'
import { WorldMap } from '../../ui/WorldMap'
import { Credits } from '../../ui/Credits'
import { DevHUD } from '../../ui/DevHUD'
import { CrayonStudio } from '../../tools/CrayonStudio'
import { ListViewButton } from '../../ui/ListViewButton'
import { StationLifecycle } from '../../stations'
import { ensureOutsideBuilding } from '../../stations/sections/projects/ProjectsLobby'
import { useStationStore } from '../../state/useStationStore'

/** 메인 페이지(`/`) — 3D 포트폴리오. 테마·전역 스타일·라우트는 `App`이 감싼다. */
export function MainPage() {
  // 스테이션이 열려 있는 동안에는 미니맵·구석 버튼을 두지 않는다. 완전히 닫힌 뒤(idle)에만 다시 나타난다.
  const idle = useStationStore((s) => s.phase === 'idle')
  const [worldMapOpen, setWorldMapOpen] = useState(false)

  // 주소가 맵이면 건물 밖에 서 있어야 한다. 브라우저 뒤로가기는 주소만 되돌리고 앱 상태는
  // 건드리지 않아, 그대로 두면 문이 다시 열리며 진입 연출이 통째로 재생된다.
  // 첫 화면에서 그리기 전에 맞춰야 한 프레임도 어긋나 보이지 않는다.
  useLayoutEffect(() => {
    ensureOutsideBuilding()
  }, [])

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
      {/* leva 튜닝 패널은 dev 전용이라 프로덕션 번들에서 빠진다. */}
      {import.meta.env.DEV && <DevHUD />}
      {idle && <CrayonStudio />}
      {/* 가져다 쓴 에셋의 출처. CC-BY는 방문자가 볼 수 있는 곳에 밝히도록 요구한다. */}
      {idle && <Credits />}
      {/* 3D를 돌아다니지 않고 주요 화면만 훑는 자리. */}
      <ListViewButton />
    </>
  )
}
