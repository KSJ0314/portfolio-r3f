import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import {
  SKILLS_AREA,
  SKILLS_TOP_LEFT,
} from '../../../stations/sections/about/AboutSkills/AboutSkills.constants'
import {
  SKILLS_BOX_LOGO,
  SKILLS_BOX_PLACEMENT,
} from '../../../stations/sections/about/AboutSkills/SkillsBox/SkillsBox.constants'
import { SKILLS_EXIT } from '../../../stations/sections/about/AboutSkills/SkillsExit/SkillsExit.constants'
import { SKILLS_PAGER } from '../../../stations/sections/about/AboutSkills/SkillsPager/SkillsPager.constants'
import { SKILLS_LEVEL } from '../../../stations/sections/about/AboutSkills/SkillsPages/SkillItem/SkillLevel/SkillLevel.constants'
import { SKILLS_LIST_LAYOUT } from '../../../stations/sections/about/AboutSkills/SkillsPages/SkillsPages.constants'
import { SKILLS_TITLE } from '../../../stations/sections/about/AboutSkills/SkillsTitle/SkillsTitle.constants'
import { useSkillsPageStore } from '../../../state/useSkillsPageStore'

const A = SKILLS_AREA
const T = SKILLS_TOP_LEFT
const B = SKILLS_BOX_PLACEMENT
const L = SKILLS_BOX_LOGO
const TI = SKILLS_TITLE
const LI = SKILLS_LIST_LAYOUT
const LV = SKILLS_LEVEL
const P = SKILLS_PAGER
const E = SKILLS_EXIT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * Skills 영역과 그 위 요소들을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을
 * `src/stations/sections/about/AboutSkills/AboutSkills.constants.ts`의 기본값에 반영해 확정한다.
 */
