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
import { GUIDE_ARROW_PLACEMENT } from '../../../stations/sections/about/AboutSkills/SkillsGuideArrow/SkillsGuideArrow.constants'
import { useSkillsPageStore } from '../../../state/useSkillsPageStore'

const A = SKILLS_AREA
const T = SKILLS_TOP_LEFT
const B = SKILLS_BOX_PLACEMENT
const L = SKILLS_BOX_LOGO
const G = GUIDE_ARROW_PLACEMENT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * Skills 영역과 안내 화살표를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
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
  const setGuide = useSkillsPageStore((s) => s.setGuide)
  const redrawGuide = useSkillsPageStore((s) => s.redrawGuide)

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
      '안내 화살표': folder({
        arrowScale: {
          value: G.scale,
          min: 0.2,
          max: 20,
          step: 0.1,
          label: '크기',
          hint: hint('기준 크기에 곱하는 배율. 획 굵기도 같이 커져 그림째 확대된다.', G.scale),
        },
        arrowPosition: {
          value: { x: G.x, z: G.z },
          step: 0.5,
          joystick: false,
          label: '좌표',
          hint: `그림 좌상단 꼭지점(월드 x, z). 캐릭터 시작 위치가 기본값이다.\n기본값: (${G.x}, ${G.z})`,
        },
        arrowRotation: {
          value: G.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 좌상단 꼭지점을 축으로 돈다.', G.rotation),
        },
        arrowSeconds: {
          value: G.seconds,
          min: 0.2,
          max: 6,
          step: 0.1,
          label: '그리는 시간',
          hint: hint('처음부터 끝까지 그어지는 데 걸리는 시간(초).', G.seconds),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Skills 영역',
    {
      '화살표 다시 그리기': button(() => redrawGuide()),
      '값 복사(JSON)': button(() => {
        const { area, topLeft, box, logo, guide } = useSkillsPageStore.getState()
        const json = JSON.stringify({ area, topLeft, box, logo, guide }, null, 2)
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
          arrowScale: G.scale,
          arrowPosition: { x: G.x, z: G.z },
          arrowRotation: G.rotation,
          arrowSeconds: G.seconds,
        }),
      ),
    },
    [set, redrawGuide],
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
    const { arrowScale, arrowPosition, arrowRotation, arrowSeconds } = values
    setGuide({
      scale: arrowScale,
      x: arrowPosition.x,
      z: arrowPosition.z,
      rotation: arrowRotation,
      seconds: arrowSeconds,
    })
  }, [values, setGuide])

  return null
}
