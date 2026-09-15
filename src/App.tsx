import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import {
  CRAYON_ROUTE,
  GALLERY_ROUTE,
  LOBBY_ROUTE,
  MAIN_ROUTE,
  RESUME_COMPANY_ROUTE,
  RESUME_ROUTE,
  ROOT_ROUTE,
} from './routes'
import { SceneTransition } from './ui/SceneTransition'
import { MobileNotice } from './ui/MobileNotice'
import { AppErrorBoundary } from './ui/AppErrorBoundary'
import { ErrorPage } from './ui/ErrorPage'

// 페이지는 주소별로 따로 받는다. 3D 화면은 three·drei·gsap을 통째로 물고 있어,
// 한 덩어리로 묶으면 이력서만 열어도 그것이 함께 내려온다.
const MainPage = lazy(() => import('./pages/MainPage').then((m) => ({ default: m.MainPage })))
const ResumePage = lazy(() => import('./pages/ResumePage').then((m) => ({ default: m.ResumePage })))
const ProjectsLobbyPage = lazy(() =>
  import('./pages/ProjectsLobbyPage').then((m) => ({ default: m.ProjectsLobbyPage })),
)
const ProjectsGalleryPage = lazy(() =>
  import('./pages/ProjectsGalleryPage').then((m) => ({ default: m.ProjectsGalleryPage })),
)
const CrayonStudioPage = lazy(() =>
  import('./pages/CrayonStudioPage').then((m) => ({ default: m.CrayonStudioPage })),
)

/**
 * 사이드바도 나눠 받는다. Firestore를 읽으므로 그대로 가져오면 firebase가 진입 청크에 얹혀,
 * 3D도 이력서도 열지 않은 방문자까지 함께 받는다. 접힌 손잡이만 한 박자 늦게 나타난다.
 */
const SidePanel = lazy(() => import('./ui/SidePanel').then((m) => ({ default: m.SidePanel })))

/**
 * 앱 셸. 테마·전역 스타일·라우트를 갖고, 라우트보다 위에 있어야 하는 것(전환 덮개·안내)을 둔다.
 * 화면 하나하나는 `pages/` 밑의 페이지 컴포넌트가 그린다.
 */
export function App() {
  const mode = useThemeStore((s) => s.mode)
  // 이력서는 채용 담당자가 읽고 출력하는 문서다. 3D 화면의 조작 요소를 얹지 않는다.
  const onResume = useLocation().pathname.startsWith(RESUME_ROUTE)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      {/* 어느 화면이 깨지든 여기까지 올라온다. 씬 안은 `SceneErrorBoundary`가 따로 받는다. */}
      <AppErrorBoundary>
        {/* 페이지를 받는 동안 덮을 것을 두지 않는다 — 화면마다 로딩 연출이 달라 공통으로 그리면 겹친다. */}
        <Suspense fallback={null}>
          <Routes>
            {/* 예전 주소로 찾아온 방문자를 포트폴리오로 보낸다. 되돌아올 화면이 아니라 히스토리에 남기지 않는다. */}
            <Route path={ROOT_ROUTE} element={<Navigate to={MAIN_ROUTE} replace />} />
            <Route path={MAIN_ROUTE} element={<MainPage />} />
            <Route path={RESUME_ROUTE} element={<ResumePage />} />
            <Route path={RESUME_COMPANY_ROUTE} element={<ResumePage />} />
            <Route path={LOBBY_ROUTE} element={<ProjectsLobbyPage />} />
            <Route path={GALLERY_ROUTE} element={<ProjectsGalleryPage />} />
            <Route path={CRAYON_ROUTE} element={<CrayonStudioPage />} />
            {/* SPA rewrite로 오타 주소도 여기까지 오므로, 받아 줄 자리를 끝에 둔다. */}
            <Route
              path="*"
              element={<ErrorPage message="찾으시는 페이지가 없습니다." action="home" />}
            />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
      {/* 장면 전환 덮개도 라우트보다 위다 — 페이지가 통째로 갈리는 동안 남아 화면을 덮는다. */}
      <SceneTransition />
      {/* 마우스 없는 기기 안내. 어느 화면에서나 같으므로 라우트가 아니라 여기 하나만 둔다. */}
      <MobileNotice />
      {/* 프로필·연락처와 주요 화면을 담은 사이드바. 라우트가 갈려도 구운 그림을 들고 남아 있는다. */}
      {!onResume && (
        <Suspense fallback={null}>
          <SidePanel />
        </Suspense>
      )}
    </ThemeProvider>
  )
}
