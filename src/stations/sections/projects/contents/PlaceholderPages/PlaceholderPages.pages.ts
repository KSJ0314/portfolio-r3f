import type { ProjectPage } from '../contents.types'
import { PlaceholderPage } from './PlaceholderPages'
import { PLACEHOLDER_PAGE_COUNT } from './PlaceholderPages.constants'

/** 자리표시 페이지 목록. 같은 장을 장수만큼 늘어놓는다. */
export const PLACEHOLDER_PAGES: readonly ProjectPage[] = Array.from(
  { length: PLACEHOLDER_PAGE_COUNT },
  () => PlaceholderPage,
)
