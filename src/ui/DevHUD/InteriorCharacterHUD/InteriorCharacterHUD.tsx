import { useEffect } from 'react'
import { button, useControls } from 'leva'
import { useCharacterStore } from '../../../state/useCharacterStore'
import { INTERIOR_CHARACTER } from '../../../stations/sections/projects/interior'

const C = INTERIOR_CHARACTER

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number) {
  return `${description}\n기본값: ${value}`
}

/**
 * 실내 캐릭터를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 로비와 전시 공간이 같은 값을 쓰므로 두 화면이 이 폴더를 함께 쓴다.
 * 정면·도는 시간·동작 배속은 방이 아니라 모델의 성질이라 맵 HUD에 있다.
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `Interior.constants.ts`의 기본값에 반영해 확정한다.
 */
export function InteriorCharacterHUD() {
  const setInterior = useCharacterStore((s) => s.setInterior)

  const [values, set] = useControls(
    '캐릭터',
    () => ({
      height: {
        value: C.height,
        min: 0.2,
        max: 2,
        step: 0.05,
        label: '세로 크기',
        hint: hint('월드 세로 크기. 가로·깊이는 모델 비율에서 나온다.', C.height),
      },
      brightness: {
        value: C.brightness,
        min: 0,
        max: 4,
        step: 0.05,
        label: '밝기',
        hint: hint('텍스처 색에 곱한다. 방보다 어두우면 올리고 하얗게 뜨면 내린다.', C.brightness),
      },
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '캐릭터',
    {
      '값 복사(JSON)': button(() => {
        const json = JSON.stringify(useCharacterStore.getState().interior, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() => set({ ...C })),
    },
    [set],
  )

  useEffect(() => {
    setInterior({ height: values.height, brightness: values.brightness })
  }, [setInterior, values.height, values.brightness])

  return null
}
