import type { SceneDestination } from './state/useSceneTransitionStore'

/**
 * 앱의 주소 표.
 *
 * 페이지 하나의 소유물이 아니라 라우팅이 공유하는 값이라 여기 모은다.
 * **씬은 이 파일을 알지 못한다** — 장면을 옮기는 쪽은 주소가 아니라 목적지 이름을 알리고,
 * 그것을 주소로 바꾸는 일은 라우팅을 아는 `ui/SceneTransition`이 한다.
 */
/** 진입 주소. 3D 포트폴리오로 넘긴다 — 이력서와 포트폴리오는 각자 주소로 배포한다. */
export const ROOT_ROUTE = '/'
export const MAIN_ROUTE = '/portfolio'
export const RESUME_ROUTE = '/resume'
/** 회사별 자기소개를 싣는 이력서. 뒤에 붙는 값이 `content/coverLetters`의 키다. */
export const RESUME_COMPANY_ROUTE = '/resume/:company'
export const LOBBY_ROUTE = '/projects'
export const GALLERY_ROUTE = '/projects/gallery'
export const LIST_ROUTE = '/list'
export const CRAYON_ROUTE = '/crayon'

/** 장면 전환이 알리는 목적지 → 실제 주소. */
export const ROUTE_BY_DESTINATION: Record<SceneDestination, string> = {
  map: MAIN_ROUTE,
  lobby: LOBBY_ROUTE,
  gallery: GALLERY_ROUTE,
}
