import { StudioModal } from './CrayonStudio'

/**
 * `/crayon` — 크레파스 스튜디오만 단독으로 쓰는 페이지.
 * 뒤에 씬이 없으므로 닫기를 두지 않고, 그림판이 곧 페이지 전체다.
 */
export function CrayonStudioPage() {
  return <StudioModal />
}
