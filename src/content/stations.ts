/**
 * 스테이션 배치 데이터 (단일 소스).
 *
 * 여기 담기는 것은 스테이션의 "공통 배치 정보"뿐이다 — 위치·섹션 소속·이름.
 * 스테이션의 겉모습(고유 3D 오브젝트)과 활성화 시 상세 연출은 데이터가 아니라
 * `스테이션 id → 전용 컴포넌트` 레지스트리로 스테이션마다 따로 구현한다. (DECISIONS 006)
 *
 * 이 데이터를 렌더(Stations)·미니맵·근접 감지가 공유한다.
 * 좌표는 `CAMERA_BOUNDS`(useCameraStore) 안에서 주제별로 흩어 둔 오픈월드 배치이며 임시다.
 * 스테이션 최종 배치·스케일은 각 스테이션 상세 구현(Phase 8)에서 정한다.
 */

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
  /** 맵 배치 좌표 [x, z]. */
  position: Coord
  /** 활성화되면 읽어올 Firestore 컬렉션들. 데이터 활용은 스테이션 상세 구현에서. */
  collections: CollectionName[]
}

export const SECTIONS: Section[] = [
  { id: 'about', label: 'About', color: '#f0a6ca' },
  { id: 'projects', label: 'Projects', color: '#8ab6d6' },
  { id: 'guestbook', label: 'Guestbook', color: '#a8d5ba' },
]

// 현재 배치는 임시다. 주제별로 흩어 둔 것뿐이고, 최종 배치·스케일은 Phase 8에서 정한다.
export const STATIONS: Station[] = [
  // About — 3개
  { id: 'about-intro', sectionId: 'about', label: 'Intro & Skills', short: 'Intro', position: [8, 0], collections: ['profile', 'skills'] },
  { id: 'about-career', sectionId: 'about', label: 'Experience & Education', short: 'Career', position: [15, 0], collections: ['experiences', 'education', 'spec'] },
  { id: 'about-award', sectionId: 'about', label: 'Awards & Certifications', short: 'Award', position: [22, 0], collections: ['awards'] },

  // Projects — 프로젝트마다 1개 (현재 플레이스홀더 3개)
  { id: 'project-1', sectionId: 'projects', label: 'Project 1', short: 'Proj 1', position: [0, 8], collections: ['projects'] },
  { id: 'project-2', sectionId: 'projects', label: 'Project 2', short: 'Proj 2', position: [0, 15], collections: ['projects'] },
  { id: 'project-3', sectionId: 'projects', label: 'Project 3', short: 'Proj 3', position: [0, 22], collections: ['projects'] },

  // Guestbook — 1개
  { id: 'guestbook', sectionId: 'guestbook', label: 'Guestbook', short: 'Guest', position: [-10, 0], collections: ['guestbook'] },
]

const SECTION_BY_ID: Record<SectionId, Section> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, Section>

/** id로 섹션을 조회한다(색·이름 등 참조용). */
export const getSection = (id: SectionId): Section => SECTION_BY_ID[id]

const STATION_BY_ID: Record<string, Station> = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

/** id로 스테이션을 조회한다(없으면 undefined). */
export const getStation = (id: string): Station | undefined => STATION_BY_ID[id]
