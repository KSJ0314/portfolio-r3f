import { useEffect } from 'react'
import { getStation } from '../../../content/stations'
import { useCareerPageStore } from '../../../state/useCareerPageStore'
import { useCareerSequenceStore } from '../../../state/useCareerSequenceStore'
import { useSkillsPageStore } from '../../../state/useSkillsPageStore'
import { useSkillsSequenceStore } from '../../../state/useSkillsSequenceStore'
import { AboutIntroInactive } from '../../../stations/sections/about/AboutIntro'
import {
  CareerColumns,
  CareerFigures,
  CareerTitles,
} from '../../../stations/sections/about/AboutCareer'
import { SkillsBox, SkillsPages, SkillsTitle } from '../../../stations/sections/about/AboutSkills'
import { projectPages } from '../../../stations/sections/projects/contents'
import { LIST_BACKGROUND, PAGE_HEIGHT } from '../ListView.constants'
import type { ListScreen } from '../ListView.types'
import type { ListBakerContentProps, ListProjectScreenProps, SkillsScreenProps } from './ListBaker.types'

const SKILLS_ID = 'about-skills'
const INTRO_ID = 'about-intro'

/** Intro 한 화면. 다른 화면과 같이 바탕은 흰색이라 모눈종이를 깔지 않는다. */
function IntroScreen() {
  const station = getStation(INTRO_ID)
  if (!station?.position) return null

  return (
    <group position={[station.position[0], 0, station.position[1]]}>
      <AboutIntroInactive station={station} />
    </group>
  )
}

/** Skills 한 쪽. 쪽을 넘기지 않고 쪽마다 한 장이라 사본을 따로 세운다. */
function SkillsScreen({ page }: SkillsScreenProps) {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)

  return (
    <>
      {/* 공구함은 영역 중심 기준 좌표라 그 자리에 놓는다. 로고 자세는 스스로 신호를 보고 잡는다. */}
      <group position={[topLeft.x + area.width / 2, 0, topLeft.z + area.height / 2]}>
        <SkillsBox stationId={SKILLS_ID} />
      </group>
      <SkillsTitle />
      <SkillsPages page={page} showPager={false} />
    </>
  )
}

/** Career 한 화면 — 로고 줄과 세 칸. */
function CareerScreen() {
  const area = useCareerPageStore((s) => s.area)
  const topCenter = useCareerPageStore((s) => s.topCenter)

  return (
    <>
      <group position={[topCenter.x, 0, topCenter.z + area.height / 2]}>
        <CareerFigures />
      </group>
      <CareerTitles />
      <CareerColumns />
    </>
  )
}

/**
 * 프로젝트 페이지 한 장. 안쪽이 가로 1 기준 정규화 좌표라 방 모델 없이 판만 세워도 배치가 같다.
 * 종이 위 화면과 달리 눕혀 두므로, 위에서 내려다보는 같은 카메라로 찍힌다.
 */
function ProjectScreen({ project, page }: ListProjectScreenProps) {
  const pages = projectPages(project.key)
  const Page = pages[page]
  if (!Page) return null

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[1, PAGE_HEIGHT]} />
        <meshBasicMaterial color={LIST_BACKGROUND} toneMapped={false} />
      </mesh>
      <Page project={project} height={PAGE_HEIGHT} index={page} total={pages.length} />
    </group>
  )
}

/** 한 장의 내용. 자리는 밖에서 밀어 두므로 여기서는 무엇을 그릴지만 고른다. */
function Screen({ screen }: { screen: ListScreen }) {
  const { kind } = screen
  switch (kind.type) {
    case 'intro':
      return <IntroScreen />
    case 'skills':
      return <SkillsScreen page={kind.page} />
    case 'career':
      return <CareerScreen />
    case 'project':
      return <ProjectScreen project={kind.project} page={kind.page} />
  }
}

/**
 * 그림을 로고 자리로 물린다.
 *
 * 그림들보다 **뒤에** 두어야 한다 — 각 그림이 신호를 구독한 뒤에 켜야 그 변화를 받는다.
 */
function LogoTurn() {
  useEffect(() => {
    useSkillsSequenceStore.getState().setLogoTurn(true)
    useCareerSequenceStore.getState().setLogoTurn(true)
    return () => {
      useSkillsSequenceStore.getState().setLogoTurn(false)
      useCareerSequenceStore.getState().setLogoTurn(false)
    }
  }, [])
  return null
}

/** 이 경계 안이 전부 그려졌음을 알린다. 서스펜드하는 것이 하나라도 있으면 여기까지 커밋되지 않는다. */
function ReadyMark({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady])
  return null
}

/**
 * 굽기용 씬의 내용 — 늘어놓을 화면을 한 줄로 떼어 세운다.
 *
 * **3D가 쓰는 컴포넌트를 그대로** 쓰고, 찍을 때는 카메라만 옮긴다. 굽기 전용으로 다시 그리지 않아
 * 맵에서 보던 배치와 같다. 다만 바탕은 모눈종이가 아니라 흰색이다.
 * 나가기·페이지 넘김은 조작 요소라 두지 않는다.
 */
export function ListBakerContent({ screens, onReady }: ListBakerContentProps) {
  return (
    <>
      {screens.map((screen) => (
        <group key={screen.id} position={[screen.offsetX, 0, 0]}>
          <Screen screen={screen} />
        </group>
      ))}

      <LogoTurn />
      <ReadyMark onReady={onReady} />
    </>
  )
}
