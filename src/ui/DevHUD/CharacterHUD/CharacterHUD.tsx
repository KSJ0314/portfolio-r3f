import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useCharacterStore } from '../../../state/useCharacterStore'
import { CHARACTER_PLACEMENT } from '../../../scene/Character/Character.constants'

const C = CHARACTER_PLACEMENT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number) {
  return `${description}\n기본값: ${value}`
}

/**
 * 캐릭터를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `Character.constants.ts`의 기본값에 반영해 확정한다.
 */
export function CharacterHUD() {
  const setPlacement = useCharacterStore((s) => s.setPlacement)

  const [values, set] = useControls('캐릭터', () => ({
    몸집: folder(
      {
        height: {
          value: C.height,
          min: 0.3,
          max: 3,
          step: 0.05,
          label: '세로 크기',
          hint: hint('월드 세로 크기. 가로·깊이는 모델 비율에서 나온다.', C.height),
        },
        facing: {
          value: C.facing,
          min: -180,
          max: 180,
          step: 5,
          label: '정면 보정',
          hint: hint('모델 정면을 +z로 맞추는 각. 걷는 쪽과 몸이 어긋나면 돌린다.', C.facing),
        },
      },
      { collapsed: true },
    ),
    걸음: folder(
      {
        turnSeconds: {
          value: C.turnSeconds,
          min: 0,
          max: 1,
          step: 0.01,
          label: '도는 시간',
          hint: hint('진행 방향으로 도는 데 걸리는 시간(초). 0이면 즉시 돈다.', C.turnSeconds),
        },
        walkRate: {
          value: C.walkRate,
          min: 0.2,
          max: 6,
          step: 0.1,
          label: '동작 배속',
          hint: hint('걸음 속도 대비 걷기 동작의 배속. 발이 미끄러지면 올린다.', C.walkRate),
        },
      },
      { collapsed: true },
    ),
    재질: folder(
      {
        brightness: {
          value: C.brightness,
          min: 0,
          max: 4,
          step: 0.05,
          label: '밝기',
          hint: hint('텍스처 색에 곱한다. 색이 잿빛으로 죽으면 올리고, 하얗게 뜨면 내린다.', C.brightness),
        },
      },
      { collapsed: true },
    ),
  }), { collapsed: true })

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '캐릭터',
    {
      '값 복사(JSON)': button(() => {
        const json = JSON.stringify(useCharacterStore.getState().placement, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() => set({ ...C })),
    },
    [set],
  )

  useEffect(() => {
    setPlacement({
      height: values.height,
      facing: values.facing,
      turnSeconds: values.turnSeconds,
      walkRate: values.walkRate,
      brightness: values.brightness,
    })
  }, [
    setPlacement,
    values.height,
    values.facing,
    values.turnSeconds,
    values.walkRate,
    values.brightness,
  ])

  return null
}
