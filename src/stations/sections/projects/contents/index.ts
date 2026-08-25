import { PLACEHOLDER_PAGES } from './PlaceholderPages'
import type { ProjectPage } from './contents.types'

/**
 * 프로젝트 번호(`key`) → 페이지 목록.
 *
 * 내용을 채운 프로젝트만 여기 등록한다. 폴더는 번호로 만들고(`contents/0/` …), 그 안에
 * 페이지 컴포넌트를 둔다. 이름이 아니라 번호로 가리키는 것은 이름이 바뀌어도 흔들리지 않게
 * 하기 위함이고, 액자 사진을 찾는 폴더(`/images/projects/<key>/`)와도 같은 값이다.
 */
const PROJECT_PAGES: Record<number, readonly ProjectPage[]> = {}

/**
 * 그 프로젝트의 페이지 목록.
 *
 * 등록 전이거나 번호가 없는 프로젝트는 자리표시 페이지를 쓴다 — 빈 목록을 돌려주면
 * 확대했을 때 아무것도 없는 판만 남는다.
 */
export function projectPages(key: number | undefined): readonly ProjectPage[] {
  const pages = key == null ? undefined : PROJECT_PAGES[key]
  return pages && pages.length > 0 ? pages : PLACEHOLDER_PAGES
}

export type { ProjectPage, ProjectPageProps } from './contents.types'
