/**
 * 스테이션 배치 데이터 (단일 소스).
 *
 * 여기 담기는 것은 스테이션의 "공통 배치 정보"뿐이다 — 위치·섹션(길) 소속·이름·표지판.
 * 스테이션의 겉모습(고유 3D 오브젝트)과 활성화 시 상세 연출은 데이터가 아니라
 * `스테이션 id → 전용 컴포넌트` 레지스트리로 스테이션마다 따로 구현한다. (DECISIONS 006)
 *
 * 이 데이터를 렌더(Stations)·미니맵·표지판·근접 감지가 공유한다.
 * 좌표는 `CAMERA_BOUNDS`(useCameraStore) 안, 중앙 광장(원점)에서 길이 주제별로 갈라지는 구조.
 * 좌표·개수는 임시이며 이후 자유롭게 조정한다. (프로젝트는 Phase 4에서 Firestore 개수대로 생성)
 */

/** 섹션(길) 식별자. */
export type SectionId = 'about' | 'projects' | 'guestbook'

/** 맵 평면 좌표 [x, z]. 렌더 시 y는 고정한다. */
export type Coord = readonly [number, number]

export interface Section {
  id: SectionId
  /** 표지판·미니맵에 쓰는 섹션 이름. */
  label: string
  /** 임시 대표 색(플레이스홀더). 실제 아트는 이후 교체. */
  color: string
  /** 허브에서 이 섹션의 길이 뻗는 방향(단위 벡터 근사, [x, z]). 표지판 화살표·길 배치 참고. */
  direction: Coord
}

export interface Station {
  id: string
  sectionId: SectionId
  /** 스테이션 이름(미리보기·상세 제목). 색은 소속 섹션에서 가져온다. */
  label: string
  /** 미니맵 등 좁은 곳에 쓰는 짧은 이름. */
  short: string
  /** 맵 배치 좌표 [x, z]. */
  position: Coord
}

export interface SignpostArrow {
  /** 이 방향에 무엇이 있는지 안내 문구. */
  label: string
  /** 가리키는 섹션. 방향은 해당 섹션의 direction을 따른다. */
  sectionId: SectionId
}

export interface Signpost {
  id: string
  position: Coord
  /** 갈림길에서 가리키는 안내들. */
  arrows: SignpostArrow[]
}

/** 모든 길이 갈라지는 중앙 광장(캐릭터 시작점). */
export const HUB: Coord = [0, 0]

export const SECTIONS: Section[] = [
  { id: 'about', label: 'About', color: '#f0a6ca', direction: [0, -1] },
  { id: 'projects', label: 'Projects', color: '#8ab6d6', direction: [1, 0] },
  { id: 'guestbook', label: 'Guestbook', color: '#a8d5ba', direction: [0, 1] },
]

export const STATIONS: Station[] = [
  // About 길 (-Z 방향) — 3개
  { id: 'about-intro', sectionId: 'about', label: 'Intro & Skills', short: 'Intro', position: [0, -8] },
  { id: 'about-career', sectionId: 'about', label: 'Experience & Education', short: 'Career', position: [0, -15] },
  { id: 'about-award', sectionId: 'about', label: 'Awards & Certifications', short: 'Award', position: [0, -22] },

  // Projects 길 (+X 방향) — 프로젝트마다 1개 (현재 플레이스홀더 3개)
  { id: 'project-1', sectionId: 'projects', label: 'Project 1', short: 'Proj 1', position: [8, 0] },
  { id: 'project-2', sectionId: 'projects', label: 'Project 2', short: 'Proj 2', position: [15, 0] },
  { id: 'project-3', sectionId: 'projects', label: 'Project 3', short: 'Proj 3', position: [22, 0] },

  // Guestbook 길 (+Z 방향) — 1개
  { id: 'guestbook', sectionId: 'guestbook', label: 'Guestbook', short: 'Guest', position: [0, 10] },
]

/** 중앙 광장의 3방향 안내 표지판. 각 화살표는 소속 섹션의 direction을 향한다. */
export const SIGNPOSTS: Signpost[] = [
  {
    id: 'hub',
    position: [3, 3],
    arrows: [
      { label: 'About', sectionId: 'about' },
      { label: 'Projects', sectionId: 'projects' },
      { label: 'Guestbook', sectionId: 'guestbook' },
    ],
  },
]

const SECTION_BY_ID: Record<SectionId, Section> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, Section>

/** id로 섹션을 조회한다(색·방향 등 참조용). */
export const getSection = (id: SectionId): Section => SECTION_BY_ID[id]
