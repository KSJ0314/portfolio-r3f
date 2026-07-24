import { Experience } from './scene/Experience'
import { Minimap } from './ui/Minimap'
import { DevHUD } from './ui/DevHUD'
import { CrayonStudio } from './tools/CrayonStudio'
import { StationLifecycle } from './stations'

/** 메인 페이지(`/`) — 3D 포트폴리오. 테마·전역 스타일은 `main.tsx`가 감싼다. */
function App() {
  return (
    <>
      <Experience />
      {/* 활성 스테이션의 2D 상세 자리 + ESC 종료 + 미구현 스테이션 fallback */}
      <StationLifecycle />
      {/* 테마 토글은 밤 테마를 제대로 구현할 때 다시 단다(지금은 종이만 어두워진다). */}
      <Minimap />
      {/* 개발용 도구(HUD 묶음 + 크레파스 스튜디오). dev에서만 렌더돼 프로덕션 번들에서 빠진다. */}
      {import.meta.env.DEV && (
        <>
          <DevHUD />
          <CrayonStudio />
        </>
      )}
    </>
  )
}

export default App
