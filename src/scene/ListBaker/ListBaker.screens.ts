import { useMemo } from 'react'
import { getStation } from '../../content/stations'
import { useCareerPageStore } from '../../state/useCareerPageStore'
import { useSkillsPageStore } from '../../state/useSkillsPageStore'
import { DEFAULT_INTRO_PAGE_AREA } from '../../stations/sections/about/AboutIntro/AboutIntro.constants'
import { SKILL_PAGES } from '../../stations/sections/about/AboutSkills'
import { projectPages } from '../../stations/sections/projects/contents'
import type { GalleryProject } from '../../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import { PAGE_HEIGHT, SCREEN_GAP_X, fitZoom } from './ListBaker.constants'
import type { ListScreen, ListScreenKind } from './ListBaker.types'

/** 프로젝트를 표시 순서대로. 순서 값이 같으면 문서 id로 갈라 매번 같은 차례가 나온다. */
export function sortProjects(projects: readonly GalleryProject[]): GalleryProject[] {
  return [...projects].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

/**
 * 늘어놓을 화면 목록.
 *
 * 화면마다 **자기 영역이 16:9에 최대로 들어가는 배율**을 갖는다. 영역 비율이 16:9와 달라도
 * 작게 찍히지 않고, 남는 쪽이 여백으로 남아 가운데 정렬된다.
 *
 * 화면은 한 씬에 한 줄로 떼어 세우고 찍을 때는 카메라만 옮긴다 — 그래서 어디에 세울지(`offsetX`)와
 * 어디를 찍을지(`x`·`z`)를 여기 한자리에서 정한다. 따로 세면 카메라가 엉뚱한 자리를 찍는다.
 *
 * 프로젝트 화면 수는 문서 개수와 각 프로젝트의 장수에서 나오므로 프로젝트가 늘면 따라 는다.
 */
export function useListScreens(projects: readonly GalleryProject[]): ListScreen[] {
  const skillsArea = useSkillsPageStore((s) => s.area)
  const skillsTopLeft = useSkillsPageStore((s) => s.topLeft)
  const careerArea = useCareerPageStore((s) => s.area)
  const careerTopCenter = useCareerPageStore((s) => s.topCenter)

  return useMemo(() => {
    const screens: ListScreen[] = []

    /** 다음 자리에 한 장을 더한다. `natural`은 내용이 원래 놓인 중심이다. */
    const add = (
      id: string,
      kind: ListScreenKind,
      natural: readonly [number, number],
      size: { width: number; height: number },
    ) => {
      const offsetX = screens.length * SCREEN_GAP_X
      screens.push({
        id,
        kind,
        offsetX,
        x: natural[0] + offsetX,
        z: natural[1],
        zoom: fitZoom(size.width, size.height),
      })
    }

    const intro = getStation('about-intro')
    if (intro?.position) {
      add('intro', { type: 'intro' }, intro.position, DEFAULT_INTRO_PAGE_AREA)
    }

    const skillsCenter = [
      skillsTopLeft.x + skillsArea.width / 2,
      skillsTopLeft.z + skillsArea.height / 2,
    ] as const
    SKILL_PAGES.forEach((_, page) => {
      add(`skills-${page}`, { type: 'skills', page }, skillsCenter, skillsArea)
    })

    const careerCenter = [careerTopCenter.x, careerTopCenter.z + careerArea.height / 2] as const
    add('career', { type: 'career' }, careerCenter, careerArea)

    for (const project of sortProjects(projects)) {
      const pages = projectPages(project.key)
      pages.forEach((_, page) => {
        add(
          `project-${project.id}-${page}`,
          { type: 'project', project, page },
          [0, 0],
          { width: 1, height: PAGE_HEIGHT },
        )
      })
    }

    return screens
  }, [projects, skillsArea, skillsTopLeft, careerArea, careerTopCenter])
}
