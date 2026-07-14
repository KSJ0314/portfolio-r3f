import { useEffect } from 'react'
import { Leva, button, folder, useControls } from 'leva'
import { DEFAULT_GRID_PAPER_PARAMS } from '../../lib/gridPaper'
import type { GridPaperParams } from '../../lib/gridPaper'
import { useGridPaperStore } from '../../state/useGridPaperStore'

const D = DEFAULT_GRID_PAPER_PARAMS

/** leva는 평평한 값만 다루므로, 떨림 주기 배열을 슬라이더 네 개로 펼쳐서 주고받는다. */
interface FlatParams {
  cells: number
  paperColor: string
  lineColor: string
  lineWidthRatio: number
  lineSoftness: number
  lineOpacityMax: number
  wobbleRatio: number
  wobble0: number
  wobble1: number
  wobble2: number
  wobble3: number
  opacityVariance: number
  pressureVariance: number
  grainStrength: number
}

function flatten(params: GridPaperParams): FlatParams {
  const { wobbleCyclesPerCell, ...rest } = params
  const [wobble0, wobble1, wobble2, wobble3] = wobbleCyclesPerCell
  return { ...rest, wobble0, wobble1, wobble2, wobble3 }
}

function toParams(flat: FlatParams): GridPaperParams {
  const { wobble0, wobble1, wobble2, wobble3, ...rest } = flat
  return { ...rest, wobbleCyclesPerCell: [wobble0, wobble1, wobble2, wobble3] }
}

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. 조절하다 원래 값이 뭐였는지 확인할 수 있어야 한다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 모눈종이 바닥 텍스처를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 값을 바꾸면 바닥 텍스처가 브라우저에서 즉시 다시 구워진다.
 * 마음에 드는 값이 나오면 "값 복사"로 JSON을 얻어 `src/lib/gridPaper/gridPaper.constants.ts`의
 * 기본값에 반영하고 `node scripts/generate-grid-paper.mjs`로 PNG를 다시 구우면 확정된다.
 * (HUD를 건드리기 전에는 구워둔 PNG를 그대로 쓴다.)
 */
