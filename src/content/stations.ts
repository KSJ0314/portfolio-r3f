/**
 * 스테이션 배치 데이터 (단일 소스).
 *
 * 여기 담기는 것은 스테이션의 "공통 배치 정보"뿐이다 — 위치·섹션 소속·이름.
 * 스테이션의 비활성 상태와 활성화 연출은 데이터가 아니라
 * `스테이션 id → 전용 컴포넌트` 레지스트리로 스테이션마다 따로 구현한다. (DECISIONS 006)
 *
 * 이 데이터를 렌더(Stations)·미니맵·근접 감지가 공유한다.
 * 좌표는 `CAMERA_BOUNDS`(useCameraStore) 안에서 주제별로 흩어 둔 오픈월드 배치이며 임시다.
 * 스테이션 최종 배치·스케일은 각 스테이션 상세 구현(Phase 8)에서 정한다.
 */

import { SKILLS_CENTER } from '../stations/sections/about/AboutSkills/AboutSkills.constants'
import type { CollectionName } from '../lib/firebase/firestore'

/** 섹션 식별자. */
export type SectionId = 'about' | 'projects' | 'guestbook'

/** 맵 평면 좌표 [x, z]. 렌더 시 y는 고정한다. */
export type Coord = readonly [number, number]

export interface Section {
  id: SectionId
  /** 미니맵 등에 쓰는 섹션 이름. */
  label: string
  /** 임시 대표 색(플레이스홀더). 실제 아트는 이후 교체. */
  color: string
}

export interface Station {
  id: string
  sectionId: SectionId
  /** 스테이션 이름(미리보기·상세 제목). 색은 소속 섹션에서 가져온다. */
  label: string
  /** 미니맵 등 좁은 곳에 쓰는 짧은 이름. */
  short: string
  /**
   * 맵 배치 좌표 [x, z]. 자리가 정해진 스테이션만 갖는다.
   * 없으면 아직 종이 위에 놓일 자리가 정해지지 않은 것이라 씬·지도에 나오지 않는다.
   */
  position?: Coord
  /** 활성화되면 읽어올 Firestore 컬렉션들. 데이터 활용은 스테이션 상세 구현에서. */
  collections: CollectionName[]
}

export const SECTIONS: Section[] = [
  { id: 'about', label: 'About', color: '#f0a6ca' },
  { id: 'projects', label: 'Projects', color: '#8ab6d6' },
  { id: 'guestbook', label: 'Guestbook', color: '#a8d5ba' },
]

// about-intro는 사이트 첫 화면을 겸하므로 원점에 둔다.
// 자리를 정한 스테이션만 좌표를 갖는다 — 나머지는 상세 구현에서 영역과 함께 정한다.
export const STATIONS: Station[] = [
  // About — 4개
  { id: 'about-intro', sectionId: 'about', label: 'Intro', short: 'Intro', position: [0, 0], collections: ['profile'] },
  { id: 'about-skills', sectionId: 'about', label: 'Skills', short: 'Skills', position: SKILLS_CENTER, collections: ['skills'] },
  { id: 'about-career', sectionId: 'about', label: 'Experience & Education', short: 'Career', collections: ['experiences', 'education', 'spec'] },
  { id: 'about-award', sectionId: 'about', label: 'Awards & Certifications', short: 'Award', collections: ['awards'] },

  // Projects — 프로젝트마다 1개 (현재 플레이스홀더 3개)
  { id: 'project-1', sectionId: 'projects', label: 'Project 1', short: 'Proj 1', collections: ['projects'] },
  { id: 'project-2', sectionId: 'projects', label: 'Project 2', short: 'Proj 2', collections: ['projects'] },
  { id: 'project-3', sectionId: 'projects', label: 'Project 3', short: 'Proj 3', collections: ['projects'] },

  // Guestbook — 1개
  { id: 'guestbook', sectionId: 'guestbook', label: 'Guestbook', short: 'Guest', collections: ['guestbook'] },
]

const SECTION_BY_ID: Record<SectionId, Section> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, Section>

/** id로 섹션을 조회한다(색·이름 등 참조용). */
export const getSection = (id: SectionId): Section => SECTION_BY_ID[id]

const STATION_BY_ID: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

/** id로 스테이션을 조회한다(없으면 undefined). */
export const getStation = (id: string): Station | undefined => STATION_BY_ID[id]