export function SkillsPageHUD() {
  const setArea = useSkillsPageStore((s) => s.setArea)
  const setTopLeft = useSkillsPageStore((s) => s.setTopLeft)
  const setShowOutline = useSkillsPageStore((s) => s.setShowOutline)
  const setBox = useSkillsPageStore((s) => s.setBox)
  const setLogo = useSkillsPageStore((s) => s.setLogo)
  const setTitle = useSkillsPageStore((s) => s.setTitle)
  const setList = useSkillsPageStore((s) => s.setList)
  const setLevel = useSkillsPageStore((s) => s.setLevel)
  const setPager = useSkillsPageStore((s) => s.setPager)
  const setExit = useSkillsPageStore((s) => s.setExit)

  const [values, set] = useControls(
    'Skills 영역',
    () => ({
      영역: folder({
        width: {
          value: A.width,
          min: 2,
          max: 40,
          step: 0.5,
          label: '가로크기',
          hint: hint('영역의 가로 길이(월드 유닛). 좌상단을 기준으로 오른쪽으로 늘어난다.', A.width),
        },
        height: {
          value: A.height,
          min: 2,
          max: 30,
          step: 0.5,
          label: '세로크기',
          hint: hint('영역의 세로 길이(월드 유닛). 좌상단을 기준으로 아래로 늘어난다.', A.height),
        },
        showOutline: {
          value: false,
          label: '테두리 표시',
          hint: '영역 범위를 눈으로 확인하는 테두리.\n기본값: 끔',
        },
        position: {
          value: { x: T.x, z: T.z },
          step: 0.5,
          joystick: false,
          label: '좌표',
          hint: `영역 좌상단 꼭지점(월드 x, z).\n기본값: (${T.x}, ${T.z})`,
        },
      }, { collapsed: true }),
      공구함: folder({
        boxHeight: {
          value: B.height,
          min: 1,
          max: 20,
          step: 0.1,
          label: '세로크기',
          hint: hint('그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다.', B.height),
        },
        boxPosition: {
          value: { x: B.x, z: B.z },
          step: 0.1,
          joystick: false,
          label: '좌표',
          hint: `영역 중심 기준 오프셋(월드 x, z).\n기본값: (${B.x}, ${B.z})`,
        },
        boxBorder: {
          value: B.border,
          min: 0,
          max: 0.15,
          step: 0.005,
          label: '테두리 폭',
          hint: hint('오려낸 종이 여백의 폭. 그림 짧은 변 대비 비율이라 크기를 바꿔도 유지된다.', B.border),
        },
        boxShadowBlur: {
          value: B.shadowBlur,
          min: 0,
          max: 0.1,
          step: 0.005,
          label: '그림자 흐림',
          hint: hint('그림자가 번지는 폭(같은 비율 기준).', B.shadowBlur),
        },
        boxShadowDistance: {
          value: B.shadowDistance,
          min: 0,
          max: 0.08,
          step: 0.002,
          label: '그림자 거리',
          hint: hint('그림자가 오른쪽·아래로 밀리는 거리(같은 비율 기준).', B.shadowDistance),
        },
        boxShadowOpacity: {
          value: B.shadowOpacity,
          min: 0,
          max: 1,
          step: 0.01,
          label: '그림자 진하기',
          hint: hint('그림자 색의 불투명도. 높을수록 종이가 많이 들뜬 인상이 된다.', B.shadowOpacity),
        },
      }, { collapsed: true }),
      '공구함 로고': folder({
        logoScale: {
          value: L.scale,
          min: 0.1,
          max: 1,
          step: 0.05,
          label: '크기 배율',
          hint: hint('활성 상태에서 평소 크기에 곱하는 배율.', L.scale),
        },
        logoPosition: {
          value: { x: L.x, z: L.z },
          step: 0.1,
          joystick: false,
          label: '여백',
          hint: `영역 좌상단에서 안쪽으로 들이는 거리(월드 x, z). 그림 중심 기준이다.\n기본값: (${L.x}, ${L.z})`,
        },
        logoRotation: {
          value: L.rotation,
          min: -45,
          max: 45,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 양수가 반시계다.', L.rotation),
        },
      }, { collapsed: true }),
      제목: folder({
        titleSize: {
          value: TI.size,
          min: 0.1,
          max: 3,
          step: 0.05,
          label: '글자 크기',
          hint: hint('로고 옆 손글씨 제목의 글자 크기(월드 유닛).', TI.size),
        },
        titleGap: {
          value: TI.gap,
          min: 0,
          max: 6,
          step: 0.1,
          label: '간격',
          hint: hint('로고 중심에서 오른쪽으로 띄우는 거리.', TI.gap),
        },
        titleOffsetY: {
          value: TI.offsetY,
          min: -4,
          max: 4,
          step: 0.1,
          label: '세로 보정',
          hint: hint('양수면 위로 올라간다.', TI.offsetY),
        },
      }, { collapsed: true }),
      목록: folder({
        listTop: {
          value: LI.top,
          min: 0,
          max: 8,
          step: 0.1,
          label: '시작 높이',
          hint: hint('영역 위 테두리에서 목록이 시작하는 곳까지의 거리.', LI.top),
        },
        listPaddingX: {
          value: LI.paddingX,
          min: 0,
          max: 5,
          step: 0.1,
          label: '좌우 여백',
          hint: hint('영역 좌우에서 들이는 거리. 열 너비가 여기서 나온다.', LI.paddingX),
        },
        listColumnGap: {
          value: LI.columnGap,
          min: 0,
          max: 4,
          step: 0.1,
          label: '열 간격',
          hint: hint('두 열 사이 간격.', LI.columnGap),
        },
        listItemGap: {
          value: LI.itemGap,
          min: 0,
          max: 3,
          step: 0.05,
          label: '항목 간격',
          hint: hint('항목 사이 세로 간격.', LI.itemGap),
        },
        listNameSize: {
          value: LI.nameSize,
          min: 0.1,
          max: 1.5,
          step: 0.05,
          label: '이름 크기',
          hint: hint('기술 이름 글자 크기(손글씨).', LI.nameSize),
        },
        listNameGap: {
          value: LI.nameGap,
          min: 0,
          max: 1.5,
          step: 0.05,
          label: '이름-설명 간격',
          hint: hint('이름과 설명 사이 간격.', LI.nameGap),
        },
        listBodySize: {
          value: LI.bodySize,
          min: 0.08,
          max: 0.8,
          step: 0.01,
          label: '설명 크기',
          hint: hint('설명 글자 크기(본문체).', LI.bodySize),
        },
        listBodyLineHeight: {
          value: LI.bodyLineHeight,
          min: 1,
          max: 3,
          step: 0.05,
          label: '설명 줄 간격',
          hint: hint('설명 줄 간격(글자 크기 배수).', LI.bodyLineHeight),
        },
      }, { collapsed: true }),
      '레벨 별': folder({
        levelSize: {
          value: LV.size,
          min: 0.05,
          max: 1.5,
          step: 0.01,
          label: '별 크기',
          hint: hint('별 하나의 세로 크기. 가로는 그림 비율에서 나온다.', LV.size),
        },
        levelGap: {
          value: LV.gap,
          min: 0,
          max: 2,
          step: 0.05,
          label: '이름과의 간격',
          hint: hint('기술 이름 오른쪽 끝에서 첫 별까지의 거리.', LV.gap),
        },
        levelStarGap: {
          value: LV.starGap,
          min: 0,
          max: 1,
          step: 0.01,
          label: '별 간격',
          hint: hint('별 사이 간격.', LV.starGap),
        },
        levelOffsetY: {
          value: LV.offsetY,
          min: -1,
          max: 1,
          step: 0.01,
          label: '세로 보정',
          hint: hint('양수면 위로 올라간다.', LV.offsetY),
        },
        levelBorder: {
          value: LV.border,
          min: 0,
          max: 0.2,
          step: 0.005,
          label: '테두리 폭',
          hint: hint('오려낸 종이 여백의 폭. 그림 짧은 변 대비 비율이다.', LV.border),
        },
        levelShadowBlur: {
          value: LV.shadowBlur,
          min: 0,
          max: 0.1,
          step: 0.005,
          label: '그림자 흐림',
          hint: hint('그림자가 번지는 폭(같은 비율 기준).', LV.shadowBlur),
        },
        levelShadowDistance: {
          value: LV.shadowDistance,
          min: 0,
          max: 0.08,
          step: 0.002,
          label: '그림자 거리',
          hint: hint('그림자가 오른쪽·아래로 밀리는 거리(같은 비율 기준).', LV.shadowDistance),
        },
        levelShadowOpacity: {
          value: LV.shadowOpacity,
          min: 0,
          max: 1,
          step: 0.01,
          label: '그림자 진하기',
          hint: hint('그림자 색의 불투명도.', LV.shadowOpacity),
        },
      }, { collapsed: true }),
      '페이지 넘김': folder({
        pagerSize: {
          value: P.size,
          min: 0.1,
          max: 1.5,
          step: 0.05,
          label: '글자 크기',
          hint: hint('페이지 넘김 글씨의 크기.', P.size),
        },
        pagerRight: {
          value: P.right,
          min: 0,
          max: 5,
          step: 0.1,
          label: '오른쪽 여백',
          hint: hint('오른쪽 끝에서 들이는 거리.', P.right),
        },
        pagerBottom: {
          value: P.bottom,
          min: 0,
          max: 5,
          step: 0.1,
          label: '아래 여백',
          hint: hint('아래 끝에서 올리는 거리.', P.bottom),
        },
      }, { collapsed: true }),
      나가기: folder({
        exitSize: {
          value: E.size,
          min: 0.1,
          max: 2,
          step: 0.05,
          label: '아이콘 크기',
          hint: hint('X 한 변의 크기. 획 굵기도 같이 커져 그림째 확대된다.', E.size),
        },
        exitRight: {
          value: E.right,
          min: 0,
          max: 5,
          step: 0.1,
          label: '오른쪽 여백',
          hint: hint('오른쪽 끝에서 들이는 거리.', E.right),
        },
        exitTop: {
          value: E.top,
          min: 0,
          max: 5,
          step: 0.1,
          label: '위 여백',
          hint: hint('위 끝에서 내리는 거리.', E.top),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Skills 영역',
    {
      '값 복사(JSON)': button(() => {
        const state = useSkillsPageStore.getState()
        const { area, topLeft, box, logo, title, list, level, pager, exit } = state
        const json = JSON.stringify(
          { area, topLeft, box, logo, title, list, level, pager, exit },
          null,
          2,
        )
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          width: A.width,
          height: A.height,
          showOutline: false,
          position: { x: T.x, z: T.z },
          boxHeight: B.height,
          boxPosition: { x: B.x, z: B.z },
          boxBorder: B.border,
          boxShadowBlur: B.shadowBlur,
          boxShadowDistance: B.shadowDistance,
          boxShadowOpacity: B.shadowOpacity,
          logoScale: L.scale,
          logoPosition: { x: L.x, z: L.z },
          logoRotation: L.rotation,
          titleSize: TI.size,
          titleGap: TI.gap,
          titleOffsetY: TI.offsetY,
          listTop: LI.top,
          listPaddingX: LI.paddingX,
          listColumnGap: LI.columnGap,
          listItemGap: LI.itemGap,
          listNameSize: LI.nameSize,
          listNameGap: LI.nameGap,
          listBodySize: LI.bodySize,
          listBodyLineHeight: LI.bodyLineHeight,
          levelSize: LV.size,
          levelGap: LV.gap,
          levelStarGap: LV.starGap,
          levelOffsetY: LV.offsetY,
          levelBorder: LV.border,
          levelShadowBlur: LV.shadowBlur,
          levelShadowDistance: LV.shadowDistance,
          levelShadowOpacity: LV.shadowOpacity,
          pagerSize: P.size,
          pagerRight: P.right,
          pagerBottom: P.bottom,
          exitSize: E.size,
          exitRight: E.right,
          exitTop: E.top,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    const { width, height, showOutline, position } = values
    setArea({ width, height })
    setTopLeft({ x: position.x, z: position.z })
    setShowOutline(showOutline)
  }, [values, setArea, setTopLeft, setShowOutline])

  useEffect(() => {
    const { boxHeight, boxPosition, boxBorder } = values
    const { boxShadowBlur, boxShadowDistance, boxShadowOpacity } = values
    setBox({
      height: boxHeight,
      x: boxPosition.x,
      z: boxPosition.z,
      border: boxBorder,
      shadowBlur: boxShadowBlur,
      shadowDistance: boxShadowDistance,
      shadowOpacity: boxShadowOpacity,
    })
  }, [values, setBox])

  useEffect(() => {
    const { logoScale, logoPosition, logoRotation } = values
    setLogo({ scale: logoScale, x: logoPosition.x, z: logoPosition.z, rotation: logoRotation })
  }, [values, setLogo])

  useEffect(() => {
    const { titleSize, titleGap, titleOffsetY } = values
    setTitle({ size: titleSize, gap: titleGap, offsetY: titleOffsetY })
  }, [values, setTitle])

  useEffect(() => {
    const { listTop, listPaddingX, listColumnGap, listItemGap } = values
    const { listNameSize, listNameGap, listBodySize, listBodyLineHeight } = values
    setList({
      top: listTop,
      paddingX: listPaddingX,
      columnGap: listColumnGap,
      itemGap: listItemGap,
      nameSize: listNameSize,
      nameGap: listNameGap,
      bodySize: listBodySize,
      bodyLineHeight: listBodyLineHeight,
    })
  }, [values, setList])

  useEffect(() => {
    const { levelSize, levelGap, levelStarGap, levelOffsetY } = values
    const { levelBorder, levelShadowBlur, levelShadowDistance, levelShadowOpacity } = values
    setLevel({
      size: levelSize,
      gap: levelGap,
      starGap: levelStarGap,
      offsetY: levelOffsetY,
      border: levelBorder,
      shadowBlur: levelShadowBlur,
      shadowDistance: levelShadowDistance,
      shadowOpacity: levelShadowOpacity,
    })
  }, [values, setLevel])

  useEffect(() => {
    const { pagerSize, pagerRight, pagerBottom } = values
    setPager({ size: pagerSize, right: pagerRight, bottom: pagerBottom })
  }, [values, setPager])

  useEffect(() => {
    const { exitSize, exitRight, exitTop } = values
    setExit({ size: exitSize, right: exitRight, top: exitTop })
  }, [values, setExit])

  return null
}