export function GridPaperHUD() {
  const setParams = useGridPaperStore((s) => s.setParams)
  const reset = useGridPaperStore((s) => s.reset)

  // 함수 형태로 정의해야 set을 받을 수 있다. 되돌리기 버튼이 패널의 값 자체를 되돌려야 하기 때문이다.
  // (스토어만 되돌리면 패널에 남은 값이 다음 렌더에서 그대로 다시 들어온다.)
  const [values, set] = useControls('모눈종이 바닥', () => ({
    칸: folder({
      cells: {
        value: D.cells,
        min: 4,
        max: 80,
        step: 1,
        label: '칸 수',
        hint: hint(
          '타일 한 장에 들어가는 칸 수. 늘리면 칸이 작아진다. 선 굵기·떨림은 칸 크기에 비례해 함께 따라간다.',
          D.cells,
        ),
      },
    }),
    선: folder({
      lineColor: { value: D.lineColor, label: '선 색', hint: hint('모눈 선의 색.', D.lineColor) },
      lineWidthRatio: {
        value: D.lineWidthRatio,
        min: 0.01,
        max: 0.2,
        step: 0.005,
        label: '굵기',
        hint: hint('선 굵기 — 칸 크기에 대한 비율이다.', D.lineWidthRatio),
      },
      lineSoftness: {
        value: D.lineSoftness,
        min: 0,
        max: 2,
        step: 0.05,
        label: '번짐',
        hint: hint(
          '가장자리가 번지는 정도. 0이면 인쇄된 듯 또렷하고, 키우면 연필처럼 뭉뚱그려진다.',
          D.lineSoftness,
        ),
      },
      lineOpacityMax: {
        value: D.lineOpacityMax,
        min: 0.1,
        max: 1,
        step: 0.01,
        label: '진하기',
        hint: hint('가장 진하게 그어진 구간의 진하기. 1이면 선 색이 그대로 나온다.', D.lineOpacityMax),
      },
    }),
    손그림: folder({
      wobbleRatio: {
        value: D.wobbleRatio,
        min: 0,
        max: 0.25,
        step: 0.005,
        label: '떨림 폭',
        hint: hint(
          '선이 좌우로 흔들리는 폭 — 칸 크기에 대한 비율이다. 0이면 자로 잰 직선이 된다.',
          D.wobbleRatio,
        ),
      },
      wobble0: {
        value: D.wobbleCyclesPerCell[0],
        min: 0,
        max: 2,
        step: 0.01,
        label: '떨림 주기 1',
        hint: hint(
          '칸 하나를 지나는 동안 몇 번 굽이치는지(가장 완만한 흐름).',
          D.wobbleCyclesPerCell[0],
        ),
      },
      wobble1: {
        value: D.wobbleCyclesPerCell[1],
        min: 0,
        max: 2,
        step: 0.01,
        label: '떨림 주기 2',
        hint: hint('칸 하나를 지나는 동안 몇 번 굽이치는지.', D.wobbleCyclesPerCell[1]),
      },
      wobble2: {
        value: D.wobbleCyclesPerCell[2],
        min: 0,
        max: 2,
        step: 0.01,
        label: '떨림 주기 3',
        hint: hint('칸 하나를 지나는 동안 몇 번 굽이치는지.', D.wobbleCyclesPerCell[2]),
      },
      wobble3: {
        value: D.wobbleCyclesPerCell[3],
        min: 0,
        max: 3,
        step: 0.01,
        label: '떨림 주기 4',
        hint: hint(
          '칸 하나를 지나는 동안 몇 번 굽이치는지(가장 잔 떨림).',
          D.wobbleCyclesPerCell[3],
        ),
      },
      opacityVariance: {
        value: D.opacityVariance,
        min: 0,
        max: 0.6,
        step: 0.01,
        label: '농도 변화',
        hint: hint(
          '선을 따라가며 진하기가 오르내리는 폭. 손이 뜨거나 눌린 자국을 만든다.',
          D.opacityVariance,
        ),
      },
      pressureVariance: {
        value: D.pressureVariance,
        min: 0,
        max: 0.8,
        step: 0.01,
        label: '필압',
        hint: hint(
          '선 굵기가 구간마다 변하는 정도. 굵기는 곧 진하기로 읽히므로 농도 변화와 함께 논다.',
          D.pressureVariance,
        ),
      },
    }),
    종이: folder({
      paperColor: {
        value: D.paperColor,
        label: '종이색',
        hint: hint('종이 바탕색.', D.paperColor),
      },
      grainStrength: {
        value: D.grainStrength,
        min: 0,
        max: 0.2,
        step: 0.005,
        label: '종이 결',
        hint: hint('종이 결(얼룩)의 세기. 완전히 균일한 흰 면이 되지 않게 해준다.', D.grainStrength),
      },
    }),
  }))

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '모눈종이 바닥',
    {
      '값 복사(JSON)': button(() => {
        const json = JSON.stringify(useGridPaperStore.getState().params, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() => set(flatten(D))),
    },
    [set],
  )

  // 패널 값이 바뀔 때마다 스토어에 반영한다.
  // 값이 기본값 그대로면 스토어를 되돌린다 — 그래야 손대기 전(과 되돌린 뒤)에는
  // 브라우저에서 굽지 않고 구워둔 PNG를 그대로 쓴다.
  useEffect(() => {
    const params = toParams(values)
    if (JSON.stringify(params) === JSON.stringify(D)) {
      reset()
      return
    }
    setParams(params)
  }, [values, setParams, reset])

  return (
    <Leva
      // 기본 폭(280px)에서는 라벨이 잘려 "..."로 표시된다. 넓혀서 잘림 자체를 줄인다.
      // 그래도 잘리는 라벨은 호버하면 hint 툴팁에 설명이 뜬다.
      theme={{
        sizes: { rootWidth: '360px', controlWidth: '150px' },
        // 툴팁 기본색은 반투명(그래서 뒤의 3D 씬이 비쳐 글씨가 안 읽힌다) → 불투명하게 덮는다.
        colors: { toolTipBackground: '#12131a', toolTipText: '#f2f2f5' },
      }}
      titleBar={{ title: '모눈종이 바닥' }}
    />
  )
}
