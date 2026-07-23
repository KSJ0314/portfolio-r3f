import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import {
  DEFAULT_INTRO_PAGE_AREA,
  DEFAULT_INTRO_PAGE_LAYOUT,
} from '../../../stations/sections/about/AboutIntro/AboutIntro.constants'
import { useIntroPageStore } from '../../../state/useIntroPageStore'

const A = DEFAULT_INTRO_PAGE_AREA
const L = DEFAULT_INTRO_PAGE_LAYOUT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number) {
  return `${description}\n기본값: ${value}`
}

/**
 * Intro 페이지를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을
 * `src/stations/sections/about/AboutIntro/AboutIntro.constants.ts`의 기본값에 반영해 확정한다.
 */
export function IntroPageHUD() {
  const setArea = useIntroPageStore((s) => s.setArea)
  const setLayout = useIntroPageStore((s) => s.setLayout)
  const setShowOutline = useIntroPageStore((s) => s.setShowOutline)

  // 되돌리기 버튼이 패널의 값 자체를 되돌려야 하므로 함수 형태로 정의해 set을 받는다.
  const [values, set] = useControls(
    'Intro 영역',
    () => ({
      영역: folder({
        width: {
          value: A.width,
          min: 2,
          max: 40,
          step: 0.5,
          label: '가로',
          hint: hint('페이지 영역의 가로 길이(월드 유닛).', A.width),
        },
        height: {
          value: A.height,
          min: 2,
          max: 30,
          step: 0.5,
          label: '세로',
          hint: hint('페이지 영역의 세로 길이(월드 유닛).', A.height),
        },
        showOutline: {
          value: false,
          label: '테두리 표시',
          hint: '영역 범위를 눈으로 확인하는 개발용 테두리.\n기본값: 끔',
        },
      }, { collapsed: true }),
      여백: folder({
        paddingX: {
          value: L.paddingX,
          min: 0,
          max: 4,
          step: 0.05,
          label: '좌우',
          hint: hint('테두리 좌우에서 안쪽으로 비우는 여백. 내용의 가로 폭을 정한다.', L.paddingX),
        },
        paddingY: {
          value: L.paddingY,
          min: 0,
          max: 4,
          step: 0.05,
          label: '상하',
          hint: hint('테두리 위아래에서 안쪽으로 비우는 여백.', L.paddingY),
        },
      }, { collapsed: true }),
      제목: folder({
        taglineTop: {
          value: L.taglineTop,
          min: 0,
          max: 4,
          step: 0.05,
          label: '위 여백',
          hint: hint('상단 여백에서 tagline을 얼마나 더 내릴지.', L.taglineTop),
        },
        taglineSize: {
          value: L.taglineSize,
          min: 0.1,
          max: 1.5,
          step: 0.01,
          label: '크기',
          hint: hint('tagline(손글씨) 글씨 크기.', L.taglineSize),
        },
      }, { collapsed: true }),
      본문: folder({
        introTop: {
          value: L.introTop,
          min: 0,
          max: 4,
          step: 0.05,
          label: '위 여백',
          hint: hint('tagline 아래로 본문을 얼마나 띄울지.', L.introTop),
        },
        introLeft: {
          value: L.introLeft,
          min: 0,
          max: 4,
          step: 0.05,
          label: '좌 여백',
          hint: hint('좌측 여백에서 본문을 얼마나 더 들일지.', L.introLeft),
        },
        introSize: {
          value: L.introSize,
          min: 0.05,
          max: 1,
          step: 0.01,
          label: '크기',
          hint: hint('본문 글씨 크기.', L.introSize),
        },
        introLineHeight: {
          value: L.introLineHeight,
          min: 1,
          max: 3,
          step: 0.05,
          label: '줄 간격',
          hint: hint('본문 줄 간격 — 글씨 크기의 배수다.', L.introLineHeight),
        },
        quoteBarWidth: {
          value: L.quoteBarWidth,
          min: 0,
          max: 0.5,
          step: 0.01,
          label: '인용 막대 굵기',
          hint: hint('본문 왼쪽 세로 막대의 굵기. 0이면 안 보인다.', L.quoteBarWidth),
        },
        quoteBarGap: {
          value: L.quoteBarGap,
          min: 0,
          max: 1.5,
          step: 0.01,
          label: '인용 막대 간격',
          hint: hint('인용 막대와 본문 사이 간격.', L.quoteBarGap),
        },
      }, { collapsed: true }),
      사진: folder({
        photoBottom: {
          value: L.photoBottom,
          min: 0,
          max: 4,
          step: 0.05,
          label: '아래 여백',
          hint: hint('하단 여백에서 사진을 얼마나 더 올릴지.', L.photoBottom),
        },
        photoHeight: {
          value: L.photoHeight,
          min: 0.5,
          max: 6,
          step: 0.05,
          label: '높이',
          hint: hint('사진 높이. 가로는 사진 비율로 따라간다.', L.photoHeight),
        },
      }, { collapsed: true }),
      '나가기 화살표': folder({
        exitArrowSize: {
          value: L.exitArrowSize,
          min: 0.2,
          max: 3,
          step: 0.05,
          label: '크기',
          hint: hint('화살표 길이. 화살촉은 여기에 비례한다.', L.exitArrowSize),
        },
        exitArrowRight: {
          value: L.exitArrowRight,
          min: 0,
          max: 3,
          step: 0.05,
          label: '우 여백',
          hint: hint('오른쪽 끝에서 얼마나 들일지.', L.exitArrowRight),
        },
        exitArrowBottom: {
          value: L.exitArrowBottom,
          min: 0,
          max: 3,
          step: 0.05,
          label: '아래 여백',
          hint: hint('아래 끝에서 얼마나 올릴지.', L.exitArrowBottom),
        },
        exitArrowColor: {
          value: L.exitArrowColor,
          label: '크레파스 색',
          hint: `크레파스 색.\n기본값: ${L.exitArrowColor}`,
        },
        exitArrowStroke: {
          value: L.exitArrowStroke,
          min: 0.01,
          max: 0.4,
          step: 0.005,
          label: '획 굵기',
          hint: hint('크레파스 획의 굵기(월드 단위).', L.exitArrowStroke),
        },
        exitArrowRoughness: {
          value: L.exitArrowRoughness,
          min: 0,
          max: 1,
          step: 0.05,
          label: '거칠기',
          hint: hint('가장자리가 흩어지는 정도. 클수록 테두리가 너덜해진다.', L.exitArrowRoughness),
        },
        exitArrowOpacity: {
          value: L.exitArrowOpacity,
          min: 0.1,
          max: 1,
          step: 0.05,
          label: '진하기',
          hint: hint('가장 진하게 눌린 곳의 진하기.', L.exitArrowOpacity),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Intro 영역',
    {
      '값 복사(JSON)': button(() => {
        const { area, layout } = useIntroPageStore.getState()
        const json = JSON.stringify({ area, layout }, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() => set({ ...A, ...L, showOutline: false })),
    },
    [set],
  )

  useEffect(() => {
    const { width, height, showOutline, ...layout } = values
    setArea({ width, height })
    setLayout(layout)
    setShowOutline(showOutline)
  }, [values, setArea, setLayout, setShowOutline])

  return null
}
