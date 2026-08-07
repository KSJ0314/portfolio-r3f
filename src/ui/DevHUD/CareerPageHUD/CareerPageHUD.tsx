import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import {
  CAREER_AREA,
  CAREER_LOGO,
  CAREER_TITLE,
  CAREER_TOP_CENTER,
} from '../../../stations/sections/about/AboutCareer/AboutCareer.constants'
import {
  CAREER_EDUCATION,
  CAREER_SPEC,
} from '../../../stations/sections/about/AboutCareer/CareerPaper/CareerPaper.constants'
import { CAREER_TROPHY } from '../../../stations/sections/about/AboutCareer/CareerTrophy/CareerTrophy.constants'
import { useCareerPageStore } from '../../../state/useCareerPageStore'

const A = CAREER_AREA
const T = CAREER_TOP_CENTER
const TR = CAREER_TROPHY
const ED = CAREER_EDUCATION
const SP = CAREER_SPEC
const LO = CAREER_LOGO
const TI = CAREER_TITLE

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * Career 영역을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을
 * `src/stations/sections/about/AboutCareer/AboutCareer.constants.ts`의 기본값에 반영해 확정한다.
 */
export function CareerPageHUD() {
  const setArea = useCareerPageStore((s) => s.setArea)
  const setTopCenter = useCareerPageStore((s) => s.setTopCenter)
  const setShowOutline = useCareerPageStore((s) => s.setShowOutline)
  const setTrophy = useCareerPageStore((s) => s.setTrophy)
  const setEducation = useCareerPageStore((s) => s.setEducation)
  const setSpec = useCareerPageStore((s) => s.setSpec)
  const setLogo = useCareerPageStore((s) => s.setLogo)
  const setTitle = useCareerPageStore((s) => s.setTitle)

  const [values, set] = useControls(
    'Career 영역',
    () => ({
      영역: folder({
        width: {
          value: A.width,
          min: 2,
          max: 40,
          step: 0.5,
          label: '가로크기',
          hint: hint('영역의 가로 길이(월드 유닛). 상단 중앙을 가운데 두고 양옆으로 늘어난다.', A.width),
        },
        height: {
          value: A.height,
          min: 2,
          max: 30,
          step: 0.5,
          label: '세로크기',
          hint: hint('영역의 세로 길이(월드 유닛). 상단 중앙을 기준으로 아래로 늘어난다.', A.height),
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
          hint: `영역 상단 중앙(월드 x, z).\n기본값: (${T.x}, ${T.z})`,
        },
      }, { collapsed: true }),
      트로피: folder({
        trophyHeight: {
          value: TR.height,
          min: 0.2,
          max: 12,
          step: 0.1,
          label: '세로크기',
          hint: hint('모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다.', TR.height),
        },
        trophyPosition: {
          value: { x: TR.x, z: TR.z },
          step: 0.1,
          joystick: false,
          label: '좌표',
          hint: `영역 중심 기준 오프셋(월드 x, z).\n기본값: (${TR.x}, ${TR.z})`,
        },
        trophyRotation: {
          value: TR.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 양수가 반시계다.', TR.rotation),
        },
        trophyLogoTurn: {
          value: TR.logoTurn,
          min: -180,
          max: 180,
          step: 1,
          label: '로고 회전',
          hint: hint('로고가 될 때의 y축 회전(도). 눕히기 전에 먼저 돌아 정면을 맞춘다.', TR.logoTurn),
        },
        trophyLogoTilt: {
          value: TR.logoTilt,
          min: -180,
          max: 180,
          step: 1,
          label: '로고 눕힘',
          hint: hint('로고가 될 때 눕히는 각도(도, x축).', TR.logoTilt),
        },
        trophyLogoRoll: {
          value: TR.logoRoll,
          min: -180,
          max: 180,
          step: 1,
          label: '로고 화면 회전',
          hint: hint('눕힌 뒤 화면 안에서 도는 각도(도). 음수가 시계방향이다.', TR.logoRoll),
        },
        trophyLogoTurns: {
          value: TR.logoTurns,
          min: -6,
          max: 6,
          step: 1,
          label: '로고 추가 회전',
          hint: hint(
            '로고로 가는 동안 더 도는 반 바퀴 수. 앞뒤가 같은 모델이라 반 바퀴도 도착 자세가 같다.',
            TR.logoTurns,
          ),
        },
        trophyShadowAngle: {
          value: TR.shadowAngle,
          min: -180,
          max: 180,
          step: 1,
          label: '그림자 방향',
          hint: hint('바닥 그림자가 뻗는 방향(도). 0이면 모델 뒤쪽으로 눕는다.', TR.shadowAngle),
        },
        trophyShadowLength: {
          value: TR.shadowLength,
          min: 0,
          max: 3,
          step: 0.05,
          label: '그림자 길이',
          hint: hint('길이 배수. 1이면 세운 높이 그대로 눕힌 길이다.', TR.shadowLength),
        },
        trophyShadowOpacity: {
          value: TR.shadowOpacity,
          min: 0,
          max: 1,
          step: 0.01,
          label: '그림자 진하기',
          hint: hint('바닥 그림자의 불투명도.', TR.shadowOpacity),
        },
      }, { collapsed: true }),
      교육: folder({
        educationHeight: {
          value: ED.height,
          min: 0.5,
          max: 12,
          step: 0.1,
          label: '세로크기',
          hint: hint('그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다.', ED.height),
        },
        educationPosition: {
          value: { x: ED.x, z: ED.z },
          step: 0.1,
          joystick: false,
          label: '좌표',
          hint: `영역 중심 기준 오프셋(월드 x, z).\n기본값: (${ED.x}, ${ED.z})`,
        },
        educationRotation: {
          value: ED.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('눕힌 종이의 회전(도). 양수가 반시계다.', ED.rotation),
        },
        educationBorder: {
          value: ED.border,
          min: 0,
          max: 0.15,
          step: 0.005,
          label: '테두리 폭',
          hint: hint('오려낸 종이 여백의 폭. 그림 짧은 변 대비 비율이다.', ED.border),
        },
      }, { collapsed: true }),
      자격증: folder({
        specHeight: {
          value: SP.height,
          min: 0.5,
          max: 12,
          step: 0.1,
          label: '세로크기',
          hint: hint('그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다.', SP.height),
        },
        specPosition: {
          value: { x: SP.x, z: SP.z },
          step: 0.1,
          joystick: false,
          label: '좌표',
          hint: `영역 중심 기준 오프셋(월드 x, z).\n기본값: (${SP.x}, ${SP.z})`,
        },
        specRotation: {
          value: SP.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('눕힌 종이의 회전(도). 양수가 반시계다.', SP.rotation),
        },
        specBorder: {
          value: SP.border,
          min: 0,
          max: 0.15,
          step: 0.005,
          label: '테두리 폭',
          hint: hint('오려낸 종이 여백의 폭. 그림 짧은 변 대비 비율이다.', SP.border),
        },
      }, { collapsed: true }),
      로고: folder({
        logoHeight: {
          value: LO.height,
          min: 0.1,
          max: 4,
          step: 0.05,
          label: '로고 높이',
          hint: hint('로고의 세로 크기(월드 유닛). 셋이 이 높이로 맞춰 줄어든다.', LO.height),
        },
        logoTop: {
          value: LO.top,
          min: 0,
          max: 6,
          step: 0.1,
          label: '위 여백',
          hint: hint('영역 위 테두리에서 로고 중심까지 내려오는 거리.', LO.top),
        },
        logoLeft: {
          value: LO.left,
          min: 0,
          max: 4,
          step: 0.1,
          label: '좌 여백',
          hint: hint('칸 왼쪽 테두리에서 로고 왼쪽 끝까지 들이는 거리.', LO.left),
        },
      }, { collapsed: true }),
      제목: folder({
        titleSize: {
          value: TI.size,
          min: 0.1,
          max: 3,
          step: 0.05,
          label: '글자 크기',
          hint: hint('칸 제목의 손글씨 크기(월드 유닛).', TI.size),
        },
        titleGap: {
          value: TI.gap,
          min: 0,
          max: 6,
          step: 0.1,
          label: '로고와의 간격',
          hint: hint('로고 중심에서 오른쪽으로 띄우는 거리.', TI.gap),
        },
        titleOffsetY: {
          value: TI.offsetY,
          min: -3,
          max: 3,
          step: 0.1,
          label: '세로 보정',
          hint: hint('양수면 위로 올라간다.', TI.offsetY),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Career 영역',
    {
      '값 복사(JSON)': button(() => {
        const state = useCareerPageStore.getState()
        const { area, topCenter, trophy, education, spec, logo, title } = state
        const json = JSON.stringify(
          { area, topCenter, trophy, education, spec, logo, title },
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
          trophyHeight: TR.height,
          trophyPosition: { x: TR.x, z: TR.z },
          trophyRotation: TR.rotation,
          trophyLogoTurn: TR.logoTurn,
          trophyLogoTilt: TR.logoTilt,
          trophyLogoRoll: TR.logoRoll,
          trophyLogoTurns: TR.logoTurns,
          trophyShadowAngle: TR.shadowAngle,
          trophyShadowLength: TR.shadowLength,
          trophyShadowOpacity: TR.shadowOpacity,
          educationHeight: ED.height,
          educationPosition: { x: ED.x, z: ED.z },
          educationRotation: ED.rotation,
          educationBorder: ED.border,
          specHeight: SP.height,
          specPosition: { x: SP.x, z: SP.z },
          specRotation: SP.rotation,
          specBorder: SP.border,
          logoHeight: LO.height,
          logoTop: LO.top,
          logoLeft: LO.left,
          titleSize: TI.size,
          titleGap: TI.gap,
          titleOffsetY: TI.offsetY,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    const { width, height, showOutline, position } = values
    setArea({ width, height })
    setTopCenter({ x: position.x, z: position.z })
    setShowOutline(showOutline)
  }, [values, setArea, setTopCenter, setShowOutline])

  useEffect(() => {
    const { trophyHeight, trophyPosition, trophyRotation } = values
    const { trophyLogoTurn, trophyLogoTilt, trophyLogoRoll, trophyLogoTurns } = values
    const { trophyShadowAngle, trophyShadowLength, trophyShadowOpacity } = values
    setTrophy({
      height: trophyHeight,
      x: trophyPosition.x,
      z: trophyPosition.z,
      rotation: trophyRotation,
      logoTurn: trophyLogoTurn,
      logoTilt: trophyLogoTilt,
      logoRoll: trophyLogoRoll,
      logoTurns: trophyLogoTurns,
      shadowAngle: trophyShadowAngle,
      shadowLength: trophyShadowLength,
      shadowOpacity: trophyShadowOpacity,
    })
  }, [values, setTrophy])

  useEffect(() => {
    const { educationHeight, educationPosition, educationRotation, educationBorder } = values
    setEducation({
      height: educationHeight,
      x: educationPosition.x,
      z: educationPosition.z,
      rotation: educationRotation,
      border: educationBorder,
    })
  }, [values, setEducation])

  useEffect(() => {
    const { specHeight, specPosition, specRotation, specBorder } = values
    setSpec({
      height: specHeight,
      x: specPosition.x,
      z: specPosition.z,
      rotation: specRotation,
      border: specBorder,
    })
  }, [values, setSpec])

  useEffect(() => {
    const { logoHeight, logoTop, logoLeft } = values
    setLogo({ height: logoHeight, top: logoTop, left: logoLeft })
  }, [values, setLogo])

  useEffect(() => {
    const { titleSize, titleGap, titleOffsetY } = values
    setTitle({ size: titleSize, gap: titleGap, offsetY: titleOffsetY })
  }, [values, setTitle])

  return null
}
