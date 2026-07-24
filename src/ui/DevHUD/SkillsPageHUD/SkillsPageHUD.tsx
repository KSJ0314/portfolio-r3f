import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import {
  SKILLS_AREA,
  SKILLS_TOP_LEFT,
} from '../../../stations/sections/about/AboutSkills/AboutSkills.constants'
import { useSkillsPageStore } from '../../../state/useSkillsPageStore'

const A = SKILLS_AREA
const T = SKILLS_TOP_LEFT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * Skills 영역을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을
 * `src/stations/sections/about/AboutSkills/AboutSkills.constants.ts`의 기본값에 반영해 확정한다.
 */
export function SkillsPageHUD() {
  const setArea = useSkillsPageStore((s) => s.setArea)
  const setTopLeft = useSkillsPageStore((s) => s.setTopLeft)
  const setShowOutline = useSkillsPageStore((s) => s.setShowOutline)

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
      }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Skills 영역',
    {
      '값 복사(JSON)': button(() => {
        const { area, topLeft } = useSkillsPageStore.getState()
        const json = JSON.stringify({ area, topLeft }, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({ width: A.width, height: A.height, showOutline: false, position: { x: T.x, z: T.z } }),
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

  return null
}
